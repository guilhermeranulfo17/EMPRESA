import { AbsoluteFill, useCurrentFrame } from 'remotion';
import tempos from '../tempos.json';
import { COR, FONTE, FPS } from './marca';

/** Legenda da frase falada agora (embaixo, fora da área das cenas). */
export const Legenda: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const frase = tempos.frases.find((f) => t >= f.inicio && t < f.fim + 0.25);
  if (!frase) return null;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 56 }}>
      <div
        style={{
          maxWidth: 1500,
          padding: '14px 28px',
          borderRadius: 18,
          background: 'rgba(0,0,0,0.62)',
          color: COR.texto,
          fontFamily: FONTE,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {frase.texto}
      </div>
    </AbsoluteFill>
  );
};
