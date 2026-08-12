import { describe, it, expect } from "bun:test";
import type { Config } from "../src/types/Config.ts";
import { loadConfig, saveConfig, normalizeConfig } from "../src/storage/settingsStorage.ts";
import { withTempCwd } from "./helpers/tempCwd.ts";
import { SAMPLE_CITY, SAMPLE_CITY_2 } from "./helpers/freshConfig.ts";

describe("normalizeConfig", () => {
  it("no-objeto o null devuelve el default", () => {
    expect(normalizeConfig(null)).toEqual({ defaultCity: null, cities: [], unit: "celsius" });
    expect(normalizeConfig("x")).toEqual({ defaultCity: null, cities: [], unit: "celsius" });
    expect(normalizeConfig(42)).toEqual({ defaultCity: null, cities: [], unit: "celsius" });
  });

  it("unidad se coacciona a celsius salvo fahrenheit exacto", () => {
    expect(normalizeConfig({ unit: "fahrenheit" }).unit).toBe("fahrenheit");
    expect(normalizeConfig({ unit: "celsius" }).unit).toBe("celsius");
    expect(normalizeConfig({ unit: "kelvin" }).unit).toBe("celsius");
    expect(normalizeConfig({}).unit).toBe("celsius");
  });

  it("filtra ciudades inválidas con isCity", () => {
    const raw = {
      cities: [SAMPLE_CITY, { name: "Bad", latitude: "nope" }, null, SAMPLE_CITY_2],
      defaultCity: SAMPLE_CITY,
      unit: "celsius",
    };
    expect(normalizeConfig(raw).cities).toEqual([SAMPLE_CITY, SAMPLE_CITY_2]);
  });

  it("defaultCity null si no es city válida", () => {
    expect(normalizeConfig({ defaultCity: { name: "X" } }).defaultCity).toBeNull();
    expect(normalizeConfig({ defaultCity: null }).defaultCity).toBeNull();
  });
});

describe("loadConfig / saveConfig (fs)", () => {
  it("round-trip: saveConfig luego loadConfig devuelve el mismo config", async () => {
    const tmp = withTempCwd();
    try {
      const cfg: Config = { defaultCity: SAMPLE_CITY, cities: [SAMPLE_CITY], unit: "fahrenheit" };
      await saveConfig(cfg);
      const loaded = await loadConfig();
      expect(loaded).toEqual(cfg);
    } finally {
      tmp.cleanup();
    }
  });

  it("loadConfig devuelve default si el archivo no existe", async () => {
    const tmp = withTempCwd();
    try {
      expect(await loadConfig()).toEqual({ defaultCity: null, cities: [], unit: "celsius" });
    } finally {
      tmp.cleanup();
    }
  });

  it("loadConfig devuelve default si el archivo está corrupto", async () => {
    const tmp = withTempCwd();
    try {
      await Bun.write("weather.json", "no es json");
      expect(await loadConfig()).toEqual({ defaultCity: null, cities: [], unit: "celsius" });
    } finally {
      tmp.cleanup();
    }
  });

  it("loadConfig normaliza campos parciales", async () => {
    const tmp = withTempCwd();
    try {
      await Bun.write("weather.json", JSON.stringify({ unit: "kelvin", cities: [SAMPLE_CITY, "bad"] }));
      const cfg = await loadConfig();
      expect(cfg.unit).toBe("celsius");
      expect(cfg.cities).toEqual([SAMPLE_CITY]);
    } finally {
      tmp.cleanup();
    }
  });
});