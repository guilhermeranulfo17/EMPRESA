import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COR } from './marca';

/** Grafite com grade discreta e um brilho limão que se move devagar. */
export const Fundo: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 2500], [20, 80]);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% 30%, rgba(178,247,89,0.16), transparent 45%)`,
        }}
      />
    </AbsoluteFill>
  );
};
