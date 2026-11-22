import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal, { MaskedLines } from "@/components/Reveal";
import { IMAGES } from "@/data/event";
import { scrollToId } from "@/lib/scroll";

const LINES = ["VOCÊ NÃO FOI", "CHAMADO PARA", "ASSISTIR", "DE LONGE"];

export default function Statement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden bg-[#050505]" data-testid="statement-section">
      <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0 will-change-transform">
        <img src={IMAGES.hands} alt="Mãos unidas em oração" className="w-full h-full object-cover grayscale opacity-40" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]" />
      </motion.div>

      <div className="relative z-10 px-5 md:px-10 lg:px-20">
        <h2
          className="font-black uppercase tracking-[-0.03em] leading-[0.9] text-[10.5vw] sm:text-[9vw] lg:text-[min(4.6vw,9.5vh)] max-w-6xl"
          style={{ fontFamily: "Outfit, sans-serif" }}
          data-testid="statement-title"
        >
          <MaskedLines lines={LINES} render={(l, i) => (i === 3 ? <span className="text-orange-500">{l}</span> : l)} />
        </h2>
        <Reveal delay={0.3} className="mt-8 sm:mt-10">
          <button
            onClick={() => scrollToId("#inscricao")}
            data-testid="statement-cta-btn"
            className="group inline-flex items-center gap-3 border-b-2 border-orange-500 pb-2 text-sm font-bold tracking-[0.25em] uppercase text-white hover:text-orange-400 transition-colors"
          >
            Eu quero ir
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
