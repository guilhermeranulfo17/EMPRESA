import { describe, expect, it } from 'vitest';
import type { SaidaAgente } from '@/domain/vendas/agente';
import { decisaoSchema, foiEditada, planoAprovacao } from '@/domain/vendas/decisao';

const saida: SaidaAgente = {
  resumo: 'Perguntou o preço.',
  etapa: 'respondeu',
  mensagem: 'Fica em torno de R$ 250 por mês. Quer ver?',
  proximo_followup: '2026-10-21',
  motivo: 'Perguntou o preço',
  nao_contatar: false,
};

const decisao = (d: Partial<{ mensagem: string; etapa: string; proximoFollowup: string }> = {}) =>
  decisaoSchema.parse({
    mensagem: saida.mensagem,
    etapa: saida.etapa,
    proximoFollowup: saida.proximo_followup,
    ...d,
  });

describe('foiEditada', () => {
  it('ignora espaços nas pontas', () => {
    expect(foiEditada('Oi!', '  Oi!\n')).toBe(false);
    expect(foiEditada('Oi!', 'Oi, Paulo!')).toBe(true);
  });
});

describe('decisaoSchema', () => {
  it('recusa mensagem vazia e etapa inexistente; data vazia vira null', () => {
    expect(
      decisaoSchema.safeParse({ mensagem: '  ', etapa: 'respondeu', proximoFollowup: '' }).success,
    ).toBe(false);
    expect(
      decisaoSchema.safeParse({ mensagem: 'oi', etapa: 'cliente', proximoFollowup: '' }).success,
    ).toBe(false);
    expect(
      decisaoSchema.parse({ mensagem: ' oi ', etapa: 'respondeu', proximoFollowup: '' }),
    ).toEqual({
      mensagem: 'oi',
      etapa: 'respondeu',
      proximoFollowup: null,
    });
  });
});

describe('planoAprovacao', () => {
  it('aceitar como veio: resumo e follow-up da IA, etapa anda com o motivo da IA', () => {
    expect(planoAprovacao({ etapa: 'mensagem_1', naoContatar: false }, saida, decisao())).toEqual({
      lead: { resumo: 'Perguntou o preço.', proximoFollowup: '2026-10-21' },
      movimento: { de: 'mensagem_1', para: 'respondeu', motivo: 'Perguntou o preço' },
    });
  });

  it('etapa e data editadas pelo Gui valem; o motivo diz que foi ele', () => {
    const p = planoAprovacao(
      { etapa: 'mensagem_1', naoContatar: false },
      saida,
      decisao({ etapa: 'em_teste', proximoFollowup: '2026-10-25' }),
    );
    expect(p.lead.proximoFollowup).toBe('2026-10-25');
    expect(p.movimento).toEqual({
      de: 'mensagem_1',
      para: 'em_teste',
      motivo: 'Etapa escolhida por você ao aceitar a sugestão',
    });
  });

  it('mesma etapa não gera movimento; etapa encerrada apaga o follow-up', () => {
    expect(
      planoAprovacao({ etapa: 'respondeu', naoContatar: false }, saida, decisao()).movimento,
    ).toBeNull();
    const fechou = planoAprovacao(
      { etapa: 'em_teste', naoContatar: false },
      saida,
      decisao({ etapa: 'fechou' }),
    );
    expect(fechou.lead.proximoFollowup).toBeNull();
  });

  it('pedido para parar marca não contatar e tira o follow-up', () => {
    const p = planoAprovacao(
      { etapa: 'mensagem_1', naoContatar: false },
      { ...saida, nao_contatar: true, etapa: 'sem_interesse' },
      decisao({ etapa: 'sem_interesse' }),
    );
    expect(p.lead).toEqual({
      resumo: 'Perguntou o preço.',
      proximoFollowup: null,
      naoContatar: true,
    });
  });
});
