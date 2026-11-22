const ITEMS = [
  "A fé não foi feita para ficar dentro",
  "De dentro para fora",
  "Romanos 10:14",
  "Alguém precisa ir",
  "Outside Experience",
  "Adoração · Palavra · Ativação · Missão",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative py-8 sm:py-10 overflow-hidden bg-[#050505]" data-testid="marquee-section" aria-hidden="true">
      <div className="marquee-band -rotate-[1.5deg] scale-[1.04] border-y border-orange-500/40 bg-[#050505] py-4 sm:py-5">
        <div className="marquee-track flex items-center whitespace-nowrap will-change-transform">
          {[...row, ...row].map((item, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`px-6 sm:px-8 text-sm sm:text-lg md:text-xl font-black uppercase tracking-[0.12em] ${
                  i % ITEMS.length === 0 ? "text-orange-500" : "text-white/70"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-orange-500 rotate-45" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
