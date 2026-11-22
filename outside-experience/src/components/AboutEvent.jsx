import Reveal from "@/components/Reveal";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

export default function AboutEvent() {
  return (
    <section id="experience" className="relative py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505]" data-testid="about-event-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
              <span className="w-6 h-px bg-orange-500" /> O Experience
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="about-event-title">
              Não é só
              <br />
              mais um
              <br />
              <span className="text-orange-500">evento</span>
            </h2>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pt-10">
          <Reveal delay={0.1} className="space-y-6 max-w-xl">
            <p className="text-lg sm:text-xl xl:text-2xl text-white leading-snug" style={OUTFIT} data-testid="about-event-lead">
              Um encontro presencial para cristãos que querem viver a fé para além das quatro paredes.
            </p>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Adoração, palavra, ativação e prática em um só dia — que termina na rua. Não falamos sobre missão.{" "}
              <span className="text-white font-semibold">Vivemos.</span>
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-16 md:mt-20 border-t border-white/10 pt-8 md:pt-10">
        <p className="font-black uppercase leading-[0.9] tracking-[-0.03em] text-[13vw] sm:text-[11vw] lg:text-[min(6vw,12vh)]" style={OUTFIT} data-testid="about-big-statement">
          De dentro <span className="text-outline">para</span> <span className="text-orange-500">fora</span>
        </p>
      </Reveal>
    </section>
  );
}
