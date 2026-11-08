// Visual kit for the @guisilva.vendas split Reels (top panel 1080x960).
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const C = {
  bg: "#0B0E13",
  bg2: "#0E1116",
  ink: "#14171C",
  white: "#FFFFFF",
  grey: "#8A93A3",
  grey2: "#C9CED6",
  accent: "#FFD60A",
  accentDeep: "#E5B800",
};
export const DISPLAY = "ArchivoBlack";
export const UI = "InterVar";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// seconds -> local frame helpers
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};
export const sp = (frame: number, fps: number, at: number, damping = 14, stiffness = 140, mass = 0.8) =>
  spring({ frame: frame - Math.round(at * fps), fps, config: { damping, stiffness, mass } });
export const ramp = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], { ...clamp, easing: EASE });

// ---------------------------------------------------------------- background
export const Background: React.FC = () => {
  const { t, frame } = useT();
  const o1x = 260 + Math.sin(t * 0.35) * 120, o1y = 260 + Math.cos(t * 0.28) * 80;
  const o2x = 820 + Math.cos(t * 0.31) * 140, o2y = 700 + Math.sin(t * 0.22) * 90;
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(520px 520px at ${o1x}px ${o1y}px, rgba(255,214,10,0.13), transparent 70%),
            radial-gradient(640px 640px at ${o2x}px ${o2y}px, rgba(88,110,150,0.28), transparent 70%),
            radial-gradient(900px 600px at 540px 1100px, rgba(255,214,10,0.06), transparent 70%)`,
        }}
      />
      {/* perspective grid */}
      <AbsoluteFill style={{ perspective: 700, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", left: -540, right: -540, top: 520, height: 900,
            transformOrigin: "50% 0%", rotate: "x 68deg",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.07) 2px, transparent 2px)",
            backgroundSize: "90px 90px",
            backgroundPosition: `0px ${(t * 40) % 90}px`,
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 75%)",
          }}
        />
      </AbsoluteFill>
      {/* grain */}
      <AbsoluteFill style={{ opacity: 0.09, mixBlendMode: "overlay" }}>
        <svg width="1080" height="960">
          <filter id={`n${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
          </filter>
          <rect width="100%" height="100%" filter={`url(#n${seed})`} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- kicker pill
export const Kicker: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const { t } = useT();
  const k = ramp(t, at, at + 0.45);
  return (
    <div
      style={{
        position: "absolute", left: 64, top: 138, display: "flex", alignItems: "center", gap: 14,
        padding: "12px 24px 12px 18px", borderRadius: 999,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
        opacity: k, translate: `${(1 - k) * -30}px 0px`, filter: `blur(${(1 - k) * 8}px)`,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 6, background: C.accent, boxShadow: `0 0 ${12 + 6 * Math.sin(t * 4)}px ${C.accent}` }} />
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.grey2, textTransform: "uppercase" }}>{text}</div>
    </div>
  );
};

// ---------------------------------------------------------------- kinetic words
// text with *word* highlights in yellow. Each word: blur + rise + rotateX, staggered.
export const Words: React.FC<{
  text: string; at: number; size: number; color?: string; align?: "left" | "center"; stagger?: number; width?: number | null; lineHeight?: number;
}> = ({ text, at, size, color = C.white, align = "center", stagger = 0.06, width = 940, lineHeight = 1.08 }) => {
  const { frame, fps } = useT();
  const words = text.split(" ");
  return (
    <div style={{ width: width ?? undefined, display: width == null ? "inline-flex" : "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.28, rowGap: size * (lineHeight - 1), perspective: 900 }}>
      {(() => { let open = false; return words.map((w) => { const starts = w.startsWith("*"); const ends = /\*[.,!?:]*$/.test(w); const hot = open || starts; open = (open || starts) && !ends; return hot; }); })().map((hot, i) => {
        const w = words[i];
        const clean = w.replace(/\*/g, "");
        const k = sp(frame, fps, at + i * stagger, 15, 160);
        return (
          <span
            key={i}
            style={{
              display: "inline-block", fontFamily: DISPLAY, fontSize: size, lineHeight, color: hot ? C.accent : color,
              opacity: Math.min(1, k * 1.4), translate: `0px ${(1 - k) * size * 0.6}px`, rotate: `x ${(1 - k) * 70}deg`,
              filter: `blur(${Math.max(0, (1 - k) * 14)}px)`, textShadow: hot ? `0 0 30px rgba(255,214,10,0.35)` : "0 8px 30px rgba(0,0,0,0.5)",
              transformOrigin: "50% 100%",
            }}
          >
            {clean}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- yellow box label with wipe + shine
export const Box: React.FC<{ text: string; at: number; size: number; tilt?: number }> = ({ text, at, size, tilt = -2 }) => {
  const { t, frame, fps } = useT();
  const wipe = ramp(t, at, at + 0.35);
  const k = sp(frame, fps, at, 11, 180);
  const shine = interpolate(t, [at + 0.4, at + 1.2], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t < at - 0.05) return null;
  return (
    <div style={{ position: "relative", display: "inline-block", rotate: `${tilt}deg`, scale: String(0.85 + 0.15 * k) }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`, borderRadius: size * 0.2, transformOrigin: "0% 50%", scale: `${wipe} 1`, boxShadow: `0 18px 50px rgba(255,214,10,${0.35 * wipe})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: size * 0.2, overflow: "hidden", opacity: wipe }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, width: "35%", left: `${shine}%`, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)", transform: "skewX(-20deg)" }} />
      </div>
      <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: size, color: C.ink, padding: `${size * 0.14}px ${size * 0.4}px ${size * 0.1}px`, opacity: ramp(t, at + 0.15, at + 0.35), whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- glass card
export const Glass: React.FC<{ children: React.ReactNode; at: number; style?: React.CSSProperties; hot?: boolean; glow?: number }> = ({ children, at, style, hot, glow = 0 }) => {
  const { frame, fps } = useT();
  const k = sp(frame, fps, at, 16, 150);
  return (
    <div style={{ perspective: 1200, ...style }}>
      <div
        style={{
          width: "100%", height: "100%", borderRadius: 30, position: "relative", overflow: "hidden",
          background: hot ? `linear-gradient(145deg, ${C.accent}, ${C.accentDeep})` : "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
          border: hot ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.13)",
          boxShadow: `0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)${glow ? `, 0 0 ${40 * glow}px rgba(255,214,10,${0.45 * glow})` : ""}`,
          opacity: Math.min(1, k * 1.3), rotate: `x ${(1 - k) * 35}deg`, translate: `0px ${(1 - k) * 80}px`, filter: `blur(${Math.max(0, (1 - k) * 10)}px)`,
          transformOrigin: "50% 100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- icons (stroke draw)
export const Mark: React.FC<{ kind: "yes" | "no" | "num"; n?: number; at: number; size?: number; active?: boolean }> = ({ kind, n = 1, at, size = 76, active }) => {
  const { t, frame, fps } = useT();
  const k = sp(frame, fps, at, 10, 200);
  const d = ramp(t, at + 0.1, at + 0.45);
  const bg = kind === "no" ? "rgba(255,255,255,0.08)" : C.accent;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: "flex", alignItems: "center", justifyContent: "center", scale: String(Math.max(0, k)), boxShadow: active && kind !== "no" ? `0 0 30px rgba(255,214,10,0.6)` : "none", flexShrink: 0 }}>
      {kind === "num" ? (
        <span style={{ fontFamily: DISPLAY, fontSize: size * 0.5, color: C.ink }}>{n}</span>
      ) : (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke={kind === "no" ? C.grey2 : C.ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
          {kind === "yes" ? (
            <path d="M4 12.5l5 5L20 6.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
          ) : (
            <path d="M6 6l12 12M18 6L6 18" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
          )}
        </svg>
      )}
    </div>
  );
};

// ripple rings behind a point
export const Ripple: React.FC<{ at: number; x: number; y: number; r?: number; color?: string }> = ({ at, x, y, r = 120, color = C.accent }) => {
  const { t } = useT();
  if (t < at) return null;
  return (
    <>
      {[0, 0.25, 0.5].map((o, i) => {
        const p = ((t - at - o) % 1.4) / 1.4;
        if (t - at - o < 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `3px solid ${color}`, opacity: (1 - p) * 0.5, scale: String(0.6 + p * 0.9) }} />
        );
      })}
    </>
  );
};

export const Exemplo: React.FC<{ at: number }> = ({ at }) => {
  const { t } = useT();
  const k = ramp(t, at, at + 0.3);
  return (
    <div style={{ position: "absolute", right: 64, top: 142, opacity: k, padding: "8px 16px", borderRadius: 10, border: `2px solid ${C.grey}`, fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: C.grey }}>
      EXEMPLO
    </div>
  );
};

export const rnd = random;
