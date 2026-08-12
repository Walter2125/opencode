import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { getWeather } from "../../src/actions/getWeather.ts";
import { mockFetch, makeForecastPayload } from "../helpers/mockFetch.ts";
import { freshConfig, SAMPLE_CITY } from "../helpers/freshConfig.ts";
import { installSynchronousStdin } from "../helpers/mockStdin.ts";

const restores: (() => void)[] = [];

beforeEach(() => {
  restores.length = 0;
  restores.push(installSynchronousStdin());
});

afterEach(() => {
  while (restores.length) restores.pop()!();
});

function withFetch(payload: unknown, ok = true) {
  const opts = mockFetch((url: string) => {
    void url;
    return { ok, json: async () => payload } as unknown as Response;
  });
  restores.push(opts.install());
}

describe("getWeather", () => {
  let logs: string[];

  beforeEach(() => {
    logs = [];
    const orig = console.log;
    console.log = ((...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    }) as typeof console.log;
    restores.push(() => {
      console.log = orig;
    });
  });

  it("muestra error y no llama a fetch si no hay default", async () => {
    withFetch(makeForecastPayload(1, 1, 1));
    await getWeather(freshConfig());
    expect(logs.some((l) => l.includes("No hay ciudad default"))).toBe(true);
    expect(globalThis.fetch).toBeDefined();
  });

  it("imprime el clima si hay default y la API responde", async () => {
    withFetch(makeForecastPayload(21.5, 12, 2));
    await getWeather(freshConfig({ defaultCity: SAMPLE_CITY }));
    expect(logs.some((l) => l.includes("Madrid"))).toBe(true);
    expect(logs.some((l) => l.includes("21.5 °C"))).toBe(true);
  });

  it("muestra error si la API no responde ok", async () => {
    withFetch({}, false);
    await getWeather(freshConfig({ defaultCity: SAMPLE_CITY }));
    expect(logs.some((l) => l.includes("No se pudo obtener el clima"))).toBe(true);
  });
});