import { Composition, Still } from "remotion";
import { VSL, esquemaVSL } from "./VSL";
import { f, H, roteiro, W } from "./tema";

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
      <Still id="Capa" component={VSL} schema={esquemaVSL} defaultProps={{ buffetName: "seu buffet" }} width={W} height={H} />
    </>
  );
};
