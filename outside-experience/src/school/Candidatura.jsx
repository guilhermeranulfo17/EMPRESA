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

function Campo({ id, label, dica, children, className = "" }) {
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="text-[15px] font-semibold">{label}</span>
      {children}
      {dica && <span className="mt-1.5 block text-[13px] leading-snug text-ink/55">{dica}</span>}
    </label>
  );
}

function Grupo({ titulo, children }) {
  return (
    <fieldset className="border-t border-ink/15 pt-6">
      <legend className="etiqueta float-left mb-5 w-full text-ink/50">{titulo}</legend>
      <div className="clear-both grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
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
    const idade = Number(f.age);
    if (!f.name.trim() || !f.whatsapp || !f.age || !f.city.trim() || !f.church.trim() || !f.pastor_name.trim() || !f.pastor_contact.trim() || f.motivation.trim().length < 10) {
      setErro("Preencha todos os campos. Só o e-mail é opcional.");
      return;
    }
    if (!(idade >= 14 && idade <= 120)) {
      setErro("A School é a partir de 14 anos.");
      return;
    }
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
      <div className="bg-white p-7 shadow-[0_1px_0_rgba(18,17,16,0.08)] sm:p-10" role="status" data-testid="school-candidatura-ok">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-ink">
          <Check size={20} />
        </span>
        <h3 className="cond mt-6 text-[clamp(2.2rem,4vw,3.2rem)]">Recebemos sua candidatura, {pronto.split(" ")[0]}.</h3>
        <p className="mt-4 max-w-xl text-lg text-ink/75">
          Agora a gente fala com a sua liderança e te chama no WhatsApp com os próximos passos. O pagamento só acontece depois da aprovação.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="bg-white p-6 shadow-[0_1px_0_rgba(18,17,16,0.08)] sm:p-9" data-testid="school-candidatura-form">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <p className="cond text-3xl">Ficha de candidatura</p>
        <p className="text-sm text-ink/55">Leva uns 5 minutos</p>
      </div>

      <div className="space-y-8">
        <Grupo titulo="Sobre você">
          <Campo id="c-nome" label="Nome completo" className="sm:col-span-2">
            <input id="c-nome" className="campo" value={f.name} onChange={set("name")} autoComplete="name" required minLength={2} />
          </Campo>
          <Campo id="c-whats" label="WhatsApp">
            <input id="c-whats" className="campo" value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" autoComplete="tel" placeholder="(34) 99999-9999" required />
          </Campo>
          <Campo id="c-email" label="E-mail (opcional)">
            <input id="c-email" type="email" className="campo" value={f.email} onChange={set("email")} autoComplete="email" />
          </Campo>
          <Campo id="c-idade" label="Idade" dica="A partir de 14 anos.">
            <input id="c-idade" type="number" min={14} max={120} className="campo" value={f.age} onChange={set("age")} inputMode="numeric" required />
          </Campo>
          <Campo id="c-cidade" label="Cidade">
            <input id="c-cidade" className="campo" value={f.city} onChange={set("city")} autoComplete="address-level2" required />
          </Campo>
        </Grupo>

        <Grupo titulo="Sua igreja">
          <Campo id="c-igreja" label="Igreja onde você congrega" className="sm:col-span-2">
            <input id="c-igreja" className="campo" value={f.church} onChange={set("church")} required />
          </Campo>
          <Campo id="c-pastor" label="Nome do pastor ou líder">
            <input id="c-pastor" className="campo" value={f.pastor_name} onChange={set("pastor_name")} required />
          </Campo>
          <Campo id="c-pastor-contato" label="Contato dele" dica="WhatsApp ou e-mail. Usamos só para pedir a recomendação.">
            <input id="c-pastor-contato" className="campo" value={f.pastor_contact} onChange={set("pastor_contact")} required />
          </Campo>
        </Grupo>

        <Grupo titulo="Sua motivação">
          <Campo id="c-motivo" label="Por que você quer fazer a School?" dica="Conte do seu momento com Deus e do que te trava hoje. Pode ser simples." className="sm:col-span-2">
            <textarea id="c-motivo" rows={5} className="campo resize-y" value={f.motivation} onChange={set("motivation")} required minLength={10} maxLength={1500} />
          </Campo>
        </Grupo>
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 border-t border-ink/15 pt-6 text-[15px] text-ink/80">
        <input type="checkbox" checked={autoriza} onChange={(e) => setAutoriza(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#121110]" data-testid="school-autoriza" />
        Autorizo a Outside a falar com a minha liderança sobre esta candidatura e a me chamar no WhatsApp.
      </label>

      {erro && (
        <div className="mt-6 border-l-2 border-brand bg-brand/10 px-4 py-3 text-[15px]" role="alert" data-testid="school-erro">
          {erro}
          {falhou && (
            <a href={linkWhats} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 font-semibold underline decoration-brand underline-offset-4">
              <MessageCircle size={16} /> Enviar a candidatura pelo WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={enviando} className="btn-tinta w-full disabled:opacity-60 sm:w-auto" data-testid="school-enviar">
          {enviando ? "Enviando…" : "Enviar candidatura"} <ArrowRight size={18} />
        </button>
        <p className="text-sm text-ink/55">Nenhum pagamento agora.</p>
      </div>
    </form>
  );
}
