import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { EVENT, LOGO } from "@/data/event";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink pb-28 pt-14 lg:pb-10" data-testid="site-footer">
      <div className="wrap grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <img src={LOGO} alt="Outside" className="h-7 w-auto" />
          <p className="mt-4 font-serif text-xl italic text-white/80">A fé não foi feita para ficar dentro.</p>
        </div>
        <ul className="space-y-3 text-white/75">
          <li>
            <a href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white" data-testid="footer-whatsapp">
              <MessageCircle size={16} /> {EVENT.whatsappLabel}
            </a>
          </li>
          <li>
            <a href={`mailto:${EVENT.email}`} className="inline-flex items-center gap-2 break-all hover:text-white" data-testid="footer-email">
              <Mail size={16} /> {EVENT.email}
            </a>
          </li>
          <li>
            <a href={EVENT.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white" data-testid="footer-instagram">
              <Instagram size={16} /> @{EVENT.instagram}
            </a>
          </li>
        </ul>
        <ul className="space-y-3 text-white/75">
          <li><Link to="/lideres" className="hover:text-white">Para pastores e líderes</Link></li>
          <li><Link to="/responsaveis" className="hover:text-white">Para pais e responsáveis</Link></li>
          <li><a href={EVENT.schoolUrl} target="_blank" rel="noreferrer" className="hover:text-white">Outside School</a></li>
        </ul>
      </div>
      <p className="wrap mt-12 text-sm text-white/40" data-testid="footer-copyright">
        © {new Date().getFullYear()} Outside. Uberlândia, MG.
      </p>
    </footer>
  );
}
