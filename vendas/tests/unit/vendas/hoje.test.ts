import { describe, expect, it } from 'vitest';
import {
  cidadesParaAbordar,
  descreverAtraso,
  escolherCidade,
  filaAbordagem,
  followupsDeHoje,
  type LeadHoje,
} from '@/domain/vendas/hoje';

let n = 0;
const lead = (p: Partial<LeadHoje>): LeadHoje => ({
  id: `l${++n}`,
  nome: `Buffet ${n}`,
  cidade: 'Uberaba',
  uf: 'MG',
  prioridade: null,
  etapa: 'nao_contatado',
  proximoFollowup: null,
  naoContatar: false,
  dataEntrada: '2026-10-01',
  criadoEm: new Date(Date.UTC(2026, 9, 1, 0, 0, n)),
  ...p,
});

describe('abordar hoje', () => {
  const leads = [
    lead({ id: 'ub-c', prioridade: 'C' }),
    lead({ id: 'ub-b', prioridade: 'B' }),
    lead({ id: 'ub-a2', prioridade: 'A', dataEntrada: '2026-10-05' }),
    lead({ id: 'ub-a1', prioridade: 'A' }),
    lead({ id: 'ub-sem' }),
    lead({ id: 'ud-a', cidade: 'Uberlândia', prioridade: 'A' }),
    lead({ id: 'ud-b', cidade: 'Uberlândia', prioridade: 'B' }),
    lead({ id: 'ud-c', cidade: 'uberlandia', prioridade: 'C' }),
    lead({ id: 'contatado', etapa: 'mensagem_1', prioridade: 'A' }),
    lead({ id: 'nao-contatar', prioridade: 'A', naoContatar: true }),
  ];

  it('uma cidade por vez: a que tem mais A vem primeiro (mesma cidade com e sem acento junta)', () => {
    const cidades = cidadesParaAbordar(leads);
    expect(cidades.map((c) => [c.rotulo, c.a, c.total])).toEqual([
      ['Uberaba/MG', 2, 5],
      ['Uberlândia/MG', 1, 3],
    ]);
    expect(escolherCidade(cidades, null)!.rotulo).toBe('Uberaba/MG');
    expect(escolherCidade(cidades, cidades[1]!.chave)!.rotulo).toBe('Uberlândia/MG');
    expect(escolherCidade(cidades, 'nao-existe|')!.rotulo).toBe('Uberaba/MG');
  });

  it('A antes de B antes de C; no empate, quem entrou primeiro; só não contatados', () => {
    const cidade = cidadesParaAbordar(leads)[0]!.chave;
    expect(filaAbordagem(leads, cidade).map((l) => l.id)).toEqual([
      'ub-a1',
      'ub-a2',
      'ub-b',
      'ub-c',
      'ub-sem',
    ]);
  });
});

describe('follow-ups de hoje', () => {
  it('vencendo hoje ou atrasados, o mais atrasado primeiro; encerrados e não contatar ficam fora', () => {
    const leads = [
      lead({ id: 'hoje', etapa: 'mensagem_1', proximoFollowup: '2026-10-19' }),
      lead({ id: 'atrasado', etapa: 'followup', proximoFollowup: '2026-10-16' }),
      lead({ id: 'amanha', etapa: 'mensagem_1', proximoFollowup: '2026-10-20' }),
      lead({ id: 'fechou', etapa: 'fechou', proximoFollowup: '2026-10-10' }),
      lead({ id: 'parar', etapa: 'respondeu', proximoFollowup: '2026-10-10', naoContatar: true }),
      lead({ id: 'novo', etapa: 'nao_contatado', proximoFollowup: '2026-10-10' }),
    ];
    const f = followupsDeHoje(leads, '2026-10-19');
    expect(f.map((l) => [l.id, l.diasAtraso])).toEqual([
      ['atrasado', 3],
      ['hoje', 0],
    ]);
    expect(descreverAtraso(0)).toBe('Follow-up hoje');
    expect(descreverAtraso(1)).toBe('Atrasado 1 dia');
    expect(descreverAtraso(3)).toBe('Atrasado 3 dias');
  });
});
