import { loadFont } from '@remotion/fonts';
import { Easing, interpolate, staticFile } from 'remotion';

/** Identidade do Orkestra: grafite + limão #B2F759 (o da logo), Manrope. */
export const COR = {
  fundo: '#070707',
  cartao: '#151515',
  cartao2: '#1d1d1d',
  borda: 'rgba(255,255,255,0.10)',
  texto: '#F4F4F2',
  suave: '#A0A09C',
  limao: '#B2F759',
  erro: '#FB7185',
  alerta: '#FCD34D',
  info: '#7DD3FC',
  quente: '#FB923C',
  sucesso: '#4ADE80',
  // vitrine do buffet (claro neutro com a cor do buffet de exemplo)
  claro: '#F6F7F5',
  tinta: '#161616',
  buffet: '#0F766E',
} as const;

export const FONTE = 'Manrope';

export const carregarFontes = () =>
  Promise.all(
    (['400', '600', '800'] as const).map((peso) =>
      loadFont({ family: FONTE, url: staticFile(`fonts/Manrope-${peso}.ttf`), weight: peso }),
    ),
  );

export const FPS = 30;

const SAIDA = Easing.bezier(0.16, 1, 0.3, 1);

/** Progresso 0→1 de uma entrada que começa em `de` (frames) e dura `dur` frames. */
export const entrada = (frame: number, de: number, dur = 18) =>
  interpolate(frame, [de, de + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: SAIDA,
  });

/** Opacidade + subida suave para um elemento que entra em `de`. */
export const surgir = (frame: number, de: number, distancia = 40, dur = 18) => {
  const p = entrada(frame, de, dur);
  return { opacity: p, translate: `0px ${(1 - p) * distancia}px` } as const;
};

/** Saída da cena: some nos últimos `dur` frames. */
export const saidaDaCena = (frame: number, total: number, dur = 10) =>
  interpolate(frame, [total - dur, total], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
