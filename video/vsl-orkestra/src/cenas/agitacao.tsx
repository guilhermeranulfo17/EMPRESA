import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COR, FONTE, saidaDaCena, surgir } from '../base/marca';
import type { PropsCena } from './tipos';

const DORES = [
  { titulo: 'Conta feita na mão', texto: 'pacote × convidados + sábado + adicional…' },
  { titulo: 'O cliente pergunta em outro buffet', texto: 'enquanto você calcula' },
  { titulo: 'Proposta sem retorno', texto: 'enviada e esquecida na conversa' },
  { titulo: 'Tudo espalhado', texto: 'data no caderno, contrato na pasta, sinal no extrato' },
];

/** Agitação: o custo de fazer tudo na mão, em quatro cartões que entram com a fala. */
export const Agitacao: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: saidaDaCena(frame, duracao),
        justifyContent: 'center',
        padding: '0 140px 150px',
        fontFamily: FONTE,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {DORES.map((d, i) => (
          <div
            key={d.titulo}
            style={{
              ...surgir(frame, frases[i] ?? 0),
              padding: '34px 38px',
              borderRadius: 28,
              background: COR.cartao,
              border: `1px solid ${COR.borda}`,
              display: 'flex',
              gap: 26,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 999,
                background: 'rgba(251,113,133,0.12)',
                border: '1px solid rgba(251,113,133,0.35)',
                color: COR.erro,
                display: 'grid',
                placeItems: 'center',
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              ×
            </div>
            <div>
              <div style={{ color: COR.texto, fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>{d.titulo}</div>
              <div style={{ color: COR.suave, fontSize: 32, marginTop: 10 }}>{d.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
