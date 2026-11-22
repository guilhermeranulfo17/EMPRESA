import { useEffect, useState } from "react";
import { EVENT } from "@/data/event";
import { scrollToId } from "@/lib/scroll";
import { useVagas } from "@/lib/vagas";

export default function MobileCTA() {
  const [passou, setPassou] = useState(false);
  const [noForm, setNoForm] = useState(false);
  const { restantes, total } = useVagas();

  useEffect(() => {
    const onScroll = () => setPassou(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    const el = document.querySelector("#inscricao");
    const io = new IntersectionObserver(([e]) => setNoForm(e.isIntersecting), { threshold: 0.1 });
    if (el) io.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const visivel = passou && !noForm;

  return (
    <div
      className={`no-print fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 lg:hidden ${visivel ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!visivel}
      data-testid="mobile-sticky-cta"
    >
      <div className="flex items-center gap-3 border-t border-white/10 bg-ink/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate font-semibold">{EVENT.dateLabel}</p>
          <p className="truncate text-sm text-white/60">{restantes === null ? `${total} vagas` : `Restam ${restantes} vagas`}</p>
        </div>
        <button onClick={() => scrollToId("#inscricao")} className="btn-brand min-h-[48px] px-6" tabIndex={visivel ? 0 : -1} data-testid="mobile-sticky-cta-btn">
          Quero ir
        </button>
      </div>
    </div>
  );
}
