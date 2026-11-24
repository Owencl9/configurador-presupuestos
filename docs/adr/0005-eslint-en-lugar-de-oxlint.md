# ADR 0005 — ESLint en lugar de Oxlint, el nuevo valor por defecto de Vite

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 1

## Contexto

Al generar el proyecto se descubrió que la plantilla `react-ts` de
`create-vite` 9 ya **no instala ESLint por defecto**: instala Oxlint, un
analizador escrito en Rust, mucho más rápido. ESLint pasa a ser una opción
explícita de la CLI:

```
--eslint / --no-eslint    use ESLint instead of Oxlint (only for React templates)
```

El apartado 3 del prompt maestro especifica ESLint, y el apartado 9 (Fase 9)
exige «ESLint con reglas de accesibilidad». Había que decidir si seguir la
especificación o el nuevo valor por defecto de la herramienta.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **ESLint (`--eslint`)** | Es lo que fija la especificación; `eslint-plugin-jsx-a11y` es el estándar de hecho para accesibilidad en JSX y es ecosistema de ESLint; la extensión de VS Code ya está instalada desde la Fase 0; `typescript-eslint` permite reglas con información de tipos | Más lento (irrelevante en un proyecto de este tamaño) |
| Oxlint (valor por defecto) | Mucho más rápido; es hacia donde se mueve el ecosistema | Su cobertura de reglas de accesibilidad es menor y no equivale a `jsx-a11y`. Cambiar la herramienta de calidad obligaría a replantear la Fase 9 completa |
| Las dos a la vez | Rapidez en local y reglas completas en CI | Dos configuraciones que mantener y dos fuentes de verdad que pueden contradecirse, para un proyecto de 11 fases y una semana de plazo |

## Decisión

Se genera el proyecto con **`--eslint`** y se usa **ESLint 10** como única
herramienta de análisis estático.

La configuración parte de la plantilla oficial (`@eslint/js`,
`typescript-eslint`, `eslint-plugin-react-hooks`,
`eslint-plugin-react-refresh`) y se le añade **`eslint-config-prettier`** al
final de la lista de `extends`, para desactivar las reglas de estilo que chocan
con Prettier. Sin eso, ESLint y Prettier se corrigen mutuamente en cada guardado.

En la Fase 9 se añadirá `eslint-plugin-jsx-a11y`.

## Consecuencias

- La Fase 9 puede ejecutarse tal como está planificada, con reglas de
  accesibilidad reales.
- La extensión de ESLint instalada en la Fase 0 marca los errores en el editor
  sin configuración adicional.
- El análisis es más lento que con Oxlint. Con este volumen de código,
  inapreciable.
- Hay que **recordar el flag `--eslint`** si alguna vez se regenera el
  andamiaje: sin él volvería Oxlint y la Fase 9 quedaría sin base.
- Decisión revisable: si el proyecto creciera y el tiempo de análisis molestase,
  Oxlint podría convivir para las comprobaciones rápidas, dejando ESLint para
  la integración continua.
