import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { setDefaultCityAction } from "../../src/actions/setDefaultCity.ts";
import { mockFetch, makeGeocodingPayload } from "../helpers/mockFetch.ts";
import { freshConfig, SAMPLE_CITY, SAMPLE_CITY_2 } from "../helpers/freshConfig.ts";
import { installSynchronousStdin } from "../helpers/mockStdin.ts";
import { withTempCwd } from "../helpers/tempCwd.ts";

const restores: (() => void)[] = [];
let tmpCwd: { cleanup: () => void } | null = null;

beforeEach(() => {
  restores.length = 0;
  restores.push(installSynchronousStdin());
  tmpCwd?.cleanup();
  tmpCwd = withTempCwd();
});

afterEach(() => {
  while (restores.length) restores.pop()!();
  tmpCwd?.cleanup();
  tmpCwd = null;
});

function makePromptQueue(...answers: string[]) {
  const queue = [...answers];
  const orig = globalThis.prompt;
  globalThis.prompt = (() => queue.shift() ?? "") as typeof globalThis.prompt;
  restores.push(() => {
    globalThis.prompt = orig;
  });
}

function withFetch(payload: unknown) {
  const opts = mockFetch((url: string) => {
    void url;
    return { ok: true, json: async () => payload } as unknown as Response;
  });
  restores.push(opts.install());
}

describe("setDefaultCityAction", () => {
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

  it("cancela silenciosamente con sub-opción no válida", async () => {
    makePromptQueue("x");
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    await setDefaultCityAction(cfg);
    expect(cfg.defaultCity).toBeNull();
  });

  it("vía 'a' establece default desde ciudades guardadas y guarda", async () => {
    makePromptQueue("a", "1");
    const cfg = freshConfig({ cities: [SAMPLE_CITY, SAMPLE_CITY_2] });
    await setDefaultCityAction(cfg);
    expect(cfg.defaultCity).toEqual(SAMPLE_CITY);
    expect(logs.join("\n")).toContain("Default: Madrid");
    const onDisk = await Bun.file("weather.json").json();
    expect((onDisk as { defaultCity: { name: string } }).defaultCity.name).toBe("Madrid");
  });

  it("vía 'a' muestra error si no hay ciudades guardadas", async () => {
    makePromptQueue("a");
    await setDefaultCityAction(freshConfig());
    expect(logs.join("\n")).toContain("No hay ciudades guardadas");
  });

  it("vía 'a' muestra error si el índice está fuera de rango", async () => {
    makePromptQueue("a", "99");
    await setDefaultCityAction(freshConfig({ cities: [SAMPLE_CITY] }));
    expect(logs.join("\n")).toContain("Índice fuera de rango");
    expect(tmpCwd).not.toBeNull();
    expect(Bun.file("weather.json").exists()).resolves.toBe(false);
  });

  it("vía 'b' busca, establece default y guarda", async () => {
    makePromptQueue("b", "Madrid");
    withFetch(
      makeGeocodingPayload({
        name: "Madrid",
        latitude: 40.4168,
        longitude: -3.7038,
        country: "España",
      }),
    );
    const cfg = freshConfig();
    await setDefaultCityAction(cfg);
    expect(cfg.defaultCity).not.toBeNull();
    expect(cfg.cities).toHaveLength(1);
    expect(logs.join("\n")).toContain("Default: Madrid");
  });

  it("vía 'b' muestra error si no encuentra la ciudad", async () => {
    makePromptQueue("b", "NotFound");
    withFetch({ results: [] });
    await setDefaultCityAction(freshConfig());
    expect(logs.join("\n")).toContain("No se encontró");
  });
});