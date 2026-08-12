import { describe, it, expect } from "bun:test";
import {
  SEP,
  CONFIG_PATH,
  GEOCODING_URL,
  FORECAST_URL,
  MENU_OPTIONS,
} from "../src/utils/constants.ts";
import { freshConfig } from "./helpers/freshConfig.ts";

describe("constantes", () => {
  it("SEP tiene longitud consistente", () => {
    expect(SEP.length).toBeGreaterThan(0);
    expect(SEP.includes("═")).toBe(true);
  });

  it("CONFIG_PATH apunta a weather.json", () => {
    expect(CONFIG_PATH).toBe("weather.json");
  });

  it("URLs de las APIs OpenMeteo", () => {
    expect(GEOCODING_URL).toBe("https://geocoding-api.open-meteo.com/v1/search");
    expect(FORECAST_URL).toBe("https://api.open-meteo.com/v1/forecast");
  });
});

describe("MENU_OPTIONS", () => {
  const cfg = freshConfig({ cities: [], unit: "celsius" });
  const withCities = freshConfig({ cities: [1, 2, 3].map((n) => ({ name: `City${n}`, latitude: n, longitude: -n })) });

  it("contiene las 8 opciones esperadas", () => {
    expect(MENU_OPTIONS.map((o) => o.key)).toEqual(["1", "2", "3", "4", "5", "6", "8", "9"]);
  });

  it("render sin ciudades", () => {
    const expected: Record<string, string> = {
      "1": "Clima de ciudad default",
      "2": "Clima de todas las ciudades (0)",
      "3": "Buscar y agregar ciudad",
      "4": "Eliminar ciudad",
      "5": "Establecer ciudad default",
      "6": "Pronóstico 7 días",
      "8": "Ajustes (°C)",
      "9": "Salir",
    };
    for (const opt of MENU_OPTIONS) {
      expect(opt.render(cfg)).toBe(expected[opt.key]!);
    }
  });

  it("render con ciudades y fahrenheit", () => {
    const f = freshConfig({ unit: "fahrenheit" });
    const map = new Map(MENU_OPTIONS.map((o) => [o.key, o.render(withCities)]));
    expect(map.get("2")).toBe("Clima de todas las ciudades (3)");
    const mapF = new Map(MENU_OPTIONS.map((o) => [o.key, o.render(f)]));
    expect(mapF.get("8")).toBe("Ajustes (°F)");
  });
});