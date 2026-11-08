import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Granulado de filme (troca a cada 4 quadros, leve para o WhatsApp não borrar) e vinheta: tiram a cara "limpa demais" de tela digital. */
export const Pelicula: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }}
      />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "soft-light" }}>
        <filter id="grao">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={Math.floor(frame / 4) % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1080" height="1920" filter="url(#grao)" />
      </svg>
    </AbsoluteFill>
  );
};
