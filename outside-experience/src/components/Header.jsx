import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { LOGO } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const NAV_LINKS = [
  { label: "O EXPERIENCE", href: "#experience", id: "experience" },
  { label: "PROGRAMAÇÃO", href: "#programacao", id: "programacao" },
  { label: "QUEM ESTARÁ", href: "#quem-estara", id: "quem-estara" },
  { label: "FAQ", href: "#faq", id: "faq" },
  { label: "INSCRIÇÃO", href: "#inscricao", id: "inscricao" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="px-5 md:px-10 lg:px-20 h-16 md:h-[72px] flex items-center justify-between">
        <button
          onClick={() => go("#hero")}
          className="flex items-center gap-3 group"
          data-testid="header-logo-btn"
          aria-label="Outside Experience — voltar ao topo"
        >
          <img src={LOGO} alt="Outside" className="h-5 sm:h-6 w-auto" />
          <span className="hidden sm:block h-4 w-px bg-white/25" />
          <span className="hidden sm:block text-[10px] tracking-[0.35em] uppercase font-semibold text-neutral-300 group-hover:text-orange-400 transition-colors">
            Experience
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-7" data-testid="header-nav">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.href)}
              data-testid={`nav-${l.id}`}
              className="relative text-[10px] tracking-[0.25em] uppercase font-medium text-neutral-400 hover:text-white transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-orange-500 hover:after:w-full after:transition-[width] after:duration-300"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => go("#inscricao")}
            data-testid="header-cta-btn"
            className="hidden sm:inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-3 transition-colors"
          >
            Garantir minha vaga
            <ArrowRight size={12} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center border border-white/15 text-white hover:border-orange-500 transition-colors"
            data-testid="mobile-menu-btn"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl animate-fade-up"
          data-testid="mobile-menu"
        >
          <nav className="px-5 py-6 flex flex-col">
            {NAV_LINKS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => go(l.href)}
                data-testid={`mobile-nav-${l.id}`}
                className="flex items-center justify-between py-4 border-b border-white/5 text-left text-sm tracking-[0.2em] uppercase font-semibold text-neutral-200 hover:text-orange-400 transition-colors"
              >
                {l.label}
                <span className="font-mono text-[10px] text-neutral-600">0{i + 1}</span>
              </button>
            ))}
            <button
              onClick={() => go("#inscricao")}
              data-testid="mobile-cta-btn"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-orange-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-4"
            >
              Garantir minha vaga <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
