import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function withTempCwd(): {
  cwd: string;
  cleanup: () => void;
} {
  const tmp = mkdtempSync(join(tmpdir(), "weather-test-"));
  const originalCwd = process.cwd();
  process.chdir(tmp);
  return {
    cwd: tmp,
    cleanup: () => {
      process.chdir(originalCwd);
      rmSync(tmp, { recursive: true, force: true });
    },
  };
}