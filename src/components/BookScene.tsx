"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/* ============================================================
   BookScene — the interactive hardcover, v2.1 restraint pass.
   A real physical object: front/back boards, spine piece with the
   spine texture, and an inset page block with procedural page
   edges. Studio lighting (warm key / cool rim / soft fill),
   procedural environment for material response, subtle bloom +
   vignette for the product-render finish. No particles — the book
   is the hero and nothing competes with it.

   No external URLs: every texture is local or generated.
   ============================================================ */

function usePagesTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const g = c.getContext("2d");
    if (!g) throw new Error("2d context unavailable");
    g.fillStyle = "#ded7c2";
    g.fillRect(0, 0, 64, 512);
    // page lines: mostly faint, occasional darker leaf
    for (let y = 0; y < 512; y += 2) {
      const dark = (y / 2) % 37 === 0;
      g.fillStyle = dark
        ? "rgba(96,86,64,0.55)"
        : "rgba(120,110,84,0.28)";
      g.fillRect(0, y, 64, 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
}

/* Procedural studio environment: a tiny equirect gradient with a
   warm key blob and a cool rim streak, PMREM'd. Self-contained —
   no HDR files, no network. Gives the cover laminate its sheen. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const g = c.getContext("2d");
    if (!g) return;
    const base = g.createLinearGradient(0, 0, 0, 128);
    base.addColorStop(0, "#0a0f18");
    base.addColorStop(0.55, "#141d2e");
    base.addColorStop(1, "#05070c");
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 128);
    const warm = g.createRadialGradient(70, 80, 4, 70, 80, 62);
    warm.addColorStop(0, "rgba(255,205,140,0.9)");
    warm.addColorStop(1, "rgba(255,205,140,0)");
    g.fillStyle = warm;
    g.fillRect(0, 0, 256, 128);
    const cool = g.createRadialGradient(202, 28, 4, 202, 28, 58);
    cool.addColorStop(0, "rgba(140,180,230,0.75)");
    cool.addColorStop(1, "rgba(140,180,230,0)");
    g.fillStyle = cool;
    g.fillRect(0, 0, 256, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromEquirectangular(tex).texture;
    // `scene` is the live three.js scene object handed to this component by
    // react-three-fiber; assigning its environment is the idiomatic three.js
    // pattern and the only way to apply the generated PMREM. The hook-immutability
    // rule exists for React state, which this is not.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    return () => {
      scene.environment = null;
      env.dispose();
      tex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function prep(t: THREE.Texture) {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Book() {
  const group = useRef<THREE.Group>(null);
  const frontTex = prep(useTexture("/images/book-front.png"));
  const backTex = prep(useTexture("/images/book-back.png"));
  const spineTex = prep(useTexture("/images/book-spine.png"));
  const pagesTex = usePagesTexture();

  const mats = useMemo(() => {
    const board = (map: THREE.Texture | null) =>
      new THREE.MeshPhysicalMaterial({
        map: map ?? undefined,
        color: map ? "#ffffff" : "#141b29",
        roughness: 0.42,
        metalness: 0.0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.55,
      });
    const navyEdge = new THREE.MeshPhysicalMaterial({
      color: "#141b29",
      roughness: 0.5,
      clearcoat: 0.3,
      clearcoatRoughness: 0.6,
    });
    const pages = new THREE.MeshStandardMaterial({
      map: pagesTex,
      roughness: 0.92,
      metalness: 0.0,
    });
    return { board, navyEdge, pages };
  }, [pagesTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.55) * 0.08;
      group.current.rotation.z = Math.sin(t * 0.32) * 0.02;
    }
  });

  /* Dimensions (6x9 hardcover, genuine thickness):
     boards 2.00 x 3.00 x 0.045 · page block 1.92 x 2.92 x 0.27
     (inset, shifted toward the fore-edge) · spine 0.12 x 3.00 x 0.36 */
  return (
    <group ref={group}>
      {/* page block — page texture on every face */}
      <mesh material={mats.pages} position={[0.04, 0, 0]}>
        <boxGeometry args={[1.92, 2.92, 0.27]} />
      </mesh>
      {/* front board — cover art on +z */}
      <mesh
        material={[
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.board(frontTex),
          mats.navyEdge,
        ]}
        position={[0, 0, 0.1575]}
      >
        <boxGeometry args={[2.0, 3.0, 0.045]} />
      </mesh>
      {/* back board — cover art on -z */}
      <mesh
        material={[
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.board(backTex),
        ]}
        position={[0, 0, -0.1575]}
      >
        <boxGeometry args={[2.0, 3.0, 0.045]} />
      </mesh>
      {/* spine — spine art on the outer (-x) face */}
      <mesh
        material={[
          mats.navyEdge,
          mats.board(spineTex),
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
          mats.navyEdge,
        ]}
        position={[-1.0, 0, 0]}
      >
        <boxGeometry args={[0.12, 3.0, 0.36]} />
      </mesh>
    </group>
  );
}

export default function BookScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [-1.75, 0.55, 5.35], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <StudioEnvironment />
      {/* studio lighting: warm key, cool rim, soft frontal fill */}
      <ambientLight intensity={0.22} />
      <directionalLight position={[4.5, 5, 6]} intensity={2.4} color="#ffdfb2" />
      <directionalLight position={[-6, 2.5, -4.5]} intensity={1.35} color="#8fb4e0" />
      <directionalLight position={[0.5, 0.5, 8]} intensity={0.32} color="#ffffff" />
      <Book />
      <ContactShadows
        position={[0, -2.0, 0]}
        opacity={0.62}
        scale={9}
        blur={2.6}
        far={3.5}
        color="#000000"
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.4}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
        minAzimuthAngle={-1.35}
        maxAzimuthAngle={1.0}
      />
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.72}
          luminanceSmoothing={0.18}
          intensity={0.32}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.48} />
      </EffectComposer>
    </Canvas>
  );
}
