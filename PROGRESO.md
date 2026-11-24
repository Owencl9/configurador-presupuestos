# Estado del desarrollo

**Última actualización:** 24/11/2026
**Fase actual:** Fase 1 completada y publicada en GitHub. A la espera de
autorización para el despliegue en Vercel y para la Fase 2.
**Repositorio:** https://github.com/Owencl9/configurador-presupuestos
(**privado** hasta la Fase 10)
**Aplicación desplegada:** https://configurador-presupuestos.vercel.app
(**pública**, como exige la entrega)
**Entrega:** 30/11/2026 — días 29 y 30 reservados para slides y vídeo.

---

## Fases

| Fase | Contenido                                                                    | Estado                |
| ---- | ---------------------------------------------------------------------------- | --------------------- |
| 0    | Preparación del entorno                                                      | ✅ cerrada 23/11/2026 |
| 1    | Proyecto inicial, Tailwind, Vitest, Git y `ServiceCard` con TDD              | ✅ cerrada 24/11/2026 |
| —    | **Despliegue adelantado en Vercel** (decisión del apartado 9.2 de la Fase 0) | ✅ hecho 24/11/2026   |
| 2    | Tipos de TypeScript y catálogo de servicios                                  | pendiente             |
| 3    | Lógica de negocio con TDD: formato de euros, subtotales, IGIC                | pendiente             |
| 4    | Componentes del presupuesto con TDD                                          | pendiente             |
| 5    | Estado con Context + useReducer y borradores en localStorage                 | pendiente             |
| 6    | Descuentos con patrón Strategy                                               | pendiente             |
| 7    | Formulario de cliente y documento imprimible                                 | pendiente             |
| 8    | Tests E2E con Playwright                                                     | pendiente             |
| 9    | Calidad: accesibilidad, cobertura, Husky, GitHub Actions                     | pendiente             |
| 10   | Revisión de secretos, repositorio público, Dependabot, cabeceras             | pendiente             |
| 11   | README final, ADR revisados, slides y guion del vídeo                        | pendiente             |

---

## Completado en la Fase 1

### Proyecto y herramientas

- Proyecto generado con la plantilla oficial `react-ts` de `create-vite` 9.3.4,
  en una carpeta temporal vacía y copiado después a la raíz, para no poner en
  riesgo `docs/` en ningún momento.
- Dependencias instaladas: React 19.3.1, TypeScript 6.0.3, Vite 8.3.8,
  Tailwind 4.3.5, Vitest 5.1.1, Testing Library, ESLint 10.15.0, Prettier 3.10.1.
- `npm audit`: **0 vulnerabilidades**.
- Tailwind 4 integrado con `@tailwindcss/vite` y `@import 'tailwindcss'`.
  No hay `tailwind.config.js`: la versión 4 se configura desde el CSS.
- Vitest configurado en `vite.config.ts` con entorno `jsdom`, archivo de
  preparación y cobertura. Solo recoge `src/**/*.test.{ts,tsx}`, para no chocar
  con los tests de Playwright de la Fase 8.
- ESLint con `eslint-config-prettier` al final de `extends`.
- Scripts de npm: `dev`, `build`, `preview`, `lint`, `format`, `format:check`,
  `test`, `test:watch`, `coverage`.
- `strict` de TypeScript declarado explícitamente, aunque TypeScript 6 ya lo
  active por defecto.
- Eliminados los recursos de demostración de la plantilla de Vite, tras
  comprobar que ningún archivo los referenciaba.

### Finales de línea en LF (tareas F1-a, F1-b y F1-c de la Fase 0)

| Tarea | Archivo                                         | Estado |
| ----- | ----------------------------------------------- | ------ |
| F1-a  | `.gitattributes` con `* text=auto eol=lf`       | ✅     |
| F1-b  | `.prettierrc.json` con `"endOfLine": "lf"`      | ✅     |
| F1-c  | `.vscode/settings.json` con `"files.eol": "\n"` | ✅     |

Riesgo **R4 cerrado**: los finales de línea ya no dependen de la configuración
de Git de la máquina.

### Seguridad

- `.gitignore` ampliado **antes del primer commit**: `.env*` con excepción de
  `.env.example`, `coverage`, informes de Playwright, `.vercel`, logs y archivos
  del sistema Windows.
- Revisada la lista completa de archivos antes del primer `git add`.
- Revisión de secretos sobre el índice: sin claves, tokens ni correos
  personales. La búsqueda genérica de direcciones de correo solo devuelve la
  dirección `@users.noreply.github.com`, que es intencionada.
- **El PDF de requisitos del máster no se versiona.** Es material docente ajeno
  y contiene datos de contacto de terceros. Retirado del índice con
  `git rm --cached` (conservado en local) y excluido en el `.gitignore`.
- **Retirado de `docs/prompts/fase-00.md` el correo de un profesor** que estaba
  escrito en texto plano. Lo encontró una búsqueda genérica de direcciones de
  correo, no la lista de archivos. Ver las correcciones C1-6 y C1-7 del registro
  de la Fase 1.
- Norma incorporada a `CLAUDE.md`: la revisión previa al commit busca
  **categorías de datos**, no archivos conocidos.
- Finales de línea verificados en el índice: 32 archivos en LF, 0 en CRLF.

### Primer componente con TDD

`src/shared/components/ServiceCard.tsx` — tarjeta de un servicio del catálogo,
puramente presentacional. **5 tests, todos en verde.** El ciclo se ejecutó
completo: test primero, verificación de que falla (`Failed to resolve import
"./ServiceCard"`), implementación mínima y comprobación en verde.

Los tests cubren el contenido mostrado, el nombre accesible del botón, la
llamada a `onToggle` y el estado `aria-pressed` en ambos sentidos.

### Git y GitHub

- `git init` en la rama `main`, con `.gitignore` y `.gitattributes` ya en su
  sitio **antes** del primer `git add`.
- Primer commit: `d4a12de`, 34 archivos, firmado como
  `Owen Carballo Lopez <360282380+Owencl9@users.noreply.github.com>`.
- Publicado en `https://github.com/Owencl9/configurador-presupuestos`,
  **repositorio privado**. Verificado que el commit remoto coincide con el local
  y que no se ha subido `node_modules`, `dist`, `coverage`, ningún `.env` ni el
  PDF interno del máster.
- Autenticación resuelta por Git Credential Manager, que ya está configurado en
  el ámbito de máquina. No fue necesario crear ningún token a mano.

### Despliegue en Vercel (adelantado, apartado 9.2 de la Fase 0)

- Desplegado en **plan Hobby**, gratuito y sin tarjeta, en
  https://configurador-presupuestos.vercel.app
- La aplicación de GitHub de Vercel tiene acceso **solo a este repositorio**
  («Only select repositories»), no a toda la cuenta.
- Redespliegue automático en cada `push` a `main`.
- Sin variables de entorno: no hay secretos que gestionar en el despliegue.
- `vercel.json` con cuatro cabeceras de seguridad: `X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options` y `Permissions-Policy`. La
  `Content-Security-Policy` se deja para la Fase 10, por ser la única que puede
  romper la página si se escribe mal.

**Verificaciones sobre la URL de producción:**

| Comprobación                                                                             | Resultado                                                                                                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Acceso sin iniciar sesión (ventana de incógnito)                                         | correcto, HTTP 200                                                                                                   |
| Recursos `.js`, `.css` y `favicon.svg`                                                   | HTTP 200, y **del mismo tamaño exacto que el build local** (221.829 y 11.877 bytes): Vercel compiló los mismos bytes |
| Tailwind compilado en el servidor                                                        | `sr-only`, `bg-slate-900`, `grid-cols-3` y `focus-visible:outline-2` presentes en el CSS publicado                   |
| Accesibilidad en el JS publicado                                                         | `aria-pressed` y `aria-hidden` presentes                                                                             |
| _Sourcemaps_ (`.js.map`, `.css.map`)                                                     | HTTP 404: el código fuente no queda expuesto                                                                         |
| Documentación y configuración (`CLAUDE.md`, `docs/`, `package.json`, `src/`, `.vscode/`) | HTTP 404: no se publica nada del repositorio                                                                         |
| Rutas sensibles (`/.git/config`, `/.git/HEAD`, `/.env`)                                  | HTTP 404                                                                                                             |
| HTTPS y `Strict-Transport-Security`                                                      | lo sirve Vercel por defecto: `max-age=63072000; includeSubDomains; preload`                                          |

**Anotado para la Fase 10:** Vercel envía `Access-Control-Allow-Origin: *` en
todas las respuestas. No supone un problema aquí —el contenido es público, no
hay sesión ni datos privados que otro sitio pueda leer— pero conviene revisarlo
al escribir la CSP.

### Documentación

- `CLAUDE.md`, `PROGRESO.md` y `README.md` creados.
- Cinco ADR en `docs/adr/`: stack, sin backend, dinero en céntimos, Strategy
  para descuentos y ESLint en lugar de Oxlint.
- `docs/prompts/fase-01.md` con el registro de la fase.
- `docs/decisiones-previas.md`: el contexto anterior al repositorio (el proyecto
  de auditor SEO descartado y el origen de la metodología).
- Ampliado el formato del registro de cada fase con correcciones del usuario,
  aprendizajes y momentos para el vídeo, para alimentar el documento final del
  TFM. Aplicado también, retroactivamente, a `docs/prompts/fase-00.md`.
  Norma recogida en el apartado 8.1 de `CLAUDE.md`.

---

## Verificaciones de la Fase 1

| Comprobación           | Resultado                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run format:check` | sin cambios pendientes                                             |
| `npm run lint`         | 0 errores, 0 avisos                                                |
| `npm test`             | 5 de 5 en verde                                                    |
| `npm run build`        | correcto — 221,82 kB de JS (69,56 kB comprimido) y 11,87 kB de CSS |
| `npm audit`            | 0 vulnerabilidades                                                 |

---

## Pendiente y vigilado

| #   | Asunto                                                                                | Cuándo  |
| --- | ------------------------------------------------------------------------------------- | ------- |
| 1   | **Repositorio privado.** Hacerlo público tras la revisión de secretos                 | Fase 10 |
| 2   | El favicon sigue siendo el de Vite                                                    | Fase 11 |
| 3   | `eslint-plugin-jsx-a11y` (reglas de accesibilidad)                                    | Fase 9  |
| 4   | Confirmar con el usuario los precios, el IGIC y las reglas de descuento               | Fase 3  |
| 5   | El `Service` type y el catálogo real sustituirán los datos provisionales de `App.tsx` | Fase 2  |
| 6   | Si se regenera el andamiaje, usar `--eslint`: la plantilla ya usa Oxlint por defecto  | —       |

### Riesgos abiertos (del inventario de la Fase 0)

| ID  | Riesgo                                        | Estado                                                                   |
| --- | --------------------------------------------- | ------------------------------------------------------------------------ |
| R3  | Secretos en un repositorio público            | abierto y vigilado — `.gitignore` en su sitio, sin secretos en el código |
| R4  | Finales de línea CRLF/LF                      | **cerrado** en la Fase 1                                                 |
| R5  | Copia de seguridad del Escritorio en OneDrive | abierto — no activarla                                                   |
| R7  | Descarga de los navegadores de Playwright     | abierto — Fase 8                                                         |
| R8  | **Plazo de entrega**                          | abierto y crítico                                                        |

---

## Siguiente paso

**Fase 2:** tipos de TypeScript, archivo de datos de servicios y catálogo
agrupado por categorías. Sustituirá los datos provisionales de `App.tsx`.

No se inicia sin autorización expresa del usuario.
