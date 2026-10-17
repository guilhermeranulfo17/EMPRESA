import { Abas } from '@/components/abas';
import { sair } from '@/server/actions/acesso';
import { exigirGui } from '@/server/guard';

/** Área logada. Cada página também chama exigirGui(): o layout não protege as server actions. */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const usuario = await exigirGui();
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6" data-testid="painel">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Vendas Orkestra</h1>
          <form action={sair} className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{usuario.email}</span>
            <button type="submit" className="rounded-control min-h-11 border px-4 font-semibold">
              Sair
            </button>
          </form>
        </div>
        <Abas />
      </header>
      <main>{children}</main>
    </div>
  );
}
