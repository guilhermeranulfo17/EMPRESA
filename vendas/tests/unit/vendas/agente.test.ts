import { describe, expect, it } from 'vitest';
import {
  ERRO_FORMATO,
  historicoParaPrompt,
  lerArquivoPrompt,
  lerSaidaAgente,
  montarSituacao,
  semTravessao,
} from '@/domain/vendas/agente';

const valida = {
  resumo: 'Respondeu a abordagem e perguntou o preço.',
  etapa: 'respondeu',
  mensagem: 'Fica em torno de R$ 250 por mês. Quer ver como fica?',
  proximo_followup: '2026-10-21',
  motivo: 'Perguntou o preço, então respondeu.',
  nao_contatar: false,
};

describe('saída da IA', () => {
  it('aceita JSON puro e JSON dentro de bloco de código', () => {
    expect(lerSaidaAgente(JSON.stringify(valida))).toEqual({ ok: true, saida: valida });
    const r = lerSaidaAgente(
      '```json\n' + JSON.stringify({ ...valida, proximo_followup: '' }) + '\n```',
    );
    expect(r.ok).toBe(true);
  });

  it('recusa texto que não é JSON, etapa inexistente e campo faltando, sempre com a mesma frase', () => {
    expect(lerSaidaAgente('Claro! Aqui vai a resposta...')).toEqual({
      ok: false,
      erro: ERRO_FORMATO,
    });
    expect(lerSaidaAgente(JSON.stringify({ ...valida, etapa: 'interessado' }))).toEqual({
      ok: false,
      erro: ERRO_FORMATO,
    });
    const semResumo: Record<string, unknown> = { ...valida };
    delete semResumo.resumo;
    expect(lerSaidaAgente(JSON.stringify(semResumo)).ok).toBe(false);
    expect(lerSaidaAgente(JSON.stringify({ ...valida, proximo_followup: 'amanhã' })).ok).toBe(
      false,
    );
  });

  it('sugestão antiga (com diagnostico e angulo) ainda é lida; os campos a mais são ignorados', () => {
    const r = lerSaidaAgente(JSON.stringify({ ...valida, diagnostico: 'x', angulo: 'resposta' }));
    expect(r).toEqual({ ok: true, saida: valida });
  });

  it('lê a versão do cabeçalho do arquivo de prompt', () => {
    expect(lerArquivoPrompt('---\nversao: v3\n---\nVocê é...\n')).toEqual({
      versao: 'v3',
      texto: 'Você é...',
    });
    expect(lerArquivoPrompt('Sem cabeçalho')).toEqual({
      versao: 'sem-versao',
      texto: 'Sem cabeçalho',
    });
  });
});

describe('montarSituacao', () => {
  it('leva o lead, o registrado e a conversa colada, nessa ordem', () => {
    const t = montarSituacao({
      hoje: '2026-10-19',
      base: '',
      lead: {
        nome: 'Buffet Alegria',
        cidade: 'Uberlândia',
        uf: 'MG',
        segmento: 'buffet_infantil',
        categoria: 'Salão de festas',
        etapa: 'mensagem_1',
        resumo: null,
        observacoes: 'Dono se chama Paulo',
        proximoFollowup: '2026-10-21',
      },
      historico: ['Gui: Oi, tudo bem?'],
      entrada: 'Lead: quanto custa?',
    });
    expect(t).toContain('Hoje é 2026-10-19.');
    expect(t).toContain('Cidade: Uberlândia/MG');
    expect(t).toContain('Segmento: Buffet infantil');
    expect(t).toContain('Etapa atual: Mensagem 1 enviada (mensagem_1)');
    expect(t).toContain('Observações do Gui: Dono se chama Paulo');
    expect(t).not.toContain('Base de conhecimento');
    expect(t.indexOf('Gui: Oi, tudo bem?')).toBeLessThan(t.indexOf('Lead: quanto custa?'));
  });
});

describe('historicoParaPrompt', () => {
  it('rotula quem falou, na ordem, sem espaços sobrando', () => {
    expect(
      historicoParaPrompt([
        { autor: 'gui', texto: 'Oi, tudo bem?' },
        { autor: 'lead', texto: '  Tudo, quem é?  ' },
        { autor: 'conversa', texto: 'Lead: oi\nGui: oi' },
      ]),
    ).toEqual(['Gui: Oi, tudo bem?', 'Lead: Tudo, quem é?', 'Conversa colada: Lead: oi\nGui: oi']);
  });

  it('fica só com as últimas mensagens', () => {
    const muitas = Array.from({ length: 20 }, (_, i) => ({
      autor: 'gui' as const,
      texto: `m${i}`,
    }));
    expect(historicoParaPrompt(muitas)).toHaveLength(12);
    expect(historicoParaPrompt(muitas).at(-1)).toBe('Gui: m19');
  });
});

describe('semTravessao', () => {
  it('troca travessão por vírgula', () => {
    expect(semTravessao('Oi Marta — tudo bem?')).toBe('Oi Marta, tudo bem?');
    expect(semTravessao('Simples – direto – rápido')).toBe('Simples, direto, rápido');
    expect(semTravessao('Sem traço nenhum.')).toBe('Sem traço nenhum.');
  });
  it('a saída lida do provedor já vem sem travessão', () => {
    const r = lerSaidaAgente(
      JSON.stringify({ ...valida, mensagem: 'Oi — tudo bem?', resumo: 'A — B' }),
    );
    expect(r.ok && r.saida.mensagem).toBe('Oi, tudo bem?');
    expect(r.ok && r.saida.resumo).toBe('A, B');
  });
});
