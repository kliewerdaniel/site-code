"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useTexture } from "@react-three/drei";

/* ============================================================
   BookScene — the interactive hardcover.
   Real cover textures (front/spine/back rendered from the print
   PDF), procedural page-edge texture, particle field behind.
   No external URLs: every texture is local or generated.
   ============================================================ */

function usePagesTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d");
    if (!g) throw new Error("2d context unavailable");
    g.fillStyle = "#e8e2d2";
    g.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 2) {
      g.fillStyle =
        y % 4 === 0 ? "rgba(110,100,78,0.6)" : "rgba(255,255,255,0.05)";
      g.fillRect(0, y, 64, 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

function Book() {
  const group = useRef<THREE.Group>(null);
  const front = useTexture("/images/book-front.png");
  const back = useTexture("/images/book-back.png");
  const spine = useTexture("/images/book-spine.png");
  const pages = usePagesTexture();

  const materials = useMemo(() => {
    for (const t of [front, back, spine]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
    const std = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.55,
        metalness: 0.04,
      });
    // Box material order: +x (page edges), -x (spine), +y, -y (page edges),
    // +z (front cover), -z (back cover)
    return [std(pages), std(spine), std(pages), std(pages), std(front), std(back)];
  }, [front, back, spine, pages]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.7) * 0.12;
      group.current.rotation.z = Math.sin(t * 0.4) * 0.03;
    }
  });

  return (
    <group ref={group}>
      <mesh material={materials}>
        {/* 6x9 hardcover ratio, 0.36 units thick */}
        <boxGeometry args={[2.0, 3.0, 0.36]} />
      </mesh>
    </group>
  );
}

/* Particle positions are random by design. Generating them in a
   useState lazy initializer keeps render pure and runs exactly once. */
function buildParticleField(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  // Gold and steel-blue particle palette, matching the shader background.
  const palette: Array<[number, number, number]> = [
    [0.851, 0.651, 0.282], // gold #d9a648
    [0.357, 0.482, 0.639], // steel blue #5b7ba3
  ];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = -2.5 - Math.random() * 6;
    const c = palette[Math.random() < 0.35 ? 0 : 1];
    colors[i * 3] = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }
  return { positions, colors };
}

function ParticleField({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [{ positions, colors }] = useState(() => buildParticleField(count));

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.014;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function BookScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 5.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 6]} intensity={1.7} color="#fff3df" />
      <directionalLight position={[-5, -2, 3]} intensity={0.55} color="#5b7ba3" />
      <ParticleField />
      <Book />
      <ContactShadows
        position={[0, -1.95, 0]}
        opacity={0.55}
        scale={9}
        blur={2.4}
        far={3.5}
        color="#000000"
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
        minPolarAngle={Math.PI / 2 - 0.55}
        maxPolarAngle={Math.PI / 2 + 0.55}
        minAzimuthAngle={-1.15}
        maxAzimuthAngle={1.15}
      />
    </Canvas>
  );
}
