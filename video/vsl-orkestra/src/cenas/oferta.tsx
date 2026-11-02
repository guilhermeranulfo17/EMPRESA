import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COR, FONTE, saidaDaCena, surgir } from '../base/marca';
import type { PropsCena } from './tipos';

/** Oferta com reversão de risco: teste grátis, sem cartão, cancela quando quiser. */
export const Oferta: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  const [f0 = 0, f1 = 60, f2 = 90] = frases;
  const itens: [string, number][] = [
    ['De graça e sem cartão', f0 + 30],
    ['Gostou, escolhe o plano', f1],
    ['Não gostou, cancela quando quiser', f2],
  ];
  return (
    <AbsoluteFill style={{ opacity: saidaDaCena(frame, duracao), justifyContent: 'center', alignItems: 'center', paddingBottom: 140, fontFamily: FONTE }}>
      <div style={{ ...surgir(frame, f0, 60, 22), color: COR.limao, fontSize: 200, fontWeight: 800, letterSpacing: -8, lineHeight: 1 }}>
        14 dias
      </div>
      <div style={{ ...surgir(frame, f0 + 8), color: COR.texto, fontSize: 72, fontWeight: 800, letterSpacing: -2, marginTop: 8 }}>
        para testar tudo isso
      </div>
      <div style={{ display: 'flex', gap: 22, marginTop: 56 }}>
        {itens.map(([t, de]) => (
          <div
            key={t}
            style={{
              ...surgir(frame, de, 24, 12),
              padding: '18px 30px',
              borderRadius: 999,
              border: `1px solid ${COR.borda}`,
              background: COR.cartao,
              color: COR.texto,
              fontSize: 34,
              fontWeight: 600,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <span style={{ color: COR.limao, fontWeight: 800 }}>✓</span>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
