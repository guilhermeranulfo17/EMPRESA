import { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const FAQS = [
  {
    q: "O que é o Outside Experience?",
    a: "Um encontro cristão presencial de adoração, palavra, ativação e prática, que termina na rua: saímos juntos para viver o evangelho. Não é curso online nem congresso — é um dia inteiro para sair da teoria.",
  },
  {
    q: "Preciso fazer parte de alguma igreja específica?",
    a: `Não. O Experience é para cristãos de qualquer igreja. O evento acontece na ${EVENT.venue}, em ${EVENT.cityShort}, mas você não precisa ser membro.`,
  },
  {
    q: "Preciso ter experiência com evangelismo?",
    a: "Não. O dia foi desenhado para quem quer viver isso na prática e ainda não sabe por onde começar. Você recebe ferramentas simples e vai acompanhado.",
  },
  {
    q: "Posso participar mesmo tendo vergonha de evangelizar?",
    a: "Pode — e provavelmente é para você mesmo. Não é sobre performance nem sobre saber falar tudo. É sobre disponibilidade. Ninguém sai sozinho.",
  },
  {
    q: "Vamos para a rua de verdade?",
    a: "Sim. Depois da ativação e da capacitação, saímos em equipes para compartilhar Jesus de maneira simples, humana e intencional.",
  },
  {
    q: "Onde e quando será?",
    a: `Na ${EVENT.venue} — ${EVENT.address}, ${EVENT.city}. A data da próxima edição será anunciada em breve: quem está na lista de espera recebe primeiro, no WhatsApp.`,
  },
  {
    q: "Existe idade mínima?",
    a: "Menores de 18 anos participam com autorização do responsável, confirmada no momento da inscrição.",
  },
  {
    q: "Quanto custa? Inclui alimentação?",
    a: "Valores e detalhes operacionais serão divulgados junto com a abertura das inscrições da próxima edição.",
  },
];

function FaqItem({ item, index, open, onToggle }) {
  return (
    <div className="border-b border-white/10" data-testid={`faq-item-${index}`}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        data-testid={`faq-question-${index}`}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
      >
        <span className="flex items-start gap-4 sm:gap-6">
          <span className="font-mono text-[10px] text-orange-500 pt-1.5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
          <span className={`text-base sm:text-xl font-bold uppercase tracking-tight transition-colors ${open ? "text-orange-400" : "text-white group-hover:text-orange-400"}`} style={OUTFIT}>
            {item.q}
          </span>
        </span>
        <Plus size={18} className={`shrink-0 mt-1 text-neutral-500 transition-transform duration-300 ${open ? "rotate-45 text-orange-500" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-400 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pb-6 pl-8 sm:pl-12 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl" data-testid={`faq-answer-${index}`}>
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#0a0a0a] border-t border-white/10" data-testid="faq-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
                <span className="w-6 h-px bg-orange-500" /> Dúvidas
              </span>
              <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="faq-title">
                Perguntas
                <br />
                <span className="text-orange-500">frequentes</span>
              </h2>
              <p className="mt-6 text-sm text-neutral-500 leading-relaxed max-w-xs">
                Outra dúvida? Fala com a gente no{" "}
                <a
                  href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre o Outside Experience.")}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="faq-whatsapp-link"
                  className="text-white underline decoration-orange-500 underline-offset-4 hover:text-orange-400"
                >
                  WhatsApp
                </a>{" "}
                ou pelo e-mail{" "}
                <a href={`mailto:${EVENT.email}`} data-testid="faq-email-link" className="text-white underline decoration-orange-500 underline-offset-4 hover:text-orange-400">
                  {EVENT.email}
                </a>
                .
              </p>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8 border-t border-white/10">
          {FAQS.map((item, i) => (
            <Reveal key={i} delay={i * 0.03} y={12}>
              <FaqItem item={item} index={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
