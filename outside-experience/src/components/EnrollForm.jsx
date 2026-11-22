import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowRight, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { lerOrigem } from "@/lib/origem";
import { rastrear } from "@/lib/rastreio";

import { API } from "@/lib/api";

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
      const payload = { ...data, whatsapp: data.whatsapp, is_minor: isMinor, guardian_consent: isMinor ? consent : false, origem: lerOrigem() };
      const { data: created } = await axios.post(`${API}/enrollments`, payload);
      rastrear("Lead");
      onSuccess(created);
    } catch (e) {
      const status = e.response?.status;
      const detail = e.response?.data?.detail;
      setError(status && status < 500 && detail ? detail : "Não foi possível concluir agora. Tente novamente em instantes.");
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
    <div className="relative bg-ink p-6 sm:p-10" data-testid="enroll-form">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span data-testid="enroll-step-indicator">
          Passo {step + 1} de {total}
        </span>
        <span>Lista de espera</span>
      </div>
      <div className="mt-3 h-1 w-full bg-white/10" aria-hidden="true">
        <div className="h-full bg-brand transition-[width] duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div key={current.key} className="animate-fade-up mt-10">
        {current.key === "guardian" ? (
          <>
            <h3 className="display text-4xl">Autorização do responsável</h3>
            <p className="mt-4 text-white/75">
              Como você tem menos de 18 anos, precisamos da autorização de um responsável para a sua participação.
            </p>
            <button
              type="button"
              onClick={() => setConsent((c) => !c)}
              data-testid="guardian-consent-btn"
              aria-pressed={consent}
              className={`mt-6 flex w-full items-start gap-4 border p-5 text-left transition-colors ${
                consent ? "border-brand bg-brand/10" : "border-white/20 hover:border-white/50"
              }`}
            >
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 ${consent ? "border-brand bg-brand text-ink" : "border-white/50"}`}>
                {consent && <Check size={16} strokeWidth={3} />}
              </span>
              <span className="text-white/90">
                Confirmo que meu responsável legal está ciente e autoriza minha participação no Outside Experience, incluindo a saída às ruas em equipe.
              </span>
            </button>
          </>
        ) : (
          <>
            <label htmlFor={`enroll-${current.key}`} className="display block text-4xl sm:text-5xl">
              {current.label}
            </label>
            {current.hint && <p className="mt-3 text-white/60">{current.hint}</p>}
            <input
              ref={inputRef}
              id={`enroll-${current.key}`}
              data-testid={`enroll-input-${current.key}`}
              type={current.type}
              inputMode={current.type === "number" ? "numeric" : current.type === "tel" ? "tel" : "text"}
              autoComplete={{ name: "name", whatsapp: "tel", age: "off", church: "organization" }[current.key]}
              value={data[current.key]}
              placeholder={current.placeholder}
              onKeyDown={onKey}
              onChange={(e) =>
                setData((d) => ({ ...d, [current.key]: current.key === "whatsapp" ? maskPhone(e.target.value) : e.target.value }))
              }
              className="mt-6 w-full border-b-2 border-white/25 bg-transparent py-3 text-2xl text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand"
            />
          </>
        )}
      </div>

      {error && (
        <p className="mt-5 text-[15px] text-red-300" role="alert" data-testid="enroll-error">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          data-testid="enroll-back-btn"
          className="inline-flex min-h-[44px] items-center gap-2 text-white/70 transition-colors hover:text-white disabled:invisible"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canProceed || loading}
          data-testid={step === total - 1 ? "enroll-submit-btn" : "enroll-next-btn"}
          className="btn-brand disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {loading ? "Enviando..." : step === total - 1 ? "Entrar na lista" : "Continuar"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>

      <p className="mt-8 flex items-center gap-2 text-sm text-white/50">
        <ShieldCheck size={16} /> Seus dados são usados só para o Outside Experience.
      </p>
    </div>
  );
}
