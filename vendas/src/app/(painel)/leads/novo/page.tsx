import type { Metadata } from 'next';
import Link from 'next/link';
import { FormLead } from '@/components/form-lead';
import { LEAD_VAZIO } from '@/domain/vendas/lead';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Novo lead' };
export const dynamic = 'force-dynamic';

export default async function NovoLeadVendas() {
  await exigirGui();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/leads" className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <h2 className="text-2xl font-bold tracking-tight">Novo lead</h2>
      <FormLead inicial={LEAD_VAZIO} />
    </div>
  );
}
