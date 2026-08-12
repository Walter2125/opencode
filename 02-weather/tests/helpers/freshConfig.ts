import type { Config } from "../../src/types/Config.ts";
import type { City } from "../../src/types/City.ts";
import type { Unit } from "../../src/types/Weather.ts";

export function freshConfig(opts: {
  defaultCity?: City | null;
  cities?: City[];
  unit?: Unit;
} = {}): Config {
  return {
    defaultCity: opts.defaultCity ?? null,
    cities: opts.cities ? opts.cities.map((c) => ({ ...c })) : [],
    unit: opts.unit ?? "celsius",
  };
}

export const SAMPLE_CITY: City = {
  name: "Madrid",
  latitude: 40.4168,
  longitude: -3.7038,
  country: "España",
  admin1: "Comunidad de Madrid",
};

export const SAMPLE_CITY_2: City = {
  name: "Tokio",
  latitude: 35.6762,
  longitude: 139.6503,
  country: "Japón",
};