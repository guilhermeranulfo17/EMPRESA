import { describe, expect, it } from 'vitest';
import { ERRO_FORMATO, lerArquivoPrompt, lerSaidaAgente } from '@/domain/vendas/agente';

const valida = {
  diagnostico: 'Dono respondeu curioso, quer saber preço.',
  mensagem: 'Show! Te mando os valores agora. Você atende mais festa infantil ou casamento?',
  etapa: 'respondeu',
  resumo: 'Respondeu a abordagem e perguntou o preço.',
  proximo_followup: '2026-10-20',
  angulo: 'resposta',
  passar_para_humano: false,
  nao_contatar: false,
  motivo: 'Lead engajou; próximo passo é qualificar.',
};

describe('saída do copiloto', () => {
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
    expect(lerSaidaAgente(JSON.stringify({ ...valida, etapa: 'ganhou' }))).toEqual({
      ok: false,
      erro: ERRO_FORMATO,
    });
    const semMotivo: Record<string, unknown> = { ...valida };
    delete semMotivo.motivo;
    expect(lerSaidaAgente(JSON.stringify(semMotivo)).ok).toBe(false);
    expect(lerSaidaAgente(JSON.stringify({ ...valida, proximo_followup: 'amanhã' })).ok).toBe(
      false,
    );
  });

  it('lê a versão do cabeçalho do arquivo de prompt', () => {
    expect(lerArquivoPrompt('---\nversao: v2\n---\nVocê é...\n')).toEqual({
      versao: 'v2',
      texto: 'Você é...',
    });
    expect(lerArquivoPrompt('Sem cabeçalho')).toEqual({
      versao: 'sem-versao',
      texto: 'Sem cabeçalho',
    });
  });
});
