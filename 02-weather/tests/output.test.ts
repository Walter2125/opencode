import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { clearScreen, printSeparator, printWeather, printDailyForecast } from "../src/presentation/output.ts";
import { SAMPLE_CITY } from "./helpers/freshConfig.ts";

describe("output", () => {
  let captured: string[];
  let originalLog: typeof console.log;
  let originalWrite: typeof process.stdout.write;

  beforeEach(() => {
    captured = [];
    originalLog = console.log;
    originalWrite = process.stdout.write;
    console.log = ((input?: unknown) => {
      captured.push(String(input ?? ""));
    }) as typeof console.log;
    process.stdout.write = (((input?: unknown) => {
      captured.push(String(input ?? ""));
      return true;
    }) as unknown) as typeof process.stdout.write;
  });

  afterEach(() => {
    console.log = originalLog;
    process.stdout.write = originalWrite;
  });

  it("clearScreen escribe la secuencia de limpieza", () => {
    clearScreen();
    expect(captured).toEqual(["\x1B[2J\x1B[3J\x1B[H"]);
  });

  it("printSeparator imprime el separador en cyan", () => {
    printSeparator();
    const line = captured[0];
    expect(line).toContain("═");
    if (process.env.NO_COLOR === undefined) {
      expect(line).toContain("\x1B[36m");
    }
  });

  it("printWeather imprime etiqueta + temperatura + descripción + viento", () => {
    printWeather(SAMPLE_CITY, { temperature: 21.52, windSpeed: 12.3, weatherCode: 2 }, "celsius");
    const line = captured[0];
    expect(line).toContain("Madrid");
    expect(line).toContain("21.5 °C");
    expect(line).toContain("Parcialmente nublado");
    expect(line).toContain("viento 12 km/h");
  });

  it("printWeather usa °F cuando la unidad es fahrenheit", () => {
    printWeather(SAMPLE_CITY, { temperature: 70, windSpeed: 5, weatherCode: 0 }, "fahrenheit");
    expect(captured[0]).toContain("70.0 °F");
  });

  it("printDailyForecast imprime título + cabecera + filas por día", () => {
    const daily = [
      { date: "2026-08-12", weatherCode: 1, tempMax: 25, tempMin: 15, precipProb: 10 },
      { date: "2026-08-13", weatherCode: 3, tempMax: 22, tempMin: 14, precipProb: 40 },
    ];
    printDailyForecast(SAMPLE_CITY, daily, "celsius");
    const joined = captured.join("\n");
    expect(joined).toContain("Madrid");
    expect(joined).toContain("próximos 7 días");
    expect(joined).toContain("Fecha");
    expect(joined).toContain("Precip");
    expect(joined).toContain("2026-08-12");
    expect(joined).toContain("25°C");
    expect(joined).toContain("10%");
    expect(captured).toHaveLength(3 + daily.length);
  });
});