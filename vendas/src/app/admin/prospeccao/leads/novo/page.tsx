import type { Metadata } from 'next';
import Link from 'next/link';
import { FormLead } from '@/components/form-lead';
import { hojeNoFuso } from '@/domain/dates';
import { LEAD_VAZIO } from '@/domain/vendas/lead';
import { ROTAS } from '@/lib/rotas';
import { exigirGui } from '@/server/guard';

export const metadata: Metadata = { title: 'Novo lead' };
export const dynamic = 'force-dynamic';

export default async function NovoLead() {
  await exigirGui();
  return (
    <div className="flex flex-col gap-4">
      <Link href={ROTAS.leads} className="text-primary text-sm font-semibold">
        ← Leads
      </Link>
      <h1 className="text-3xl font-bold">Novo lead</h1>
      <div className="bg-card rounded-card border p-4">
        <FormLead inicial={{ ...LEAD_VAZIO, dataEntrada: hojeNoFuso() }} />
      </div>
    </div>
  );
}
