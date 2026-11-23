import Reveal from "@/components/Reveal";

const ETAPAS = [
  { titulo: "Ativação", texto: "Adoração e palavra para despertar a fé e a coragem de ir." },
  { titulo: "Capacitação", texto: "Ferramentas simples para falar de Jesus com clareza e para praticar os dons com responsabilidade." },
  { titulo: "Envio", texto: "Oração e consagração juntos. Depois, saímos em equipes para a rua.", destaque: true },
];

export default function ODia() {
  return (
    <section id="o-dia" className="paper-grain bg-paper secao text-ink" data-testid="program-section">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 className="display t-h2" data-testid="program-title">
            Como é o dia
          </h2>
          <blockquote className="mt-8 hidden max-w-xs border-l-2 border-brand pl-5 lg:block">
            <p className="font-serif text-2xl italic leading-snug">“Ide por todo o mundo e pregai o evangelho a toda criatura.”</p>
            <cite className="mt-3 block text-sm not-italic text-muted-dark">Marcos 16:15</cite>
          </blockquote>
        </Reveal>

        <ol className="relative lg:col-span-7 lg:col-start-6">
          <span className="absolute bottom-3 left-[7px] top-3 w-px bg-paper-line" aria-hidden="true" />
          {ETAPAS.map((t, i) => (
            <Reveal as="li" key={t.titulo} delay={i * 0.06} className="relative pb-[clamp(1.75rem,5vh,2.75rem)] pl-10 last:pb-0" data-testid={`program-block-${i + 1}`}>
              <span
                className={`absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 ${t.destaque ? "border-brand bg-brand" : "border-ink bg-paper"}`}
                aria-hidden="true"
              />
              <h3 className="display text-[clamp(2.2rem,min(5vw,6.5vh),3rem)]">{t.titulo}</h3>
              <p className="mt-2 max-w-lg text-lg text-ink/80">{t.texto}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
