import { describe, expect, it } from 'vitest';
import { lerPlanilha } from '@/domain/vendas/planilha';
import { ErroXlsx, lerXlsx } from '@/server/vendas/xlsx';
import { criarXlsx } from '../../apoio/xlsx';

describe('lerXlsx', () => {
  it('lê a primeira aba (pelo workbook), textos compartilhados, números e células vazias', () => {
    const bytes = criarXlsx([
      ['NOME DA EMPRESA', 'AVALIAÇÕES', 'NUMERO'],
      ['Buffet & Cia <Sol>', 4.8, 34991355450],
      ['Buffet Lua', null, '(34) 3213-5450'],
    ]);
    expect(lerXlsx(bytes)).toEqual([
      ['NOME DA EMPRESA', 'AVALIAÇÕES', 'NUMERO'],
      ['Buffet & Cia <Sol>', '4.8', '34991355450'],
      ['Buffet Lua', '', '(34) 3213-5450'],
    ]);
  });

  it('arquivo que não é XLSX dá um erro claro', () => {
    expect(() => lerXlsx(Buffer.from('nome;telefone'))).toThrow(ErroXlsx);
  });

  it('XLSX direto para a importação', () => {
    const r = lerPlanilha(
      lerXlsx(
        criarXlsx([
          ['NOME DA EMPRESA', 'NUMERO', 'PRIORIDADE'],
          ['Buffet Sol', 34991355450, 'B'],
        ]),
      ),
    );
    expect(r.ok && r.linhas[0]!.dados).toMatchObject({
      telefone: '(34) 99135-5450',
      prioridade: 'B',
    });
  });
});
