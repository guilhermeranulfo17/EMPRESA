import { describe, expect, it } from 'vitest';
import {
  chaveCidade,
  lerPrioridade,
  lerSegmento,
  separarCidadeUf,
  ufDoTelefone,
} from '@/domain/vendas/campos';
import {
  digitosTelefone,
  ehCelular,
  formatarTelefone,
  linkWhatsApp,
  montarTelefone,
} from '@/domain/vendas/telefone';

describe('telefone', () => {
  it('compara só os dígitos: o mesmo número escrito de vários jeitos dá a mesma chave', () => {
    for (const t of [
      '(34) 99135-5450',
      '+55 34 99135-5450',
      '5534991355450',
      '034 99135 5450',
      '34991355450',
    ]) {
      expect(digitosTelefone(t)).toBe('34991355450');
    }
  });
  it('número inválido dá null', () => {
    expect(digitosTelefone('123')).toBeNull();
    expect(digitosTelefone('(20) 99999-9999')).toBeNull(); // DDD 20 não existe
    expect(digitosTelefone('')).toBeNull();
  });
  it('formata celular e fixo', () => {
    expect(formatarTelefone('34991355450')).toBe('(34) 99135-5450');
    expect(formatarTelefone('3432135450')).toBe('(34) 3213-5450');
  });
  it('WhatsApp só para celular, com o texto codificado', () => {
    expect(ehCelular('34991355450')).toBe(true);
    expect(ehCelular('3432135450')).toBe(false);
    expect(linkWhatsApp('3432135450')).toBeNull();
    expect(linkWhatsApp('34991355450', 'Oi! 50% & mais?')).toBe(
      'https://wa.me/5534991355450?text=Oi!%2050%25%20%26%20mais%3F',
    );
  });
  it('NUMERO fixo e WHATSAPP celular: telefone é o fixo, o link é do celular', () => {
    expect(montarTelefone('(34) 3213-5450', 'https://wa.me/5534991355450')).toEqual({
      telefone: '(34) 3213-5450',
      digitos: '3432135450',
      whatsapp: 'https://wa.me/5534991355450',
    });
    expect(montarTelefone('', '34991355450')?.digitos).toBe('34991355450');
    expect(montarTelefone('abc', '')).toBeNull();
  });
  it('UF pelo DDD', () => {
    expect(ufDoTelefone('34991355450')).toBe('MG');
    expect(ufDoTelefone('11999999999')).toBe('SP');
    expect(ufDoTelefone(null)).toBeNull();
  });
});

describe('cidade e UF', () => {
  it('separa os jeitos comuns de escrever', () => {
    expect(separarCidadeUf('Uberlândia - MG')).toEqual({ cidade: 'Uberlândia', uf: 'MG' });
    expect(separarCidadeUf('Uberlândia/mg')).toEqual({ cidade: 'Uberlândia', uf: 'MG' });
    expect(separarCidadeUf('Uberlândia (MG)')).toEqual({ cidade: 'Uberlândia', uf: 'MG' });
    expect(separarCidadeUf('Uberaba')).toEqual({ cidade: 'Uberaba', uf: null });
    expect(separarCidadeUf('SÃO JOSÉ DO RIO PRETO, SP')).toEqual({
      cidade: 'São José do Rio Preto',
      uf: 'SP',
    });
    expect(separarCidadeUf('')).toEqual({ cidade: null, uf: null });
  });
  it('mesma cidade com e sem acento cai no mesmo grupo', () => {
    expect(chaveCidade('Uberlândia', 'MG')).toBe(chaveCidade('uberlandia', 'MG'));
  });
});

describe('segmento e prioridade', () => {
  it('reconhece os quatro segmentos', () => {
    expect(lerSegmento('Buffet infantil')).toBe('buffet_infantil');
    expect(lerSegmento('Buffet / Catering')).toBe('buffet_catering');
    expect(lerSegmento('Espaço de eventos')).toBe('espaco_eventos');
    expect(lerSegmento('Doces')).toBe('doces');
    expect(lerSegmento('Confeitaria')).toBe('doces');
    expect(lerSegmento('Salão de festas')).toBe('espaco_eventos');
    expect(lerSegmento('Oficina mecânica')).toBeNull();
  });
  it('prioridade A, B ou C', () => {
    expect(lerPrioridade('a')).toBe('A');
    expect(lerPrioridade(' B ')).toBe('B');
    expect(lerPrioridade('Prioridade C')).toBe('C');
    expect(lerPrioridade('alta')).toBeNull();
    expect(lerPrioridade('')).toBeNull();
  });
});
