// Cena 3D do Hero (carregada sob demanda): celular de vidro flutuante com a
// interface viva do Openest, orbitado por anéis de conexão, nós de luz e
// pins de localização. Reage ao cursor (amortecido) e ao scroll da página.
//
// Performance: dpr limitado a [1, 2], tela desenhada num canvas 2D (sem DOM
// sincronizado), reflexos com luzes locais (nada baixado de CDN) e render
// pausado quando o Hero sai da tela.
import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { SCREEN_H, SCREEN_W, drawPhoneScreen } from './phoneScreen';

const ROXO = '#6d28d9';
const VIOLETA = '#a855f7';
const CORAL = '#fb7185';
const DOURADO = '#f5b544';
const FUNDO = '#0b0912';

const damp = THREE.MathUtils.damp;

// Textura da tela, redesenhada ~20x por segundo (os checks e o "digitando").
// Criada no effect e ligada ao material pela ref (nada mutável no render).
function usePhoneTexture(materialRef, reduced) {
  const recursos = useRef(null);
  const acumulado = useRef(1);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const desenhar = (t) => {
      drawPhoneScreen(ctx, t);
      tex.needsUpdate = true;
    };
    recursos.current = { desenhar };
    desenhar(1.2);
    if (materialRef.current) {
      materialRef.current.map = tex;
      materialRef.current.needsUpdate = true;
    }
    // Redesenha com a fonte do app quando ela terminar de carregar.
    document.fonts?.ready?.then(() => recursos.current && desenhar(1.2));
    return () => {
      recursos.current = null;
      tex.dispose();
    };
  }, [materialRef]);

  useFrame((state, delta) => {
    if (reduced || !recursos.current) return;
    acumulado.current += delta;
    if (acumulado.current < 0.05) return;
    acumulado.current = 0;
    recursos.current.desenhar(state.clock.elapsedTime);
  });
}

function Phone({ pointer, scroll, reduced }) {
  const grupo = useRef(null);
  const telaMaterial = useRef(null);
  usePhoneTexture(telaMaterial, reduced);

  useFrame((state, delta) => {
    const g = grupo.current;
    if (!g) return;
    const s = scroll.current;
    const p = pointer.current;
    const t = reduced ? 0 : state.clock.elapsedTime;
    g.rotation.y = damp(g.rotation.y, -0.38 + p.x * 0.32 + s * 0.85, 3.5, delta);
    g.rotation.x = damp(g.rotation.x, 0.06 - p.y * 0.16 + s * 0.2, 3.5, delta);
    g.rotation.z = damp(g.rotation.z, 0.05 + p.x * 0.04, 3, delta);
    g.position.y = damp(g.position.y, Math.sin(t * 0.8) * 0.07 - s * 0.9, 4, delta);
  });

  return (
    <group ref={grupo}>
      {/* Corpo em metal escovado escuro */}
      <RoundedBox args={[1.9, 3.92, 0.2]} radius={0.26} smoothness={8}>
        <meshPhysicalMaterial color="#1c1529" metalness={0.9} roughness={0.34} clearcoat={0.6} clearcoatRoughness={0.3} />
      </RoundedBox>
      {/* Aro luminoso sutil */}
      <RoundedBox args={[1.94, 3.96, 0.12]} radius={0.27} smoothness={8} position={[0, 0, -0.02]}>
        <meshStandardMaterial color={ROXO} emissive={VIOLETA} emissiveIntensity={0.35} metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {/* Tela com a interface viva */}
      <mesh position={[0, 0, 0.101]}>
        <planeGeometry args={[1.74, 3.72]} />
        <meshBasicMaterial ref={telaMaterial} color="#ffffff" toneMapped={false} />
      </mesh>
      {/* Vidro frontal: reflexo fosco por cima da tela */}
      <RoundedBox args={[1.8, 3.8, 0.012]} radius={0.2} smoothness={8} position={[0, 0, 0.112]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.08}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.5}
        />
      </RoundedBox>
    </group>
  );
}

// Anel de conexão com nós de luz que percorrem a órbita.
function Ring({ raio, inclinacao, velocidade, cor, nos, reduced }) {
  const grupo = useRef(null);
  useFrame((_, delta) => {
    if (!reduced && grupo.current) grupo.current.rotation.z += delta * velocidade;
  });
  const pontos = useMemo(
    () => Array.from({ length: nos }, (_, i) => (i / nos) * Math.PI * 2),
    [nos],
  );
  return (
    <group rotation={inclinacao}>
      <group ref={grupo}>
        <mesh>
          <torusGeometry args={[raio, 0.01, 16, 180]} />
          <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={1.2} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        </mesh>
        {pontos.map((a) => (
          <mesh key={a} position={[Math.cos(a) * raio, Math.sin(a) * raio, 0]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color="#ffffff" emissive={cor} emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Pin de localização 3D (cabeça + ponta), flutuando.
function Pin({ position, cor, escala = 1, reduced }) {
  const conteudo = (
    <group position={position} scale={escala}>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial color={cor} emissive={cor} emissiveIntensity={0.55} roughness={0.25} metalness={0.2} clearcoat={1} />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.13, 0.36, 32]} />
        <meshPhysicalMaterial color={cor} emissive={cor} emissiveIntensity={0.4} roughness={0.3} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.2, 0.17]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
  if (reduced) return conteudo;
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={0.9}>
      {conteudo}
    </Float>
  );
}

// Pseudoaleatório com semente: a poeira sai igual a cada render (função pura).
function criarPoeira(n = 420, semente = 7) {
  let a = semente;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const r = 4 + rand() * 6;
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(ph) - 3;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return g;
}

// Poeira de luz ao fundo (profundidade).
function Dust({ reduced }) {
  const pontos = useRef(null);
  const geometria = useMemo(() => criarPoeira(), []);
  useEffect(() => () => geometria.dispose(), [geometria]);
  useFrame((_, delta) => {
    if (!reduced && pontos.current) pontos.current.rotation.y += delta * 0.02;
  });
  return (
    <points ref={pontos} geometry={geometria}>
      <pointsMaterial color={VIOLETA} size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

// Afasta a câmera em telas estreitas para os anéis caberem inteiros.
function CameraFit() {
  const camera = useThree((s) => s.camera);
  const aspecto = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const z = aspecto < 0.75 ? 12.5 : aspecto < 1 ? 11 : 9.4;
    camera.position.set(0, 0, z);
    camera.updateProjectionMatrix();
  }, [camera, aspecto]);
  return null;
}

// Todo o conjunto se inclina levemente com o cursor (parallax).
function Rig({ pointer, scroll, children }) {
  const grupo = useRef(null);
  useFrame((_, delta) => {
    const g = grupo.current;
    if (!g) return;
    g.rotation.y = damp(g.rotation.y, pointer.current.x * 0.12, 2.5, delta);
    g.rotation.x = damp(g.rotation.x, -pointer.current.y * 0.08, 2.5, delta);
    g.position.z = damp(g.position.z, -scroll.current * 1.6, 3, delta);
  });
  return <group ref={grupo}>{children}</group>;
}

export default function HeroScene({ pointer, scroll, reduced = false, active = true, onReady }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? (reduced ? 'demand' : 'always') : 'never'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <CameraFit />
      <fog attach="fog" args={[FUNDO, 9, 19]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[-3.2, 2.4, 3]} color={ROXO} intensity={38} distance={14} decay={2} />
      <pointLight position={[3.4, -1.2, 2.6]} color={VIOLETA} intensity={30} distance={14} decay={2} />
      <pointLight position={[2.6, 3, -1]} color={DOURADO} intensity={16} distance={12} decay={2} />
      <pointLight position={[-2.8, -2.6, 1.5]} color={CORAL} intensity={14} distance={12} decay={2} />
      <directionalLight position={[0, 4, 6]} intensity={0.6} />

      {/* Reflexos gerados localmente (sem HDR externo) */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color={VIOLETA} position={[-4, 2, 3]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color={DOURADO} position={[4, -1, 2]} scale={[3, 1.5, 1]} />
        <Lightformer form="ring" intensity={1.2} color={ROXO} position={[0, 3, -4]} scale={4} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 0, 6]} scale={[6, 4, 1]} />
      </Environment>

      <Rig pointer={pointer} scroll={scroll}>
        <Phone pointer={pointer} scroll={scroll} reduced={reduced} />
        <Ring raio={2.55} inclinacao={[1.25, 0.25, 0]} velocidade={0.22} cor={VIOLETA} nos={3} reduced={reduced} />
        <Ring raio={3.15} inclinacao={[1.05, -0.5, 0.3]} velocidade={-0.15} cor={ROXO} nos={4} reduced={reduced} />
        <Ring raio={2.05} inclinacao={[-1.4, 0.9, 0]} velocidade={0.3} cor={CORAL} nos={2} reduced={reduced} />
        <Pin position={[-2.3, 1.35, 0.6]} cor={CORAL} escala={1} reduced={reduced} />
        <Pin position={[2.25, 1.75, -0.4]} cor={DOURADO} escala={0.8} reduced={reduced} />
        <Pin position={[1.95, -1.85, 0.8]} cor={VIOLETA} escala={0.9} reduced={reduced} />
        <Dust reduced={reduced} />
      </Rig>
    </Canvas>
  );
}
