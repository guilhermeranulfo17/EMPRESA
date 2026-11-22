import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import { EVENT } from "@/data/event";

const PERGUNTAS = [
  {
    q: "O que é o Outside Experience?",
    a: "Um encontro cristão presencial de adoração, palavra, ativação e prática, que termina na rua: saímos juntos para viver o evangelho. Não é curso online nem congresso. É um dia inteiro para sair da teoria.",
  },
  {
    q: "Quando e onde vai ser?",
    a: `A ${EVENT.edition} será em ${EVENT.dateLabel.toLowerCase()}, em ${EVENT.city}. O local e o dia exato serão anunciados em breve, e quem está na lista recebe primeiro, no WhatsApp.`,
  },
  {
    q: "Preciso ser de alguma igreja específica?",
    a: "Não. O Experience é para cristãos de qualquer igreja.",
  },
  {
    q: "Preciso ter experiência com evangelismo?",
    a: "Não. O dia foi desenhado para quem quer viver isso na prática e ainda não sabe por onde começar. Você recebe ferramentas simples e vai acompanhado.",
  },
  {
    q: "E se eu tiver vergonha de evangelizar?",
    a: "Então provavelmente esse dia é para você. Não é sobre performance nem sobre saber falar tudo. É sobre disponibilidade. Ninguém sai sozinho.",
  },
  {
    q: "Vamos para a rua de verdade?",
    a: "Sim. Depois da ativação e da capacitação, saímos em equipes para compartilhar Jesus de maneira simples, humana e intencional.",
  },
  {
    q: "Tem idade mínima?",
    a: "Menores de 18 anos participam com autorização do responsável, confirmada na inscrição.",
    pais: true,
  },
  {
    q: "Quanto custa? Tem alimentação?",
    a: "Valores e detalhes serão divulgados junto com a abertura das inscrições.",
  },
];

function Item({ item, i, aberto, alternar }) {
  return (
    <div className="border-b border-paper-line" data-testid={`faq-item-${i}`}>
      <h3>
        <button
          onClick={alternar}
          aria-expanded={aberto}
          aria-controls={`faq-resp-${i}`}
          className="flex w-full items-start justify-between gap-6 py-5 text-left text-xl font-semibold"
          data-testid={`faq-question-${i}`}
        >
          {item.q}
          <Plus size={22} className={`mt-1 shrink-0 transition-transform duration-300 ${aberto ? "rotate-45 text-brand-deep" : ""}`} aria-hidden="true" />
        </button>
      </h3>
      <div id={`faq-resp-${i}`} className={`grid transition-[grid-template-rows] duration-300 ${aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 text-lg text-ink/75" data-testid={`faq-answer-${i}`}>
            {item.a}{" "}
            {item.pais && (
              <Link to="/responsaveis" className="link font-semibold text-ink">
                Informações para pais e responsáveis
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [aberto, setAberto] = useState(0);
  return (
    <section id="duvidas" className="paper-grain bg-paper py-20 text-ink sm:py-28" data-testid="faq-section">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 className="display text-[clamp(3rem,7vw,5.5rem)]" data-testid="faq-title">
            Dúvidas
          </h2>
          <p className="mt-5 max-w-xs text-lg text-muted-dark">
            Não achou a sua? Fala com a gente no{" "}
            <a
              href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre o Outside Experience.")}`}
              target="_blank"
              rel="noreferrer"
              className="link font-semibold text-ink"
            >
              WhatsApp
            </a>
            .
          </p>
        </Reveal>
        <div className="border-t border-paper-line lg:col-span-8">
          {PERGUNTAS.map((item, i) => (
            <Item key={item.q} item={item} i={i} aberto={aberto === i} alternar={() => setAberto(aberto === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
