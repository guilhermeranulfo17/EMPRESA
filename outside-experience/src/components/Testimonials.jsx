import Reveal from "@/components/Reveal";
import { TESTIMONIALS } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

export default function Testimonials() {
  if (!TESTIMONIALS.length) return null;
  return (
    <section className="py-24 md:py-32 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10" data-testid="testimonials-section">
      <Reveal>
        <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
          <span className="w-6 h-px bg-orange-500" /> Testemunhos
        </span>
        <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT}>
          Quando a gente sai,
          <br />
          <span className="text-orange-500">coisas acontecem.</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={i} delay={i * 0.06} className="bg-[#050505]">
            <blockquote className="h-full p-7 flex flex-col justify-between gap-6" data-testid={`testimonial-${i + 1}`}>
              <p className="text-neutral-200 text-base leading-relaxed">“{t.text}”</p>
              <footer className="text-[11px] tracking-[0.25em] uppercase text-neutral-500">{t.name}</footer>
            </blockquote>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
