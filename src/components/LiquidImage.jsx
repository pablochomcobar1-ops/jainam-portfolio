import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./liquidShaders";

const settings = {
  radius: 0.25, // brush size
  strength: 0.1, // how hard it ripples under the cursor
  followSpeed: 0.08, // how fast the brush chases the cursor (0 to 1)
  fadeSpeed: 0.1, // how fast the brush grows/shrinks on enter/leave
};

export default function LiquidImage({ src, className = "", idle = 0.01 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;
    let frameId, renderer, scene, camera, material, geometry, uniforms;
    let resizeObserver, viewObserver;
    let textures = [];

    const target = new THREE.Vector2(0.5, 0.5); // where the cursor is
    const mouse = new THREE.Vector2(0.5, 0.5); // where the brush is (chases target)
    let targetRadius = 0;
    let isVisible = true;
    let lastX = -1;
    let lastY = -1;

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

    function setup(brush, image) {
      const { clientWidth: w, clientHeight: h } = container;

      uniforms = {
        u_texture: { value: image },
        u_brush: { value: brush },
        u_mouse: { value: mouse },
        u_resolution: { value: new THREE.Vector2(w, h) },
        u_imageAspect: { value: image.image.width / image.image.height },
        u_radius: { value: 0 },
        u_time: { value: 0 },
        u_strength: { value: settings.strength },
        u_idle: { value: idle },
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

      loop();
    }

    function loop() {
      frameId = requestAnimationFrame(loop);
      if (!isVisible) return; // don't waste GPU when off-screen

      mouse.lerp(target, settings.followSpeed);
      uniforms.u_radius.value +=
        (targetRadius - uniforms.u_radius.value) * settings.fadeSpeed;
      uniforms.u_time.value += 0.01;
      renderer.render(scene, camera);
    }

    const loader = new THREE.TextureLoader();
    Promise.all([
      loader.loadAsync("/textures/soft_brush.png"),
      loader.loadAsync(src),
    ])
      .then(([brush, image]) => {
        textures = [brush, image];
        if (cancelled) {
          textures.forEach((t) => t.dispose());
          return;
        }
        setup(brush, image);
      })
      .catch((err) => console.error("LiquidImage: couldn't load images", err));

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
      viewObserver?.disconnect();
      geometry?.dispose();
      material?.dispose();
      textures.forEach((t) => t.dispose());
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [src, idle]);

  return <div ref={containerRef} className={className} />;
}
