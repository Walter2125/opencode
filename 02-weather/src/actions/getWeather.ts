import type { Config } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { color } from "../utils/colors.ts";
import { printWeather } from "../presentation/output.ts";
import { waitForKey } from "../presentation/input.ts";

export async function getWeather(cfg: Config): Promise<void> {
  if (!cfg.defaultCity) {
    console.log(color("\nNo hay ciudad default. Usa la opción 5 para establecer una.", "red"));
    await waitForKey();
    return;
  }
  console.log("\nObteniendo clima...\n");
  const f = await getForecast(cfg.defaultCity, cfg.unit);
  if (!f) {
    console.log(color("No se pudo obtener el clima. Intenta más tarde.", "red"));
  } else {
    printWeather(cfg.defaultCity, f, cfg.unit);
  }
  await waitForKey();
}