// "B2B x B2C" (IMG_5189), 42.8 s
import React from "react";
import { C, UI } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Book, Bubble, Building, Chart, Clipboard, Coins, Globe, Heart, Label, Laptop, Person, Pop, Puzzle, Tile, ez } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const OWNER = { shirt: "#7A5AF0", skin: "#E0B48A" };
const Plane: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.4))" }}><path d="M4 52 L40 46 L64 10 L74 10 L62 46 L90 44 L98 50 L90 56 L62 54 L74 90 L64 90 L40 54 L4 48 Z" fill="#E9EDF3" /></svg>
);
const Row: React.FC<{ y: number; at: number; t: number; left: React.ReactNode; right: React.ReactNode; tag: string; hot?: boolean; arrowAt: number }> = ({ y, at, t, left, right, tag, hot, arrowAt }) => (
  <>
    <Pop at={at} x={120} y={y}><Label text={tag} hot={hot} size={40} /></Pop>
    <Pop at={at + 0.1} x={360} y={y}>{left}</Pop>
    <div style={{ position: "absolute", left: 470, top: y - 50 }}><Arrow w={240} t={t} at={arrowAt} dur={0.5} curve={-30} /></div>
    <Pop at={arrowAt + 0.4} x={830} y={y}>{right}</Pop>
  </>
);

const scenes: Sc[] = [
  {
    a: 0, b: 3.8, kicker: "Você sabe a diferença?", title: "*B2B* X *B2C*", titleAt: -0.6, titleSize: 96,
    body: (t) => (
      <>
        <Pop at={-0.3} x={300} y={600}><div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}><Building s={140} /><Building s={110} c="#7C6FA8" /></div></Pop>
        <Pop at={0.0} x={780} y={600}><div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}><Building s={140} /><Person {...OWNER} w={110} /></div></Pop>
        <Pop at={1.4} x={540} y={420}><Bubble think>?</Bubble></Pop>
      </>
    ),
  },
  {
    a: 3.8, b: 11.65, kicker: "Pra quem você vende", title: "EMPRESA PRA *EMPRESA* OU PRA *PESSOA*",
    body: (t) => (
      <>
        <Row y={470} at={4.0} t={t} arrowAt={5.6} tag="B2B" left={<Building s={130} />} right={<Building s={130} c="#7C6FA8" />} />
        <Row y={760} at={8.4} t={t} arrowAt={9.9} tag="B2C" hot left={<Building s={130} />} right={<Person {...OWNER} w={110} />} />
      </>
    ),
  },
  {
    a: 11.65, b: 17.8, kicker: "No B2B", title: "UMA SOLUÇÃO *COMPLETA*",
    body: (t) => {
      const lit = ez(t, 16.6, 17.2);
      const deps = [
        { x: 220, y: 450, l: "VENDAS", n: <Chart s={80} /> }, { x: 860, y: 450, l: "FINANCEIRO", n: <Coins s={64} n={4} /> },
        { x: 220, y: 780, l: "PESSOAS", n: <Person {...SELLER} w={46} /> }, { x: 860, y: 780, l: "TI", n: <Laptop s={90} /> },
      ];
      return (
        <>
          <svg width={1080} height={960} style={{ position: "absolute", left: 0, top: 0 }}>
            {deps.map((d, i) => <line key={i} x1={540} y1={615} x2={d.x} y2={d.y} stroke={lit > 0 ? C.accent : "rgba(255,255,255,0.15)"} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={0.4 + 0.6 * lit} />)}
          </svg>
          <Pop at={11.9} x={540} y={615}><Building s={170} /></Pop>
          <Pop at={14.6} x={540} y={420}><Tile size={120} hot glow><Puzzle s={80} c={C.ink} /></Tile></Pop>
          {deps.map((d, i) => <Pop key={i} at={15.2 + i * 0.25} x={d.x} y={d.y}><Tile size={120} hot={lit > 0.5} glow={lit > 0.5} label={d.l}>{d.n}</Tile></Pop>)}
        </>
      );
    },
  },
  {
    a: 17.8, b: 25.05, kicker: "No B2C", title: "PRO DONO: *CURSO DE INGLÊS*",
    body: (t) => (
      <>
        <Pop at={18.0} x={270} y={620}><Person {...OWNER} pose="give" w={190} face={t > 20.6 ? "happy" : "neutral"} hold={t > 20.6 ? <Book s={90} label="EN" /> : null} /></Pop>
        <Pop at={20.4} x={270} y={360}><Label text="CURSO DE INGLÊS" hot size={30} /></Pop>
        <div style={{ position: "absolute", left: 400, top: 470 }}><Arrow w={330} t={t} at={22.8} dur={0.7} curve={-90} dashed /></div>
        {t > 22.8 ? <div style={{ position: "absolute", left: 420 + ez(t, 22.8, 23.8) * 300, top: 520 - Math.sin(ez(t, 22.8, 23.8) * Math.PI) * 90, translate: "-50% -50%", rotate: "-15deg" }}><Plane s={90} /></div> : null}
        <Pop at={23.4} x={830} y={600}><Globe s={240} /></Pop>
        <Pop at={24.0} x={830} y={830}><Label text="NEGÓCIOS FORA DO BRASIL" size={26} /></Pop>
      </>
    ),
  },
  {
    a: 25.05, b: 31.8, kicker: "Geralmente", title: "EMOCIONAL *X* CONSULTIVA",
    body: (t) => {
      const beat = 1 + Math.max(0, Math.sin(t * 7)) * 0.12;
      return (
        <>
          <Pop at={25.3} x={290} y={500}><div style={{ scale: String(t > 27.8 ? beat : 1) }}><Heart s={200} /></div></Pop>
          <Pop at={27.9} x={290} y={760}><Label text="B2C: MAIS EMOCIONAL" size={30} /></Pop>
          <Pop at={29.2} x={790} y={500}><div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}><Clipboard s={130} /><Chart s={140} at={29.6} /></div></Pop>
          <Pop at={30.6} x={790} y={760}><Label text="B2B: MAIS CONSULTIVA" hot size={30} /></Pop>
        </>
      );
    },
  },
  {
    a: 31.8, b: 60, kicker: "Quer aplicar isso?", title: "ALTA *PERFORMANCE*",
    body: (t) => (
      <>
        <Pop at={32.0} x={320} y={620}><Person {...SELLER} pose="cheer" w={210} /></Pop>
        <Pop at={33.0} x={760} y={540}><Chart s={260} at={33.2} /></Pop>
        <Pop at={38.2} x={760} y={800}><div style={{ padding: "16px 32px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 36, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
      </>
    ),
  },
];
export const Ex5189: React.FC = () => <Shell scenes={scenes} />;
