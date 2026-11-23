import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT, GROUP_WHATSAPP_TEXT } from "@/data/event";

export default function Groups() {
  return (
    <section id="grupos" className="bg-brand py-[clamp(3rem,8vh,5rem)] text-ink" data-testid="groups-section">
      <Reveal className="wrap grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="label">Pastores e líderes</p>
          <h2 className="display mt-3 t-h2-p" data-testid="groups-title">
            Traga sua célula, seus jovens, sua igreja
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink/80">
            Ninguém sai sozinho, e nenhum grupo também. Preparamos arte, texto e um link com o nome da sua igreja para você divulgar.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9">
          <Link to="/lideres" className="btn bg-ink text-white hover:bg-ink-3" data-testid="groups-kit-btn">
            Pegar material de divulgação <ArrowRight size={18} />
          </Link>
          <a
            href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(GROUP_WHATSAPP_TEXT)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-ink hover:bg-ink/10"
            data-testid="groups-whatsapp-btn"
          >
            Falar com a equipe no WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
