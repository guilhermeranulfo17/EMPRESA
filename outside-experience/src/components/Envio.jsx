import Reveal from "@/components/Reveal";
import { IMAGES } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

export default function Envio() {
  return (
    <section id="envio" className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#0a0a0a] border-t border-white/10" data-testid="envio-section">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
              <span className="w-6 h-px bg-orange-500" /> O momento prático
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.03em] leading-[0.92]" style={OUTFIT} data-testid="envio-title">
              O que recebemos dentro,
              <br />
              <span className="text-orange-500">levamos para fora</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 space-y-5 text-neutral-400 text-sm sm:text-base leading-relaxed max-w-lg">
            <p>Depois de adorar, aprender e ser ativado, saímos juntos — em equipes — para compartilhar Jesus de maneira simples, humana e intencional.</p>
            <ul className="space-y-1 pt-2 font-semibold" style={OUTFIT}>
              <li className="text-white">Não é sobre performance</li>
              <li className="text-white">Não é sobre saber falar tudo</li>
              <li className="text-orange-400">É sobre disponibilidade</li>
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="mt-10 border-l-2 border-orange-500 pl-5 sm:pl-6">
            <p className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none" style={OUTFIT} data-testid="envio-final">
              Alguém precisa ir
            </p>
            <p className="mt-4 text-sm italic text-neutral-400">“Como ouvirão, se não há quem pregue?”</p>
            <span className="text-[10px] tracking-[0.25em] uppercase text-orange-500/70">Romanos 10:14</span>
          </Reveal>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2">
          <Reveal>
            <div className="relative">
              <span className="absolute -top-2 -right-2 w-14 h-14 border-t-2 border-r-2 border-orange-500 z-10" />
              <span className="absolute -bottom-2 -left-2 w-14 h-14 border-b-2 border-l-2 border-orange-500 z-10" />
              <div className="overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% 95%, 0 100%)" }}>
                <img
                  src={IMAGES.prayer}
                  alt="Jovens orando juntos antes de sair para as ruas"
                  className="w-full aspect-[4/3] object-cover grayscale hover:grayscale-0 hover:scale-[1.03] transition-[filter,transform] duration-700"
                  loading="lazy"
                  data-testid="envio-image"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[10px] tracking-[0.25em] uppercase text-neutral-500">
              <span>Outside Experience · Uberlândia</span>
              <span className="text-orange-500">Ida ao campo</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
