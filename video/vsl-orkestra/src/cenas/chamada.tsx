import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { COR, FONTE, entrada, surgir } from '../base/marca';
import type { PropsCena } from './tipos';

/** Chamada final: logotipo, o botão e o endereço. */
export const Chamada: React.FC<PropsCena> = () => {
  const frame = useCurrentFrame();
  const pulso = 1 + 0.03 * Math.sin(frame / 6) * entrada(frame, 20);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 140, fontFamily: FONTE, gap: 56 }}>
      <Img src={staticFile('marca/logotipo-claro.svg')} style={{ ...surgir(frame, 0), width: 760 }} />
      <div
        style={{
          ...surgir(frame, 8),
          background: COR.limao,
          color: '#0C0C0C',
          borderRadius: 999,
          padding: '30px 72px',
          fontSize: 56,
          fontWeight: 800,
          scale: String(pulso),
          boxShadow: '0 0 80px -10px rgba(178,247,89,0.6)',
        }}
      >
        Testar 14 dias grátis
      </div>
      <div style={{ ...surgir(frame, 16), color: COR.texto, fontSize: 40, fontWeight: 600 }}>
        sistemaorkestra.com.br
      </div>
    </AbsoluteFill>
  );
};
