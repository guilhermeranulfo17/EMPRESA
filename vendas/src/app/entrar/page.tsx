import type { Metadata } from 'next';
import { FormEntrar } from '@/components/form-entrar';

export const metadata: Metadata = { title: 'Entrar' };

export default function Entrar() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <header>
        <h1 className="text-2xl font-bold">Vendas Orkestra</h1>
        <p className="text-muted-foreground text-sm">Acesso só do Gui.</p>
      </header>
      <div className="bg-card rounded-card border p-5">
        <FormEntrar />
      </div>
    </main>
  );
}
