import { describe, it, expect } from "bun:test";
import { weatherCodeToText } from "../src/api/weather.ts";

const KNOWN: Record<number, string> = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia helada ligera",
  67: "Lluvia helada fuerte",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve fuerte",
  77: "Granos de nieve",
  80: "Aguaceros ligeros",
  81: "Aguaceros moderados",
  82: "Aguaceros violentos",
  85: "Aguaceros de nieve ligeros",
  86: "Aguaceros de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo fuerte",
};

describe("weatherCodeToText", () => {
  it.each(Object.entries(KNOWN))("mapea el código %s", (code, desc) => {
    expect(weatherCodeToText(Number(code))).toBe(desc);
  });

  it("devuelve mensaje por defecto para código desconocido", () => {
    expect(weatherCodeToText(999)).toBe("Código desconocido");
  });

  it("devuelve mensaje por defecto para código negativo", () => {
    expect(weatherCodeToText(-5)).toBe("Código desconocido");
  });
});