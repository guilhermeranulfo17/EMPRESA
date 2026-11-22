import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const STEPS = [
  { n: "01", title: "Você é capacitado", desc: "Pela manhã você recebe ferramentas simples para comunicar o evangelho com clareza." },
  { n: "02", title: "Oramos e somos enviados", desc: "Antes de sair, oração e consagração juntos. Ninguém sai sozinho." },
  { n: "03", title: "Saímos em equipe", desc: "Você vai acompanhado, em equipe, para compartilhar Jesus de maneira simples, humana e intencional." },
  { n: "04", title: "Voltamos e celebramos", desc: "À noite, testemunhos, celebração e próximos passos." },
];

export default function FieldSteps() {
  return (
    <section className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10" data-testid="field-steps-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
              <span className="w-6 h-px bg-orange-500" /> Como funciona a ida ao campo
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="field-steps-title">
              E se eu travar
              <br />
              <span className="text-orange-500">na hora?</span>
            </h2>
            <p className="mt-6 max-w-md text-neutral-400 text-sm sm:text-base leading-relaxed">
              Normal. O dia foi desenhado para quem ainda não sabe por onde começar. Você não vai para a rua sem preparo e não vai sozinho.
            </p>
            <button
              onClick={() => scrollToId("#inscricao")}
              data-testid="field-steps-cta-btn"
              className="group mt-8 inline-flex items-center gap-3 border-b-2 border-orange-500 pb-2 text-sm font-bold tracking-[0.25em] uppercase text-white hover:text-orange-400 transition-colors"
            >
              Eu quero ir
              <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        <ol className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06} y={16} className="bg-[#050505]">
              <li className="h-full p-6 md:p-8" data-testid={`field-step-${s.n}`}>
                <span className="font-mono text-[11px] text-orange-500">{s.n}</span>
                <h3 className="mt-4 text-xl sm:text-2xl font-black uppercase tracking-tight leading-none" style={OUTFIT}>
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
