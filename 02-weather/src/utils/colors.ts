const RESET = "\x1B[0m";
const BOLD = "\x1B[1m";
const DIM = "\x1B[2m";

const COLORS: Record<string, string> = {
  cyan: "\x1B[36m",
  yellow: "\x1B[33m",
  green: "\x1B[32m",
  red: "\x1B[31m",
  gray: "\x1B[90m",
};

const COLOR_DISABLED = process.env.NO_COLOR !== undefined;

function c(text: string, color: string): string {
  if (COLOR_DISABLED) return text;
  const code = COLORS[color];
  if (!code) return text;
  return `${code}${text}${RESET}`;
}

function bold(text: string): string {
  return COLOR_DISABLED ? text : `${BOLD}${text}${RESET}`;
}

function dim(text: string): string {
  return COLOR_DISABLED ? text : `${DIM}${text}${RESET}`;
}

export function color(text: string, col: string): string {
  return c(text, col);
}

export { bold as boldText, dim as dimText };