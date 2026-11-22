import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGO } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  { label: "Como é o dia", href: "#o-dia" },
  { label: "Na rua", href: "#na-rua" },
  { label: "Quem vai", href: "#quem-vai" },
  { label: "Dúvidas", href: "#duvidas" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    scrollToId(href);
  };

  return (
    <header
      data-testid="site-header"
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-ink/90 backdrop-blur-md" : "bg-gradient-to-b from-ink/70 to-transparent"
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <button onClick={() => go("#topo")} className="flex items-center gap-3" aria-label="Outside Experience, voltar ao topo" data-testid="header-logo-btn">
          <img src={LOGO} alt="Outside" className="h-6 w-auto" />
          <span className="hidden font-serif text-lg italic text-white/80 sm:block">Experience</span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Seções" data-testid="header-nav">
          {NAV.map((l) => (
            <button key={l.href} onClick={() => go(l.href)} className="text-[15px] text-white/75 transition-colors hover:text-white">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => go("#inscricao")} className="btn-brand hidden min-h-[44px] px-5 text-sm sm:inline-flex" data-testid="header-cta-btn">
            Quero ir
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center text-white lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            data-testid="mobile-menu-btn"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-up border-t border-white/10 bg-ink lg:hidden" aria-label="Seções" data-testid="mobile-menu">
          <div className="wrap flex flex-col py-4">
            {NAV.map((l) => (
              <button key={l.href} onClick={() => go(l.href)} className="py-3.5 text-left font-display text-3xl uppercase text-white">
                {l.label}
              </button>
            ))}
            <button onClick={() => go("#inscricao")} className="btn-brand mt-4 w-full" data-testid="mobile-cta-btn">
              Quero ir
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
