import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Volume2, VolumeX } from "lucide-react";
import { EVENT, IMAGES } from "@/data/event";
import { scrollToId } from "@/lib/scroll";
import { useVagas } from "@/lib/vagas";

const EASE = [0.16, 1, 0.3, 1];
const subir = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
});

export default function Hero() {
  const [musica, setMusica] = useState(false);
  const { total, restantes } = useVagas();

  return (
    <section id="topo" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink" data-testid="hero-section">
      <picture>
        <source media="(max-width: 767px)" srcSet={IMAGES.heroCelular} />
        <img
          src={IMAGES.hero}
          alt="Equipe da Outside conversando e orando com pessoas numa calçada da cidade"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] max-md:object-center"
          fetchPriority="high"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />

      {musica && (
        <iframe
          title="Música ambiente"
          className="pointer-events-none absolute h-px w-px opacity-0"
          src={`https://www.youtube.com/embed/${EVENT.youtubeId}?autoplay=1&loop=1&playlist=${EVENT.youtubeId}&controls=0&playsinline=1`}
          allow="autoplay; encrypted-media"
        />
      )}

      <div className="wrap relative z-10 flex flex-1 flex-col justify-end pb-[clamp(1.5rem,4vh,3.5rem)] pt-24">
        <motion.p {...subir(0.05)} className="font-serif text-xl italic text-white/85 sm:text-2xl" data-testid="hero-kicker">
          Outside Experience, {EVENT.edition}
        </motion.p>

        <motion.h1
          {...subir(0.15)}
          className="display mt-3 max-w-[13ch] t-hero text-white"
          data-testid="hero-headline"
        >
          Como ouvirão se não há <span className="text-brand">quem pregue?</span>
        </motion.h1>
        <motion.p {...subir(0.22)} className="mt-3 text-sm font-semibold uppercase tracking-label text-white/60" data-testid="hero-verse">
          Romanos 10:14
        </motion.p>

        <motion.p {...subir(0.3)} className="mt-6 max-w-md text-lg leading-snug text-white/85" data-testid="hero-subheadline">
          Um dia inteiro de adoração, palavra e preparo que termina na rua, falando de Jesus com quem passa.
        </motion.p>

        <motion.div {...subir(0.42)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button onClick={() => scrollToId("#inscricao")} className="btn-brand" data-testid="hero-cta-btn">
            Quero ir
          </button>
          <button onClick={() => scrollToId("#edicao")} className="btn text-white underline decoration-white/40 underline-offset-[6px] hover:decoration-brand">
            Ver como foi a 1ª edição
          </button>
        </motion.div>

        <motion.dl
          {...subir(0.55)}
          className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/20 pt-5 sm:grid-cols-3"
          data-testid="hero-meta"
        >
          <div>
            <dt className="text-sm text-white/60">Quando</dt>
            <dd className="font-semibold" data-testid="hero-date">{EVENT.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-white/60">Onde</dt>
            <dd className="font-semibold" data-testid="hero-city">{EVENT.cityShort}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-sm text-white/60">Vagas</dt>
            <dd className="font-semibold" data-testid="hero-vagas">
              {restantes === null ? `${total} vagas` : restantes > 0 ? `Restam ${restantes} de ${total}` : "Lista de espera"}
            </dd>
          </div>
        </motion.dl>
      </div>

      <div className="wrap relative z-10 flex items-center justify-between pb-5 text-sm text-white/60">
        <button onClick={() => scrollToId("#sobre")} className="inline-flex items-center gap-2 hover:text-white" aria-label="Rolar para baixo">
          <ArrowDown size={16} /> Role para ver
        </button>
        <button
          onClick={() => setMusica((m) => !m)}
          className="inline-flex min-h-[44px] items-center gap-2 hover:text-white"
          aria-pressed={musica}
          data-testid="music-toggle-btn"
        >
          {musica ? <Volume2 size={16} className="text-brand" /> : <VolumeX size={16} />}
          {musica ? "Pausar música" : "Tocar música"}
        </button>
      </div>
    </section>
  );
}
