import type { Metadata } from 'next';
import { Asterisk } from 'lucide-react';
import { FormEntrar } from '@/components/form-entrar';
import { Marca } from '@/components/marca';

export const metadata: Metadata = { title: 'Entrar' };

export default function Entrar() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="bg-card grid w-full max-w-sm overflow-hidden rounded-[28px] p-2.5 shadow-[0_30px_80px_-30px_rgb(75_59_245/0.35)] md:max-w-4xl md:grid-cols-2">
        <section className="gradiente-marca hidden min-h-[520px] flex-col justify-between rounded-[22px] p-8 text-white md:flex">
          <Asterisk className="size-11" strokeWidth={2.75} aria-hidden />
          <div>
            <p className="text-sm text-white/85">Seu copiloto de vendas</p>
            <p className="mt-2 text-3xl leading-tight font-bold tracking-tight">
              Saiba quem chamar hoje e o que dizer.
            </p>
          </div>
        </section>
        <section className="flex flex-col justify-center px-5 py-8 md:px-12">
          <div className="mb-8 md:hidden">
            <Marca />
          </div>
          <Asterisk
            className="text-primary mb-3 hidden size-7 md:block"
            strokeWidth={2.75}
            aria-hidden
          />
          <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
          <p className="text-muted-foreground mt-2 mb-8 text-sm">
            Fila do dia, conversas e follow-ups num lugar só. Acesso só do Gui.
          </p>
          <FormEntrar />
        </section>
      </div>
    </main>
  );
}
