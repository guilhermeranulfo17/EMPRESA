// De onde vieram as inscrições: igrejas (links de /lideres), convites de inscritos e anúncios.
export default function Origens({ inscritos }) {
  const porCodigo = new Map(inscritos.map((e) => [e.ticket_code, e.name]));
  const igrejas = new Map();
  const convites = new Map();
  const outras = new Map();
  let direto = 0;

  for (const e of inscritos) {
    const o = e.origem || {};
    if (o.ref?.startsWith("convite-")) {
      const quem = porCodigo.get(o.ref.slice(8)) || `Código ${o.ref.slice(8)}`;
      convites.set(quem, (convites.get(quem) || 0) + 1);
    } else if (o.ref) igrejas.set(o.ref, (igrejas.get(o.ref) || 0) + 1);
    else if (o.utm_source || o.referrer) {
      const k = o.utm_source || o.referrer;
      outras.set(k, (outras.get(k) || 0) + 1);
    } else direto++;
  }

  const Lista = ({ titulo, mapa, vazio }) => {
    const itens = [...mapa.entries()].sort((a, b) => b[1] - a[1]);
    return (
      <div className="border border-white/10 bg-[#0a0a0a] p-5">
        <span className="mb-3 block text-[11px] uppercase tracking-[0.15em] text-neutral-400">{titulo}</span>
        {itens.length ? (
          <ol className="space-y-1.5 text-sm">
            {itens.map(([k, n], i) => (
              <li key={k} className="flex justify-between gap-4">
                <span className="truncate">
                  {i + 1}. {k}
                </span>
                <span className="font-bold text-orange-400">{n}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-neutral-500">{vazio}</p>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-3" data-testid="origins">
      <Lista titulo="Quem mais convidou" mapa={convites} vazio="Ninguém entrou por convite ainda." />
      <Lista titulo="Links de igrejas" mapa={igrejas} vazio="Nenhuma inscrição por link de igreja ainda." />
      <Lista titulo="Anúncios e outros sites" mapa={new Map([...outras, ...(direto ? [["direto no site", direto]] : [])])} vazio="Sem dados ainda." />
    </div>
  );
}
