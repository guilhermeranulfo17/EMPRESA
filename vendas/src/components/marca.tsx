/** Símbolo e nome da área de prospecção do Orkestra. */
export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground font-titulo grid size-9 place-items-center rounded-[10px] text-lg font-bold">
        O
      </span>
      {!compacta && (
        <span className="flex flex-col leading-tight">
          <span className="font-titulo text-[15px] font-bold">Orkestra</span>
          <span className="text-muted-foreground text-xs">Prospecção</span>
        </span>
      )}
    </span>
  );
}
