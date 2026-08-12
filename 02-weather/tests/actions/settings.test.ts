import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { settings } from "../../src/actions/settings.ts";
import { freshConfig } from "../helpers/freshConfig.ts";
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

describe("settings", () => {
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

  it("cambia a fahrenheit y guarda con opción 2", async () => {
    await withPrompt("2");
    const cfg = freshConfig();
    await settings(cfg);
    expect(cfg.unit).toBe("fahrenheit");
    expect(logs.join("\n")).toContain("Unidad guardada: °F");
    const onDisk = await Bun.file("weather.json").json();
    expect((onDisk as { unit: string }).unit).toBe("fahrenheit");
  });

  it("cambia a celsius con opción 1", async () => {
    await withPrompt("1");
    const cfg = freshConfig({ unit: "fahrenheit" });
    await settings(cfg);
    expect(cfg.unit).toBe("celsius");
    expect(logs.join("\n")).toContain("Unidad guardada: °C");
  });

  it("cancela sin guardar si la opción no es válida", async () => {
    await withPrompt("3");
    const cfg = freshConfig();
    await settings(cfg);
    expect(cfg.unit).toBe("celsius");
    expect(logs.join("\n")).not.toContain("Unidad guardada");
  });

  it("cancela sin guardar si pulsa Enter", async () => {
    await withPrompt("");
    const cfg = freshConfig();
    await settings(cfg);
    expect(cfg.unit).toBe("celsius");
    expect(Bun.file("weather.json").exists()).resolves.toBe(false);
  });
});