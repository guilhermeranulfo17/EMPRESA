import { ArrowUpRight, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const OPTIONS = [
  { id: "experience", label: "Quero participar do Experience", href: "#inscricao" },
  { id: "whatsapp", label: "Quero falar com a equipe", external: `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre o Outside Experience.")}` },
  { id: "school", label: "Quero conhecer a Outside School", external: EVENT.schoolUrl },
];

export default function NextStep() {
  return (
    <section className="border-t border-white/10 bg-[#0a0a0a] px-5 md:px-10 lg:px-20 py-14 md:py-16" data-testid="next-step-section">
      <Reveal>
        <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 font-semibold">Qual é o seu próximo passo?</span>
        <div className="mt-6 grid sm:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {OPTIONS.map((o) => {
            const cls =
              "group flex items-center justify-between gap-4 bg-[#0a0a0a] hover:bg-[#101010] p-5 md:p-6 text-left text-sm font-bold uppercase tracking-tight text-neutral-200 hover:text-white transition-colors";
            return o.external ? (
              <a key={o.id} href={o.external} target="_blank" rel="noreferrer" className={cls} style={OUTFIT} data-testid={`next-step-${o.id}`}>
                {o.label}
                <ArrowUpRight size={16} className="text-neutral-500 group-hover:text-orange-500 transition-colors shrink-0" />
              </a>
            ) : (
              <button key={o.id} onClick={() => scrollToId(o.href)} className={cls} style={OUTFIT} data-testid={`next-step-${o.id}`}>
                {o.label}
                <ArrowRight size={16} className="text-orange-500 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
              </button>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
