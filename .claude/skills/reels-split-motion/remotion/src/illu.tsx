// Illustration kit: characters, objects and helpers for explanatory motion (flat, rounded, soft shadows).
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, EASE, UI, sp, useT } from "./kit";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ez = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...cl, easing: EASE });
export const win = (t: number, a: number, b: number, f = 0.3) => Math.min(ez(t, a - f, a + 0.05), 1 - ez(t, b - 0.05, b + f));

// ---------------------------------------------------------------- placement wrapper: pops in with spring at `at`
export const Pop: React.FC<{ at: number; x: number; y: number; s?: number; rot?: number; children: React.ReactNode; from?: "up" | "down" | "left" | "right" | "scale"; out?: number; z?: number }> = ({ at, x, y, s = 1, rot = 0, children, from = "scale", out, z }) => {
  const { frame, fps, t } = useT();
  const k = sp(frame, fps, at, 12, 170);
  if (k <= 0.001) return null;
  const o = out != null ? 1 - ez(t, out - 0.05, out + 0.3) : 1;
  if (o <= 0) return null;
  const off = 140 * (1 - Math.min(1, k));
  const tr = from === "up" ? [0, -off] : from === "down" ? [0, off] : from === "left" ? [-off, 0] : from === "right" ? [off, 0] : [0, 0];
  const sc = from === "scale" ? k : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: `calc(-50% + ${tr[0]}px) calc(-50% + ${tr[1]}px)`, scale: String(s * sc), rotate: `${rot}deg`, opacity: Math.min(1, k * 1.5) * o, zIndex: z }}>
      {children}
    </div>
  );
};

const SH = "drop-shadow(0 18px 24px rgba(0,0,0,0.45))";

// ---------------------------------------------------------------- person (bonequinho)
export type Pose = "idle" | "wave" | "point" | "think" | "arms" | "cheer" | "give" | "sad";
export const Person: React.FC<{ w?: number; shirt?: string; skin?: string; pose?: Pose; face?: "happy" | "neutral" | "sad" | "wow"; flip?: boolean; bob?: number; tie?: boolean; hold?: React.ReactNode; dim?: boolean }> = ({ w = 160, shirt = "#4A6FA5", skin = "#8D5A3B", pose = "idle", face = "happy", flip, bob = 0, tie, hold, dim }) => {
  const { t } = useT();
  const sway = Math.sin(t * 2.2 + bob) * 3;
  const arm = (side: 1 | -1) => {
    // returns [shoulder->elbow angle, elbow->hand angle] in degrees (0 = down)
    const wave = Math.sin(t * 9) * 25;
    const map: Record<Pose, [number, number][]> = {
      idle: [[12, 5], [12, 5]], wave: [[12, 5], [160, 150 + wave]], point: [[12, 5], [95, 90]], think: [[12, 5], [150, 210]],
      arms: [[40, 120], [40, 120]], cheer: [[150, 170 + wave / 2], [150, 170 - wave / 2]], give: [[12, 5], [75, 70]], sad: [[5, 0], [5, 0]],
    };
    return map[pose][side === 1 ? 1 : 0];
  };
  const limb = (x: number, y: number, a1: number, a2: number, side: number) => {
    const r = (d: number) => (d * Math.PI) / 180;
    const ex = x + Math.sin(r(a1)) * 26 * side, ey = y + Math.cos(r(a1)) * 26;
    const hx = ex + Math.sin(r(a2)) * 24 * side, hy = ey + Math.cos(r(a2)) * 24;
    return { d: `M${x} ${y} L${ex} ${ey} L${hx} ${hy}`, hx, hy };
  };
  const L = limb(34, 78, ...(arm(-1) as [number, number]), -1);
  const R = limb(66, 78, ...(arm(1) as [number, number]), 1);
  const col = dim ? "#4A5260" : shirt, sk = dim ? "#6A707A" : skin;
  return (
    <div style={{ width: w, height: w * 1.6, filter: SH, scale: flip ? "-1 1" : undefined, rotate: `${sway * 0.3}deg`, transformOrigin: "50% 100%" }}>
      <svg viewBox="0 0 100 160" width="100%" height="100%" overflow="visible">
        {/* legs */}
        <path d="M42 118 L40 152 M58 118 L60 152" stroke="#1E2530" strokeWidth={13} strokeLinecap="round" />
        {/* arms */}
        <path d={L.d} stroke={col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={R.d} stroke={col} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={L.hx} cy={L.hy} r={6.5} fill={sk} />
        <circle cx={R.hx} cy={R.hy} r={6.5} fill={sk} />
        {/* torso */}
        <rect x={28} y={66} width={44} height={58} rx={18} fill={col} />
        {tie ? <path d="M50 70 L45 80 L50 104 L55 80 Z" fill={C.ink} /> : null}
        {/* head */}
        <circle cx={50} cy={40} r={24} fill={sk} />
        <path d="M27 36 Q30 14 50 14 Q70 14 73 36 Q66 24 50 24 Q34 24 27 36 Z" fill="#14171C" />
        {/* face */}
        <circle cx={42} cy={42} r={3} fill="#14171C" />
        <circle cx={58} cy={42} r={3} fill="#14171C" />
        {face === "happy" ? <path d="M41 51 Q50 59 59 51" stroke="#14171C" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
        {face === "neutral" ? <path d="M43 53 L57 53" stroke="#14171C" strokeWidth={3} strokeLinecap="round" /> : null}
        {face === "sad" ? <path d="M42 56 Q50 49 58 56" stroke="#14171C" strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
        {face === "wow" ? <circle cx={50} cy={54} r={4} fill="#14171C" /> : null}
      </svg>
      {hold ? <div style={{ position: "absolute", left: `${R.hx}%`, top: `${(R.hy / 160) * 100}%`, translate: "-50% -60%" }}>{hold}</div> : null}
    </div>
  );
};

// ---------------------------------------------------------------- bubbles
export const Bubble: React.FC<{ children: React.ReactNode; w?: number; tail?: "left" | "right" | "none"; hot?: boolean; think?: boolean }> = ({ children, w, tail = "left", hot, think }) => (
  <div style={{ position: "relative", minWidth: 80, width: w, padding: "18px 26px", borderRadius: 34, background: hot ? C.accent : "#FFFFFF", color: C.ink, fontFamily: UI, fontWeight: 800, fontSize: 36, textAlign: "center", filter: SH }}>
    {children}
    {tail !== "none" && !think ? <div style={{ position: "absolute", bottom: -18, [tail]: 40, width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `22px solid ${hot ? C.accent : "#FFFFFF"}` } as React.CSSProperties} /> : null}
    {think ? <><div style={{ position: "absolute", bottom: -26, left: 34, width: 22, height: 22, borderRadius: 11, background: "#FFF" }} /><div style={{ position: "absolute", bottom: -46, left: 22, width: 12, height: 12, borderRadius: 6, background: "#FFF" }} /></> : null}
  </div>
);

// ---------------------------------------------------------------- icon tile (rounded square with svg)
export const Tile: React.FC<{ size?: number; hot?: boolean; children: React.ReactNode; label?: string; glow?: boolean }> = ({ size = 150, hot, children, label, glow }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: hot ? `linear-gradient(145deg, ${C.accent}, #E5B800)` : "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 24px 50px rgba(0,0,0,0.45)${glow ? ", 0 0 50px rgba(255,214,10,0.55)" : ""}` }}>
      {children}
    </div>
    {label ? <div style={{ fontFamily: UI, fontWeight: 900, fontSize: 28, color: hot ? C.accent : "#FFFFFF", letterSpacing: 1, textAlign: "center", maxWidth: size * 1.6, textShadow: "0 4px 14px rgba(0,0,0,0.6)" }}>{label}</div> : null}
  </div>
);

// ---------------------------------------------------------------- objects (svg, sized by `s`)
type O = { s?: number; c?: string };
const svg = (s: number, vb: string, body: React.ReactNode, ratio = 1) => (
  <svg viewBox={vb} width={s} height={s * ratio} overflow="visible" style={{ filter: SH }}>{body}</svg>
);
export const Coin: React.FC<O & { label?: string }> = ({ s = 90, label = "$" }) => svg(s, "0 0 100 100", <>
  <circle cx={50} cy={54} r={42} fill="#C9961A" /><circle cx={50} cy={48} r={42} fill="#F5C542" /><circle cx={50} cy={48} r={32} fill="none" stroke="#E0AE24" strokeWidth={5} />
  <text x={50} y={62} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} fill="#A77B0F">{label}</text></>);
export const Coins: React.FC<O & { n?: number }> = ({ s = 120, n = 5 }) => svg(s, "0 0 100 120", <>
  {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(0 ${100 - i * 14})`}><ellipse cx={50} cy={6} rx={40} ry={12} fill="#C9961A" /><rect x={10} y={-6} width={80} height={12} fill="#C9961A" /><ellipse cx={50} cy={-6} rx={40} ry={12} fill="#F5C542" /></g>)}</>, 1.2);
export const Bill: React.FC<O> = ({ s = 130 }) => svg(s, "0 0 140 70", <>
  <rect x={0} y={0} width={140} height={70} rx={10} fill="#5FBF7A" /><rect x={8} y={8} width={124} height={54} rx={7} fill="none" stroke="#3E9A58" strokeWidth={4} /><circle cx={70} cy={35} r={16} fill="#3E9A58" /><text x={70} y={44} textAnchor="middle" fontFamily={DISPLAY} fontSize={24} fill="#BFF0CC">$</text></>, 0.5);
export const Package: React.FC<O & { label?: string }> = ({ s = 130, label }) => svg(s, "0 0 120 110", <>
  <path d="M60 8 L112 30 L112 88 L60 108 L8 88 L8 30 Z" fill="#C88A4E" /><path d="M60 8 L112 30 L60 52 L8 30 Z" fill="#E0A86A" /><path d="M60 52 L60 108" stroke="#A86F38" strokeWidth={3} />
  <path d="M34 19 L86 41 L86 58" stroke="#F3D9A8" strokeWidth={8} fill="none" />{label ? <text x={84} y={86} textAnchor="middle" fontFamily={UI} fontWeight={900} fontSize={16} fill="#5A3A18">{label}</text> : null}</>, 110 / 120);
export const Phone: React.FC<O & { screen?: React.ReactNode; ring?: boolean }> = ({ s = 150, screen, ring }) => {
  const { t } = useT();
  const r = ring ? Math.sin(t * 40) * 6 * (Math.sin(t * 3) > 0 ? 1 : 0) : 0;
  return (
    <div style={{ width: s, height: s * 1.9, rotate: `${r}deg`, filter: SH }}>
      <div style={{ width: "100%", height: "100%", borderRadius: s * 0.18, background: "linear-gradient(160deg,#2A313D,#0E1116)", padding: s * 0.06, boxSizing: "border-box" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: s * 0.13, background: "linear-gradient(170deg,#1B2330,#0B0E13)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>{screen}</div>
      </div>
    </div>
  );
};
export const Building: React.FC<O & { label?: string }> = ({ s = 170, c = "#5E7392" }) => svg(s, "0 0 100 130", <>
  <rect x={12} y={10} width={76} height={120} rx={6} fill={c} /><rect x={12} y={10} width={76} height={12} rx={6} fill="#7F95B5" />
  {Array.from({ length: 12 }, (_, i) => <rect key={i} x={22 + (i % 3) * 21} y={30 + Math.floor(i / 3) * 22} width={14} height={14} rx={2} fill={i % 4 === 1 ? C.accent : "#C9D6EA"} />)}
  <rect x={40} y={112} width={20} height={18} rx={2} fill="#2B3340" /></>, 1.3);
export const Factory: React.FC<O & { t?: number }> = ({ s = 200 }) => {
  const { t } = useT();
  return svg(s, "0 0 160 120", <>
    {[0, 1, 2].map((i) => { const p = ((t * 0.6 + i / 3) % 1); return <circle key={i} cx={124 + p * 10} cy={20 - p * 30} r={8 + p * 10} fill="#9AA5B5" opacity={0.7 * (1 - p)} />; })}
    <rect x={116} y={20} width={16} height={60} fill="#7C8798" /><path d="M8 120 L8 60 L48 40 L48 60 L88 40 L88 60 L128 40 L128 120 Z" fill="#5E7392" />
    {[0, 1, 2].map((i) => <rect key={i} x={18 + i * 40} y={78} width={22} height={18} rx={2} fill={C.accent} />)}<rect x={0} y={112} width={160} height={8} fill="#2B3340" /></>, 0.75);
};
export const Store: React.FC<O> = ({ s = 200 }) => svg(s, "0 0 160 130", <>
  <rect x={14} y={50} width={132} height={80} fill="#E9EDF3" /><path d="M6 50 L18 18 L142 18 L154 50 Z" fill="#E5484D" />
  {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${18 + i * 25} 18 L${30 + i * 25} 18 L${30 + i * 25} 50 L${18 + i * 25} 50 Z`} fill="#FFFFFF" opacity={i % 2 ? 0 : 0.9} />)}
  <rect x={28} y={66} width={50} height={40} rx={4} fill="#9FB3D1" /><rect x={92} y={66} width={38} height={64} rx={3} fill="#5E7392" /></>, 130 / 160);
export const Clock: React.FC<O> = ({ s = 120 }) => {
  const { t } = useT();
  return svg(s, "0 0 100 100", <>
    <circle cx={50} cy={50} r={44} fill="#FFFFFF" /><circle cx={50} cy={50} r={44} fill="none" stroke="#2B3340" strokeWidth={7} />
    <line x1={50} y1={50} x2={50 + Math.sin(t * 4) * 30} y2={50 - Math.cos(t * 4) * 30} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={50} y1={50} x2={50 + Math.sin(t * 0.4) * 20} y2={50 - Math.cos(t * 0.4) * 20} stroke="#E5484D" strokeWidth={6} strokeLinecap="round" /><circle cx={50} cy={50} r={5} fill={C.ink} /></>);
};
export const Heart: React.FC<O> = ({ s = 110, c = "#FF5A6E" }) => svg(s, "0 0 100 90", <path d="M50 86 C10 58 0 38 12 20 C24 4 44 8 50 22 C56 8 76 4 88 20 C100 38 90 58 50 86 Z" fill={c} />, 0.9);
export const Shield: React.FC<O> = ({ s = 110 }) => svg(s, "0 0 100 115", <><path d="M50 4 L92 18 L88 64 Q80 96 50 110 Q20 96 12 64 L8 18 Z" fill="#4D8DF0" /><path d="M32 56 L46 70 L70 42" stroke="#FFF" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>, 1.15);
export const Crown: React.FC<O> = ({ s = 130 }) => svg(s, "0 0 120 90", <><path d="M10 80 L6 22 L36 46 L60 10 L84 46 L114 22 L110 80 Z" fill="#F5C542" /><rect x={10} y={72} width={100} height={14} rx={4} fill="#C9961A" />{[6, 60, 114].map((x, i) => <circle key={i} cx={x} cy={[22, 10, 22][i]} r={7} fill="#FF5A6E" />)}</>, 0.75);
export const Star: React.FC<O> = ({ s = 100, c = C.accent }) => svg(s, "0 0 100 100", <path d="M50 4 L62 36 L96 38 L70 60 L79 94 L50 76 L21 94 L30 60 L4 38 L38 36 Z" fill={c} />);
export const Bulb: React.FC<O & { on?: boolean }> = ({ s = 110, on = true }) => svg(s, "0 0 100 130", <>{on ? <circle cx={50} cy={46} r={50} fill="rgba(255,214,10,0.25)" /> : null}<path d="M50 6 C24 6 12 26 12 44 C12 62 30 72 32 92 L68 92 C70 72 88 62 88 44 C88 26 76 6 50 6 Z" fill={on ? C.accent : "#9AA5B5"} /><rect x={32} y={96} width={36} height={10} rx={4} fill="#7C8798" /><rect x={36} y={108} width={28} height={10} rx={4} fill="#7C8798" /></>, 1.3);
export const Puzzle: React.FC<O> = ({ s = 110, c = C.accent }) => svg(s, "0 0 100 100", <path d="M10 30 L36 30 C32 16 42 8 50 8 C58 8 68 16 64 30 L90 30 L90 56 C78 52 70 60 70 68 C70 76 78 84 90 80 L90 92 L10 92 Z" fill={c} />);
export const Megaphone: React.FC<O> = ({ s = 130 }) => svg(s, "0 0 120 90", <><path d="M14 34 L60 14 L60 76 L14 56 Z" fill="#E5484D" /><rect x={4} y={32} width={14} height={26} rx={4} fill="#B83236" /><path d="M60 14 L100 0 L100 90 L60 76 Z" fill="#FF6B70" /><rect x={22} y={56} width={12} height={26} rx={4} fill="#2B3340" /></>, 0.75);
export const Chart: React.FC<O & { at?: number }> = ({ s = 130, at = -10 }) => {
  const { t } = useT();
  const g = (i: number) => ez(t, at + i * 0.12, at + 0.5 + i * 0.12);
  return svg(s, "0 0 100 90", <><rect x={0} y={84} width={100} height={6} rx={3} fill="#C9CED6" />{[30, 50, 76].map((h, i) => <rect key={i} x={10 + i * 30} y={84 - h * g(i)} width={22} height={h * g(i)} rx={4} fill={i === 2 ? C.accent : "#E9EDF3"} />)}<path d={`M10 60 L40 44 L70 22 L92 8`} stroke="#5FBF7A" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={120} strokeDashoffset={120 * (1 - g(3))} /></>, 0.9);
};
export const Clipboard: React.FC<O> = ({ s = 110 }) => svg(s, "0 0 90 115", <><rect x={4} y={10} width={82} height={102} rx={10} fill="#C88A4E" /><rect x={12} y={20} width={66} height={86} rx={5} fill="#FFFFFF" /><rect x={28} y={4} width={34} height={14} rx={5} fill="#7C8798" />{[0, 1, 2].map((i) => <g key={i}><path d={`M20 ${42 + i * 22} l5 5 l9 -10`} stroke="#5FBF7A" strokeWidth={4} fill="none" /><rect x={40} y={38 + i * 22} width={30} height={6} rx={3} fill="#C9CED6" /></g>)}</>, 115 / 90);
export const Magnifier: React.FC<O> = ({ s = 110 }) => svg(s, "0 0 100 100", <><circle cx={42} cy={42} r={30} fill="rgba(159,179,209,0.35)" stroke="#E9EDF3" strokeWidth={9} /><path d="M64 64 L92 92" stroke="#E9EDF3" strokeWidth={13} strokeLinecap="round" /></>);
export const Gem: React.FC<O> = ({ s = 110 }) => svg(s, "0 0 100 90", <><path d="M20 6 L80 6 L98 32 L50 88 L2 32 Z" fill="#5FD4F5" /><path d="M2 32 L98 32 L50 88 Z" fill="#2FA8D0" /><path d="M20 6 L36 32 L50 6 L64 32 L80 6" stroke="#BFF0FF" strokeWidth={3} fill="none" /></>, 0.9);
export const Compass: React.FC<O> = ({ s = 110 }) => { const { t } = useT(); return svg(s, "0 0 100 100", <><circle cx={50} cy={50} r={44} fill="#E9EDF3" /><circle cx={50} cy={50} r={36} fill="#1E2530" /><g transform={`rotate(${Math.sin(t * 2) * 25 + 30} 50 50)`}><path d="M50 18 L58 50 L50 82 L42 50 Z" fill="#E9EDF3" /><path d="M50 18 L58 50 L42 50 Z" fill="#E5484D" /></g></>); };
export const Book: React.FC<O & { label?: string }> = ({ s = 120, label }) => svg(s, "0 0 110 90", <><path d="M55 14 C40 4 18 4 4 10 L4 84 C18 78 40 78 55 88 Z" fill="#E9EDF3" /><path d="M55 14 C70 4 92 4 106 10 L106 84 C92 78 70 78 55 88 Z" fill="#FFFFFF" /><path d="M55 14 L55 88" stroke="#9AA5B5" strokeWidth={3} />{label ? <text x={80} y={50} textAnchor="middle" fontFamily={DISPLAY} fontSize={18} fill="#4D8DF0">{label}</text> : null}</>, 90 / 110);
export const Globe: React.FC<O> = ({ s = 120 }) => { const { t } = useT(); const o = (t * 12) % 40; return svg(s, "0 0 100 100", <><defs><clipPath id="gl"><circle cx={50} cy={50} r={42} /></clipPath></defs><circle cx={50} cy={50} r={42} fill="#4D8DF0" /><g clipPath="url(#gl)">{[-40, 0, 40, 80].map((x) => <path key={x} d={`M${x + o - 20} 30 q14 -12 26 0 q8 10 0 22 q-12 10 -22 0 Z M${x + o} 64 q12 -8 20 2 q4 12 -10 14 q-12 -2 -10 -16 Z`} fill="#5FBF7A" />)}</g><circle cx={50} cy={50} r={42} fill="none" stroke="#BFD6FF" strokeWidth={3} /></>); };
export const Laptop: React.FC<O & { screen?: React.ReactNode }> = ({ s = 200 }) => svg(s, "0 0 160 110", <><rect x={20} y={6} width={120} height={80} rx={8} fill="#2B3340" /><rect x={28} y={14} width={104} height={64} rx={4} fill="#1B2330" /><rect x={40} y={28} width={50} height={8} rx={4} fill={C.accent} /><rect x={40} y={44} width={80} height={6} rx={3} fill="#5E7392" /><rect x={40} y={56} width={64} height={6} rx={3} fill="#5E7392" /><path d="M4 92 L156 92 L148 104 L12 104 Z" fill="#7C8798" /></>, 110 / 160);
export const Cart: React.FC<O> = ({ s = 120 }) => svg(s, "0 0 110 100", <><path d="M4 10 L22 10 L36 66 L92 66 L104 26 L28 26" stroke="#E9EDF3" strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" /><circle cx={42} cy={84} r={9} fill="#E9EDF3" /><circle cx={86} cy={84} r={9} fill="#E9EDF3" /><rect x={44} y={34} width={18} height={20} rx={3} fill={C.accent} /><rect x={66} y={30} width={22} height={24} rx={3} fill="#5FBF7A" /></>, 100 / 110);
export const Apple: React.FC<O> = ({ s = 90 }) => svg(s, "0 0 100 100", <><path d="M50 26 C30 14 8 26 10 54 C12 82 34 98 50 90 C66 98 88 82 90 54 C92 26 70 14 50 26 Z" fill="#E5484D" /><path d="M50 26 C50 14 56 6 66 4" stroke="#6B4A2B" strokeWidth={5} fill="none" /><path d="M54 14 C64 4 78 8 80 14 C70 20 60 20 54 14 Z" fill="#5FBF7A" /></>);
export const Fish: React.FC<O> = ({ s = 120 }) => svg(s, "0 0 120 70", <><path d="M8 35 C30 4 80 4 96 35 C80 66 30 66 8 35 Z" fill="#5FD4F5" /><path d="M94 35 L118 14 L118 56 Z" fill="#2FA8D0" /><circle cx={30} cy={30} r={5} fill={C.ink} /></>, 70 / 120);
export const Mic: React.FC<O> = ({ s = 90 }) => svg(s, "0 0 70 120", <><rect x={20} y={4} width={30} height={56} rx={15} fill="#2B3340" /><rect x={24} y={10} width={22} height={40} rx={11} fill="#7C8798" /><path d="M10 44 C10 70 60 70 60 44" stroke="#C9CED6" strokeWidth={6} fill="none" /><rect x={32} y={70} width={6} height={30} fill="#C9CED6" /><rect x={16} y={100} width={38} height={8} rx={4} fill="#C9CED6" /></>, 120 / 70);
export const PriceTag: React.FC<O & { label?: string }> = ({ s = 130, label = "R$" }) => svg(s, "0 0 130 70", <><path d="M30 4 L124 4 L124 66 L30 66 L4 35 Z" fill={C.accent} /><circle cx={24} cy={35} r={6} fill={C.bg} /><text x={78} y={46} textAnchor="middle" fontFamily={DISPLAY} fontSize={30} fill={C.ink}>{label}</text></>, 70 / 130);
export const Handshake: React.FC<O> = ({ s = 150 }) => svg(s, "0 0 140 80", <><path d="M4 30 L40 20 L70 40 L60 52 Z" fill="#8D5A3B" /><path d="M136 30 L100 20 L66 38 L80 54 Z" fill="#C88A4E" /><path d="M40 20 L64 34 C70 38 78 36 80 30 L96 22" stroke="#14171C" strokeWidth={3} fill="none" /><rect x={0} y={22} width={22} height={30} rx={6} fill="#4A6FA5" /><rect x={118} y={22} width={22} height={30} rx={6} fill={C.accent} /></>, 80 / 140);
export const Battery: React.FC<O & { level: number }> = ({ s = 160, level }) => {
  const col = level > 0.5 ? "#5FBF7A" : level > 0.25 ? C.accent : "#E5484D";
  return svg(s, "0 0 120 60", <><rect x={4} y={6} width={100} height={48} rx={10} fill="none" stroke="#E9EDF3" strokeWidth={6} /><rect x={106} y={20} width={10} height={20} rx={3} fill="#E9EDF3" /><rect x={12} y={14} width={84 * level} height={32} rx={5} fill={col} /></>, 0.5);
};
export const Arrow: React.FC<{ w: number; t: number; at: number; dur?: number; color?: string; curve?: number; thick?: number; dashed?: boolean }> = ({ w, t, at, dur = 0.5, color = C.accent, curve = -60, thick = 8, dashed }) => {
  const k = ez(t, at, at + dur);
  const d = `M8 ${Math.abs(curve) + 10} Q ${w / 2} ${Math.abs(curve) + 10 + curve} ${w - 20} ${Math.abs(curve) + 10}`;
  return (
    <svg width={w} height={Math.abs(curve) * 2 + 30} overflow="visible">
      <path d={d} stroke={color} strokeWidth={thick} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={dashed ? "0.03 0.03" : 1} strokeDashoffset={dashed ? -t * 0.2 : 1 - k} opacity={dashed ? k : 1} />
      {k > 0.95 ? <path d={`M${w - 38} ${Math.abs(curve) - 4} L${w - 12} ${Math.abs(curve) + 10} L${w - 36} ${Math.abs(curve) + 26}`} stroke={color} strokeWidth={thick} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
};
export const Stamp: React.FC<{ text: string; at: number; color?: string; size?: number }> = ({ text, at, color = "#E5484D", size = 70 }) => {
  const { frame, fps } = useT();
  const k = sp(frame, fps, at, 18, 420);
  if (k <= 0.01) return null;
  return (
    <div style={{ rotate: "-12deg", scale: String(2.4 - 1.4 * Math.min(1, k)), opacity: Math.min(1, k * 1.6), border: `8px solid ${color}`, borderRadius: 16, padding: "6px 24px", fontFamily: DISPLAY, fontSize: size, color, background: "rgba(14,17,22,0.85)", whiteSpace: "nowrap" }}>{text}</div>
  );
};
export const Label: React.FC<{ text: string; hot?: boolean; size?: number }> = ({ text, hot, size = 32 }) => (
  <div style={{ fontFamily: UI, fontWeight: 900, fontSize: size, letterSpacing: 1, color: hot ? C.ink : "#FFFFFF", background: hot ? C.accent : "rgba(14,17,22,0.8)", padding: "8px 18px", borderRadius: 12, whiteSpace: "nowrap", border: hot ? "none" : "1px solid rgba(255,255,255,0.15)" }}>{text}</div>
);
// flying item along a straight path between two points (centered), from t0 to t1
export const Fly: React.FC<{ t0: number; t1: number; from: [number, number]; to: [number, number]; arc?: number; children: React.ReactNode; hold?: boolean }> = ({ t0, t1, from, to, arc = -120, children, hold = true }) => {
  const { t } = useT();
  if (t < t0 || (!hold && t > t1)) return null;
  const k = ez(t, t0, t1);
  const x = from[0] + (to[0] - from[0]) * k, y = from[1] + (to[1] - from[1]) * k + Math.sin(k * Math.PI) * arc;
  return <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", rotate: `${Math.sin(k * Math.PI) * 12}deg` }}>{children}</div>;
};
