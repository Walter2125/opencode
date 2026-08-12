import type { Config } from "../types/Config.ts";
import { geocode } from "../api/geocoding.ts";
import { color } from "../utils/colors.ts";
import { formatCityLabel } from "../utils/format.ts";
import { addCity, cityExists } from "../storage/citiesStorage.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { ask, waitForKey } from "../presentation/input.ts";

export async function addCityAction(cfg: Config): Promise<void> {
  const name = ask("\nNombre de la ciudad: ").trim();
  if (!name) {
    console.log(color("Nombre vacío.", "red"));
    await waitForKey();
    return;
  }
  console.log("Buscando...");
  const city = await geocode(name);
  if (!city) {
    console.log(color(`No se encontró "${name}".`, "red"));
    await waitForKey();
    return;
  }
  if (cityExists(cfg, city)) {
    console.log(color(`"${formatCityLabel(city)}" ya está guardada.`, "red"));
    await waitForKey();
    return;
  }
  addCity(cfg, city);
  await saveConfig(cfg);
  console.log(color(`Agregada: ${formatCityLabel(city)}`, "green"));
  await waitForKey();
}