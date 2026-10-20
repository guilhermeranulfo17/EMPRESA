import { diasEntre } from '../dates';
import { chaveCidade, rotuloCidade, type Prioridade } from './campos';
import { ETAPAS_ENCERRADAS, type EtapaVendas } from './etapas';

/*
 * Tela HOJE: quem abordar (Não contatado, A antes de B, uma cidade por vez) e quem tem follow-up
 * vencendo. Regras puras: o servidor só busca os leads.
 */

export type LeadHoje = {
  id: string;
  nome: string;
  cidade: string | null;
  uf: string | null;
  prioridade: Prioridade | null;
  etapa: EtapaVendas;
  proximoFollowup: string | null;
  naoContatar: boolean;
  dataEntrada: string;
  criadoEm: Date;
};

export type CidadeHoje = {
  chave: string;
  rotulo: string;
  total: number;
  a: number;
  b: number;
};

const PESO: Record<string, number> = { A: 0, B: 1, C: 2 };
const peso = (p: Prioridade | null) => (p ? PESO[p]! : 3);

const paraAbordar = (l: LeadHoje) => l.etapa === 'nao_contatado' && !l.naoContatar;

/** Cidades com gente para abordar: mais leads A primeiro, depois mais B, depois o total. */
export function cidadesParaAbordar(leads: LeadHoje[]): CidadeHoje[] {
  const mapa = new Map<string, CidadeHoje>();
  for (const l of leads.filter(paraAbordar)) {
    const chave = chaveCidade(l.cidade, l.uf);
    const c = mapa.get(chave) ?? {
      chave,
      rotulo: rotuloCidade(l.cidade, l.uf),
      total: 0,
      a: 0,
      b: 0,
    };
    c.total++;
    if (l.prioridade === 'A') c.a++;
    if (l.prioridade === 'B') c.b++;
    mapa.set(chave, c);
  }
  return [...mapa.values()].sort(
    (x, y) =>
      y.a - x.a || y.b - x.b || y.total - x.total || x.rotulo.localeCompare(y.rotulo, 'pt-BR'),
  );
}

/** A cidade pedida (se ainda tem gente) ou a primeira da lista. */
export function escolherCidade(cidades: CidadeHoje[], pedida: string | null): CidadeHoje | null {
  return cidades.find((c) => c.chave === pedida) ?? cidades[0] ?? null;
}

/** Não contatados da cidade: A, B, C, sem prioridade; no empate, quem entrou primeiro. */
export function filaAbordagem<T extends LeadHoje>(leads: T[], cidade: string): T[] {
  return leads
    .filter((l) => paraAbordar(l) && chaveCidade(l.cidade, l.uf) === cidade)
    .sort(
      (x, y) =>
        peso(x.prioridade) - peso(y.prioridade) ||
        x.dataEntrada.localeCompare(y.dataEntrada) ||
        x.criadoEm.getTime() - y.criadoEm.getTime(),
    );
}

export type FollowupHoje<T extends LeadHoje> = T & { diasAtraso: number };

/** Follow-ups vencendo hoje ou atrasados: o mais atrasado primeiro, depois A antes de B. */
export function followupsDeHoje<T extends LeadHoje>(leads: T[], hoje: string): FollowupHoje<T>[] {
  return leads
    .filter(
      (l) =>
        !l.naoContatar &&
        l.etapa !== 'nao_contatado' &&
        !ETAPAS_ENCERRADAS.includes(l.etapa) &&
        l.proximoFollowup !== null &&
        l.proximoFollowup <= hoje,
    )
    .map((l) => ({ ...l, diasAtraso: diasEntre(l.proximoFollowup!, hoje) }))
    .sort((x, y) => y.diasAtraso - x.diasAtraso || peso(x.prioridade) - peso(y.prioridade));
}

export function descreverAtraso(dias: number): string {
  if (dias <= 0) return 'Follow-up hoje';
  return dias === 1 ? 'Atrasado 1 dia' : `Atrasado ${dias} dias`;
}
