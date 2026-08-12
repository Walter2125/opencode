import type { Config } from "../types/Config.ts";
import { geocode } from "../api/geocoding.ts";
import { color } from "../utils/colors.ts";
import { formatCityLabel } from "../utils/format.ts";
import { setDefaultCity } from "../storage/citiesStorage.ts";
import { saveConfig } from "../storage/settingsStorage.ts";
import { ask, waitForKey } from "../presentation/input.ts";

export async function setDefaultCityAction(cfg: Config): Promise<void> {
  console.log("");
  console.log("  a) Elegir de las ciudades guardadas");
  console.log("  b) Buscar una nueva ciudad");
  console.log("");
  const sub = ask("Opción (a/b, Enter para cancelar): ").trim().toLowerCase();
  if (sub === "a") {
    if (cfg.cities.length === 0) {
      console.log(color("No hay ciudades guardadas.", "red"));
      await waitForKey();
      return;
    }
    console.log("");
    cfg.cities.forEach((c, i) => {
      console.log(`  ${i + 1}. ${formatCityLabel(c)}`);
    });
    console.log("");
    const raw = ask("Número (0 para cancelar): ").trim();
    const idx = Number.parseInt(raw, 10);
    if (Number.isNaN(idx) || idx === 0) return;
    const target = cfg.cities[idx - 1];
    if (!target) {
      console.log(color("Índice fuera de rango.", "red"));
      await waitForKey();
      return;
    }
    setDefaultCity(cfg, target);
    await saveConfig(cfg);
    console.log(color(`Default: ${formatCityLabel(target)}`, "green"));
    await waitForKey();
  } else if (sub === "b") {
    const name = ask("\nNombre de la ciudad: ").trim();
    if (!name) return;
    const city = await geocode(name);
    if (!city) {
      console.log(color(`No se encontró "${name}".`, "red"));
      await waitForKey();
      return;
    }
    setDefaultCity(cfg, city);
    await saveConfig(cfg);
    console.log(color(`Default: ${formatCityLabel(city)}`, "green"));
    await waitForKey();
  }
}