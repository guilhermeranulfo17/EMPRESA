import { z } from 'zod';

/** Blocos reutilizáveis dos schemas (mensagens em português simples). */

export const nomeCurto = (rotulo = 'o nome', max = 80) =>
  z
    .string({ error: `Informe ${rotulo}.` })
    .trim()
    .min(1, `Informe ${rotulo}.`)
    .max(max, `Use no máximo ${max} caracteres.`);

export const textoOpcional = (max: number) =>
  z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

export const dataCivil = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.')
  .refine((d) => {
    const [a, m, dia] = d.split('-').map(Number) as [number, number, number];
    const utc = new Date(Date.UTC(a, m - 1, dia));
    return utc.getUTCFullYear() === a && utc.getUTCMonth() === m - 1 && utc.getUTCDate() === dia;
  }, 'Informe uma data válida.');
