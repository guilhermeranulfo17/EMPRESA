import Reveal from "@/components/Reveal";
import { PHOTOS } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const CALMA = [
  ["Você não vai sem preparo.", "Pela manhã a gente treina junto, com ferramentas simples."],
  ["Você não vai sozinho.", "Todo mundo sai em equipe e ora antes de sair."],
  ["Não é sobre falar bonito.", "É sobre estar disponível. O resto Deus faz."],
];

export default function NaRua() {
  return (
    <section id="na-rua" className="bg-ink py-20 sm:py-28" data-testid="envio-section">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="label text-brand">A ida à rua</p>
            <h2 className="display mt-4 text-[clamp(3rem,8vw,6rem)]" data-testid="envio-title">
              E se eu travar na hora?
            </h2>
            <p className="mt-6 max-w-lg text-lg text-white/80">
              Normal. O dia foi pensado justamente para quem nunca falou de Jesus com um desconhecido e não sabe por onde começar.
            </p>
          </Reveal>

          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {CALMA.map(([forte, resto], i) => (
              <Reveal as="li" key={forte} delay={i * 0.06} className="py-5 text-lg">
                <strong className="font-semibold text-white">{forte}</strong> <span className="text-white/70">{resto}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1} className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <button onClick={() => scrollToId("#inscricao")} className="btn-brand self-start" data-testid="field-steps-cta-btn">
              Eu quero ir
            </button>
            <p className="font-serif text-xl italic text-white/80">
              “Como ouvirão, se não há quem pregue?” <span className="font-sans text-sm not-italic text-white/50">Romanos 10:14</span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="translate-y-8">
              <img src={PHOTOS.oracaoBanco.src} alt={PHOTOS.oracaoBanco.alt} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            </figure>
            <figure>
              <img src={PHOTOS.oracaoRua.src} alt={PHOTOS.oracaoRua.alt} loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <figcaption className="mt-3 text-sm text-white/60">Oração na praça, 1ª edição</figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
