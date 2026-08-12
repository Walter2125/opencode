export function ask(message: string): string {
  const v = globalThis.prompt(message);
  return v ?? "";
}

export function waitForKey(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.resume?.();
    process.stdin.once?.("data", () => {
      process.stdin.pause?.();
      resolve();
    });
  });
}