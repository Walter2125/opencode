import type { City } from "../types/City.ts";
import type { GeocodingResponse } from "../types/Weather.ts";
import { GEOCODING_URL } from "../utils/constants.ts";

export async function geocode(name: string): Promise<City | null> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GeocodingResponse;
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country,
    admin1: first.admin1,
  };
}