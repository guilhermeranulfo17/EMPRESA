import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";

const API = `${import.meta.env.VITE_BACKEND_URL ?? ""}/api`;
const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const maskPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const BASE_STEPS = [
  { key: "name", label: "Como você se chama?", placeholder: "Seu nome completo", type: "text", valid: (v) => v.trim().length >= 2 },
  { key: "whatsapp", label: "Qual é o seu WhatsApp?", placeholder: "(34) 99999-9999", type: "tel", valid: (v) => v.replace(/\D/g, "").length >= 10, hint: "É por aqui que avisamos quando as inscrições abrirem." },
  { key: "age", label: "Quantos anos você tem?", placeholder: "Ex.: 22", type: "number", valid: (v) => Number(v) >= 5 && Number(v) <= 120 },
  { key: "church", label: "Qual igreja você frequenta?", placeholder: "Ex.: Comunidade pela Cruz", type: "text", valid: (v) => v.trim().length >= 2, hint: "Se não frequenta nenhuma, escreva “nenhuma”." },
];

export default function EnrollForm({ onSuccess }) {
  const [data, setData] = useState({ name: "", whatsapp: "", age: "", church: "" });
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const isMinor = data.age !== "" && Number(data.age) < 18;
  const steps = isMinor ? [...BASE_STEPS, { key: "guardian" }] : BASE_STEPS;
  const current = steps[step];
  const total = steps.length;

  useEffect(() => {
    if (step > 0) inputRef.current?.focus();
  }, [step]);

  const canProceed = current.key === "guardian" ? consent : current.valid(data[current.key]);

  const next = async () => {
    if (!canProceed) return;
    setError("");
    if (step < total - 1) return setStep(step + 1);
    setLoading(true);
    try {
      const payload = { ...data, whatsapp: data.whatsapp, is_minor: isMinor, guardian_consent: isMinor ? consent : false };
      const { data: created } = await axios.post(`${API}/enrollments`, payload);
      const code = created.id.replace(/-/g, "").slice(0, 8).toUpperCase();
      await axios.put(`${API}/enrollments/${created.id}/ticket-code`, { enrollment_id: created.id, ticket_code: code });
      onSuccess({ ...created, ticket_code: code });
    } catch (e) {
      setError("Não foi possível concluir agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 lg:p-10 relative overflow-hidden" data-testid="enroll-form">
      <span className="absolute top-0 left-0 h-[3px] bg-orange-500 transition-[width] duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] tracking-[0.3em] uppercase text-orange-500 font-semibold" data-testid="enroll-step-indicator">
          Passo {step + 1} / {total}
        </span>
        <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-600">Lista de espera</span>
      </div>

      <div key={current.key} className="animate-fade-up">
        {current.key === "guardian" ? (
          <>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none" style={OUTFIT}>
              Autorização do responsável
            </h3>
            <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
              Como você tem menos de 18 anos, precisamos da autorização de um responsável para a sua participação.
            </p>
            <button
              type="button"
              onClick={() => setConsent((c) => !c)}
              data-testid="guardian-consent-btn"
              aria-pressed={consent}
              className={`mt-6 w-full flex items-start gap-4 text-left p-5 border transition-colors ${
                consent ? "border-orange-500 bg-orange-500/10" : "border-white/15 hover:border-white/40"
              }`}
            >
              <span className={`mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center border ${consent ? "bg-orange-500 border-orange-500 text-black" : "border-white/40"}`}>
                {consent && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="text-sm text-neutral-200 leading-relaxed">
                Confirmo que meu responsável legal está ciente e autoriza minha participação no Outside Experience, incluindo a saída às ruas em equipe.
              </span>
            </button>
          </>
        ) : (
          <>
            <label htmlFor={`enroll-${current.key}`} className="block text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none" style={OUTFIT}>
              {current.label}
            </label>
            {current.hint && <p className="mt-3 text-xs text-neutral-500">{current.hint}</p>}
            <input
              ref={inputRef}
              id={`enroll-${current.key}`}
              data-testid={`enroll-input-${current.key}`}
              type={current.type}
              inputMode={current.type === "number" ? "numeric" : current.type === "tel" ? "tel" : "text"}
              value={data[current.key]}
              placeholder={current.placeholder}
              onKeyDown={onKey}
              onChange={(e) =>
                setData((d) => ({ ...d, [current.key]: current.key === "whatsapp" ? maskPhone(e.target.value) : e.target.value }))
              }
              className="mt-6 w-full bg-transparent border-b-2 border-white/20 focus:border-orange-500 outline-none py-4 text-xl sm:text-2xl text-white placeholder:text-neutral-700 transition-colors"
            />
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-400" data-testid="enroll-error">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          data-testid="enroll-back-btn"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-neutral-500 hover:text-white disabled:opacity-0 transition-colors"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canProceed || loading}
          data-testid={step === total - 1 ? "enroll-submit-btn" : "enroll-next-btn"}
          className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-4 transition-colors"
        >
          {loading ? "Enviando..." : step === total - 1 ? "Garantir minha vaga" : "Continuar"}
          {!loading && <ArrowRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />}
        </button>
      </div>

      <p className="mt-6 flex items-center gap-2 text-[10px] text-neutral-600 tracking-wider">
        <ShieldCheck size={12} /> Seus dados são usados apenas para o Outside Experience.
      </p>
    </div>
  );
}
