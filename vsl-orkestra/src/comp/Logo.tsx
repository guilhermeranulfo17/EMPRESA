import { Img, staticFile } from "remotion";

/** Logo oficial do Orkestra (arquivos enviados pelo dono): só o nome, em branco ou em preto. */
const PROPORCAO = { branco: 125 / 939, preto: 130 / 979 };

export const Logo: React.FC<{ largura: number; cor?: "branco" | "preto" }> = ({ largura, cor = "branco" }) => (
  <Img
    src={staticFile(`marca/orkestra-${cor}.png`)}
    style={{ width: largura, height: largura * PROPORCAO[cor], display: "block" }}
  />
);
