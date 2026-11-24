# ADR 0001 — Stack: React + TypeScript + Vite + Tailwind CSS

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 1

## Contexto

Hay que elegir las herramientas de una aplicación web de una sola página que
calcula presupuestos en el navegador, sin servidor. Es un Trabajo Final de Máster
con un plazo corto, y el proyecto se evalúa tanto por funcionar como por cómo
está construido. El usuario conoce JavaScript, CSS y PHP, pero no React ni
TypeScript.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **React + TypeScript + Vite + Tailwind** | Pila estándar del mercado; Vite arranca y recompila en milisegundos; TypeScript detecta errores de cálculo en tiempo de escritura; Tailwind evita escribir CSS a mano | Tres herramientas nuevas que el usuario debe aprender a la vez |
| JavaScript sin TypeScript | Una herramienta menos que aprender | En una aplicación cuyo núcleo es aritmética con dinero, los tipos son justo donde más protegen. Un `undefined` silencioso en un importe es un error que el usuario vería tarde |
| Next.js | Más completo | Aporta servidor, rutas y renderizado en servidor que aquí no se usan. El prompt maestro lo excluye expresamente |
| CSS propio o CSS Modules | Control total | Más tiempo en estilos, que no es donde este proyecto se evalúa |

## Decisión

Se usa **React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4**, tal como fija el
apartado 3 del prompt maestro.

El proyecto se genera con la plantilla oficial `react-ts` de `create-vite`, sin
modificar sus versiones: cualquier incompatibilidad entre React, TypeScript y
ESLint ya está resuelta por quien mantiene la plantilla.

`strict` de TypeScript queda **declarado explícitamente** en
`tsconfig.app.json`, aunque TypeScript 6 ya lo active por defecto: la calidad del
proyecto no debe depender de un valor por defecto que ha cambiado entre versiones
mayores del compilador.

## Consecuencias

- Se gana comprobación de tipos en toda la lógica de cálculo, que es el núcleo
  funcional del proyecto.
- Hay una curva de aprendizaje. Se compensa explicando cada paso, conforme al
  apartado 8 del prompt maestro.
- Tailwind 4 se configura **desde el propio CSS** (`@import 'tailwindcss'`) y no
  genera `tailwind.config.js`. Los tutoriales anteriores a la versión 4 no
  coinciden con lo que hay en el repositorio.
- Al no haber servidor, el despliegue es de archivos estáticos: cualquier
  proveedor sirve, y el coste es cero.
