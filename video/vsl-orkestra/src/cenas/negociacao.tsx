import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COR, FONTE, entrada, saidaDaCena, surgir } from '../base/marca';
import { SeloExemplo } from '../base/selo';
import type { PropsCena } from './tipos';

const chip = (cor: string) => ({
  padding: '6px 16px',
  borderRadius: 999,
  fontSize: 24,
  fontWeight: 600,
  color: cor,
  border: `1px solid ${cor}55`,
  background: `${cor}1A`,
});

/** Mecanismo 2: o contato chega com o que o cliente escolheu; proposta aberta; próximo passo. */
export const Negociacao: React.FC<PropsCena> = ({ duracao, frases }) => {
  const frame = useCurrentFrame();
  const [f0 = 0, f1 = 50, f2 = 100, f3 = 150] = frases;
  const brilho = entrada(frame, f3, 14);
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
      <div
        style={{
          ...surgir(frame, f0, 60, 22),
          width: 900,
          borderRadius: 36,
          background: '#141414',
          border: `1px solid ${COR.borda}`,
          padding: 44,
          color: COR.texto,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 46, fontWeight: 800 }}>Ana</span>
          <span style={chip(COR.info)}>Proposta enviada</span>
          <span style={{ ...chip(COR.quente), opacity: entrada(frame, f1 + 10) }}>Quente</span>
        </div>
        <div style={{ color: COR.suave, fontSize: 28, marginTop: 10 }}>
          Aniversário infantil · 05/12 · Tarde · 70 pessoas · R$ 7.750,00
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
          <span style={{ ...surgir(frame, f0 + 15, 16, 12), background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 20px', fontSize: 26 }}>
            Responsável: Bia
          </span>
          <span style={{ ...surgir(frame, f1, 16, 12), background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '12px 20px', fontSize: 26 }}>
            Proposta aberta 3 vezes
          </span>
        </div>
        <div
          style={{
            ...surgir(frame, f2, 30),
            marginTop: 28,
            borderRadius: 28,
            border: '1px solid rgba(178,247,89,0.35)',
            background: 'rgba(178,247,89,0.06)',
            padding: 28,
          }}
        >
          <div style={{ color: COR.limao, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>PRÓXIMO PASSO · HOJE</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>Chamar Ana: recebeu a proposta e não respondeu</div>
          <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.35)', borderRadius: 18, padding: 18, fontSize: 25, lineHeight: 1.4, color: 'rgba(244,244,242,0.85)' }}>
            Oi, Ana! Vi que você abriu a proposta do Buffet Exemplo para o dia 05/12. Ficou alguma dúvida? Se quiser, já seguro a data para você.
          </div>
          <div
            style={{
              marginTop: 18,
              display: 'inline-block',
              background: COR.limao,
              color: '#0C0C0C',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: 28,
              fontWeight: 800,
              boxShadow: `0 0 ${60 * brilho}px ${10 * brilho}px rgba(178,247,89,${0.45 * brilho})`,
              scale: String(1 + 0.06 * brilho),
            }}
          >
            Abrir no WhatsApp
          </div>
        </div>
      </div>
      <div style={{ flex: 1, ...surgir(frame, f3), color: COR.texto, fontSize: 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
        Quem envia <span style={{ color: COR.limao }}>é você.</span>
      </div>
    </AbsoluteFill>
  );
};
