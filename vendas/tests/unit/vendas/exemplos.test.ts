import { describe, expect, it } from 'vitest';
import { montarSituacao } from '@/domain/vendas/agente';
import {
  avaliacaoSchema,
  exemplosParaPrompt,
  idsUsados,
  palavras,
  selecionarExemplos,
  semelhanca,
  type Exemplo,
  type ParEditado,
} from '@/domain/vendas/exemplos';

const ex = (
  id: string,
  avaliacao: 'boa' | 'ruim',
  entrada: string,
  etapa = 'respondeu',
): Exemplo => ({
  sugestaoId: id,
  avaliacao,
  motivo: `motivo ${id}`,
  entrada,
  mensagem: `resposta ${id}`,
  etapa: etapa as Exemplo['etapa'],
});

describe('palavras e semelhança', () => {
  it('ignora acento, maiúscula e palavras vazias', () => {
    expect([...palavras('Quanto CUSTA o orçamento? É pra você')]).toEqual([
      'quanto',
      'custa',
      'orcamento',
    ]);
  });
  it('textos parecidos pontuam mais', () => {
    expect(semelhanca('quanto custa o sistema', 'quanto custa por mês')).toBeGreaterThan(
      semelhanca('quanto custa o sistema', 'já uso planilha'),
    );
    expect(semelhanca('', 'qualquer')).toBe(0);
  });
});

describe('selecionarExemplos', () => {
  const exemplos = [
    ...Array.from({ length: 7 }, (_, i) =>
      ex(`b${i}`, 'boa', i === 6 ? 'quanto custa' : 'outro assunto'),
    ),
    ...Array.from({ length: 5 }, (_, i) => ex(`r${i}`, 'ruim', 'tanto faz')),
  ];
  const pares: ParEditado[] = Array.from({ length: 4 }, (_, i) => ({
    sugestaoId: `p${i}`,
    entrada: 'oi',
    sugerida: 's',
    final: 'f',
    etapa: 'novo',
  }));

  it('respeita os limites: 5 boas, 3 ruins e 3 correções', () => {
    const s = selecionarExemplos({ texto: 'quanto custa', etapa: 'respondeu' }, exemplos, pares);
    expect(s.bons).toHaveLength(5);
    expect(s.ruins).toHaveLength(3);
    expect(s.pares).toHaveLength(3);
    expect(idsUsados(s)).toHaveLength(11);
  });

  it('o mais parecido vem primeiro; no empate, os mais recentes (ordem recebida)', () => {
    const s = selecionarExemplos({ texto: 'quanto custa', etapa: 'respondeu' }, exemplos, pares);
    expect(s.bons[0]!.sugestaoId).toBe('b6');
    expect(s.bons.slice(1).map((b) => b.sugestaoId)).toEqual(['b0', 'b1', 'b2', 'b3']);
  });
});

describe('exemplosParaPrompt', () => {
  it('vazio sem exemplos; com exemplos, entra no prompt antes do que o Gui colou', () => {
    expect(exemplosParaPrompt({ bons: [], ruins: [], pares: [] })).toBe('');
    const secao = exemplosParaPrompt({
      bons: [ex('b1', 'boa', 'quanto custa')],
      ruins: [ex('r1', 'ruim', 'oi')],
      pares: [
        { sugestaoId: 'p1', entrada: 'oi', sugerida: 'Olá!', final: 'Oi Marta!', etapa: 'novo' },
      ],
    });
    expect(secao).toContain('Exemplos que o Gui aprovou');
    expect(secao).toContain('Por quê: motivo b1');
    expect(secao).toContain('não faça assim');
    expect(secao).toContain('Sugerido: Olá!\n   Enviado: Oi Marta!');
    const texto = montarSituacao({
      hoje: '2026-10-18',
      base: 'b',
      lead: { nome: 'A', buffet: null, cidade: null, etapa: 'Novo', resumo: null, tentativas: 0 },
      historico: [],
      entrada: 'quanto custa?',
      exemplos: secao,
    });
    expect(texto.indexOf('Exemplos que o Gui aprovou')).toBeLessThan(
      texto.indexOf('# O que o Gui colou agora'),
    );
  });
});

describe('avaliacaoSchema', () => {
  it('exige motivo em uma frase', () => {
    expect(avaliacaoSchema.safeParse({ avaliacao: 'boa', motivo: 'ok' }).success).toBe(false);
    expect(
      avaliacaoSchema.safeParse({ avaliacao: 'ruim', motivo: 'Muito longa e formal' }).success,
    ).toBe(true);
  });
});
