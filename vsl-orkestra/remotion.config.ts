/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// Na nuvem do Claude o download do navegador do Remotion é bloqueado: usa o que já está instalado.
// No seu computador esse caminho não existe e o Remotion baixa o dele normalmente.
const NAVEGADOR_NUVEM =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(NAVEGADOR_NUVEM)) {
  Config.setBrowserExecutable(NAVEGADOR_NUVEM);
}
