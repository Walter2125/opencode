import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { addCityAction } from "../../src/actions/addCity.ts";
import { mockFetch, makeGeocodingPayload } from "../helpers/mockFetch.ts";
import { freshConfig, SAMPLE_CITY } from "../helpers/freshConfig.ts";
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

function withFetch(payload: unknown) {
  const opts = mockFetch((url: string) => {
    void url;
    return { ok: true, json: async () => payload } as unknown as Response;
  });
  restores.push(opts.install());
}

async function withPrompt(answer: string | null) {
  const orig = globalThis.prompt;
  globalThis.prompt = (() => answer) as typeof globalThis.prompt;
  restores.push(() => {
    globalThis.prompt = orig;
  });
}

describe("addCityAction", () => {
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

  it("muestra 'Nombre vacío' si no introduce nombre", async () => {
    await withPrompt("");
    await addCityAction(freshConfig());
    expect(logs.some((l) => l.includes("Nombre vacío"))).toBe(true);
  });

  it("agrega la ciudad, guarda y confirma", async () => {
    await withPrompt("Madrid");
    withFetch(
      makeGeocodingPayload({
        name: "Madrid",
        latitude: 40.4168,
        longitude: -3.7038,
        country: "España",
      }),
    );
    const cfg = freshConfig();
    await addCityAction(cfg);
    expect(cfg.cities).toHaveLength(1);
    expect(cfg.cities[0]!.name).toBe("Madrid");
    expect(logs.join("\n")).toContain("Agregada: Madrid");
    const onDisk = await Bun.file("weather.json").json();
    expect((onDisk as { cities: unknown[] }).cities).toHaveLength(1);
  });

  it("no guarda si ya existe por coordenadas", async () => {
    await withPrompt("Madrid");
    withFetch(
      makeGeocodingPayload({
        name: "Otro",
        latitude: SAMPLE_CITY.latitude,
        longitude: SAMPLE_CITY.longitude,
      }),
    );
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    await addCityAction(cfg);
    expect(logs.join("\n")).toContain("ya está guardada");
    expect(cfg.cities).toHaveLength(1);
    expect(Bun.file("weather.json").exists()).resolves.toBe(false);
  });
});