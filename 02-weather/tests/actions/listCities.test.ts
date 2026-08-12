import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { listCities } from "../../src/actions/listCities.ts";
import { mockFetch, makeForecastPayload } from "../helpers/mockFetch.ts";
import { freshConfig, SAMPLE_CITY, SAMPLE_CITY_2 } from "../helpers/freshConfig.ts";
import { installSynchronousStdin } from "../helpers/mockStdin.ts";

const restores: (() => void)[] = [];

beforeEach(() => {
  restores.length = 0;
  restores.push(installSynchronousStdin());
});

afterEach(() => {
  while (restores.length) restores.pop()!();
});

function withFetch(payload: unknown) {
  const opts = mockFetch((url: string) => {
    void url;
    return { ok: true, json: async () => payload } as unknown as Response;
  });
  restores.push(opts.install());
}

describe("listCities", () => {
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

  it("muestra error y no llama a fetch si no hay ciudades", async () => {
    withFetch(makeForecastPayload(1, 1, 1));
    await listCities(freshConfig());
    expect(logs.some((l) => l.includes("No hay ciudades guardadas"))).toBe(true);
  });

  it("imprime el clima de cada ciudad", async () => {
    withFetch(makeForecastPayload(20, 10, 0));
    await listCities(freshConfig({ cities: [SAMPLE_CITY, SAMPLE_CITY_2] }));
    expect(logs.join("\n")).toContain("Madrid");
    expect(logs.join("\n")).toContain("Tokio");
  });

  it("marca '(no disponible)' si la API falla", async () => {
    const opts = mockFetch((url: string) => {
      void url;
      return { ok: false, json: async () => ({}) } as unknown as Response;
    });
    restores.push(opts.install());
    await listCities(freshConfig({ cities: [SAMPLE_CITY] }));
    expect(logs.join("\n")).toContain("(no disponible)");
  });
});