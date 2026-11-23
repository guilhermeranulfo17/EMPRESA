import { Instagram } from "lucide-react";
import Reveal from "@/components/Reveal";
import { SPEAKERS } from "@/data/event";

export default function Speakers() {
  return (
    <section id="quem-vai" className="bg-ink secao" data-testid="speakers-section">
      <div className="wrap">
        <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="display t-h2" data-testid="speakers-title">
            Quem vai com você
          </h2>
          <p className="max-w-xs text-white/70">Quem ministra no Experience.</p>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {SPEAKERS.map((s, i) => (
            <Reveal as="article" key={s.name} delay={i * 0.06} data-testid={`speaker-${i + 1}`}>
              <img src={s.photo} alt={s.name} loading="lazy" className="aspect-[4/5] w-full object-cover object-top" />
              <h3 className="display mt-5 text-3xl" data-testid={`speaker-${i + 1}-name`}>
                {s.name}
              </h3>
              <p className="text-white/60" data-testid={`speaker-${i + 1}-role`}>
                {s.role}
              </p>
              {s.bio && <p className="mt-3 text-white/80">{s.bio}</p>}
              {s.instagram && (
                <a
                  href={`https://instagram.com/${s.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-white/80 hover:text-brand"
                  data-testid={`speaker-${i + 1}-instagram`}
                >
                  <Instagram size={16} /> @{s.instagram}
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
