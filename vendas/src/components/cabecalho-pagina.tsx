/** Título da tela com uma linha explicando para que ela serve. */
export function CabecalhoPagina({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <header className="mb-5">
      <h2 className="text-2xl font-bold tracking-tight">{titulo}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{descricao}</p>
    </header>
  );
}
