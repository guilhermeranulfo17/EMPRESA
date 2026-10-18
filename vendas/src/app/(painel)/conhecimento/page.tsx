import type { Metadata } from 'next';
import { CabecalhoPagina } from '@/components/cabecalho-pagina';
import { BaseConhecimento } from '@/components/conhecimento';
import { exigirGui } from '@/server/guard';
import { listarConhecimento } from '@/server/vendas/conhecimento';

export const metadata: Metadata = { title: 'Conhecimento' };
export const dynamic = 'force-dynamic';

export default async function PaginaConhecimento() {
  await exigirGui();
  const itens = await listarConhecimento();
  return (
    <>
      <CabecalhoPagina
        titulo="Conhecimento"
        descricao="O copiloto só afirma o que está aqui: produto, preços, objeções e scripts."
      />
      <BaseConhecimento itens={itens} />
    </>
  );
}
