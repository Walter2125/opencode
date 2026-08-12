import { describe, it, expect, afterEach } from "bun:test";
import { ask, waitForKey } from "../src/presentation/input.ts";

describe("ask", () => {
  let originalPrompt: typeof globalThis.prompt;

  afterEach(() => {
    globalThis.prompt = originalPrompt;
  });

  it("devuelve el valor introducido", () => {
    originalPrompt = globalThis.prompt;
    globalThis.prompt = (() => "Madrid") as typeof globalThis.prompt;
    expect(ask("Nombre: ")).toBe("Madrid");
  });

  it("devuelve string vacío si el usuario cancela (null)", () => {
    originalPrompt = globalThis.prompt;
    globalThis.prompt = (() => null) as typeof globalThis.prompt;
    expect(ask("Nombre: ")).toBe("");
  });
});

describe("waitForKey", () => {
  const originalResume = process.stdin.resume;
  const originalOnce = process.stdin.once;
  const originalPause = process.stdin.pause;

  afterEach(() => {
    process.stdin.resume = originalResume;
    process.stdin.once = originalOnce;
    process.stdin.pause = originalPause;
  });

  it("se resuelve tras recibir 'data'", async () => {
    process.stdin.resume = (() => {}) as typeof process.stdin.resume;
    process.stdin.pause = (() => {}) as typeof process.stdin.pause;
    process.stdin.once = ((event: string, cb: () => void) => {
      if (event === "data") cb();
      return process.stdin;
    }) as typeof process.stdin.once;

    await expect(waitForKey()).resolves.toBeUndefined();
  });
});