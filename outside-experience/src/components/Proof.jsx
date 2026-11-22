import { Instagram, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { PROOF } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

export default function Proof() {
  const { videoId, stats, instagramUrl, edition } = PROOF;
  if (!videoId && !stats.length) return null;
  return (
    <section id="edicoes" className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10" data-testid="proof-section">
      <Reveal>
        <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
          <span className="w-6 h-px bg-orange-500" /> Já aconteceu{edition ? ` · ${edition}` : ""}
        </span>
        <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="proof-title">
          Não é teoria.
          <br />
          <span className="text-orange-500">A gente foi.</span>
        </h2>
      </Reveal>

      {stats.length > 0 && (
        <Reveal delay={0.1} className="mt-12 flex flex-wrap gap-px bg-white/10 border border-white/10">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 basis-[calc(50%-1px)] lg:basis-0 bg-[#050505] p-6 md:p-8" data-testid="proof-stat">
              <span className="block text-5xl md:text-6xl font-black tracking-tight text-orange-500" style={OUTFIT}>{s.value}</span>
              <span className="mt-2 block text-[11px] tracking-[0.25em] uppercase text-neutral-400">{s.label}</span>
            </div>
          ))}
        </Reveal>
      )}

      {instagramUrl && (
        <Reveal delay={0.15} className="mt-8">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="proof-instagram"
            className="group inline-flex items-center gap-3 border border-white/15 hover:border-orange-500 px-6 py-4 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors"
          >
            <Instagram size={16} className="text-orange-500" />
            Veja como foi no Instagram
            <ArrowUpRight size={14} className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
          </a>
        </Reveal>
      )}

      {videoId && (
        <Reveal delay={0.15} className="mt-10">
          <div className="relative aspect-video border border-white/10 bg-[#0a0a0a]">
            <iframe
              title="Outside Experience — como foi"
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              data-testid="proof-video"
            />
          </div>
        </Reveal>
      )}
    </section>
  );
}
