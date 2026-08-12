import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { getForecast, getDailyForecast } from "../src/api/weather.ts";
import { FORECAST_URL } from "../src/utils/constants.ts";
import { mockFetch, makeForecastPayload, makeDailyPayload } from "./helpers/mockFetch.ts";
import { SAMPLE_CITY } from "./helpers/freshConfig.ts";

const restores: (() => void)[] = [];

beforeEach(() => {
  restores.length = 0;
});

afterEach(() => {
  while (restores.length) restores.pop()!();
});

function withFetch(payload: unknown, ok = true) {
  const opts = mockFetch((url: string) => {
    void url;
    return { ok, status: ok ? 200 : 500, json: async () => payload } as unknown as Response;
  });
  restores.push(opts.install());
}

describe("getForecast", () => {
  it("devuelve el clima cuando la respuesta es válida", async () => {
    withFetch(makeForecastPayload(21.5, 12, 2));
    const f = await getForecast(SAMPLE_CITY, "celsius");
    expect(f).toEqual({ temperature: 21.5, windSpeed: 12, weatherCode: 2 });
  });

  it("arma la URL con lat, lon, current y temperature_unit", async () => {
    let url = "";
    const opts = mockFetch((u: string) => {
      url = u;
      return { ok: true, json: async () => makeForecastPayload(1, 1, 1) } as unknown as Response;
    });
    restores.push(opts.install());
    await getForecast(SAMPLE_CITY, "fahrenheit");
    expect(url).toContain(`latitude=${SAMPLE_CITY.latitude}`);
    expect(url).toContain(`longitude=${SAMPLE_CITY.longitude}`);
    expect(url).toContain("current=temperature_2m,wind_speed_10m,weather_code");
    expect(url).toContain("temperature_unit=fahrenheit");
    expect(url).toContain("wind_speed_unit=kmh");
    expect(url.startsWith(FORECAST_URL)).toBe(true);
  });

  it("devuelve null si la respuesta no es ok", async () => {
    withFetch({}, false);
    expect(await getForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });

  it("devuelve null si falta current", async () => {
    withFetch({});
    expect(await getForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });

  it("devuelve null si algún campo numérico no es number", async () => {
    withFetch({ current: { temperature_2m: "21.5", wind_speed_10m: 12, weather_code: 2 } });
    expect(await getForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });
});

describe("getDailyForecast", () => {
  it("devuelve la lista de días filtrada", async () => {
    withFetch(
      makeDailyPayload([
        { date: "2026-08-12", wc: 1, max: 25, min: 15, precip: 10 },
        { date: "2026-08-13", wc: 3, max: 22, min: 14, precip: 40 },
      ]),
    );
    const daily = await getDailyForecast(SAMPLE_CITY, "celsius");
    expect(daily).toHaveLength(2);
    expect(daily![0]).toEqual({ date: "2026-08-12", weatherCode: 1, tempMax: 25, tempMin: 15, precipProb: 10 });
  });

  it("omite días con campos incompletos o no numéricos", async () => {
    withFetch({
      daily: {
        time: ["2026-08-12", "2026-08-13", "2026-08-14"],
        weather_code: [1, undefined, 3],
        temperature_2m_max: [25, "22", 20],
        temperature_2m_min: [15, 14, 13],
        precipitation_probability_max: [10, 40, 50],
      },
    });
    const daily = await getDailyForecast(SAMPLE_CITY, "celsius");
    expect(daily).toHaveLength(2);
    expect(daily![0]!.date).toBe("2026-08-12");
    expect(daily![1]!.date).toBe("2026-08-14");
  });

  it("devuelve null si la respuesta no es ok", async () => {
    withFetch({}, false);
    expect(await getDailyForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });

  it("devuelve null si no hay daily.time", async () => {
    withFetch({ daily: undefined });
    expect(await getDailyForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });

  it("devuelve null si todos los días son inválidos", async () => {
    withFetch({
      daily: {
        time: ["2026-08-12"],
        weather_code: [undefined],
        temperature_2m_max: [null],
        temperature_2m_min: [null],
        precipitation_probability_max: [null],
      },
    });
    expect(await getDailyForecast(SAMPLE_CITY, "celsius")).toBeNull();
  });

  it("arma la URL con daily, forecast_days=7 y timezone=auto", async () => {
    let url = "";
    const opts = mockFetch((u: string) => {
      url = u;
      return { ok: true, json: async () => makeDailyPayload([]) } as unknown as Response;
    });
    restores.push(opts.install());
    await getDailyForecast(SAMPLE_CITY, "celsius");
    expect(url).toContain("daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    expect(url).toContain("forecast_days=7");
    expect(url).toContain("timezone=auto");
  });
});