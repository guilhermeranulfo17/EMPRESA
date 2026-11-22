import { Instagram, Mail, MessageCircle, ArrowUpRight } from "lucide-react";
import { EVENT, LOGO } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const EVENT_LINKS = [
  { label: "O Experience", href: "#experience" },
  { label: "Programação", href: "#programacao" },
  { label: "Quem estará", href: "#quem-estara" },
  { label: "Inscrição", href: "#inscricao" },
  { label: "FAQ", href: "#faq" },
];

export default function Footer() {
  return (
    <footer id="contato" className="bg-[#050505] border-t border-white/10 px-5 md:px-10 lg:px-20 pt-16 md:pt-20 pb-28 lg:pb-8" data-testid="site-footer">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <img src={LOGO} alt="Outside" className="h-8 w-auto" />
          <p className="mt-5 text-xs tracking-[0.3em] uppercase text-orange-500 font-semibold">Outside Experience</p>
          <p className="mt-4 max-w-xs text-sm text-neutral-500 leading-relaxed">A fé não foi feita para ficar dentro</p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10">
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-semibold mb-5">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${EVENT.email}`} data-testid="footer-email" className="inline-flex items-center gap-2 text-neutral-300 hover:text-orange-400 transition-colors break-all">
                  <Mail size={14} className="shrink-0" /> {EVENT.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre o Outside Experience.")}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="footer-whatsapp"
                  className="inline-flex items-center gap-2 text-neutral-300 hover:text-orange-400 transition-colors"
                >
                  <MessageCircle size={14} className="shrink-0" /> {EVENT.whatsappLabel}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-semibold mb-5">Redes</h4>
            <a href={EVENT.instagramUrl} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-orange-400 transition-colors">
              <Instagram size={14} /> @{EVENT.instagram}
            </a>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-semibold mb-5">Evento</h4>
            <ul className="space-y-3 text-sm">
              {EVENT_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => scrollToId(l.href)} data-testid={`footer-link-${l.href.slice(1)}`} className="text-neutral-300 hover:text-orange-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] tracking-[0.15em] uppercase text-neutral-600">
        <span data-testid="footer-copyright">© {new Date().getFullYear()} Outside — Outside Experience. Todos os direitos reservados.</span>
        <a href={EVENT.schoolUrl} target="_blank" rel="noreferrer" data-testid="footer-school-link" className="inline-flex items-center gap-1 hover:text-neutral-300 transition-colors" style={OUTFIT}>
          Conheça a Outside School <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
