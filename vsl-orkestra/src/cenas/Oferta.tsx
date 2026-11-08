import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { COR, FPS, MANROPE } from "../tema";
import { Logo } from "../comp/Logo";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sai = Easing.bezier(0.16, 1, 0.3, 1);

const aparece = (t: number, de: number) => ({
  display: "inline-block" as const,
  opacity: interpolate(t, [de, de + 0.22], [0, 1], lim),
  translate: `0px ${interpolate(t, [de, de + 0.4], [36, 0], { ...lim, easing: sai })}px`,
});

/** Tempos da frase final v2 (public/audio/legenda.json): "Me responde 'quero' aqui que eu libero
 *  duas semanas de cortesia pro seu buffet. Sem cartão, já com os seus pacotes." */
const T = {
  cta: 44.85,
  digita: 45.45,
  envia: 45.95,
  duas: 46.87,
  cortesia: 47.64,
  pro: 48.11,
  semCartao: 49.45,
  pacotes: 50.59,
  fimTexto: 51.95,
  logo: 52.15,
};

/** Cena 6 (44,6 s ao fim): o pedido "Responde QUERO aqui", as duas semanas de cortesia e o logo. */
export const Oferta: React.FC<{ inicio: number; buffetName: string }> = ({ inicio, buffetName }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  const fimTexto = interpolate(t, [T.fimTexto, T.fimTexto + 0.4], [0, 1], {
    ...lim,
    easing: Easing.bezier(0.5, 0, 0.75, 0),
  });
  const cta = spring({ frame: Math.round((t - T.cta) * FPS), fps: FPS, config: { damping: 13, stiffness: 140 } });
  const digitado = "QUERO".slice(0, Math.max(0, Math.min(5, Math.floor((t - T.digita) / 0.07))));
  const enviado = t >= T.envia;
  const logo = spring({ frame: Math.round((t - T.logo) * FPS), fps: FPS, config: { damping: 14, stiffness: 110 } });

  return (
    <AbsoluteFill style={{ fontFamily: MANROPE, color: COR.texto }}>
      <div style={{ opacity: 1 - fimTexto }}>
        <div
          style={{
            position: "absolute",
            top: 300,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
            opacity: Math.min(1, cta * 1.3),
            scale: `${0.9 + 0.1 * cta}`,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, lineHeight: 1, marginBottom: -10 }}>
            Responde
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2, display: "flex", alignItems: "center", gap: 26 }}>
            <span
              style={{
                backgroundColor: COR.limao,
                color: COR.fundo,
                borderRadius: 26,
                padding: "4px 32px 10px",
              }}
            >
              QUERO
            </span>
            aqui
          </div>
          <div
            style={{
              position: "relative",
              width: 820,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "20px 24px 20px 40px",
              borderRadius: 999,
              backgroundColor: COR.card,
              border: `2px solid ${COR.borda}`,
            }}
          >
            <div style={{ flex: 1, fontSize: 44, fontWeight: 700, color: enviado || !digitado ? COR.texto2 : COR.texto }}>
              {enviado ? "Mensagem" : digitado || "Mensagem"}
              {!enviado && digitado && Math.floor(t * 4) % 2 === 0 ? (
                <span style={{ color: COR.limao }}>|</span>
              ) : null}
            </div>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 999,
                backgroundColor: COR.limao,
                display: "grid",
                placeItems: "center",
                scale: `${enviado ? interpolate(t, [T.envia, T.envia + 0.1, T.envia + 0.25], [1, 0.84, 1], lim) : 1}`,
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24">
                <path d="M3 11.5 20.5 4l-7.5 17.5-2.2-7.8z" fill={COR.fundo} />
              </svg>
            </div>
            {enviado ? (
              <div
                style={{
                  position: "absolute",
                  right: 40,
                  top: "calc(100% + 14px)",
                  backgroundColor: "#1F3312",
                  border: "1px solid rgba(178,247,89,0.25)",
                  borderRadius: 26,
                  borderTopRightRadius: 8,
                  padding: "12px 26px",
                  fontSize: 40,
                  fontWeight: 800,
                  opacity: interpolate(t, [T.envia, T.envia + 0.2], [0, 1], lim),
                  translate: `0px ${interpolate(t, [T.envia, T.envia + 0.35], [-40, 0], { ...lim, easing: sai })}px`,
                }}
              >
                QUERO <span style={{ color: COR.limao, fontSize: 30 }}>✓✓</span>
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 855,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          <span style={{ ...aparece(t, T.duas), color: COR.limao }}>
            2 semanas
          </span>
          <br />
          <span style={aparece(t, T.cortesia)}>de cortesia</span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 1085,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 54,
            fontWeight: 700,
            color: COR.texto2,
          }}
        >
          <span style={aparece(t, T.pro)}>
            pro <span style={{ color: COR.texto }}>{buffetName}</span>
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            top: 1172,
            left: 80,
            right: 80,
            textAlign: "center",
            fontSize: 46,
            fontWeight: 700,
            color: COR.texto,
          }}
        >
          <span style={aparece(t, T.semCartao)}>sem cartão</span>
          <br />
          <span style={{ ...aparece(t, T.pacotes), color: COR.texto2, fontSize: 42 }}>já com os seus pacotes</span>
        </div>
      </div>

      {/* cartão final: a versão limão do logo (fundo limão, nome em preto) */}
      <AbsoluteFill
        style={{
          backgroundColor: COR.limao,
          clipPath: `circle(${interpolate(t, [T.logo, T.logo + 0.6], [0, 120], { ...lim, easing: Easing.bezier(0.65, 0, 0.35, 1) })}% at 50% 50%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: interpolate(t, [T.logo + 0.3, T.logo + 0.6], [0, 1], lim),
            scale: `${0.92 + 0.08 * logo}`,
          }}
        >
          <Logo largura={760} cor="preto" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
