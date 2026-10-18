import { describe, expect, it } from 'vitest';
import {
  classificar,
  descreverMotivo,
  instrucaoGerada,
  montarFila,
  proximoAngulo,
  tipoParaGerar,
  type LeadFila,
} from '@/domain/vendas/fila';

const HOJE = '2026-10-18';
let n = 0;
const lead = (extra: Partial<LeadFila> = {}): LeadFila => ({
  id: `l${++n}`,
  nome: `Lead ${n}`,
  buffet: null,
  cidade: null,
  etapa: 'novo',
  resumo: null,
  proximoFollowup: null,
  tentativas: 0,
  naoContatar: false,
  temSugestaoPendente: false,
  criadoEm: new Date(`2026-10-0${(n % 9) + 1}T12:00:00Z`),
  ...extra,
});

describe('classificar', () => {
  it('lead novo sem follow-up entra como novo', () => {
    expect(classificar(lead(), HOJE)?.motivo).toBe('novo');
  });
  it('follow-up vencido conta os dias de atraso; o de hoje é "hoje"', () => {
    const a = classificar(lead({ etapa: 'abordado', proximoFollowup: '2026-10-15' }), HOJE);
    expect(a).toMatchObject({ motivo: 'atrasado', diasAtraso: 3 });
    expect(descreverMotivo(a!)).toBe('Follow-up atrasado há 3 dias');
    expect(classificar(lead({ etapa: 'abordado', proximoFollowup: HOJE }), HOJE)?.motivo).toBe(
      'hoje',
    );
  });
  it('follow-up futuro e lead já abordado sem data não entram', () => {
    expect(
      classificar(lead({ etapa: 'abordado', proximoFollowup: '2026-10-20' }), HOJE),
    ).toBeNull();
    expect(classificar(lead({ etapa: 'respondeu' }), HOJE)).toBeNull();
  });
  it('não contatar, cliente e perdido nunca entram', () => {
    expect(classificar(lead({ naoContatar: true }), HOJE)).toBeNull();
    expect(classificar(lead({ etapa: 'cliente', proximoFollowup: HOJE }), HOJE)).toBeNull();
    expect(classificar(lead({ etapa: 'perdido', proximoFollowup: HOJE }), HOJE)).toBeNull();
  });
  it('3 tentativas sem resposta e follow-up vencido: encerrar', () => {
    expect(
      classificar(lead({ etapa: 'abordado', tentativas: 3, proximoFollowup: HOJE }), HOJE)?.motivo,
    ).toBe('encerrar');
    expect(
      classificar(lead({ etapa: 'abordado', tentativas: 3, proximoFollowup: '2026-10-30' }), HOJE),
    ).toBeNull();
  });
  it('sugestão pendente vem antes de tudo', () => {
    expect(classificar(lead({ temSugestaoPendente: true, tentativas: 3 }), HOJE)?.motivo).toBe(
      'pendente',
    );
  });
});

describe('montarFila', () => {
  it('ordena: pendente, atrasados (mais atrasado primeiro), hoje, novos (mais antigos), encerrar', () => {
    const fila = montarFila(
      [
        lead({ nome: 'novo', criadoEm: new Date('2026-10-10T00:00:00Z') }),
        lead({ nome: 'novo antigo', criadoEm: new Date('2026-10-01T00:00:00Z') }),
        lead({ nome: 'hoje', etapa: 'abordado', proximoFollowup: HOJE }),
        lead({ nome: 'atrasado 1', etapa: 'abordado', proximoFollowup: '2026-10-17' }),
        lead({ nome: 'atrasado 5', etapa: 'abordado', proximoFollowup: '2026-10-13' }),
        lead({ nome: 'encerrar', etapa: 'abordado', tentativas: 3, proximoFollowup: HOJE }),
        lead({ nome: 'pendente', etapa: 'interessado', temSugestaoPendente: true }),
        lead({ nome: 'fora', naoContatar: true }),
      ],
      HOJE,
    );
    expect(fila.map((i) => i.nome)).toEqual([
      'pendente',
      'atrasado 5',
      'atrasado 1',
      'hoje',
      'novo antigo',
      'novo',
      'encerrar',
    ]);
  });
});

describe('mensagem gerada pela fila', () => {
  it('lead novo recebe abordagem; o resto, follow-up', () => {
    expect(tipoParaGerar({ etapa: 'novo', tentativas: 0 })).toBe('abordagem');
    expect(tipoParaGerar({ etapa: 'abordado', tentativas: 1 })).toBe('followup');
  });
  it('a instrução do follow-up lista os ângulos usados e avisa da última tentativa', () => {
    const t = instrucaoGerada('followup', 2, ['abertura', 'lembrete']);
    expect(t).toContain('tentativa 3 de 3');
    expect(t).toContain('abertura, lembrete');
    expect(t).toContain('ultima_chamada');
    expect(instrucaoGerada('abordagem', 0, [])).toContain('primeira abordagem');
  });
  it('próximo ângulo é o primeiro ainda não usado', () => {
    expect(proximoAngulo(['abertura'])).toBe('lembrete');
    expect(proximoAngulo(['lembrete', 'valor_novo'])).toBe('prova_social');
    expect(proximoAngulo(['lembrete', 'valor_novo', 'prova_social', 'ultima_chamada'])).toBe(
      'ultima_chamada',
    );
  });
});
