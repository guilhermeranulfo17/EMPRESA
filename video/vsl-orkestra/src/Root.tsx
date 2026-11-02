import { Composition } from 'remotion';
import { carregarFontes, FPS } from './base/marca';
import { duracaoTotalFrames } from './base/tempos';
import { VSL, type PropsVSL } from './VSL';

carregarFontes();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="VSL"
    component={VSL}
    durationInFrames={duracaoTotalFrames()}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ comAudio: false, comLegenda: true } satisfies PropsVSL}
  />
);
