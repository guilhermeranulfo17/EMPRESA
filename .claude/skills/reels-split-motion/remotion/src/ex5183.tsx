// "O que é vender" (IMG_5183), 30.8 s
import React from "react";
import { C } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Battery, Bubble, Bulb, Coins, Compass, Fly, Gem, Label, Magnifier, Megaphone, Package, Person, Pop, Puzzle, Stamp, Tile, ez, Coin } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const CLIENT = { shirt: "#4A6FA5", skin: "#E0B48A" };

// balance scale: tilt 0..1 (1 = left side fully down)
const Scale: React.FC<{ tilt: number; left: React.ReactNode; right: React.ReactNode }> = ({ tilt, left, right }) => {
  const th = (tilt * 14 * Math.PI) / 180, L = 290, px = 540, py = 520;
  const le = [px - L * Math.cos(th), py + L * Math.sin(th)], re = [px + L * Math.cos(th), py - L * Math.sin(th)];
  const pan = (e: number[], hot: boolean, node: React.ReactNode, key: number) => (
    <div key={key} style={{ position: "absolute", left: e[0] - 130, top: e[1], width: 260, height: 130 }}>
      <svg width={260} height={120} style={{ position: "absolute", top: 0, left: 0 }}><path d="M130 0 L22 108 M130 0 L238 108" stroke="#8A93A3" strokeWidth={3} /></svg>
      <div style={{ position: "absolute", top: 104, left: 0, width: 260, height: 28, borderRadius: "0 0 130px 130px", background: hot ? "#FFD60A" : "#5E6B80" }} />
      <div style={{ position: "absolute", left: 0, width: 260, top: -40, height: 144, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>{node}</div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: px - 14, top: py, width: 28, height: 360, background: "#3A4556", borderRadius: 10 }} />
      <div style={{ position: "absolute", left: px - 120, top: py + 350, width: 240, height: 30, background: "#3A4556", borderRadius: 12 }} />
      <div style={{ position: "absolute", left: px - L - 10, top: py - 10, width: (L + 10) * 2, height: 20, background: "#C9CED6", borderRadius: 10, rotate: `${(-th * 180) / Math.PI}deg` }} />
      <div style={{ position: "absolute", left: px - 22, top: py - 22, width: 44, height: 44, borderRadius: 22, background: "#FFD60A" }} />
      {pan(le, true, left, 0)}
      {pan(re, false, right, 1)}
    </>
  );
};

const scenes: Sc[] = [
  {
    a: 0, b: 3.3, kicker: "Venda de verdade", title: "O QUE É *VENDER*?", titleAt: -0.6, titleSize: 84,
    body: (t) => (
      <>
        <Pop at={-0.5} x={300} y={640} from="left"><Person {...SELLER} pose="wave" w={200} /></Pop>
        <Pop at={-0.3} x={780} y={640} from="right"><Person {...CLIENT} pose="think" face="neutral" w={200} flip /></Pop>
        <Pop at={0.4} x={780} y={380}><Bubble think>?</Bubble></Pop>
        <Pop at={1.2} x={300} y={380}><Bubble tail="right" hot>Oi!</Bubble></Pop>
      </>
    ),
  },
  {
    a: 3.3, b: 7.7, kicker: "Vender é", title: "CONDUZIR A UMA *DECISÃO*",
    body: (t) => {
      const walk = ez(t, 4.1, 5.6);
      return (
        <>
          <div style={{ position: "absolute", left: 180, top: 690 }}><Arrow w={620} t={t} at={3.7} dur={0.8} curve={-50} dashed /></div>
          <Pop at={3.5} x={160} y={640}><Person {...SELLER} pose="point" w={150} /></Pop>
          <div style={{ position: "absolute", left: 300 + walk * 420, top: 640, translate: "-50% -50%" }}><Person {...CLIENT} pose="idle" w={150} bob={1} face={walk > 0.9 ? "happy" : "neutral"} /></div>
          <Pop at={5.4} x={900} y={560}><Tile size={140} hot glow><svg width={80} height={80} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke={C.ink} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></Tile></Pop>
          <Pop at={5.6} x={900} y={680}><Label text="DECISÃO" hot /></Pop>
          {/* exchange of value */}
          <Fly t0={6.3} t1={7.0} from={[180, 560]} to={[700, 520]} arc={-120}><Package s={90} /></Fly>
          <Fly t0={6.4} t1={7.1} from={[720, 560]} to={[200, 520]} arc={120}><Coin s={70} /></Fly>
          <Pop at={6.6} x={450} y={860}><Label text="TROCA DE VALOR" /></Pop>
        </>
      );
    },
  },
  {
    a: 7.7, b: 10.45, kicker: "Não é", title: "SÓ *CONVENCER*",
    body: (t) => {
      const lean = ez(t, 8.3, 8.8);
      return (
        <>
          <Pop at={7.9} x={260} y={630}><Person {...SELLER} pose="give" w={170} face="wow" hold={<div style={{ rotate: "-10deg" }}><Megaphone s={110} /></div>} /></Pop>
          <div style={{ position: "absolute", left: 800 + lean * 60, top: 630, translate: "-50% -50%", rotate: `${lean * 12}deg` }}><Person {...CLIENT} pose="arms" face="sad" w={170} flip /></div>
          {[0, 1, 2].map((i) => { const p = ((t - 8.2) * 1.4 + i / 3) % 1; return t > 8.2 ? <div key={i} style={{ position: "absolute", left: 470 + p * 200, top: 520, width: 40 + p * 60, height: 120 + p * 120, translate: "-50% -50%", borderRight: `8px solid ${C.accent}`, borderRadius: "0 200px 200px 0", opacity: 1 - p }} /> : null; })}
          <Pop at={9.2} x={540} y={840}><Stamp text="NÃO" at={9.2} size={80} /></Pop>
        </>
      );
    },
  },
  {
    a: 10.45, b: 18.7, kicker: "O que o cliente precisa perceber", title: "A SOLUÇÃO *VALE MAIS*",
    body: (t) => {
      const tilt = 0.2 + ez(t, 12.8, 13.6) * 0.8 - ez(t, 14.9, 16.9) * 0.2 + Math.sin(t * 2) * 0.04;
      return (
        <Scale
          tilt={tilt}
          left={<Pop at={12.6} x={130} y={70}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Bulb s={84} /><Label text="SOLUÇÃO" hot size={26} /></div></Pop>}
          right={<>
            <Pop at={14.9} x={50} y={80} from="up"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><svg width={50} height={64} viewBox="0 0 50 64"><path d="M25 2 C34 20 46 32 46 44 C46 56 36 62 25 62 C14 62 4 56 4 44 C4 32 16 20 25 2 Z" fill="#5FD4F5" /></svg><Label text="esforço" size={18} /></div></Pop>
            <Pop at={15.7} x={130} y={80} from="up"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Battery s={70} level={0.2} /><Label text="energia" size={18} /></div></Pop>
            <Pop at={16.6} x={210} y={80} from="up"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Coins s={60} n={4} /><Label text="dinheiro" size={18} /></div></Pop>
          </>}
        />
      );
    },
  },
  {
    a: 18.7, b: 25.6, kicker: "Na prática", title: "VENDER ENVOLVE *3 COISAS*",
    body: (t) => (
      <>
        {[
          { at: 22.0, x: 200, label: "COMPREENDER", icon: <Magnifier s={100} /> },
          { at: 23.4, x: 540, label: "DEMONSTRAR VALOR", icon: <Gem s={100} /> },
          { at: 24.8, x: 880, label: "CONDUZIR", icon: <Compass s={100} /> },
        ].map((it, i) => {
          const cur = t >= it.at && (i === 2 || t < [23.4, 24.8][i]);
          return <Pop key={i} at={it.at} x={it.x} y={560} from="down"><Tile size={200} hot={cur} glow={cur} label={`${i + 1}. ${it.label}`}>{it.icon}</Tile></Pop>;
        })}
        {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: 300 + i * 340, top: 520 }}><Arrow w={140} t={t} at={[23.2, 24.6][i]} dur={0.3} curve={-30} thick={7} /></div>)}
      </>
    ),
  },
  {
    a: 25.6, b: 40, kicker: "Então", title: "VENDA A *SOLUÇÃO*",
    body: (t) => (
      <>
        <Pop at={25.8} x={270} y={560}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 1 - ez(t, 27.2, 27.8) * 0.5 }}><Package s={200} /><Label text="PRODUTO" /></div></Pop>
        <Pop at={26.9} x={270} y={560}><Stamp text="PARE" at={26.9} size={80} /></Pop>
        <Pop at={27.6} x={800} y={430}><Bubble think w={260}><div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}><Puzzle s={110} /></div></Bubble></Pop>
        <Pop at={27.4} x={800} y={720}><Person {...CLIENT} pose="cheer" w={150} face="happy" /></Pop>
        <Pop at={28.2} x={800} y={870}><Label text="SOLUÇÃO" hot /></Pop>
      </>
    ),
  },
];

export const Ex5183: React.FC = () => <Shell scenes={scenes} />;
