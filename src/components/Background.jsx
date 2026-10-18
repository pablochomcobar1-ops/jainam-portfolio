import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./backgroundShader";

export default function Background() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Renderer at half resolution: smoke is soft, so it looks the same and runs ~4x faster
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(0.5);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_energy: { value: 0 },
      u_scroll: { value: 0 },
      u_strikeX: { value: 0.5 },
      u_strikeAge: { value: 1000 }, // "a long time ago" = no lightning yet
      u_strikeSeed: { value: 0 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ---- Mouse position + "energy" (how fast the mouse is moving) ----
    const target = new THREE.Vector2(0.5, 0.5);
    let energy = 0;
    let lastX = null;
    let lastY = null;

    function onPointerMove(e) {
      target.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
      if (lastX !== null) {
        const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        energy = Math.min(energy + speed * 0.004, 1);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }

    // ---- Lightning ----
    let strikeStart = -Infinity;
    let nextAutoStrike = performance.now() + 2500; // first strike 2.5s after load

    function strike(x) {
      uniforms.u_strikeX.value = x;
      uniforms.u_strikeSeed.value = Math.random() * 100; // new seed = new bolt shape
      strikeStart = performance.now();
    }

    function onPointerDown(e) {
      strike(e.clientX / window.innerWidth);
      nextAutoStrike = Math.max(nextAutoStrike, performance.now() + 3000);
    }

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      if (reduceMotion) render(performance.now());
    }

    function render(now) {
      // Automatic strikes every 4–9 seconds at a random spot
      if (!reduceMotion && now > nextAutoStrike) {
        strike(0.15 + Math.random() * 0.7);
        nextAutoStrike = now + 1000 + Math.random() * 2500;
      }

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      uniforms.u_scroll.value = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      uniforms.u_time.value = now / 1000;
      uniforms.u_strikeAge.value = Math.min((now - strikeStart) / 1000, 1000);
      uniforms.u_mouse.value.lerp(target, 0.05);
      energy *= 0.96; // energy slowly fades when the mouse stops
      uniforms.u_energy.value += (energy - uniforms.u_energy.value) * 0.1;
      renderer.render(scene, camera);
    }

    let frameId;
    function loop(now) {
      frameId = requestAnimationFrame(loop);
      render(now);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      render(performance.now()); // one still frame, no lightning, for people who turned off animations
    } else {
      window.addEventListener("pointerdown", onPointerDown);
      frameId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
