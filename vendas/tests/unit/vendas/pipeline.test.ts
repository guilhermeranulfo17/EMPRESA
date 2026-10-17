import { describe, expect, it } from 'vitest';
import { agruparPorEtapa, MOTIVO_MANUAL, validarMovimento } from '@/domain/vendas/pipeline';

describe('pipeline de vendas', () => {
  it('agrupa por etapa com todas as colunas, mesmo vazias, na ordem', () => {
    const g = agruparPorEtapa([
      { id: 'a', etapa: 'abordado' as const },
      { id: 'b', etapa: 'novo' as const },
      { id: 'c', etapa: 'abordado' as const },
    ]);
    expect(Object.keys(g)).toEqual([
      'novo',
      'abordado',
      'respondeu',
      'interessado',
      'fechando',
      'cliente',
      'perdido',
    ]);
    expect(g.abordado.map((c) => c.id)).toEqual(['a', 'c']);
    expect(g.cliente).toEqual([]);
  });

  it('aceita ir para qualquer outra etapa (inclusive voltar) com motivo padrão', () => {
    expect(validarMovimento('fechando', 'abordado')).toEqual({
      ok: true,
      para: 'abordado',
      motivo: MOTIVO_MANUAL,
    });
    expect(validarMovimento('novo', 'perdido', '  Não tem interesse  ')).toEqual({
      ok: true,
      para: 'perdido',
      motivo: 'Não tem interesse',
    });
  });

  it('recusa a mesma etapa, etapa inexistente e motivo longo demais', () => {
    expect(validarMovimento('novo', 'novo')).toEqual({
      ok: false,
      erro: 'O lead já está nessa etapa.',
    });
    expect(validarMovimento('novo', 'ganhou')).toEqual({ ok: false, erro: 'Etapa inválida.' });
    expect(validarMovimento('novo', 'abordado', 'x'.repeat(501))).toMatchObject({ ok: false });
  });
});
