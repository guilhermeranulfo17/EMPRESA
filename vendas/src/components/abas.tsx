'use client';

import { BookOpen, CalendarCheck, Columns3, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Menu do Vendas Orkestra: faixa rolável no celular, lista vertical no PC. A Fila do dia é a tela inicial. */
const ABAS = [
  { href: '/', rotulo: 'Fila do dia', Icone: CalendarCheck },
  { href: '/pipeline', rotulo: 'Pipeline', Icone: Columns3 },
  { href: '/leads', rotulo: 'Leads', Icone: Users },
  { href: '/conhecimento', rotulo: 'Conhecimento', Icone: BookOpen },
  { href: '/exemplos', rotulo: 'Exemplos', Icone: Star },
] as const;

export function Abas() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Seções"
      className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 lg:mx-0 lg:w-auto lg:overflow-visible lg:px-0"
    >
      <div className="flex w-max gap-1 lg:w-auto lg:flex-col">
        {ABAS.map(({ href, rotulo, Icone }) => {
          const ativo = href === '/' ? caminho === '/' : caminho.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'rounded-control inline-flex min-h-10 items-center gap-2.5 px-3 text-sm font-medium whitespace-nowrap transition-colors',
                ativo
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              data-testid={`aba-${rotulo}`}
            >
              <Icone className="size-[18px]" aria-hidden />
              {rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
