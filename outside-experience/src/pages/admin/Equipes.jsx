import { useMemo, useState } from "react";
import { Printer, Shuffle } from "lucide-react";

const chave = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Distribui as pessoas em equipes misturando igrejas e espalhando os menores entre adultos.
function montar(pessoas, tamanho, semente) {
  const n = Math.max(1, Math.ceil(pessoas.length / tamanho));
  const equipes = Array.from({ length: n }, () => []);
  let s = semente;
  const aleatorio = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const embaralhar = (a) => a.map((v) => [aleatorio(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

  const adultos = embaralhar(pessoas.filter((p) => !p.is_minor));
  const menores = embaralhar(pessoas.filter((p) => p.is_minor));
  // igrejas maiores primeiro: são as mais difíceis de espalhar
  const tamanhoIgreja = new Map();
  for (const p of pessoas) tamanhoIgreja.set(chave(p.church), (tamanhoIgreja.get(chave(p.church)) || 0) + 1);
  adultos.sort((a, b) => tamanhoIgreja.get(chave(b.church)) - tamanhoIgreja.get(chave(a.church)));

  const daIgreja = (eq, p) => eq.filter((x) => chave(x.church) === chave(p.church)).length;
  const menoresEm = (eq) => eq.filter((x) => x.is_minor).length;
  // cada pessoa vai para a equipe com menos gente da mesma igreja; empate: a menor equipe
  const colocar = (p, extra = () => 0) => {
    let melhor = 0;
    for (let i = 1; i < n; i++) {
      const a = [extra(equipes[i]), daIgreja(equipes[i], p), equipes[i].length];
      const m = [extra(equipes[melhor]), daIgreja(equipes[melhor], p), equipes[melhor].length];
      if (a[0] < m[0] || (a[0] === m[0] && (a[1] < m[1] || (a[1] === m[1] && a[2] < m[2])))) melhor = i;
    }
    equipes[melhor].push(p);
  };
  for (const p of adultos) colocar(p);
  // menores: primeiro nas equipes com menos menores
  for (const p of menores) colocar(p, menoresEm);
  return equipes;
}

export default function Equipes({ inscritos }) {
  const [tamanho, setTamanho] = useState(5);
  const [soCheckin, setSoCheckin] = useState(false);
  const [semente, setSemente] = useState(7);
  const base = soCheckin ? inscritos.filter((e) => e.checked_in) : inscritos;
  const equipes = useMemo(() => montar(base, Math.max(2, Number(tamanho) || 5), semente), [base, tamanho, semente]);

  return (
    <div className="space-y-6" data-testid="teams-tab">
      <div className="no-print flex flex-wrap items-end gap-4">
        <label className="text-sm text-white/70">
          Pessoas por equipe
          <input
            type="number"
            min={2}
            max={15}
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
            className="mt-1 block w-24 border border-white/20 bg-transparent px-3 py-2 text-white"
          />
        </label>
        <label className="flex items-center gap-2 py-2 text-sm text-white/80">
          <input type="checkbox" checked={soCheckin} onChange={(e) => setSoCheckin(e.target.checked)} className="h-4 w-4 accent-orange-500" />
          Só quem fez check-in
        </label>
        <button onClick={() => setSemente((v) => v + 1)} className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-sm hover:border-white/50">
          <Shuffle size={14} /> Sortear de novo
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-orange-500 px-4 py-2 text-sm font-bold text-black">
          <Printer size={14} /> Imprimir
        </button>
      </div>
      <p className="no-print text-sm text-white/60">
        {base.length} pessoas em {equipes.length} equipes. A mesma igreja é espalhada entre equipes diferentes e cada menor de idade fica numa equipe com adultos.
      </p>
      {base.length === 0 ? (
        <p className="text-white/60">Ninguém para dividir ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
          {equipes.map((eq, i) => (
            <div key={i} className="break-inside-avoid border border-white/15 p-4 print:border-black">
              <p className="font-bold">Equipe {i + 1}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {eq.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>
                      {p.name}
                      {p.is_minor ? " (menor)" : ""}
                    </span>
                    <span className="truncate text-white/50 print:text-black/60">{p.church}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
