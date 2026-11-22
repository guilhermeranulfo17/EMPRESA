import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { EVENT } from "@/data/event";

export default function WhatsAppFloat() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-5 lg:right-6 z-40" data-testid="whatsapp-float">
      {expanded && (
        <div className="absolute bottom-14 right-0 mb-2 bg-[#0a0a0a] border border-white/10 p-4 min-w-[230px] animate-fade-up" data-testid="whatsapp-tooltip">
          <p className="text-xs text-neutral-400 mb-3">Dúvidas sobre o Outside Experience?</p>
          <a
            href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre o Outside Experience.")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-link"
            className="block text-center bg-orange-500 text-black text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-3 hover:bg-orange-400 transition-colors"
          >
            Falar no WhatsApp
          </a>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        data-testid="whatsapp-toggle-btn"
        aria-label="Contato pelo WhatsApp"
        className={`w-11 h-11 flex items-center justify-center border transition-colors duration-300 ${
          expanded ? "bg-white text-black border-white" : "bg-[#0a0a0a]/90 backdrop-blur text-neutral-400 border-white/10 hover:border-orange-500 hover:text-white"
        }`}
      >
        {expanded ? <X size={16} /> : <MessageCircle size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );
}
