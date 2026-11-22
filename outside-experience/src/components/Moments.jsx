import Reveal from "@/components/Reveal";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const MOMENTS = [
  { n: "01", title: "Adoração", desc: "Entrega, presença e encontro com Deus" },
  { n: "02", title: "Palavra", desc: "Ensino direto, prático e centrado em Jesus" },
  { n: "03", title: "Ativação", desc: "Coragem, fé e disponibilidade" },
  { n: "04", title: "Dons", desc: "Prática responsável dos dons espirituais" },
  { n: "05", title: "Evangelismo", desc: "Ferramentas simples para comunicar o evangelho" },
  { n: "06", title: "Missão", desc: "Sair para viver o que foi ministrado" },
  { n: "07", title: "Comunhão", desc: "Gente com a mesma fome por Jesus" },
];

export default function Moments() {
  return (
    <section className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#0a0a0a] border-t border-white/10" data-testid="moments-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
                <span className="w-6 h-px bg-orange-500" /> O que você vai viver
              </span>
              <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="moments-title">
                Uma
                <br />
                experiência
                <br />
                <span className="text-orange-500">Vários</span>
                <br />
                momentos
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          {MOMENTS.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.04} y={20}>
              <div
                className="group relative overflow-hidden border-t border-white/10 last:border-b py-5 md:py-7 grid grid-cols-[2.5rem_1fr] md:grid-cols-[4rem_1fr_1fr] items-baseline gap-4 md:gap-8 cursor-default"
                data-testid={`moment-${m.n}`}
              >
                <span className="absolute inset-0 bg-orange-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative font-mono text-[11px] text-orange-500 group-hover:text-black transition-colors duration-300">{m.n}</span>
                <h3 className="relative text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white group-hover:text-black group-hover:translate-x-2 transition-[color,transform] duration-500" style={OUTFIT}>
                  {m.title}
                </h3>
                <p className="relative col-start-2 md:col-start-3 text-sm text-neutral-400 group-hover:text-black/75 transition-colors duration-300">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
