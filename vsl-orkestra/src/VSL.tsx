import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { Fundo } from "./comp/Fundo";
import { Legenda } from "./comp/Legenda";
import { Conversa } from "./comp/Conversa";
import { CardTela, type DadosCard } from "./comp/CardTela";
import { Gancho } from "./cenas/Gancho";
import { Dor } from "./cenas/Dor";
import { Mecanismo } from "./cenas/Mecanismo";
import { Oferta } from "./cenas/Oferta";
import { f, FPS, roteiro } from "./tema";

export const esquemaVSL = z.object({
  buffetName: z.string(),
});

const C = roteiro.cenas;
const faixa = ([de, ate]: number[]) => ({ from: f(de), durationInFrames: f(ate) - f(de) });

const CamadaConversa: React.FC = () => {
  const frame = useCurrentFrame();
  return <Conversa t={3.75 + frame / FPS} entra={3.75} digitando={4.25} mensagem={5.8} resposta={8.75} sai={9.95} />;
};

export const VSL: React.FC<z.infer<typeof esquemaVSL>> = ({ buffetName }) => {
  return (
    <AbsoluteFill>
      <Fundo />
      <Audio src={staticFile("audio/mix.wav")} />

      <Sequence name="Gancho" {...faixa(C.gancho)}>
        <Gancho buffetName={buffetName} />
      </Sequence>
      <Sequence name="Conversa" from={f(3.75)} durationInFrames={f(10.4) - f(3.75)}>
        <CamadaConversa />
      </Sequence>
      <Sequence name="Dor" {...faixa(C.dor)}>
        <Dor inicio={C.dor[0]} />
      </Sequence>
      <Sequence name="Mecanismo" {...faixa(C.mecanismo)}>
        <Mecanismo inicio={C.mecanismo[0]} />
      </Sequence>
      <Sequence name="Demo do cliente" {...faixa(C.demo)}>
        <CardTela
          dados={roteiro.demo as DadosCard}
          inicio={C.demo[0]}
          entrada={{ at: C.demo[0], de: "baixo" }}
          saida={{ at: 35.95, para: "esquerda" }}
        />
      </Sequence>
      <Sequence name="Painel" {...faixa(C.painel)}>
        <CardTela
          dados={roteiro.painel as DadosCard}
          inicio={C.painel[0]}
          entrada={{ at: C.painel[0], de: "direita" }}
          saida={{ at: 44.95, para: "encolhe" }}
        />
      </Sequence>
      <Sequence name="Oferta" {...faixa(C.oferta)}>
        <Oferta inicio={C.oferta[0]} buffetName={buffetName} />
      </Sequence>

      <Legenda esconderDe={52.9} />
    </AbsoluteFill>
  );
};
