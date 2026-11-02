import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COR, FONTE, entrada, saidaDaCena, surgir } from '../base/marca';
import { SeloExemplo } from '../base/selo';
import type { PropsCena } from './tipos';

/** Mecanismo 3: pré-reserva com prazo, contrato do orçamento aceito e o que falta receber. */
export const Fechamento: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  const [f0 = 0, f1 = 150] = frases;
  const passo = (f1 - f0) / 3;
  const reservado = entrada(frame, f0 + passo * 0.6, 10) > 0.5;
  const barra = interpolate(frame, [f0 + passo * 2, f0 + passo * 2 + 30], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const destaque = entrada(frame, f1, 14);
  const tile = {
    flex: 1,
    borderRadius: 32,
    background: COR.cartao,
    border: `1px solid ${COR.borda}`,
    padding: 40,
    color: COR.texto,
  } as const;
  return (
    <AbsoluteFill
      style={{
        opacity: saidaDaCena(frame, duracao),
        justifyContent: 'center',
        padding: '0 140px 150px',
        fontFamily: FONTE,
        gap: 50,
      }}
    >
      <SeloExemplo />
      <div style={{ ...surgir(frame, 0), color: COR.texto, fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>
        Do sim do cliente <span style={{ color: COR.limao }}>ao que falta receber.</span>
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ ...tile, ...surgir(frame, f0 + 4) }}>
          <div style={{ color: COR.suave, fontSize: 26, fontWeight: 600 }}>Agenda</div>
          <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>Sáb, 05/12 · Tarde</div>
          <div style={{ marginTop: 18, display: 'inline-block', padding: '8px 18px', borderRadius: 999, fontSize: 26, fontWeight: 700, color: reservado ? COR.sucesso : COR.alerta, border: `1px solid ${reservado ? COR.sucesso : COR.alerta}55` }}>
            {reservado ? 'Reservado' : 'Pré-reserva: vence em 48 h'}
          </div>
        </div>
        <div style={{ ...tile, ...surgir(frame, f0 + passo) }}>
          <div style={{ color: COR.suave, fontSize: 26, fontWeight: 600 }}>Contrato</div>
          <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>Do orçamento aceito</div>
          <div style={{ marginTop: 18, fontSize: 28, color: COR.sucesso, fontWeight: 700 }}>Aceito pelo cliente</div>
        </div>
        <div style={{ ...tile, ...surgir(frame, f0 + passo * 2), border: `1px solid rgba(178,247,89,${0.1 + 0.4 * destaque})` }}>
          <div style={{ color: COR.suave, fontSize: 26, fontWeight: 600 }}>Pagamentos da festa</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 28 }}>
            <span>Recebido</span>
            <span style={{ fontWeight: 800 }}>R$ 2.325,00</span>
          </div>
          <div style={{ marginTop: 14, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${barra * 100}%`, height: '100%', background: COR.limao }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 30, color: destaque > 0.5 ? COR.limao : COR.texto, fontWeight: 800, scale: String(1 + 0.05 * destaque) }}>
            <span>Falta receber</span>
            <span>R$ 5.425,00</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
