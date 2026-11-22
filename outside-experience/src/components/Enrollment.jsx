import { useState } from "react";
import { CalendarDays, MapPin, Tag, Check, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import EnrollForm from "@/components/EnrollForm";
import Ticket from "@/components/Ticket";
import { EVENT } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const INFO = [
  { icon: CalendarDays, label: "Data", value: EVENT.dateLabel, accent: true },
  { icon: MapPin, label: "Local", value: EVENT.venue, sub: `${EVENT.address} · ${EVENT.city}` },
  { icon: Tag, label: "Investimento", value: EVENT.price ?? "A divulgar" },
  ...(EVENT.capacity ? [{ icon: Users, label: "Vagas", value: `${EVENT.capacity} vagas`, sub: "Quem está na lista recebe primeiro" }] : []),
];

const PERKS = ["Acesso antecipado à abertura das inscrições", "Grupo de preparação no WhatsApp", "Convite pronto para chamar amigos"];

export default function Enrollment() {
  const [ticket, setTicket] = useState(null);

  return (
    <section id="inscricao" className="relative py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10 overflow-hidden" data-testid="enrollment-section">
      <span className="pointer-events-none select-none absolute -right-6 -top-6 text-[28vw] leading-none font-black uppercase text-white/[0.025]" style={OUTFIT} aria-hidden="true">
        FORA
      </span>

      <div className="relative grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
              <span className="w-6 h-px bg-orange-500" /> Inscrição
            </span>
            <h2 className="mt-6 text-5xl sm:text-6xl xl:text-7xl font-black uppercase tracking-[-0.03em] leading-[0.9]" style={OUTFIT} data-testid="enrollment-title">
              Seu lugar
              <br />é <span className="text-orange-500">fora</span>
            </h2>
            <p className="mt-6 max-w-md text-neutral-400 text-sm sm:text-base leading-relaxed" data-testid="enrollment-subtitle">
              Entre na lista de espera da próxima edição e seja o primeiro a saber
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 border-t border-white/10">
            {INFO.map((it) => (
              <div key={it.label} className="flex items-start gap-4 py-4 border-b border-white/10" data-testid={`enrollment-info-${it.label.toLowerCase()}`}>
                <it.icon size={16} className="text-orange-500 mt-1 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">{it.label}</span>
                  <span className={`block mt-0.5 text-sm sm:text-base font-bold uppercase ${it.accent ? "text-orange-500" : "text-white"}`} style={OUTFIT}>
                    {it.value}
                  </span>
                  {it.sub && <span className="block text-xs text-neutral-500 mt-0.5">{it.sub}</span>}
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-8">
            <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500 mb-3">Ao entrar na lista</span>
            <ul className="space-y-2" data-testid="enrollment-perks">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-neutral-300">
                  <Check size={14} strokeWidth={3} className="text-orange-500 shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <Reveal delay={0.15}>
            <EnrollForm onSuccess={setTicket} />
          </Reveal>
        </div>
      </div>

      {ticket && <Ticket data={ticket} onClose={() => setTicket(null)} />}
    </section>
  );
}
