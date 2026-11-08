// "Vender x convencer" (IMG_5187), 36.4 s
import React from "react";
import { C, DISPLAY, UI } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Book, Bubble, Bulb, Chart, Clipboard, Label, Laptop, Megaphone, Person, Pop, Puzzle, Tile, ez } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const CLIENT = { shirt: "#4A6FA5", skin: "#E0B48A" };
const Thumb: React.FC<{ s?: number }> = ({ s = 80 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.45))" }}>
    <path d="M30 44 L48 10 C56 8 62 14 60 24 L56 40 L86 40 C94 40 98 48 94 56 L84 86 C82 92 76 94 70 94 L30 94 Z" fill={C.accent} /><rect x={6} y={44} width={20} height={50} rx={5} fill="#E9EDF3" />
  </svg>
);
const Contract: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = ez(t, at, at + 0.8);
  return (
    <svg width={170} height={210} viewBox="0 0 170 210" style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }}>
      <rect x={4} y={4} width={162} height={202} rx={12} fill="#FFFFFF" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={22} y={28 + i * 24} width={i === 3 ? 80 : 126} height={10} rx={5} fill="#C9CED6" />)}
      <path d="M22 168 C40 140 54 186 70 160 C86 134 96 182 116 158 C126 146 136 160 146 152" stroke="#2B3340" strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <line x1={22} y1={182} x2={148} y2={182} stroke="#8A93A3" strokeWidth={2} />
    </svg>
  );
};

const scenes: Sc[] = [
  {
    a: 0, b: 4.5, kicker: "A principal diferença", title: "VENDER *X* CONVENCER", titleAt: -0.6, titleSize: 84,
    body: () => (
      <>
        <Pop at={-0.3} x={270} y={600} from="left"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}><Person {...SELLER} pose="give" w={170} hold={<Megaphone s={90} />} /><Label text="CONVENCER" size={30} /></div></Pop>
        <Pop at={0.0} x={810} y={600} from="right"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}><Person {...SELLER} pose="give" w={170} hold={<Chart s={90} />} /><Label text="VENDER" hot size={30} /></div></Pop>
        <Pop at={0.6} x={540} y={560}><div style={{ width: 120, height: 120, borderRadius: 60, background: C.bg, border: `4px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 52, color: C.accent, boxShadow: "0 0 40px rgba(255,214,10,0.5)" }}>VS</div></Pop>
      </>
    ),
  },
  {
    a: 4.5, b: 11.47, kicker: "Convencer", title: "FAZER ELE *ACREDITAR*",
    body: (t) => (
      <>
        <Pop at={4.7} x={210} y={620} from="left"><Person {...SELLER} pose="point" w={170} face="wow" /></Pop>
        <Pop at={5.0} x={850} y={620} from="right"><Person {...CLIENT} pose="think" face="neutral" w={170} flip /></Pop>
        <Pop at={9.2} x={480} y={640}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><Laptop s={230} /><Label text="CRM" hot size={30} /></div></Pop>
        <Pop at={7.5} x={830} y={380}><Bubble think w={240}><div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>{t < 10.6 ? <Bulb s={70} /> : <Chart s={110} at={10.6} />}</div></Bubble></Pop>
        <Pop at={10.7} x={830} y={810}><Label text="ORGANIZAÇÃO COMERCIAL" size={24} /></Pop>
      </>
    ),
  },
  {
    a: 11.47, b: 20.45, kicker: "Vender", title: "MOSTRAR A *JUSTIFICATIVA*",
    body: (t) => {
      const fit = ez(t, 17.6, 18.4);
      return (
        <>
          <Pop at={11.7} x={190} y={620} from="left"><Person {...SELLER} pose="give" w={170} hold={<Clipboard s={80} />} /></Pop>
          <Pop at={12.0} x={880} y={620} from="right"><Person {...CLIENT} pose="idle" face={fit > 0.9 ? "happy" : "neutral"} w={170} flip /></Pop>
          <Pop at={14.0} x={540} y={470}><div style={{ position: "relative", width: 300, height: 220, borderRadius: 28, background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 24px 50px rgba(0,0,0,0.45)" }}>
            <div style={{ position: "absolute", left: 20, top: 16, fontFamily: UI, fontWeight: 900, fontSize: 26, color: "#FFF" }}>POR QUE PRECISA?</div>
            <div style={{ position: "absolute", left: 90, top: 70, width: 120, height: 120, borderRadius: 18, border: "4px dashed #8A93A3" }} />
            <div style={{ position: "absolute", left: 100 + (1 - fit) * 260, top: 80 - (1 - fit) * 140, rotate: `${(1 - fit) * 40}deg` }}><Puzzle s={100} c={fit > 0.95 ? "#5FBF7A" : C.accent} /></div>
          </div></Pop>
          <Pop at={19.1} x={540} y={830}><Label text="RESOLVE O PROBLEMA" hot size={32} /></Pop>
        </>
      );
    },
  },
  {
    a: 20.45, b: 27.85, kicker: "O que você gera", title: "CONCORDÂNCIA *X* DECISÃO",
    body: (t) => (
      <>
        <Pop at={20.7} x={270} y={560}><Person {...CLIENT} pose="give" face="happy" w={160} hold={<Thumb s={70} />} /></Pop>
        <Pop at={22.8} x={270} y={820}><Label text="CONCORDÂNCIA" size={30} /></Pop>
        <Pop at={23.4} x={270} y={400}><Bubble><Thumb s={60} /></Bubble></Pop>
        <Pop at={23.9} x={810} y={560}><Contract t={t} at={25.2} /></Pop>
        <Pop at={26.5} x={810} y={820}><Label text="DECISÃO COMERCIAL" hot size={30} /></Pop>
        <Pop at={26.9} x={930} y={420}><Tile size={100} hot glow><svg width={60} height={60} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke={C.ink} strokeWidth={3.4} fill="none" strokeLinecap="round" /></svg></Tile></Pop>
        <div style={{ position: "absolute", left: 470, top: 520 }}><Arrow w={150} t={t} at={23.8} dur={0.4} curve={-30} /></div>
      </>
    ),
  },
  {
    a: 27.85, b: 60, kicker: "Quer aprender mais?", title: "APRENDA *VENDAS*",
    body: (t) => (
      <>
        <Pop at={28.1} x={330} y={600}><Person {...SELLER} pose="wave" w={210} /></Pop>
        <Pop at={29.0} x={740} y={520}><Book s={220} label="VENDAS" /></Pop>
        <Pop at={33.2} x={740} y={720}><div style={{ padding: "16px 32px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 36, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
      </>
    ),
  },
];
export const Ex5187: React.FC = () => <Shell scenes={scenes} />;
