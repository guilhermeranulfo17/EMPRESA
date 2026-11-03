import { Easing, interpolate, spring } from "remotion";
import { COR, FPS, MANROPE } from "../tema";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Bolha: React.FC<{
  t: number;
  at: number;
  lado: "in" | "out";
  hora: string;
  children: React.ReactNode;
}> = ({ t, at, lado, hora, children }) => {
  const s = spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping: 15, stiffness: 160 } });
  if (t < at) return null;
  return (
    <div
      style={{
        alignSelf: lado === "in" ? "flex-start" : "flex-end",
        maxWidth: 640,
        backgroundColor: lado === "in" ? "#262626" : "#1F3312",
        border: `1px solid ${lado === "in" ? COR.borda : "rgba(178,247,89,0.25)"}`,
        borderRadius: 30,
        borderTopLeftRadius: lado === "in" ? 8 : 30,
        borderTopRightRadius: lado === "out" ? 8 : 30,
        padding: "22px 28px 14px",
        fontSize: 44,
        lineHeight: 1.3,
        fontWeight: 600,
        color: COR.texto,
        opacity: s,
        scale: `${0.85 + 0.15 * s}`,
        transformOrigin: lado === "in" ? "left top" : "right top",
      }}
    >
      {children}
      <div style={{ fontSize: 26, color: COR.texto2, textAlign: "right", marginTop: 6, fontWeight: 600 }}>
        {hora}
      </div>
    </div>
  );
};

/** Conversa no WhatsApp do buffet (genérica, sem marca de terceiros), com a Mariana. */
export const Conversa: React.FC<{
  t: number;
  entra: number;
  digitando: number;
  mensagem: number;
  resposta?: number;
  sai?: number;
}> = ({ t, entra, digitando, mensagem, resposta, sai: saiEm }) => {
  const s = spring({ frame: Math.round((t - entra) * FPS), fps: FPS, config: { damping: 18, stiffness: 120 } });
  if (t < entra) return null;
  const saida = saiEm ? interpolate(t, [saiEm, saiEm + 0.4], [0, 1], { ...lim, easing: Easing.bezier(0.5, 0, 0.75, 0) }) : 0;
  const status = t >= digitando && t < mensagem ? "digitando…" : "online";
  const divisor = resposta ? interpolate(t, [resposta - 0.5, resposta - 0.25], [0, 1], lim) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: 640,
        width: 880,
        minHeight: 560,
        borderRadius: 48,
        backgroundColor: COR.card,
        border: `2px solid ${COR.borda}`,
        boxShadow: "0 50px 120px rgba(0,0,0,0.6)",
        fontFamily: MANROPE,
        overflow: "hidden",
        opacity: s * (1 - saida),
        translate: `0px ${(1 - s) * 220 - saida * 160}px`,
        scale: `${0.95 + 0.05 * s}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "30px 36px",
          borderBottom: `1px solid ${COR.borda}`,
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 999,
            backgroundColor: "#3A3A38",
            display: "grid",
            placeItems: "center",
            fontSize: 44,
            fontWeight: 800,
            color: COR.texto,
          }}
        >
          M
        </div>
        <div>
          <div style={{ fontSize: 46, fontWeight: 700, color: COR.texto }}>Mariana</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: status === "online" ? COR.texto2 : COR.limao }}>
            {status}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "34px 36px 40px" }}>
        {t >= digitando && t < mensagem ? (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#262626",
              borderRadius: 30,
              borderTopLeftRadius: 8,
              padding: "26px 32px",
              display: "flex",
              gap: 14,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 99,
                  backgroundColor: COR.texto2,
                  opacity: 0.35 + 0.65 * Math.max(0, Math.sin((t * 6 - i * 0.9) % (Math.PI * 2))),
                }}
              />
            ))}
          </div>
        ) : null}
        <Bolha t={t} at={mensagem} lado="in" hora="23:00">
          Oi, boa noite! Quanto fica pra 50 pessoas no sábado?
        </Bolha>
        {resposta ? (
          <>
            <div
              style={{
                alignSelf: "center",
                fontSize: 28,
                fontWeight: 700,
                color: COR.texto2,
                backgroundColor: "#232323",
                padding: "8px 22px",
                borderRadius: 999,
                opacity: divisor,
                letterSpacing: 1,
              }}
            >
              SÁBADO
            </div>
            <Bolha t={t} at={resposta} lado="out" hora="09:40">
              Bom dia, Mariana! Desculpa a demora…
            </Bolha>
          </>
        ) : null}
      </div>
    </div>
  );
};
