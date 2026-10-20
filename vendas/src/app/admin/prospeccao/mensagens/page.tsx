import type { Metadata } from 'next';
import { BookOpen, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { EditorModelos } from '@/components/modelos';
import { ROTAS } from '@/lib/rotas';
import { exigirGui } from '@/server/guard';
import { listarModelos } from '@/server/vendas/modelos';

export const metadata: Metadata = { title: 'Mensagens' };
export const dynamic = 'force-dynamic';

const LINKS = [
  { href: ROTAS.conhecimento, rotulo: 'Base da IA', Icone: BookOpen },
  { href: ROTAS.exemplos, rotulo: 'Exemplos', Icone: Star },
  { href: ROTAS.ia, rotulo: 'Testar IA', Icone: Sparkles },
] as const;

export default async function PaginaMensagens() {
  await exigirGui();
  const modelos = await listarModelos();
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-3xl font-bold">Mensagens</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Os modelos do botão “Abrir no WhatsApp”. Use {'{nome}'}, {'{cidade}'} e {'{segmento}'}:
          viram os dados de cada lead.
        </p>
      </header>
      <EditorModelos modelos={modelos} />
      <nav aria-label="Ajustes da IA" className="grid grid-cols-3 gap-2">
        {LINKS.map(({ href, rotulo, Icone }) => (
          <Link
            key={href}
            href={href}
            className="bg-card rounded-card text-muted-foreground flex min-h-16 flex-col items-center justify-center gap-1 border text-xs font-semibold"
          >
            <Icone className="text-primary size-5" aria-hidden />
            {rotulo}
          </Link>
        ))}
      </nav>
    </div>
  );
}
