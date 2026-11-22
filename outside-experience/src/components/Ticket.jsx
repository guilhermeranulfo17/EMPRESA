import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { X, Download, Share2, Check, Link2, Users } from "lucide-react";
import { EVENT, LOGO, inviteLink } from "@/data/event";

const textoConvite = (nome, code) =>
  `${nome.split(" ")[0]} aqui! Entrei na lista do OUTSIDE EXPERIENCE (${EVENT.dateLabel}, ${EVENT.cityShort}): um dia de adoração, palavra e evangelismo na rua. Vem comigo: ${inviteLink(code)}`;

export default function Ticket({ data, onClose }) {
  const cardRef = useRef(null);
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const code = `OE-${data.ticket_code}`;
  const convite = textoConvite(data.name, data.ticket_code);

  useEffect(() => {
    QRCode.toDataURL(code, { margin: 1, width: 240, color: { dark: "#0C0B0A", light: "#EEE9DF" } }).then(setQr);
  }, [code]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const salvar = async () => {
    setSalvando(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#EEE9DF", useCORS: true });
      const a = document.createElement("a");
      a.download = `outside-experience-${data.ticket_code}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setSalvando(false);
    }
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(convite);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Outside Experience", text: convite });
      } catch (_) {
        /* a pessoa cancelou */
      }
    } else copiar();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Você está na lista" data-testid="ticket-overlay">
      <div className="flex min-h-full items-start justify-center px-4 py-8 sm:items-center">
        <div className="animate-fade-up w-full max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-serif text-2xl italic">Você está na lista.</p>
            <button onClick={onClose} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center text-white/80 hover:text-white" data-testid="ticket-close-btn">
              <X size={22} />
            </button>
          </div>

          {/* passo mais importante primeiro: entrar no grupo */}
          <a
            href={EVENT.whatsappGroup}
            target="_blank"
            rel="noreferrer"
            className="btn-brand w-full"
            data-testid="ticket-group-btn"
          >
            <Users size={18} /> Entrar no grupo de preparação
          </a>

          <div ref={cardRef} className="ticket-enter mt-4 bg-paper text-ink" data-testid="ticket-card">
            <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
              <img src={LOGO} alt="Outside" className="h-5 w-auto" />
              <span className="font-serif text-lg italic">Experience · {EVENT.edition}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-5">
              <div className="min-w-0">
                <p className="text-sm text-muted-dark">Participante</p>
                <p className="display mt-1 break-words text-3xl" data-testid="ticket-name">
                  {data.name}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-dark">Quando</dt>
                    <dd className="font-semibold" data-testid="ticket-date">{EVENT.dateLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-dark">Onde</dt>
                    <dd className="font-semibold">{EVENT.cityShort}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-dark">Igreja</dt>
                    <dd className="truncate font-semibold">{data.church}</dd>
                  </div>
                </dl>
              </div>
              <div className="text-center">
                {qr ? <img src={qr} alt={`QR code ${code}`} className="h-28 w-28" /> : <div className="h-28 w-28 bg-paper-2" />}
                <p className="mt-1 font-mono text-xs" data-testid="ticket-code">{code}</p>
              </div>
            </div>
            <p className="border-t border-dashed border-paper-line px-5 py-3 text-sm text-muted-dark">
              Pré-inscrição. Mostre este QR code na entrada. Quando as inscrições abrirem, você recebe tudo primeiro no WhatsApp.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={salvar} disabled={salvando} className="btn-ghost text-white hover:bg-white/10" data-testid="ticket-download-btn">
              <Download size={18} /> {salvando ? "Gerando..." : "Salvar"}
            </button>
            <button onClick={compartilhar} className="btn-ghost text-white hover:bg-white/10" data-testid="ticket-share-btn">
              <Share2 size={18} /> Compartilhar
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6" data-testid="ticket-invite-block">
            <p className="display text-3xl">Ninguém sai sozinho</p>
            <p className="mt-2 text-white/75">Chame um amigo com o seu link. A gente vê quem você trouxe.</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(convite)}`}
                target="_blank"
                rel="noreferrer"
                className="btn bg-white text-ink hover:bg-paper"
                data-testid="ticket-share-whatsapp"
              >
                Convidar no WhatsApp
              </a>
              <button onClick={copiar} aria-label="Copiar convite" className="btn border border-white/25 px-4 hover:bg-white/10" data-testid="ticket-copy-link">
                {copiado ? <Check size={18} /> : <Link2 size={18} />}
              </button>
            </div>
          </div>

          <button onClick={onClose} className="mt-6 min-h-[44px] w-full text-white/60 hover:text-white" data-testid="ticket-done-btn">
            Voltar para o site
          </button>
        </div>
      </div>
    </div>
  );
}
