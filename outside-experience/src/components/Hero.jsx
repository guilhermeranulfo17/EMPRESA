import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin, Volume2, VolumeX } from "lucide-react";
import { EVENT, IMAGES } from "@/data/event";
import { MaskedLines } from "@/components/Reveal";
import { scrollToId } from "@/lib/scroll";

const LINES_DESKTOP = ["A FÉ NÃO FOI FEITA", "PARA FICAR DENTRO"];
const LINES_MOBILE = ["A FÉ NÃO", "FOI FEITA", "PARA FICAR", "DENTRO"];
const EASE = [0.16, 1, 0.3, 1];

function useIsDesktop() {
  const [is, setIs] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const fn = (e) => setIs(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return is;
}

function useCountdown(target) {
  const calc = () => Math.max(0, target.getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function Countdown({ target }) {
  const t = useCountdown(target);
  const units = [["DIAS", t.d], ["HORAS", t.h], ["MIN", t.m], ["SEG", t.s]];
  return (
    <div className="mt-8 flex gap-6" data-testid="hero-countdown">
      {units.map(([label, v]) => (
        <div key={label}>
          <span className="block font-mono text-2xl sm:text-3xl text-orange-500 tabular-nums">{String(v).padStart(2, "0")}</span>
          <span className="block text-[9px] tracking-[0.25em] text-neutral-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero({ ready }) {
  const ref = useRef(null);
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const [playing, setPlaying] = useState(true);
  const lines = isDesktop ? LINES_DESKTOP : LINES_MOBILE;
  const last = lines.length - 1;

  const fade = (delay) => ({
    initial: { opacity: 0, y: 18 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section id="hero" ref={ref} data-testid="hero-section" className="relative min-h-[100svh] flex flex-col overflow-hidden bg-[#050505]">
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 will-change-transform">
        <img
          src={IMAGES.hero}
          alt="Pessoas caminhando pela cidade em direção à cruz — Outside Experience"
          className="w-full h-full object-cover object-[72%_center] md:object-center"
          fetchPriority="high"
          data-testid="hero-bg-image"
        />
        <div className="absolute inset-0 bg-[#050505]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-[#050505]/25 to-transparent" />
      </motion.div>

      {playing && (
        <iframe
          title="Música ambiente"
          className="absolute w-px h-px opacity-0 pointer-events-none"
          src={`https://www.youtube.com/embed/${EVENT.youtubeId}?autoplay=1&loop=1&playlist=${EVENT.youtubeId}&controls=0&mute=0&playsinline=1`}
          allow="autoplay; encrypted-media"
          data-testid="hero-music-iframe"
        />
      )}

      <motion.div style={{ opacity: fadeOut }} className="relative z-10 flex-1 flex flex-col justify-end px-5 md:px-10 lg:px-20 pt-28 pb-10 md:pb-14">
        <motion.span {...fade(0.05)} className="inline-flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-orange-400 font-semibold" data-testid="hero-kicker">
          <span className="w-6 h-[2px] bg-orange-500" /> Outside Experience
        </motion.span>

        <h1
          className="mt-5 md:mt-6 font-black uppercase tracking-[-0.03em] leading-[0.9] text-[13vw] sm:text-[11vw] md:text-[7.2vw] lg:text-[min(5.2vw,11vh)]"
          style={{ fontFamily: "Outfit, sans-serif" }}
          data-testid="hero-headline"
        >
          <MaskedLines
            key={isDesktop ? "d" : "m"}
            lines={lines}
            ready={ready}
            delay={0.15}
            render={(line, i) => {
              if (!isDesktop) return i === last ? <span className="text-orange-500">{line}</span> : line;
              if (i === last) {
                const [a, b] = line.split(" DENTRO");
                return (
                  <>
                    {a} <span className="text-orange-500">DENTRO</span>
                    {b}
                  </>
                );
              }
              return line;
            }}
          />
        </h1>

        <motion.p {...fade(0.6)} className="mt-6 md:mt-7 max-w-md text-neutral-300 text-sm sm:text-base leading-relaxed" data-testid="hero-subheadline">
          Uma experiência presencial para viver Jesus na prática e responder ao chamado de ir
        </motion.p>

        <motion.div {...fade(0.72)} className="mt-7 md:mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <button
            onClick={() => scrollToId("#inscricao")}
            data-testid="hero-cta-btn"
            className="group inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-400 text-black text-xs sm:text-sm font-bold tracking-[0.2em] uppercase px-7 py-4 transition-colors"
          >
            Quero viver essa experiência
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase" data-testid="hero-meta">
            <span className="text-orange-400 font-semibold whitespace-nowrap" data-testid="hero-date">Próxima edição · {EVENT.dateLabel}</span>
            <span className="hidden sm:block h-3 w-px bg-white/25" />
            <span className="inline-flex items-center gap-1.5 text-neutral-300 whitespace-nowrap" data-testid="hero-city">
              <MapPin size={11} /> {EVENT.city}
            </span>
          </div>
        </motion.div>

        {EVENT.date && <Countdown target={new Date(EVENT.date)} />}
      </motion.div>

      <motion.div {...fade(1)} className="relative z-10 px-5 md:px-10 lg:px-20 pb-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-[9px] tracking-[0.3em] uppercase text-neutral-500 hidden sm:block">{EVENT.venue}</span>
        <button
          onClick={() => setPlaying((p) => !p)}
          data-testid="music-toggle-btn"
          className="ml-auto inline-flex items-center gap-2 text-neutral-400 hover:text-white text-[9px] tracking-[0.3em] uppercase transition-colors"
          aria-label={playing ? "Pausar música" : "Tocar música"}
        >
          {playing ? <Volume2 size={13} className="text-orange-500" /> : <VolumeX size={13} />}
          {playing ? "Som ligado" : "Som desligado"}
        </button>
      </motion.div>
    </section>
  );
}
