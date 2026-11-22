import { useState, useEffect } from "react";
import { LOGO } from "@/data/event";

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 1700);
    const t3 = setTimeout(() => onComplete(), 2250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      data-testid="splash-screen"
      className={`fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 2 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase >= 1 ? "opacity-100" : "opacity-0"}`}>
        <img
          src={LOGO}
          alt="Outside"
          className={`w-56 sm:w-72 md:w-80 h-auto transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase >= 1 ? "translate-y-0" : "translate-y-full"}`}
        />
      </div>
      <div className={`mt-6 transition-all duration-500 delay-300 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-orange-500 font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
          Experience
        </span>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-px bg-white/10 overflow-hidden">
        <div className={`h-full bg-orange-500 transition-all duration-[1700ms] ease-linear ${phase >= 0 ? "w-full" : "w-0"}`} />
      </div>
    </div>
  );
}
