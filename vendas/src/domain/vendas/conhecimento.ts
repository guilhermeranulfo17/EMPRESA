import { z } from 'zod';

/*
 * Base de conhecimento do copiloto: produto, preço, objeções com respostas e scripts. O agente
 * só pode afirmar o que estiver aqui (itens ativos). Numa objeção, o título é a objeção e o
 * conteúdo é a resposta.
 */

export const TIPOS_CONHECIMENTO = ['produto', 'preco', 'objecao', 'script'] as const;
export type TipoConhecimento = (typeof TIPOS_CONHECIMENTO)[number];

export const ROTULO_TIPO: Record<TipoConhecimento, string> = {
  produto: 'Produto',
  preco: 'Preço',
  objecao: 'Objeções',
  script: 'Scripts',
};

/** Rótulos dos campos e exemplos, por tipo (o formulário muda conforme o tipo). */
export const CAMPOS_TIPO: Record<
  TipoConhecimento,
  { titulo: string; conteudo: string; exemploTitulo: string; exemploConteudo: string }
> = {
  produto: {
    titulo: 'Assunto',
    conteudo: 'O que é verdade sobre isso',
    exemploTitulo: 'Orçamento automático no link da bio',
    exemploConteudo:
      'O cliente monta a festa sozinho, vê o preço e chega no WhatsApp já qualificado.',
  },
  preco: {
    titulo: 'Plano ou condição',
    conteudo: 'Valor e regras',
    exemploTitulo: 'Plano mensal',
    exemploConteudo: 'Valor por mês, o que inclui e se tem fidelidade.',
  },
  objecao: {
    titulo: 'Objeção do lead',
    conteudo: 'Como responder',
    exemploTitulo: 'Já uso planilha / caderno',
    exemploConteudo: 'Resposta curta, sem empurrar, que leva ao próximo passo.',
  },
  script: {
    titulo: 'Momento',
    conteudo: 'Mensagem modelo',
    exemploTitulo: 'Primeira abordagem',
    exemploConteudo: 'Oi, [nome]! Vi o perfil do [buffet]...',
  },
};

export const conhecimentoSchema = z.object({
  tipo: z.enum(TIPOS_CONHECIMENTO, { error: 'Escolha o tipo.' }),
  titulo: z
    .string()
    .trim()
    .min(2, 'Escreva um título com pelo menos 2 letras.')
    .max(160, 'Use no máximo 160 caracteres.'),
  conteudo: z
    .string()
    .trim()
    .min(2, 'Escreva o conteúdo.')
    .max(8000, 'Use no máximo 8.000 caracteres.'),
});
export type ConhecimentoEntrada = z.input<typeof conhecimentoSchema>;

export type ItemConhecimento = {
  id: string;
  tipo: TipoConhecimento;
  titulo: string;
  conteudo: string;
  ativo: boolean;
};

/**
 * Texto da base para o prompt do agente: só itens ativos, agrupados por tipo, na ordem fixa.
 * Base vazia diz isso com todas as letras (o agente então só pode dizer que vai confirmar).
 */
export function baseParaPrompt(itens: ItemConhecimento[]): string {
  const ativos = itens.filter((i) => i.ativo);
  if (ativos.length === 0) return 'A base de conhecimento está vazia.';
  return TIPOS_CONHECIMENTO.flatMap((tipo) => {
    const doTipo = ativos.filter((i) => i.tipo === tipo);
    if (doTipo.length === 0) return [];
    const linhas = doTipo.map((i) =>
      tipo === 'objecao'
        ? `- Objeção: ${i.titulo}\n  Resposta: ${i.conteudo}`
        : `- ${i.titulo}: ${i.conteudo}`,
    );
    return [`## ${ROTULO_TIPO[tipo]}\n${linhas.join('\n')}`];
  }).join('\n\n');
}
