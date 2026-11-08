// Shell for illustrated explainer Reels: background, scenes with camera-like transitions, kicker + title.
import React, { useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { Background, C, DISPLAY, EASE, Kicker, UI, Words, useT } from "./kit";

export type Sc = { a: number; b: number; kicker: string; title?: string; titleAt?: number; titleSize?: number; body: (t: number) => React.ReactNode };

export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts-ex"));
  React.useEffect(() => {
    const fonts = [new FontFace(DISPLAY, `url(${staticFile("fonts/ArchivoBlack-Regular.ttf")})`), new FontFace(UI, `url(${staticFile("fonts/Inter.ttf")})`, { weight: "100 900" })];
    Promise.all(fonts.map((f) => f.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle));
  }, [handle]);
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Shot: React.FC<{ s: Sc; first: boolean; last: boolean }> = ({ s, first, last }) => {
  const { t } = useT();
  if (t < s.a - 0.3 || t > s.b + 0.3) return null;
  const inK = first ? 1 : interpolate(t, [s.a - 0.25, s.a + 0.12], [0, 1], { ...cl, easing: EASE });
  const outK = last ? 0 : interpolate(t, [s.b - 0.12, s.b + 0.25], [0, 1], { ...cl, easing: EASE });
  const push = interpolate(t, [s.a, s.b], [1, 1.04], cl);
  return (
    <AbsoluteFill style={{ opacity: inK * (1 - outK), scale: String((1.1 - 0.1 * inK) * (1 - 0.06 * outK)), filter: `blur(${(1 - inK) * 16 + outK * 12}px)`, translate: `${(1 - inK) * 60 - outK * 60}px 0px` }}>
      <AbsoluteFill style={{ scale: String(push), transformOrigin: "50% 62%" }}>{s.body(t)}</AbsoluteFill>
      <Kicker text={s.kicker} at={first ? -1 : s.a + 0.05} />
      {s.title ? (
        <div style={{ position: "absolute", left: 64, top: 212, right: 40 }}>
          <Words text={s.title} at={Math.min(s.titleAt ?? s.a, s.a + 0.3)} size={s.titleSize ?? Math.max(50, Math.min(66, Math.floor(950 / (s.title.replace(/\*/g, '').length * 0.74))))} align="left" width={960} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const Streak: React.FC<{ at: number }> = ({ at }) => {
  const { t } = useT();
  const p = interpolate(t, [at - 0.15, at + 0.25], [0, 1], cl);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: -200, bottom: -200, width: 260, left: -300 + p * 1700, rotate: "18deg", background: "linear-gradient(90deg, transparent, rgba(255,214,10,0.22), rgba(255,255,255,0.35), rgba(255,214,10,0.22), transparent)", filter: "blur(20px)" }} />
    </AbsoluteFill>
  );
};
export const Shell: React.FC<{ scenes: Sc[] }> = ({ scenes }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Background />
      {scenes.map((s, i) => <Shot key={i} s={s} first={i === 0} last={i === scenes.length - 1} />)}
      {scenes.slice(1).map((s, i) => <Streak key={i} at={s.a} />)}
    </AbsoluteFill>
  );
};
