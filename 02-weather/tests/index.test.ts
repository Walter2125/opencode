import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { loop, DISPATCH } from "../src/index.ts";
import { freshConfig } from "./helpers/freshConfig.ts";
import { installSynchronousStdin } from "./helpers/mockStdin.ts";

const restores: (() => void)[] = [];

beforeEach(() => {
  restores.length = 0;
  restores.push(installSynchronousStdin());
});

afterEach(() => {
  while (restores.length) restores.pop()!();
});

describe("DISPATCH", () => {
  it("mapea las claves 1-6, 8 a funciones", () => {
    expect(DISPATCH["1"]).toBeTypeOf("function");
    expect(DISPATCH["2"]).toBeTypeOf("function");
    expect(DISPATCH["3"]).toBeTypeOf("function");
    expect(DISPATCH["4"]).toBeTypeOf("function");
    expect(DISPATCH["5"]).toBeTypeOf("function");
    expect(DISPATCH["6"]).toBeTypeOf("function");
    expect(DISPATCH["8"]).toBeTypeOf("function");
  });

  it("no tiene opción 7 ni 9 en el dispatch (9 es salir)", () => {
    expect(DISPATCH["7"]).toBeUndefined();
    expect(DISPATCH["9"]).toBeUndefined();
  });
});

describe("loop", () => {
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

  it("termina con la opción 9", async () => {
    const orig = globalThis.prompt;
    globalThis.prompt = (() => "9") as typeof globalThis.prompt;
    restores.push(() => {
      globalThis.prompt = orig;
    });
    await loop(freshConfig());
    expect(logs.join("\n")).toContain("¡Hasta pronto!");
  });

  it("muestra 'Opción no válida' y continúa con opción desconocida antes de 9", async () => {
    const queue = ["7", "9"];
    const orig = globalThis.prompt;
    globalThis.prompt = (() => queue.shift() ?? "") as typeof globalThis.prompt;
    restores.push(() => {
      globalThis.prompt = orig;
    });
    await loop(freshConfig());
    expect(logs.join("\n")).toContain("Opción no válida");
    expect(logs.join("\n")).toContain("¡Hasta pronto!");
  });

  it("ejecuta la acción 1 (getWeather) y luego termina con 9", async () => {
    const queue = ["1", "9"];
    const orig = globalThis.prompt;
    globalThis.prompt = (() => queue.shift() ?? "") as typeof globalThis.prompt;
    restores.push(() => {
      globalThis.prompt = orig;
    });
    // Sin default: la acción 1 no requiere fetch → no toca la red.
    const cfg = freshConfig();
    await loop(cfg);
    const joined = logs.join("\n");
    expect(joined).toContain("No hay ciudad default");
    expect(joined).toContain("¡Hasta pronto!");
  });
});