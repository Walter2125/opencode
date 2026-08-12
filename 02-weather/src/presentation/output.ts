import type { City } from "../types/City.ts";
import type { DailyForecast, Forecast, Unit } from "../types/Weather.ts";
import { weatherCodeToText } from "../api/weather.ts";
import { color, boldText, dimText } from "../utils/colors.ts";
import { formatCityLabel, pad, unitSymbol } from "../utils/format.ts";
import { SEP } from "../utils/constants.ts";

export function clearScreen(): void {
  process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
}

export function printSeparator(): void {
  console.log(color(SEP, "cyan"));
}

export function printWeather(
  city: City,
  forecast: Forecast,
  unit: Unit,
): void {
  const symbol = unitSymbol(unit);
  const label = formatCityLabel(city);
  const desc = weatherCodeToText(forecast.weatherCode);
  const temp = color(`${forecast.temperature.toFixed(1)} ${symbol}`, "yellow");
  console.log(`${label} — ${temp} · ${desc} · viento ${forecast.windSpeed.toFixed(0)} km/h`);
}

export function printDailyForecast(
  city: City,
  daily: DailyForecast[],
  unit: Unit,
): void {
  const symbol = unitSymbol(unit);
  const label = formatCityLabel(city);
  console.log(boldText(color(`${label} — próximos 7 días`, "cyan")));
  console.log(dimText("─────────────────────────────────────────────"));
  const header = [
    pad("Fecha", 12),
    pad("Máx", 7),
    pad("Mín", 7),
    pad("Clima", 22),
    "Precip",
  ].join("  ");
  console.log(dimText(header));
  for (const d of daily) {
    const desc = weatherCodeToText(d.weatherCode);
    const max = color(`${d.tempMax.toFixed(0)}${symbol}`, "yellow");
    const min = color(`${d.tempMin.toFixed(0)}${symbol}`, "gray");
    const line = [
      pad(d.date, 12),
      pad(max, 7),
      pad(min, 7),
      pad(desc, 22),
      `${d.precipProb.toFixed(0)}%`,
    ].join("  ");
    console.log(line);
  }
}