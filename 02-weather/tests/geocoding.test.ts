import { describe, it, expect, afterEach } from "bun:test";
import { geocode } from "../src/api/geocoding.ts";
import { GEOCODING_URL } from "../src/utils/constants.ts";
import { mockFetch, makeGeocodingPayload } from "./helpers/mockFetch.ts";

const restores: (() => void)[] = [];

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

describe("geocode", () => {
  it("devuelve la primera ciudad de los resultados", async () => {
    withFetch(
      makeGeocodingPayload({
        name: "Madrid",
        latitude: 40.4168,
        longitude: -3.7038,
        country: "España",
        admin1: "Comunidad de Madrid",
      }),
    );
    const city = await geocode("Madrid");
    expect(city).toEqual({
      name: "Madrid",
      latitude: 40.4168,
      longitude: -3.7038,
      country: "España",
      admin1: "Comunidad de Madrid",
    });
  });

  it("arma la URL con el nombre codificado", async () => {
    let url = "";
    const opts = mockFetch((u: string) => {
      url = u;
      return { ok: true, json: async () => makeGeocodingPayload({ name: "X", latitude: 0, longitude: 0 }) } as unknown as Response;
    });
    restores.push(opts.install());
    await geocode("Madrid, España");
    expect(url).toBe(
      `${GEOCODING_URL}?name=${encodeURIComponent("Madrid, España")}&count=1&language=es&format=json`,
    );
  });

  it("devuelve null si no hay resultados", async () => {
    withFetch({ results: [] });
    expect(await geocode("Unknown")).toBeNull();
  });

  it("devuelve null si la respuesta no es ok", async () => {
    withFetch({}, false);
    expect(await geocode("Madrid")).toBeNull();
  });

  it("propaga el error si fetch lanza", async () => {
    const opts = mockFetch(() => {
      throw new Error("network");
    });
    restores.push(opts.install());
    await expect(geocode("Madrid")).rejects.toThrow("network");
  });
});