import type { City } from "../types/City.ts";
import type { Unit } from "../types/Weather.ts";

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCityLabel(city: City): string {
  const parts: string[] = [city.name];
  if (city.admin1) parts.push(city.admin1);
  if (city.country) parts.push(city.country);
  return parts.join(", ");
}

export function pad(text: string, width: number): string {
  const visible = text.replace(/\x1B\[[0-9;]*m/g, "");
  const diff = width - visible.length;
  return diff > 0 ? text + " ".repeat(diff) : text;
}