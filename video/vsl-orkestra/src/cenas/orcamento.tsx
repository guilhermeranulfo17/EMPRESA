import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COR, FONTE, brl, entrada, saidaDaCena, surgir } from '../base/marca';
import { SeloExemplo } from '../base/selo';
import type { PropsCena } from './tipos';

const LINHAS = [
  ['Pacote Super · 65 convidados equivalentes', 650000],
  ['Ajuste de sábado (+10%)', 65000],
  ['Mesa temática', 60000],
] as const;
const REGRAS = ['Dia da semana', 'Turno', 'Idade das crianças', 'Adicionais'];

/** Mecanismo 1: o cliente monta o orçamento no link do buffet e vê o valor com as regras dele. */
export const Orcamento: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  const segunda = frases[1] ?? 90;
  const total = interpolate(frame, [segunda, segunda + 45], [0, 775000], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        opacity: saidaDaCena(frame, duracao),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 90,
        padding: '0 140px 140px',
        fontFamily: FONTE,
      }}
    >
      <SeloExemplo />
      <div style={{ flex: 1 }}>
        <div style={{ ...surgir(frame, 0), color: COR.limao, fontWeight: 800, fontSize: 40, letterSpacing: 2 }}>
          COM O ORKESTRA
        </div>
        <div style={{ ...surgir(frame, 6), color: COR.texto, fontWeight: 800, fontSize: 84, lineHeight: 1.05, letterSpacing: -2, marginTop: 20 }}>
          O cliente monta o orçamento <span style={{ color: COR.limao }}>sozinho</span>, no seu link.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 44 }}>
          {REGRAS.map((r, i) => (
            <span
              key={r}
              style={{
                ...surgir(frame, segunda + 20 + i * 10, 20, 12),
                padding: '12px 24px',
                borderRadius: 999,
                background: 'rgba(178,247,89,0.12)',
                border: '1px solid rgba(178,247,89,0.35)',
                color: COR.limao,
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          ...surgir(frame, 10, 60, 24),
          width: 640,
          borderRadius: 40,
          background: COR.claro,
          color: COR.tinta,
          padding: 40,
          boxShadow: '0 50px 120px -40px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, color: '#565A52' }}>Aniversário infantil</div>
        <div style={{ fontSize: 34, fontWeight: 800, marginTop: 4 }}>Sábado, 05/12 · Tarde</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, fontSize: 22, fontWeight: 600 }}>
          <span style={{ background: 'rgba(15,118,110,0.1)', color: COR.buffet, padding: '6px 14px', borderRadius: 999 }}>60 adultos</span>
          <span style={{ background: 'rgba(15,118,110,0.1)', color: COR.buffet, padding: '6px 14px', borderRadius: 999 }}>10 crianças (pagam 50%)</span>
        </div>
        <div style={{ marginTop: 22 }}>
          {LINHAS.map(([a, v], i) => (
            <div
              key={a}
              style={{
                ...surgir(frame, segunda + i * 8, 16, 12),
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                padding: '12px 0',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                fontSize: 24,
              }}
            >
              <span style={{ color: '#3D3F3A' }}>{a}</span>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{brl(v)}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 24, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 22, color: '#565A52', fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>{brl(Math.round(total / 100) * 100)}</div>
          </div>
          <div style={{ opacity: entrada(frame, segunda + 45), textAlign: 'right', fontSize: 22, color: '#565A52' }}>
            Sinal de 30%
            <div style={{ fontSize: 28, fontWeight: 800, color: COR.tinta }}>{brl(232500)}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, background: COR.buffet, color: '#fff', borderRadius: 999, padding: '16px 0', textAlign: 'center', fontSize: 28, fontWeight: 800 }}>
          Pedir pré-reserva
        </div>
      </div>
    </AbsoluteFill>
  );
};
