import { Instagram } from "lucide-react";
import Reveal from "@/components/Reveal";
import { SPEAKERS } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

function Monogram({ name }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#1a1a1a,#050505)]">
      <span className="text-[6rem] font-black text-white/10 tracking-tighter" style={OUTFIT}>{initials}</span>
    </div>
  );
}

export default function Speakers() {
  return (
    <section id="quem-estara" className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#0a0a0a] border-t border-white/10" data-testid="speakers-section">
      <Reveal>
        <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
          <span className="w-6 h-px bg-orange-500" /> Ministrantes
        </span>
        <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="speakers-title">
          Quem estará
          <br />
          no <span className="text-orange-500">Experience</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {SPEAKERS.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.08}>
            <article className="group" data-testid={`speaker-${i + 1}`}>
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] border border-white/10">
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt={s.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-[filter,transform] duration-700 ease-out"
                  />
                ) : (
                  <Monogram name={s.name} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 font-mono text-[10px] text-orange-500">0{i + 1}</span>
                <span className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full bg-orange-500 transition-[width] duration-500" />
              </div>
              <h3 className="mt-5 text-xl sm:text-2xl font-black uppercase tracking-tight" style={OUTFIT} data-testid={`speaker-${i + 1}-name`}>
                {s.name}
              </h3>
              <p className="mt-1 text-[11px] tracking-[0.25em] uppercase text-neutral-500" data-testid={`speaker-${i + 1}-role`}>
                {s.role}
              </p>
              {s.bio && <p className="mt-3 text-sm text-neutral-400 leading-relaxed" data-testid={`speaker-${i + 1}-bio`}>{s.bio}</p>}
              {s.instagram && (
                <a
                  href={`https://instagram.com/${s.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-300 hover:text-orange-400 transition-colors"
                  data-testid={`speaker-${i + 1}-instagram`}
                >
                  <Instagram size={13} /> @{s.instagram}
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
