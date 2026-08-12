import type { MenuOption } from "../types/MenuOption.ts";

export const SEP = "═══════════════════════════════════════";

export const CONFIG_PATH = "weather.json";

export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export const MENU_OPTIONS: MenuOption[] = [
  { key: "1", render: () => "Clima de ciudad default" },
  { key: "2", render: (c) => `Clima de todas las ciudades (${c.cities.length})` },
  { key: "3", render: () => "Buscar y agregar ciudad" },
  { key: "4", render: () => "Eliminar ciudad" },
  { key: "5", render: () => "Establecer ciudad default" },
  { key: "6", render: () => "Pronóstico 7 días" },
  { key: "8", render: (c) => `Ajustes (${c.unit === "celsius" ? "°C" : "°F"})` },
  { key: "9", render: () => "Salir" },
];