import Reveal from "@/components/Reveal";
import { TESTIMONIALS } from "@/data/event";

export default function Testimonials() {
  if (!TESTIMONIALS.length) return null;
  return (
    <section className="bg-ink pb-20 sm:pb-28" data-testid="testimonials-section">
      <div className="wrap grid gap-10 border-t border-white/10 pt-16 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal as="blockquote" key={i} delay={i * 0.06} data-testid={`testimonial-${i + 1}`}>
            <p className="font-serif text-2xl leading-snug text-white/90">“{t.text}”</p>
            <footer className="mt-4 text-white/60">{t.name}</footer>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
