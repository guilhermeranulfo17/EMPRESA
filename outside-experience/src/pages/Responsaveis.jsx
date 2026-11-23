import { MessageCircle } from "lucide-react";
import PaginaSimples from "@/components/PaginaSimples";
import { EVENT } from "@/data/event";

const BLOCOS = [
  {
    t: "O que é o Outside Experience",
    p: "Um encontro cristão presencial de um dia inteiro, com adoração, palavra e capacitação, que termina com os participantes saindo em equipe para falar de Jesus na rua, de maneira simples, humana e intencional.",
  },
  {
    t: "Como é o dia",
    p: "Ativação: adoração e palavra. Capacitação: ferramentas simples para falar de Jesus. Envio: oração, consagração e saída em equipes para a rua.",
  },
  {
    t: "A saída à rua",
    p: "Ninguém sai sozinho. Os participantes saem em equipes, depois de um tempo de oração juntos, e são orientados antes de sair.",
  },
  {
    t: "Autorização",
    p: "Na inscrição, quem tem menos de 18 anos só consegue concluir confirmando que o responsável legal está ciente e autoriza a participação, incluindo a saída às ruas em equipe.",
  },
  {
    t: "Quando e onde",
    p: `${EVENT.dateLabel}, em ${EVENT.city}. O local e o dia exato serão anunciados em breve.`,
  },
];

export default function Responsaveis() {
  return (
    <PaginaSimples titulo="Para pais e responsáveis">
      <section className="paper-grain bg-paper py-14 text-ink sm:py-20">
        <div className="wrap max-w-3xl">
          <p className="label text-brand-deep">Pais e responsáveis</p>
          <h1 className="display mt-3 t-h2-p">Seu filho quer ir. Veja como funciona.</h1>
          <div className="mt-10 divide-y divide-paper-line border-y border-paper-line">
            {BLOCOS.map((b) => (
              <div key={b.t} className="py-6">
                <h2 className="text-xl font-bold">{b.t}</h2>
                <p className="mt-2 text-lg text-ink/80">{b.p}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-ink p-6 text-white">
            <p className="display text-3xl">Ficou alguma dúvida?</p>
            <p className="mt-2 text-white/75">Fale direto com a equipe antes de autorizar.</p>
            <a
              href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Sou responsável por um participante menor de idade e tenho uma dúvida sobre o Outside Experience.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-brand mt-5"
            >
              <MessageCircle size={18} /> Falar com a equipe
            </a>
          </div>
        </div>
      </section>
    </PaginaSimples>
  );
}
