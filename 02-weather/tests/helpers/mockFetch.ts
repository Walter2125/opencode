import type { ForecastResponse, DailyForecastResponse, GeocodingResponse } from "../../src/types/Weather.ts";

type FetchImpl = typeof globalThis.fetch;

export function mockFetchResponse(payload: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => payload,
  } as unknown as Response;
}

export function mockFetch(impl: (url: string) => Response | Promise<Response>): {
  install: () => () => void;
} {
  const fn: FetchImpl = ((url: string) => Promise.resolve(impl(url))) as FetchImpl;
  return {
    install: () => {
      const original = globalThis.fetch;
      globalThis.fetch = fn;
      return () => {
        globalThis.fetch = original;
      };
    },
  };
}

export function makeForecastPayload(
  temperature: number,
  windSpeed: number,
  weatherCode: number,
): ForecastResponse {
  return { current: { temperature_2m: temperature, wind_speed_10m: windSpeed, weather_code: weatherCode } };
}

export function makeDailyPayload(days: {
  date: string;
  wc: number;
  max: number;
  min: number;
  precip: number;
}[]): DailyForecastResponse {
  return {
    daily: {
      time: days.map((d) => d.date),
      weather_code: days.map((d) => d.wc),
      temperature_2m_max: days.map((d) => d.max),
      temperature_2m_min: days.map((d) => d.min),
      precipitation_probability_max: days.map((d) => d.precip),
    },
  };
}

export function makeGeocodingPayload(city: {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}): GeocodingResponse {
  return { results: [city] };
}