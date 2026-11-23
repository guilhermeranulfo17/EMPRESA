import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

export default function Encerramento() {
  return (
    <section className="bg-ink secao" data-testid="final-cta-section">
      <div className="wrap">
        <Reveal>
          <h2 className="display max-w-4xl t-final" data-testid="final-cta-title">
            Chegou a hora de <span className="text-brand">sair</span>
          </h2>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center">
            <button onClick={() => scrollToId("#inscricao")} className="btn-brand self-start" data-testid="final-cta-btn">
              Quero ir
            </button>
            <p className="font-serif text-2xl italic text-white/80" data-testid="final-cta-text">
              Você já ouviu bastante. Agora é viver.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-20 grid gap-px border-y border-white/10 sm:grid-cols-2" data-testid="next-step-section">
          <a
            href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre o Outside Experience.")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-4 py-6 text-lg sm:pr-8"
            data-testid="next-step-whatsapp"
          >
            <span>
              <span className="block text-white/60">Ficou com dúvida?</span>
              <span className="font-semibold group-hover:text-brand">Falar com a equipe</span>
            </span>
            <ArrowUpRight className="shrink-0 text-white/50 group-hover:text-brand" />
          </a>
          <Link
            to={EVENT.schoolUrl}
            className="group flex items-center justify-between gap-4 border-t border-white/10 py-6 text-lg sm:border-l sm:border-t-0 sm:pl-8"
            data-testid="next-step-school"
          >
            <span>
              <span className="block text-white/60">Quer ir mais fundo?</span>
              <span className="font-semibold group-hover:text-brand">Conhecer a Outside School</span>
            </span>
            <ArrowUpRight className="shrink-0 text-white/50 group-hover:text-brand" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
