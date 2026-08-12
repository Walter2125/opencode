# AGENTS.md

## Stack
- Runtime Bun.js + TypeScript (ESNext, `module: Preserve`, `noEmit`, `verbatimModuleSyntax`, estricto). Sin bundler/build step configurado aún.
- La app consume las APIs de OpenMeteo: geocoding (`geocoding-api.open-meteo.com/v1/search`) y luego forecast (`api.open-meteo.com/v1/forecast`). No requiere API key.
- El lenguaje de la UI y los prompts es español; mantén las cadenas orientadas al usuario en español.

## Comandos
- Instalar: `bun install`
- Ejecutar: `bun run index.ts` (Bun ejecuta TS directamente; no depender de `tsc` — `noEmit` está activo)
- No hay scripts de test, lint ni typecheck. Si se pide verificar, ejecutar `bun run index.ts` y probar el menú.

## Arquitectura / estado
- La app YA está implementada y funcional. Estructura modular bajo `src/`:
  - `types.ts` — tipos (`City`, `Config`, `Unit`, `Forecast`, `DailyForecast`) + respuestas de API.
  - `storage.ts` — `loadConfig`/`saveConfig` sobre `./weather.json` (normalización defensiva con `noUncheckedIndexedAccess`).
  - `api.ts` — `geocode` (geocoding, `count=1`, `language=es`), `getForecast` (current) y `getDailyForecast` (7 días con `daily=` + `forecast_days=7` + `timezone=auto`). Tabla WMO → español (`weatherCodeToText`).
  - `ui.ts` — helpers ANSI (`color`, `boldText`, `dimText`), `clearScreen`, `ask` (`globalThis.prompt`), `printWeather`, `printDailyForecast`. Respeta `NO_COLOR` (desactiva colores).
  - `menu.ts` — bucle principal con menú interactivo, opciones 1–6, 8, 9. Colores: cyan menú, amarillo temp, verde ok, rojo error.
- `index.ts` solo llama a `main()` desde `src/menu.ts`.
- Estado persistente en `./weather.json` (gitignoreado): defaultCity, cities[], unit. Opción 8 alterna °C/°F.
- El objetivo final es un ejecutable standalone; usar `bun build --compile` (README indica "generaremos un binario ejecutable"). Artefactos de build van a `out`/`dist` (ambos gitignoreados).

## Convenciones
- Solo ESM (`"type": "module"`); usar sintaxis `import`.
- TS estricto habilitado, incl. `noUncheckedIndexedAccess` — los accesos por índice devuelven `T | undefined`; manejar en consecuencia.
- `verbatimModuleSyntax` activo: usar `import type` para imports solo de tipos.
- UI usa códigos ANSI crudos sin libs externas. Convención de colores: cyan = menú/separadores, amarillo = temperatura, verde = ok, rojo = error. Respeta `NO_COLOR`.