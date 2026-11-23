import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Instagram, Menu, MessageCircle, Minus, Plus, X } from "lucide-react";
import Reveal from "@/components/Reveal";
import Candidatura from "@/school/Candidatura";
import { LOGO } from "@/data/event";
import {
  AULAS,
  DUVIDAS,
  INCLUSO,
  METODO,
  OBJETIVOS,
  PRINCIPIOS,
  PROCESSO,
  PROFESSORES,
  SCHOOL,
  SEMANAS,
} from "@/data/school";
import { scrollToId } from "@/lib/scroll";

const NAV = [
  { label: "Programa", href: "#programa" },
  { label: "Como funciona", href: "#metodo" },
  { label: "Professores", href: "#professores" },
  { label: "Investimento", href: "#investimento" },
  { label: "Dúvidas", href: "#duvidas" },
];

const dois = (n) => String(n).padStart(2, "0");

function Topo() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const f = () => setRolou(window.scrollY > 16);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const ir = (href) => {
    setAberto(false);
    scrollToId(href);
  };

  return (
    <header className={`no-print fixed inset-x-0 top-0 z-50 border-b transition-colors ${rolou || aberto ? "border-ink/15 bg-folha/95 backdrop-blur" : "border-transparent bg-folha/0"}`}>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <button onClick={() => ir("#topo")} className="flex items-center gap-3" aria-label="Outside School, voltar ao topo">
          <img src={LOGO} alt="Outside" className="h-5 w-auto invert" />
          <span className="font-serif text-xl italic leading-none">School</span>
        </button>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Seções">
          {NAV.map((l) => (
            <button key={l.href} onClick={() => ir(l.href)} className="text-[15px] text-ink/70 hover:text-ink">
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => ir("#candidatura")} className="btn-tinta hidden min-h-[44px] px-5 text-sm sm:inline-flex" data-testid="school-header-cta">
            Quero me candidatar
          </button>
          <button onClick={() => setAberto((v) => !v)} className="flex h-11 w-11 items-center justify-center lg:hidden" aria-label={aberto ? "Fechar menu" : "Abrir menu"} aria-expanded={aberto}>
            {aberto ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {aberto && (
        <nav className="wrap border-t border-ink/10 pb-6 lg:hidden" aria-label="Seções">
          {NAV.map((l) => (
            <button key={l.href} onClick={() => ir(l.href)} className="block w-full border-b border-ink/10 py-4 text-left text-lg">
              {l.label}
            </button>
          ))}
          <button onClick={() => ir("#candidatura")} className="btn-tinta mt-5 w-full">
            Quero me candidatar
          </button>
        </nav>
      )}
    </header>
  );
}

// Folha de rosto: a capa do caderno de campo
function Abertura() {
  return (
    <section id="topo" className="pautado margem pt-16">
      <div className="wrap grid gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="etiqueta text-ink/60 animate-fade-up">Outside School · Formação on-line e ao vivo</p>
          <h1 className="t-school mt-6 font-serif leading-[0.95] tracking-[-0.01em] animate-fade-up" style={{ animationDelay: "80ms" }}>
            Você foi chamado para <em className="text-brand">ir</em>.
          </h1>
          <p className="mt-7 max-w-xl text-lg text-ink/75 sm:text-xl animate-fade-up" style={{ animationDelay: "160ms" }}>
            Quatro semanas para sair da passividade: aprofundar a intimidade com Jesus, anunciar o evangelho com clareza e viver a missão na prática.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button onClick={() => scrollToId("#candidatura")} className="btn-tinta" data-testid="school-hero-cta">
              Quero me candidatar <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollToId("#programa")} className="btn border border-ink/25 hover:border-ink">
              Ver o programa
            </button>
          </div>
        </div>

        {/* ficha técnica, como a capa da apostila */}
        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="border border-ink bg-ink text-folha">
            <div className="flex">
              <div className="w-3 shrink-0 bg-brand" aria-hidden />
              <div className="flex-1 p-6 sm:p-8">
                <p className="etiqueta text-folha/60">Caderno de campo</p>
                <p className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">Escola de envios</p>
                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-folha/15 pt-6">
                  {[
                    [dois(SCHOOL.semanas), "semanas"],
                    [dois(SCHOOL.encontros), "encontros ao vivo"],
                    [SCHOOL.minutos, "minutos cada"],
                    [SCHOOL.preco.replace(",00", ""), "formação completa"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="sr-only">{l}</dt>
                      <dd className="font-mono text-3xl font-medium text-folha sm:text-4xl">{v}</dd>
                      <dd className="etiqueta mt-1 text-folha/55">{l}</dd>
                    </div>
                  ))}
                </dl>
                <p className="etiqueta mt-8 border-t border-folha/15 pt-5 text-brand">{SCHOOL.lema}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Conviccao() {
  return (
    <section className="secao border-t border-ink/15 bg-folha">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="etiqueta text-brand">01 · Nossa convicção</p>
          <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
            Jesus não chamou espectadores. <em>Chamou discípulos.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg text-ink/75">
            Tem muita gente que ama Jesus, mas se sente travada, despreparada ou distante da missão. A School existe para transformar essa convicção num próximo passo real.
          </p>
        </Reveal>
        <ol className="grid gap-px self-start border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:col-span-7">
          {OBJETIVOS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="bg-folha p-6 sm:p-8">
              <span className="etiqueta text-ink/45">{dois(i + 1)}</span>
              <h3 className="mt-3 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-ink/70">{d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Aula({ a, aberta, alternar }) {
  return (
    <li className="border-t border-ink/15">
      <button onClick={alternar} className="group flex w-full items-start gap-5 py-6 text-left sm:items-center" aria-expanded={aberta} data-testid={`aula-${a.n}`}>
        <span className="bolinha">{dois(a.n)}</span>
        <span className="flex-1">
          <span className="block font-serif text-2xl leading-tight sm:text-3xl">{a.titulo}</span>
          <span className="mt-1 block text-ink/60">{a.frase}</span>
        </span>
        <span className="mt-2 shrink-0 text-ink/50 group-hover:text-ink sm:mt-0">{aberta ? <Minus /> : <Plus />}</span>
      </button>
      {aberta && (
        <div className="grid gap-6 pb-8 pl-0 animate-fade-up sm:pl-16 md:grid-cols-2">
          <div className="self-start border-l-4 border-brand bg-brand/[0.07] p-5">
            <p className="etiqueta text-brand-deep">Ideia central</p>
            <p className="mt-2 font-serif text-xl leading-snug">{a.ideia}</p>
          </div>
          <div>
            <p className="etiqueta text-ink/50">Nesta aula</p>
            <ul className="mt-3 space-y-2">
              {a.pontos.map((p) => (
                <li key={p} className="flex gap-3 text-ink/80">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            {a.textos && <p className="mt-5 font-mono text-[13px] text-ink/55">Base bíblica: {a.textos}</p>}
          </div>
        </div>
      )}
    </li>
  );
}

function Programa() {
  const [aberta, setAberta] = useState(1);
  return (
    <section id="programa" className="secao pautado border-t border-ink/15">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="etiqueta text-brand">02 · Grade curricular</p>
            <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
              De dentro <em>para fora.</em>
            </h2>
          </div>
          <p className="text-lg text-ink/70 lg:col-span-5">
            A sequência começa na vida com Deus, passa pela mensagem e pelos dons, e termina na rua e no discipulado. Dois encontros por semana, durante quatro semanas.
          </p>
        </Reveal>

        <div className="mt-14 space-y-14">
          {SEMANAS.map((s) => (
            <Reveal key={s.n} className="grid gap-4 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-3">
                <p className="etiqueta text-ink/50">Semana {dois(s.n)}</p>
                <p className="mt-2 font-serif text-3xl italic">{s.tema}</p>
                <p className="mt-2 text-ink/60">{s.resumo}</p>
              </div>
              <ol className="border-b border-ink/15 lg:col-span-9">
                {AULAS.filter((a) => a.semana === s.n).map((a) => (
                  <Aula key={a.n} a={a} aberta={aberta === a.n} alternar={() => setAberta(aberta === a.n ? 0 : a.n)} />
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metodo() {
  return (
    <section id="metodo" className="secao bg-ink text-folha">
      <div className="wrap">
        <Reveal className="max-w-3xl">
          <p className="etiqueta text-brand">03 · Como cada encontro funciona</p>
          <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
            Menos plateia. <em className="text-brand">Mais prática.</em>
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-px bg-folha/15 sm:grid-cols-2 lg:grid-cols-4">
          {METODO.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 0.06} className="bg-ink p-6 sm:p-8">
              <span className="font-mono text-sm text-brand">{dois(i + 1)}</span>
              <h3 className="mt-6 font-serif text-3xl">{t}</h3>
              <p className="mt-3 text-folha/70">{d}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="etiqueta text-folha/50">Formação responsável</p>
            <p className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Fogo no coração, Bíblia na mão, <em>amor na prática.</em>
            </p>
          </Reveal>
          <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {PRINCIPIOS.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 0.04} className="flex items-baseline gap-4 border-b border-folha/15 py-4">
                <span className="font-mono text-xs text-folha/40">{dois(i + 1)}</span>
                <span className="text-lg">{p}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Professores() {
  return (
    <section id="professores" className="secao border-t border-ink/15 bg-folha">
      <div className="wrap">
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="etiqueta text-brand">04 · Corpo docente</p>
            <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
              Quem vai <em>caminhar com você.</em>
            </h2>
          </div>
          <p className="text-lg text-ink/70 lg:col-span-5">Evangelistas e pastores reunidos para ensinar, ativar e acompanhar cada etapa da formação.</p>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {PROFESSORES.map((p, i) => (
            <Reveal as="li" key={p.name} delay={i * 0.05}>
              <div className="aspect-[4/5] overflow-hidden bg-folha-2">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover grayscale-[35%]" />
                ) : (
                  <div className="pautado flex h-full items-end p-4">
                    <span className="font-serif text-5xl italic text-ink/25">
                      {p.name
                        .replace(/^Pastor /, "")
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </span>
                  </div>
                )}
              </div>
              <p className="etiqueta mt-4 text-ink/45">{dois(i + 1)}</p>
              <p className="mt-1 font-semibold leading-snug">{p.name}</p>
              <p className="text-sm text-ink/60">{p.org}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Depois() {
  const etapas = [
    ["Formação", "Outside School", "Quatro semanas de fundamento, prática e feedback.", null],
    ["Ativação", "Outside Experience", "O dia presencial em que a gente sai junto para a rua.", "/"],
    ["Continuidade", "Igreja local", "Encaminhar, acompanhar e permanecer enviado onde você congrega.", null],
  ];
  return (
    <section className="secao pautado border-t border-ink/15">
      <div className="wrap">
        <Reveal className="max-w-3xl">
          <p className="etiqueta text-brand">05 · Depois da School</p>
          <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
            O curso termina. <em>A missão continua.</em>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-ink/70">A School não foi pensada para produzir um pico emocional. A formação prepara, a rua ativa e a igreja sustenta.</p>
        </Reveal>
        <ol className="mt-12 grid gap-px border border-ink/15 bg-ink/15 md:grid-cols-3">
          {etapas.map(([fase, nome, d, href], i) => (
            <Reveal as="li" key={fase} delay={i * 0.06} className="bg-folha p-6 sm:p-8">
              <p className="etiqueta text-ink/45">
                {dois(i + 1)} · {fase}
              </p>
              <h3 className="mt-4 font-serif text-3xl">{nome}</h3>
              <p className="mt-2 text-ink/70">{d}</p>
              {href && (
                <Link to={href} className="mt-5 inline-flex items-center gap-2 font-semibold underline decoration-brand decoration-2 underline-offset-4 hover:text-brand-deep">
                  Conhecer o Experience <ArrowUpRight size={16} />
                </Link>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Investimento() {
  return (
    <section id="investimento" className="secao border-t border-ink/15 bg-folha">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="etiqueta text-brand">06 · Investimento</p>
          <div className="mt-6 border border-ink bg-folha p-7 sm:p-9">
            <p className="etiqueta text-ink/55">Formação completa</p>
            <p className="mt-3 font-serif text-7xl leading-none sm:text-8xl" data-testid="school-preco">
              {SCHOOL.preco}
            </p>
            <p className="mt-3 text-ink/65">
              {SCHOOL.semanas} semanas · {SCHOOL.encontros} encontros · {SCHOOL.horasAoVivo} horas ao vivo
            </p>
            <ul className="mt-7 space-y-3 border-t border-ink/15 pt-6">
              {INCLUSO.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-7 border-l-4 border-brand bg-brand/[0.07] px-4 py-3 text-[15px]">
              <strong>Pagamento somente após a aprovação</strong> no processo seletivo.
            </p>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="t-school-h2 font-serif leading-[1.02] lg:mt-12">
              Não buscamos só inscritos. <em>Buscamos quem está pronto para responder.</em>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-ink/70">
              A candidatura não garante a vaga. Queremos conhecer sua caminhada, ouvir sua liderança e discernir se esta é a turma certa para você.
            </p>
          </Reveal>
          <ol className="mt-10">
            {PROCESSO.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="flex gap-5 border-t border-ink/15 py-5">
                <span className="bolinha">{dois(i + 1)}</span>
                <div>
                  <h3 className="text-lg font-bold">{t}</h3>
                  <p className="text-ink/70">{d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Inscricao() {
  return (
    <section id="candidatura" className="secao pautado margem border-t border-ink/15">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="etiqueta text-brand">07 · Candidatura</p>
          <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
            Dê o <em>primeiro passo.</em>
          </h2>
          <p className="mt-6 text-lg text-ink/70">Leva uns cinco minutos. Depois disso a gente fala com a sua liderança e te chama no WhatsApp.</p>
          <a
            href={`https://wa.me/${SCHOOL.whatsapp}?text=${encodeURIComponent("Olá! Tenho uma dúvida sobre a Outside School.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 font-semibold underline decoration-brand decoration-2 underline-offset-4"
          >
            <MessageCircle size={18} /> Tirar uma dúvida antes
          </a>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-8">
          <Candidatura />
        </Reveal>
      </div>
    </section>
  );
}

function Duvidas() {
  const [aberta, setAberta] = useState(-1);
  return (
    <section id="duvidas" className="secao border-t border-ink/15 bg-folha">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="etiqueta text-brand">08 · Dúvidas frequentes</p>
          <h2 className="t-school-h2 mt-5 font-serif leading-[1.02]">
            Antes de <em>começar.</em>
          </h2>
        </Reveal>
        <ul className="border-b border-ink/15 lg:col-span-8">
          {DUVIDAS.map((d, i) => (
            <li key={d.q} className="border-t border-ink/15">
              <button onClick={() => setAberta(aberta === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold" aria-expanded={aberta === i}>
                {d.q}
                {aberta === i ? <Minus className="shrink-0" /> : <Plus className="shrink-0" />}
              </button>
              {aberta === i && <p className="max-w-2xl pb-6 text-ink/75 animate-fade-up">{d.a}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="secao bg-ink text-folha">
      <div className="wrap text-center">
        <Reveal>
          <p className="etiqueta text-brand">Romanos 10:14</p>
          <p className="t-school mx-auto mt-6 max-w-5xl font-serif leading-[0.98]">
            Como ouvirão, se não há <em className="text-brand">quem pregue?</em>
          </p>
          <p className="mx-auto mt-8 max-w-xl text-lg text-folha/70">
            Sucesso não é só uma sala cheia. É Jesus anunciado, pessoas amadas, discípulos formados e uma igreja em movimento.
          </p>
          <button onClick={() => scrollToId("#candidatura")} className="btn-brand mt-10">
            Quero me candidatar <ArrowRight size={18} />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-folha/10 bg-ink pb-12 pt-12 text-folha/70">
      <div className="wrap flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Outside" className="h-5 w-auto" />
            <span className="font-serif text-xl italic text-folha">School</span>
          </div>
          <p className="etiqueta mt-4 text-folha/45">
            Outside School · {SCHOOL.assinatura}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-3">
          <li>
            <Link to="/" className="hover:text-folha">Outside Experience</Link>
          </li>
          <li>
            <a href={`https://wa.me/${SCHOOL.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-folha">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </li>
          <li>
            <a href={SCHOOL.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-folha">
              <Instagram size={16} /> @{SCHOOL.instagram}
            </a>
          </li>
        </ul>
      </div>
      <p className="wrap mt-10 text-sm text-folha/35">© {new Date().getFullYear()} Outside. Uberlândia, MG.</p>
    </footer>
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
        <Conviccao />
        <Programa />
        <Metodo />
        <Professores />
        <Depois />
        <Investimento />
        <Inscricao />
        <Duvidas />
        <Manifesto />
      </main>
      <Rodape />
    </div>
  );
}
