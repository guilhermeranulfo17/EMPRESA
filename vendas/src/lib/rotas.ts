/** Endereços da área de prospecção (só o Gui entra). */
export const BASE = '/admin/prospeccao';

export const ROTAS = {
  hoje: BASE,
  leads: `${BASE}/leads`,
  novoLead: `${BASE}/leads/novo`,
  importar: `${BASE}/leads/importar`,
  lead: (id: string) => `${BASE}/leads/${id}`,
  funil: `${BASE}/funil`,
  mensagens: `${BASE}/mensagens`,
  painel: `${BASE}/painel`,
  conhecimento: `${BASE}/conhecimento`,
  exemplos: `${BASE}/exemplos`,
  ia: `${BASE}/ia`,
} as const;
