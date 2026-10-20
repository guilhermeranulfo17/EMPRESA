'use client';

import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Columns3,
  Ellipsis,
  MessageSquareText,
  Sparkles,
  Star,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROTAS } from '@/lib/rotas';
import { cn } from '@/lib/utils';

/** As 5 telas do dia a dia: menu fixo embaixo no celular, lista no menu lateral do PC. */
const PRINCIPAIS = [
  { href: ROTAS.hoje, rotulo: 'Hoje', Icone: CalendarCheck },
  { href: ROTAS.leads, rotulo: 'Leads', Icone: Users },
  { href: ROTAS.funil, rotulo: 'Funil', Icone: Columns3 },
  { href: ROTAS.mensagens, rotulo: 'Mensagens', Icone: MessageSquareText },
  { href: ROTAS.painel, rotulo: 'Painel', Icone: BarChart3 },
] as const;

/** O resto fica no "Mais" do celular e embaixo no menu do PC. */
export const SECUNDARIAS = [
  { href: ROTAS.importar, rotulo: 'Importar planilha', Icone: Upload },
  { href: ROTAS.conhecimento, rotulo: 'Base da IA', Icone: BookOpen },
  { href: ROTAS.exemplos, rotulo: 'Exemplos da IA', Icone: Star },
  { href: ROTAS.ia, rotulo: 'Testar IA', Icone: Sparkles },
] as const;

function ativa(caminho: string, href: string) {
  return href === ROTAS.hoje ? caminho === href : caminho.startsWith(href);
}

/** Menu de baixo do celular: 5 botões grandes, no alcance do polegar. */
export function MenuCelular() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Telas"
      className="bg-card/95 fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRINCIPAIS.map(({ href, rotulo, Icone }) => {
          const atual = ativa(caminho, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={atual ? 'page' : undefined}
                data-testid={`menu-${rotulo}`}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                  atual ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icone className="size-[22px]" aria-hidden strokeWidth={atual ? 2.5 : 2} />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** "Mais" do topo no celular: importar, ajustes da IA e sair. */
export function MaisCelular({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  return (
    <details key={caminho} className="relative lg:hidden">
      <summary
        className="rounded-control text-muted-foreground grid size-11 cursor-pointer list-none place-items-center [&::-webkit-details-marker]:hidden"
        aria-label="Mais opções"
      >
        <Ellipsis className="size-6" aria-hidden />
      </summary>
      <div className="bg-card rounded-card absolute right-0 z-40 mt-2 flex w-60 flex-col gap-1 border p-2 shadow-2xl">
        {SECUNDARIAS.map(({ href, rotulo, Icone }) => (
          <Link
            key={href}
            href={href}
            className="rounded-control hover:bg-muted flex min-h-12 items-center gap-3 px-3 text-sm font-medium"
          >
            <Icone className="text-muted-foreground size-5" aria-hidden />
            {rotulo}
          </Link>
        ))}
        {children}
      </div>
    </details>
  );
}

/** Menu lateral do PC. */
export function MenuLateral() {
  const caminho = usePathname();
  const item = (href: string, rotulo: string, Icone: typeof Users) => {
    const atual = ativa(caminho, href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={atual ? 'page' : undefined}
        className={cn(
          'rounded-control inline-flex min-h-10 items-center gap-2.5 px-3 text-sm font-medium transition-colors',
          atual
            ? 'bg-primary/15 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <Icone className="size-[18px]" aria-hidden />
        {rotulo}
      </Link>
    );
  };
  return (
    <nav aria-label="Telas" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {PRINCIPAIS.map((p) => item(p.href, p.rotulo, p.Icone))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground px-3 pb-1 text-xs font-semibold uppercase">Mais</p>
        {SECUNDARIAS.map((p) => item(p.href, p.rotulo, p.Icone))}
      </div>
    </nav>
  );
}
