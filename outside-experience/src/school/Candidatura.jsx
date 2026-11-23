import { useState } from "react";
import axios from "axios";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { API } from "@/lib/api";
import { lerOrigem } from "@/lib/origem";
import { rastrear } from "@/lib/rastreio";
import { SCHOOL } from "@/data/school";

const VAZIO = {
  name: "",
  whatsapp: "",
  email: "",
  age: "",
  city: "",
  church: "",
  pastor_name: "",
  pastor_contact: "",
  motivation: "",
};

function mascaraWhats(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

function textoWhats(f) {
  return [
    "Olá! Quero me candidatar à Outside School.",
    `Nome: ${f.name}`,
    `WhatsApp: ${f.whatsapp}`,
    f.email && `E-mail: ${f.email}`,
    `Idade: ${f.age}`,
    `Cidade: ${f.city}`,
    `Igreja: ${f.church}`,
    `Pastor/líder: ${f.pastor_name} (${f.pastor_contact})`,
    `Por que quero fazer: ${f.motivation}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function Campo({ id, label, dica, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="etiqueta text-ink/60">{label}</span>
      {children}
      {dica && <span className="mt-1 block text-sm text-ink/50">{dica}</span>}
    </label>
  );
}

export default function Candidatura() {
  const [f, setF] = useState(VAZIO);
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [falhou, setFalhou] = useState(false);
  const [pronto, setPronto] = useState(null);

  const set = (k) => (e) => setF((v) => ({ ...v, [k]: k === "whatsapp" ? mascaraWhats(e.target.value) : e.target.value }));
  const linkWhats = `https://wa.me/${SCHOOL.whatsapp}?text=${encodeURIComponent(textoWhats(f))}`;

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setFalhou(false);
    if (!autoriza) {
      setErro("Marque a autorização para falarmos com a sua liderança.");
      return;
    }
    setEnviando(true);
    try {
      const { data } = await axios.post(
        `${API}/school/candidaturas`,
        { ...f, age: Number(f.age), origem: lerOrigem() },
        { timeout: 15000 },
      );
      setPronto(data?.name || f.name);
      rastrear("Lead", { content_name: "Outside School" });
    } catch (err) {
      const status = err?.response?.status;
      const detalhe = err?.response?.data?.detail;
      if (status === 409 || status === 422) setErro(detalhe || "Confira os dados.");
      else {
        setErro("Não conseguimos enviar agora.");
        setFalhou(true);
      }
    } finally {
      setEnviando(false);
    }
  }

  if (pronto) {
    return (
      <div className="border border-ink bg-folha p-7 sm:p-10" role="status" data-testid="school-candidatura-ok">
        <span className="bolinha">
          <Check size={20} />
        </span>
        <h3 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
          Candidatura recebida, {pronto.split(" ")[0]}.
        </h3>
        <p className="mt-4 max-w-xl text-lg text-ink/75">
          Agora a gente conversa com a sua liderança e te chama no WhatsApp com os próximos passos. O pagamento só acontece depois da aprovação.
        </p>
        <p className="etiqueta mt-8 text-ink/50">{SCHOOL.lema}</p>
      </div>
    );
  }

  const input = "linha-escrita mt-2 block w-full py-2";

  return (
    <form onSubmit={enviar} className="border border-ink bg-folha p-6 sm:p-10" noValidate data-testid="school-candidatura-form">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-4">
        <p className="etiqueta">Ficha de candidatura</p>
        <p className="etiqueta text-ink/50">{SCHOOL.turma}</p>
      </div>

      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        <Campo id="c-nome" label="Nome completo">
          <input id="c-nome" className={input} value={f.name} onChange={set("name")} autoComplete="name" required minLength={2} />
        </Campo>
        <Campo id="c-whats" label="WhatsApp com DDD">
          <input id="c-whats" className={input} value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" autoComplete="tel" placeholder="(34) 99999-9999" required />
        </Campo>
        <Campo id="c-email" label="E-mail (opcional)">
          <input id="c-email" type="email" className={input} value={f.email} onChange={set("email")} autoComplete="email" />
        </Campo>
        <div className="grid grid-cols-[6rem_1fr] gap-5">
          <Campo id="c-idade" label="Idade">
            <input id="c-idade" className={input} value={f.age} onChange={set("age")} inputMode="numeric" maxLength={3} required />
          </Campo>
          <Campo id="c-cidade" label="Cidade">
            <input id="c-cidade" className={input} value={f.city} onChange={set("city")} autoComplete="address-level2" required />
          </Campo>
        </div>
        <Campo id="c-igreja" label="Igreja onde congrega">
          <input id="c-igreja" className={input} value={f.church} onChange={set("church")} required />
        </Campo>
        <Campo id="c-pastor" label="Nome do seu pastor ou líder">
          <input id="c-pastor" className={input} value={f.pastor_name} onChange={set("pastor_name")} required />
        </Campo>
        <Campo id="c-pastor-contato" label="WhatsApp ou e-mail da liderança" dica="Usamos só para pedir a recomendação pastoral.">
          <input id="c-pastor-contato" className={input} value={f.pastor_contact} onChange={set("pastor_contact")} required />
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="c-motivo" label="Por que você quer fazer a School?" dica="Conte do seu momento com Deus e o que te trava hoje. Não precisa ser bonito, precisa ser sincero.">
            <textarea id="c-motivo" rows={4} className={`${input} resize-y leading-[34px]`} value={f.motivation} onChange={set("motivation")} required minLength={10} maxLength={1500} />
          </Campo>
        </div>
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 text-[15px] text-ink/80">
        <input type="checkbox" checked={autoriza} onChange={(e) => setAutoriza(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#F26A1B]" data-testid="school-autoriza" />
        Autorizo a Outside a falar com a minha liderança sobre esta candidatura e a me chamar no WhatsApp.
      </label>

      {erro && (
        <div className="mt-6 border-l-4 border-brand bg-brand/10 px-4 py-3 text-[15px]" role="alert" data-testid="school-erro">
          {erro}
          {falhou && (
            <a href={linkWhats} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 font-semibold underline decoration-brand underline-offset-4">
              <MessageCircle size={16} /> Enviar a candidatura pelo WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={enviando} className="btn-tinta disabled:opacity-60" data-testid="school-enviar">
          {enviando ? "Enviando…" : "Enviar candidatura"} <ArrowRight size={18} />
        </button>
        <p className="text-sm text-ink/55">Sem pagamento agora. Você só paga se for aprovado.</p>
      </div>
    </form>
  );
}
