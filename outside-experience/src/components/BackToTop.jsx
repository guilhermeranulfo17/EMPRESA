import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { scrollToTop } from "@/lib/scroll";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      data-testid="back-to-top-btn"
      aria-label="Voltar ao topo"
      className={`fixed bottom-24 lg:bottom-6 right-[4.75rem] lg:right-20 z-40 w-11 h-11 bg-[#0a0a0a]/90 backdrop-blur border border-white/10 hover:border-orange-500 flex items-center justify-center transition-[opacity,transform,border-color] duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronUp size={16} className="text-neutral-400" />
    </button>
  );
}
