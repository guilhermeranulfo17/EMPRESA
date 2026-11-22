import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { EVENT } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

export default function MobileCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [nearForm, setNearForm] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    const el = document.querySelector("#inscricao");
    const io = new IntersectionObserver(([e]) => setNearForm(e.isIntersecting), { threshold: 0.12 });
    if (el) io.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const visible = scrolled && !nearForm;

  return (
    <div
      className={`lg:hidden fixed bottom-0 inset-x-0 z-40 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "translate-y-0" : "translate-y-full"}`}
      data-testid="mobile-sticky-cta"
      aria-hidden={!visible}
    >
      <div className="bg-[#050505]/92 backdrop-blur-xl border-t border-orange-500/30 px-4 py-3 flex items-center gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex-1 min-w-0">
          <span className="block text-[9px] tracking-[0.25em] uppercase text-orange-400 font-semibold truncate">Próxima edição</span>
          <span className="block text-[10px] text-neutral-400 truncate">{EVENT.dateLabel} · {EVENT.city}</span>
        </div>
        <button
          onClick={() => scrollToId("#inscricao")}
          data-testid="mobile-sticky-cta-btn"
          className="inline-flex items-center gap-2 bg-orange-500 text-black text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-3.5"
        >
          Garantir minha vaga <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
