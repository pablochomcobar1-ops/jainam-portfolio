import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./portraitShader";

const settings = {
  radius: 0.2, // how big the hover reveal gets
  followSpeed: 0.12, // how fast the hover reveal chases the cursor
  growSpeed: 0.08, // how fast the hover dots grow/shrink
  revealDuration: 1600, // milliseconds for the full Reveal wave
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function PortraitReveal({
  src,
  className = "",
  dotSize = 7,
  revealed = false,
}) {
  const containerRef = useRef(null);
  const revealedRef = useRef(revealed);

  // Keep the latest value of `revealed` where the animation loop can read it
  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;
    let frameId, renderer, scene, camera, material, geometry, uniforms, texture;
    let resizeObserver, viewObserver;

    const target = new THREE.Vector2(0.5, 0.5);
    const mouse = new THREE.Vector2(0.5, 0.5);
    let targetRadius = 0;
    let isVisible = true;
    let lastX = -1;
    let lastY = -1;

    // Full-reveal wave: tween from `waveFrom` to `waveTo`
    let wave = 0;
    let waveFrom = 0;
    let waveTo = 0;
    let waveStart = 0;

    function checkPointer(x, y) {
      const r = container.getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      if (inside) {
        target.set((x - r.left) / r.width, 1 - (y - r.top) / r.height);
        targetRadius = settings.radius;
      } else {
        targetRadius = 0;
      }
    }

    const onPointerMove = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      checkPointer(lastX, lastY);
    };
    const onScroll = () => checkPointer(lastX, lastY);

    function setup(image) {
      image.generateMipmaps = false;
      image.minFilter = THREE.LinearFilter;

      const { clientWidth: w, clientHeight: h } = container;

      uniforms = {
        u_texture: { value: image },
        u_mouse: { value: mouse },
        u_resolution: { value: new THREE.Vector2(w, h) },
        u_imageAspect: { value: image.image.width / image.image.height },
        u_radius: { value: 0 },
        u_dotSize: { value: dotSize },
        u_full: { value: 0 },
      };

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;

      scene = new THREE.Scene();
      scene.add(mesh);
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.domElement.style.display = "block";
      container.appendChild(renderer.domElement);

      resizeObserver = new ResizeObserver(() => {
        const { clientWidth, clientHeight } = container;
        renderer.setSize(clientWidth, clientHeight);
        uniforms.u_resolution.value.set(clientWidth, clientHeight);
      });
      resizeObserver.observe(container);

      viewObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      });
      viewObserver.observe(container);

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("scroll", onScroll, { passive: true });

      frameId = requestAnimationFrame(loop);
    }

    function loop(now) {
      frameId = requestAnimationFrame(loop);

      // Start a new wave whenever the button flips `revealed`
      const want = revealedRef.current ? 1 : 0;
      if (want !== waveTo) {
        waveFrom = wave;
        waveTo = want;
        waveStart = now;
      }
      const t = Math.min((now - waveStart) / settings.revealDuration, 1);
      wave = waveFrom + (waveTo - waveFrom) * easeInOutCubic(t);

      if (!isVisible) return;

      mouse.lerp(target, settings.followSpeed);
      uniforms.u_radius.value +=
        (targetRadius - uniforms.u_radius.value) * settings.growSpeed;
      uniforms.u_full.value = wave;
      renderer.render(scene, camera);
    }

    new THREE.TextureLoader()
      .loadAsync(src)
      .then((image) => {
        texture = image;
        if (cancelled) {
          image.dispose();
          return;
        }
        setup(image);
      })
      .catch((err) =>
        console.error("PortraitReveal: couldn't load image", err),
      );

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
      viewObserver?.disconnect();
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [src, dotSize]);

  return <div ref={containerRef} className={className} />;
}
