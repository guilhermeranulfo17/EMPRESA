import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";
import { Logo } from "../comp/Logo";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

/** Cena 3 (15 a 21 s): o logo e a frase "seu cliente monta o orçamento sozinho". */
export const Mecanismo: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  // "O Orkestra" (15,44 s): o logo entra da esquerda para a direita, com um brilho limão por trás
  const nome = interpolate(t, [15.35, 16.05], [0, 1], { ...lim, easing: sai });
  const sobe = spring({ frame: Math.round((t - 15.35) * FPS), fps: FPS, config: { damping: 16, stiffness: 110 } });
  const frase = interpolate(t, [18.2, 18.7], [0, 1], { ...lim, easing: sai });
  const sozinho = interpolate(t, [19.7, 20.0], [0, 1], { ...lim, easing: sai });
  const saida = interpolate(t, [20.25, 20.75], [0, 1], { ...lim, easing: Easing.bezier(0.5, 0, 0.75, 0) });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto, opacity: 1 - saida }}>
      <div
        style={{
          position: "absolute",
          top: interpolate(frase, [0, 1], [700, 560]) - saida * 120,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div
          style={{
            clipPath: `inset(-40px ${(1 - nome) * 100}% -40px -40px)`,
            translate: `0px ${(1 - sobe) * 30}px`,
          }}
        >
          <Logo largura={780} />
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
