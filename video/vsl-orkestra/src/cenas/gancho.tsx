import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COR, FONTE, saidaDaCena, surgir } from '../base/marca';
import type { PropsCena } from './tipos';

const PERGUNTAS = ['Quanto fica pra 60 pessoas?', 'E no sábado?', 'E com a mesa temática?'];

/** Gancho: chama o dono de buffet pela dor (a mesma conta, de novo, no WhatsApp). */
export const Gancho: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: saidaDaCena(frame, duracao),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 90,
        padding: '0 140px 120px',
        fontFamily: FONTE,
      }}
    >
      <div style={{ flex: 1.2 }}>
        <div style={{ ...surgir(frame, 0), color: COR.limao, fontWeight: 800, fontSize: 44, letterSpacing: 2 }}>
          DONO DE BUFFET:
        </div>
        <div
          style={{
            ...surgir(frame, 6),
            color: COR.texto,
            fontWeight: 800,
            fontSize: 92,
            lineHeight: 1.04,
            letterSpacing: -2,
            marginTop: 24,
          }}
        >
          Quantas vezes hoje você respondeu{' '}
          <span style={{ color: COR.limao }}>a mesma pergunta?</span>
        </div>
      </div>
      <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {PERGUNTAS.map((p, i) => (
          <div
            key={p}
            style={{
              ...surgir(frame, frases[i + 1] ?? 0, 30, 12),
              alignSelf: 'flex-start',
              maxWidth: 620,
              padding: '22px 30px',
              borderRadius: '28px 28px 28px 8px',
              background: COR.cartao2,
              border: `1px solid ${COR.borda}`,
              color: COR.texto,
              fontSize: 46,
              fontWeight: 600,
            }}
          >
            {p}
            <div style={{ color: COR.suave, fontSize: 22, marginTop: 6, textAlign: 'right' }}>
              WhatsApp · agora
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
