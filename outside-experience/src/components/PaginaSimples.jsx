import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LOGO } from "@/data/event";
import Footer from "@/components/Footer";

// Moldura das páginas internas (/lideres, /responsaveis)
export default function PaginaSimples({ titulo, children }) {
  useEffect(() => {
    document.title = `${titulo} | Outside Experience`;
    window.scrollTo(0, 0);
  }, [titulo]);

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="no-print border-b border-white/10">
        <div className="wrap flex h-16 items-center justify-between">
          <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 text-white/75 hover:text-white">
            <ArrowLeft size={18} /> Voltar ao site
          </Link>
          <img src={LOGO} alt="Outside" className="h-5 w-auto" />
        </div>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
}
