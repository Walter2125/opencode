import { describe, it, expect } from "bun:test";
import { color, boldText, dimText } from "../src/utils/colors.ts";

// Solo se ejecuta si NO_COLOR está presente en el entorno (colores desactivados).
// Para este modo: `NO_COLOR=1 bun test`.
describe.skipIf(process.env.NO_COLOR === undefined)("color sin ANSI (NO_COLOR)", () => {
  it("devuelve el texto sin códigos ANSI", () => {
    expect(color("Hola", "red")).toBe("Hola");
    expect(color("Hola", "cyan")).toBe("Hola");
  });

  it("boldText y dimText devuelven el texto plano", () => {
    expect(boldText("X")).toBe("X");
    expect(dimText("X")).toBe("X");
  });
});