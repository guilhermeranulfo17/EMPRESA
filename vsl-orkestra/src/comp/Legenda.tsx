import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import legenda from "../../public/audio/legenda.json";
import { COR, FPS, MANROPE } from "../tema";

type Palavra = { text: string; startMs: number; endMs: number };

/** Agrupa as palavras em páginas curtas: quebra nas pausas, nos pontos, nas vírgulas e a cada ~34 caracteres. */
function paginar(palavras: Palavra[]) {
  const paginas: Palavra[][] = [];
  let atual: Palavra[] = [];
  let chars = 0;
  palavras.forEach((p, i) => {
    const anterior = palavras[i - 1];
    const pausa = anterior ? p.startMs - anterior.endMs : 0;
    const quebraPontuacao = anterior ? /[.?:!]$|\.\.\.$/.test(anterior.text) : false;
    const virgula = anterior ? /,$/.test(anterior.text) && chars > 14 : false;
    if (atual.length && (pausa > 260 || quebraPontuacao || virgula || chars + p.text.length > 34)) {
      paginas.push(atual);
      atual = [];
      chars = 0;
    }
    atual.push(p);
    chars += p.text.length + 1;
  });
  if (atual.length) paginas.push(atual);
  return paginas;
}

const PAGINAS = paginar(legenda as Palavra[]);

const limpar = (s: string) => s.replace(/\.\.\.$/, "").replace(/[.,:;]$/, "").replace(/'/g, "");

/** Legenda palavra por palavra no terço inferior (fora dos 320px da base). */
export const Legenda: React.FC<{ esconderDe?: number }> = ({ esconderDe }) => {
  const frame = useCurrentFrame();
  const ms = (frame / FPS) * 1000;
  if (esconderDe !== undefined && ms >= esconderDe * 1000) return null;
  const pagina = PAGINAS.find(
    (pg) => ms >= pg[0].startMs - 60 && ms <= pg[pg.length - 1].endMs + 260,
  );
  if (!pagina) return null;
  const ini = pagina[0].startMs - 60;
  const fim = pagina[pagina.length - 1].endMs + 260;
  const op = interpolate(ms, [ini, ini + 90, fim - 120, fim], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sobe = interpolate(ms, [ini, ini + 160], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1392,
          display: "flex",
          justifyContent: "center",
          opacity: op,
          translate: `0px ${sobe}px`,
        }}
      >
        <div
          style={{
            fontFamily: MANROPE,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.25,
            textAlign: "center",
            padding: "16px 30px",
            borderRadius: 26,
            backgroundColor: "rgba(12,12,12,0.78)",
            border: "1px solid rgba(255,255,255,0.06)",
            maxWidth: 920,
          }}
        >
          {pagina.map((p, i) => {
            const falando = ms >= p.startMs && ms < (pagina[i + 1]?.startMs ?? p.endMs + 200);
            const dito = ms >= p.startMs;
            return (
              <span
                key={i}
                style={{
                  color: falando ? COR.limao : COR.texto,
                  opacity: dito ? 1 : 0.42,
                }}
              >
                {limpar(p.text)}
                {i < pagina.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
