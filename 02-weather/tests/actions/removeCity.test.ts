import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { removeCityAction } from "../../src/actions/removeCity.ts";
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

async function withPrompt(answer: string | null) {
  const orig = globalThis.prompt;
  globalThis.prompt = (() => answer) as typeof globalThis.prompt;
  restores.push(() => {
    globalThis.prompt = orig;
  });
}

describe("removeCityAction", () => {
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

  it("muestra error si no hay ciudades", async () => {
    await withPrompt("1");
    await removeCityAction(freshConfig());
    expect(logs.some((l) => l.includes("No hay ciudades guardadas"))).toBe(true);
  });

  it("cancela sin borrar si introduce 0 o inválido", async () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    await withPrompt("0");
    await removeCityAction(cfg);
    expect(cfg.cities).toHaveLength(1);
    expect(logs.some((l) => l.includes("Eliminada"))).toBe(false);
  });

  it("elimina la ciudad elegida y guarda", async () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY, SAMPLE_CITY_2] });
    await withPrompt("1");
    await removeCityAction(cfg);
    expect(cfg.cities).toEqual([SAMPLE_CITY_2]);
    expect(logs.join("\n")).toContain("Eliminada: Madrid");
    const onDisk = await Bun.file("weather.json").json();
    expect((onDisk as { cities: unknown[] }).cities).toHaveLength(1);
  });

  it("muestra error si el índice está fuera de rango", async () => {
    const cfg = freshConfig({ cities: [SAMPLE_CITY] });
    await withPrompt("9");
    await removeCityAction(cfg);
    expect(logs.join("\n")).toContain("Índice fuera de rango");
    expect(cfg.cities).toHaveLength(1);
  });
});