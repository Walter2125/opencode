import type { Config } from "../types/Config.ts";
import { getDailyForecast } from "../api/weather.ts";
import { color } from "../utils/colors.ts";
import { printDailyForecast } from "../presentation/output.ts";
import { waitForKey } from "../presentation/input.ts";

export async function getForecast7Days(cfg: Config): Promise<void> {
  if (!cfg.defaultCity) {
    console.log(color("\nNo hay ciudad default. Usa la opción 5 para establecer una.", "red"));
    await waitForKey();
    return;
  }
  console.log("\nObteniendo pronóstico...\n");
  const daily = await getDailyForecast(cfg.defaultCity, cfg.unit);
  if (!daily) {
    console.log(color("No se pudo obtener el pronóstico. Intenta más tarde.", "red"));
  } else {
    printDailyForecast(cfg.defaultCity, daily, cfg.unit);
  }
  await waitForKey();
}