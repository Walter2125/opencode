import type { Config } from "../types/Config.ts";
import { color } from "../utils/colors.ts";
import { formatCityLabel } from "../utils/format.ts";
import { removeCity } from "../storage/citiesStorage.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { ask, waitForKey } from "../presentation/input.ts";

export async function removeCityAction(cfg: Config): Promise<void> {
  if (cfg.cities.length === 0) {
    console.log(color("\nNo hay ciudades guardadas.", "red"));
    await waitForKey();
    return;
  }
  console.log("");
  cfg.cities.forEach((c, i) => {
    console.log(`  ${i + 1}. ${formatCityLabel(c)}`);
  });
  console.log("");
  const raw = ask("Número de ciudad a eliminar (0 para cancelar): ").trim();
  const idx = Number.parseInt(raw, 10);
  if (Number.isNaN(idx) || idx === 0) {
    return;
  }
  const realIdx = idx - 1;
  const target = removeCity(cfg, realIdx);
  if (!target) {
    console.log(color("Índice fuera de rango.", "red"));
    await waitForKey();
    return;
  }
  await saveConfig(cfg);
  console.log(color(`Eliminada: ${formatCityLabel(target)}`, "green"));
  await waitForKey();
}