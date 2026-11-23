import Reveal from "@/components/Reveal";
import { PHOTOS } from "@/data/event";

export default function Sobre() {
  return (
    <section id="sobre" className="paper-grain bg-paper secao text-ink" data-testid="about-event-section">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="label text-brand-deep">O que é</p>
          <p className="mt-5 font-serif t-lead leading-[1.08]" data-testid="about-event-lead">
            Um encontro para cristãos que querem viver a fé fora das quatro paredes. A gente adora, aprende, ora junto e sai para a
            rua. <em className="text-brand-deep">Não falamos sobre missão. Vivemos.</em>
          </p>
          <p className="mt-8 max-w-xl text-lg text-muted-dark">
            Não é curso online nem congresso. É um dia inteiro, presencial, em Uberlândia, para quem é de qualquer igreja.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5">
          <figure className="relative mx-auto max-w-sm rotate-[1.5deg] bg-white p-3 pb-12 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)]">
            <img src={PHOTOS.camiseta.src} alt={PHOTOS.camiseta.alt} className="aspect-[4/5] w-full object-cover" loading="lazy" />
            <figcaption className="absolute bottom-3 left-4 font-serif text-lg italic text-ink/80">1ª edição, Uberlândia</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
