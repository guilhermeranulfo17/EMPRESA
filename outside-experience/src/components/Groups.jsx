import { ArrowUpRight, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT, GROUP_WHATSAPP_TEXT } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const STEPS = [
  "Fale com a equipe pelo WhatsApp",
  "Combinamos juntos a participação do seu grupo",
  "Vocês vivem o dia juntos e voltam juntos para a igreja",
];

export default function Groups() {
  const link = `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(GROUP_WHATSAPP_TEXT)}`;
  return (
    <section id="grupos" className="py-20 md:py-24 px-5 md:px-10 lg:px-20 bg-orange-500 text-black" data-testid="groups-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase font-bold">
              <Users size={14} strokeWidth={2.5} /> Pastores e líderes
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="groups-title">
              Leve sua igreja
              <br />
              ou célula
            </h2>
            <p className="mt-6 max-w-lg text-black/75 text-sm sm:text-base leading-relaxed">
              Ninguém sai sozinho, e nenhum grupo também. Traga seus jovens, sua célula ou seu ministério para viver o Experience juntos.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.1}>
            <ol className="border-t border-black/20">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-start gap-4 py-3 border-b border-black/20 text-sm font-semibold">
                  <span className="font-mono text-[11px] pt-0.5">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              data-testid="groups-whatsapp-btn"
              className="group mt-6 w-full inline-flex items-center justify-center gap-3 bg-black hover:bg-neutral-900 text-white text-xs font-bold tracking-[0.2em] uppercase px-7 py-4 transition-colors"
            >
              Quero levar meu grupo
              <ArrowUpRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
