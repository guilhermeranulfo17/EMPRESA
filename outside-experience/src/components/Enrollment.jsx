import { useState } from "react";
import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import EnrollForm from "@/components/EnrollForm";
import Ticket from "@/components/Ticket";
import { EVENT } from "@/data/event";
import { useVagas } from "@/lib/vagas";

const VANTAGENS = ["Aviso em primeira mão quando as inscrições abrirem", "Grupo de preparação no WhatsApp", "Link para convidar seus amigos"];

function Vagas() {
  const { total, inscritos, restantes } = useVagas();
  if (!total) return null;
  const pct = inscritos === null ? 0 : Math.min(100, (inscritos / total) * 100);
  return (
    <div className="mt-8" data-testid="enrollment-vagas">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-4xl text-white">{restantes === null ? total : restantes}</span>
        <span className="text-white/60">{restantes === null ? "vagas nesta edição" : `de ${total} vagas restantes`}</span>
      </div>
      <div className="mt-3 h-2 w-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={inscritos ?? 0} aria-label="Vagas preenchidas">
        <div className="h-full bg-brand transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Enrollment() {
  const [ticket, setTicket] = useState(null);
  const info = [
    ["Quando", EVENT.dateLabel],
    ["Onde", EVENT.venue ? `${EVENT.venue}, ${EVENT.city}` : `${EVENT.city} · ${EVENT.venueLabel.toLowerCase()}`],
    ["Investimento", EVENT.price ?? "A divulgar"],
  ];

  return (
    <section id="inscricao" className="bg-ink-2 secao" data-testid="enrollment-section">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 className="display t-h2" data-testid="enrollment-title">
            Garanta seu lugar
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/80" data-testid="enrollment-subtitle">
            As inscrições da {EVENT.edition} ainda não abriram. Entre na lista e seja o primeiro a saber.
          </p>

          <Vagas />

          <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-4" data-testid={`enrollment-info-${k.toLowerCase()}`}>
                <dt className="text-white/60">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 space-y-3" data-testid="enrollment-perks">
            {VANTAGENS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/85">
                <Check size={20} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" /> {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
          <EnrollForm onSuccess={setTicket} />
        </Reveal>
      </div>

      {ticket && <Ticket data={ticket} onClose={() => setTicket(null)} />}
    </section>
  );
}
