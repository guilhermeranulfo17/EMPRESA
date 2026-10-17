'use client';

import { BookOpen, CalendarCheck, Columns3, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Abas do Vendas Orkestra. A Fila do dia é a tela inicial. */
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
    <nav aria-label="Seções" className="-mx-4 overflow-x-auto px-4">
      <div className="bg-muted flex w-max gap-0.5 rounded-full p-0.5">
        {ABAS.map(({ href, rotulo, Icone }) => {
          const ativo = href === '/' ? caminho === '/' : caminho.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap',
                ativo ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              data-testid={`aba-${rotulo}`}
            >
              <Icone className="size-4" aria-hidden />
              {rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
