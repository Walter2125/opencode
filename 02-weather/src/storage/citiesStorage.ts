import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import type { Unit } from "../types/Weather.ts";

export function isCity(v: unknown): v is City {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    typeof c.latitude === "number" &&
    typeof c.longitude === "number"
  );
}

export function samePlace(a: City, b: City): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

export function cityExists(cfg: Config, city: City): boolean {
  return cfg.cities.some((c) => samePlace(c, city));
}

export function addCity(cfg: Config, city: City): void {
  cfg.cities.push(city);
}

export function removeCity(cfg: Config, idx: number): City | undefined {
  const target = cfg.cities[idx];
  if (!target) return undefined;
  cfg.cities.splice(idx, 1);
  if (cfg.defaultCity && samePlace(cfg.defaultCity, target)) {
    cfg.defaultCity = null;
  }
  return target;
}

export function setDefaultCity(cfg: Config, city: City): void {
  cfg.defaultCity = city;
  if (!cityExists(cfg, city)) {
    cfg.cities.push(city);
  }
}

export function setUnit(cfg: Config, unit: Unit): void {
  cfg.unit = unit;
}