import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";
import { Logotipo, Simbolo } from "../comp/Logo";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

/** Cena 3 (15 a 21 s): o logo e a frase "seu cliente monta o orçamento sozinho". */
export const Mecanismo: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  const sim = spring({ frame: Math.round((t - 15.3) * FPS), fps: FPS, config: { damping: 12, stiffness: 120 } });
  const nome = interpolate(t, [15.55, 16.1], [0, 1], { ...lim, easing: sai });
  const frase = interpolate(t, [18.2, 18.7], [0, 1], { ...lim, easing: sai });
  const sozinho = interpolate(t, [19.7, 20.0], [0, 1], { ...lim, easing: sai });
  const saida = interpolate(t, [20.25, 20.75], [0, 1], { ...lim, easing: Easing.bezier(0.5, 0, 0.75, 0) });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto, opacity: 1 - saida }}>
      <div
        style={{
          position: "absolute",
          top: interpolate(frase, [0, 1], [620, 470]) - saida * 120,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div style={{ scale: `${sim}`, rotate: `${(1 - sim) * -14}deg`, filter: `drop-shadow(0 0 ${60 * sim}px rgba(178,247,89,0.35))` }}>
          <Simbolo tamanho={200} />
        </div>
        <div style={{ clipPath: `inset(0 ${(1 - nome) * 100}% 0 0)`, opacity: nome }}>
          <Logotipo largura={640} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 930,
          left: 80,
          right: 80,
          textAlign: "center",
          fontSize: 92,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          opacity: frase,
          translate: `0px ${(1 - frase) * 40}px`,
        }}
      >
        seu cliente monta o orçamento{" "}
        <span style={{ color: COR.limao, opacity: 0.35 + 0.65 * sozinho }}>sozinho</span>
      </div>
    </AbsoluteFill>
  );
};
