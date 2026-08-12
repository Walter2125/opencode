export function installSynchronousStdin(): () => void {
  const originalOnce = process.stdin.once?.bind(process.stdin);
  const originalResume = process.stdin.resume?.bind(process.stdin);
  const originalPause = process.stdin.pause?.bind(process.stdin);

  process.stdin.resume = (() => {}) as typeof process.stdin.resume;
  process.stdin.pause = (() => {}) as typeof process.stdin.pause;
  process.stdin.once = (((event: string, cb: () => void) => {
    if (event === "data") cb();
    return process.stdin;
  }) as typeof process.stdin.once);

  return () => {
    if (originalOnce) process.stdin.once = originalOnce;
    if (originalResume) process.stdin.resume = originalResume;
    if (originalPause) process.stdin.pause = originalPause;
  };
}