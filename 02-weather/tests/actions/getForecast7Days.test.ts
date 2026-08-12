import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { getForecast7Days } from "../../src/actions/getForecast7Days.ts";
import { mockFetch, makeDailyPayload } from "../helpers/mockFetch.ts";
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

function sampleDaily() {
  return makeDailyPayload([
    { date: "2026-08-12", wc: 1, max: 25, min: 15, precip: 10 },
    { date: "2026-08-13", wc: 3, max: 22, min: 14, precip: 40 },
  ]);
}

describe("getForecast7Days", () => {
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
    withFetch(sampleDaily());
    await getForecast7Days(freshConfig());
    expect(logs.some((l) => l.includes("No hay ciudad default"))).toBe(true);
  });

  it("imprime el pronóstico de 7 días si hay default", async () => {
    withFetch(sampleDaily());
    await getForecast7Days(freshConfig({ defaultCity: SAMPLE_CITY }));
    const joined = logs.join("\n");
    expect(joined).toContain("Madrid");
    expect(joined).toContain("2026-08-12");
  });

  it("muestra error si la API falla", async () => {
    withFetch({}, false);
    await getForecast7Days(freshConfig({ defaultCity: SAMPLE_CITY }));
    expect(logs.join("\n")).toContain("No se pudo obtener el pronóstico");
  });
});