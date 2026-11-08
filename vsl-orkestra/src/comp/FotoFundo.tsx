import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../tema";

const lim = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Foto real de fundo: desfocada como em lente aberta, escurecida, com um avanço lento de câmera. */
export const FotoFundo: React.FC<{
  src: string;
  /** segundo absoluto em que a Sequence começa e a duração do movimento */
  inicio: number;
  dur: number;
  desfoque?: number;
  brilho?: number;
  saturacao?: number;
  posicao?: string;
  zoom?: [number, number];
  /** gradiente por cima (para o texto respirar) */
  sombra?: string;
}> = ({ src, inicio, dur, desfoque = 8, brilho = 0.5, saturacao = 1, posicao = "50% 50%", zoom = [1.12, 1.02], sombra }) => {
  const frame = useCurrentFrame();
  const t = inicio + frame / FPS;
  const escala = interpolate(t, [inicio, inicio + dur], zoom, lim);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0C0C0C" }}>
      <Img
        src={staticFile(`fotos/${src}`)}
        style={{
          position: "absolute",
          inset: -40,
          width: "calc(100% + 80px)",
          height: "calc(100% + 80px)",
          objectFit: "cover",
          objectPosition: posicao,
          scale: `${escala}`,
          filter: `blur(${desfoque}px) brightness(${brilho}) saturate(${saturacao})`,
        }}
      />
      {sombra ? <AbsoluteFill style={{ background: sombra }} /> : null}
    </AbsoluteFill>
  );
};
