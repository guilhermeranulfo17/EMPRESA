import { describe, expect, it } from 'vitest';
import {
  abordagensPorDia,
  montarPainel,
  porcentagem,
  type MovimentoPainel,
} from '@/domain/vendas/painel';

// 12h em São Paulo = 15h UTC
const em = (dia: string, hora = 15) => new Date(`${dia}T${String(hora).padStart(2, '0')}:00:00Z`);

describe('abordagensPorDia', () => {
  it('conta leads diferentes que receberam a Mensagem 1 no dia de São Paulo; importação não conta', () => {
    const m: MovimentoPainel[] = [
      { leadId: 'a', para: 'mensagem_1', origem: 'mensagem', criadoEm: em('2026-10-19') },
      { leadId: 'a', para: 'mensagem_1', origem: 'manual', criadoEm: em('2026-10-19', 16) },
      { leadId: 'b', para: 'mensagem_1', origem: 'manual', criadoEm: em('2026-10-19') },
      { leadId: 'c', para: 'mensagem_1', origem: 'importacao', criadoEm: em('2026-10-19') },
      // 01h UTC do dia 20 ainda é dia 19 em São Paulo
      { leadId: 'd', para: 'mensagem_1', origem: 'mensagem', criadoEm: em('2026-10-20', 1) },
      { leadId: 'e', para: 'followup', origem: 'mensagem', criadoEm: em('2026-10-19') },
    ];
    expect(Object.fromEntries(abordagensPorDia(m))).toEqual({ '2026-10-19': 3 });
  });
});

describe('montarPainel', () => {
  const p = montarPainel({
    hoje: '2026-10-19',
    inicioMetas: '2026-10-01',
    leads: [
      { id: '1', etapa: 'nao_contatado', cidade: 'Uberaba', uf: 'MG' },
      { id: '2', etapa: 'mensagem_1', cidade: 'Uberaba', uf: 'MG' },
      { id: '3', etapa: 'respondeu', cidade: 'Uberaba', uf: 'MG' },
      { id: '4', etapa: 'fechou', cidade: 'Uberlândia', uf: 'MG' },
      // respondeu e depois disse não: conta como resposta
      { id: '5', etapa: 'sem_interesse', cidade: 'Uberlândia', uf: 'MG' },
    ],
    movimentos: [
      { leadId: '2', para: 'mensagem_1', origem: 'mensagem', criadoEm: em('2026-10-18') },
      { leadId: '5', para: 'respondeu', origem: 'agente', criadoEm: em('2026-10-17') },
      { leadId: '5', para: 'mensagem_1', origem: 'mensagem', criadoEm: em('2026-10-13') },
    ],
  });

  it('funil, contatados, taxa de resposta e fechados', () => {
    expect(p.total).toBe(5);
    expect(p.funil.map((f) => f.quantidade)).toEqual([1, 1, 0, 1, 0, 1, 1]);
    expect(p.contatados).toBe(4);
    expect(p.responderam).toBe(3);
    expect(porcentagem(p.taxaResposta)).toBe('75%');
    expect(p.fechados).toBe(1);
  });

  it('os últimos 7 dias, terminando hoje', () => {
    expect(p.semana.map((s) => s.dia)).toEqual([
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
      '2026-10-19',
    ]);
    expect(p.semana.map((s) => s.abordagens)).toEqual([1, 0, 0, 0, 0, 1, 0]);
  });

  it('por cidade, da que tem mais leads para a que tem menos', () => {
    expect(p.porCidade).toEqual([
      { rotulo: 'Uberaba/MG', total: 3, contatados: 2, responderam: 1, fechados: 0 },
      { rotulo: 'Uberlândia/MG', total: 2, contatados: 2, responderam: 2, fechados: 1 },
    ]);
  });

  it('metas: primeira venda em 1 mês e 10 clientes em 3 meses a partir do início', () => {
    expect(p.metas.primeiraVenda).toEqual({ prazo: '2026-11-01', diasRestantes: 13, feito: true });
    expect(p.metas.dezClientes).toEqual({
      prazo: '2027-01-01',
      diasRestantes: 74,
      fechados: 1,
      alvo: 10,
    });
  });

  it('sem ninguém contatado, a taxa não é 0%', () => {
    expect(
      porcentagem(
        montarPainel({ hoje: '2026-10-19', inicioMetas: '2026-10-19', leads: [], movimentos: [] })
          .taxaResposta,
      ),
    ).toBe('Sem dados');
  });
});
