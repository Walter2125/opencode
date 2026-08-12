import { describe, it, expect } from "bun:test";
import {
  isCity,
  samePlace,
  cityExists,
  addCity,
  removeCity,
  setDefaultCity,
  setUnit,
} from "../src/storage/citiesStorage.ts";
import type { City } from "../src/types/City.ts";
import { freshConfig, SAMPLE_CITY, SAMPLE_CITY_2 } from "./helpers/freshConfig.ts";

describe("isCity", () => {
  it("acepta una ciudad válida", () => {
    expect(isCity({ name: "Madrid", latitude: 40.4, longitude: -3.7 })).toBe(true);
  });

  it("acepta city sin country ni admin1", () => {
    expect(isCity({ name: "X", latitude: 0, longitude: 0 })).toBe(true);
  });

  it("rechaza null y no-objetos", () => {
    expect(isCity(null)).toBe(false);
    expect(isCity(undefined)).toBe(false);
    expect(isCity("Madrid")).toBe(false);
    expect(isCity(42)).toBe(false);
    expect(isCity([])).toBe(false);
  });

  it("rechaza objetos con campos faltantes o mal tipados", () => {
    expect(isCity({ latitude: 0, longitude: 0 })).toBe(false);
    expect(isCity({ name: "M", longitude: 0 })).toBe(false);
    expect(isCity({ name: "M", latitude: "0", longitude: 0 })).toBe(false);
    expect(isCity({ name: "M", latitude: 0, longitude: "0" })).toBe(false);
  });
});

describe("samePlace", () => {
  it("true si mismas coordenadas aunque distinto nombre", () => {
    const a: City = { name: "A", latitude: 40, longitude: -3 };
    const b: City = { name: "B", latitude: 40, longitude: -3 };
    expect(samePlace(a, b)).toBe(true);
  });

  it("false si cambia latitud o longitud", () => {
    const a: City = { name: "A", latitude: 40, longitude: -3 };
    expect(samePlace(a, { ...a, latitude: 41 })).toBe(false);
    expect(samePlace(a, { ...a, longitude: -4 })).toBe(false);
  });
});

describe("cityExists", () => {
  it("true si existe ciudad con mismas coordenadas", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    expect(cityExists(cfg, { ...SAMPLE_CITY, name: "Otro" })).toBe(true);
  });

  it("false si no existe o lista vacía", () => {
    const cfg = freshConfig();
    expect(cityExists(cfg, SAMPLE_CITY)).toBe(false);
  });
});

describe("addCity", () => {
  it("agrega la ciudad al final", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    addCity(cfg, SAMPLE_CITY_2);
    expect(cfg.cities).toHaveLength(2);
    expect(cfg.cities[1]).toEqual(SAMPLE_CITY_2);
  });
});

describe("removeCity", () => {
  it("elimina la ciudad y la devuelve", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY, SAMPLE_CITY_2] });
    const removed = removeCity(cfg, 0);
    expect(removed).toEqual(SAMPLE_CITY);
    expect(cfg.cities).toEqual([SAMPLE_CITY_2]);
  });

  it("limpiar defaultCity si se elimina la default", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY], defaultCity: SAMPLE_CITY });
    removeCity(cfg, 0);
    expect(cfg.defaultCity).toBeNull();
  });

  it("no toca defaultCity si se elimina otra ciudad", () => {
    const cfg = freshConfig({
      cities: [SAMPLE_CITY, SAMPLE_CITY_2],
      defaultCity: SAMPLE_CITY,
    });
    removeCity(cfg, 1);
    expect(cfg.defaultCity).toEqual(SAMPLE_CITY);
    expect(cfg.cities).toHaveLength(1);
  });

  it("devuelve undefined y deja la lista intacta si índice fuera de rango", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    expect(removeCity(cfg, 5)).toBeUndefined();
    expect(removeCity(cfg, -1)).toBeUndefined();
    expect(cfg.cities).toEqual([SAMPLE_CITY]);
  });
});

describe("setDefaultCity", () => {
  it("establece default y no duplica si ya existe por coordinadas", () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    setDefaultCity(cfg, { ...SAMPLE_CITY, name: "Variante" });
    expect(cfg.defaultCity).toEqual({ ...SAMPLE_CITY, name: "Variante" });
    expect(cfg.cities).toHaveLength(1);
  });

  it("agrega la ciudad si no estaba guardada", () => {
    const cfg = freshConfig();
    setDefaultCity(cfg, SAMPLE_CITY);
    expect(cfg.defaultCity).toEqual(SAMPLE_CITY);
    expect(cfg.cities).toEqual([SAMPLE_CITY]);
  });
});

describe("setUnit", () => {
  it("cambia la unidad", () => {
    const cfg = freshConfig();
    setUnit(cfg, "fahrenheit");
    expect(cfg.unit).toBe("fahrenheit");
  });
});