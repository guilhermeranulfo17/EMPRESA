// "O papel do vendedor na economia" (IMG_5190), 45.7 s
import React from "react";
import { C, DISPLAY, UI } from "./kit";
import { Shell, Sc } from "./shell";
import { Arrow, Bubble, Bulb, Coin, Coins, Factory, Globe, Handshake, Label, Package, Person, Pop, Tile, ez } from "./illu";

const SELLER = { shirt: C.accent, skin: "#8D5A3B" };
const P1 = { shirt: "#4A6FA5", skin: "#E0B48A" }, P2 = { shirt: "#7A5AF0", skin: "#8D5A3B" }, P3 = { shirt: "#2FA8D0", skin: "#C88A5E" };
const Trophy: React.FC<{ s?: number }> = ({ s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.4))" }}><path d="M26 8 L74 8 L72 40 C70 56 60 62 50 62 C40 62 30 56 28 40 Z" fill="#F5C542" /><path d="M26 16 C10 16 10 40 30 44 M74 16 C90 16 90 40 70 44" stroke="#F5C542" strokeWidth={6} fill="none" /><rect x={44} y={62} width={12} height={16} fill="#C9961A" /><rect x={30} y={78} width={40} height={14} rx={4} fill="#C9961A" /></svg>
);
const Crowd: React.FC<{ w?: number }> = ({ w = 90 }) => (
  <div style={{ display: "flex", alignItems: "flex-end" }}>
    <Person {...P1} w={w} /><div style={{ marginLeft: -20, marginBottom: 10 }}><Person {...P2} w={w * 1.1} /></div><div style={{ marginLeft: -20 }}><Person {...P3} w={w} /></div>
  </div>
);

const scenes: Sc[] = [
  {
    a: 0, b: 3.67, kicker: "Você sabia?", title: "O PAPEL DO *VENDEDOR* NA ECONOMIA", titleAt: -0.6,
    body: () => (
      <>
        <Pop at={-0.4} x={540} y={560}><div style={{ opacity: 0.9 }}><Globe s={420} /></div></Pop>
        <Pop at={0.0} x={540} y={660}><Person {...SELLER} pose="cheer" w={190} /></Pop>
        <Pop at={1.6} x={760} y={380}><Bubble think>?</Bubble></Pop>
      </>
    ),
  },
  {
    a: 3.67, b: 13.1, kicker: "Agente econômico", title: "CONECTA *OFERTA* E *DEMANDA*",
    body: (t) => {
      const loop = ez(t, 11.4, 11.9);
      return (
        <>
          <Pop at={6.4} x={190} y={560}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Factory s={250} /><Label text="OFERTA" size={30} /></div></Pop>
          <Pop at={7.6} x={890} y={560}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Crowd w={80} /><Label text="DEMANDA" size={30} /></div></Pop>
          <Pop at={4.0} x={540} y={600}><Person {...SELLER} pose="arms" w={170} /></Pop>
          <div style={{ position: "absolute", left: 310, top: 440 }}><Arrow w={170} t={t} at={7.0} dur={0.4} curve={-30} /></div>
          <div style={{ position: "absolute", left: 620, top: 440 }}><Arrow w={170} t={t} at={8.0} dur={0.4} curve={-30} /></div>
          <Pop at={9.8} x={540} y={400}><Handshake s={170} /></Pop>
          {loop > 0 ? Array.from({ length: 6 }, (_, i) => { const a = (t - 11.4) * 1.8 + (i / 6) * Math.PI * 2; return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 380, top: 640 + Math.sin(a) * 150, translate: "-50% -50%", opacity: loop, zIndex: Math.sin(a) > 0 ? 5 : 0 }}><Coin s={56} /></div>; }) : null}
          <Pop at={11.8} x={540} y={860}><Label text="DINHEIRO CIRCULANDO" hot size={30} /></Pop>
        </>
      );
    },
  },
  {
    a: 13.1, b: 16.75, kicker: "As principais", title: "*5 FUNÇÕES* DO VENDEDOR",
    body: (t) => (
      <>
        <Pop at={13.3} x={540} y={560}><div style={{ fontFamily: DISPLAY, fontSize: 360, color: C.accent, lineHeight: 1, textShadow: "0 0 80px rgba(255,214,10,0.45)" }}>5</div></Pop>
        {Array.from({ length: 5 }, (_, i) => <Pop key={i} at={13.8 + i * 0.12} x={220 + i * 160} y={840}><div style={{ width: 110, height: 110, borderRadius: 28, border: "4px dashed rgba(255,255,255,0.3)" }} /></Pop>)}
      </>
    ),
  },
  {
    a: 16.75, b: 24.15, kicker: "Mas antes", title: "ALTA *PERFORMANCE* EM VENDAS",
    body: () => (
      <>
        <Pop at={17.0} x={320} y={620}><Person {...SELLER} pose="wave" w={210} /></Pop>
        <Pop at={19.0} x={760} y={520}><Trophy s={220} /></Pop>
        <Pop at={21.4} x={760} y={760}><div style={{ padding: "16px 32px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 36, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
      </>
    ),
  },
  {
    a: 24.15, b: 33.8, kicker: "Funções do vendedor", title: "O QUE O VENDEDOR *GERA*",
    body: (t) => {
      const items = [
        { at: 24.8, l: "RECEITA", n: <Coins s={70} n={4} /> }, { at: 26.3, l: "ECONOMIA", n: <Globe s={86} /> },
        { at: 28.1, l: "EMPREGO", n: <Person {...P1} w={52} /> }, { at: 30.3, l: "INFORMAÇÃO", n: <Bulb s={70} /> }, { at: 32.8, l: "CONCORRÊNCIA", n: <Trophy s={80} /> },
      ];
      const cur = items.filter((x) => t >= x.at).length - 1;
      const pos = [[210, 470], [540, 420], [870, 470], [330, 760], [750, 760]];
      return (
        <>
          <Pop at={24.4} x={540} y={640}><Person {...SELLER} pose="cheer" w={120} /></Pop>
          {items.map((it, i) => <Pop key={i} at={it.at} x={pos[i][0]} y={pos[i][1]}><Tile size={140} hot={i === cur} glow={i === cur} label={`${i + 1}. ${it.l}`}>{it.n}</Tile></Pop>)}
        </>
      );
    },
  },
  {
    a: 33.8, b: 60, kicker: "No fim", title: "VALOR NÃO É *SÓ A VENDA*",
    body: (t) => (
      <>
        <Pop at={34.2} x={230} y={600}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 1 - ez(t, 39.0, 39.6) * 0.5 }}><Package s={150} /><Label text="SÓ A VENDA" size={26} /></div></Pop>
        <Pop at={40.4} x={560} y={620}><Person {...SELLER} pose="give" w={170} hold={<Bulb s={80} />} /></Pop>
        <Pop at={41.0} x={880} y={620}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Crowd w={70} /><Label text="MERCADO" size={26} /></div></Pop>
        <Pop at={42.4} x={620} y={360}><Label text="DEMONSTRA SOLUÇÕES" hot size={32} /></Pop>
      </>
    ),
  },
];
export const Ex5190: React.FC = () => <Shell scenes={scenes} />;
