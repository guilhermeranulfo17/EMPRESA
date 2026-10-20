import { diasEntre, hojeNoFuso, somarDias, somarMeses } from '../dates';
import { chaveCidade, rotuloCidade } from './campos';
import { ETAPAS_RESPONDERAM, ETAPAS_VENDAS, type EtapaVendas } from './etapas';

/*
 * Números do painel, calculados a partir dos leads e do histórico de etapas. "Abordagem" é o
 * lead entrar em "Mensagem 1 enviada" (pelo botão do WhatsApp ou à mão; importação não conta).
 * Respondeu = está em Respondeu, Em teste ou Fechou, ou já passou por uma delas.
 */

export type LeadPainel = {
  id: string;
  etapa: EtapaVendas;
  cidade: string | null;
  uf: string | null;
};
export type MovimentoPainel = {
  leadId: string;
  para: EtapaVendas;
  origem: 'manual' | 'agente' | 'importacao' | 'mensagem' | 'automatico';
  criadoEm: Date;
};

/** Leads diferentes que receberam a Mensagem 1 em cada dia (data civil de São Paulo). */
export function abordagensPorDia(movimentos: MovimentoPainel[]): Map<string, number> {
  const porDia = new Map<string, Set<string>>();
  for (const m of movimentos) {
    if (m.para !== 'mensagem_1' || m.origem === 'importacao') continue;
    const dia = hojeNoFuso(undefined, m.criadoEm);
    const s = porDia.get(dia) ?? new Set<string>();
    s.add(m.leadId);
    porDia.set(dia, s);
  }
  return new Map([...porDia].map(([d, s]) => [d, s.size]));
}

export type Painel = {
  total: number;
  funil: { etapa: EtapaVendas; quantidade: number }[];
  contatados: number;
  responderam: number;
  /** 0 a 1; null sem nenhum contatado. */
  taxaResposta: number | null;
  fechados: number;
  semana: { dia: string; abordagens: number }[];
  porCidade: {
    rotulo: string;
    total: number;
    contatados: number;
    responderam: number;
    fechados: number;
  }[];
  metas: {
    inicio: string;
    primeiraVenda: { prazo: string; diasRestantes: number; feito: boolean };
    dezClientes: { prazo: string; diasRestantes: number; fechados: number; alvo: number };
  };
};

export function montarPainel(p: {
  leads: LeadPainel[];
  movimentos: MovimentoPainel[];
  hoje: string;
  inicioMetas: string;
}): Painel {
  const responderamIds = new Set(
    p.movimentos.filter((m) => ETAPAS_RESPONDERAM.includes(m.para)).map((m) => m.leadId),
  );
  const respondeu = (l: LeadPainel) =>
    ETAPAS_RESPONDERAM.includes(l.etapa) || responderamIds.has(l.id);
  const contatado = (l: LeadPainel) => l.etapa !== 'nao_contatado' || responderamIds.has(l.id);

  const contatados = p.leads.filter(contatado).length;
  const responderam = p.leads.filter(respondeu).length;
  const fechados = p.leads.filter((l) => l.etapa === 'fechou').length;

  const porDia = abordagensPorDia(p.movimentos);
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = somarDias(p.hoje, i - 6);
    return { dia, abordagens: porDia.get(dia) ?? 0 };
  });

  const cidades = new Map<string, Painel['porCidade'][number]>();
  for (const l of p.leads) {
    const chave = chaveCidade(l.cidade, l.uf);
    const c = cidades.get(chave) ?? {
      rotulo: rotuloCidade(l.cidade, l.uf),
      total: 0,
      contatados: 0,
      responderam: 0,
      fechados: 0,
    };
    c.total++;
    if (contatado(l)) c.contatados++;
    if (respondeu(l)) c.responderam++;
    if (l.etapa === 'fechou') c.fechados++;
    cidades.set(chave, c);
  }

  const prazo1 = somarMeses(p.inicioMetas, 1);
  const prazo3 = somarMeses(p.inicioMetas, 3);
  return {
    total: p.leads.length,
    funil: ETAPAS_VENDAS.map((etapa) => ({
      etapa,
      quantidade: p.leads.filter((l) => l.etapa === etapa).length,
    })),
    contatados,
    responderam,
    taxaResposta: contatados ? responderam / contatados : null,
    fechados,
    semana,
    porCidade: [...cidades.values()].sort(
      (a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo, 'pt-BR'),
    ),
    metas: {
      inicio: p.inicioMetas,
      primeiraVenda: {
        prazo: prazo1,
        diasRestantes: diasEntre(p.hoje, prazo1),
        feito: fechados > 0,
      },
      dezClientes: { prazo: prazo3, diasRestantes: diasEntre(p.hoje, prazo3), fechados, alvo: 10 },
    },
  };
}

/** 0,42 → "42%". */
export function porcentagem(v: number | null): string {
  return v === null ? 'Sem dados' : `${Math.round(v * 100)}%`;
}
