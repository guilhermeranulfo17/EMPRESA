import { LogOut, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Abas } from '@/components/abas';
import { Marca } from '@/components/marca';
import { sair } from '@/server/actions/acesso';
import { exigirGui } from '@/server/guard';

/**
 * Área logada: menu lateral no PC e faixa no topo no celular (o mesmo menu, um só no HTML).
 * Cada página também chama exigirGui(): o layout não protege as server actions.
 */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const usuario = await exigirGui();
  return (
    <div className="min-h-dvh lg:flex" data-testid="painel">
      <aside className="bg-card flex flex-wrap items-center gap-x-3 gap-y-3 border-b px-4 py-3 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:flex-nowrap lg:items-stretch lg:gap-8 lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <Link href="/" className="flex-1 lg:flex-none lg:px-2">
          <Marca />
        </Link>
        <form
          action={sair}
          className="flex items-center gap-1.5 lg:order-last lg:mt-auto lg:flex-col lg:items-stretch lg:gap-1 lg:border-t lg:pt-4"
        >
          <Link
            href="/ia"
            className="rounded-control text-muted-foreground hover:bg-muted hover:text-foreground inline-flex min-h-10 items-center gap-2 px-3 text-sm font-medium"
            data-testid="link-ia"
          >
            <Sparkles className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Testar IA</span>
          </Link>
          <span className="text-muted-foreground hidden truncate px-3 pt-2 text-xs lg:block">
            {usuario.email}
          </span>
          <button
            type="submit"
            className="rounded-control text-muted-foreground hover:bg-muted hover:text-foreground inline-flex min-h-10 items-center gap-2 px-3 text-sm font-medium"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Sair</span>
          </button>
        </form>
        <Abas />
      </aside>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
