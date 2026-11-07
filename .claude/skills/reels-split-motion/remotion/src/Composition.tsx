import React, { useState } from "react";
import { AbsoluteFill, CalculateMetadataFunction, Composition, continueRender, delayRender, interpolate, staticFile } from "remotion";
import { Background, DISPLAY, EASE, UI, useT } from "./kit";
import { Scene, SceneView } from "./scenes";

type Props = { duration: number; scenes: Scene[] };

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.ceil(props.duration * 30),
});

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const fonts = [
      new FontFace(DISPLAY, `url(${staticFile("fonts/ArchivoBlack-Regular.ttf")})`),
      new FontFace(UI, `url(${staticFile("fonts/Inter.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(fonts.map((f) => f.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle));
  }, [handle]);
};

// one scene with a camera-style enter / exit (zoom + blur), visible from a-0.25 to b+0.25
const Shot: React.FC<{ s: Scene; first: boolean; last: boolean }> = ({ s, first, last }) => {
  const { t } = useT();
  if (t < s.a - 0.25 || t > s.b + 0.25) return null;
  const inK = first ? 1 : interpolate(t, [s.a - 0.22, s.a + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  const outK = last ? 0 : interpolate(t, [s.b - 0.12, s.b + 0.22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return (
    <AbsoluteFill
      style={{
        opacity: inK * (1 - outK),
        scale: String((1.12 - 0.12 * inK) * (1 - 0.08 * outK) * interpolate(t, [s.a, s.b], [1, 1.035], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
        translate: `0px ${outK * -40}px`,
        filter: `blur(${(1 - inK) * 18 + outK * 14}px)`,
      }}
    >
      <SceneView s={s} />
    </AbsoluteFill>
  );
};

// light streak on each cut
const Streak: React.FC<{ at: number }> = ({ at }) => {
  const { t } = useT();
  const p = interpolate(t, [at - 0.15, at + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: -200, bottom: -200, width: 260, left: -300 + p * 1700, rotate: "18deg", background: "linear-gradient(90deg, transparent, rgba(255,214,10,0.22), rgba(255,255,255,0.35), rgba(255,214,10,0.22), transparent)", filter: "blur(20px)" }} />
    </AbsoluteFill>
  );
};

export const Split: React.FC<Props> = ({ scenes }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0E13" }}>
      <Background />
      {scenes.map((s, i) => <Shot key={i} s={s} first={i === 0} last={i === scenes.length - 1} />)}
      {scenes.slice(1).map((s, i) => <Streak key={i} at={s.a} />)}
    </AbsoluteFill>
  );
};

const demo: Props = {
  duration: 6,
  scenes: [
    { type: "hook", a: 0, b: 3, kicker: "Venda de verdade", lines: [["O QUE É", "w"], ["VENDER", "box"]], at: -0.6 },
    { type: "rows", a: 3, b: 6, kicker: "Na prática", title: [["3 COISAS", "y"]], titleAt: 3.2, items: [{ text: "Compreender", at: 3.6, mark: "num" }, { text: "Demonstrar valor", at: 4.2, mark: "num" }, { text: "Conduzir", at: 4.8, mark: "num" }] },
  ],
};

export const MyComposition = () => (
  <Composition id="Split" component={Split} fps={30} width={1080} height={960} durationInFrames={180} defaultProps={demo} calculateMetadata={calculateMetadata} />
);
