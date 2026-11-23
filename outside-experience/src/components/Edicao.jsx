import { useEffect, useState } from "react";
import { Instagram, Play, X } from "lucide-react";
import Reveal from "@/components/Reveal";
import { GALLERY, PROOF, EVENT } from "@/data/event";

function Item({ item, onAbrir, oculto }) {
  const base = "h-[clamp(300px,54vh,480px)] aspect-[9/16] w-auto shrink-0 object-cover";
  if (item.tipo === "foto") return <img src={item.src} alt={oculto ? "" : item.alt} loading="lazy" className={base} />;
  if (item.tipo === "loop")
    return <video src={item.src} poster={item.poster} className={base} autoPlay muted loop playsInline preload="metadata" aria-label={oculto ? undefined : item.alt} />;
  return (
    <button
      onClick={onAbrir}
      tabIndex={oculto ? -1 : 0}
      className={`group relative ${base} overflow-hidden`}
      aria-label="Assistir ao vídeo do Outside Experience"
      data-testid={oculto ? undefined : "gallery-video"}
    >
      <img src={item.poster} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-ink/30" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-ink shadow-lg transition-transform group-hover:scale-110">
          <Play size={28} fill="currentColor" />
        </span>
        <span className="font-semibold text-white drop-shadow">Assista ao vídeo</span>
      </span>
    </button>
  );
}

function Player({ src, onFechar }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [onFechar]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label="Vídeo" onClick={onFechar}>
      <button onClick={onFechar} aria-label="Fechar vídeo" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white">
        <X size={26} />
      </button>
      <video src={src} controls autoPlay playsInline className="max-h-[90vh] w-auto max-w-full" onClick={(e) => e.stopPropagation()} data-testid="gallery-player" />
    </div>
  );
}

export default function Edicao() {
  const [aberto, setAberto] = useState(null);
  return (
    <section id="edicao" className="bg-ink secao" data-testid="proof-section">
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-5">
          <p className="label text-brand">Como foi a {PROOF.edition}</p>
          <p className="mt-4 flex items-end gap-4">
            <span className="font-display t-gigante leading-[0.8] text-brand" data-testid="proof-stat">
              {PROOF.salvations}
            </span>
            <span className="display pb-2 text-[clamp(1.8rem,min(4vw,5vh),2.8rem)] text-white">salvações</span>
          </p>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
          <p className="font-serif text-[clamp(1.4rem,min(3vw,3.6vh),1.9rem)] leading-snug text-white/90" data-testid="proof-note">
            {PROOF.note}
          </p>
          <a href={PROOF.instagramUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-white/80 link" data-testid="proof-instagram">
            <Instagram size={18} /> Mais fotos e vídeos em @{EVENT.instagram}
          </a>
        </Reveal>
      </div>

      {/* faixa que rola sozinha, sem barra; para quando o mouse passa por cima */}
      <div className="galeria mt-[clamp(2rem,6vh,3.5rem)] overflow-hidden" aria-label="Fotos e vídeos da 1ª edição" data-testid="gallery">
        <div className="galeria-trilho flex w-max gap-3 sm:gap-4">
          {[0, 1].map((copia) =>
            GALLERY.map((item, i) => (
              <div key={`${copia}-${i}`} aria-hidden={copia === 1 || undefined} className="shrink-0">
                <Item item={item} oculto={copia === 1} onAbrir={() => setAberto(item.src)} />
              </div>
            )),
          )}
        </div>
      </div>

      {aberto && <Player src={aberto} onFechar={() => setAberto(null)} />}
    </section>
  );
}
