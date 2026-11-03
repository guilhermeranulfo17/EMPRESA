import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

/** Conversas de outros buffets (genéricos, sem nomes reais), respondidas na mesma noite. */
const OUTROS = [
  { hora: "23:02", texto: "Oi, Mariana! Para 50 pessoas fica…", at: 10.15 },
  { hora: "23:06", texto: "Boa noite! Segue o orçamento do sábado", at: 10.75 },
  { hora: "23:11", texto: "Temos a data livre! Quer reservar?", at: 11.35 },
];

const Linha: React.FC<{
  t: number;
  at: number;
  nome: string;
  texto: string;
  hora: string;
  apagada?: boolean;
}> = ({ t, at, nome, texto, hora, apagada }) => {
  const s = spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping: 16, stiffness: 140 } });
  if (t < at) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "28px 34px",
        borderRadius: 36,
        backgroundColor: apagada ? "rgba(26,26,26,0.55)" : COR.card,
        border: `2px solid ${apagada ? "rgba(44,44,44,0.6)" : COR.borda}`,
        opacity: s * (apagada ? 0.5 : 1),
        translate: `0px ${(1 - s) * -90}px`,
        scale: `${0.94 + 0.06 * s}`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          flexShrink: 0,
          borderRadius: 999,
          backgroundColor: apagada ? "#2A2A2A" : "#33332F",
          display: "grid",
          placeItems: "center",
          fontSize: 38,
          fontWeight: 800,
          color: COR.texto2,
        }}
      >
        B
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, fontWeight: 700 }}>
          <span style={{ color: COR.texto }}>{nome}</span>
          <span style={{ fontSize: 32, color: apagada ? COR.texto2 : COR.limao, fontWeight: 700 }}>{hora}</span>
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: COR.texto2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {texto}
        </div>
      </div>
    </div>
  );
};

/** Cena 2 (8 a 15 s): você responde no dia seguinte; ela já recebeu de outros três buffets. */
export const Dor: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;

  const rotulo = interpolate(t, [8.1, 8.45, 12.1, 12.4], [0, 1, 1, 0], lim);
  const lista = interpolate(t, [12.2, 12.55], [1, 0], { ...lim, easing: sai });
  const frase = (de: number) => ({
    opacity: interpolate(t, [de, de + 0.25], [0, 1], lim),
    translate: `0px ${interpolate(t, [de, de + 0.45], [40, 0], { ...lim, easing: sai })}px`,
    display: "inline-block" as const,
  });
  const brilho = interpolate(t, [13.9, 14.3], [0, 1], { ...lim, easing: sai });
  const saida = interpolate(t, [14.75, 15.15], [0, 1], lim);

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto }}>
      <div
        style={{
          position: "absolute",
          top: 330,
          width: "100%",
          textAlign: "center",
          opacity: rotulo,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: COR.texto2 }}>No dia seguinte</div>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, lineHeight: 1.05 }}>
          09<span style={{ color: COR.limao }}>:</span>40
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          width: 880,
          top: 600,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          opacity: lista,
          scale: `${0.96 + 0.04 * lista}`,
        }}
      >
        {OUTROS.map((o, i) => (
          <Linha key={i} t={t} at={o.at} nome="Outro buffet" texto={o.texto} hora={o.hora} />
        ))}
        <Linha t={t} at={10.05} nome="Seu buffet" texto="Bom dia, Mariana! Desculpa a demora…" hora="09:40" apagada />
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 640,
          textAlign: "center",
          fontSize: 108,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -2,
          opacity: 1 - saida,
        }}
      >
        <span style={frase(13.14)}>Quem</span> <span style={frase(13.32)}>responde</span>{" "}
        <span
          style={{
            ...frase(13.85),
            color: COR.limao,
            textShadow: `0 0 ${50 * brilho}px rgba(178,247,89,0.45)`,
          }}
        >
          primeiro,
        </span>{" "}
        <span style={frase(12.57)}>fecha.</span>
      </div>
    </AbsoluteFill>
  );
};
