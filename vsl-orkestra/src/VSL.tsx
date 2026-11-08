import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { Fundo } from "./comp/Fundo";
import { FotoFundo } from "./comp/FotoFundo";
import { Pelicula } from "./comp/Pelicula";
import { Abertura } from "./cenas/Abertura";
import { CardTela, type DadosCard } from "./comp/CardTela";
import { Mecanismo } from "./cenas/Mecanismo";
import { Oferta } from "./cenas/Oferta";
import { f, roteiro } from "./tema";

export const esquemaVSL = z.object({
  buffetName: z.string(),
});

const C = roteiro.cenas;
const faixa = ([de, ate]: number[]) => ({ from: f(de), durationInFrames: f(ate) - f(de) });

export const VSL: React.FC<z.infer<typeof esquemaVSL>> = ({ buffetName }) => {
  return (
    <AbsoluteFill>
      <Fundo />
      <Audio src={staticFile("audio/mix.wav")} />

      <Sequence name="Abertura" {...faixa(C.abertura)}>
        <Abertura buffetName={buffetName} />
      </Sequence>
      <Sequence name="Foto do salão" from={f(14.9)} durationInFrames={f(44.9) - f(14.9)}>
        <FotoFundo src="salao.jpg" inicio={14.9} dur={30} desfoque={22} brilho={0.3} saturacao={0.8} zoom={[1.15, 1.0]} />
      </Sequence>
      <Sequence name="Foto dos balões" from={f(44.5)} durationInFrames={f(52.9) - f(44.5)}>
        <FotoFundo src="baloes.jpg" inicio={44.5} dur={8.4} desfoque={14} brilho={0.3} saturacao={0.85} posicao="50% 30%" zoom={[1.0, 1.1]} />
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
          saida={{ at: 44.6, para: "encolhe" }}
        />
      </Sequence>
      <Sequence name="Oferta" {...faixa(C.oferta)}>
        <Oferta inicio={C.oferta[0]} buffetName={buffetName} />
      </Sequence>

      <Pelicula />
    </AbsoluteFill>
  );
};
