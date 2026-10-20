import { z } from 'zod';
import { dataCivil, nomeCurto, textoOpcional } from '../validacao';
import { lerUf, PRIORIDADES, SEGMENTOS } from './campos';
import { montarTelefone, type Telefone } from './telefone';

/*
 * Lead de prospecção (buffet que o Gui quer vender o Orkestra). Validação compartilhada entre o
 * formulário e a server action. A etapa não entra aqui: ela muda pelo funil (com histórico).
 */

const vazioParaNull = (v: string) => (v === '' ? null : v);

export const leadVendasSchema = z.object({
  nome: nomeCurto('o nome da empresa', 120).refine(
    (v) => v.length >= 2,
    'Informe o nome da empresa.',
  ),
  cidade: textoOpcional(120).transform(vazioParaNull),
  uf: z
    .string()
    .trim()
    .refine((v) => v === '' || lerUf(v) !== null, 'UF inválida.')
    .transform((v) => (v === '' ? null : lerUf(v))),
  telefone: z
    .string()
    .trim()
    .refine((v) => v === '' || montarTelefone(v) !== null, 'Informe um telefone válido com DDD.')
    .transform((v): Telefone | null => (v === '' ? null : montarTelefone(v))),
  categoria: textoOpcional(120).transform(vazioParaNull),
  segmento: z.union([z.literal(''), z.enum(SEGMENTOS)]).transform((v) => (v === '' ? null : v)),
  prioridade: z.union([z.literal(''), z.enum(PRIORIDADES)]).transform((v) => (v === '' ? null : v)),
  avaliacoes: textoOpcional(40).transform(vazioParaNull),
  origem: textoOpcional(80).transform(vazioParaNull),
  dataEntrada: z.union([z.literal(''), dataCivil]).transform(vazioParaNull),
  proximoFollowup: z.union([z.literal(''), dataCivil]).transform(vazioParaNull),
  observacoes: textoOpcional(4000).transform(vazioParaNull),
  naoContatar: z.boolean(),
});
export type LeadVendasEntrada = z.input<typeof leadVendasSchema>;
export type LeadVendasDados = z.output<typeof leadVendasSchema>;

export const LEAD_VAZIO: LeadVendasEntrada = {
  nome: '',
  cidade: '',
  uf: '',
  telefone: '',
  categoria: '',
  segmento: '',
  prioridade: '',
  avaliacoes: '',
  origem: '',
  dataEntrada: '',
  proximoFollowup: '',
  observacoes: '',
  naoContatar: false,
};

/** Busca da lista: casa nome, cidade ou categoria sem acento. */
export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
