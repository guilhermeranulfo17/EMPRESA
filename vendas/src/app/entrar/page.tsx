import type { Metadata } from 'next';
import { FormEntrar } from '@/components/form-entrar';
import { Marca } from '@/components/marca';

export const metadata: Metadata = { title: 'Entrar' };

export default function Entrar() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="bg-card rounded-card w-full max-w-sm border p-6">
        <Marca />
        <h1 className="mt-8 text-3xl font-bold">Entrar</h1>
        <p className="text-muted-foreground mt-2 mb-8 text-sm">
          Quem abordar hoje, follow-ups e o funil num lugar só. Acesso só do Gui.
        </p>
        <FormEntrar />
      </div>
    </main>
  );
}
