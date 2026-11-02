import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, staticFile } from 'remotion';
import { Fundo } from './base/fundo';
import { Legenda } from './base/legenda';
import { cenas } from './base/tempos';
import { Agitacao } from './cenas/agitacao';
import { Chamada } from './cenas/chamada';
import { Fechamento } from './cenas/fechamento';
import { Gancho } from './cenas/gancho';
import { Negociacao } from './cenas/negociacao';
import { Oferta } from './cenas/oferta';
import { Orcamento } from './cenas/orcamento';
import type { PropsCena } from './cenas/tipos';
import { Virada } from './cenas/virada';

const COMPONENTES: Record<string, React.FC<PropsCena>> = {
  gancho: Gancho,
  agitacao: Agitacao,
  virada: Virada,
  orcamento: Orcamento,
  negociacao: Negociacao,
  fechamento: Fechamento,
  oferta: Oferta,
  chamada: Chamada,
};

export type PropsVSL = { comAudio: boolean; comLegenda: boolean };

/** A VSL: fundo, as 8 cenas no tempo da narração, legenda e a narração da ElevenLabs. */
export const VSL: React.FC<PropsVSL> = ({ comAudio, comLegenda }) => (
  <AbsoluteFill>
    <Fundo />
    {cenas().map((c) => {
      const Cena = COMPONENTES[c.id]!;
      return (
        <Sequence key={c.id} name={c.id} from={c.inicioFrame} durationInFrames={c.duracaoFrames}>
          <Cena duracao={c.duracaoFrames} frases={c.frases} />
        </Sequence>
      );
    })}
    {comLegenda && <Legenda />}
    {comAudio && <Audio src={staticFile('audio/narracao.mp3')} />}
  </AbsoluteFill>
);
