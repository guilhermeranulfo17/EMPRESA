import { describe, expect, it } from 'vitest';
import { baseParaPrompt, conhecimentoSchema } from '@/domain/vendas/conhecimento';

const item = (
  tipo: 'produto' | 'preco' | 'objecao' | 'script',
  titulo: string,
  conteudo: string,
  ativo = true,
) => ({
  id: titulo,
  tipo,
  titulo,
  conteudo,
  ativo,
});

describe('base de conhecimento', () => {
  it('valida tipo, título e conteúdo com mensagens simples', () => {
    expect(
      conhecimentoSchema.safeParse({ tipo: 'preco', titulo: ' Mensal ', conteudo: ' R$ X ' }).data,
    ).toEqual({
      tipo: 'preco',
      titulo: 'Mensal',
      conteudo: 'R$ X',
    });
    const r = conhecimentoSchema.safeParse({ tipo: 'outro', titulo: 'a', conteudo: '' });
    expect(r.error!.issues.map((i) => i.message)).toEqual([
      'Escolha o tipo.',
      'Escreva um título com pelo menos 2 letras.',
      'Escreva o conteúdo.',
    ]);
  });

  it('monta o texto do prompt só com os ativos, agrupado na ordem dos tipos', () => {
    const texto = baseParaPrompt([
      item('script', 'Abordagem', 'Oi!'),
      item('produto', 'Link', 'Orçamento automático'),
      item('objecao', 'Está caro', 'Mostra o retorno'),
      item('preco', 'Antigo', 'Não vale mais', false),
    ]);
    expect(texto).toBe(
      [
        '## Produto\n- Link: Orçamento automático',
        '## Objeções\n- Objeção: Está caro\n  Resposta: Mostra o retorno',
        '## Scripts\n- Abordagem: Oi!',
      ].join('\n\n'),
    );
  });

  it('base vazia (ou só inativos) é dita com todas as letras', () => {
    expect(baseParaPrompt([])).toBe('A base de conhecimento está vazia.');
    expect(baseParaPrompt([item('preco', 'Antigo', 'x', false)])).toBe(
      'A base de conhecimento está vazia.',
    );
  });
});
