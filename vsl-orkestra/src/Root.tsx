import { Composition, Still } from "remotion";
import { VSL, esquemaVSL } from "./VSL";
import { DURACAO_V2, FPS2, H2, VendasV2, W2 } from "./v2/VendasV2";
import { f, H, roteiro, W } from "./tema";
import {
  capitulosOnboarding,
  duracaoCapitulo,
  duracaoCompleto,
  H_ON,
  OnboardingCapitulo,
  OnboardingCompleto,
  W_ON,
} from "./onboarding/Onboarding";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OrkestraVSL"
        component={VSL}
        schema={esquemaVSL}
        defaultProps={{ buffetName: "seu buffet" }}
        durationInFrames={f(roteiro.duracao)}
        fps={roteiro.fps}
        width={W}
        height={H}
      />
      <Composition id="OrkestraVendasV2" component={VendasV2} durationInFrames={DURACAO_V2} fps={FPS2} width={W2} height={H2} />
      <Still id="Capa" component={VSL} schema={esquemaVSL} defaultProps={{ buffetName: "seu buffet" }} width={W} height={H} />

      {/* Onboarding (horizontal): um vídeo por parte e o completo */}
      {capitulosOnboarding.map((c) => (
        <Composition
          key={c.id}
          id={`Onboarding-${c.numero + 1}-${c.id}`}
          component={OnboardingCapitulo}
          defaultProps={{ capId: c.id }}
          durationInFrames={f(duracaoCapitulo(c.id))}
          fps={roteiro.fps}
          width={W_ON}
          height={H_ON}
        />
      ))}
      <Composition
        id="Onboarding-completo"
        component={OnboardingCompleto}
        durationInFrames={duracaoCompleto()}
        fps={roteiro.fps}
        width={W_ON}
        height={H_ON}
      />
    </>
  );
};
