import tempos from '../tempos.json';
import { FPS } from './marca';

export type FraseTempo = { cena: string; texto: string; inicio: number; fim: number };

const frases = tempos.frases as FraseTempo[];

/** Cenas na ordem, com início e fim (s): do começo da 1ª frase até o começo da próxima cena. */
export function cenas() {
  const ids = [...new Set(frases.map((f) => f.cena))];
  return ids.map((id, i) => {
    const minhas = frases.filter((f) => f.cena === id);
    const inicio = i === 0 ? 0 : minhas[0]!.inicio - 0.15;
    const proxima = ids[i + 1];
    const fim = proxima
      ? frases.find((f) => f.cena === proxima)!.inicio - 0.15
      : tempos.duracao + 1.5;
    return {
      id,
      inicio,
      fim,
      duracaoFrames: Math.round((fim - inicio) * FPS),
      inicioFrame: Math.round(inicio * FPS),
      /** frame (relativo à cena) em que cada frase começa */
      frases: minhas.map((f) => Math.max(0, Math.round((f.inicio - inicio) * FPS))),
    };
  });
}

export const duracaoTotalFrames = () => {
  const c = cenas();
  const ultima = c[c.length - 1]!;
  return ultima.inicioFrame + ultima.duracaoFrames;
};
