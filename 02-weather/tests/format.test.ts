import { describe, it, expect } from "bun:test";
import { unitSymbol, formatCityLabel, pad } from "../src/utils/format.ts";
import type { City } from "../src/types/City.ts";

describe("unitSymbol", () => {
  it("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });
  it("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("formatCityLabel", () => {
  it("solo nombre si no hay admin1 ni country", () => {
    const c: City = { name: "Madrid", latitude: 0, longitude: 0 };
    expect(formatCityLabel(c)).toBe("Madrid");
  });
  it("nombre + admin1 sin country", () => {
    const c: City = {
      name: "Madrid",
      latitude: 0,
      longitude: 0,
      admin1: "Comunidad de Madrid",
    };
    expect(formatCityLabel(c)).toBe("Madrid, Comunidad de Madrid");
  });
  it("nombre + country sin admin1", () => {
    const c: City = { name: "Madrid", latitude: 0, longitude: 0, country: "España" };
    expect(formatCityLabel(c)).toBe("Madrid, España");
  });
  it("nombre + admin1 + country", () => {
    const c: City = {
      name: "Madrid",
      latitude: 0,
      longitude: 0,
      admin1: "Comunidad de Madrid",
      country: "España",
    };
    expect(formatCityLabel(c)).toBe("Madrid, Comunidad de Madrid, España");
  });
});

describe("pad", () => {
  it("rellena texto plano hasta el ancho", () => {
    const result = pad("hola", 8);
    expect(result).toBe("hola    ");
    expect(result.length).toBe(8);
  });
  it("no recorta si el texto ya es más largo que width", () => {
    expect(pad("holamundo", 4)).toBe("holamundo");
  });
  it("no modifica texto si width igual a longitud visible", () => {
    expect(pad("hola", 4)).toBe("hola");
  });
  it("cuenta ancho visible ignorando secuencias ANSI", () => {
    const ansi = "\x1B[31mhola\x1B[0m";
    const result = pad(ansi, 8);
    expect(result).toBe(`${ansi}    `);
    expect(result.length).toBe(ansi.length + 4);
  });
  it("no rellena si visible ya > width pese a ANSI", () => {
    const ansi = "\x1B[31mholamundo\x1B[0m";
    expect(pad(ansi, 4)).toBe(ansi);
  });
});