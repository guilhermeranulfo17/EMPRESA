import Reveal from "@/components/Reveal";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const BLOCKS = [
  { n: "01", period: "Manhã", title: "Ativação", desc: "Adoração, palavra e fé despertada para ir." },
  { n: "02", period: "Manhã", title: "Capacitação", desc: "Ferramentas simples para comunicar o evangelho com clareza." },
  { n: "03", period: "Tarde", title: "Consagração & Envio", tag: "Ida ao campo", desc: "Oração, consagração e saída em equipes para a rua." },
  { n: "04", period: "Noite", title: "Debriefing", desc: "Testemunhos, celebração e próximos passos." },
];

export default function Program() {
  return (
    <section id="programacao" className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10" data-testid="program-section">
      <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
        <div>
          <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
            <span className="w-6 h-px bg-orange-500" /> Programação
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="program-title">
            Como vai
            <br />
            ser o dia
          </h2>
        </div>
        <p className="max-w-xs text-neutral-500 text-sm leading-relaxed md:text-right" data-testid="program-note">
          Horários detalhados serão divulgados com a abertura das inscrições
        </p>
      </Reveal>

      <div className="border-t border-white/10">
        {BLOCKS.map((b, i) => (
          <Reveal key={b.n} delay={i * 0.05} y={20}>
            <div
              className="group grid grid-cols-[4.5rem_1fr] md:grid-cols-[9rem_1fr_1.3fr] gap-4 md:gap-10 py-7 md:py-8 border-b border-white/10 hover:border-orange-500/40 transition-colors"
              data-testid={`program-block-${b.n}`}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.3em] uppercase text-orange-400 font-semibold">{b.period}</span>
                <span className="font-mono text-xs text-neutral-600">{b.n}</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none group-hover:text-orange-400 transition-colors" style={OUTFIT}>
                  {b.title}
                </h3>
                {b.tag && (
                  <span className="mt-3 inline-block bg-orange-500 text-black text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-1" data-testid="program-field-tag">
                    {b.tag}
                  </span>
                )}
              </div>
              <p className="col-start-2 md:col-start-3 text-sm text-neutral-400 leading-relaxed">{b.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p className="text-sm italic text-neutral-400">“Ide por todo o mundo e pregai o evangelho a toda criatura.”</p>
        <span className="text-[10px] tracking-[0.25em] uppercase text-orange-500/70">Marcos 16:15</span>
      </Reveal>
    </section>
  );
}
