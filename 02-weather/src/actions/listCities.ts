import type { Config } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { color } from "../utils/colors.ts";
import { formatCityLabel } from "../utils/format.ts";
import { printWeather } from "../presentation/output.ts";
import { waitForKey } from "../presentation/input.ts";

export async function listCities(cfg: Config): Promise<void> {
  if (cfg.cities.length === 0) {
    console.log(color("\nNo hay ciudades guardadas. Usa la opción 3 para agregar.", "red"));
    await waitForKey();
    return;
  }
  console.log("\nObteniendo clima...\n");
  const cities = cfg.cities;
  await Promise.all(cities.map(async (c) => {
    const f = await getForecast(c, cfg.unit);
    if (!f) {
      console.log(`${formatCityLabel(c)} — ${color("(no disponible)", "red")}`);
    } else {
      printWeather(c, f, cfg.unit);
    }
  }));
  await waitForKey();
}