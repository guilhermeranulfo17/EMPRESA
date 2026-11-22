import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X, Download, MessageCircle, Link2, Share2, Check, MapPin } from "lucide-react";
import { EVENT, LOGO, ENROLL_LINK } from "@/data/event";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const shareText = (name) =>
  `${name.split(" ")[0]} aqui! Acabei de garantir meu lugar na lista do OUTSIDE EXPERIENCE — a fé não foi feita para ficar dentro. Vem comigo: ${ENROLL_LINK}`;

function Barcode({ seed }) {
  const bars = Array.from({ length: 42 }, (_, i) => ((seed.charCodeAt(i % seed.length) * (i + 3)) % 4) + 1);
  return (
    <div className="flex items-end gap-[2px] h-10" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className="bg-white h-full" style={{ width: `${w}px`, opacity: w > 2 ? 1 : 0.7 }} />
      ))}
    </div>
  );
}

export default function Ticket({ data, onClose }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const code = `OE-${data.ticket_code}`;

  useEffect(() => {
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      window.__lenis?.start();
      document.body.style.overflow = "";
    };
  }, []);

  const download = async () => {
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#050505", useCORS: true });
      const a = document.createElement("a");
      a.download = `outside-experience-${data.ticket_code}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareText(data.name));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Outside Experience", text: shareText(data.name), url: ENROLL_LINK });
      } catch (_) {}
    } else copyLink();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-sm overflow-y-auto"
      data-lenis-prevent
      data-testid="ticket-overlay"
    >
      <div className="min-h-full flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-orange-500 font-semibold">Você está na lista</span>
            <button onClick={onClose} data-testid="ticket-close-btn" aria-label="Fechar" className="w-9 h-9 flex items-center justify-center border border-white/15 hover:border-white text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div ref={cardRef} className="bg-[#050505] border border-white/15 ticket-enter" data-testid="ticket-card">
            <div className="bg-orange-500 text-black px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO} alt="Outside" className="h-5 w-auto brightness-0" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Experience</span>
              </div>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase">Pré-inscrição</span>
            </div>
            <div className="bg-orange-600 text-black/80 px-6 py-2 text-[9px] font-bold tracking-[0.3em] uppercase">
              Lista de espera · Próxima edição
            </div>

            <div className="px-6 py-6 space-y-5">
              <div>
                <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Participante</span>
                <span className="block mt-1 text-2xl font-black uppercase tracking-tight leading-none" style={OUTFIT} data-testid="ticket-name">
                  {data.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Data</span>
                  <span className="block mt-1 text-sm font-bold uppercase text-orange-500" data-testid="ticket-date">{EVENT.dateLabel}</span>
                </div>
                <div>
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Cidade</span>
                  <span className="block mt-1 text-sm font-bold uppercase">{EVENT.city}</span>
                </div>
                <div>
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Idade</span>
                  <span className="block mt-1 text-sm font-bold uppercase">{data.age} anos{data.is_minor ? " · autorizado" : ""}</span>
                </div>
                <div>
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Igreja</span>
                  <span className="block mt-1 text-sm font-bold uppercase truncate">{data.church}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-neutral-400 border-t border-white/10 pt-4">
                <MapPin size={14} className="text-orange-500 mt-0.5 shrink-0" />
                <span>
                  {EVENT.venue}
                  <br />
                  {EVENT.address} — {EVENT.city}
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed border-l-2 border-orange-500 pl-3">
                Assim que as inscrições da próxima edição abrirem, você recebe tudo primeiro no WhatsApp — com prioridade.
              </p>

              <div className="border-t border-dashed border-white/20 pt-5 flex items-end justify-between gap-4">
                <Barcode seed={data.ticket_code} />
                <div className="text-right">
                  <span className="block text-[9px] tracking-[0.3em] uppercase text-neutral-500">Código</span>
                  <span className="block font-mono text-sm text-white" data-testid="ticket-code">{code}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-[9px] tracking-[0.25em] uppercase text-neutral-600">
              <span>A fé não foi feita para ficar dentro</span>
              <span className="text-orange-500">@{EVENT.instagram}</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={download}
              disabled={saving}
              data-testid="ticket-download-btn"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-4 transition-colors"
            >
              <Download size={14} /> {saving ? "Gerando..." : "Salvar imagem"}
            </button>
            <button
              onClick={nativeShare}
              data-testid="ticket-share-btn"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-4 transition-colors"
            >
              <Share2 size={14} /> Compartilhar
            </button>
          </div>

          <div className="mt-3 bg-orange-500 p-5 sm:p-6 text-black" data-testid="ticket-invite-block">
            <p className="text-lg font-black uppercase tracking-tight leading-none" style={OUTFIT}>
              Ninguém sai sozinho — chame um amigo
            </p>
            <p className="mt-2 text-xs text-black/70">Envie o convite e vivam essa experiência juntos</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText(data.name))}`}
                target="_blank"
                rel="noreferrer"
                data-testid="ticket-share-whatsapp"
                className="inline-flex items-center justify-center gap-2 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-3 hover:bg-neutral-900 transition-colors"
              >
                <MessageCircle size={14} /> Convidar no WhatsApp
              </a>
              <button
                onClick={copyLink}
                data-testid="ticket-copy-link"
                aria-label="Copiar convite"
                className="inline-flex items-center justify-center bg-black/10 hover:bg-black/20 px-4 transition-colors"
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
              </button>
            </div>
          </div>

          <button onClick={onClose} data-testid="ticket-done-btn" className="mt-6 w-full text-[10px] tracking-[0.3em] uppercase text-neutral-500 hover:text-white transition-colors">
            Voltar para o site
          </button>
        </div>
      </div>
    </div>
  );
}
