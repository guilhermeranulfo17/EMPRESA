import Reveal from "@/components/Reveal";

const TEMPOS = [
  { quando: "Manhã", titulo: "Ativação", texto: "Adoração e palavra para despertar a fé e a coragem de ir.", tags: ["Adoração", "Palavra"] },
  { quando: "Manhã", titulo: "Capacitação", texto: "Ferramentas simples para falar de Jesus com clareza e para praticar os dons com responsabilidade.", tags: ["Evangelismo", "Dons"] },
  { quando: "Tarde", titulo: "Envio", texto: "Oração e consagração juntos. Depois, saímos em equipes para a rua.", tags: ["Missão"], destaque: true },
  { quando: "Noite", titulo: "Volta e celebração", texto: "Testemunhos do que aconteceu, celebração e os próximos passos.", tags: ["Comunhão"] },
];

export default function ODia() {
  return (
    <section id="o-dia" className="paper-grain bg-paper py-20 text-ink sm:py-28" data-testid="program-section">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 className="display text-[clamp(3rem,7vw,5.5rem)]" data-testid="program-title">
            Como é o dia
          </h2>
          <p className="mt-5 max-w-xs text-muted-dark">Os horários exatos saem junto com a abertura das inscrições.</p>
          <blockquote className="mt-10 hidden max-w-xs border-l-2 border-brand pl-5 lg:block">
            <p className="font-serif text-2xl italic leading-snug">“Ide por todo o mundo e pregai o evangelho a toda criatura.”</p>
            <cite className="mt-3 block text-sm not-italic text-muted-dark">Marcos 16:15</cite>
          </blockquote>
        </Reveal>

        <ol className="relative lg:col-span-7 lg:col-start-6">
          <span className="absolute bottom-3 left-[7px] top-3 w-px bg-paper-line" aria-hidden="true" />
          {TEMPOS.map((t, i) => (
            <Reveal as="li" key={t.titulo} delay={i * 0.06} className="relative pb-10 pl-10 last:pb-0" data-testid={`program-block-${i + 1}`}>
              <span
                className={`absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 ${t.destaque ? "border-brand bg-brand" : "border-ink bg-paper"}`}
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-muted-dark">{t.quando}</p>
              <h3 className="display mt-1 text-4xl sm:text-5xl">
                {t.titulo}
                {t.destaque && <span className="ml-3 align-middle font-sans text-sm font-bold normal-case tracking-normal text-brand-deep">ida à rua</span>}
              </h3>
              <p className="mt-3 max-w-lg text-lg text-ink/80">{t.texto}</p>
              <p className="mt-3 text-sm text-muted-dark">{t.tags.join(" · ")}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
