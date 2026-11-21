import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Scene3DProps {
  /** Pauses the Three.js frameloop when hero is scrolled out of view */
  isVisible: boolean;
  /** Calls back if WebGL context cannot be created or is lost */
  onContextFallback?: () => void;
}

const PARTICLE_COUNT = 54;

/** Detect software WebGL rasterizers so pixel ratio / shadows stay fast */
function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

/** Procedural studio reflection environment for crisp metallic and glass highlights */
function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const renderTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = renderTarget.texture;

    return () => {
      scene.environment = null;
      renderTarget.dispose();
      roomEnv.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

/** Stylized Build + Exchange hardware cluster: microcontroller PCB, traces, orbiting chips, particles */
function MicrocontrollerCluster() {
  const rootRef = useRef<THREE.Group>(null);
  const orbitRing1Ref = useRef<THREE.Group>(null);
  const orbitRing2Ref = useRef<THREE.Group>(null);
  const orbitRing3Ref = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Build reusable procedural geometries and PBR materials once and dispose cleanly on unmount
  const assets = useMemo(() => {
    // PCB & Microcontroller Geometries
    const pcbGeo = new THREE.BoxGeometry(2.7, 0.14, 1.9);
    const pcbBevelTrimGeo = new THREE.BoxGeometry(2.78, 0.045, 1.98);
    const socBodyGeo = new THREE.BoxGeometry(0.88, 0.16, 0.88);
    const socCapGeo = new THREE.BoxGeometry(0.62, 0.05, 0.62);
    const socCoreGlowGeo = new THREE.BoxGeometry(0.92, 0.04, 0.92);
    const usbPortGeo = new THREE.BoxGeometry(0.36, 0.16, 0.42);
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.24, 8);
    const capacitorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16);
    const traceXGeo = new THREE.BoxGeometry(0.76, 0.02, 0.032);
    const traceZGeo = new THREE.BoxGeometry(0.032, 0.02, 0.56);
    const shieldRingGeo = new THREE.TorusGeometry(1.78, 0.018, 12, 72);
    const exchangeRingGeo = new THREE.TorusGeometry(2.18, 0.012, 10, 84);

    // Orbiting cube / chiplet geometries
    const chipCubeGeo = new THREE.BoxGeometry(0.34, 0.34, 0.34);
    const chipFrameGeo = new THREE.BoxGeometry(0.39, 0.07, 0.39);
    const relayModuleGeo = new THREE.BoxGeometry(0.42, 0.16, 0.3);

    // Floating particles buffer geometry
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color('#3B82F6'),
      new THREE.Color('#22D3EE'),
      new THREE.Color('#8B5CF6'),
      new THREE.Color('#FB923C'),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 * 3.1;
      const radius = 2.0 + ((i * 37) % 100) * 0.018;
      const y = (((i * 53) % 100) / 100 - 0.5) * 2.6;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Materials (MeshPhysicalMaterial & MeshStandardMaterial with calibrated PBR + emissive accents)
    const pcbMat = new THREE.MeshPhysicalMaterial({
      color: '#0B132B',
      roughness: 0.42,
      metalness: 0.28,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
    });

    const trimEdgeMat = new THREE.MeshStandardMaterial({
      color: '#1E293B',
      roughness: 0.35,
      metalness: 0.78,
    });

    const socMat = new THREE.MeshPhysicalMaterial({
      color: '#111827',
      roughness: 0.25,
      metalness: 0.85,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    });

    const brushedMetalMat = new THREE.MeshStandardMaterial({
      color: '#CBD5E1',
      roughness: 0.22,
      metalness: 0.92,
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: '#22D3EE',
      emissive: '#22D3EE',
      emissiveIntensity: 1.55,
      roughness: 0.2,
      metalness: 0.3,
    });

    const blueAccentMat = new THREE.MeshPhysicalMaterial({
      color: '#3B82F6',
      emissive: '#2563EB',
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.45,
      clearcoat: 0.5,
    });

    const violetAccentMat = new THREE.MeshPhysicalMaterial({
      color: '#8B5CF6',
      emissive: '#7C3AED',
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.45,
      clearcoat: 0.5,
    });

    const orangePinMat = new THREE.MeshStandardMaterial({
      color: '#FB923C',
      emissive: '#EA580C',
      emissiveIntensity: 0.7,
      roughness: 0.22,
      metalness: 0.88,
    });

    const orbitRingMat = new THREE.MeshStandardMaterial({
      color: '#3B82F6',
      emissive: '#22D3EE',
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.45,
      roughness: 0.3,
      metalness: 0.6,
    });

    const violetRingMat = new THREE.MeshStandardMaterial({
      color: '#8B5CF6',
      emissive: '#8B5CF6',
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.32,
      roughness: 0.3,
      metalness: 0.5,
    });

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    return {
      geometries: {
        pcbGeo,
        pcbBevelTrimGeo,
        socBodyGeo,
        socCapGeo,
        socCoreGlowGeo,
        usbPortGeo,
        pinGeo,
        capacitorGeo,
        traceXGeo,
        traceZGeo,
        shieldRingGeo,
        exchangeRingGeo,
        chipCubeGeo,
        chipFrameGeo,
        relayModuleGeo,
        particleGeo,
      },
      materials: {
        pcbMat,
        trimEdgeMat,
        socMat,
        brushedMetalMat,
        cyanGlowMat,
        blueAccentMat,
        violetAccentMat,
        orangePinMat,
        orbitRingMat,
        violetRingMat,
        particleMat,
      },
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(assets.geometries).forEach((g) => g.dispose());
      Object.values(assets.materials).forEach((m) => m.dispose());
    };
  }, [assets]);

  const pinOffsets = useMemo(() => {
    const items: number[] = [];
    for (let i = -5; i <= 5; i++) {
      items.push(i * 0.2);
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (rootRef.current) {
      // Gentle sine-wave hover float
      rootRef.current.position.y = Math.sin(t * 1.1) * 0.14;

      // Subtle mouse parallax + slow steady auto-rotation
      const targetRotX = 0.34 + state.pointer.y * -0.22;
      const targetRotY = t * 0.24 + state.pointer.x * 0.35;

      rootRef.current.rotation.x = THREE.MathUtils.damp(
        rootRef.current.rotation.x,
        targetRotX,
        4.5,
        clampedDelta
      );
      rootRef.current.rotation.y = THREE.MathUtils.damp(
        rootRef.current.rotation.y,
        targetRotY,
        4.5,
        clampedDelta
      );
    }

    if (orbitRing1Ref.current) {
      orbitRing1Ref.current.rotation.y = t * 0.65;
      orbitRing1Ref.current.position.y = Math.sin(t * 1.5) * 0.12;
    }

    if (orbitRing2Ref.current) {
      orbitRing2Ref.current.rotation.y = -t * 0.52;
      orbitRing2Ref.current.rotation.z = Math.sin(t * 0.8) * 0.12;
    }

    if (orbitRing3Ref.current) {
      orbitRing3Ref.current.rotation.y = t * 0.42;
      orbitRing3Ref.current.position.y = Math.cos(t * 1.3) * 0.14;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.08;
    }
  });

  const { geometries: g, materials: m } = assets;

  return (
    <group>
      {/* Floating outer ambient particles */}
      <points ref={particlesRef} geometry={g.particleGeo} material={m.particleMat} />

      <group ref={rootRef} rotation={[0.34, -0.45, 0.08]}>
        {/* Main Microcontroller PCB Assembly */}
        <mesh geometry={g.pcbGeo} material={m.pcbMat} />
        <mesh position={[0, -0.045, 0]} geometry={g.pcbBevelTrimGeo} material={m.trimEdgeMat} />

        {/* Central Microcontroller / SoC */}
        <mesh position={[0, 0.14, 0]} geometry={g.socBodyGeo} material={m.socMat} />
        <mesh position={[0, 0.23, 0]} geometry={g.socCapGeo} material={m.brushedMetalMat} />
        <mesh position={[0, 0.085, 0]} geometry={g.socCoreGlowGeo} material={m.cyanGlowMat} />

        {/* USB-C Interface Shield on Board Edge */}
        <mesh position={[-1.24, 0.13, 0]} geometry={g.usbPortGeo} material={m.brushedMetalMat} />

        {/* Solid-State Capacitors */}
        <mesh position={[0.92, 0.17, -0.52]} geometry={g.capacitorGeo} material={m.brushedMetalMat} />
        <mesh position={[0.92, 0.17, -0.22]} geometry={g.capacitorGeo} material={m.blueAccentMat} />
        <mesh position={[-0.86, 0.17, 0.56]} geometry={g.capacitorGeo} material={m.violetAccentMat} />

        {/* Glowing Cyan & Violet Circuit Traces */}
        <mesh position={[0.78, 0.08, 0.18]} geometry={g.traceXGeo} material={m.cyanGlowMat} />
        <mesh position={[0.78, 0.08, 0.34]} geometry={g.traceXGeo} material={m.cyanGlowMat} />
        <mesh position={[-0.78, 0.08, -0.24]} geometry={g.traceXGeo} material={m.violetAccentMat} />
        <mesh position={[0.24, 0.08, 0.62]} geometry={g.traceZGeo} material={m.cyanGlowMat} />
        <mesh position={[-0.24, 0.08, -0.62]} geometry={g.traceZGeo} material={m.blueAccentMat} />

        {/* Dual Gold/Orange GPIO Pin Headers */}
        {pinOffsets.map((xPos, idx) => (
          <group key={idx}>
            <mesh position={[xPos, 0.12, 0.8]} geometry={g.pinGeo} material={m.orangePinMat} />
            <mesh position={[xPos, 0.12, -0.8]} geometry={g.pinGeo} material={m.orangePinMat} />
          </group>
        ))}

        {/* Orbital Exchange Conduit Rings */}
        <mesh rotation={[Math.PI / 2.2, 0.12, 0]} geometry={g.shieldRingGeo} material={m.orbitRingMat} />
        <mesh rotation={[Math.PI / 1.8, -0.25, 0.2]} geometry={g.exchangeRingGeo} material={m.violetRingMat} />

        {/* Orbiting Chiplet 1: Blue Learn Node */}
        <group ref={orbitRing1Ref} rotation={[0.18, 0, 0.1]}>
          <group position={[1.82, 0.32, 0]}>
            <mesh geometry={g.chipCubeGeo} material={m.blueAccentMat} />
            <mesh geometry={g.chipFrameGeo} material={m.cyanGlowMat} />
          </group>
        </group>

        {/* Orbiting Chiplet 2: Violet Project Cube */}
        <group ref={orbitRing2Ref} rotation={[-0.26, 1.4, -0.15]}>
          <group position={[-1.95, 0.45, 0.4]}>
            <mesh geometry={g.chipCubeGeo} material={m.violetAccentMat} />
            <mesh geometry={g.chipFrameGeo} material={m.brushedMetalMat} />
          </group>
        </group>

        {/* Orbiting Chiplet 3: Orange Hardware Exchange Relay */}
        <group ref={orbitRing3Ref} rotation={[0.1, 2.7, 0.24]}>
          <group position={[1.65, -0.35, -0.85]}>
            <mesh geometry={g.relayModuleGeo} material={m.orangePinMat} />
            <mesh position={[0, 0.11, 0]} geometry={g.traceXGeo} scale={[0.35, 1, 1]} material={m.cyanGlowMat} />
          </group>
        </group>
      </group>
    </group>
  );
}

export default function Scene3D({ isVisible, onContextFallback }: Scene3DProps) {
  const [isSoftwareGl] = useState(() => detectSoftwareWebGL());
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      <Canvas
        frameloop={isVisible ? 'always' : 'demand'}
        dpr={isSoftwareGl ? 1 : [1, 2]}
        camera={{ position: [0, 1.35, 5.1], fov: 42 }}
        gl={{
          antialias: !isSoftwareGl,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const canvasEl = gl.domElement;
          const handleLost = (e: Event) => {
            e.preventDefault();
            onContextFallback?.();
          };
          canvasEl.addEventListener('webglcontextlost', handleLost, false);
        }}
        aria-label="Interactive 3D microcontroller hardware and exchange cluster"
      >
        <StudioEnvironment />
        <hemisphereLight args={['#93C5FD', '#070B1A', 0.65]} />
        <directionalLight position={[5, 6, 5]} intensity={1.8} color="#F8FAFC" />
        <pointLight position={[-4, 2, 3]} intensity={3.2} distance={10} color="#3B82F6" />
        <pointLight position={[4, -2, -2]} intensity={2.8} distance={10} color="#8B5CF6" />
        <pointLight position={[0, 3.2, 2.5]} intensity={2.4} distance={9} color="#22D3EE" />

        <MicrocontrollerCluster />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={!isSoftwareGl}
          dampingFactor={0.06}
          rotateSpeed={0.65}
        />
      </Canvas>
    </div>
  );
}
