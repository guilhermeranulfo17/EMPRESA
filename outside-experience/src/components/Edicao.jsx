import { Instagram } from "lucide-react";
import Reveal from "@/components/Reveal";
import { GALLERY, PROOF, EVENT } from "@/data/event";

export default function Edicao() {
  return (
    <section id="edicao" className="bg-ink py-20 sm:py-28" data-testid="proof-section">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-5">
          <p className="label text-brand">Como foi a {PROOF.edition}</p>
          <p className="mt-4 flex items-end gap-4">
            <span className="font-display text-[clamp(7rem,22vw,13rem)] leading-[0.8] text-brand" data-testid="proof-stat">
              {PROOF.salvations}
            </span>
            <span className="display pb-2 text-[clamp(1.8rem,4vw,2.8rem)] text-white">salvações</span>
          </p>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
          <p className="font-serif text-2xl leading-snug text-white/90 sm:text-3xl" data-testid="proof-note">
            {PROOF.note}
          </p>
          <a href={PROOF.instagramUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-white/80 link" data-testid="proof-instagram">
            <Instagram size={18} /> Mais fotos e vídeos em @{EVENT.instagram}
          </a>
        </Reveal>
      </div>

      {/* faixa de fotos reais: rola de lado no celular */}
      <Reveal delay={0.12} className="mt-14">
        <ul
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:gap-4 sm:px-8 lg:px-12 [scrollbar-width:thin]"
          aria-label="Fotos da 1ª edição"
          data-testid="gallery"
        >
          {GALLERY.map((f) => (
            <li key={f.src} className="w-[62vw] max-w-[300px] shrink-0 snap-start sm:w-[260px]">
              <img src={f.src} alt={f.alt} loading="lazy" className="aspect-[9/16] w-full object-cover" />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
