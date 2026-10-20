import type { Metadata } from 'next';
import Link from 'next/link';
import { Importar } from '@/components/importar';
import { ROTAS } from '@/lib/rotas';
import { exigirGui } from '@/server/guard';
import { listarPastaImport } from '@/server/vendas/arquivos';

export const metadata: Metadata = { title: 'Importar planilha' };
export const dynamic = 'force-dynamic';

export default async function PaginaImportar() {
  await exigirGui();
  const pasta = await listarPastaImport();
  return (
    <div className="flex flex-col gap-4">
      <Link href={ROTAS.leads} className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <h1 className="text-3xl font-bold">Importar planilha</h1>
      <Importar pasta={pasta} />
    </div>
  );
}
