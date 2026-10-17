import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { urlBanco } from '@/server/env';
import * as schema from './schema';

/*
 * Conexão do servidor (DATABASE_URL, nunca no navegador). Na Vercel, use a string do pooler do
 * Supabase em modo transação (porta 6543): por isso prepare: false.
 */

export type Db = PostgresJsDatabase<typeof schema>;

const global = globalThis as unknown as { __dbVendas?: Db };

export function obterDb(): Db {
  global.__dbVendas ??= drizzle(postgres(urlBanco(), { max: 5, prepare: false }), { schema });
  return global.__dbVendas;
}
