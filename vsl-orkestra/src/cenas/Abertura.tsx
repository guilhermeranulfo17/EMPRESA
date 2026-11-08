import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";
import { FotoFundo } from "../comp/FotoFundo";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

/** Ícone genérico de app de mensagens (sem a marca de terceiros). */
const IconeApp: React.FC = () => (
  <div
    style={{
      width: 62,
      height: 62,
      borderRadius: 16,
      backgroundColor: "#25D366",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
    }}
  >
    <svg width="36" height="36" viewBox="0 0 24 24">
      <path
        d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 1.6.5 3.1 1.4 4.3L3.8 20l4.6-1.2c1.1.5 2.3.7 3.6.7 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2z"
        fill="#fff"
      />
    </svg>
  </div>
);

type Notif = {
  id: string;
  entra: number;
  sai?: number;
  /** posição fixa na pilha (0 = em cima) */
  vaga: number;
  titulo: string;
  texto: string;
  hora: string;
  apagada?: boolean;
};

/** Celular do buffet às 23:00; depois o da Mariana às 9:40 (a sua resposta em cima, as dos outros embaixo). */
const NOTIFS: Notif[] = [
  { id: "m", entra: 3.85, sai: 8.1, vaga: 0, titulo: "Mariana", texto: "Oi, boa noite! Quanto fica pra 50 pessoas no sábado?", hora: "agora" },
  { id: "s", entra: 8.8, vaga: 0, titulo: "Seu buffet", texto: "Bom dia, Mariana! Desculpa a demora…", hora: "09:40", apagada: true },
  { id: "o3", entra: 10.1, vaga: 1, titulo: "Outro buffet", texto: "Temos o sábado livre! Quer que eu já reserve?", hora: "ontem 23:11" },
  { id: "o2", entra: 10.7, vaga: 2, titulo: "Outro buffet", texto: "Boa noite! Segue o orçamento com a data livre.", hora: "ontem 23:06" },
  { id: "o1", entra: 11.3, vaga: 3, titulo: "Outro buffet", texto: "Oi, Mariana! Para 50 pessoas fica R$ 4.800…", hora: "ontem 23:02" },
];
const ALTURA = 176;
const ESPACO = 14;

const Notificacao: React.FC<{ n: Notif; t: number; y: number }> = ({ n, t, y }) => {
  const s = spring({ frame: Math.round((t - n.entra) * FPS), fps: FPS, config: { damping: 17, stiffness: 150 } });
  const fora = n.sai ? interpolate(t, [n.sai, n.sai + 0.35], [0, 1], { ...lim, easing: Easing.bezier(0.5, 0, 0.75, 0) }) : 0;
  if (t < n.entra) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 960,
        top: y,
        height: ALTURA,
        boxSizing: "border-box",
        padding: "22px 30px",
        borderRadius: 44,
        backgroundColor: n.apagada ? "rgba(40,40,38,0.62)" : "rgba(52,52,50,0.58)",
        backdropFilter: "blur(36px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
        display: "flex",
        gap: 26,
        opacity: s * (1 - fora),
        translate: `0px ${(1 - s) * -70 - fora * 90}px`,
        scale: `${0.96 + 0.04 * s}`,
      }}
    >
      <IconeApp />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: COR.texto }}>{n.titulo}</span>
          <span style={{ fontSize: 28, fontWeight: 600, color: "rgba(244,244,242,0.6)" }}>{n.hora}</span>
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.28,
            color: "rgba(244,244,242,0.92)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {n.texto}
        </div>
      </div>
    </div>
  );
};

/** Hora e data da tela de bloqueio, trocando com um rolar vertical. */
const Relogio: React.FC<{ t: number }> = ({ t }) => {
  const fases = [
    { de: -1, hora: "22:59", data: "sexta-feira, 4 de dezembro" },
    { de: 1.21, hora: "23:00", data: "sexta-feira, 4 de dezembro" },
    { de: 8.14, hora: "09:40", data: "sábado, 5 de dezembro" },
  ];
  let i = 0;
  fases.forEach((f, k) => {
    if (t >= f.de) i = k;
  });
  const atual = fases[i];
  const p = i > 0 ? interpolate(t, [atual.de, atual.de + 0.35], [0, 1], { ...lim, easing: sai }) : 1;
  const anterior = i > 0 ? fases[i - 1] : null;
  const linha = (f: (typeof fases)[number], op: number, dy: number) => (
    <div style={{ position: "absolute", width: "100%", textAlign: "center", opacity: op, translate: `0px ${dy}px` }}>
      <div style={{ fontSize: 40, fontWeight: 600, color: "rgba(244,244,242,0.85)" }}>{f.data}</div>
      <div style={{ fontSize: 210, fontWeight: 700, letterSpacing: -6, lineHeight: 1.02, fontVariantNumeric: "tabular-nums" }}>
        {f.hora}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", top: 330, width: "100%", height: 300 }}>
      {anterior && p < 1 ? linha(anterior, 1 - p, -40 * p) : null}
      {linha(atual, p, 40 * (1 - p))}
    </div>
  );
};

/**
 * Abertura (0 a 15 s): a tela de bloqueio com a mensagem da Mariana às 23:00; no dia seguinte, às 9:40,
 * a sua resposta chega por último, depois das de outros três buffets; e a frase "quem responde primeiro, fecha".
 */
export const Abertura: React.FC<{ buffetName: string }> = ({ buffetName }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // a pilha sobe e o relógio encolhe quando a cena vira o celular da Mariana (dia seguinte)
  const dia2 = interpolate(t, [8.1, 8.55], [0, 1], { ...lim, easing: sai });
  const topoPilha = interpolate(dia2, [0, 1], [720, 560]);

  const escurece = interpolate(t, [12.3, 12.75], [0, 1], { ...lim, easing: sai });
  const frase = (de: number) => ({
    display: "inline-block" as const,
    opacity: interpolate(t, [de, de + 0.2], [0, 1], lim),
    translate: `0px ${interpolate(t, [de, de + 0.45], [44, 0], { ...lim, easing: sai })}px`,
  });
  const saida = interpolate(t, [14.75, 15.15], [0, 1], lim);

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto, opacity: 1 - saida }}>
      <FotoFundo
        src="noite-celular.jpg"
        inicio={0}
        dur={15.2}
        desfoque={interpolate(escurece, [0, 1], [3, 14])}
        brilho={interpolate(escurece, [0, 1], [0.62, 0.32])}
        saturacao={0.9}
        posicao="38% 50%"
        zoom={[1.18, 1.04]}
        sombra="linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 38%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.6) 100%)"
      />

      <div style={{ opacity: 1 - escurece }}>
        <div
          style={{
            position: "absolute",
            top: 262,
            width: "100%",
            textAlign: "center",
            fontSize: 34,
            fontWeight: 600,
            color: "rgba(244,244,242,0.75)",
            opacity: interpolate(t, [0.1, 0.5, 2.8, 3.3], [0, 1, 1, 0], lim),
          }}
        >
          Para o <span style={{ color: COR.texto, fontWeight: 700 }}>{buffetName}</span>
        </div>
        <div
          style={{
            opacity: interpolate(t, [0, 0.5], [0, 1], lim),
            scale: `${interpolate(dia2, [0, 1], [1, 0.62])}`,
            transformOrigin: "50% 290px",
          }}
        >
          <Relogio t={t} />
        </div>
        {NOTIFS.map((n) => (
          <Notificacao key={n.id} n={n} t={t} y={topoPilha + n.vaga * (ALTURA + ESPACO)} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 610,
          fontSize: 128,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: -4,
        }}
      >
        <span style={frase(13.14)}>Quem</span> <span style={frase(13.32)}>responde</span>
        <br />
        <span style={{ ...frase(13.85), color: COR.limao }}>primeiro,</span>
        <br />
        <span style={frase(12.57)}>fecha.</span>
      </div>
    </AbsoluteFill>
  );
};
