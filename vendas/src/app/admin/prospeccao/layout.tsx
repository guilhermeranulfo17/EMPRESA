import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { MaisCelular, MenuCelular, MenuLateral } from '@/components/abas';
import { Marca } from '@/components/marca';
import { ROTAS } from '@/lib/rotas';
import { sair } from '@/server/actions/acesso';
import { exigirGui } from '@/server/guard';

/**
 * Área de prospecção (/admin/prospeccao), só para o e-mail do Gui (VENDAS_EMAILS). No celular:
 * topo com o "Mais" e menu fixo embaixo. No PC: menu lateral. Cada página e cada ação também
 * conferem o login (o layout não protege as server actions).
 */
export default async function LayoutProspeccao({ children }: { children: React.ReactNode }) {
  const usuario = await exigirGui();
  const botaoSair = (
    <form action={sair}>
      <button
        type="submit"
        className="rounded-control text-muted-foreground hover:bg-muted hover:text-foreground flex min-h-12 w-full items-center gap-3 px-3 text-sm font-medium lg:min-h-10"
      >
        <LogOut className="size-5 lg:size-[18px]" aria-hidden />
        Sair
      </button>
    </form>
  );
  return (
    <div className="min-h-dvh lg:flex" data-testid="painel">
      <header className="bg-background/95 sticky top-0 z-20 flex items-center justify-between border-b px-4 py-2 backdrop-blur lg:hidden">
        <Link href={ROTAS.hoje} aria-label="Hoje">
          <Marca />
        </Link>
        <MaisCelular>{botaoSair}</MaisCelular>
      </header>
      <aside className="bg-card hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:gap-8 lg:border-r lg:px-4 lg:py-6">
        <Link href={ROTAS.hoje} className="px-2">
          <Marca />
        </Link>
        <MenuLateral />
        <div className="mt-auto flex flex-col gap-1 border-t pt-4">
          <span className="text-muted-foreground truncate px-3 text-xs">{usuario.email}</span>
          {botaoSair}
        </div>
      </aside>
      <main className="pb-menu mx-auto w-full max-w-5xl min-w-0 px-4 pt-4 lg:px-10 lg:pt-10">
        {children}
      </main>
      <MenuCelular />
    </div>
  );
}
