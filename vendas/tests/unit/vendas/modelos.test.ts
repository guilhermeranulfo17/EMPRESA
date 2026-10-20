import { describe, expect, it } from 'vitest';
import { deveEncerrar, planoEnvio, preencherModelo, proximoModelo } from '@/domain/vendas/modelos';

const HOJE = '2026-10-19';

describe('preencherModelo', () => {
  it('troca {nome}, {cidade} e {segmento}', () => {
    expect(
      preencherModelo('Oi! Vi o {nome} aí em {cidade}. Vocês fazem {segmento}?', {
        nome: 'Buffet Sol',
        cidade: 'Uberaba',
        segmento: 'buffet_infantil',
      }),
    ).toBe('Oi! Vi o Buffet Sol aí em Uberaba. Vocês fazem buffet infantil?');
  });
  it('sem o dado, a variável some sem deixar espaço sobrando', () => {
    expect(
      preencherModelo('Oi {nome}, tudo bem {cidade}?', {
        nome: 'Sol',
        cidade: null,
        segmento: null,
      }),
    ).toBe('Oi Sol, tudo bem?');
  });
});

describe('cadência do botão do WhatsApp', () => {
  it('Mensagem 1: etapa Mensagem 1 enviada e follow-up em 2 dias', () => {
    expect(planoEnvio({ etapa: 'nao_contatado', ultimoModelo: null }, 'mensagem_1', HOJE)).toEqual({
      etapa: 'mensagem_1',
      proximoFollowup: '2026-10-21',
      motivo: 'Mensagem 1 enviada pelo WhatsApp',
    });
  });
  it('Follow-up D+2: Follow-up enviado e próximo em 3 dias (D+5)', () => {
    expect(
      planoEnvio({ etapa: 'mensagem_1', ultimoModelo: 'mensagem_1' }, 'followup_2', '2026-10-21'),
    ).toMatchObject({
      etapa: 'followup',
      proximoFollowup: '2026-10-24',
    });
  });
  it('Follow-up D+5: continua em Follow-up enviado, prazo final em 3 dias', () => {
    expect(
      planoEnvio({ etapa: 'followup', ultimoModelo: 'followup_2' }, 'followup_5', '2026-10-24'),
    ).toMatchObject({
      etapa: 'followup',
      proximoFollowup: '2026-10-27',
    });
  });
  it('respostas prontas: o lead respondeu, novo contato em 2 dias', () => {
    expect(
      planoEnvio({ etapa: 'mensagem_1', ultimoModelo: 'mensagem_1' }, 'quanto_custa', HOJE),
    ).toMatchObject({
      etapa: 'respondeu',
      proximoFollowup: '2026-10-21',
    });
  });
  it('quem já respondeu, está em teste ou fechou não volta de etapa', () => {
    expect(planoEnvio({ etapa: 'em_teste', ultimoModelo: null }, 'followup_2', HOJE)).toMatchObject(
      {
        etapa: 'em_teste',
        proximoFollowup: '2026-10-21',
      },
    );
    expect(planoEnvio({ etapa: 'fechou', ultimoModelo: null }, 'sem_tempo', HOJE)).toMatchObject({
      etapa: 'fechou',
      proximoFollowup: null,
    });
  });

  it('próximo modelo sugerido: M1, depois D+2, depois D+5, depois conversa', () => {
    expect(proximoModelo({ etapa: 'nao_contatado', ultimoModelo: null })).toBe('mensagem_1');
    expect(proximoModelo({ etapa: 'mensagem_1', ultimoModelo: 'mensagem_1' })).toBe('followup_2');
    expect(proximoModelo({ etapa: 'followup', ultimoModelo: 'followup_2' })).toBe('followup_5');
    expect(proximoModelo({ etapa: 'followup', ultimoModelo: 'followup_5' })).toBeNull();
    expect(proximoModelo({ etapa: 'respondeu', ultimoModelo: 'quanto_custa' })).toBeNull();
  });

  it('sem resposta até o prazo final do D+5: vai para Sem interesse', () => {
    const lead = {
      etapa: 'followup' as const,
      ultimoModelo: 'followup_5' as const,
      proximoFollowup: '2026-10-27',
    };
    expect(deveEncerrar(lead, '2026-10-26')).toBe(false);
    expect(deveEncerrar(lead, '2026-10-27')).toBe(true);
    expect(deveEncerrar({ ...lead, ultimoModelo: 'followup_2' }, '2026-10-30')).toBe(false);
    expect(deveEncerrar({ ...lead, etapa: 'respondeu' }, '2026-10-30')).toBe(false);
  });
});
