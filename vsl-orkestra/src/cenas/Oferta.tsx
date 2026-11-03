import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";
import { Logotipo, Simbolo } from "../comp/Logo";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

const aparece = (t: number, de: number) => ({
  display: "inline-block" as const,
  opacity: interpolate(t, [de, de + 0.22], [0, 1], lim),
  translate: `0px ${interpolate(t, [de, de + 0.4], [36, 0], { ...lim, easing: sai })}px`,
});

/** Cena 6 (45 s ao fim): a oferta, o pedido "Responde QUERO aqui" e o logo. */
export const Oferta: React.FC<{ inicio: number; buffetName: string }> = ({ inicio, buffetName }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  const fimTexto = interpolate(t, [52.75, 53.15], [0, 1], { ...lim, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const cta = spring({ frame: Math.round((t - 49.45) * FPS), fps: FPS, config: { damping: 13, stiffness: 140 } });
  const digitado = "QUERO".slice(0, Math.max(0, Math.min(5, Math.floor((t - 49.55) / 0.07))));
  const enviado = t >= 49.95;
  const logo = spring({ frame: Math.round((t - 52.95) * FPS), fps: FPS, config: { damping: 14, stiffness: 110 } });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto }}>
      <div style={{ opacity: 1 - fimTexto }}>
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: -2,
          }}
        >
          <span style={aparece(t, 45.4)}>
            <span style={{ color: COR.limao }}>14 dias</span> grátis
          </span>{" "}
          <span style={{ ...aparece(t, 46.85), color: COR.texto2 }}>·</span>{" "}
          <span style={aparece(t, 46.85)}>sem cartão</span>
          <br />
          <span style={{ ...aparece(t, 47.55), fontSize: 64, color: COR.texto2, fontWeight: 700 }}>
            com os seus pacotes
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 640,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            opacity: Math.min(1, cta * 1.3),
            scale: `${0.9 + 0.1 * cta}`,
          }}
        >
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2, lineHeight: 1, marginBottom: -12 }}>
            Responde
          </div>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -2, display: "flex", alignItems: "center", gap: 28 }}>
            <span
              style={{
                backgroundColor: COR.limao,
                color: COR.fundo,
                borderRadius: 28,
                padding: "6px 34px 12px",
                boxShadow: `0 0 ${70 * cta}px rgba(178,247,89,0.4)`,
              }}
            >
              QUERO
            </span>
            aqui
          </div>
          <div
            style={{
              width: 820,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "22px 26px 22px 40px",
              borderRadius: 999,
              backgroundColor: COR.card,
              border: `2px solid ${COR.borda}`,
            }}
          >
            <div style={{ flex: 1, fontSize: 46, fontWeight: 700, color: enviado ? COR.texto2 : COR.texto }}>
              {enviado ? "Mensagem" : digitado || "Mensagem"}
              {!enviado && digitado && Math.floor(t * 4) % 2 === 0 ? (
                <span style={{ color: COR.limao }}>|</span>
              ) : null}
            </div>
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 999,
                backgroundColor: COR.limao,
                display: "grid",
                placeItems: "center",
                scale: `${enviado ? interpolate(t, [49.95, 50.05, 50.2], [1, 0.84, 1], lim) : 1}`,
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24">
                <path d="M3 11.5 20.5 4l-7.5 17.5-2.2-7.8z" fill={COR.fundo} />
              </svg>
            </div>
          </div>
          {enviado ? (
            <div
              style={{
                alignSelf: "flex-end",
                marginRight: 130,
                marginTop: -10,
                backgroundColor: "#1F3312",
                border: "1px solid rgba(178,247,89,0.25)",
                borderRadius: 30,
                borderTopRightRadius: 8,
                padding: "18px 30px",
                fontSize: 46,
                fontWeight: 800,
                opacity: interpolate(t, [49.95, 50.15], [0, 1], lim),
                translate: `0px ${interpolate(t, [49.95, 50.3], [-60, 0], { ...lim, easing: sai })}px`,
              }}
            >
              QUERO
            </div>
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            top: 1262,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 48,
            fontWeight: 700,
            color: COR.texto2,
            ...aparece(t, 51.0),
            display: "block",
          }}
        >
          e eu monto a página do <span style={{ color: COR.texto }}>{buffetName}</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 640,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 54,
          opacity: Math.min(1, logo * 1.2),
          scale: `${0.86 + 0.14 * logo}`,
        }}
      >
        <div style={{ filter: "drop-shadow(0 0 60px rgba(178,247,89,0.35))" }}>
          <Simbolo tamanho={220} />
        </div>
        <Logotipo largura={680} />
      </div>
    </AbsoluteFill>
  );
};
