import { describe, expect, it } from 'vitest';
import { separarCsv } from '@/domain/vendas/csv';
import { lerPlanilha, lerStatus } from '@/domain/vendas/planilha';

const CABECALHO = [
  'NOME DA EMPRESA',
  'AVALIAÇÕES',
  'CIDADE',
  'NUMERO',
  'CATEGORIA DE NEGOCIO',
  'WHATSAPP',
  'SEGMENTO',
  'PRIORIDADE',
  'STATUS',
  'ORIGEM',
];

describe('lerPlanilha', () => {
  it('lê as colunas da Lista_Orkestra e monta o lead', () => {
    const r = lerPlanilha([
      CABECALHO,
      [
        'Buffet Alegria',
        '4.8',
        'Uberlândia - MG',
        '(34) 99135-5450',
        'Buffet infantil',
        'Sim',
        'Buffet infantil',
        'A',
        'Não contatado',
        'Google Maps',
      ],
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.linhas).toEqual([
      {
        linha: 2,
        situacao: 'ok',
        nome: 'Buffet Alegria',
        erro: null,
        avisos: [],
        dados: {
          nome: 'Buffet Alegria',
          cidade: 'Uberlândia',
          uf: 'MG',
          telefone: '(34) 99135-5450',
          telefoneDigitos: '34991355450',
          whatsapp: 'https://wa.me/5534991355450',
          categoria: 'Buffet infantil',
          segmento: 'buffet_infantil',
          prioridade: 'A',
          avaliacoes: '4,8',
          origem: 'Google Maps',
          etapa: 'nao_contatado',
          observacoes: null,
        },
      },
    ]);
  });

  it('telefone repetido no arquivo (mesmos dígitos, escrito diferente) fica como repetida', () => {
    const r = lerPlanilha([
      ['NOME DA EMPRESA', 'NUMERO'],
      ['Buffet A', '(34) 99135-5450'],
      ['Buffet A de novo', '+55 34 991355450'],
      ['Buffet B', '34 3213-5450'],
    ]);
    expect(r.ok && r.linhas.map((l) => l.situacao)).toEqual(['ok', 'repetida', 'ok']);
    // fixo não tem WhatsApp; a UF sai do DDD
    expect(r.ok && r.linhas[2]!.dados).toMatchObject({ whatsapp: null, uf: 'MG' });
  });

  it('sem nome ou sem telefone válido, a linha fica com erro', () => {
    const r = lerPlanilha([
      ['NOME DA EMPRESA', 'NUMERO'],
      ['', '34991355450'],
      ['Buffet Sem Fone', ''],
      ['Buffet Fone Ruim', '123'],
    ]);
    expect(r.ok && r.linhas.map((l) => [l.situacao, l.erro])).toEqual([
      ['invalida', 'Sem nome da empresa.'],
      ['invalida', 'Sem telefone.'],
      ['invalida', 'Telefone inválido.'],
    ]);
  });

  it('acha o cabeçalho mesmo com linhas de título antes e conta as linhas certo', () => {
    const r = lerPlanilha([
      ['Lista de prospecção'],
      [],
      ['NOME DA EMPRESA', 'WHATSAPP'],
      ['Buffet X', '34991355450'],
    ]);
    expect(r.ok && r.linhas[0]!.linha).toBe(4);
  });

  it('valores que não reconheço viram aviso, não erro', () => {
    const r = lerPlanilha([
      ['NOME DA EMPRESA', 'NUMERO', 'SEGMENTO', 'PRIORIDADE', 'STATUS'],
      ['Buffet X', '34991355450', 'Padaria', 'Alta', 'Ligar depois'],
    ]);
    expect(r.ok && r.linhas[0]!.situacao).toBe('ok');
    expect(r.ok && r.linhas[0]!.avisos).toHaveLength(3);
    expect(r.ok && r.linhas[0]!.dados!.etapa).toBe('nao_contatado');
  });

  it('sem as colunas obrigatórias, explica o que falta', () => {
    const r = lerPlanilha([['empresa', 'cidade']]);
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('NOME DA EMPRESA e NUMERO') });
  });

  it('funciona com CSV de ponto e vírgula do Excel', () => {
    const r = lerPlanilha(
      separarCsv('﻿NOME DA EMPRESA;NUMERO;CIDADE\n"Buffet ""Top""";34991355450;Uberaba\n'),
    );
    expect(r.ok && r.linhas[0]!.dados).toMatchObject({ nome: 'Buffet "Top"', cidade: 'Uberaba' });
  });
});

describe('lerStatus', () => {
  it('traduz o STATUS da planilha para a etapa', () => {
    expect(lerStatus('')).toBe('nao_contatado');
    expect(lerStatus('Não contatado')).toBe('nao_contatado');
    expect(lerStatus('Mensagem 1 enviada')).toBe('mensagem_1');
    expect(lerStatus('Follow-up enviado')).toBe('followup');
    expect(lerStatus('Respondeu')).toBe('respondeu');
    expect(lerStatus('Em teste')).toBe('em_teste');
    expect(lerStatus('Fechou')).toBe('fechou');
    expect(lerStatus('Sem interesse')).toBe('sem_interesse');
    expect(lerStatus('qualquer coisa')).toBeNull();
  });
});
