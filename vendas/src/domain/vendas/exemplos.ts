import { z } from 'zod';
import type { EtapaVendas } from './etapas';

/*
 * Exemplos que ensinam o copiloto: conversas marcadas como boas ou ruins (com o motivo em uma
 * frase) e as correções do Gui (sugestão → o que ele mandou). Em cada análise entram as 5 últimas
 * correções (é assim que a IA aprende o jeito dele) e até 3 boas e 2 ruins, as mais parecidas
 * com a conversa atual.
 */

export const LIMITE_EXEMPLOS = { bons: 3, ruins: 2, pares: 5 } as const;

export const avaliacaoSchema = z.object({
  avaliacao: z.enum(['boa', 'ruim']),
  motivo: z
    .string()
    .trim()
    .min(3, 'Escreva o motivo em uma frase.')
    .max(200, 'Use uma frase curta (até 200 caracteres).'),
});

export type Exemplo = {
  sugestaoId: string;
  avaliacao: 'boa' | 'ruim';
  motivo: string;
  entrada: string;
  mensagem: string;
  etapa: EtapaVendas;
};

export type ParEditado = {
  sugestaoId: string;
  entrada: string;
  sugerida: string;
  final: string;
  etapa: EtapaVendas;
};

const PALAVRAS_VAZIAS = new Set(
  'que com para por uma umas uns como mas mais pra pro voce voces vc vcs esse essa isso aqui ali ja nao sim tem ter sao ele ela eles elas meu minha seu sua dos das nos nas num numa the'.split(
    ' ',
  ),
);

/** Palavras relevantes do texto (minúsculas, sem acento, 3+ letras). */
export function palavras(texto: string): Set<string> {
  const limpo = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return new Set((limpo.match(/[a-z0-9]{3,}/g) ?? []).filter((p) => !PALAVRAS_VAZIAS.has(p)));
}

/** Semelhança de 0 a 1 entre dois textos (palavras em comum / palavras no total). */
export function semelhanca(a: string, b: string): number {
  const pa = palavras(a);
  const pb = palavras(b);
  if (!pa.size || !pb.size) return 0;
  let comum = 0;
  for (const p of pa) if (pb.has(p)) comum++;
  return comum / (pa.size + pb.size - comum);
}

type Referencia = { texto: string; etapa: EtapaVendas };

function pontuar(ref: Referencia, texto: string, etapa: EtapaVendas): number {
  return semelhanca(ref.texto, texto) + (etapa === ref.etapa ? 0.2 : 0);
}

/** Os mais parecidos primeiro; no empate, a ordem recebida (mais recentes primeiro). */
function melhores<T>(itens: T[], nota: (t: T) => number, limite: number): T[] {
  return itens
    .map((item, i) => ({ item, i, n: nota(item) }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, limite)
    .map((x) => x.item);
}

export type ExemplosEscolhidos = { bons: Exemplo[]; ruins: Exemplo[]; pares: ParEditado[] };

export function selecionarExemplos(
  ref: Referencia,
  exemplos: Exemplo[],
  pares: ParEditado[],
): ExemplosEscolhidos {
  const nota = (e: Exemplo) => pontuar(ref, `${e.entrada} ${e.mensagem}`, e.etapa);
  return {
    bons: melhores(
      exemplos.filter((e) => e.avaliacao === 'boa'),
      nota,
      LIMITE_EXEMPLOS.bons,
    ),
    ruins: melhores(
      exemplos.filter((e) => e.avaliacao === 'ruim'),
      nota,
      LIMITE_EXEMPLOS.ruins,
    ),
    // as correções chegam das mais recentes para as mais antigas
    pares: pares.slice(0, LIMITE_EXEMPLOS.pares),
  };
}

export function idsUsados(e: ExemplosEscolhidos): string[] {
  return [...e.bons, ...e.ruins, ...e.pares].map((x) => x.sugestaoId);
}

const corta = (t: string, n = 400) => (t.length > n ? `${t.slice(0, n)}…` : t);

/** Seção do prompt com os exemplos. Vazia quando ainda não há nenhum. */
export function exemplosParaPrompt(e: ExemplosEscolhidos): string {
  const partes: string[] = [];
  if (e.bons.length) {
    partes.push(
      '# Exemplos que o Gui aprovou (siga o estilo)\n' +
        e.bons
          .map(
            (x, i) =>
              `${i + 1}. Lead: ${corta(x.entrada)}\n   Resposta boa: ${corta(x.mensagem)}\n   Por quê: ${x.motivo}`,
          )
          .join('\n'),
    );
  }
  if (e.ruins.length) {
    partes.push(
      '# Exemplos ruins (não faça assim)\n' +
        e.ruins
          .map(
            (x, i) =>
              `${i + 1}. Lead: ${corta(x.entrada)}\n   Resposta ruim: ${corta(x.mensagem)}\n   Por quê: ${x.motivo}`,
          )
          .join('\n'),
    );
  }
  if (e.pares.length) {
    partes.push(
      '# Últimas correções do Gui (o que você sugeriu e o que ele mandou de verdade; escreva como ele)\n' +
        e.pares
          .map((x, i) => `${i + 1}. Sugerido: ${corta(x.sugerida)}\n   Enviado: ${corta(x.final)}`)
          .join('\n'),
    );
  }
  return partes.join('\n\n');
}
