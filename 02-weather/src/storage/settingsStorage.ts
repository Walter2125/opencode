import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/Weather.ts";
import { DEFAULT_CONFIG } from "../types/Config.ts";
import { CONFIG_PATH } from "../utils/constants.ts";
import { isCity } from "./citiesStorage.ts";

export async function loadConfig(): Promise<Config> {
  try {
    const file = Bun.file(CONFIG_PATH);
    if (!(await file.exists())) return { ...DEFAULT_CONFIG };
    const raw = await file.json();
    return normalizeConfig(raw);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(cfg: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

export function normalizeConfig(raw: unknown): Config {
  if (typeof raw !== "object" || raw === null) return { ...DEFAULT_CONFIG };
  const obj = raw as Record<string, unknown>;
  const unit: Unit = obj.unit === "fahrenheit" ? "fahrenheit" : "celsius";
  const cities = Array.isArray(obj.cities) ? (obj.cities.filter(isCity) as Config["cities"]) : [];
  const defaultCity = isCity(obj.defaultCity) ? obj.defaultCity : null;
  return { defaultCity, cities, unit };
}