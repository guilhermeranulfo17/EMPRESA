import { useEffect, useState } from "react";
import { Download, MessageCircle } from "lucide-react";

// Candidaturas da Outside School (página /school). api: axios já com a senha no cabeçalho.
export default function SchoolCandidaturas({ api }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null);

  useEffect(() => {
    api
      .get("/school/candidaturas")
      .then(({ data }) => setLista(data))
      .catch(() => setErro("Não foi possível carregar as candidaturas."));
  }, [api]);

  const baixar = async () => {
    const { data } = await api.get("/school/export-csv", { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidaturas-school.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (erro) return <p className="text-red-400">{erro}</p>;
  if (!lista) return <p className="text-neutral-500">Carregando…</p>;

  return (
    <div className="space-y-6" data-testid="school-tab">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Outside School</p>
          <p className="mt-1 text-4xl font-bold">{lista.length}</p>
          <p className="text-sm text-neutral-400">candidatura{lista.length === 1 ? "" : "s"} recebida{lista.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={baixar} className="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-widest hover:bg-white/10">
          <Download size={12} /> Planilha
        </button>
      </div>

      {lista.length === 0 && <p className="text-neutral-500">Nenhuma candidatura ainda. Elas chegam pelo formulário em /school.</p>}

      <ul className="divide-y divide-white/10 border-y border-white/10">
        {lista.map((c) => (
          <li key={c.id}>
            <button onClick={() => setAberta(aberta === c.id ? null : c.id)} className="flex w-full flex-wrap items-baseline justify-between gap-2 py-4 text-left">
              <span>
                <span className="font-semibold">{c.name}</span>
                <span className="ml-3 text-sm text-neutral-400">
                  {c.age} anos · {c.city} · {c.church}
                </span>
              </span>
              <span className="text-xs text-neutral-500">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
            </button>
            {aberta === c.id && (
              <div className="grid gap-4 pb-5 text-sm md:grid-cols-2">
                <div className="space-y-1 text-neutral-300">
                  <p>
                    <span className="text-neutral-500">WhatsApp:</span> {c.whatsapp}
                  </p>
                  {c.email && (
                    <p>
                      <span className="text-neutral-500">E-mail:</span> {c.email}
                    </p>
                  )}
                  <p>
                    <span className="text-neutral-500">Liderança:</span> {c.pastor_name} ({c.pastor_contact})
                  </p>
                  <a
                    href={`https://wa.me/55${c.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-orange-400 hover:text-orange-300"
                  >
                    <MessageCircle size={14} /> Chamar no WhatsApp
                  </a>
                </div>
                <p className="whitespace-pre-wrap border-l-2 border-orange-500/60 pl-4 text-neutral-200">{c.motivation}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
