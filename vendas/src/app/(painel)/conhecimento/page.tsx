import type { Metadata } from 'next';
import { BaseConhecimento } from '@/components/conhecimento';
import { exigirGui } from '@/server/guard';
import { listarConhecimento } from '@/server/vendas/conhecimento';

export const metadata: Metadata = { title: 'Conhecimento' };
export const dynamic = 'force-dynamic';

export default async function PaginaConhecimento() {
  await exigirGui();
  const itens = await listarConhecimento();
  return <BaseConhecimento itens={itens} />;
}
