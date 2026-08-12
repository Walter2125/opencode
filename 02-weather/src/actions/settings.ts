import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/Weather.ts";
import { color } from "../utils/colors.ts";
import { unitSymbol } from "../utils/format.ts";
import { setUnit } from "../storage/citiesStorage.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { ask, waitForKey } from "../presentation/input.ts";

export async function settings(cfg: Config): Promise<void> {
  console.log("");
  console.log("  1. Celsius (°C)");
  console.log("  2. Fahrenheit (°F)");
  console.log("");
  const raw = ask("Unidad (1/2, Enter para cancelar): ").trim();
  const next: Unit | null = raw === "1" ? "celsius" : raw === "2" ? "fahrenheit" : null;
  if (next === null) return;
  setUnit(cfg, next);
  await saveConfig(cfg);
  console.log(color(`Unidad guardada: ${unitSymbol(next)}`, "green"));
  await waitForKey();
}