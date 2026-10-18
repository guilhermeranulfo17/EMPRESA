import { Asterisk } from 'lucide-react';

/** Símbolo e nome do Vendas Orkestra. */
export function Marca() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="gradiente-marca grid size-9 place-items-center rounded-[10px] text-white">
        <Asterisk className="size-5" strokeWidth={2.75} aria-hidden />
      </span>
      <span className="text-[15px] font-bold tracking-tight">Vendas Orkestra</span>
    </span>
  );
}
