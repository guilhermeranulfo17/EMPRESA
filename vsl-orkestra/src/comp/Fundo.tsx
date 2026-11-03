import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR } from "../tema";

/** Fundo grafite com brilho radial verde, sutil e em movimento lento. */
export const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x1 = 30 + 18 * Math.sin(t * 0.21);
  const y1 = 22 + 10 * Math.cos(t * 0.17);
  const x2 = 75 + 15 * Math.cos(t * 0.13);
  const y2 = 78 + 8 * Math.sin(t * 0.19);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COR.fundo,
        backgroundImage: [
          `radial-gradient(circle at ${x1}% ${y1}%, rgba(178,247,89,0.13) 0%, rgba(178,247,89,0.04) 28%, rgba(12,12,12,0) 55%)`,
          `radial-gradient(circle at ${x2}% ${y2}%, rgba(178,247,89,0.08) 0%, rgba(12,12,12,0) 45%)`,
        ].join(","),
      }}
    />
  );
};
