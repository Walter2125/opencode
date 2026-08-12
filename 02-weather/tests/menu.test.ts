import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { printMenu, readMenuOption } from "../src/presentation/menu.ts";
import { freshConfig } from "./helpers/freshConfig.ts";
import { MENU_OPTIONS } from "../src/utils/constants.ts";

describe("printMenu", () => {
  let logs: string[];
  let originalLog: typeof console.log;

  beforeEach(() => {
    logs = [];
    originalLog = console.log;
    console.log = ((...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    }) as typeof console.log;
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("imprime 12 líneas: 4 separadores + título + 8 opciones", () => {
    printMenu(freshConfig({ cities: [] }));
    expect(logs).toHaveLength(4 + MENU_OPTIONS.length);
  });

  it("incluye las claves de todas las opciones", () => {
    printMenu(freshConfig());
    const joined = logs.join("\n");
    for (const opt of MENU_OPTIONS) {
      expect(joined).toContain(`  ${opt.key}.`);
    }
  });

  it("muestra el conteo de ciudades en la opción 2", () => {
    const cfg = freshConfig({ cities: [1, 2].map((n) => ({ name: `C${n}`, latitude: n, longitude: -n })) });
    printMenu(cfg);
    expect(logs.join("\n")).toContain("Clima de todas las ciudades (2)");
  });
});

describe("readMenuOption", () => {
  let originalPrompt: typeof globalThis.prompt;

  afterEach(() => {
    globalThis.prompt = originalPrompt;
  });

  it("devuelve la opción sin espacios", () => {
    originalPrompt = globalThis.prompt;
    globalThis.prompt = (() => "  3  ") as typeof globalThis.prompt;
    expect(readMenuOption()).toBe("3");
  });

  it("devuelve string vacío si no hay respuesta", () => {
    originalPrompt = globalThis.prompt;
    globalThis.prompt = (() => "") as typeof globalThis.prompt;
    expect(readMenuOption()).toBe("");
  });
});