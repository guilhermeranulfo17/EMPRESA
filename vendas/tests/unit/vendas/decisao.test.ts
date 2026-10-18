import { describe, expect, it } from 'vitest';
import type { SaidaAgente } from '@/domain/vendas/agente';
import {
  foiEditada,
  linkWhatsApp,
  mensagemFinalSchema,
  planoAprovacao,
} from '@/domain/vendas/decisao';

const saida: SaidaAgente = {
  diagnostico: 'Lead quer saber o preço.',
  mensagem: 'Custa R$ 97 por mês. Quer testar?',
  etapa: 'interessado',
  resumo: 'Perguntou o preço.',
  proximo_followup: '2026-10-20',
  angulo: 'resposta',
  passar_para_humano: false,
  nao_contatar: false,
  motivo: 'Perguntou o preço',
};

describe('linkWhatsApp', () => {
  it('monta o wa.me só com dígitos e o texto codificado', () => {
    expect(linkWhatsApp('+5534999990001', 'Oi Marta! Tudo bem? 50% & mais')).toBe(
      'https://wa.me/5534999990001?text=Oi%20Marta!%20Tudo%20bem%3F%2050%25%20%26%20mais',
    );
  });
  it('sem telefone não tem link', () => {
    expect(linkWhatsApp(null, 'oi')).toBeNull();
    expect(linkWhatsApp('', 'oi')).toBeNull();
  });
});

describe('foiEditada', () => {
  it('ignora espaços nas pontas', () => {
    expect(foiEditada('Oi!', '  Oi!\n')).toBe(false);
    expect(foiEditada('Oi!', 'Oi, Marta!')).toBe(true);
  });
});

describe('mensagemFinalSchema', () => {
  it('recusa vazio', () => {
    expect(mensagemFinalSchema.safeParse('   ').success).toBe(false);
    expect(mensagemFinalSchema.parse(' oi ')).toBe('oi');
  });
});

describe('planoAprovacao', () => {
  it('atualiza resumo e follow-up, zera tentativas e move o card com o motivo', () => {
    expect(planoAprovacao({ etapa: 'abordado', naoContatar: false }, saida)).toEqual({
      lead: { resumo: 'Perguntou o preço.', proximoFollowup: '2026-10-20', tentativas: 0 },
      movimento: { de: 'abordado', para: 'interessado', motivo: 'Perguntou o preço' },
    });
  });

  it('mesma etapa não gera movimento; sem data limpa o follow-up; resumo vazio não apaga', () => {
    const p = planoAprovacao(
      { etapa: 'interessado', naoContatar: false },
      { ...saida, proximo_followup: '', resumo: '  ' },
    );
    expect(p).toEqual({ lead: { proximoFollowup: null, tentativas: 0 }, movimento: null });
  });

  it('pedido de parar marca não contatar, tira o follow-up e usa motivo padrão se vier vazio', () => {
    const p = planoAprovacao(
      { etapa: 'abordado', naoContatar: false },
      { ...saida, nao_contatar: true, etapa: 'perdido', motivo: '' },
    );
    expect(p.lead).toEqual({
      resumo: 'Perguntou o preço.',
      proximoFollowup: null,
      tentativas: 0,
      naoContatar: true,
    });
    expect(p.movimento).toEqual({
      de: 'abordado',
      para: 'perdido',
      motivo: 'Sugestão do copiloto aprovada',
    });
  });
});
