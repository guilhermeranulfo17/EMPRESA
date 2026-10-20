import { describe, expect, it } from 'vitest';
import { ETAPAS_VENDAS, ROTULO_ETAPA_VENDAS } from '@/domain/vendas/etapas';
import { LEAD_VAZIO, leadVendasSchema, normalizarBusca } from '@/domain/vendas/lead';

describe('lead de prospecção', () => {
  it('as sete etapas na ordem do funil, cada uma com rótulo', () => {
    expect(ETAPAS_VENDAS.map((e) => ROTULO_ETAPA_VENDAS[e])).toEqual([
      'Não contatado',
      'Mensagem 1 enviada',
      'Follow-up enviado',
      'Respondeu',
      'Em teste',
      'Fechou',
      'Sem interesse',
    ]);
  });

  it('aceita só o nome; campos vazios viram null', () => {
    const r = leadVendasSchema.parse({ ...LEAD_VAZIO, nome: '  Buffet Sol  ' });
    expect(r).toEqual({
      nome: 'Buffet Sol',
      cidade: null,
      uf: null,
      telefone: null,
      categoria: null,
      segmento: null,
      prioridade: null,
      avaliacoes: null,
      origem: null,
      dataEntrada: null,
      proximoFollowup: null,
      observacoes: null,
      naoContatar: false,
    });
  });

  it('telefone vira texto formatado, dígitos e link do WhatsApp (só celular)', () => {
    const cel = leadVendasSchema.parse({
      ...LEAD_VAZIO,
      nome: 'Sol',
      telefone: '+55 34 99135-5450',
    });
    expect(cel.telefone).toEqual({
      telefone: '(34) 99135-5450',
      digitos: '34991355450',
      whatsapp: 'https://wa.me/5534991355450',
    });
    const fixo = leadVendasSchema.parse({ ...LEAD_VAZIO, nome: 'Sol', telefone: '3432135450' });
    expect(fixo.telefone).toEqual({
      telefone: '(34) 3213-5450',
      digitos: '3432135450',
      whatsapp: null,
    });
  });

  it('recusa telefone inválido, UF inválida, data inválida e nome curto com mensagens simples', () => {
    const r = leadVendasSchema.safeParse({
      ...LEAD_VAZIO,
      nome: 'A',
      telefone: '123',
      uf: 'XX',
      proximoFollowup: '2026-02-30',
    });
    expect(r.success).toBe(false);
    const msgs = Object.fromEntries(r.error!.issues.map((i) => [i.path[0], i.message]));
    expect(msgs).toEqual({
      nome: 'Informe o nome da empresa.',
      telefone: 'Informe um telefone válido com DDD.',
      uf: 'UF inválida.',
      proximoFollowup: 'Informe uma data válida.',
    });
  });

  it('busca sem acento e sem diferença de maiúsculas', () => {
    expect(normalizarBusca('  São JOSÉ ')).toBe('sao jose');
  });
});
