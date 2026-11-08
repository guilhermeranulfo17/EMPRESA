import { AbsoluteFill } from "remotion";
import { COR } from "../tema";

/** Fundo grafite liso (as cenas põem foto real por cima quando precisam). */
export const Fundo: React.FC = () => <AbsoluteFill style={{ backgroundColor: COR.fundo }} />;
