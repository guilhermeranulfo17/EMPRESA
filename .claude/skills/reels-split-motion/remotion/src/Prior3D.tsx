// "Critérios de priorização" (IMG_5184) in 3D. Top panel 1080x960. Times = clip seconds.
import React, { useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, random, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ContactShadows, Environment, Lightformer, PerspectiveCamera, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Background, Box, C, DISPLAY, EASE, Exemplo, Kicker, UI, Words, ramp, sp, useT } from "./kit";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: EASE });
const win = (t: number, a: number, b: number, f = 0.35) => Math.min(ease(t, a - f, a + 0.05), 1 - ease(t, b - 0.05, b + f));

// scene windows
const S = { hook: [0, 4.1], grid: [4.1, 15.5], forgot: [15.5, 18.6], funnel: [18.6, 28.2], five: [28.2, 38.0], cta: [38.0, 60] } as const;

const YEL = new THREE.Color(C.accent), GOLD = new THREE.Color("#FFB800"), WHITE = new THREE.Color("#E9EDF3"), DIM = new THREE.Color("#262C36");

// ---------------------------------------------------------------- materials
const Plastic: React.FC<{ color: THREE.Color | string; emissive?: number; metal?: number; rough?: number; opacity?: number }> = ({ color, emissive = 0, metal = 0.05, rough = 0.35, opacity = 1 }) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={metal} clearcoat={0.8} clearcoatRoughness={0.25} emissive={color as THREE.Color} emissiveIntensity={emissive} transparent={opacity < 1} opacity={opacity} />
);

// ---------------------------------------------------------------- a little person (bonequinho)
const Person: React.FC<{ p: [number, number, number]; s?: number; color: THREE.Color; glow?: number; opacity?: number; bob?: number }> = ({ p, s = 1, color, glow = 0, opacity = 1, bob = 0 }) => (
  <group position={[p[0], p[1] + bob, p[2]]} scale={s}>
    <mesh position={[0, 0.62, 0]} castShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <Plastic color={color} emissive={glow} opacity={opacity} />
    </mesh>
    <mesh position={[0, 0.2, 0]} castShadow>
      <capsuleGeometry args={[0.2, 0.22, 8, 24]} />
      <Plastic color={color} emissive={glow} opacity={opacity} />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- 3D phone
const Phone: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 0, 0.9);
  const ring = Math.sin(t * 38) * 0.06 * (Math.sin(t * 3.2) > 0 ? 1 : 0);
  return (
    <group position={[0, 1.05 + Math.sin(t * 1.6) * 0.08, 0]} rotation={[0.18, -0.75 + k * 0.4 + Math.sin(t * 0.8) * 0.08, ring]} scale={0.45 + 0.3 * k}>
      <RoundedBox args={[2.1, 4.2, 0.22]} radius={0.28} smoothness={6} castShadow>
        <meshPhysicalMaterial color="#14171C" metalness={0.6} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[1.86, 3.95]} />
        <meshStandardMaterial color="#0B0E13" emissive="#1B2330" emissiveIntensity={1} roughness={0.15} />
      </mesh>
      {/* call button glowing */}
      <mesh position={[0, -1.2, 0.13]}>
        <circleGeometry args={[0.36, 48]} />
        <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={1.4 + Math.sin(t * 6) * 0.4} />
      </mesh>
      <mesh position={[0, -1.2, 0.16]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[0.17, 0.05, 12, 32, Math.PI * 1.1]} />
        <meshStandardMaterial color="#14171C" />
      </mesh>
      {/* signal arcs */}
      {[0, 1, 2].map((i) => {
        const ph = (t * 1.2 + i / 3) % 1;
        return (
          <mesh key={i} position={[0, 0.5, 0.14]} scale={0.5 + ph * 0.9}>
            <torusGeometry args={[0.6, 0.035, 12, 48, Math.PI]} />
            <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={2} transparent opacity={(1 - ph) * 0.9} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- the 100 clients grid
const N = 100, GOLDEN = [12, 37, 64, 88];
const gridPos = (i: number): [number, number, number] => [((i % 10) - 4.5) * 0.62, 0, (Math.floor(i / 10) - 4.5) * 0.62];
const lit20 = new Set(Array.from({ length: 20 }, (_, i) => Math.floor(random(`lit${i}`) * 100)));

const Grid: React.FC<{ t: number }> = ({ t }) => {
  // pointer that jumps randomly while "ligar aleatoriamente" (10.2 .. 15.3)
  const jumpIdx = Math.floor((t - 10.2) / 0.42);
  const ptr = t > 10.2 && t < 15.3 ? Math.floor(random(`j${jumpIdx}`) * 100) : -1;
  const ptrNoGold = GOLDEN.includes(ptr) ? (ptr + 1) % 100 : ptr;
  const timeCut = ease(t, 7.8, 8.6); // only 20 fit in your time
  const forgot = ease(t, 16.2, 17.6);
  return (
    <group>
      {Array.from({ length: N }, (_, i) => {
        const appear = ease(t, 4.3 + (i % 10) * 0.05 + Math.floor(i / 10) * 0.09, 4.9 + (i % 10) * 0.05 + Math.floor(i / 10) * 0.09);
        if (appear <= 0) return null;
        const gold = GOLDEN.includes(i);
        const inTime = lit20.has(i) || gold;
        let col = WHITE.clone();
        if (gold) col = GOLD.clone().lerp(new THREE.Color("#596170"), forgot * 0.9);
        else col = col.lerp(inTime ? WHITE : DIM, timeCut);
        const hit = i === ptrNoGold;
        if (hit) col = YEL.clone();
        const bob = hit ? 0.25 : Math.sin(t * 3 + i) * 0.015;
        const [x, , z] = gridPos(i);
        return <Person key={i} p={[x, (1 - appear) * 2.5, z]} s={0.62 * appear * (gold ? 1.35 : 1)} color={col} glow={hit ? 0.9 : gold ? 0.35 * (1 - forgot) : 0} bob={bob} />;
      })}
      {/* pointer ring under the randomly called person */}
      {ptrNoGold >= 0 ? (
        <mesh position={[gridPos(ptrNoGold)[0], 0.02, gridPos(ptrNoGold)[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.34, 40]} />
          <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={2} />
        </mesh>
      ) : null}
      {/* missed opportunities: pulsing rings on the golden ones, fading */}
      {GOLDEN.map((g) => {
        const a = win(t, 15.5, 18.5) * (0.6 + 0.4 * Math.sin(t * 6));
        if (a <= 0.01) return null;
        const [x, , z] = gridPos(g);
        return (
          <mesh key={g} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.38, 0.48, 40]} />
            <meshStandardMaterial color="#FFB800" emissive="#FFB800" emissiveIntensity={1.5} transparent opacity={a * (1 - forgot * 0.8)} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- rolling die (random)
const Die: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 9.8, 10.4) * (1 - ease(t, 15.0, 15.5));
  if (k <= 0.001) return null;
  const roll = (t - 9.8) * 7;
  const pips: [number, number, number][] = [[0, 0, 0.51], [0.25, 0.25, -0.51], [-0.25, -0.25, -0.51], [0.51, 0.25, 0.25], [0.51, -0.25, -0.25], [0.51, 0, 0]];
  return (
    <group position={[2.6, 1.6 + Math.abs(Math.sin(roll * 0.9)) * 0.5, 1.2]} rotation={[roll, roll * 0.7, roll * 0.4]} scale={0.7 * k}>
      <RoundedBox args={[1, 1, 1]} radius={0.16} smoothness={5} castShadow>
        <meshPhysicalMaterial color="#F7F7F2" roughness={0.2} clearcoat={1} />
      </RoundedBox>
      {pips.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <meshStandardMaterial color="#14171C" />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- funnel
const funnelGeo = (() => {
  const pts = [new THREE.Vector2(0.35, -1.4), new THREE.Vector2(0.35, -0.6), new THREE.Vector2(1.9, 1.1), new THREE.Vector2(2.0, 1.25)];
  return new THREE.LatheGeometry(pts, 64);
})();
const Funnel: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 18.7, 19.4);
  return (
    <group position={[0, 1.2, 0]} scale={k}>
      <mesh geometry={funnelGeo} castShadow>
        <meshPhysicalMaterial color="#9FB3D1" roughness={0.12} metalness={0.1} clearcoat={1} transparent opacity={0.38} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.0, 0.06, 16, 80]} />
        <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={1.2} />
      </mesh>
      {/* people raining into the funnel */}
      {Array.from({ length: 26 }, (_, i) => {
        const t0 = 19.4 + i * 0.12, d = (t - t0) / 1.3;
        if (d < 0 || d > 1) return null;
        const gold = i % 8 === 3;
        const ang = random(`f${i}`) * Math.PI * 2, r = 1.5 * (1 - d);
        return <Person key={i} p={[Math.cos(ang) * r, 3.4 - d * 4.2, Math.sin(ang) * r]} s={0.55} color={gold ? GOLD : WHITE} glow={gold ? 0.4 : 0} />;
      })}
    </group>
  );
};
// the few that come out: on a podium with a target
const Chosen: React.FC<{ t: number }> = ({ t }) => {
  const out = [0, 1, 2].map((i) => ease(t, 22.6 + i * 0.35, 23.4 + i * 0.35));
  const tk = ease(t, 24.2, 25.0);
  return (
    <group position={[0, -1.15, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.8, 0.25, 64]} />
        <meshPhysicalMaterial color="#1E2530" roughness={0.3} clearcoat={0.6} />
      </mesh>
      {[0.6, 1.0, 1.4].map((r, i) => (
        <mesh key={i} position={[0, 0.02 + i * 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={tk}>
          <ringGeometry args={[r - 0.12, r, 64]} />
          <meshStandardMaterial color={i % 2 ? "#FFFFFF" : C.accent} emissive={C.accent} emissiveIntensity={i % 2 ? 0.2 : 1.2} />
        </mesh>
      ))}
      {out.map((k, i) => k > 0 ? <Person key={i} p={[(i - 1) * 0.8, (1 - k) * 2.2, 0]} s={0.9 * k} color={GOLD} glow={0.5} /> : null)}
    </group>
  );
};

// ---------------------------------------------------------------- 5 criteria objects
const Target: React.FC = () => (
  <group>
    {[0.62, 0.46, 0.3, 0.13].map((r, i) => (
      <mesh key={i} position={[0, 0, i * 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, 0.1, 48]} />
        <Plastic color={i % 2 ? "#FFFFFF" : C.accent} />
      </mesh>
    ))}
    <mesh position={[0.35, 0.35, 0.45]} rotation={[0.5, 0, Math.PI * 0.75]}>
      <cylinderGeometry args={[0.035, 0.035, 1.1, 12]} />
      <Plastic color="#E9EDF3" metal={0.6} />
    </mesh>
  </group>
);
const Hourglass: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0, 0, Math.sin(t * 1.5) * 0.15]}>
    <mesh position={[0, 0.32, 0]}><coneGeometry args={[0.38, 0.6, 32, 1, true]} /><meshPhysicalMaterial color="#C8D6EA" transparent opacity={0.4} roughness={0.05} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.38, 0.6, 32, 1, true]} /><meshPhysicalMaterial color="#C8D6EA" transparent opacity={0.4} roughness={0.05} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.42, 0]}><coneGeometry args={[0.3, 0.3, 32]} /><Plastic color={C.accent} /></mesh>
    {[0.66, -0.66].map((y, i) => <mesh key={i} position={[0, y, 0]}><cylinderGeometry args={[0.46, 0.46, 0.08, 32]} /><Plastic color="#2B3340" metal={0.4} /></mesh>)}
  </group>
);
const Coins: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {Array.from({ length: 7 }, (_, i) => (
      <mesh key={i} position={[Math.sin(i * 1.7) * 0.03, -0.5 + i * 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 48]} />
        <meshPhysicalMaterial color="#F5C542" metalness={0.95} roughness={0.22} clearcoat={0.6} />
      </mesh>
    ))}
    <mesh position={[0.6, 0.2 + Math.sin(t * 3) * 0.08, 0.2]} rotation={[Math.PI / 2, t * 2, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 0.08, 48]} />
      <meshPhysicalMaterial color="#F5C542" metalness={0.95} roughness={0.2} />
    </mesh>
  </group>
);
const Crown: React.FC = () => (
  <group position={[0, -0.15, 0]}>
    <mesh><cylinderGeometry args={[0.55, 0.5, 0.35, 48, 1, true]} /><meshPhysicalMaterial color="#F5C542" metalness={0.95} roughness={0.2} side={THREE.DoubleSide} /></mesh>
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return (
        <group key={i} position={[Math.cos(a) * 0.5, 0.35, Math.sin(a) * 0.5]}>
          <mesh><coneGeometry args={[0.13, 0.4, 16]} /><meshPhysicalMaterial color="#F5C542" metalness={0.95} roughness={0.2} /></mesh>
          <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.07, 16, 16]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.6} /></mesh>
        </group>
      );
    })}
  </group>
);
const Chart: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <group position={[0, -0.55, 0]}>
    {[0.4, 0.7, 1.1].map((h, i) => {
      const g = ease(t, at + 0.15 + i * 0.12, at + 0.6 + i * 0.12);
      return (
        <mesh key={i} position={[(i - 1) * 0.36, (h * g) / 2, 0]} scale={[1, Math.max(0.001, g), 1]} castShadow>
          <boxGeometry args={[0.26, h, 0.26]} />
          <Plastic color={i === 2 ? C.accent : "#E9EDF3"} />
        </mesh>
      );
    })}
  </group>
);
const FIVE = [
  { label: "NECESSIDADE", at: 31.1 }, { label: "URGÊNCIA", at: 32.2 }, { label: "CAPACIDADE FINANCEIRA", at: 33.1 },
  { label: "PODER DE DECISÃO", at: 34.8 }, { label: "POTENCIAL COMERCIAL", at: 36.3 },
];
const fivePos = (i: number): [number, number, number] => [[-2.3, 0, 2.3, -1.25, 1.25][i], [0.55, 0.55, 0.55, -1.75, -1.75][i], 0];
const Five: React.FC<{ t: number; fps: number; frame: number }> = ({ t, fps, frame }) => {
  const cur = FIVE.filter((f) => t >= f.at).length - 1;
  return (
    <group>
      {FIVE.map((f, i) => {
        const k = sp(frame, fps, f.at, 11, 140);
        if (k <= 0.001) return null;
        const active = i === cur;
        const [x, y, z] = fivePos(i);
        const spin = (1 - Math.min(1, k)) * Math.PI * 2 + Math.sin(t * 1.3 + i) * 0.25;
        return (
          <group key={i} position={[x, y + (active ? Math.sin(t * 3) * 0.06 : 0), z + (active ? 0.4 : 0)]} scale={0.8 * k * (active ? 1.12 : 1)}>
            <mesh position={[0, 0, -0.6]}>
              <circleGeometry args={[0.95, 64]} />
              <meshStandardMaterial color={active ? C.accent : "#1E2530"} emissive={active ? C.accent : "#000000"} emissiveIntensity={active ? 0.35 : 0} transparent opacity={0.9} />
            </mesh>
            <group rotation={[0.2, spin, 0]}>
              {i === 0 ? <Target /> : i === 1 ? <Hourglass t={t} /> : i === 2 ? <Coins t={t} /> : i === 3 ? <Crown /> : <Chart t={t} at={f.at} />}
            </group>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- bookmark (CTA)
const bookmarkShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.7, 1); s.lineTo(0.7, 1); s.lineTo(0.7, -1); s.lineTo(0, -0.45); s.lineTo(-0.7, -1); s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 6 });
})();
const Bookmark: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  const k = sp(frame, fps, 38.3, 10, 150);
  return (
    <group position={[0, 1.0 + Math.sin(t * 2) * 0.1, 0]} rotation={[0.1, Math.sin(t * 1.2) * 0.5 + (1 - k) * 3, 0]} scale={0.85 * Math.max(0, k)}>
      <mesh geometry={bookmarkShape} position={[0, 0, -0.11]} castShadow>
        <meshPhysicalMaterial color={C.accent} metalness={0.3} roughness={0.25} clearcoat={1} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- camera rig
const CAM: [number, [number, number, number], [number, number, number]][] = [
  // time, position, lookAt
  [0, [0, 0.4, 9], [0, 0.3, 0]],
  [4.0, [0, 0.4, 9], [0, 0.3, 0]],
  [4.6, [0, 8.6, 8.2], [0, 0.5, -0.7]],
  [9.6, [0, 8.3, 7.9], [0, 0.5, -0.7]],
  [15.4, [1.5, 7.6, 7.6], [0, 0.4, -0.5]],
  [18.5, [2.0, 6.8, 7.0], [0, 0.4, -0.4]],
  [19.0, [0, 2.4, 12.0], [0, 2.0, 0]],
  [28.0, [0, 2.2, 11.4], [0, 1.9, 0]],
  [28.6, [0, 0.2, 9.6], [0, 0.2, 0]],
  [38.0, [0, 0.2, 9.4], [0, 0.2, 0]],
  [38.5, [0, 0.4, 8.6], [0, 0.4, 0]],
  [60, [0, 0.4, 8.0], [0, 0.4, 0]],
];
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
const camAt = (t: number) => {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, p0, l0] = CAM[i], [t1, p1, l1] = CAM[i + 1];
  const k = interpolate(t, [t0, t1], [0, 1], { ...cl, easing: EASE });
  return { pos: lerp3(p0, p1, k), look: lerp3(l0, l1, k) };
};
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { pos, look } = camAt(t);
  return (
    <PerspectiveCamera
      makeDefault
      fov={38}
      position={pos}
      ref={(c: THREE.PerspectiveCamera | null) => { if (c) { c.position.set(...pos); c.lookAt(...look); c.updateProjectionMatrix(); } }}
    />
  );
};

const World: React.FC = () => {
  const { t, frame, fps } = useT();
  const vis = (k: keyof typeof S) => t >= S[k][0] - 0.5 && t <= S[k][1] + 0.5;
  const fade = (k: keyof typeof S) => win(t, S[k][0], S[k][1], 0.4);
  return (
    <>
      <Rig t={t} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 6]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight position={[-5, 3, 3]} intensity={30} color={C.accent} distance={20} />
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.5} position={[0, 5, -6]} scale={[10, 4, 1]} />
        <Lightformer intensity={1.5} color={C.accent} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer intensity={1.2} position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
      {vis("hook") ? <group visible={fade("hook") > 0.02} scale={Math.max(0.001, fade("hook"))}><Phone t={t} /></group> : null}
      {t > 4.0 && t < 19.2 ? (
        <group position={[0, -0.6, 0]} scale={Math.max(0.001, Math.min(ease(t, 4.0, 4.4), 1 - ease(t, 18.5, 19.1)))}>
          <Grid t={t} />
          <Die t={t} />
        </group>
      ) : null}
      {vis("funnel") ? (
        <group scale={Math.max(0.001, fade("funnel"))}>
          <Funnel t={t} />
          <Chosen t={t} />
        </group>
      ) : null}
      {vis("five") ? <group scale={Math.max(0.001, fade("five"))}><Five t={t} fps={fps} frame={frame} /></group> : null}
      {t > 37.6 ? <Bookmark t={t} frame={frame} fps={fps} /> : null}
      <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={14} blur={2.4} far={4} resolution={512} frames={Infinity} />
    </>
  );
};

// ---------------------------------------------------------------- 2D overlay (titles, counters)
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(interpolate(t, [4.3, 5.8], [0, 100], cl));
  const cut = ease(t, 7.8, 8.4);
  const shown = Math.round(interpolate(cut, [0, 1], [n, 20]));
  if (t < 4.2 || t > 9.7) return null;
  return (
    <div style={{ position: "absolute", left: 64, top: 205, opacity: win(t, 4.2, 9.6, 0.3) }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 120, color: cut > 0.5 ? C.accent : C.white, lineHeight: 1, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>{shown}</div>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 34, color: C.grey2, marginTop: 6 }}>{cut > 0.5 ? "cabem no seu tempo" : "clientes pra ligar"}</div>
    </div>
  );
};
const Battery: React.FC<{ t: number }> = ({ t }) => {
  const a = win(t, 10.2, 15.4, 0.3);
  if (a <= 0) return null;
  const lvl = interpolate(t, [10.4, 15.0], [1, 0.12], cl);
  const col = lvl > 0.5 ? "#7BE07B" : lvl > 0.25 ? C.accent : "#FF5A4E";
  return (
    <div style={{ position: "absolute", right: 64, top: 215, opacity: a, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 190, height: 84, borderRadius: 18, border: "5px solid #E9EDF3", padding: 7, boxSizing: "border-box" }}>
          <div style={{ width: `${lvl * 100}%`, height: "100%", borderRadius: 9, background: col, boxShadow: `0 0 24px ${col}` }} />
        </div>
        <div style={{ width: 12, height: 32, borderRadius: 4, background: "#E9EDF3", marginLeft: 4 }} />
      </div>
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 30, color: C.grey2 }}>sua energia</div>
    </div>
  );
};

const Overlay: React.FC = () => {
  const { t } = useT();
  const show = (a: number, b: number) => t >= a - 0.3 && t <= b + 0.3;
  const op = (a: number, b: number) => win(t, a, b, 0.3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,14,19,0.92) 0px, rgba(11,14,19,0.75) 230px, rgba(11,14,19,0) 360px)", opacity: t > 4.0 && t < 38.0 ? 1 : 0 }} />
      {show(0, 4.1) ? (
        <AbsoluteFill style={{ opacity: op(-1, 4.1) }}>
          <Kicker text="Uma técnica" at={-1} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Words text="MAIS PRODUTIVO" at={-0.5} size={88} />
            <Box text="NA VENDA" at={-0.2} size={86} />
          </div>
        </AbsoluteFill>
      ) : null}
      {show(4.1, 9.6) ? <AbsoluteFill style={{ opacity: op(4.1, 9.6) }}><Kicker text="Imagina" at={4.2} /><Exemplo at={4.4} /><Counter t={t} /></AbsoluteFill> : null}
      {show(9.6, 15.5) ? (
        <AbsoluteFill style={{ opacity: op(9.6, 15.5) }}>
          <Kicker text="Ligar aleatoriamente" at={9.7} />
          <div style={{ position: "absolute", left: 64, top: 215 }}><Words text="NA *SORTE*..." at={9.8} size={76} align="left" width={null} /></div>
          <Battery t={t} />
        </AbsoluteFill>
      ) : null}
      {show(15.5, 18.6) ? (
        <AbsoluteFill style={{ opacity: op(15.5, 18.6) }}>
          <Kicker text="Enquanto isso" at={15.6} />
          <div style={{ position: "absolute", left: 64, top: 215 }}><Words text="GRANDES *OPORTUNIDADES*" at={15.6} size={64} align="left" width={950} /><div style={{ height: 8 }} /><Box text="ESQUECIDAS" at={16.4} size={64} /></div>
        </AbsoluteFill>
      ) : null}
      {show(18.6, 28.2) ? (
        <AbsoluteFill style={{ opacity: op(18.6, 28.2) }}>
          <Kicker text="Por isso" at={18.7} />
          <div style={{ position: "absolute", left: 64, top: 215 }}><Words text="CRITÉRIOS DE *PRIORIZAÇÃO*" at={18.8} size={62} align="left" width={950} /></div>
          {t > 23.0 ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center" }}><Box text="QUEM MERECE SUA ATENÇÃO" at={23.4} size={52} /></div> : null}
        </AbsoluteFill>
      ) : null}
      {show(28.2, 38.0) ? (
        <AbsoluteFill style={{ opacity: op(28.2, 38.0) }}>
          <Kicker text="Os 5 principais" at={28.3} />
          <div style={{ position: "absolute", left: 64, top: 215 }}><Words text="*5* CRITÉRIOS" at={28.4} size={66} align="left" width={null} /></div>
          {FIVE.map((f, i) => {
            const k = ramp(t, f.at + 0.15, f.at + 0.5);
            const cur = FIVE.filter((g) => t >= g.at).length - 1 === i;
            const x = [207, 540, 873, 359, 721][i], y = [585, 585, 585, 912, 912][i];
            return (
              <div key={i} style={{ position: "absolute", left: x - 170, width: 340, top: y - 34, textAlign: "center", opacity: k, translate: `0px ${(1 - k) * 20}px` }}>
                <span style={{ fontFamily: UI, fontWeight: 900, fontSize: f.label.length > 14 ? 24 : 28, letterSpacing: 1, color: cur ? C.ink : C.white, background: cur ? C.accent : "rgba(14,17,22,0.75)", padding: "8px 14px", borderRadius: 10 }}>{i + 1}. {f.label}</span>
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
      {show(38.0, 60) ? (
        <AbsoluteFill style={{ opacity: op(38.0, 99) }}>
          <Kicker text="Guarda isso" at={38.1} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Words text="GRAVA ESSA *REGRA*" at={38.4} size={84} />
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 40, color: C.grey2, opacity: ramp(t, 39.6, 40.0) }}>e usa na sua próxima prospecção</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Prior3D: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts3d"));
  React.useEffect(() => {
    const fonts = [new FontFace(DISPLAY, `url(${staticFile("fonts/ArchivoBlack-Regular.ttf")})`), new FontFace(UI, `url(${staticFile("fonts/Inter.ttf")})`, { weight: "100 900" })];
    Promise.all(fonts.map((f) => f.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      <ThreeCanvas width={1080} height={960} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, alpha: true }} style={{ position: "absolute", inset: 0 }}>
        <World />
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
