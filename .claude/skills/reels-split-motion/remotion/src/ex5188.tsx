// "Venda transacional x consultiva" (IMG_5188), 57.0 s
import React from "react";
import { C, DISPLAY, UI } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Book, Bubble, Building, Clipboard, Coin, Fly, Label, Mic, Package, Person, Phone, Pop, PriceTag, Puzzle, Store, Tile, ez } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const CLERK = { shirt: "#E5484D", skin: "#C88A5E" };
const CLIENT = { shirt: "#4A6FA5", skin: "#E0B48A" };
const Col: React.FC<{ x: number; at: number; title: string; hot?: boolean; children?: React.ReactNode }> = ({ x, at, title, hot, children }) => (
  <Pop at={at} x={x} y={600} from="down">
    <div style={{ width: 440, height: 520, borderRadius: 32, background: hot ? "linear-gradient(145deg, rgba(255,214,10,0.22), rgba(255,214,10,0.06))" : "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))", border: hot ? `2px solid ${C.accent}` : "1px solid rgba(255,255,255,0.14)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 26, gap: 18, boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 40, color: hot ? C.accent : "#FFF" }}>{title}</div>
      {children}
    </div>
  </Pop>
);
const Q: React.FC<{ n: number; t: number; at: number; big?: boolean }> = ({ n, t, at, big }) => (
  <div style={{ display: "flex", gap: 10 }}>
    {Array.from({ length: n }, (_, i) => { const k = ez(t, at + i * 0.25, at + i * 0.25 + 0.3); return <div key={i} style={{ opacity: k, scale: String(0.5 + 0.5 * k) }}><Bubble hot={big}>?</Bubble></div>; })}
  </div>
);

const scenes: Sc[] = [
  {
    a: 0, b: 4.9, kicker: "A principal diferença", title: "TRANSACIONAL *X* CONSULTIVA", titleAt: -0.6,
    body: () => (
      <>
        <Pop at={-0.3} x={280} y={560} from="left"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Store s={300} /><Label text="TRANSACIONAL" size={30} /></div></Pop>
        <Pop at={3.0} x={420} y={430}><PriceTag s={130} /></Pop>
        <Pop at={0.0} x={800} y={560} from="right"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Building s={190} /><Label text="CONSULTIVA" hot size={30} /></div></Pop>
        <Pop at={4.4} x={930} y={430}><Clipboard s={100} /></Pop>
      </>
    ),
  },
  {
    a: 4.9, b: 12.95, kicker: "O foco", title: "COMPRA *X* PROBLEMA",
    body: (t) => (
      <>
        <Col x={290} at={5.0} title="TRANSACIONAL">
          <div style={{ position: "relative", width: 400, height: 300 }}>
            <div style={{ position: "absolute", left: 40, top: 40 }}><Person {...CLERK} pose="give" w={120} /></div>
            <div style={{ position: "absolute", left: 250, top: 40 }}><Person {...CLIENT} pose="give" w={120} flip /></div>
            <Fly t0={6.2} t1={6.9} from={[160, 140]} to={[260, 140]} arc={-50}><Package s={60} /></Fly>
            <Fly t0={6.4} t1={7.1} from={[260, 160]} to={[150, 160]} arc={50}><Coin s={46} /></Fly>
          </div>
          <Label text="FOCO NA COMPRA" size={26} />
        </Col>
        <Col x={790} at={7.4} title="CONSULTIVA" hot>
          <div style={{ position: "relative", width: 400, height: 300 }}>
            <div style={{ position: "absolute", left: 30, top: 40 }}><Person {...SELLER} pose="point" w={120} /></div>
            <div style={{ position: "absolute", left: 260, top: 40 }}><Person {...CLIENT} pose="think" face={t > 12.2 ? "happy" : "neutral"} w={120} flip /></div>
            <div style={{ position: "absolute", left: 200 + (1 - ez(t, 11.6, 12.3)) * 0, top: 20 - ez(t, 9.8, 10.4) * 0, opacity: ez(t, 9.8, 10.3), translate: "-50% 0" }}><Puzzle s={80} c={t > 12.2 ? "#5FBF7A" : C.accent} /></div>
          </div>
          <Label text="RESOLVER O PROBLEMA" hot size={26} />
        </Col>
      </>
    ),
  },
  {
    a: 12.95, b: 20.5, kicker: "Onde está o foco", title: "PRODUTO *X* CLIENTE",
    body: () => (
      <>
        <Col x={290} at={13.1} title="TRANSACIONAL" />
        <Col x={790} at={17.0} title="CONSULTIVA" hot />
        <Pop at={15.0} x={200} y={580}><Tile size={150} label="PREÇO"><PriceTag s={110} /></Tile></Pop>
        <Pop at={15.8} x={380} y={580}><Tile size={150} label="PRODUTO"><Package s={100} /></Tile></Pop>
        <Pop at={18.9} x={700} y={580}><Tile size={150} hot glow label="PROBLEMA"><Puzzle s={100} c={C.ink} /></Tile></Pop>
        <Pop at={19.9} x={880} y={580}><Tile size={150} hot glow label="CLIENTE"><Person {...CLIENT} w={78} /></Tile></Pop>
      </>
    ),
  },
  {
    a: 20.5, b: 25.95, kicker: "As perguntas", title: "POUCAS *X* ESTRATÉGICAS",
    body: (t) => (
      <>
        <Col x={290} at={20.7} title="TRANSACIONAL">
          <div style={{ marginTop: 10 }}><Q n={1} t={t} at={22.4} /></div>
          <Person {...CLERK} pose="idle" w={130} face="neutral" />
          <Label text="POUCAS PERGUNTAS" size={24} />
        </Col>
        <Col x={790} at={23.3} title="CONSULTIVA" hot>
          <div style={{ marginTop: 10 }}><Q n={3} t={t} at={24.6} big /></div>
          <Person {...SELLER} pose="give" w={130} hold={<Clipboard s={56} />} />
          <Label text="PERGUNTAS ESTRATÉGICAS" hot size={24} />
        </Col>
      </>
    ),
  },
  {
    a: 25.95, b: 34.55, kicker: "Antes de continuar", title: "APRENDA DO *ZERO*",
    body: () => (
      <>
        <Pop at={26.2} x={320} y={600}><Person {...SELLER} pose="wave" w={210} /></Pop>
        <Pop at={30.0} x={760} y={500}><Book s={220} label="VENDAS" /></Pop>
        <Pop at={32.8} x={760} y={720}><div style={{ padding: "16px 32px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 36, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
      </>
    ),
  },
  {
    a: 34.55, b: 41.47, kicker: "Exemplo: transacional", title: "NA *LOJA*",
    body: (t) => {
      const walk = ez(t, 36.2, 37.4);
      return (
        <>
          <Pop at={34.8} x={720} y={560} from="down"><Store s={380} /></Pop>
          <div style={{ position: "absolute", left: 140 + walk * 300, top: 640, translate: "-50% -50%" }}><Person {...CLIENT} pose="idle" w={150} /></div>
          <Pop at={38.3} x={300} y={380}><Bubble think w={180}><div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}><Mic s={60} /></div></Bubble></Pop>
          <Pop at={39.9} x={720} y={360}><PriceTag s={150} /></Pop>
          <Pop at={40.2} x={720} y={830}><Label text="SÓ VALOR E COMO FUNCIONA" size={28} /></Pop>
        </>
      );
    },
  },
  {
    a: 41.47, b: 51.45, kicker: "Exemplo: consultiva", title: "NA *EMPRESA*",
    body: (t) => {
      const fit = ez(t, 50.0, 50.7);
      return (
        <>
          <Pop at={41.7} x={190} y={620} from="left"><Person {...SELLER} pose="give" w={160} hold={<Phone s={50} ring />} /></Pop>
          <div style={{ position: "absolute", left: 300, top: 470 }}><Arrow w={360} t={t} at={43.6} dur={0.6} curve={-60} dashed /></div>
          <Pop at={44.4} x={820} y={560}><Building s={220} /></Pop>
          {["Necessidades específicas", "Perguntas estratégicas", "Melhor solução"].map((x, i) => (
            <Pop key={i} at={[46.6, 48.6, 50.2][i]} x={540} y={760 + i * 62} from="left"><Label text={`✓ ${x}`} hot={i === 2} size={26} /></Pop>
          ))}
          <div style={{ position: "absolute", left: 820 + (1 - fit) * 0, top: 380 - (1 - fit) * 120, opacity: ez(t, 49.6, 50.0), translate: "-50% -50%", rotate: `${(1 - fit) * 30}deg` }}><Puzzle s={110} c={fit > 0.95 ? "#5FBF7A" : C.accent} /></div>
        </>
      );
    },
  },
  {
    a: 51.45, b: 80, kicker: "Me fala", title: "QUAL VOCÊ *PREFERE*?",
    body: (t) => {
      const pick = Math.floor((t - 53.6) / 0.9) % 2;
      return (
        <>
          <Pop at={51.8} x={540} y={470}><svg width={200} height={170} viewBox="0 0 100 85" style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }}><path d="M10 6 L90 6 C95 6 98 9 98 14 L98 54 C98 59 95 62 90 62 L40 62 L18 80 L22 62 L10 62 C5 62 2 59 2 54 L2 14 C2 9 5 6 10 6 Z" fill={C.accent} />{[30, 50, 70].map((x) => <circle key={x} cx={x} cy={34} r={6} fill={C.ink} />)}</svg></Pop>
          {["TRANSACIONAL", "CONSULTIVA"].map((x, i) => (
            <Pop key={i} at={53.4 + i * 0.3} x={290 + i * 500} y={760}><div style={{ padding: "18px 34px", borderRadius: 18, background: t > 53.6 && pick === i ? C.accent : "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", fontFamily: UI, fontWeight: 900, fontSize: 36, color: t > 53.6 && pick === i ? C.ink : "#FFF" }}>{x}</div></Pop>
          ))}
        </>
      );
    },
  },
];
export const Ex5188: React.FC = () => <Shell scenes={scenes} />;
