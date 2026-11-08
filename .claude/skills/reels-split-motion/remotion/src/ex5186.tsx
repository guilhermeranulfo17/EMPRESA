// "As 6 grandes fases da venda" (IMG_5186), 63.7 s
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, UI, useT } from "./kit";
import { Shell, Sc } from "./shell";
import { Apple, Arrow, Bubble, Cart, Chart, Clipboard, Clock, Coin, Factory, Fish, Fly, Globe, Label, Megaphone, Package, Person, Phone, Pop, Stamp, Store, Tile, ez } from "./illu";

const PH = [13.6, 18.9, 26.5, 37.0, 47.0, 54.6];
const NAMES = ["Escambo", "Comércio e moeda", "Rev. Industrial", "Persuasiva", "Consultiva", "Digital"];
const ICONS = [<Apple s={46} />, <Coin s={46} />, <Factory s={56} />, <Megaphone s={52} />, <Clipboard s={40} />, <Cart s={46} />];

// time road at the bottom
const Road: React.FC<{ t: number }> = ({ t }) => {
  const done = PH.filter((p) => t >= p).length;
  const k = ez(t, 9.3, 10.0);
  if (k <= 0) return null;
  const x0 = 110, x1 = 970, y = 892;
  const prog = PH.reduce((a, p) => a + ez(t, p - 0.4, p), 0);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: k * (1 - ez(t, 58.3, 58.8)) }}>
      <div style={{ position: "absolute", left: x0, top: y - 4, width: x1 - x0, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", left: x0, top: y - 4, width: ((x1 - x0) * Math.max(0, prog - 1)) / 5, height: 8, borderRadius: 4, background: C.accent, boxShadow: "0 0 18px rgba(255,214,10,0.7)" }} />
      {PH.map((p, i) => {
        const on = t >= p, cur = i === done - 1;
        const x = x0 + ((x1 - x0) * i) / 5;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", width: cur ? 74 : 54, height: cur ? 74 : 54, borderRadius: 40, background: on ? (cur ? C.accent : "#5E6B80") : "#1E2530", border: "3px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: cur ? "0 0 30px rgba(255,214,10,0.7)" : "none" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: cur ? 32 : 24, color: cur ? C.ink : "#FFFFFF", marginTop: 3 }}>{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
const Era: React.FC<{ n: number; name: string; when?: string; at: number }> = ({ n, name, when, at }) => (
  <Pop at={at} x={540} y={790}><div style={{ display: "flex", gap: 12, alignItems: "center" }}><Label text={`FASE ${n}: ${name.toUpperCase()}`} hot size={30} />{when ? <Label text={when} size={26} /> : null}</div></Pop>
);
const ANC = { shirt: "#B07A45", skin: "#8D5A3B" }, ANC2 = { shirt: "#7A8F5E", skin: "#E0B48A" };

const scenes: Sc[] = [
  {
    a: 0, b: 3.5, kicker: "História da venda", title: "AS *6 GRANDES FASES* DA VENDA", titleAt: -0.6, titleSize: 76,
    body: () => (
      <>
        {ICONS.map((ic, i) => (
          <Pop key={i} at={-0.2 + i * 0.18} x={150 + (i % 3) * 390} y={520 + Math.floor(i / 3) * 230} from="down">
            <Tile size={150} hot={i === 5} label={NAMES[i].toUpperCase()}>{React.cloneElement(ic, { s: (ic.props as { s: number }).s * 1.7 })}</Tile>
          </Pop>
        ))}
      </>
    ),
  },
  {
    a: 3.5, b: 9.33, kicker: "Não é de hoje", title: "NÃO COMEÇOU *HOJE*",
    body: (t) => (
      <>
        <Pop at={3.7} x={540} y={560}><div style={{ rotate: `${-(t - 3.7) * 260}deg` }}><Clock s={300} /></div></Pop>
        <Pop at={4.2} x={540} y={560}><svg width={420} height={420} viewBox="0 0 100 100" style={{ rotate: `${-(t - 4.2) * 90}deg` }}><path d="M50 6 A44 44 0 1 0 94 50" stroke={C.accent} strokeWidth={4} fill="none" strokeLinecap="round" /><path d="M86 40 L94 52 L100 40" stroke={C.accent} strokeWidth={4} fill="none" /></svg></Pop>
        <Pop at={7.4} x={540} y={830}><Label text="MUITO MAIS ANTIGO" hot size={40} /></Pop>
      </>
    ),
  },
  {
    a: 9.33, b: 17.8, kicker: "Antiguidade", title: "COMEÇOU COM O *ESCAMBO*",
    body: (t) => {
      const cyc = Math.floor((t - 13.8) / 1.6), ph = ((t - 13.8) % 1.6) / 1.6;
      return (
        <>
          <Pop at={9.6} x={220} y={560} from="left"><Person {...ANC} pose="give" w={170} /></Pop>
          <Pop at={9.8} x={860} y={560} from="right"><Person {...ANC2} pose="give" w={170} flip /></Pop>
          {t < 13.8 ? <><Pop at={10.4} x={330} y={520}><Apple s={80} /></Pop><Pop at={10.6} x={750} y={520}><Fish s={100} /></Pop></> : null}
          {t >= 13.8 ? (
            <>
              <Fly t0={13.8 + cyc * 1.6} t1={13.8 + cyc * 1.6 + 1.0} from={[330, 520]} to={[750, 520]} arc={-140} hold={false}><Apple s={80} /></Fly>
              <Fly t0={13.8 + cyc * 1.6} t1={13.8 + cyc * 1.6 + 1.0} from={[750, 520]} to={[330, 520]} arc={140} hold={false}><Fish s={100} /></Fly>
              {ph > 0.62 ? <><div style={{ position: "absolute", left: 330, top: 520, translate: "-50% -50%" }}><Fish s={100} /></div><div style={{ position: "absolute", left: 750, top: 520, translate: "-50% -50%" }}><Apple s={80} /></div></> : null}
            </>
          ) : null}
          <Era n={1} name="Escambo" at={13.6} />
          <Pop at={16.2} x={540} y={680}><div style={{ position: "relative" }}><Coin s={110} /><div style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%" }}><Stamp text="SEM DINHEIRO" at={16.3} size={40} /></div></div></Pop>
        </>
      );
    },
  },
  {
    a: 17.8, b: 24.95, kicker: "Idade Média", title: "COMÉRCIO E *MOEDA*",
    body: (t) => (
      <>
        <Pop at={18.1} x={540} y={540} from="down"><Store s={360} /></Pop>
        {[0, 1, 2, 3].map((i) => <Fly key={i} t0={19.0 + i * 0.3} t1={19.6 + i * 0.3} from={[540 + (i - 1.5) * 140, 300]} to={[540 + (i - 1.5) * 60, 640]} arc={0}><Coin s={60} /></Fly>)}
        <Pop at={21.2} x={190} y={600} from="left"><Person {...ANC} pose="point" w={140} /></Pop>
        <Pop at={21.4} x={890} y={600} from="right"><Person {...ANC2} pose="think" w={140} flip face="neutral" /></Pop>
        <Pop at={23.3} x={240} y={400}><Bubble hot>R$?</Bubble></Pop>
        <Era n={2} name="Comércio e moeda" at={18.9} />
      </>
    ),
  },
  {
    a: 24.95, b: 34.2, kicker: "Revolução Industrial", title: "PRODUÇÃO EM *MASSA*",
    body: (t) => (
      <>
        <Pop at={25.3} x={250} y={560} from="left"><Factory s={340} /></Pop>
        <div style={{ position: "absolute", left: 400, top: 650, width: 640, height: 22, borderRadius: 11, background: "#3A4556" }} />
        {t > 29.6 ? Array.from({ length: 9 }, (_, i) => { const x = 420 + (((t - 29.6) * 160 + i * 80) % 640); return <div key={i} style={{ position: "absolute", left: x, top: 610, translate: "-50% -50%" }}><Package s={70} /></div>; }) : null}
        <Pop at={31.3} x={850} y={430}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><Chart s={180} at={31.3} /><Label text="+ PROCESSOS COMERCIAIS" size={22} /></div></Pop>
        <Era n={3} name="Revolução Industrial" at={26.5} />
      </>
    ),
  },
  {
    a: 34.2, b: 42.6, kicker: "Início do século XX", title: "VENDA *PERSUASIVA*",
    body: (t) => (
      <>
        <Pop at={34.6} x={290} y={560} from="left"><Person shirt="#E5484D" skin="#8D5A3B" pose="give" tie w={190} hold={<Megaphone s={110} />} /></Pop>
        <Pop at={34.9} x={830} y={560} from="right"><Person shirt="#4A6FA5" skin="#E0B48A" pose="idle" face="wow" w={170} flip /></Pop>
        {t > 37.0 ? [0, 1, 2].map((i) => { const p = ((t - 37) * 1.3 + i / 3) % 1; return <div key={i} style={{ position: "absolute", left: 500 + p * 180, top: 470, width: 40 + p * 50, height: 110 + p * 120, translate: "-50% -50%", borderRight: `8px solid ${C.accent}`, borderRadius: "0 200px 200px 0", opacity: 1 - p }} />; }) : null}
        <Pop at={39.6} x={560} y={330}><Label text="TÉCNICAS DE NEGOCIAÇÃO" size={30} /></Pop>
        <Era n={4} name="Venda persuasiva" at={37.0} />
      </>
    ),
  },
  {
    a: 42.6, b: 50.6, kicker: "Final do século XX", title: "VENDA *CONSULTIVA*",
    body: (t) => (
      <>
        <Pop at={42.9} x={270} y={570} from="left"><Person shirt={C.accent} skin="#8D5A3B" pose="give" w={180} hold={<Clipboard s={80} />} /></Pop>
        <Pop at={43.1} x={820} y={570} from="right"><Person shirt="#4A6FA5" skin="#E0B48A" pose="think" face="happy" w={180} flip /></Pop>
        {[0, 1, 2].map((i) => <Pop key={i} at={44.6 + i * 0.7} x={300 + i * 80} y={360 - i * 10}><Bubble hot={i === 2}>?</Bubble></Pop>)}
        <Pop at={47.6} x={800} y={360}><Bubble tail="right">!</Bubble></Pop>
        <Pop at={49.4} x={540} y={700}><Label text="SPIN SELLING" hot size={36} /></Pop>
        <Era n={5} name="Venda consultiva" at={47.0} />
      </>
    ),
  },
  {
    a: 50.6, b: 58.5, kicker: "Internet e rede social", title: "VENDA *DIGITAL*",
    body: (t) => (
      <>
        <Pop at={50.9} x={300} y={560}><Globe s={240} /></Pop>
        <Pop at={52.0} x={760} y={560}><Phone s={190} ring screen={<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}><Cart s={110} /><div style={{ width: 120, height: 40, borderRadius: 20, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 900, fontSize: 20, color: C.ink }}>COMPRAR</div></div>} /></Pop>
        <div style={{ position: "absolute", left: 400, top: 440 }}><Arrow w={240} t={t} at={53.4} dur={0.5} curve={-60} dashed /></div>
        {[0, 1, 2].map((i) => <Pop key={i} at={55.2 + i * 0.6} x={870 + (i % 2) * 60} y={330 + i * 70}><div style={{ width: 54, height: 54, borderRadius: 27, background: "#5FBF7A", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(95,191,122,0.7)" }}><svg width={30} height={30} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="#FFF" strokeWidth={3.4} fill="none" strokeLinecap="round" /></svg></div></Pop>)}
        <Pop at={56.2} x={540} y={790}><Label text="SEM ESTAR PRESENTE" size={30} /></Pop>
        <Era n={6} name="Venda digital" at={54.6} />
      </>
    ),
  },
  {
    a: 58.5, b: 80, kicker: "Gostou?", title: "ME SEGUE E *SALVA*",
    body: (t) => (
      <>
        <Pop at={58.8} x={540} y={600}><Person shirt={C.accent} skin="#8D5A3B" pose="cheer" w={220} /></Pop>
        <Pop at={60.2} x={250} y={500}><div style={{ padding: "18px 34px", borderRadius: 18, background: "#4D8DF0", fontFamily: UI, fontWeight: 900, fontSize: 38, color: "#FFF", boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>+ SEGUIR</div></Pop>
        <Pop at={61.6} x={830} y={500}><div style={{ padding: "18px 34px", borderRadius: 18, background: C.accent, fontFamily: UI, fontWeight: 900, fontSize: 38, color: C.ink, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>SALVAR</div></Pop>
      </>
    ),
  },
];

export const Ex5186: React.FC = () => {
  return (
    <AbsoluteFill>
      <Shell scenes={scenes} />
      <RoadLayer />
    </AbsoluteFill>
  );
};
const RoadLayer: React.FC = () => {
  const { t } = useT();
  return <AbsoluteFill><Road t={t} /></AbsoluteFill>;
};
