import { MessageCircle } from "lucide-react";
import { EVENT } from "@/data/event";

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre o Outside Experience.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a equipe no WhatsApp"
      className="no-print fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
      data-testid="whatsapp-float"
    >
      <MessageCircle size={22} />
    </a>
  );
}
