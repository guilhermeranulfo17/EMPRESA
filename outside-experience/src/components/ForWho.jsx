import Reveal from "@/components/Reveal";

const OUTFIT = { fontFamily: "Outfit, sans-serif" };

const ITEMS = [
  "ama Jesus, mas trava na hora de falar dEle",
  "quer sair da zona de conforto",
  "deseja crescer nos dons espirituais",
  "quer uma fé mais prática",
  "sente chamado para missão",
  "sabe que existe mais para viver",
];

export default function ForWho() {
  return (
    <section className="py-24 md:py-28 px-5 md:px-10 lg:px-20 bg-[#050505] border-t border-white/10" data-testid="for-who-section">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-orange-500 font-semibold">
              <span className="w-6 h-px bg-orange-500" /> Para quem é
            </span>
            <h2 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.92]" style={OUTFIT} data-testid="for-who-title">
              Talvez esse dia
              <br />
              seja <span className="text-orange-500">para você</span>
            </h2>
            <p className="mt-6 text-neutral-500 text-sm">Se você…</p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 0.04} y={16} className="bg-[#050505]">
              <div className="h-full p-5 md:p-6 flex gap-4 group hover:bg-[#0c0c0c] transition-colors" data-testid={`for-who-item-${i + 1}`}>
                <span className="font-mono text-[10px] text-orange-500 pt-1 shrink-0">0{i + 1}</span>
                <p className="text-sm sm:text-base text-neutral-300 group-hover:text-white transition-colors leading-relaxed">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-14 md:mt-20">
        <p className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase tracking-[-0.02em] leading-[0.95]" style={OUTFIT} data-testid="for-who-closing">
          Você não precisa estar pronto
          <br />
          <span className="text-orange-500">Precisa estar disponível</span>
        </p>
      </Reveal>
    </section>
  );
}
