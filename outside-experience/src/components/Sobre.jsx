import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Reveal from "@/components/Reveal";

// Vídeo de divulgação: começa sozinho (sem som) quando a seção aparece e pausa quando sai da tela.
const VIDEO = { src: "/video/divulgacao.mp4", poster: "/video/divulgacao.jpg" };

function VideoDaSecao() {
  const ref = useRef(null);
  const [mudo, setMudo] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!reduzir) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: [0, 0.5] },
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  const alternarSom = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <figure className="relative mx-auto max-w-[300px] rotate-[1.5deg] bg-white p-3 pb-12 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] sm:max-w-[320px]">
      <div className="relative bg-ink">
        <video
          ref={ref}
          src={VIDEO.src}
          poster={VIDEO.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="aspect-[9/16] w-full object-cover"
          aria-label="Vídeo de divulgação do Outside Experience"
          data-testid="sobre-video"
        />
        <button
          type="button"
          onClick={alternarSom}
          aria-label={mudo ? "Ligar o som do vídeo" : "Desligar o som do vídeo"}
          aria-pressed={!mudo}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-brand hover:text-ink"
          data-testid="sobre-video-som"
        >
          {mudo ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      <figcaption className="absolute bottom-3 left-4 font-serif text-lg italic text-ink/80">1ª edição, Uberlândia</figcaption>
    </figure>
  );
}

export default function Sobre() {
  return (
    <section id="sobre" className="paper-grain bg-paper secao text-ink" data-testid="about-event-section">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="label text-brand-deep">O que é</p>
          <p className="mt-5 font-serif t-lead leading-[1.08]" data-testid="about-event-lead">
            Um encontro para cristãos que querem viver a fé fora das quatro paredes. A gente adora, aprende, ora junto e sai para a
            rua. <em className="text-brand-deep">Não falamos sobre missão. Vivemos.</em>
          </p>
          <p className="mt-8 max-w-xl text-lg text-muted-dark">
            Não é curso online nem congresso. É um dia inteiro, presencial, em Uberlândia, para quem é de qualquer igreja.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5">
          <VideoDaSecao />
        </Reveal>
      </div>
    </section>
  );
}
