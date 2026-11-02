import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COR, FONTE, entrada, saidaDaCena, surgir } from '../base/marca';
import type { PropsCena } from './tipos';

/** Virada: o problema não é falta de cliente, é falta de caminho até a festa fechada. */
export const Virada: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  const de = frases[1] ?? 40;
  const linha = entrada(frame, de + 8, 30);
  return (
    <AbsoluteFill
      style={{
        opacity: saidaDaCena(frame, duracao),
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 140,
        fontFamily: FONTE,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          ...surgir(frame, 0),
          color: COR.suave,
          fontWeight: 800,
          fontSize: 84,
          letterSpacing: -2,
          textDecoration: interpolate(frame, [de - 6, de], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) > 0.5 ? 'line-through' : 'none',
          textDecorationColor: COR.erro,
        }}
      >
        Não é falta de cliente.
      </div>
      <div style={{ ...surgir(frame, de), color: COR.texto, fontWeight: 800, fontSize: 104, letterSpacing: -3, marginTop: 30 }}>
        É falta de <span style={{ color: COR.limao }}>caminho.</span>
      </div>
      <div style={{ ...surgir(frame, de + 6), display: 'flex', alignItems: 'center', gap: 28, marginTop: 60, fontSize: 44, fontWeight: 600, color: COR.texto }}>
        <span>Orçamento</span>
        <div style={{ width: 520, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${linha * 100}%`, height: '100%', background: COR.limao }} />
        </div>
        <span style={{ color: linha > 0.95 ? COR.limao : COR.texto }}>Festa fechada</span>
      </div>
    </AbsoluteFill>
  );
};
