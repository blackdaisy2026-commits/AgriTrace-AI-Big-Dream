"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AgriBackground() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Performance Check: Disable on small screens or mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = window.innerWidth < 768;

        if (isMobile || isLowEnd) {
            mount.style.background = "linear-gradient(to bottom, #030a05, #0a1a0e)";
            return;
        }

        // ---------- Scene Setup ----------
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Adaptive but capped
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        // ---------- Lights ----------
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const greenLight = new THREE.PointLight(0x22c55e, 1.5, 15);
        greenLight.position.set(-3, 2, 2);
        scene.add(greenLight);

        const blueLight = new THREE.PointLight(0x3b82f6, 1.2, 12);
        blueLight.position.set(4, -2, 2);
        scene.add(blueLight);

        // ---------- Helpers ----------
        const randRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

        // ---------- Blockchain Hex Grid (glowing rings) ----------
        const rings: { mesh: THREE.Mesh; pulseSpeed: number; phase: number }[] = [];
        for (let i = 0; i < 6; i++) { // Reduced count
            const geo = new THREE.TorusGeometry(
                randRange(0.4, 1.2),
                0.012,
                4, // Reduced segments
                8
            );
            const ringColor = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xa855f7][i % 4];
            const mat = new THREE.MeshBasicMaterial({
                color: ringColor,
                transparent: true,
                opacity: 0.25,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(randRange(-8, 8), randRange(-5, 5), randRange(-5, -2));
            mesh.rotation.set(randRange(0, Math.PI), randRange(0, Math.PI), 0);
            scene.add(mesh);
            rings.push({ mesh, pulseSpeed: randRange(0.01, 0.03), phase: randRange(0, Math.PI * 2) });
        }

        // ---------- Ground Wave Plane (EXTREMELY reduced segments for perf) ----------
        const waveGeo = new THREE.PlaneGeometry(32, 32, 8, 8);
        const waveMat = new THREE.MeshBasicMaterial({
            color: 0x16a34a,
            transparent: true,
            opacity: 0.08,
            wireframe: true,
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.rotation.x = -Math.PI / 2.2;
        wave.position.y = -5;
        scene.add(wave);

        // ---------- Animation Loop ----------
        let frameId: number;
        const clock = new THREE.Clock();
        let frameCount = 0;
        let isPageVisible = true;

        const handleVisibilityChange = () => {
            isPageVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Throttle mouse with RAF
        let mouseX = 0, mouseY = 0;
        let rafPending = false;
        const handleMouseMove = (e: MouseEvent) => {
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
                    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
                    rafPending = false;
                });
            }
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        // ---------- Resize ----------
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize, { passive: true });

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (!isPageVisible) return; // Pause when tab is hidden

            frameCount++;

            // Skip every other frame → ~30fps for background
            if (frameCount % 2 !== 0) return;

            const t = clock.getElapsedTime();

            // Camera parallax (smooth but lightweight)
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            // Pulse rings
            rings.forEach((r) => {
                const scale = 1 + Math.sin(t * r.pulseSpeed * 50 + r.phase) * 0.15;
                r.mesh.scale.set(scale, scale, scale);
                (r.mesh.material as THREE.MeshBasicMaterial).opacity =
                    0.15 + Math.sin(t * r.pulseSpeed * 30 + r.phase) * 0.10;
            });

            // Wave animation - only update every 6th frame
            if (frameCount % 6 === 0) {
                const wavePositions = waveGeo.attributes.position;
                for (let i = 0; i < wavePositions.count; i++) {
                    const x = wavePositions.getX(i);
                    const y = wavePositions.getY(i);
                    wavePositions.setZ(i, Math.sin(x * 0.3 + t * 0.8) * 0.3 + Math.cos(y * 0.3 + t * 0.4) * 0.3);
                }
                wavePositions.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(frameId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);

            // Proper disposal to prevent memory leaks
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            renderer.dispose();
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ width: "100vw", height: "100vh" }}
        />
    );
}
