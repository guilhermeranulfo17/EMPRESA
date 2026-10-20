import { describe, expect, it } from 'vitest';
import { agruparPorEtapa, MOTIVO_MANUAL, validarMovimento } from '@/domain/vendas/pipeline';

describe('agruparPorEtapa', () => {
  it('toda etapa aparece, mesmo vazia, na ordem do funil', () => {
    const g = agruparPorEtapa([
      { etapa: 'mensagem_1' as const },
      { etapa: 'nao_contatado' as const },
      { etapa: 'mensagem_1' as const },
    ]);
    expect(Object.keys(g)).toEqual([
      'nao_contatado',
      'mensagem_1',
      'followup',
      'respondeu',
      'em_teste',
      'fechou',
      'sem_interesse',
    ]);
    expect(g.mensagem_1).toHaveLength(2);
    expect(g.fechou).toEqual([]);
  });
});

describe('validarMovimento', () => {
  it('motivo vazio vira o padrão; mantém o follow-up', () => {
    expect(validarMovimento('mensagem_1', 'respondeu')).toEqual({
      ok: true,
      para: 'respondeu',
      motivo: MOTIVO_MANUAL,
      limparCadencia: false,
    });
  });

  it('fechou e sem interesse apagam o follow-up; voltar para Não contatado limpa a cadência', () => {
    expect(validarMovimento('em_teste', 'fechou')).toMatchObject({
      ok: true,
      proximoFollowup: null,
    });
    expect(validarMovimento('followup', 'sem_interesse')).toMatchObject({
      ok: true,
      proximoFollowup: null,
    });
    expect(validarMovimento('mensagem_1', 'nao_contatado')).toMatchObject({
      ok: true,
      proximoFollowup: null,
      limparCadencia: true,
    });
  });

  it('recusa etapa inexistente, a mesma etapa e motivo longo', () => {
    expect(validarMovimento('nao_contatado', 'cliente').ok).toBe(false);
    expect(validarMovimento('respondeu', 'respondeu')).toEqual({
      ok: false,
      erro: 'O lead já está nessa etapa.',
    });
    expect(validarMovimento('respondeu', 'em_teste', 'x'.repeat(501)).ok).toBe(false);
  });
});
