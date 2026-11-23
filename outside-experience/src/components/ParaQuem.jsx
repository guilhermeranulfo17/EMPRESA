import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";

const SE = [
  "ama Jesus, mas trava na hora de falar dEle",
  "quer sair da zona de conforto",
  "quer crescer nos dons espirituais",
  "quer uma fé mais prática",
  "sente um chamado para missão",
  "sabe que existe mais para viver",
];

export default function ParaQuem() {
  return (
    <section id="pra-quem" className="paper-grain bg-paper secao text-ink" data-testid="for-who-section">
      <div className="wrap">
        <Reveal>
          <h2 className="display max-w-3xl t-h2" data-testid="for-who-title">
            Esse dia é para você se…
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {SE.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 0.04} className="flex items-start gap-4 border-b border-paper-line py-5 text-xl">
              <Check size={22} strokeWidth={2.5} className="mt-1 shrink-0 text-brand-deep" aria-hidden="true" />
              {s}
            </Reveal>
          ))}
        </ul>
        <Reveal delay={0.1} className="mt-14">
          <p className="font-serif t-lead leading-tight" data-testid="for-who-closing">
            Você não precisa estar pronto. <em className="text-brand-deep">Precisa estar disponível.</em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
