import { describe, it, expect } from "bun:test";
import { color, boldText, dimText } from "../src/utils/colors.ts";

// Solo se ejecuta si NO_COLOR NO está presente en el entorno (colores activos).
// Para este modo: `bun test` (sin NO_COLOR).
describe.skipIf(process.env.NO_COLOR !== undefined)("color con ANSI", () => {
  it("envuelve con códigos ANSI", () => {
    expect(color("Hola", "red")).toBe("\x1B[31mHola\x1B[0m");
    expect(color("Hola", "cyan")).toBe("\x1B[36mHola\x1B[0m");
    expect(color("Hola", "green")).toBe("\x1B[32mHola\x1B[0m");
    expect(color("Hola", "yellow")).toBe("\x1B[33mHola\x1B[0m");
    expect(color("Hola", "gray")).toBe("\x1B[90mHola\x1B[0m");
  });

  it("boldText y dimText aplican formatos ANSI", () => {
    expect(boldText("X")).toBe("\x1B[1mX\x1B[0m");
    expect(dimText("X")).toBe("\x1B[2mX\x1B[0m");
  });
});