# Estado del desarrollo

**Última actualización:** 24/11/2026
**Fase actual:** Fase 2 completada. A la espera de autorización para la Fase 3,
que empieza confirmando las reglas de negocio, los precios y el tipo de IGIC.
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
| 2    | Tipos de TypeScript y catálogo de servicios                                  | ✅ cerrada 24/11/2026 |
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

| Comprobación                                                                             | Resultado                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acceso sin iniciar sesión (ventana de incógnito)                                         | correcto, HTTP 200                                                                                                                                                                               |
| Recursos `.js`, `.css` y `favicon.svg`                                                   | HTTP 200, y **del mismo tamaño exacto que el build local**: Vercel compiló los mismos bytes, lo que descarta de golpe los problemas de versión de Node o de dependencias resueltas de otra forma |
| Tailwind compilado en el servidor                                                        | `sr-only`, `bg-slate-900`, `grid-cols-3` y `focus-visible:outline-2` presentes en el CSS publicado                                                                                               |
| Accesibilidad en el JS publicado                                                         | `aria-pressed` y `aria-hidden` presentes                                                                                                                                                         |
| _Sourcemaps_ (`.js.map`, `.css.map`)                                                     | HTTP 404: el código fuente no queda expuesto                                                                                                                                                     |
| Documentación y configuración (`CLAUDE.md`, `docs/`, `package.json`, `src/`, `.vscode/`) | HTTP 404: no se publica nada del repositorio                                                                                                                                                     |
| Rutas sensibles (`/.git/config`, `/.git/HEAD`, `/.env`)                                  | HTTP 404                                                                                                                                                                                         |
| HTTPS y `Strict-Transport-Security`                                                      | lo sirve Vercel por defecto: `max-age=63072000; includeSubDomains; preload`                                                                                                                      |

**Hallazgo al verificar las cabeceras:** el redespliegue cambió el nombre del
CSS aunque el commit solo tocaba documentación. Tailwind 4 rastrea todos los
archivos del proyecto —incluidos los `.md`— en busca de clases, y había
compilado tres utilidades que la aplicación no usa (`.grid-cols-3`, `.filter` y
`.transform`) a partir del texto de la documentación. Corregido en
`src/index.css` con `source(none)` y dos `@source` explícitos: el CSS pasa de
11.936 a 10.189 bytes (−14,6 %) sin perder ninguna clase en uso. Ver el problema
**P6** del registro de la Fase 1.

**Verificado en producción** al final de la sesión del 24/11/2026, después del
`push` del arreglo:

| Comprobación                            | Resultado                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| CSS publicado                           | `index-HOzYXBrc.css`, **10.189 bytes**, idéntico en tamaño al build local: Vercel compiló los mismos bytes |
| Las tres utilidades sobrantes           | **desaparecidas** — la de columnas de rejilla sin variante, la de filtros y la de transformaciones         |
| Clases que la aplicación sí usa         | conservadas, comprobadas una por una, incluidas las variantes `sm:`, `lg:`, `hover:` y `focus-visible:`    |
| Cabeceras de seguridad de `vercel.json` | **4 de 4** correctas, más `Strict-Transport-Security` que añade Vercel                                     |

Queda cerrada esta comprobación: el arreglo está en producción y confirmado, no
solo subido al repositorio.

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

## Completado en la Fase 2

### Tipos del catálogo

`src/shared/types/service.ts`. `Service` es una **unión discriminada** de
`OneTimeService`, `MonthlyService` y `YearlyService`, con `payment` como
discriminante. `minMonths` existe solo en el tipo mensual, y ahí es obligatorio:
un servicio anual con meses mínimos **no compila**. Ver
[ADR 0006](docs/adr/0006-niveles-como-servicios-independientes.md).

### Catálogo de servicios

`src/shared/data/services.ts`: **12 servicios en 4 categorías**, con los precios
en céntimos y el orden de presentación declarado como dato.

| Categoría       | Servicios                                                                | Pago                    |
| --------------- | ------------------------------------------------------------------------ | ----------------------- |
| Diseño web      | Landing page de campaña, Web corporativa, Tienda online                  | único                   |
| Marketing       | SEO Básico, SEO Profesional, Gestión de redes sociales                   | mensual (mín. 6, 6 y 3) |
| Mantenimiento   | Mantenimiento Básico, Mantenimiento Premium, Actualización de contenidos | mensual (mín. 3)        |
| Infraestructura | Hosting y dominio, Correo corporativo, Migración a servidor              | anual, anual y único    |

- **Todos los precios son ficticios**, por decisión del usuario: el repositorio
  es público y las tarifas reales de su agencia no se publican. Advertido en la
  cabecera del archivo de datos y en el README.
- **Los niveles son solo datos.** SEO Básico/Profesional y Mantenimiento
  Básico/Premium son servicios independientes, sin campo «nivel» ni relación
  entre ellos. No se ha añadido ninguna regla de precio: el cálculo sigue siendo
  el del apartado 4.3.
- El catálogo permite provocar las **cuatro reglas de descuento**: 12 servicios
  (pack), 6 mensuales (permanencia) y más de 3.000 € en pago único (importe), y
  por tanto el tope del 20 %.

### Lógica y componente, con TDD

| Archivo                                               | Qué hace                                                                                                                                                            | Tests |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `shared/data/services.test.ts`                        | integridad del catálogo (ids y nombres únicos, céntimos enteros, categorías declaradas y no vacías, mínimos válidos, las tres formas de pago, el umbral de 3.000 €) | 11    |
| `features/service-catalog/buildPriceLabel.ts`         | texto del precio: `1.200,00 €`, `250,00 €/mes`, `120,00 €/año`                                                                                                      | 8     |
| `features/service-catalog/groupServicesByCategory.ts` | agrupa por categoría respetando el orden declarado                                                                                                                  | 7     |
| `features/service-catalog/ServiceCatalog.tsx`         | el catálogo en pantalla, agrupado                                                                                                                                   | 6     |

**Tres ciclos rojo-verde completos**, cada uno con su fallo comprobado antes de
implementar (`Failed to resolve import …`).

La conversión de céntimos a euros es **provisional y está en un único sitio**,
dentro de `buildPriceLabel`, marcada con un comentario. En la Fase 3 se
sustituye por el `formatEuros` probado y se borra. Nota para esa fase:
`Intl.NumberFormat` con `style: 'currency'` separa el importe del símbolo € con
un espacio irrompible (U+00A0), no con un espacio normal.

### Accesibilidad

- Jerarquía de encabezados sin saltos: **h1** (título) → **h2** (categoría) →
  **h3** (servicio). Desaparece el encabezado genérico «Servicios», porque ahora
  las secciones son las categorías.
- Cada categoría es una **región con nombre accesible** (`<section>` +
  `aria-labelledby`), de modo que un lector de pantalla pueda saltar a
  «Marketing» sin recorrer las tarjetas anteriores.
- El contador de servicios seleccionados es `aria-live="polite"`, para que el
  cambio se anuncie al marcar un servicio.
- Los tests comprueban niveles de encabezado, regiones y nombres accesibles, no
  clases de CSS.

### Seguridad

- **`.claude/settings.local.json` añadido al `.gitignore`** (petición del
  usuario). Hallazgo al comprobarlo: el archivo ya estaba ignorado, pero por el
  ignore **global** de Git de la máquina, que no viaja con el repositorio. Es el
  mismo criterio del apartado 4 de `CLAUDE.md` con los finales de línea: la
  protección tiene que estar en el repositorio. Se ignora solo el archivo local,
  no toda la carpeta, por si algún día hiciera falta un `settings.json`
  compartido del proyecto.
- El archivo contenía únicamente dos permisos de PowerShell: ni secretos ni
  datos personales. No hubo fuga.
- **Revisión de secretos sobre los 15 archivos del commit**, por categorías de
  datos: una sola coincidencia, la dirección `@users.noreply.github.com` que ya
  estaba en este archivo desde la Fase 1. Ni claves, ni tokens, ni rutas con el
  nombre de usuario, ni datos de terceros.
- **El primer barrido de esa revisión fue inválido** y dio «sin coincidencias»
  en las diez categorías: `Select-String` estaba buscando dentro de los nombres
  de archivo, no dentro de los archivos. Lo detectó el **control positivo**
  —buscar algo que se sabe que existe— y se repitió con dos herramientas
  distintas. Ver el problema **P9** del registro de la Fase 2.
- **Norma nueva en el apartado 5 de `CLAUDE.md`:** toda revisión de secretos
  incluye un control positivo, y si el control falla se repite con otra
  herramienta, no con otro intento.
- **Y la revisión se repitió una tercera vez**, porque después de la segunda se
  editaron tres archivos para documentar el problema P9. Una revisión describe
  un contenido concreto: editar algo después la invalida. Ver la corrección
  **C2-5**.

### Documentación

- [ADR 0006](docs/adr/0006-niveles-como-servicios-independientes.md): modelo de
  datos del catálogo (niveles independientes y unión discriminada).
- `docs/prompts/fase-02.md` con el registro de la fase.
- `README.md`: estructura actualizada, aviso de precios ficticios y estado.

---

## Verificaciones de la Fase 2

| Comprobación           | Resultado                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run format:check` | sin cambios pendientes                                                                              |
| `npm run lint`         | 0 errores, 0 avisos                                                                                 |
| `npm test`             | **37 de 37 en verde** (5 de la Fase 1 + 32 nuevos)                                                  |
| `npm run build`        | correcto — 224,73 kB de JS (70,64 kB comprimido) y 11,39 kB de CSS                                  |
| `tsc -b`               | sin errores, y con la garantía de tipos del catálogo comprobada en positivo con un archivo temporal |

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

---

## Pendiente y vigilado

| #   | Asunto                                                                                                              | Cuándo  |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | **Repositorio privado.** Hacerlo público tras la revisión de secretos                                               | Fase 10 |
| 2   | El favicon sigue siendo el de Vite                                                                                  | Fase 11 |
| 3   | `eslint-plugin-jsx-a11y` (reglas de accesibilidad)                                                                  | Fase 9  |
| 4   | Confirmar con el usuario los precios, el IGIC y las reglas de descuento                                             | Fase 3  |
| 5   | ~~El `Service` type y el catálogo real sustituirán los datos provisionales de `App.tsx`~~ **resuelto en la Fase 2** | —       |
| 6   | Si se regenera el andamiaje, usar `--eslint`: la plantilla ya usa Oxlint por defecto                                | —       |
| 7   | Sustituir la conversión provisional de céntimos a euros de `buildPriceLabel` por el `formatEuros` probado           | Fase 3  |
| 8   | El contador «Servicios seleccionados» es provisional: lo reemplaza el resumen del presupuesto                       | Fase 4  |

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

**Fase 3 — Lógica de negocio con TDD.** Empieza **confirmando con el usuario**
las reglas de negocio del apartado 4.3: los precios (hoy ficticios), los
porcentajes de descuento, el tope del 20 % y el tipo de IGIC. Después: formato
de euros (`formatEuros`, que sustituye la conversión provisional de la Fase 2),
subtotales, separación entre pago único, mensual y anual, y cálculo del IGIC.
Todo con TDD y con las constantes centralizadas en un único archivo.

No se inicia sin autorización expresa del usuario.

### Aviso de plazo (apartado 9 de CLAUDE.md)

A 24/11/2026, con las fases 0, 1 y 2 cerradas, quedan **4 días de desarrollo**
(25, 26, 27 y 28) para las fases 3 a 11, porque el 29 y el 30 están reservados
para las slides y el vídeo. Hacen falta unas **2 fases al día**.

El riesgo **R8** sigue abierto y es el más serio del proyecto. Si al cerrar la
Fase 4 no se ha recuperado margen, se **propondrán** recortes en el orden
preacordado: 1) Husky, 2) tests E2E extra, 3) GitHub Actions avanzado, 4)
borradores en localStorage. Nunca se recortan el cálculo del presupuesto, los
tests de la lógica de negocio, el despliegue, el README, las slides ni el vídeo.
Los recortes se proponen; no se aplican por iniciativa propia.
