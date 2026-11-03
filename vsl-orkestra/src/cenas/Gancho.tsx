import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

/** Cena 1 (0 a 8 s): sexta, 23:00, a mensagem da Mariana chega no WhatsApp do buffet. */
export const Gancho: React.FC<{ buffetName: string }> = ({ buffetName }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // relógio: 22:59 vira 23:00 quando a voz diz "onze"
  const virou = t >= 1.21;
  const flip = interpolate(t, [1.21, 1.45], [0, 1], { ...lim, easing: sai });
  const entraRelogio = spring({ frame, fps: FPS, config: { damping: 20, stiffness: 110 } });
  // o relógio sobe e diminui quando a conversa entra
  const sobe = interpolate(t, [3.5, 4.2], [0, 1], { ...lim, easing: sai });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto }}>
      <div
        style={{
          position: "absolute",
          top: 268,
          width: "100%",
          textAlign: "center",
          fontSize: 38,
          fontWeight: 600,
          color: COR.texto2,
          letterSpacing: 0.5,
          opacity: interpolate(t, [0.1, 0.5, 3.2, 3.6], [0, 1, 1, 0], lim),
          translate: `0px ${interpolate(t, [0.1, 0.6], [12, 0], { ...lim, easing: sai })}px`,
        }}
      >
        Para o <span style={{ color: COR.texto }}>{buffetName}</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: interpolate(sobe, [0, 1], [600, 330]),
          width: "100%",
          textAlign: "center",
          opacity: entraRelogio * interpolate(t, [7.75, 8.05], [1, 0], lim),
          scale: `${interpolate(sobe, [0, 1], [1, 0.55]) * (0.92 + 0.08 * entraRelogio)}`,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, color: COR.texto2, marginBottom: 8 }}>
          Sexta-feira
        </div>
        <div
          style={{
            fontSize: 260,
            fontWeight: 800,
            letterSpacing: -6,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{virou ? "23" : "22"}</span>
          <span style={{ color: COR.limao, opacity: Math.floor(t * 2) % 2 === 0 ? 1 : 0.35 }}>
            :
          </span>
          <span
            style={{
              display: "inline-block",
              translate: `0px ${virou ? (1 - flip) * -40 : 0}px`,
              opacity: virou ? flip : 1,
            }}
          >
            {virou ? "00" : "59"}
          </span>
        </div>
      </div>

    </AbsoluteFill>
  );
};
