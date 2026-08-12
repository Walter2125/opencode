import type { Config } from "./Config.ts";

export interface MenuOption {
  key: string;
  render: (cfg: Config) => string;
}