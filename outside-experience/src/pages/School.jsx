import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ChevronDown, Instagram, Menu, MessageCircle, X } from "lucide-react";
import Reveal from "@/components/Reveal";
import Candidatura from "@/school/Candidatura";
import { LOGO, PHOTOS } from "@/data/event";
import { AULAS, DESAFIO_EXEMPLO, DUVIDAS, ENCONTRO_EXEMPLO, PRINCIPIOS, PROCESSO, PROFESSORES, SCHOOL, SEMANAS } from "@/data/school";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  { label: "As 8 aulas", href: "#aulas" },
  { label: "O encontro", href: "#encontro" },
  { label: "Professores", href: "#professores" },
  { label: "Dúvidas", href: "#duvidas" },
];

const dois = (n) => String(n).padStart(2, "0");

function Marca({ claro = false }) {
  return (
    <span className="flex items-center gap-3">
      <img src={LOGO} alt="Outside" className={`h-[18px] w-auto ${claro ? "" : "invert"}`} />
      <span className={`h-4 w-px ${claro ? "bg-white/30" : "bg-ink/25"}`} aria-hidden />
      <span className="etiqueta">School</span>
    </span>
  );
}

function Topo() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const f = () => setRolou(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const ir = (href) => {
    setAberto(false);
    scrollToId(href);
  };

  return (
    <header className={`no-print fixed inset-x-0 top-0 z-50 bg-[#F3EFE7]/95 backdrop-blur transition-shadow ${rolou || aberto ? "shadow-[0_1px_0_rgba(18,17,16,0.12)]" : ""}`}>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <button onClick={() => ir("#topo")} aria-label="Outside School, voltar ao início">
          <Marca />
        </button>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Seções">
          {NAV.map((l) => (
            <button key={l.href} onClick={() => ir(l.href)} className="text-[15px] text-ink/65 transition-colors hover:text-ink">
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={() => ir("#candidatura")} className="btn-tinta hidden min-h-[42px] px-5 text-sm sm:inline-flex" data-testid="school-header-cta">
            Candidatar-se
          </button>
          <button
            onClick={() => setAberto((v) => !v)}
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={aberto}
          >
            {aberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {aberto && (
        <nav className="wrap pb-6 lg:hidden" aria-label="Seções">
          {[...NAV, { label: "Candidatura", href: "#candidatura" }].map((l) => (
            <button key={l.href} onClick={() => ir(l.href)} className="block w-full border-t border-ink/10 py-4 text-left text-lg">
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Foto({ src, alt, legenda, className = "" }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden bg-ink/10">
        <img src={src} alt={alt} className="aspect-[3/4] w-full object-cover" />
      </div>
      <figcaption className="mt-2 text-[13px] leading-snug text-ink/55">{legenda}</figcaption>
    </figure>
  );
}

function Abertura() {
  const fatos = [
    ["Duração", `${SCHOOL.semanas} semanas, 2 encontros por semana`],
    ["Encontros", `${SCHOOL.encontros} ao vivo, de ${SCHOOL.minutos} minutos`],
    ["Material", "Apostila, áudio e vídeo de cada aula"],
    ["Investimento", `${SCHOOL.preco}, pago após a aprovação`],
  ];
  return (
    <section id="topo" className="pt-16">
      <div className="wrap grid gap-12 pb-14 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-16">
        <div className="lg:col-span-7 xl:col-span-7">
          <p className="etiqueta flex flex-wrap items-center gap-x-3 gap-y-1 text-ink/60 animate-fade-up">
            <span>Formação on-line e ao vivo</span>
            <span className="hidden text-brand sm:inline" aria-hidden>
              ■
            </span>
            <span>
              {SCHOOL.turma}: {SCHOOL.turmaInfo.toLowerCase()}
            </span>
          </p>
          <h1 className="cond t-s1 mt-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
            Você foi chamado
            <br />
            para <span className="text-brand">ir.</span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-ink/75 sm:text-[19px] animate-fade-up" style={{ animationDelay: "120ms" }}>
            Oito encontros ao vivo para quem ama Jesus e quer aprender a falar dele com clareza, cooperar com o Espírito com responsabilidade e ir para a rua acompanhado.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <button onClick={() => scrollToId("#candidatura")} className="btn-tinta" data-testid="school-hero-cta">
              Fazer minha candidatura <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollToId("#aulas")} className="text-[15px] font-semibold underline decoration-ink/30 decoration-2 underline-offset-[6px] hover:decoration-brand">
              Ver as 8 aulas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 self-end sm:gap-5 lg:col-span-5 xl:pl-6">
          <Foto src={PHOTOS.pregacao4.src} alt={PHOTOS.pregacao4.alt} legenda="Ensino antes da saída" className="animate-fade-up" />
          <Foto src={PHOTOS.oracaoBanco.src} alt={PHOTOS.oracaoBanco.alt} legenda="Oração na praça, Uberlândia" className="mt-12 animate-fade-up sm:mt-16" />
        </div>
      </div>

      <div className="border-y border-ink/15">
        <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
          {fatos.map(([t, v], i) => (
            <div key={t} className={`py-5 pr-4 ${i % 2 ? "pl-5 border-l border-ink/15" : ""} ${i > 1 ? "border-t border-ink/15 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-5" : ""}`}>
              <dt className="etiqueta text-ink/45">{t}</dt>
              <dd className="mt-1.5 text-[15px] font-medium leading-snug sm:text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function AEscola() {
  return (
    <section className="secao">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <h2 className="cond t-s2">Para quem ama Jesus e trava na hora de falar dele.</h2>
        </Reveal>
        <Reveal delay={0.06} className="space-y-5 text-lg leading-relaxed text-ink/75 lg:col-span-5 lg:col-start-8">
          <p>
            A School é a formação da Outside para cristãos de qualquer igreja que querem viver a missão no dia a dia. A sequência vai de dentro para fora: começa na vida secreta com Jesus, passa pela mensagem e pelos dons, e termina na rua e no discipulado.
          </p>
          <p>
            Cada encontro tem Palavra, prática em duplas e trios, feedback e um desafio para a semana. Você treina num ambiente seguro antes de falar com quem você não conhece.
          </p>
          <p className="etiqueta pt-2 text-brand">{SCHOOL.lema}</p>
        </Reveal>
      </div>
    </section>
  );
}

function LinhaAula({ a, aberta, alternar }) {
  return (
    <li className="border-t border-ink/15">
      <button onClick={alternar} className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-5 text-left sm:grid-cols-[3.5rem_1fr_auto]" aria-expanded={aberta} data-testid={`aula-${a.n}`}>
        <span className="font-mono text-sm font-medium text-brand">{dois(a.n)}</span>
        <span>
          <span className="cond t-s3 block transition-colors group-hover:text-brand-deep">{a.titulo}</span>
          <span className="mt-1.5 block text-[15px] text-ink/60">{a.frase}</span>
        </span>
        <ChevronDown size={20} className={`self-center text-ink/40 transition-transform duration-300 ${aberta ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${aberta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid gap-8 pb-8 sm:pl-[4.5rem] md:grid-cols-[1.1fr_1fr]">
            <blockquote className="border-l-2 border-brand pl-5 text-lg leading-relaxed text-ink/85">
              <span className="etiqueta mb-2 block text-ink/45">Ideia central</span>
              {a.ideia}
            </blockquote>
            <div>
              <span className="etiqueta block text-ink/45">Na aula</span>
              <ul className="mt-2 divide-y divide-ink/10 text-[15px] text-ink/80">
                {a.pontos.map((p) => (
                  <li key={p} className="py-2">
                    {p}
                  </li>
                ))}
              </ul>
              {a.textos && <p className="mt-3 text-[13px] text-ink/50">{a.textos}</p>}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function Aulas() {
  const [aberta, setAberta] = useState(1);
  return (
    <section id="aulas" className="secao border-t border-ink/15">
      <div className="wrap">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="cond t-s2">As 8 aulas</h2>
          <p className="max-w-md text-ink/65">Duas por semana, nesta ordem. Toque numa aula para ver o que ela trabalha.</p>
        </Reveal>

        <div className="mt-12 space-y-12 lg:space-y-14">
          {SEMANAS.map((s) => (
            <div key={s.n} className="grid gap-3 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-3 lg:pt-5">
                <p className="etiqueta text-ink/45">Semana {s.n}</p>
                <p className="mt-1 text-lg font-semibold">{s.tema}</p>
              </div>
              <ol className="border-b border-ink/15 lg:col-span-9">
                {AULAS.filter((a) => a.semana === s.n).map((a) => (
                  <LinhaAula key={a.n} a={a} aberta={aberta === a.n} alternar={() => setAberta(aberta === a.n ? 0 : a.n)} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Encontro() {
  const total = ENCONTRO_EXEMPLO.blocos.reduce((s, b) => s + b.min, 0);
  return (
    <section id="encontro" className="secao bg-ink text-[#F3EFE7]">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="cond t-s2 lg:col-span-7">Como são os 90 minutos</h2>
          <p className="text-white/65 lg:col-span-5">
            Pouca aula expositiva e muita prática supervisionada. Este é o roteiro real de um dos encontros, tirado da apostila.
          </p>
        </Reveal>

        <Reveal delay={0.05} className="mt-12">
          <p className="etiqueta text-white/45">{ENCONTRO_EXEMPLO.aula}</p>
          {/* barra proporcional ao tempo de cada bloco */}
          <div className="mt-4 hidden h-2 gap-1 md:flex" aria-hidden>
            {ENCONTRO_EXEMPLO.blocos.map((b, i) => (
              <div key={b.nome} style={{ flexGrow: b.min }} className={i === 3 ? "bg-brand" : "bg-white/25"} />
            ))}
          </div>
          <ol className="mt-0 grid md:mt-0 md:flex md:gap-1">
            {ENCONTRO_EXEMPLO.blocos.map((b) => (
              <li key={b.nome} style={{ flexGrow: b.min, flexBasis: 0 }} className="border-t border-white/15 py-4 md:border-t-0 md:pr-4">
                <p className="font-mono text-sm text-brand">{b.min} min</p>
                <p className="mt-1 font-semibold">{b.nome}</p>
                <p className="mt-1 text-[14px] leading-snug text-white/60">{b.d}</p>
              </li>
            ))}
          </ol>
          <p className="sr-only">Total: {total} minutos.</p>
        </Reveal>

        <div className="mt-16 grid gap-12 border-t border-white/15 pt-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h3 className="cond text-[clamp(1.8rem,3.2vw,2.6rem)]">Depois do encontro, cinco dias de prática</h3>
            <p className="mt-4 text-white/65">
              Cada aula termina com um desafio curto para viver onde você está, com um texto bíblico por dia. A aula seguinte começa pelo que aconteceu.
            </p>
            <p className="mt-6 text-white/65">Você também recebe o caderno de campo da aula, para escrever e guardar, e os resumos em áudio e em vídeo.</p>
          </Reveal>
          <Reveal delay={0.06} className="lg:col-span-6 lg:col-start-7">
            <p className="etiqueta text-white/45">{DESAFIO_EXEMPLO.aula}</p>
            <ol className="mt-3">
              {DESAFIO_EXEMPLO.dias.map(([t, ref], i) => (
                <li key={t} className="flex items-baseline justify-between gap-4 border-t border-white/15 py-3.5">
                  <span>
                    <span className="mr-4 font-mono text-sm text-white/40">Dia {i + 1}</span>
                    {t}
                  </span>
                  <span className="shrink-0 text-[13px] text-white/45">{ref}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Combinados() {
  return (
    <section className="secao">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 className="cond t-s2">Os combinados da escola</h2>
          <p className="mt-5 text-ink/65">Valem para todas as aulas e para a rua.</p>
        </Reveal>
        <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {PRINCIPIOS.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 0.03} className="flex gap-4 border-t border-ink/15 py-5 text-lg">
              <span className="pt-1 font-mono text-sm text-brand">{dois(i + 1)}</span>
              {p}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Professores() {
  const comFoto = PROFESSORES.filter((p) => p.photo);
  const outros = PROFESSORES.filter((p) => !p.photo);
  const lista = (xs) =>
    xs.map((p, i) => (
      <span key={p.name}>
        {i > 0 && (i === xs.length - 1 ? " e " : ", ")}
        <strong className="font-semibold text-ink">{p.name}</strong> ({p.org})
      </span>
    ));
  return (
    <section id="professores" className="secao border-t border-ink/15">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="cond t-s2 lg:col-span-6">Quem ensina</h2>
          <p className="text-ink/65 lg:col-span-5 lg:col-start-8">Evangelistas e pastores que estão na rua com a Outside e acompanham a turma do começo ao fim.</p>
        </Reveal>
        <ul className="mt-12 grid gap-x-5 gap-y-8 sm:grid-cols-3">
          {comFoto.map((p, i) => (
            <Reveal as="li" key={p.name} delay={i * 0.05}>
              <div className="overflow-hidden bg-ink/10">
                <img src={p.photo} alt={p.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              </div>
              <p className="mt-4 text-lg font-semibold">{p.name}</p>
              <p className="text-[15px] text-ink/55">{p.org}</p>
            </Reveal>
          ))}
        </ul>
        {outros.length > 0 && (
          <Reveal className="mt-10 max-w-3xl border-t border-ink/15 pt-6 text-lg leading-relaxed text-ink/70">
            Também ensinam na School: {lista(outros)}.
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Inscricao() {
  return (
    <section id="candidatura" className="secao border-t border-ink/15 bg-[#EAE4D8]">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="cond t-s2">Candidatura</h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/75">
              As vagas passam por uma seleção com recomendação da sua liderança, porque a turma pratica junto e lida com pessoas de verdade.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-10 border-t border-ink pt-6">
            <p className="etiqueta text-ink/50">Investimento</p>
            <p className="cond mt-2 text-[clamp(3rem,6vw,4.5rem)]" data-testid="school-preco">
              {SCHOOL.preco}
            </p>
            <p className="mt-2 text-ink/70">Valor único pela formação completa. Você só paga depois de aprovado.</p>
          </Reveal>

          <Reveal delay={0.08} className="mt-10">
            <p className="etiqueta text-ink/50">Como funciona a seleção</p>
            <ol className="mt-3">
              {PROCESSO.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2rem_1fr] border-t border-ink/15 py-4">
                  <span className="font-mono text-sm text-brand">{i + 1}.</span>
                  <span>
                    <span className="font-semibold">{t}.</span> <span className="text-ink/70">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="lg:col-span-7">
          <Candidatura />
        </Reveal>
      </div>
    </section>
  );
}

function Duvidas() {
  const [aberta, setAberta] = useState(-1);
  return (
    <section id="duvidas" className="secao">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <h2 className="cond t-s2">Dúvidas</h2>
          <a
            href={`https://wa.me/${SCHOOL.whatsapp}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre a Outside School.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-semibold underline decoration-ink/30 decoration-2 underline-offset-[6px] hover:decoration-brand"
          >
            <MessageCircle size={18} /> Perguntar no WhatsApp
          </a>
        </Reveal>
        <ul className="border-b border-ink/15 lg:col-span-8">
          {DUVIDAS.map((d, i) => (
            <li key={d.q} className="border-t border-ink/15">
              <button onClick={() => setAberta(aberta === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold" aria-expanded={aberta === i}>
                {d.q}
                <ChevronDown size={20} className={`shrink-0 text-ink/40 transition-transform duration-300 ${aberta === i ? "rotate-180" : ""}`} aria-hidden />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${aberta === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <p className="max-w-2xl overflow-hidden text-ink/70">
                  <span className="block pb-6">{d.a}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="bg-ink pb-28 pt-16 text-white/70 sm:pb-12">
      <div className="wrap">
        <p className="cond max-w-3xl text-[clamp(2rem,4.4vw,3.4rem)] text-[#F3EFE7]">
          “Como ouvirão, se não há quem pregue?”
        </p>
        <p className="etiqueta mt-3 text-white/45">Romanos 10:14</p>
        <div className="mt-14 flex flex-col gap-8 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Marca claro />
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-white">
                Outside Experience <ArrowUpRight size={14} />
              </Link>
            </li>
            <li>
              <a href={`https://wa.me/${SCHOOL.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={SCHOOL.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <Instagram size={16} /> @{SCHOOL.instagram}
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-8 text-sm text-white/35">
          © {new Date().getFullYear()} Outside · {SCHOOL.assinatura}
        </p>
      </div>
    </footer>
  );
}

// barra fixa no celular, some quando o formulário aparece
function BarraCelular() {
  const [mostrar, setMostrar] = useState(false);
  const alvo = useRef(null);
  useEffect(() => {
    alvo.current = document.getElementById("candidatura");
    const f = () => {
      const r = alvo.current?.getBoundingClientRect();
      const noForm = r && r.top < window.innerHeight && r.bottom > 0;
      setMostrar(window.scrollY > 500 && !noForm);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-[#F3EFE7]/95 p-3 backdrop-blur transition-transform duration-300 sm:hidden ${mostrar ? "translate-y-0" : "translate-y-full"}`}>
      <button onClick={() => scrollToId("#candidatura")} className="btn-tinta w-full" tabIndex={mostrar ? 0 : -1}>
        Fazer minha candidatura · {SCHOOL.preco}
      </button>
    </div>
  );
}

export default function School() {
  useEffect(() => {
    document.title = "Outside School | Você foi chamado para ir";
    window.scrollTo(0, 0);
    if (window.location.hash) {
      const t = setTimeout(() => scrollToId(window.location.hash), 300);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="school min-h-screen font-sans">
      <Topo />
      <main>
        <Abertura />
        <AEscola />
        <Aulas />
        <Encontro />
        <Combinados />
        <Professores />
        <Inscricao />
        <Duvidas />
      </main>
      <Rodape />
      <BarraCelular />
    </div>
  );
}
