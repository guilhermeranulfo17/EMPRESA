import { ArrowRight } from "lucide-react";
import Reveal, { MaskedLines } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

export default function FinalCTA() {
  return (
    <section className="relative py-28 md:py-36 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10 overflow-hidden" data-testid="final-cta-section">
      <span
        className="pointer-events-none select-none absolute right-[-2%] top-1/2 -translate-y-1/2 text-[30vw] leading-none font-black uppercase text-white/[0.03]"
        style={OUTFIT}
        aria-hidden="true"
      >
        SAIR
      </span>
      <div className="relative z-10 max-w-5xl">
        <h2 className="font-black uppercase tracking-[-0.03em] leading-[0.88] text-[15vw] sm:text-[12vw] lg:text-[min(6.5vw,13vh)]" style={OUTFIT} data-testid="final-cta-title">
          <MaskedLines lines={["CHEGOU", "A HORA", "DE SAIR"]} render={(l, i) => (i === 2 ? <span className="text-orange-500">{l}</span> : l)} />
        </h2>
        <Reveal delay={0.25} className="mt-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
          <button
            onClick={() => scrollToId("#inscricao")}
            data-testid="final-cta-btn"
            className="group inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-400 text-black text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-8 py-5 transition-colors self-start"
          >
            Quero estar no Outside Experience
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <p className="text-neutral-400 text-sm sm:text-base" style={OUTFIT} data-testid="final-cta-text">
            Você já ouviu bastante. <span className="text-white font-bold">Agora é hora de viver</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
