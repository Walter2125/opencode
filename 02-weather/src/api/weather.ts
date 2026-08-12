import type { City } from "../types/City.ts";
import type {
  DailyForecast,
  DailyForecastResponse,
  Forecast,
  ForecastResponse,
  Unit,
} from "../types/Weather.ts";
import { FORECAST_URL } from "../utils/constants.ts";

export async function getForecast(
  city: City,
  unit: Unit,
): Promise<Forecast | null> {
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}` +
    `&longitude=${city.longitude}` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&temperature_unit=${unit}` +
    `&wind_speed_unit=kmh`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as ForecastResponse;
  const current = data.current;
  if (!current) return null;
  if (
    typeof current.temperature_2m !== "number" ||
    typeof current.wind_speed_10m !== "number" ||
    typeof current.weather_code !== "number"
  ) {
    return null;
  }
  return {
    temperature: current.temperature_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
  };
}

export async function getDailyForecast(
  city: City,
  unit: Unit,
): Promise<DailyForecast[] | null> {
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}` +
    `&longitude=${city.longitude}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&temperature_unit=${unit}` +
    `&forecast_days=7` +
    `&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as DailyForecastResponse;
  const daily = data.daily;
  if (!daily || !daily.time) return null;
  const out: DailyForecast[] = [];
  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i];
    const wc = daily.weather_code?.[i];
    const max = daily.temperature_2m_max?.[i];
    const min = daily.temperature_2m_min?.[i];
    const precip = daily.precipitation_probability_max?.[i];
    if (
      !date ||
      typeof wc !== "number" ||
      typeof max !== "number" ||
      typeof min !== "number" ||
      typeof precip !== "number"
    ) {
      continue;
    }
    out.push({
      date,
      weatherCode: wc,
      tempMax: max,
      tempMin: min,
      precipProb: precip,
    });
  }
  return out.length === 0 ? null : out;
}

export function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna densa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada densa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia fuerte",
    66: "Lluvia helada ligera",
    67: "Lluvia helada fuerte",
    71: "Nieve ligera",
    73: "Nieve moderada",
    75: "Nieve fuerte",
    77: "Granos de nieve",
    80: "Aguaceros ligeros",
    81: "Aguaceros moderados",
    82: "Aguaceros violentos",
    85: "Aguaceros de nieve ligeros",
    86: "Aguaceros de nieve fuertes",
    95: "Tormenta",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo fuerte",
  };
  return map[code] ?? "Código desconocido";
}