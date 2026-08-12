import type { Config } from "./types/Config.ts";
import { loadConfig } from "./storage/settingsStorage.ts";
import { color } from "./utils/colors.ts";
import { clearScreen } from "./presentation/output.ts";
import { printMenu, readMenuOption } from "./presentation/menu.ts";
import { waitForKey } from "./presentation/input.ts";
import { getWeather } from "./actions/getWeather.ts";
import { listCities } from "./actions/listCities.ts";
import { addCityAction } from "./actions/addCity.ts";
import { removeCityAction } from "./actions/removeCity.ts";
import { setDefaultCityAction } from "./actions/setDefaultCity.ts";
import { getForecast7Days } from "./actions/getForecast7Days.ts";
import { settings } from "./actions/settings.ts";

export const DISPATCH: Record<string, (cfg: Config) => Promise<void>> = {
  "1": getWeather,
  "2": listCities,
  "3": addCityAction,
  "4": removeCityAction,
  "5": setDefaultCityAction,
  "6": getForecast7Days,
  "8": settings,
};

export async function main(): Promise<void> {
  const cfg = await loadConfig();
  await loop(cfg);
  process.exit(0);
}

export async function loop(cfg: Config): Promise<void> {
  while (true) {
    clearScreen();
    printMenu(cfg);
    const opt = readMenuOption();
    if (opt === "9") {
      console.log("\n¡Hasta pronto!");
      return;
    }
    const action = DISPATCH[opt];
    if (!action) {
      console.log(color("\nOpción no válida.", "red"));
      await waitForKey();
      continue;
    }
    try {
      await action(cfg);
    } catch (e) {
      console.log(color(`\nError: ${(e as Error).message ?? e}`, "red"));
      await waitForKey();
    }
  }
}