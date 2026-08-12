import type { City } from "./City.ts";
import type { Unit } from "./Weather.ts";

export interface Config {
  defaultCity: City | null;
  cities: City[];
  unit: Unit;
}

export const DEFAULT_CONFIG: Config = {
  defaultCity: null,
  cities: [],
  unit: "celsius",
};