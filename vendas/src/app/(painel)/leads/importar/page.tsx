import type { Metadata } from 'next';
import Link from 'next/link';
import { ImportarCsv } from '@/components/importar-csv';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Importar CSV' };
export const dynamic = 'force-dynamic';

export default async function ImportarLeads() {
  await exigirGui();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/leads" className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <h2 className="text-2xl font-bold tracking-tight">Importar leads por CSV</h2>
      <ImportarCsv />
    </div>
  );
}
