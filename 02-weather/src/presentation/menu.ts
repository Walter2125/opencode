import type { Config } from "../types/Config.ts";
import { color } from "../utils/colors.ts";
import { SEP, MENU_OPTIONS } from "../utils/constants.ts";
import { ask } from "./input.ts";

export function printMenu(cfg: Config): void {
  console.log(color(SEP, "cyan"));
  console.log(color("         WEATHER CLI", "cyan"));
  console.log(color(SEP, "cyan"));
  for (const opt of MENU_OPTIONS) {
    console.log(`  ${opt.key}. ${opt.render(cfg)}`);
  }
  console.log(color(SEP, "cyan"));
}

export function readMenuOption(): string {
  return ask("  Selecciona una opción: ").trim();
}