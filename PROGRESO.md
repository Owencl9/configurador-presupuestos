# Estado del desarrollo

**Última actualización:** 28/11/2026
**Fase actual:** **Fase 11 completada. El proyecto está cerrado.** Esta fase no
ha tocado código, tests, configuración ni dependencias: solo documentación.
Entra el documento que pide el máster
—[docs/desarrollo-con-ia.md](docs/desarrollo-con-ia.md), sobre cómo se ha
desarrollado la aplicación con IA—, se ponen al día las afirmaciones de estado
que la publicación del repositorio había dejado desfasadas, y se registra el
resultado de la lista A0–C8 que el usuario ejecutó a mano el 27/11. La
aplicación sigue **funcionalmente completa** y **no ha cambiado**: siguen **560
tests de Vitest y 5 recorridos de Playwright**.
**Repositorio:** https://github.com/Owencl9/configurador-presupuestos
(**público** desde el 27/11/2026, tras la revisión de secretos de la Fase 10)
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
| 3    | Lógica de negocio con TDD: formato de euros, subtotales, IGIC                | ✅ cerrada 24/11/2026 |
| 4    | Componentes del presupuesto con TDD                                          | ✅ cerrada 24/11/2026 |
| 5    | Estado con Context + useReducer y borradores en localStorage                 | ✅ cerrada 24/11/2026 |
| 6    | Descuentos con patrón Strategy                                               | ✅ cerrada 25/11/2026 |
| 7    | Formulario de cliente y documento imprimible                                 | ✅ cerrada 25/11/2026 |
| 8    | Tests E2E con Playwright                                                     | ✅ cerrada 26/11/2026 |
| 9    | Calidad: accesibilidad, cobertura, Husky, GitHub Actions                     | ✅ cerrada 26/11/2026 |
| 10   | Revisión del historial, CSP, Dependabot, repositorio público                 | ✅ cerrada 27/11/2026 |
| 11   | Entrega del TFM: documentación final y documento de desarrollo con IA        | ✅ cerrada 28/11/2026 |

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

### Verificación en producción (commit `8814d83`)

Hecha el 24/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`.

| Comprobación                                       | Resultado                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `index.html`                                       | HTTP 200, y referencia los **mismos nombres de recurso** que el build local                       |
| JS publicado                                       | `index-DvjE03d8.js`, **224.737 bytes, idéntico byte a byte en tamaño al build local**             |
| CSS publicado                                      | `index-BJNF-ZiX.css`, **11.399 bytes, igual que el local**                                        |
| Los 12 servicios del catálogo                      | **12 de 12** presentes en el JS publicado                                                         |
| Las 4 categorías y los sufijos `/mes`, `/año`      | presentes                                                                                         |
| Los 12 precios en céntimos                         | presentes, pero **en notación exponencial**: esbuild escribe `250000` como `25e4` (ver más abajo) |
| Cabeceras de seguridad                             | **4 de 4** correctas, más `Strict-Transport-Security`                                             |
| Sourcemaps (`.js.map`, `.css.map`)                 | HTTP 404: el código fuente no queda expuesto                                                      |
| `src/shared/data/services.ts`, `CLAUDE.md`, `.env` | HTTP 404: no se publica nada del repositorio                                                      |

**Detalle que estuvo a punto de parecer un fallo:** la búsqueda de los precios
en el JS publicado devolvió «no encontrado» para cinco de los seis importes
probados. No faltaban: el minificador de esbuild reescribe los literales
numéricos en la forma más corta, y `250000` se publica como `25e4`, `120000`
como `12e4` y `6000` como `6e3`. Solo `7200` aparece tal cual, porque no tiene
forma más breve. Comprobado uno por uno. Es un recordatorio de que **lo que se
publica no es el código que se escribió**, y de que una búsqueda literal sobre
un archivo minificado puede dar un negativo falso.

---

## Completado en la Fase 3

### Reglas de negocio confirmadas y centralizadas

`src/shared/constants/business-rules.ts` es **el único archivo donde se cambian
estos valores**, como exige el apartado 4.3. Los porcentajes se guardan como
número (`7`), no como factor (`0.07`), para que la aritmética siga siendo de
enteros.

| Regla                 | Valor confirmado                          | Implementada |
| --------------------- | ----------------------------------------- | ------------ |
| IGIC                  | 7 %, configurable                         | ✅ Fase 3    |
| Descuento por pack    | 3 servicios distintos → 5 % del subtotal  | ✅ Fase 6    |
| Descuento permanencia | 12 meses o más → 10 % de esos servicios   | ✅ Fase 6    |
| Descuento por importe | pago único > 3.000 € → 5 % del pago único | ✅ Fase 6    |
| Tope de descuento     | 20 % como máximo                          | ✅ Fase 6    |

Los precios del catálogo **no cambian**: siguen siendo los 12 servicios de la
Fase 2, con sus importes ficticios. El usuario confirmó las reglas, no los
precios.

El archivo tiene su propio test de coherencia, con el mismo criterio que los
tests de datos de la Fase 2: porcentajes enteros entre 0 y 100, umbral en
céntimos positivos, y **ningún descuento individual por encima del tope**, para
que subir uno al 25 % con el tope en el 20 % dé un fallo con nombre en lugar de
un valor que no significa nada.

### El cálculo

| Archivo                                 | Qué hace                                                       | Tests |
| --------------------------------------- | -------------------------------------------------------------- | ----- |
| `shared/utils/formatEuros.ts`           | céntimos → `1.200,00 €`, `-62,50 €`                            | 13    |
| `shared/types/budget.ts`                | `BudgetLine`, `Subtotals`, `PaymentBlock`, `Budget`            | —     |
| `features/budget/calculateSubtotals.ts` | reparte las líneas en pago inicial, cuota mensual y pago anual | 9     |
| `features/budget/calculateIgic.ts`      | el IGIC redondeado a céntimos                                  | 9     |
| `features/budget/calculateBudget.ts`    | el orden de cálculo completo, tres bloques                     | 9     |
| `shared/constants/business-rules.ts`    | las reglas y sus valores                                       | 10    |

**Cinco ciclos rojo-verde completos**, cada uno con su fallo comprobado antes de
implementar (`Failed to resolve import …`, 0 tests ejecutados). **50 tests
nuevos; 87 en verde con los anteriores.**

### El redondeo del IGIC

Decidido y razonado en
[ADR 0007](docs/adr/0007-redondeo-del-igic.md). En una línea:
`Math.round((baseCents * ratePercent) / 100)`.

- Se multiplica por el porcentaje **entero** y se divide al final.
- **Redondeo comercial:** al céntimo más cercano, empates hacia arriba.
- **Un único redondeo por bloque de pago**, sobre la base completa y después de
  los descuentos. Nunca línea a línea: siete líneas de 0,07 € dan **0 céntimos**
  de IGIC si se redondea por línea y **3** si se redondea sobre la base.
- Admite tipos con medio punto (el 9,5 % funciona exacto) pero no décimas
  sueltas. Hay un test que vigila la condición.

### Tres bloques de pago, sin total general

`Budget` son tres `PaymentBlock` independientes, cada uno con subtotal,
descuento, base imponible, IGIC y total:

```
Pago inicial    2.500,00 €  + IGIC 175,00 €  =   2.675,00 €
Cuota mensual     250,00 €  + IGIC  17,50 €  =     267,50 € /mes
Pago anual        120,00 €  + IGIC   8,40 €  =     128,40 € /año
```

No hay un total general, y es deliberado: sumar los tres daría 2.870 €, un
importe que el cliente no paga en ningún momento. Lo que se paga el primer día
es una decisión de presentación y le corresponde al resumen de la Fase 4.

El hueco `discountCents` existe ya en cada bloque y vale **0** en toda la Fase 3. Es donde la Fase 6 escribirá el resultado de las estrategias, sin cambiar la
forma del presupuesto.

### Lo provisional de la Fase 2, retirado

La conversión de céntimos a euros que vivía dentro de `buildPriceLabel` **se ha
borrado**. Ahora llama a `formatEuros`, y sus **ocho tests siguieron en verde
sin modificar ni uno**: los mismos tests contra una implementación distinta.
Resuelve el pendiente nº 7.

Dos hallazgos al hacerlo:

- **`Intl.NumberFormat` no sirve para este formato.** En español no pone el
  separador de millares en los importes de cuatro cifras: devuelve `1200,00 €`,
  no `1.200,00 €`. No es un error de la herramienta, es la norma de la RAE. La
  especificación fija el formato con separador, así que `formatEuros` está
  escrita a mano. Ver el problema **P10** del registro de la fase.
- **La función provisional tenía un error que llevaba una fase en producción.**
  Con un importe negativo devolvía `-62,-50 €`, porque en JavaScript el resto de
  una división negativa también es negativo. Era inalcanzable —ningún precio del
  catálogo es negativo— y habría dado la cara en la Fase 6, donde un descuento
  se muestra en negativo. Ver el problema **P11**.

### Documentación

- [ADR 0007](docs/adr/0007-redondeo-del-igic.md): el redondeo del IGIC y los
  tres bloques de pago.
- **Nota de actualización en el [ADR 0003](docs/adr/0003-dinero-en-centimos.md)**:
  decía que el formateo usaría `Intl.NumberFormat`, y la Fase 3 lo ha
  desmentido. Se anota, no se reescribe: un ADR registra lo que se decidió y con
  qué información.
- `docs/prompts/fase-03.md` con el registro de la fase.

---

## Verificaciones de la Fase 3

| Comprobación           | Resultado                                                         |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run format:check` | sin cambios pendientes (tras reformatear 4 archivos nuevos)       |
| `npm run lint`         | 0 errores, 0 avisos                                               |
| `npm test`             | **87 de 87 en verde** (37 anteriores + 50 nuevos)                 |
| `npm run build`        | correcto — 224,88 kB de JS (70,73 kB comprimido), 11,42 kB de CSS |

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

**El CSS cambió de nombre y creció 30 bytes** aunque esta fase no ha tocado
ningún estilo. Es el problema **P7** de la Fase 2, ya diagnosticado: Tailwind
extrae candidatos a clase del texto de los archivos `.ts`. Está decidido que no
se corrige (corrección C2-4). Se anota y no se investiga.

### Verificación en producción (commit `727167e`)

Hecha el 24/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó al servidor con `git ls-remote`, no al
caché local de `origin/main`.

| Comprobación                                      | Resultado                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| `index.html`                                      | HTTP 200, y referencia los **mismos nombres de recurso** que el build local |
| JS publicado                                      | `index-BjT9od3w.js`, **224.881 bytes, igual que el build local**            |
| CSS publicado                                     | `index-DPgWZJU5.css`, **11.428 bytes, igual que el local**                  |
| Cabeceras de seguridad                            | **4 de 4** correctas, más `Strict-Transport-Security`                       |
| Sourcemaps (`.js.map`)                            | HTTP 404                                                                    |
| Código fuente nuevo, `docs/`, `CLAUDE.md`, `.env` | HTTP 404: no se publica nada del repositorio                                |

**El cálculo de la Fase 3 todavía no está en el JS publicado, y es correcto que
no esté.** Ningún componente importa `calculateBudget`, `calculateIgic` ni
`calculateSubtotals`, así que Vite los descarta del paquete (_tree shaking_). Lo
que sí está es `formatEuros`, porque lo usa el catálogo. Comprobado con dos
marcadores que sobreviven a la minificación —los mensajes de error, que son
cadenas literales—:

| Marcador                                 | En producción                |
| ---------------------------------------- | ---------------------------- |
| Mensaje de error de `formatEuros`        | **presente**                 |
| Expresión del separador de millares      | **presente**                 |
| Mensaje de error de `calculateSubtotals` | **ausente**, como debe estar |

La pareja es el control positivo de la propia comprobación: la misma búsqueda,
sobre el mismo archivo, encuentra lo que tiene que estar y no encuentra lo que
no. Un «no encontrado» aislado no habría distinguido entre «no está publicado» y
«la búsqueda no funciona», que es el error del problema **P9** de la Fase 2. El
cálculo entra en el paquete publicado en la **Fase 4**, cuando los componentes
lo usen, y ahí es donde hay que volver a comprobarlo.

**Confirmación de que el arreglo de Tailwind de la Fase 1 sigue en pie:** este
commit añade cinco documentos (`.md`) y el CSS publicado tiene el mismo nombre y
el mismo tamaño que el build local hecho antes de escribirlos. La documentación
ya no entra en el CSS.

---

## Completado en la Fase 4

### El presupuesto, funcionando

La aplicación pasa de **enseñar un catálogo** a **construir un presupuesto**.
Se añaden servicios desde el catálogo, se eligen la cantidad y los meses, y el
resumen se actualiza al instante con los tres bloques de pago.

**`calculateBudget`, `calculateIgic` y `calculateSubtotals` no han cambiado de
comportamiento en esta fase**, y es la mejor señal de que la frontera entre
cálculo y presentación estaba bien puesta en la Fase 3. Lo único que se tocó de
ellos fue extraer la multiplicación a `calculateLineAmountCents` (ver más
abajo), con sus tests en verde antes y después.

### Los meses, en `BudgetLine` (pendiente nº 9)

`BudgetLine` pasa de una interfaz a una **unión discriminada** de tres tipos:
`OneTimeBudgetLine`, `MonthlyBudgetLine` y `YearlyBudgetLine`. Los meses son
**obligatorios** en la mensual y `number`, no `number | undefined`.

Hubo que elegir entre dos garantías de tipos que resultaron **incompatibles**,
y se midió antes de decidir:

| Garantía                                                      | Con `months?: never` | Sin él |
| ------------------------------------------------------------- | -------------------- | ------ |
| Una línea mensual **sin** meses no compila                    | ✅                   | ✅     |
| Una línea de pago único **con** meses no compila              | ✅                   | ❌     |
| Leer `linea.months` sin comprobar la forma de pago no compila | ❌                   | ✅     |

**Se eligió la tercera** (decisión del usuario): las lecturas están repartidas
por todos los componentes y las escrituras pasan por un solo sitio,
`createBudgetLine`, que tiene sus tests. Las dos garantías que sí existen están
probadas con `@ts-expect-error` en `isMonthlyLine.test.ts`, y hay un comentario
en `shared/types/budget.ts` que explica la que falta y qué la sustituye.

El acceso a los meses pasa por **`isMonthlyLine`**, un predicado de tipo. Hace
falta porque el discriminante de `BudgetLine` está **anidado** dentro de
`service`, y TypeScript no estrecha una unión mirando el campo de un campo.

### El resumen (pendientes nº 8 y nº 10)

- Los **tres bloques por separado**, cada uno con base imponible, IGIC y total.
  Un bloque sin importe no se muestra.
- **Sin total general**, como fija el [ADR 0007](docs/adr/0007-redondeo-del-igic.md).
- Una línea informativa: **«A pagar el primer día (orientativo)»**, que es el
  pago inicial más la primera cuota mensual más el primer pago anual. Es una
  función con tests y **está fuera del tipo `Budget`** a propósito. Razonado en
  el [ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md).
- La fila del descuento y la del subtotal **solo aparecen cuando hay
  descuento**. En toda la Fase 4 vale 0, pero están escritas y probadas, así
  que la Fase 6 será solo lógica y no tendrá que tocar pantalla.
- **El contador provisional «Servicios seleccionados» ha desaparecido**
  (pendiente nº 8).

### Los componentes no calculan (pendiente nº 12)

Ningún componente de esta fase tiene una suma, una multiplicación ni una
división entre cien. Todos los importes salen de `calculateBudget`,
`calculateLineAmountCents` y `calculateFirstPaymentCents`, y se muestran con
`formatEuros` y `buildAmountLabel`.

### Una sola multiplicación en todo el proyecto

`calculateSubtotals` multiplicaba el precio por la cantidad por su cuenta.
Desde la Fase 4 la línea del presupuesto necesita ese mismo importe en
pantalla, así que la multiplicación se extrajo a `calculateLineAmountCents` y
`calculateSubtotals` pasó a llamarla. **Sus nueve comprobaciones siguieron en
verde sin tocar ninguna.** Decisión del usuario: una sola fuente del cálculo,
mejor que dejar el archivo intacto.

Por el mismo motivo, la tabla de sufijos `/mes` y `/año` salió de
`buildPriceLabel` —que vive en el catálogo— a `shared/utils/buildAmountLabel`,
que es lo que manda el apartado 6 de `CLAUDE.md` cuando algo lo usan dos
funcionalidades. `buildPriceLabel` se quedó en dos líneas y **sus ocho tests no
han cambiado en ninguno de los tres cambios que ha sufrido** (Fase 2, Fase 3 y
Fase 4).

### Los selectores y la corrección de valores

| Decisión                                                                     | Motivo                                                                                                                                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Un solo `QuantitySelector`** para cantidad y meses                         | Cambian la etiqueta, la unidad y los límites, que llegan por props. Dos componentes tendrían la misma lógica de corrección escrita dos veces                    |
| **La corrección se aplica al salir del campo o con Enter**, nunca al teclear | Decisión del usuario. Con el mínimo en 6, escribir «12» pasa por un «1»: corrigiendo en cada pulsación sería imposible escribir 12                              |
| **Un valor por encima del máximo se queda en el máximo**                     | Decisión del usuario. Quien escribe 500 meses quería muchos meses. Devolver el mínimo haría parecer que el campo no funciona                                    |
| `normalizeNumber` recibe **`unknown`**                                       | Desde la Fase 5 valida también lo que se lea de `localStorage`, donde puede haber cualquier cosa. Si solo aceptara números, alguien tendría que convertir antes |
| Los decimales se **truncan**, y antes de aplicar límites                     | «6,9 meses» es 6 meses y algo, y ese algo no se contrata. El orden importa: 5,9 trunca a 5 y entonces sube al mínimo                                            |
| Lo que no es un número va al **mínimo**                                      | Es el único valor siempre válido y, en una línea, el más barato: un dato corrupto nunca infla un importe                                                        |

### Los topes, en el archivo de constantes

| Constante      | Valor | Por qué                                                                       |
| -------------- | ----- | ----------------------------------------------------------------------------- |
| `MIN_QUANTITY` | 1     | Una línea con cero unidades es una línea que habría que haber borrado         |
| `MAX_QUANTITY` | 99    | De sobra para una agencia, y mantiene la aritmética lejos de cualquier límite |
| `MAX_MONTHS`   | 36    | Tres años. Más que eso debería ser un presupuesto nuevo                       |

Con **dos tests de coherencia** que vigilan que dos valores sigan teniendo
sentido juntos:

- `MAX_MONTHS` tiene que estar **por encima de los 12 meses del descuento por
  permanencia**. Un tope por debajo dejaría ese descuento inalcanzable sin que
  nada avisara.
- Ningún servicio mensual del catálogo puede tener un `minMonths` por encima
  del tope, porque su selector nacería con un valor que su propio máximo no
  admite. **Este test se vio fallar** bajando el tope a 2: avisa nombrando el
  servicio.

### Accesibilidad

- Jerarquía sin saltos: **h1** título → **h2** categorías y «Tu presupuesto» →
  **h3** «Resumen» → **h4** cada bloque de pago.
- El panel del presupuesto es una **región con nombre accesible**, igual que
  las categorías del catálogo.
- Los campos y botones de los selectores llevan el **nombre del servicio** en
  su nombre accesible («Meses de SEO Básico»), porque con cinco líneas en
  pantalla «Meses» a secas no identifica cuál.
- El rango permitido va **en texto** y asociado al campo, no solo en el gris de
  un botón desactivado.
- **El `aria-live` está en una frase corta de estado** —cuántos servicios hay y
  cuánto se paga el primer día—, no en todo el resumen. Decisión del usuario:
  con el resumen entero como región activa, cada pulsación haría que un lector
  de pantalla recitara las quince cifras del desglose. La frase está en la
  página también con el presupuesto vacío, porque una región activa que aparece
  con su contenido no se anuncia de forma fiable.
- El botón de quitar de la línea y el del catálogo tienen **el mismo nombre
  accesible** a propósito: es la misma acción vista desde dos sitios, y lo que
  los distingue es la región en la que están.

### Alineación de las líneas

Las líneas del presupuesto usan una **rejilla de tres columnas de ancho
declarado** a partir de 1024 px. Con un `flex` y `justify-between`, los
selectores se desplazaban según el ancho del importe («72,00 €/año» frente a
«300,00 €») y según si la línea tiene uno o dos selectores. La fila empieza en
1024 px y no en 640 px porque entre esos dos anchos no caben las tres columnas
sin estrujar el nombre del servicio: en ese rango se apila, igual que en el
móvil. Los importes llevan `tabular-nums`, así que quedan alineados por la coma.

Comprobado en el navegador por el usuario, en pantalla ancha y en ancho de
móvil.

### Documentación

- [ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md): el primer pago
  es presentación, no un total del presupuesto.
- `docs/prompts/fase-04.md` con el registro de la fase.
- **Dos normas nuevas en `CLAUDE.md`**: la de ritmo en el apartado 1 (pendiente
  nº 13) y, en el apartado 5, que ningún mensaje de comprobación puede afirmar
  que algo ha ido bien sin depender del resultado real del comando.

---

## Verificaciones de la Fase 4

| Comprobación           | Resultado                                                         |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run format:check` | en verde (tras reformatear 7 archivos nuevos)                     |
| `npm run lint`         | 0 errores, 0 avisos                                               |
| `npm test`             | **190 de 190 en verde** (87 anteriores + 103 nuevos)              |
| `tsc -b`               | sin errores                                                       |
| `npm run build`        | correcto — 232,82 kB de JS (72,80 kB comprimido), 14,31 kB de CSS |

**Diez ciclos rojo-verde completos.** Ocho con el fallo de importe sin resolver
(`Failed to resolve import …`, 0 tests ejecutados) y dos con fallos de
aserción: los topes del archivo de constantes y los ocho tests de integración
de `App`.

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

**El JS ha crecido 8 kB, y era lo previsto.** La Fase 3 dejó anotado que el
cálculo no estaba en el paquete publicado porque ningún componente lo
importaba, y que entraría en la Fase 4. Ya está dentro.

### Verificación en producción (commit `259552a`)

Hecha el 24/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó al servidor con `git ls-remote`, no al
caché local de `origin/main`, y coincidía con el local.

| Comprobación                                                                        | Resultado                                                                              |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                                                                        | HTTP 200, **638 bytes**, y referencia los mismos nombres de recurso que el build local |
| JS publicado                                                                        | `index-Du2JEuYb.js`, **232.820 bytes, igual que el build local**                       |
| CSS publicado                                                                       | `index-CjGqUGDV.css`, **14.311 bytes, igual que el local**                             |
| Cabeceras de seguridad                                                              | **4 de 4** correctas, más `Strict-Transport-Security`                                  |
| Sourcemaps (`.js.map`, `.css.map`)                                                  | HTTP 404: el código fuente no queda expuesto                                           |
| Código fuente, `docs/`, `CLAUDE.md`, `PROGRESO.md`, `package.json`, `.env`, `.git/` | HTTP 404 en las 13 rutas probadas                                                      |
| Probado en el navegador por el usuario                                              | correcto                                                                               |

**Control positivo del contenido publicado**, con la pareja de marcadores que
hace válida la comprobación: la misma búsqueda, sobre el mismo archivo,
encuentra lo que tiene que estar y no encuentra lo que no.

| Marcador                                              | Esperado | Resultado    |
| ----------------------------------------------------- | -------- | ------------ |
| `orientativo` y `A pagar el primer día`               | presente | **presente** |
| `Tu presupuesto`, `Base imponible`, el aviso de vacío | presente | **presente** |
| `Solo para los tests.` (existe solo en los tests)     | ausente  | ausente      |
| `Servicios seleccionados` (el contador retirado)      | ausente  | **ausente**  |

El último es el que confirma el pendiente nº 8: el contador provisional de la
Fase 2 ya no se publica.

**Y queda cerrado el lazo que dejó abierta la Fase 3.** Aquella verificación
comprobó que el mensaje de error de `calculateSubtotals` **no** estaba en el JS
publicado —ningún componente importaba el cálculo, así que Vite lo descartaba— y
anotó que entraría en la Fase 4 «y ahí es donde hay que volver a comprobarlo».
Comprobado: **ahora está presente**. El cálculo del presupuesto viaja ya en el
paquete que recibe el navegador, que es exactamente lo que predijo aquella nota.

---

## Completado en la Fase 5

### El estado, fuera de `App.tsx`

El `useState` de la Fase 4 y sus cuatro funciones pasan a un **reducer**, que es
una función pura y por tanto se prueba como cualquier función de cálculo: se le
pasa un estado y una acción, y se compara el objeto que devuelve. Sin navegador
y sin componentes.

| Archivo                      | Qué hace                                     | Tests |
| ---------------------------- | -------------------------------------------- | ----- |
| `context/budgetReducer.ts`   | El estado y las cinco acciones. Función pura | 19    |
| `context/BudgetContext.ts`   | El Context y el hook `useBudget`             | —     |
| `context/BudgetProvider.tsx` | Guarda el estado, lee y escribe el borrador  | 16    |
| `Configurator.tsx`           | El contenido que antes estaba en `App`       | —     |
| `App.tsx`                    | El proveedor y la pantalla, en cuatro líneas | 18    |

**Ningún componente de presentación ha cambiado.** `ServiceCatalog`,
`BudgetPanel`, `BudgetLineItem`, `QuantitySelector` y `ServiceCard` reciben las
mismas props que en la Fase 4 y no conocen el Context: `Configurator` es el
único que llama a `useBudget`, y lo que hace con lo que recibe es repartirlo.
Los **190 tests de las fases 1 a 4 siguen en verde y ninguno se ha modificado**.

Tres decisiones del estado:

- **El estado son las líneas**, y los identificadores marcados del catálogo se
  derivan de ellas. No hay dos listas que puedan discrepar.
- **La acción de añadir lleva el servicio entero**, no su identificador, así que
  el reducer no conoce el catálogo y se prueba con dos servicios inventados. La
  traducción de identificador a servicio ocurre en un solo sitio, el proveedor.
- **El proveedor está dentro de `App`**, no en `main.tsx`. Así `<App />` es la
  aplicación completa y los ocho tests de integración de la Fase 4 siguen
  funcionando sin envolverlos en nada.

### Los borradores en `localStorage`

| Archivo                             | Qué hace                                            | Tests |
| ----------------------------------- | --------------------------------------------------- | ----- |
| `features/budget/draftFormat.ts`    | La clave versionada y la forma de lo que se guarda  | —     |
| `features/budget/serializeDraft.ts` | Líneas → borrador. Función pura                     | 7     |
| `features/budget/parseDraft.ts`     | `unknown` + catálogo → líneas válidas. Función pura | 23    |
| `shared/utils/safeLocalStorage.ts`  | Leer, escribir y borrar sin poder lanzar            | 8     |
| `features/budget/draftStorage.ts`   | Junta las tres anteriores con el navegador          | 14    |

**Qué se guarda, bajo la clave `configurador-presupuestos:budget-draft:v1`:**

```json
{ "lines": [{ "serviceId": "seo-basic", "quantity": 1, "months": 12 }] }
```

Tres campos y ninguno más. **Ni precios, ni nombres, ni importes, ni IGIC, ni
totales, ni un solo dato personal.** Al recuperar el borrador, el servicio se
busca por identificador en el catálogo y la línea guarda **ese** objeto, así que
editar el almacenamiento del navegador no puede cambiar un precio: como mucho
puede cambiar qué servicios figuran, que es lo mismo que puede hacer cualquiera
pulsando botones. Hay un test que lo comprueba con `toBe`, que compara
identidad, y otro que inyecta un `priceCents: 1` en el borrador y verifica que
en pantalla siguen saliendo 1.200,00 € + IGIC. Razonado en el
[ADR 0009](docs/adr/0009-borradores-en-localstorage.md).

La versión va **en la clave**: si el formato cambia en una fase posterior, pasa
a `:v2` y los borradores antiguos quedan ignorados sin llegar a leerse, que es
la forma más segura de tratar un formato desconocido.

### Las tres formas de tratar un dato que no es de fiar

Decisión del usuario al autorizar la fase, y son **distintas a propósito**:

| Qué falla                                                             | Qué se hace           | Por qué                                                                                                                     |
| --------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| La **estructura**: JSON roto, no es un objeto, `lines` no es un array | se descarta todo      | Un formato desconocido no se interpreta (apartado 4.6: se descarta y se empieza de cero)                                    |
| Una **línea**: sin identificador, servicio inexistente, repetido      | se descarta esa línea | Lo demás es trabajo legítimo del usuario. Tirar cinco servicios porque uno se retiró es perder lo que sí se puede recuperar |
| Un **número**: fuera de rango, decimal, texto, ausente                | se normaliza          | El rango válido está definido y hay una función probada que acerca cualquier valor a él                                     |

Y dos casos más, resueltos también por decisión del usuario:

- **`months` en un servicio que no es mensual**: se ignora el campo y la línea
  se conserva. No interviene en ningún importe.
- **`localStorage` no disponible** (navegación privada, cookies bloqueadas,
  cuota agotada): la aplicación funciona igual, simplemente sin guardar. Las
  tres funciones de `safeLocalStorage` devuelven `null` o `false` en lugar de
  lanzar, y hay dos tests que **provocan** el fallo sustituyendo `getItem` y
  `setItem` por funciones que lanzan. Un caso que no se provoca no está probado.

### `normalizeNumber` se ha cobrado la deuda de la Fase 4

La validación de números de esta fase son **cuatro llamadas y ningún caso
especial**, porque `normalizeNumber` ya recibía `unknown` por decisión del
usuario en la Fase 4, pensando exactamente en esto. El caso «faltan los meses
en una línea mensual» no necesitó ni una línea de código:
`normalizeNumber(undefined, { min: service.minMonths, max: MAX_MONTHS })`
devuelve el mínimo del servicio, que es con lo que nace una línea nueva en
`createBudgetLine`.

### El riesgo del arranque, cubierto con tres tests

El borrador se lee **al crear el estado**, con la inicialización perezosa de
`useReducer`, y no en un efecto posterior. La diferencia no es de estilo:

| Dónde se lee el borrador      | Qué pasa en el primer render                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| Al crear el estado (así está) | el estado nace con las líneas recuperadas: nunca vale «vacío»                                       |
| En un efecto posterior        | el primer render tiene el presupuesto vacío, y el guardado **borraría** el borrador antes de leerlo |

Lo vigilan tres tests —en el proveedor, en el proveedor con `StrictMode` y en
`App`—, y los tres comparan **la cadena exacta** guardada antes y después del
primer render, no solo que haya algo. Lo pidió el usuario al autorizar la fase.

**El test de `StrictMode` se verificó en lugar de darse por bueno:** cuenta las
lecturas de `localStorage` y comprueba que son **más de una**. Sin ese control,
un test que dice «aguanta el doble montaje» estaría en verde sin haber ejercido
ningún doble montaje.

**Y el guardado del primer render tiene un efecto útil**, no solo inofensivo: si
el borrador traía basura —un precio inventado, una línea de un servicio
retirado, un número imposible—, `parseDraft` la descarta al crear el estado y el
efecto deja en el navegador **la versión ya validada, al cargar la página y sin
que el usuario toque nada**. El borrador se cura solo. El orden es lo que lo
hace seguro: primero se lee, al crear el estado; después se escribe, en el
efecto. Comprobado en el navegador por el usuario y fijado con un test.

### «Empezar de nuevo», con confirmación en dos pasos

El botón del apartado 4.6, en `features/budget/ResetBudgetButton.tsx`, con 13
tests. Borrar el presupuesto no se puede deshacer, así que un clic no basta:
decisión del usuario.

- No se muestra nada con el presupuesto vacío.
- El aviso dice **qué se pierde**, no solo «¿seguro?».
- **No usa `window.confirm`**: no se puede etiquetar en español, bloquea la
  página, algunos navegadores permiten silenciarlo —y entonces el presupuesto se
  borraría sin preguntar— y no se puede probar sin sustituir una función global.
- Está **fuera de `BudgetPanel`** a propósito, así que el panel y sus doce tests
  no han cambiado para que esta fase añada un botón.

**El foco**, que es la parte que no se ve y la que pidió el usuario:

| Momento          | Dónde va el foco                | Por qué                                                                                                                                 |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Se abre el aviso | al propio aviso                 | Tiene nombre accesible, así que se lee la pregunta completa. **No** al botón de borrar: el mismo Enter que abre el aviso lo confirmaría |
| Se cancela       | al botón «Empezar de nuevo»     | Es de donde venía. Si no, el foco cae al cuerpo del documento                                                                           |
| Se confirma      | al mensaje de que se ha borrado | El botón ya no existe, así que el foco necesita un destino, y el mensaje es la confirmación                                             |

### Aislamiento de los tests

`src/test/setup.ts` vacía `localStorage` antes de cada test. Hace falta desde el
momento en que la aplicación guarda borradores: jsdom tiene **un solo**
`localStorage` por archivo de test, así que un test que añade servicios dejaría
su borrador dentro y el siguiente arrancaría con el presupuesto del anterior.
No es comodidad: un test que depende del anterior ya no prueba lo que dice su
nombre, y pasa o falla según el orden de ejecución.

### Documentación

- [ADR 0009](docs/adr/0009-borradores-en-localstorage.md): qué se guarda en el
  navegador, qué no, y cómo se valida lo que vuelve.
- `docs/prompts/fase-05.md` con el registro de la fase.

---

## Verificaciones de la Fase 5

| Comprobación                           | Resultado                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check`                 | en verde (tras reformatear los archivos nuevos)                                                                           |
| `npm run lint`                         | 0 errores, 0 avisos                                                                                                       |
| `npm test`                             | **300 de 300 en verde** (190 anteriores + 110 nuevos)                                                                     |
| `tsc -b`                               | sin errores                                                                                                               |
| `npm run build`                        | correcto — 237,29 kB de JS (74,00 kB comprimido), 14,49 kB de CSS                                                         |
| Probado en el navegador por el usuario | recarga con F5, borrador sin nombres ni precios, precio falso ignorado, sin errores en consola, y correcto en vista móvil |

**Siete ciclos rojo-verde completos.** Seis con el fallo de importe sin resolver
(`Failed to resolve import …`, 0 tests ejecutados) y uno con fallos de
aserción: los ocho tests nuevos de `App`.

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

**Una refactorización en verde, provocada por ESLint.** La primera versión de
`ResetBudgetButton` limpiaba sus dos estados con un `useEffect`, y la regla
`react-hooks/set-state-in-effect` lo rechazó: provoca un dibujado en cascada, es
decir, la pantalla se dibuja mal primero y se corrige después. Se sustituyó por
el patrón que documenta React —ajustar el estado durante el render comparando
con el valor anterior—, y **los 31 tests del botón y de `App` siguieron en verde
sin tocar ninguno**.

### Verificación en producción (commit `fd89b2d`)

Hecha el 24/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó al servidor con `git ls-remote`, no al
caché local de `origin/main`, y coincidía con el local.

| Comprobación                                                                        | Resultado                                                                              |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                                                                        | HTTP 200, **638 bytes**, y referencia los mismos nombres de recurso que el build local |
| JS publicado                                                                        | `index-CzsjOxrs.js`, **237.293 bytes, igual que el build local**                       |
| CSS publicado                                                                       | `index-BWK1CCBz.css`, **14.494 bytes, igual que el local**                             |
| Cabeceras de seguridad                                                              | **4 de 4** correctas, más `Strict-Transport-Security`                                  |
| Sourcemaps (`.js.map`, `.css.map`)                                                  | HTTP 404: el código fuente no queda expuesto                                           |
| Código fuente, `docs/`, `CLAUDE.md`, `PROGRESO.md`, `package.json`, `.env`, `.git/` | HTTP 404 en las 20 rutas probadas                                                      |
| **`docs/privado/` y el documento que contiene**                                     | **HTTP 404**, en la ruta nueva y en la antigua                                         |

**Control positivo y negativo del contenido publicado.** La misma búsqueda,
sobre el mismo archivo, encuentra lo que tiene que estar y no encuentra lo que
no:

| Marcador                                                 | Esperado | Resultado    |
| -------------------------------------------------------- | -------- | ------------ |
| `Empezar de nuevo`                                       | presente | **presente** |
| `configurador-presupuestos:budget-draft:v1`              | presente | **presente** |
| `Sí, borrar el presupuesto`                              | presente | **presente** |
| `Se ha borrado el presupuesto`                           | presente | **presente** |
| `Seguro que quieres borrar el presupuesto`               | presente | **presente** |
| `useBudget solo funciona dentro de`                      | presente | **presente** |
| `Acción del presupuesto no contemplada`                  | presente | **presente** |
| `Solo para los tests.` (existe solo en los tests)        | ausente  | ausente      |
| `Web de ejemplo` y `SEO de ejemplo` (datos de los tests) | ausente  | ausente      |
| `Servicios seleccionados` (el contador retirado)         | ausente  | ausente      |
| `budget-draft:v2` (versión que no existe)                | ausente  | ausente      |

Los cuatro últimos son lo que hace válidos a los siete primeros: sin ellos, un
«presente» no distingue entre «el código está publicado» y «la búsqueda
encuentra cualquier cosa».

**La clave del borrador viaja en el JS publicado**, y es la comprobación que
cierra la fase: el borrador no es una funcionalidad que solo exista en los
tests, está en el paquete que recibe el navegador.

---

## Revisión del historial para la Fase 10 (hecha en la Fase 5)

Consulta de solo lectura pedida por el usuario, **sin reescribir nada**, para
saber qué habrá que limpiar antes de hacer público el repositorio.

| Qué se buscó                                                               | Resultado                                                                                                                                            |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| El PDF de requisitos del máster, en **cualquier commit** de cualquier rama | **nunca entró**. Ningún objeto `.pdf` ni ningún nombre parecido en los diez commits. El historial solo contiene archivos de texto                    |
| El correo del profesor retirado en la Fase 1                               | **no está en el historial**: ni en el contenido, ni en los mensajes de commit, ni en la firma de ningún commit                                       |
| Direcciones de correo en todo el historial, por dominio                    | solo `@users.noreply.github.com` (18 veces, intencionada) y `@anthropic.com` (10, la línea `Co-Authored-By`)                                         |
| Fragmentos copiados literalmente del PDF en los documentos actuales        | **ninguno encontrado**. Los tres sitios que resumen los requisitos están parafraseados; no hay ninguna cita en bloque atribuida al documento oficial |

**Conclusión: en la Fase 10 no hay que reescribir el historial.** La corrección
C1-7 se aplicó antes del primer commit, así que el dato nunca se versionó. Lo
que sí queda para la Fase 10 es la revisión completa con los **términos que
aporte el usuario** en ese momento (nombre de la agencia, su dominio y el
identificador de su correo personal), que es el pendiente nº 15 y la lección de
la corrección C4-11.

**Dos frases se señalaron al usuario para que decidiera**, y decidió:

1. `docs/prompts/fase-00.md` nombraba el procedimiento interno de entrega de la
   plataforma del máster. **Neutralizado**: ahora dice «el procedimiento que
   indica el propio documento oficial», con una nota que explica el cambio. Es
   la norma del apartado 5 de `CLAUDE.md` que ya actuó en la corrección C1-7:
   se describe el dato en lugar de reproducirlo.
2. `docs/prompt-maestro.md` nombra el máster y la escuela. **Se queda**: es la
   formación del autor y es legítimo nombrarla.

### El material ajeno, en una carpeta ignorada entera

Hasta la Fase 5, el PDF de requisitos estaba excluido por una regla de **ruta
exacta** (`docs/documento-proyecto-final.pdf`). Ahora vive en
**`docs/privado/`**, y lo que se ignora es **la carpeta completa**.

El motivo es el mismo que el del apartado 5 de `CLAUDE.md` cuando exige revisar
categorías de datos y no archivos conocidos: **una lista de archivos falla en
cuanto aparece uno nuevo**, y quien deje mañana otro documento ajeno en `docs/`
no tiene por qué acordarse de añadir su nombre al `.gitignore`. Con la carpeta,
lo que se guarde ahí queda fuera del repositorio por defecto.

El orden de la operación importó y se hizo así a propósito: **primero la regla,
después el movimiento**. Moviendo antes, el PDF habría pasado por una ruta no
ignorada, y cualquier `git add -A` en esa ventana lo habría metido en el índice.
Comprobado con `git check-ignore -v` sobre la ruta nueva **antes** de mover,
con control positivo (otro archivo cualquiera de esa carpeta) y control negativo
(un `.md` normal de `docs/`, que no debe estar ignorado).

La regla antigua se mantiene, por si alguna vez reaparece una copia en la ruta
de antes.

**Lo que no se ha tocado:** las citas de los prompts del usuario en
`docs/prompts/fase-00.md` y `docs/prompts/fase-01.md` que mencionan la ruta
antigua. Son transcripciones de lo que se dijo en su momento, y reescribir una
cita para que encaje con el presente falsifica el registro. La ruta nueva se
anota donde el texto es nuestro, no suyo.

**La revisión encontró además un fallo del propio método**, y es la cuarta vez
que aparece la misma familia de problemas: la primera búsqueda sobre los
mensajes de commit dio «ninguna dirección» y era un **falso negativo**, porque
la expresión mezclaba escapes de BRE (`\+`) con el modo `-E`. Lo delató el
control positivo de buscar una simple `@`, que encontró los diez commits. Es el
problema **P9** de la Fase 2 con otra forma.

---

## Completado en la Fase 6

### Los descuentos, con una estrategia por regla

Cuatro archivos nuevos en `src/shared/strategies/` y ni un condicional encadenado:

| Archivo                 | Qué decide                                                      | Tests |
| ----------------------- | --------------------------------------------------------------- | ----- |
| `discountStrategy.ts`   | La forma de una estrategia: tipos y las tres claves de bloque   | —     |
| `packDiscount.ts`       | 3 servicios distintos → 5 % en **cada uno** de los tres bloques | 11    |
| `commitmentDiscount.ts` | 10 % de las líneas mensuales de 12 meses o más                  | 13    |
| `amountDiscount.ts`     | 5 % del pago inicial si supera 3.000 € (**estrictamente**)      | 7     |
| `calculateDiscounts.ts` | Agrupa por bloque, suma y aplica el tope                        | 16    |

Añadir una regla de descuento es **añadir un archivo y registrarlo** en una
lista, sin tocar las demás ni el calculador. Es la ventaja concreta por la que el
[ADR 0004](docs/adr/0004-strategy-para-descuentos.md) eligió el patrón en la
Fase 1, y en esta fase se ha podido comprobar.

### Las cinco decisiones que la especificación no contestaba

Resuelven el pendiente nº 11 y están razonadas en el
[ADR 0010](docs/adr/0010-como-se-aplican-los-descuentos.md):

| Pregunta                                           | Decisión del usuario                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| ¿A qué subtotal se aplica el pack, si hay tres?    | A **los tres**, con la condición evaluada sobre todo el presupuesto           |
| ¿Qué cuenta como «3 servicios distintos»?          | Servicios por identificador. **Tres unidades de la misma web no son un pack** |
| ¿Se suman los descuentos o se encadenan?           | **Se suman**, siempre sobre el subtotal                                       |
| ¿Los umbrales, antes o después de descontar?       | **Antes**, sobre el subtotal sin tocar                                        |
| ¿El tope del 20 % es del presupuesto o del bloque? | **De cada bloque**, y se aplica al final                                      |

Sumar en lugar de encadenar no es un detalle: en la cuota mensual del ejemplo del
usuario son **2,25 €** de diferencia (67,50 € sumados frente a 65,25 €
encadenados). Y tiene una propiedad que encadenar no tiene: **el resultado no
depende del orden** en que se ejecuten las estrategias.

### Dónde se redondea cada cosa

| Qué              | Cómo                                        | Por qué                                                                                 |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Cada descuento   | `calculatePercentCents`, redondeo comercial | La misma función y la misma regla que el IGIC: **un solo redondeo en todo el proyecto** |
| El tope del 20 % | `Math.floor`, **truncado**                  | El 20 % de 9,99 € son 1,998 €: redondeando daría 2,00 €, que es **más del 20 %**        |

**Un redondeo por estrategia y por bloque**, no uno al final sobre la suma. El
motivo es de pantalla: el resumen muestra cada descuento con su importe, así que
cada uno tiene que ser un entero de céntimos y **la suma de lo que se ve tiene
que ser exactamente lo que se resta**. La diferencia entre las dos formas es
real y está fijada con un test: con un pago inicial de 3.000,10 € son 300,02 €
redondeando por separado y 300,01 € redondeando la suma.

### Un solo sitio que calcula porcentajes

`shared/utils/calculatePercentCents.ts`, con 10 tests. `calculateIgic` pasó a
llamarla y **sus nueve comprobaciones siguieron en verde sin tocar ninguna**: los
mismos tests contra una implementación distinta, igual que ocurrió con
`buildPriceLabel` en la Fase 3 y con `calculateSubtotals` en la Fase 4.

Es el tercer caso del proyecto del mismo movimiento: en cuanto aparece el segundo
sitio que necesita una operación, la operación se extrae con sus tests.

### El motivo de cada descuento (pendiente nº 18, segunda parte)

`PaymentBlock` gana `discounts`, una lista de `AppliedDiscount` con
identificador, motivo e importe. Dos decisiones que la sostienen:

- **`discountCents` es la suma de `discounts`**, no un cálculo aparte. No son dos
  números que haya que mantener de acuerdo, es uno, y hay un test que comprueba
  la igualdad en los tres bloques.
- **Cada estrategia construye su propio motivo** leyendo las constantes, así que
  cambiar `PACK_DISCOUNT_PERCENT` cambia el cálculo y el rótulo de la pantalla a
  la vez. Un texto escrito a mano seguiría diciendo «5 %» con la regla al 8 %.

En el resumen, la fila «Descuento» de la Fase 4 **se conserva** y debajo va una
fila por motivo. Con un solo descuento las dos muestran la misma cifra: decisión
del usuario después de verlo en el navegador, porque así los tres bloques tienen
el mismo desglose y el motivo se ve siempre.

### La pista del selector de meses (pendiente nº 18, primera parte)

El problema que el usuario detectó al probar la Fase 5: cambiar los meses no
movía ningún importe —la cuota es la de un mes, y es correcto— y **nada en
pantalla decía para qué servía el campo**.

Ahora, bajo el selector: «Desde 12 meses: 10 % de descuento», que pasa a
«Descuento por permanencia aplicado» al llegar. La decide
`buildCommitmentHint`, que comparte la condición con la estrategia que concede el
descuento: **la pantalla no puede anunciar un descuento que el presupuesto no
lleva**, y hay un test que recorre los 36 meses posibles comprobando que las dos
coinciden.

La pista va **en el texto asociado al campo** (`aria-describedby`), junto al
rango, no en una región que se anuncie sola. Decisión del usuario: así se lee al
entrar en el campo y la frase de estado del panel se queda corta, como la dejó la
Fase 4.

### El tope del 20 %, probado sin poder provocarlo

Con las reglas actuales **el tope no se alcanza nunca**: lo máximo que se junta en
un bloque es el 15 % (pack más permanencia en la cuota mensual). Se prueba
inyectando **estrategias de prueba** en el calculador, que admite una lista
distinta de la de producción por el mismo motivo que `calculateBudget` admite
otro tipo de IGIC desde la Fase 3.

Cuando el tope recorta, los descuentos conservan su importe y se añade una fila
de ajuste **negativa** («Tope del 20 % del subtotal»), así que ninguna etiqueta
miente y la columna suma a la vista. Decisión del usuario entre dos opciones.

Y hay un test que comprueba que **con las reglas reales el ajuste no aparece**.
El día que alguien suba un porcentaje, ese test falla: es el aviso de que el tope
empieza a morder en presupuestos reales.

### Sin compromiso total (pendiente nº 19)

No se muestra meses × cuota. Razonado en el
[ADR 0011](docs/adr/0011-sin-compromiso-total.md), con el criterio del
[ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md): **una cifra de
dinero en pantalla tiene que responder a una pregunta con respuesta exacta.**
«¿Cuánto pagas cada mes?» la tiene; «¿cuánto te cuesta el compromiso?» depende de
doce meses de futuro, y además no incluiría ni el pago inicial ni el anual.

### Los descuentos no se guardan

Se calculan siempre. El borrador de `localStorage` sigue siendo el de la Fase 5
—identificador, cantidad y meses, y nada más—, y hay un test de integración que
lo comprueba sobre el contenido real del almacenamiento después de montar el
presupuesto del ejemplo 1. Un descuento guardado sería un importe editable desde
el navegador, que es justo lo que el
[ADR 0009](docs/adr/0009-borradores-en-localstorage.md) decidió evitar.

### Dos archivos cambiados de carpeta

`isMonthlyLine` y `calculateLineAmountCents` pasan de `features/budget/` a
`shared/utils/`, con `git mv` y **sin tocar su cuerpo ni sus tests**. Las
estrategias viven en `shared/` y las necesitan, y una carpeta de `shared/` no
puede depender de una funcionalidad (apartado 6 de `CLAUDE.md`).

No estaba previsto en el plan de la fase: es la desviación **D1** del registro,
aprobada por el usuario en la parada del ciclo 6. `isMonthlyLine`, además, ya la
importaba el reducer desde `context/` desde la Fase 5, así que llevaba una fase
mal colocada.

### Documentación

- [ADR 0010](docs/adr/0010-como-se-aplican-los-descuentos.md): cómo se aplican
  los descuentos —por bloque, sumados, umbrales sobre el subtotal y tope
  truncado— y dónde se redondea cada uno.
- [ADR 0011](docs/adr/0011-sin-compromiso-total.md): por qué no se muestra el
  compromiso total de los servicios mensuales.
- `docs/prompts/fase-06.md` con el registro de la fase, las dos desviaciones y el
  control positivo del ciclo 9.

---

## Verificaciones de la Fase 6

| Comprobación                           | Resultado                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run format:check`                 | en verde (tras formatear los archivos nuevos)                                 |
| `npm run lint`                         | código de salida 0, sin ni una línea de salida                                |
| `npm test`                             | **388 de 388 en verde** (300 anteriores + 88 nuevos)                          |
| `tsc -b`                               | código de salida 0                                                            |
| `npm run build`                        | correcto — 239,19 kB de JS (74,72 kB comprimido), 14,53 kB de CSS             |
| Probado en el navegador por el usuario | los tres ejemplos calculados a mano, más el caso de 11 meses, cifra por cifra |

**Ocho ciclos rojo-verde completos y uno que no pudo serlo.** Cinco con el fallo
de importe sin resolver (0 tests ejecutados) y tres con fallos de aserción: 7 en
`calculateBudget`, 2 en el resumen y 5 en los dos componentes del selector.

**El ciclo 9 pasó a la primera, y se le hizo un control positivo.** Sus cinco
tests de integración describen un comportamiento que los ciclos 6 a 8 ya habían
implementado, así que no podían fallar. Se subió
`COMMITMENT_DISCOUNT_MIN_MONTHS` de 12 a 13 y **4 de los 5 se pusieron en rojo**;
el quinto siguió verde, correctamente, porque es el del borrador y no depende de
ninguna regla de descuento. Después se devolvió la constante y se comprobó con
`git diff --stat`, que no devuelve nada para ese archivo. Es la quinta aparición
de la familia de problemas del proyecto, y la primera **sin ningún síntoma**.

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

### Revisión de secretos (ejecutada al final, después de la documentación)

Nueve categorías de datos, **cada una con su control positivo**: la misma
búsqueda, con la misma herramienta, encontrando además algo que se sabe que
existe. Sin esa pareja, un «sin coincidencias» no distingue entre «no hay nada»
y «esto no está buscando» (problema **P9** de la Fase 2).

| Categoría                                                                                                             | Resultado                                                                                                                      | Control que valida la búsqueda                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Direcciones de correo (expresión genérica)                                                                            | solo la `@users.noreply.github.com` intencionada                                                                               | las encontró                                                                                                           |
| Rutas con el nombre de usuario de Windows                                                                             | ninguna en los archivos de este commit                                                                                         | encontró las de `docs/fase-00-*`, que son el pendiente nº 17                                                           |
| Claves, tokens y contraseñas                                                                                          | ninguna; solo la palabra, en las normas                                                                                        | encontró esas menciones                                                                                                |
| Datos de terceros                                                                                                     | ninguno                                                                                                                        | encontró «BIG School», que es la formación del autor                                                                   |
| **Nombre de la agencia e identificador del correo personal** del usuario, que los aportó en el momento de la revisión | **0 coincidencias**, ni en los archivos ni en el historial                                                                     | `Owencl9` en los archivos, y la misma orden de `git grep` sobre todos los árboles del historial sí devuelve resultados |
| Direcciones IP                                                                                                        | ninguna                                                                                                                        | encontró `localhost`                                                                                                   |
| Teléfonos                                                                                                             | ninguno; la única secuencia de nueve dígitos es el identificador de GitHub de la dirección `noreply`                           | encontró esa secuencia                                                                                                 |
| URL con credenciales, del tipo `esquema://usuario:clave@`                                                             | ninguna. **La única coincidencia de todo el repositorio es el ejemplo de esta misma celda**, escrito al documentar la revisión | se valida sola: ese ejemplo es a la vez la descripción de la categoría y el control positivo de su búsqueda            |
| Proveedores de correo personal                                                                                        | 0 en 0 archivos                                                                                                                | la misma expresión con la `noreply` la encuentra                                                                       |

Los términos de las dos últimas filas y de la quinta **los aporta el usuario en
el momento de ejecutar la revisión y no se escriben en el repositorio**: son
precisamente los datos que no deben aparecer (pendiente nº 15 y corrección
C4-11). Aquí se describen, no se reproducen, que es la norma del apartado 5 de
`CLAUDE.md`.

**Dos barridos hubo que repetirlos, y no por un falso negativo.** Las búsquedas
que llevaban el control dentro de la misma expresión devolvieron resultados
**paginados**, y en una lista cortada a quince líneas una coincidencia sensible
puede quedarse debajo del corte. Se repitieron sin el término de control y
contando archivos, de modo que cualquier salida fuese un hallazgo real. Es el
mismo problema **P9** visto desde el otro lado: no que la búsqueda no lea el
contenido, sino que no deje ver todo lo que ha leído.

**El historial se revisó también**, en tres sitios distintos: el contenido de
todos los árboles (`git grep` sobre `git rev-list --all`), los mensajes de los
**12** commits y las firmas. Las identidades del historial son **una sola**, la
del correo `noreply`, como autor y como committer en los 12.

Y esta tabla **se escribió antes de volver a revisar el archivo que la
contiene**: documentar una revisión de datos personales es una forma habitual de
reintroducirlos, así que `PROGRESO.md` pasó otra vez por las nueve categorías
después de añadirla. Es la corrección **C2-5** de la Fase 2 —una revisión
describe un contenido concreto, y editar algo después la invalida— aplicada a su
propia documentación.

### Los tests anteriores que cambiaron, y por qué

El usuario pidió explicar cada uno. Son cuatro, todos en
`calculateBudget.test.ts`, y **ninguno fuera de ese archivo**:

| Test                                                        | Qué cambió                                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| «calcula los tres bloques de un presupuesto mixto»          | **Importes.** Tres servicios distintos activan el pack: 2.675 → 2.541,25 €, 267,50 → 254,13 €/mes, 128,40 → 121,98 €/año |
| «aplica a cada bloque el IGIC de su propia base»            | **Importes.** El IGIC mensual sale ahora de una base con pack: 1.750 → 1.663 céntimos                                    |
| «devuelve los tres bloques a cero con un presupuesto vacío» | **Forma, no importes.** `toEqual` compara el objeto completo y hay un campo nuevo                                        |
| «sigue el orden de cálculo del apartado 4.3»                | **Forma, no importes.** Igual que el anterior. **Este no estaba en la lista anunciada** (desviación D2)                  |

Y dos que siguen en verde con un texto corregido: el que se llamaba «no aplica
ningún descuento **todavía**» —ahora «cuando ninguna regla se cumple»— y el de
las siete líneas de 0,07 €, donde se ha anotado que **sí** lleva pack y que sus
dos cifras coinciden por aritmética, no porque el descuento no actúe.

Los 110 tests de la Fase 5, los ocho de integración de la Fase 4 y los del
catálogo, el formato de euros y la normalización de números **no se han tocado**.

### Verificación en producción (commit `7f15f93`)

Hecha el 25/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó **al servidor** con `git ls-remote`, no al
caché local de `origin/main`, y coincide con el local:
`7f15f93e0f8de5cf8cd89b2de511ebec5739738b`. Árbol de trabajo limpio y firma del
commit con el correo `noreply`, como autor y como committer.

| Comprobación                                                                    | Resultado                                                                              |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                                                                    | HTTP 200, **638 bytes**, y referencia los mismos nombres de recurso que el build local |
| JS publicado                                                                    | `index-n3ZBI3_0.js`, **239.199 bytes, igual que el build local**                       |
| CSS publicado                                                                   | `index-zt5yfvTK.css`, **14.538 bytes, igual que el local**                             |
| Cabeceras de seguridad                                                          | **4 de 4** correctas, más `Strict-Transport-Security`                                  |
| Sourcemaps (`.js.map`, `.css.map`)                                              | HTTP 404: el código fuente no queda expuesto                                           |
| Código fuente, `docs/`, `CLAUDE.md`, `package.json`, `.env`, `.git/config`      | HTTP 404 en las 17 rutas probadas                                                      |
| **`docs/privado/` y el documento que contiene**                                 | **HTTP 404**, en la ruta nueva y en la antigua                                         |
| Los archivos nuevos de esta fase (`packDiscount.ts`, `fase-06.md`, el ADR 0010) | HTTP 404: no se publica nada del repositorio                                           |

**Control positivo y negativo del contenido publicado.** La misma búsqueda,
sobre el mismo archivo, encuentra lo que tiene que estar y no encuentra lo que
no:

| Marcador                                            | Esperado | Resultado    |
| --------------------------------------------------- | -------- | ------------ |
| `Permanencia de 12 meses o más`                     | presente | **presente** |
| `Descuento por permanencia aplicado`                | presente | **presente** |
| `Pack de 3 servicios o más`                         | presente | **presente** |
| `Tope del 20 % del subtotal`                        | presente | **presente** |
| `Desde 12 meses: 10 % de descuento`                 | presente | **presente** |
| `Pago inicial superior a`                           | presente | **presente** |
| `Descuento de prueba del` (solo en los tests)       | ausente  | ausente      |
| `Solo para los tests.` (solo en los tests)          | ausente  | ausente      |
| `SEO de ejemplo` (dato de los tests)                | ausente  | ausente      |
| `Una pista de ejemplo` (dato de los tests)          | ausente  | ausente      |
| `prueba-todo` (estrategia que solo existe en tests) | ausente  | ausente      |

Los cinco últimos son lo que hace válidos a los seis primeros: sin ellos, un
«presente» no distingue entre «el código está publicado» y «la búsqueda
encuentra cualquier cosa».

**Un detalle del tope que la verificación aclara:** `Tope del 20 % del subtotal`
**viaja en el paquete publicado** aunque con las reglas actuales ese texto no
pueda aparecer nunca en pantalla. Es lo correcto —el código está ahí, listo para
cuando una regla cambie— y es también un recordatorio de que **estar en el
paquete no significa ser alcanzable**: lo que demuestra que la regla funciona son
sus tests, no su presencia en el JS.

**Y queda confirmado que el arreglo de Tailwind de la Fase 1 sigue en pie.** Este
commit añade 3.784 líneas, buena parte de ellas de documentación en Markdown, y
el CSS publicado tiene **el mismo nombre y el mismo tamaño** que el del build
hecho antes de escribirla. La documentación no entra en el CSS.

---

## Completado en la Fase 7

### El recorrido completo, de punta a punta

La aplicación pasa de **calcular un presupuesto** a **emitir un documento**. Con
el presupuesto hecho aparece el formulario del cliente, y al enviarlo el
documento **sustituye en pantalla al configurador**, con su número, sus dos
fechas y los mismos importes que había en el resumen.

**Ninguna cifra ha cambiado en esta fase**, y era la previsión de la Fase 6: el
presupuesto estaba funcionalmente completo y esta fase construye un documento con
las cifras que ya había. Los 388 tests anteriores siguen en verde y **solo dos
archivos de test anteriores se han tocado**, los dos para **añadir**: una
comprobación de coherencia en `business-rules.test.ts` y diez tests de
integración en `App.test.tsx`. Ningún importe esperado se ha modificado.

### El documento sustituye al configurador, y eso es una decisión de seguridad

El apartado 4.5 pide que en el documento impreso no aparezcan botones,
selectores ni el catálogo. Había dos formas de conseguirlo:

| Opción                                                            | Qué garantiza                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Abrir el documento debajo y ocultar el resto con CSS de impresión | Que no se imprima **mientras el CSS acierte**. Un elemento nuevo que nadie se acuerde de ocultar sale en el PDF que recibe un cliente |
| **Sustituir la pantalla** (elegida)                               | Que no se pueda imprimir, porque **no está en la página**. Y además no queda en el recorrido del teclado del documento                |

Lo que no existe no se puede imprimir. El CSS de impresión se queda así con
cuatro reglas pequeñas en lugar de ser el único guardián de la promesa, y lo que
sostiene la decisión es **un test de integración**, no una hoja de estilos.

Se consigue con un estado y sin ninguna librería de rutas: no hay URL que
compartir —el documento depende de datos que no se guardan—, así que un enrutador
no aportaría nada (apartado 7 de `CLAUDE.md`).

### El número de presupuesto, en cuatro piezas

| Archivo                                  | Qué hace                                               | Tests |
| ---------------------------------------- | ------------------------------------------------------ | ----- |
| `budget-document/budgetCounterFormat.ts` | La clave versionada, el tope y la forma de lo guardado | —     |
| `budget-document/budgetNumberFormat.ts`  | `(año, contador)` → `PRE-2026-0001`. Función pura      | 13    |
| `budget-document/parseBudgetCounter.ts`  | `unknown` → contador válido o `null`. Función pura     | 26    |
| `budget-document/budgetNumberStorage.ts` | Junta las tres con el navegador y reparte el número    | 18    |

Es **la misma repartición en cuatro piezas que el borrador de la Fase 5**
(formato, serialización, validación y almacenamiento), y no por simetría: la
única pieza con efectos es la última. Las otras tres se prueban sin navegador.

El formato, el reparto y la serie anual están razonados en el
[ADR 0012](docs/adr/0012-numero-de-presupuesto.md). Lo esencial:

- Se reparte **una sola vez por presupuesto**, al abrir el documento. No al
  cargar la aplicación —cada visita quemaría un número— ni al imprimir
  —imprimir dos veces daría dos números para el mismo documento—.
- El contador avanza en ese mismo instante.
- **«Empezar de nuevo» olvida el número** (decisión del usuario): lo que viene
  después es otro presupuesto. **El contador no se borra**, porque si se borrara
  el siguiente repetiría el número del anterior.
- El año sale de la **fecha de emisión**, no del reloj, para que el año del
  número y la fecha impresa no puedan discrepar.

**El tope del contador salió de un hallazgo, no de una previsión de uso.**
`Number.isInteger(1e21)` es `true` y `String(1e21)` es `'1e+21'`: sin tope, un
contador manipulado a mano en el navegador podía imprimir **`PRE-2026-1e+21`** en
el documento de un cliente. Es el mismo tipo de detalle que la notación
exponencial de los precios en el JS publicado de la Fase 2: un número sigue
siendo un número hasta que hay que escribirlo.

### Las fechas, con el reloj por la puerta de los tests

| Archivo                             | Qué hace                               | Tests |
| ----------------------------------- | -------------------------------------- | ----- |
| `shared/utils/formatSpanishDate.ts` | `Date` → `25/11/2026`                  | 8     |
| `budget-document/budgetValidity.ts` | Emisión + 30 días → fecha de caducidad | 15    |

- La validez son **30 días**, en `business-rules.ts` como todas las reglas, y el
  documento muestra **las dos fechas**.
- Se suman **días de calendario**, no milisegundos: `setDate(getDate() + 30)`.
  Sumar `30 * 24 * 60 * 60 * 1000` falla en los cambios de hora. Lo prueban dos
  tests de febrero: 31/01/2027 → 02/03/2027 y 31/01/2028 → 01/03/2028, que es
  bisiesto.
- `formatSpanishDate` lee los componentes **locales**. `toISOString()` convierte
  a UTC y en Canarias, en horario de verano, un presupuesto emitido a las 00:30
  se imprimiría con la fecha del día anterior. Está explicado en la cabecera del
  archivo para que nadie lo «simplifique».
- La fecha entra en `Configurator` por una prop inyectable, `now`, igual que el
  tipo de IGIC y las estrategias de descuento. **Ningún test depende del día en
  que se ejecute**: un test de fechas con el reloj del sistema caduca, y suele
  hacerlo el 1 de enero.

### Los datos del cliente, y qué sostiene que no se guarden

Resuelve el **pendiente nº 16**. Decisión del usuario: no se guardan en ninguna
parte. Razonado en el
[ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md).

Lo que sostiene la promesa no es la intención de no escribir la línea que los
guardaría, es **dónde vive el estado**:

| Dato                      | Dónde vive                      | Consecuencia                                   |
| ------------------------- | ------------------------------- | ---------------------------------------------- |
| Las líneas                | el reducer del Context          | el efecto que guarda el borrador las serializa |
| **Los datos del cliente** | un `useState` de `Configurator` | **el efecto no los ve: no puede guardarlos**   |
| El número y la fecha      | un `useState` de `Configurator` | se olvidan al recargar y al empezar de nuevo   |
| El contador               | `localStorage`, clave propia    | sobrevive, para no repetir número              |

Y dos tests lo vigilan: uno de integración que mira el contenido **real** de
`localStorage` tras rellenar el formulario con un correo —ni una `@`, con
**control positivo**, porque el mismo volcado sí contiene `corporate-website` y
`lastNumber`— y otro en el formulario que comprueba que `fetch` no se llama, que
el `<form>` no tiene `action` y que el envío se intercepta.

La clave del contador es **distinta de la del borrador** a propósito: tienen
vidas distintas, y guardarlos juntos haría que un formato nuevo de borrador
—un `:v2`— se llevara por delante la numeración.

### La validación del formulario

Las reglas las propuso el asistente y las aprobó el usuario: **nombre
obligatorio, empresa y correo opcionales**.

| Campo   | Regla                                                         |
| ------- | ------------------------------------------------------------- |
| Nombre  | obligatorio, de 2 a 80 caracteres                             |
| Empresa | opcional, hasta 80 caracteres                                 |
| Correo  | opcional, hasta 254 caracteres y con formato `nombre@dominio` |

- Los límites viven en `business-rules.ts`, con el resto de las reglas. El 254
  del correo es el máximo de la [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321),
  no una cifra redonda inventada.
- La expresión del correo es **deliberadamente permisiva**: hay algo, una `@`,
  algo, un punto y algo. Validar direcciones de correo «bien» es imposible, y
  cada intento de apretar la expresión rechaza direcciones legítimas. Quien se
  equivoca al escribir su correo no lo arregla una expresión regular.
- Se valida **al enviar**, y solo se revalida en caliente el campo que **ya**
  está mostrando un error. Escribir un correo letra a letra pasa por «a», «an»,
  «ana»…, y un formulario que protesta en cada pulsación es insoportable. Es el
  mismo criterio que el selector de cantidad de la Fase 4, que corrige al salir
  del campo.
- Los errores salen **todos a la vez**: enseñar uno, corregirlo y descubrir que
  había otro es la forma más rápida de que alguien abandone un formulario.
- Los valores se recortan antes de validarse y antes de imprimirse, así que un
  nombre de solo espacios no pasa.

**Los campos no llevan `maxLength`**, y es una decisión, no un olvido. Lo
destapó un test en rojo: con el atributo puesto, el error de longitud era
inalcanzable porque el navegador no dejaba escribir el carácter 81. Y había algo
peor que un test imposible: **pegar un nombre de empresa de 95 caracteres lo
truncaba en silencio**, y el documento salía con el nombre del cliente cortado
sin que nadie lo hubiera visto. Validar y explicar el problema es mejor que
impedirlo sin decir nada.

### El documento: el mismo resumen que la pantalla

| Archivo                              | Qué hace                                | Tests |
| ------------------------------------ | --------------------------------------- | ----- |
| `client-form/clientData.ts`          | El tipo, el valor vacío y el recorte    | 5     |
| `client-form/validateClientData.ts`  | Las reglas, con los mensajes en español | 28    |
| `client-form/ClientForm.tsx`         | El formulario accesible                 | 15    |
| `budget-document/DocumentLines.tsx`  | Los servicios, en modo lectura          | 8     |
| `budget-document/BudgetDocument.tsx` | El documento completo                   | 19    |
| `shared/constants/agency.ts`         | Los datos ficticios de la agencia       | 6     |

**El desglose del documento lo dibuja el mismo `BudgetSummary` de la pantalla**,
con el mismo presupuesto. No es ahorro de código: es la garantía de que lo
impreso y lo que se vio son la misma cifra. Un resumen propio para el documento
sería una segunda implementación de las mismas reglas, y dos implementaciones
acaban discrepando. El componente no cambió nada salvo una clase de impresión, y
sus catorce tests siguen en verde.

Lo que **no** se reutiliza es la línea del presupuesto: `BudgetLineItem` trae el
botón de quitar y los selectores. `DocumentLines` no dibuja **ningún botón ni
ningún campo**, y hay un test para cada una de las dos cosas.

**El cumplimiento del pendiente nº 12 sigue intacto:** ni el documento, ni el
formulario, ni `Configurator` hacen una sola cuenta. Los importes salen de
`calculateBudget` y `calculateFirstPaymentCents`, la fecha de validez de
`calculateValidUntil` y el número de `formatBudgetNumber`.

### Las dos cifras que no están, con guardianes

Los [ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md) y
[ADR 0011](docs/adr/0011-sin-compromiso-total.md) señalaban **esta fase** como
su momento de riesgo, porque una hoja con huecos invita a rellenarlos. Las dos
decisiones tienen ahora **tests negativos** en el documento:

| Lo que no aparece                   | Cómo se vigila                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Un total general                    | Exactamente tres «Total» en la página, uno por bloque. Un cuarto pondría el test en rojo                   |
| El compromiso total (meses × cuota) | Ni `5.400,00` (cuota × 12) ni `4.911,36` (la cuota ya rebajada × 12, que es la cifra que cita el ADR 0011) |

Así la decisión no depende de que alguien recuerde haber leído el ADR.

Lo que **sí** se imprime, por decisión del usuario, es la línea **«A pagar el
primer día (orientativo)»**, con la etiqueta idéntica a la de la pantalla y la
frase que dice qué incluye pegada debajo. El ADR 0008 lo exige así: suelta, esa
cifra vuelve a parecer el total que no es.

### El CSS de impresión, y lo que no tiene que hacer

Cuatro reglas en `src/index.css`, con `@page { margin: 15mm }`:

| Regla                                                                      | Para qué                                                                                  |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `.no-print { display: none !important }`                                   | Los dos botones del documento y la nota de la numeración                                  |
| `html, body` a blanco y negro                                              | El gris de la pantalla saldría como un lavado sucio                                       |
| `.min-h-screen { min-height: 0 }`                                          | Esa utilidad reserva la altura de la ventana y provocaba **una segunda página en blanco** |
| `break-inside-avoid` en la cabecera, los bloques y la línea del primer día | Un bloque partido deja el IGIC en una hoja y el total en la siguiente                     |

El `!important` está puesto a propósito y es el único del proyecto: tiene que
ganar a cualquier utilidad de Tailwind que declare `display` en el mismo
elemento, porque es la única regla cuyo fallo **acaba impreso**.

Lo que no se puede hacer desde el CSS: **quitar los encabezados y pies del
navegador**. La URL, la fecha y el número de página no son parte de la página.
Se desactivan en el diálogo de impresión, en «Más opciones» → «Encabezados y
pies de página», eligiendo «Guardar como PDF» como destino. Está documentado en
el README y en la cabecera de `index.css`.

**jsdom no aplica `@media print`**, así que el aspecto de la hoja no se puede
probar con Vitest. Lo que sí se prueba es que los elementos llevan la clase que
el CSS oculta. El resto lo comprobó el usuario con `Ctrl+P`, y en la Fase 8 se
puede emular el medio de impresión con Playwright.

### Los datos de la agencia, ficticios y comprobados

`shared/constants/agency.ts`, un único archivo con los siete campos que salen en
el documento. **Los valores son inventados y claramente de ejemplo**, con los
dominios bajo `.example`, que la
[RFC 2606](https://www.rfc-editor.org/rfc/rfc2606) reserva para esto.

Y no es una intención, hay **seis tests que lo vigilan**: el correo y la web
terminan en `.example`, ninguno de los campos contiene un dominio real
(`.com`, `.es`, `.net`, `.org`, `.io`, `.dev`), el NIF es una letra con ceros, el
teléfono es un prefijo con ceros y el nombre contiene la palabra «ejemplo». Si
alguien pegara ahí los datos reales de una agencia, **los tests se pondrían en
rojo antes de que el dato llegara a un commit**.

El pie del documento lo dice además en texto: «Documento de ejemplo. Los
importes y los datos de la agencia son ficticios.»

### Accesibilidad

- Jerarquía del documento sin saltos: **h1** «Presupuesto PRE-2026-0001» →
  **h2** Cliente, Servicios e Importes → **h3** «Resumen» → **h4** cada bloque.
  La del configurador no cambia, y el formulario es un **h2** más.
- El formulario es una **región con nombre accesible**, como las categorías del
  catálogo y el panel del presupuesto.
- Los mensajes de error están **asociados a su campo** con `aria-describedby`, y
  el test lo comprueba con `toHaveAccessibleDescription`, que prueba el
  resultado —lo que se lee al entrar en el campo— en lugar de la técnica.
- **El foco salta al primer campo con error** al enviar. Sin eso, quien usa el
  teclado se queda en el botón y tiene que recorrer la pantalla hacia atrás
  buscando qué ha fallado.
- Los errores llevan un **símbolo además del color rojo**: la información no se
  transmite solo con el color.
- «Opcional» va **en la etiqueta** del campo, no en un asterisco con leyenda: un
  lector de pantalla lee «asterisco», y la palabra entera viaja con el campo.
- El `<form>` lleva `noValidate`, que desactiva los mensajes del navegador.
  Salen en el idioma del navegador, no se pueden redactar, no se pueden asociar
  a un campo y no se pueden probar. El apartado 2 de `CLAUDE.md` exige los
  textos de interfaz en español.

### Las dos desviaciones del plan autorizado

- **D1 — Un archivo más de lo anunciado.** `budgetCounterFormat.ts` se separó de
  `budgetNumberStorage.ts` para que `parseBudgetCounter`, que es pura, no tenga
  que importar del módulo que toca `localStorage`. Es la lección **P25** de la
  Fase 6 aplicada sola: las dependencias van del lado con efectos al lado sin
  ellos, nunca al revés.
- **D2 — El formulario no decide si se ve.** La prop `hasLines` desapareció y la
  condición se subió a `Configurator`. El motivo está más abajo, en el problema
  P30. Consecuencia aceptada por el usuario: **vaciar el presupuesto vacía
  también el formulario**.

### Documentación

- [ADR 0012](docs/adr/0012-numero-de-presupuesto.md): el número de presupuesto
  —formato, cuándo se reparte, cuándo avanza el contador— y la numeración por
  navegador, con los tres sitios donde se avisa y el sitio donde no.
- [ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md): los datos del
  cliente no se guardan en ninguna parte, y qué lo sostiene.
- `docs/prompts/fase-07.md` con el registro de la fase, las dos desviaciones y
  las correcciones del usuario.
- `README.md`: apartado nuevo de **credenciales de prueba** (no hay login),
  estructura actualizada con las dos carpetas nuevas y los archivos de la raíz
  de `src/`, el documento del presupuesto, el aviso de la numeración por
  navegador y el de los datos ficticios de la agencia.
- **Norma nueva en el apartado 1 de `CLAUDE.md`** (corrección C6-1 de la Fase 6,
  ampliada por la del usuario en esta): los archivos se editan con la
  herramienta de edición, **nunca con comandos de shell**, tampoco para añadir
  texto al final.

---

## Verificaciones de la Fase 7

| Comprobación                           | Resultado                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `npm run format:check`                 | en verde (tras formatear los archivos nuevos)                               |
| `npm run lint`                         | código de salida 0, sin ni una línea de salida                              |
| `npm test`                             | **560 de 560 en verde**, 45 archivos (388 anteriores + 172 nuevos)          |
| `tsc -b`                               | código de salida 0                                                          |
| `npm run build`                        | correcto — 249,17 kB de JS (77,29 kB comprimido), 16,48 kB de CSS           |
| Probado en el navegador por el usuario | el recorrido completo, la vista de impresión con `Ctrl+P` y el PDF guardado |

**Los ciclos rojo-verde.** Cinco de lógica pura (datos de la agencia, formato de
fecha, validez, formato del número y el contador con su validación y su
almacenamiento), tres de componentes (formulario, documento y la integración en
`Configurator`), uno de CSS de impresión y **uno más añadido al cerrar la fase**,
el de la nota de la numeración en pantalla. Los de lógica pura fallaron con el
error de importe sin resolver y 0 tests ejecutados; los otros, con fallos de
aserción:

| Fallo de aserción que enseñó algo                    | Qué destapó                                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| El error de longitud del formulario era inalcanzable | El `maxLength` de los `<input>`, que además truncaba en silencio un nombre pegado                        |
| Dos tests de «Empezar de nuevo» en rojo              | **Devolver `null` no desmonta un componente** (problema P30)                                             |
| Los dos tests de la nota de la numeración            | Esa nota no estaba implementada, y el test que había afirmaba lo contrario de lo decidido (problema P33) |

No se ha instalado ninguna dependencia nueva, así que `npm audit` no cambia
respecto a la Fase 1.

### El CSS de impresión, comprobado en el build publicable

El CSS de impresión no se puede probar con Vitest, así que se comprobó que
**llega al paquete de producción**, con control negativo:

| Buscado en `dist/assets/index-*.css`                         | Resultado                                        |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `@media print`, `@page`, `.no-print{display:none!important}` | presentes                                        |
| `.break-inside-avoid` y `.print\:break-inside-avoid`         | **las dos**, la segunda dentro de `@media print` |
| `ESTO-NO-EXISTE` (control negativo)                          | ausente, así que la búsqueda funciona            |

**Y el primer recuento de esa comprobación engañó.** `grep -c` devolvió «1» para
`break-inside:avoid` y pareció que faltaba un selector. No faltaba: **`grep -c`
cuenta líneas, y un CSS minificado es una sola línea**. Hubo que mirar los
selectores uno a uno. Es el primo del hallazgo de la Fase 2 con los precios en
notación exponencial: sobre un archivo minificado, la herramienta contesta otra
pregunta de la que uno cree estar haciendo.

### Revisión de secretos (ejecutada al final, después de la documentación)

**Diez categorías de datos sobre los 36 archivos que entran en el commit**, cada
una con su control positivo: la misma búsqueda, con la misma herramienta,
encontrando además algo que se sabe que existe. Sin esa pareja, un «sin
coincidencias» no distingue entre «no hay nada» y «esto no está buscando»
(problema **P9** de la Fase 2).

**Esta fase es la primera que introduce correos y una dirección postal en el
código**, así que la categoría de correos devuelve coincidencias intencionadas y
había que identificarlas una por una, no contarlas.

| Categoría                                                                      | Resultado                                                                                                                                                | Control que valida la búsqueda                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Direcciones de correo (expresión genérica)                                     | **22 coincidencias, las 22 identificadas**: 2 de la `@users.noreply.github.com`, 1 de la agencia ficticia y 19 de tests                                  | se valida sola: encontró la `noreply`, que se sabe que está desde la Fase 1     |
| **Identificador del correo personal** del usuario, que lo aportó en el momento | **0 coincidencias**                                                                                                                                      | `Owencl9` con la misma orden: 3 archivos                                        |
| Proveedores de correo personal                                                 | **0 coincidencias**                                                                                                                                      | la misma expresión con `github` dentro: 20 coincidencias                        |
| Rutas con el nombre de usuario de Windows                                      | **ninguna.** La única coincidencia es el nombre del autor en la firma del primer commit, que es intencionada                                             | la misma expresión sobre `docs/prompts/fase-00.md` sí devuelve resultado        |
| Claves, tokens y contraseñas                                                   | ninguna; solo la palabra «secretos» en las normas y en esta misma documentación                                                                          | encontró esas 18 menciones                                                      |
| Direcciones IP                                                                 | ninguna                                                                                                                                                  | encontró `localhost`                                                            |
| Teléfonos                                                                      | solo el ficticio de la agencia, `+34` y ceros. **Segundo barrido** con nueve dígitos seguidos: solo el identificador de GitHub de la dirección `noreply` | los dos barridos devolvieron lo que se esperaba de ellos                        |
| URL con credenciales, del tipo `esquema://usuario:clave@`                      | ninguna. **La única coincidencia del repositorio es el ejemplo de esta celda**, escrito al documentar la revisión                                        | se valida sola, igual que en la Fase 6                                          |
| NIF, CIF y DNI con forma real                                                  | solo el ficticio de la agencia, una letra con ocho ceros, en sus tres apariciones (constante, test y documentación)                                      | la expresión reconoce la forma real de un CIF: encontró el ficticio por tenerla |
| Datos de terceros                                                              | ninguno. Las menciones a un profesor **describen** el incidente de la Fase 1 sin reproducir el dato                                                      | encontró «BIG School», que es la formación del autor                            |

El término de la segunda fila **lo aporta el usuario en el momento de ejecutar la
revisión y no se escribe en el repositorio**: es precisamente el dato que no debe
aparecer (pendiente nº 15 y corrección C4-11). Aquí se describe, no se reproduce.

**Una observación que sí acabó siendo un hallazgo**, y conviene contarla
completa porque es la revisión funcionando:

- La primera redacción de este apartado anotaba que las direcciones de los
  tests de formato del correo usaban **dominios inventados con extensiones
  reales** —`empresa.es`, `dominio.com`, `sub.dominio.org`— y lo daba por
  deliberado: esos tests existen para demostrar que la validación **acepta**
  direcciones legítimas, y para eso necesitan parecerlo.
- **El usuario no lo aceptó, y tenía razón** (corrección C7-4). Un dominio real
  pertenece a alguien, y en un repositorio público una dirección de prueba sobre
  un dominio ajeno es una dirección ajena. Las seis pasaron a dominios
  reservados por la
  [RFC 2606](https://www.rfc-editor.org/rfc/rfc2606) —`example.com`,
  `example.org`, `example.net` y el TLD `.example`—, **conservando lo que cada
  una demuestra**: la más corta, un punto en el nombre, el signo más, un guion
  con subdominio y las mayúsculas. Siguen pareciendo direcciones normales, que
  era todo lo que hacía falta.
- Lo que la corrección enseña del método: **una observación es un hallazgo al
  que todavía no se le ha puesto nombre.** Al escribirla ya estaba el dato
  delante —«dominios con extensiones reales»— y lo que faltó fue la pregunta
  siguiente: _¿de quién es ese dominio?_
- **Y faltaban dos apariciones más, que encontró el usuario al pedir la búsqueda
  sin exclusiones.** Mi primer barrido de comprobación filtraba `dominio.com`
  —uno de los dominios que había que cambiar— para que no ensuciara la salida, y
  con ese filtro el resultado salía limpio por construcción. Al repetirlo sin
  exclusiones aparecieron: el **mensaje de error del formulario** («formato
  nombre@dominio.com»), que **viaja en el JS publicado** y por tanto importa más
  que cualquier test, y un `ana@@ejemplo.com` dentro de un comentario que explica
  la expresión regular. Los dos pasaron a dominios reservados.
- El cambio del mensaje obligó a tocar **dos aserciones**, y hay que decirlo
  porque la corrección pedía no tocar ninguna: lo que cambia es la cadena con la
  que se compara, no lo que se comprueba —que el error del correo aparece
  asociado a su campo, y que no aparece antes de tiempo—.
- La dirección postal que entra en el código es la de la agencia ficticia:
  «Calle Ejemplo, 1», con el código postal de Las Palmas de Gran Canaria, que
  está ahí porque el impuesto del presupuesto es el **IGIC** y no el IVA.

Y esta tabla **se escribió antes de volver a revisar el archivo que la
contiene**: documentar una revisión es una forma habitual de reintroducir lo que
se quería retirar, así que `PROGRESO.md` pasó otra vez por las diez categorías
después de añadirla. Es la corrección **C2-5** de la Fase 2 aplicada a su propia
documentación, y van tres fases seguidas haciendo falta.

---

## Verificación en producción (commit `99dd7ba`)

Hecha el 25/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó **al servidor** con `git ls-remote`, no al
caché local de `origin/main`, y coincide con el local:
`99dd7bad09a306589d95f388c10cb3c14c9e4613`. Árbol de trabajo limpio y firma del
commit con el correo `noreply`, como autor y como committer.

**El mensaje del commit se escribió en un archivo fuera del proyecto y se pasó
con `git commit -F`** (como en la Fase 6), y se comprobó antes de enviarlo que el
archivo era UTF-8 sin BOM —la `ú` guardada como `c3 ba` y no como el `fa` de
CP1252— y después, que el mensaje guardado por git conserva las 19 líneas con
tildes.

| Comprobación                                                                            | Resultado                                                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                                                                            | HTTP 200, **638 bytes**, y referencia los mismos nombres de recurso que el build local |
| JS publicado                                                                            | `index-BpmhP4VQ.js`, **249.170 bytes, e idéntico byte a byte** al build local (`cmp`)  |
| CSS publicado                                                                           | `index-yYO2TO7R.css`, **16.482 bytes, idéntico byte a byte** al build local (`cmp`)    |
| Cabeceras de seguridad                                                                  | **4 de 4** correctas, más `Strict-Transport-Security`                                  |
| Sourcemaps (`.js.map`, `.css.map`)                                                      | HTTP 404: el código fuente no queda expuesto                                           |
| **`docs/privado/` y el PDF que contiene**                                               | **HTTP 404**, en la carpeta y en el archivo                                            |
| Código fuente, `docs/`, los dos ADR nuevos, `CLAUDE.md`, `package.json`, `.env`, `.git` | HTTP 404 en las 19 rutas probadas                                                      |
| Control positivo de esos 404                                                            | un recurso que **sí** existe devuelve 200, así que el 404 significa «no publicado»     |

Esta vez el `cmp` sustituye a la comparación de tamaños de las fases anteriores:
dos archivos del mismo tamaño pueden ser distintos, y lo que interesa saber es
que Vercel compiló **los mismos bytes**.

**Probado por el usuario en el dominio de producción**, que es lo que ninguna de
estas comprobaciones puede sustituir: el documento con `PRE-2026-0001`, las
cifras de su ejemplo 1 y la vista de impresión con `Ctrl+P`.

Y el número de ese documento es, por sí solo, la confirmación del
[ADR 0012](docs/adr/0012-numero-de-presupuesto.md) en vivo: en local la serie iba
ya por el 0002, y en producción empieza otra vez por el **0001** porque el
`localStorage` de ese dominio es otro. La numeración por navegador no es una nota
al pie del ADR, es algo que se ve.

**Control positivo y negativo del contenido publicado.** La misma búsqueda, sobre
el mismo archivo, encuentra lo que tiene que estar y no encuentra lo que no:

| Marcador                                                             | Esperado | Resultado    |
| -------------------------------------------------------------------- | -------- | ------------ |
| `Agencia Ejemplo, S.L.` y `contacto@agencia-ejemplo.example`         | presente | **presente** |
| `Documento de ejemplo. Los importes y los datos de la agencia…`      | presente | **presente** |
| `Imprimir o guardar en PDF`, `Volver al configurador`, `no-print`    | presente | **presente** |
| `La numeración se lleva en este navegador`                           | presente | **presente** |
| `configurador-presupuestos:budget-counter:v1`                        | presente | **presente** |
| `Escribe el nombre del cliente.` y `nombre@example.com`              | presente | **presente** |
| `Datos del cliente`, `Preparar el documento`, `Fecha de emisión`     | presente | **presente** |
| `nombre@dominio.com` (el texto que corrigió la C7-4)                 | ausente  | **ausente**  |
| `CONTROL-POSITIVO` (el dominio falso del control, ya revertido)      | ausente  | **ausente**  |
| `ana@ejemplo.example`, `Comercial del Norte` (datos de tests)        | ausente  | ausente      |
| `empresa.es`, `sub.dominio.org` (los dominios retirados)             | ausente  | **ausente**  |
| `nombre.apellido@example.com`, `MAYUSCULAS@EXAMPLE.COM` (solo tests) | ausente  | ausente      |
| `Solo para los tests.`                                               | ausente  | ausente      |

Las dos filas que más dicen son las del medio: **`nombre@dominio.com` ya no
viaja en el paquete publicado y `nombre@example.com` sí**, así que la corrección
C7-4 está en producción y no solo en el repositorio. Y `CONTROL-POSITIVO`
—el dominio falso que se usó para comprobar que las aserciones seguían atadas al
mensaje— **no llegó nunca al paquete**, que es la prueba de que se revirtió.

### El CSS de impresión, en producción

| Buscado en el CSS publicado                            | Resultado                      |
| ------------------------------------------------------ | ------------------------------ |
| `@media print`                                         | 2 (el de Tailwind y el propio) |
| `@page`, `min-height:0`                                | 1 cada uno                     |
| `display:none!important`                               | 2                              |
| `.break-inside-avoid{` y `.print\:break-inside-avoid{` | **1 cada uno**, los dos        |
| `ESTO-NO-EXISTE` y `.print\:NO-EXISTE{` (negativos)    | 0                              |

**Y el problema P35 apareció una tercera vez, con otro disfraz.** El primer
recuento de los dos selectores en producción devolvió **uno solo**, y pareció que
el de impresión no se había publicado. No faltaba: la expresión regular llevaba
la barra invertida mal escapada —cuatro barras en una cadena entre comillas no
son las que llegan al buscador— y el patrón no podía coincidir con nada. Con
búsqueda literal (`grep -F`) aparecen los dos, y se ven en su contexto.

Las tres veces de esta fase han sido la misma historia: **un número tranquilo que
resultó ser la respuesta a otra pregunta.** `grep -c` contando líneas sobre un
archivo minificado, un filtro que excluía justo el dominio buscado (corrección
C7-4) y ahora un escapado roto. La lección operativa es corta: **cuando una
búsqueda dice que algo no está, hay que comprobar que la búsqueda encuentra algo
que sí está** —y, si lleva metacaracteres, repetirla sin ellos.

---

## Completado en la Fase 8

### La instalación, y el riesgo R7 cerrado

Era la única instalación grande que le quedaba al proyecto, y la que llevaba
ocho fases anotada como riesgo abierto. Se hizo **en tres pasos separados**, por
la norma del apartado 1 de `CLAUDE.md`: una comprobación previa no puede ir en el
mismo comando que la acción que condiciona.

| #   | Comando                                     | Qué hizo                                        |
| --- | ------------------------------------------- | ----------------------------------------------- |
| 0   | `Get-PSDrive C`                             | 347,48 GB libres. Petición del usuario (C8-2)   |
| 1   | `npm install --save-dev @playwright/test`   | 3 paquetes, **ningún navegador**                |
| 2   | `npx playwright install --dry-run chromium` | **no descarga nada**: imprime URL y carpetas    |
| 3   | `npx playwright install chromium`           | la descarga, solo tras mostrar los datos reales |

El paso 2 no imprime los tamaños, así que se pidieron a los servidores con
peticiones de solo cabecera (`curl -sI`), que tampoco descargan el archivo.

| Archivo                           | Qué es                                | Descarga real |
| --------------------------------- | ------------------------------------- | ------------- |
| `chrome-win64.zip`                | Chrome for Testing 159.0.8154.6       | 207,3 MB      |
| `chrome-headless-shell-win64.zip` | El mismo navegador sin interfaz       | 123,8 MB      |
| `ffmpeg-win64.zip`                | Solo para grabar el vídeo de un fallo | 1,6 MB        |
| `winldd-win64.zip`                | Comprueba que no falte ninguna DLL    | 0,1 MB        |
| **Total**                         |                                       | **332,8 MB**  |

**La estimación previa se quedó corta, y conviene anotarlo:** el plan dijo
«~235 MB» y fueron 332,8 MB, un 42 % más. El motivo es que Playwright 1.65 ya no
descarga la compilación abierta de Chromium sino **Chrome for Testing**, que es
más grande, y añade dos utilidades que la estimación no contemplaba. La lección
operativa: cuando una cifra sirve para pedir una autorización, se pregunta al
servidor en lugar de estimarla. Ver el problema **P39** del registro de la fase.

| Medición posterior          | Valor                                                    |
| --------------------------- | -------------------------------------------------------- |
| **En disco**                | **742,8 MB** en 4 carpetas (451,9 + 286,7 + 3,8 + 0,2)   |
| Libre en C: antes / después | 347,48 GB → 346,7 GB                                     |
| Dónde                       | `%LOCALAPPDATA%\ms-playwright`, **fuera del proyecto**   |
| `npm audit`                 | **0 vulnerabilidades**, sin tocar ninguna versión (C8-3) |
| Versión                     | Playwright 1.65.1                                        |

Nada global de npm, ningún cambio del `PATH`, ningún permiso de administrador y
**solo Chromium**: ni Firefox ni WebKit. Para deshacerlo bastaría con borrar esas
cuatro carpetas y el paquete.

**Hallazgo previo:** la carpeta `ms-playwright` ya existía, con 140 KB en 33
subcarpetas **vacías** creadas el 16/10 por otra herramienta. No había ningún
navegador dentro, así que la descarga ocurrió completa. Comprobarlo antes evitó
dar por reutilizable algo que no lo era.

**Y el navegador se comprobó funcionando, no solo descargado.** `npx playwright
screenshot` sobre `about:blank` produjo un PNG de **1280×720**, verificado por su
firma de ocho bytes (`89 50 4e 47 0d 0a 1a 0a`) y sus dimensiones leídas de la
cabecera IHDR. Un archivo que existe no prueba que el ejecutable arranque; un PNG
válido con dimensiones correctas sí.

### Los cinco recorridos

Son **pocos y completos**, por decisión del usuario. Cada uno recorre una
historia entera en lugar de comprobar un detalle, porque un test E2E es caro de
mantener y lo que aporta es la cadena, no la pieza.

| Archivo                     | Qué recorre                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `full-budget.spec.ts`       | El ejemplo del usuario: catálogo → 12 meses → desglose fila por fila → documento → volver        |
| `draft-persistence.spec.ts` | El borrador sobrevive a la recarga; los datos del cliente no. Sobre el `localStorage` real       |
| `print-document.spec.ts`    | El documento con el medio `print` emulado: los botones y la nota se van, el presupuesto se queda |
| `keyboard.spec.ts`          | Del catálogo al documento **sin tocar el ratón**                                                 |
| `client-form.spec.ts`       | La validación, el foco en el error y **cero navegaciones** con la URL intacta                    |

### Lo que prueba un navegador real y jsdom no

Es la pregunta que decide si un test E2E merece existir, y la respuesta por
recorrido:

| Recorrido          | Lo que solo existe en un navegador de verdad                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Impresión          | **jsdom no aplica `@media print`.** Los tests de la Fase 7 solo podían comprobar que los elementos **llevan la clase** `no-print`, no que esa clase los oculte |
| Borrador           | Un `localStorage` de verdad y una **recarga** de verdad, con el paquete compilado                                                                              |
| Teclado            | El orden de tabulación lo decide el motor del navegador a partir del documento, los `tabindex` y **qué botones están desactivados**                            |
| Formulario         | **jsdom no navega nunca.** Sin el `preventDefault` del envío, los 560 tests seguirían verdes y los datos del cliente acabarían en la barra de direcciones      |
| Recorrido completo | Que lo que calcula `calculateBudget` llega a la pantalla, **sobrevive al paso por el formulario** y aparece igual en el documento                              |

La cuarta fila es la más clara de todas: es un fallo real, con consecuencias de
privacidad, **invisible para toda la suite de Vitest**.

### Las cifras del ejemplo, en un solo sitio

`e2e/exampleBudget.ts` guarda los tres servicios, los doce meses, las cifras
esperadas y la fecha congelada. Lo usan cuatro de los cinco recorridos, así que
si un día cambia el catálogo o una regla, **hay un único sitio que actualizar y
los cuatro tests se ponen rojos a la vez**, que es la señal correcta.

```
Pago inicial    2.500,00 € − 125,00 € → 2.375,00 € + 166,25 € = 2.541,25 €
Cuota mensual     450,00 € −  67,50 € →   382,50 € +  26,78 € =   409,28 €/mes
Pago anual        120,00 € −   6,00 € →   114,00 € +   7,98 € =   121,98 €/año

A pagar el primer día (orientativo): 3.072,51 €
```

Descuentos: 5 % de pack en los tres bloques y 10 % de permanencia en la cuota
mensual. El de importe no entra —2.500 € no pasa de 3.000 €— y nada llega al tope
del 20 %. El archivo **no acaba en `.spec.ts`**, así que Playwright no lo confunde
con un archivo de tests.

### El reloj, congelado

El documento imprime la fecha de emisión, la validez a 30 días y un número que
lleva el año dentro. Con el reloj del sistema, un test que afirmara
`PRE-2026-0001` **dejaría de pasar el 1 de enero**, y el proyecto tiene la norma
de que ningún test dependa del día en que se ejecuta.

Decisión del usuario, opción (a) de las dos que se plantearon: **congelar el
reloj del navegador** con `page.clock.setFixedTime()` y afirmar las tres cifras
exactas. Se usa `setFixedTime` y no `install` a propósito: `setFixedTime` solo
cambia lo que devuelven `Date.now()` y `new Date()` y **deja los temporizadores
corriendo**, que es lo que React necesita para dibujar. `install` los falsea
todos.

| Dato             | Valor afirmado  |
| ---------------- | --------------- |
| Fecha de emisión | 10/03/2026      |
| Válido hasta     | 09/04/2026      |
| Número           | `PRE-2026-0001` |

**La API del reloj no dio ningún problema con React, así que no hubo que pasar a
la opción (b).** Y trae su propio control incorporado: la fase se cerró el
26/11/2026, así que si el reloj no estuviera congelado estas tres aserciones
fallarían solas.

La zona horaria también se fija, en `playwright.config.ts`, a la de Canarias
—porque el impuesto es el IGIC— junto con el idioma. La hora va en UTC y el 10 de
marzo Canarias está en UTC+0, así que la fecha local del navegador es exactamente
el día 10. Sin fijar la zona, el mismo test daría otro día en el servidor de
GitHub Actions de la Fase 9.

### Los Page Objects, y los dos problemas concretos que resuelven

`e2e/pages/ConfiguratorPage.ts` y `e2e/pages/DocumentPage.ts`. Los pide el
apartado 6 del prompt maestro, pero aquí resuelven dos cosas reales de **esta**
aplicación:

1. **El botón de quitar un servicio se llama igual en dos sitios.** `Quitar
Tienda online del presupuesto` es el nombre accesible de la tarjeta del
   catálogo **y** de la línea del presupuesto. Es deliberado desde la Fase 4 —es
   la misma acción vista desde dos sitios— y significa que un localizador global
   encuentra dos elementos y Playwright se niega a actuar. Cada método busca
   dentro de su región.
2. **«Total» es una subcadena de «Subtotal».** Una búsqueda por texto parcial
   devuelve las dos filas del desglose. El método `fila()` compara el texto
   completo.

Todos los localizadores van **por rol y nombre accesible**, igual que los tests
de Vitest: así un cambio de clases de Tailwind no rompe nada y, de paso, cada
test comprueba que el nombre accesible sigue existiendo. La pista del selector de
meses se comprueba a través de `toHaveAccessibleDescription`, que es **lo que se
le anuncia a quien entra en el campo**, no la técnica con que se asocia.

**Las claves de `localStorage` están escritas a mano y no importadas de `src/`.**
Es una decisión, no un descuido: importarlas haría que el test siguiera
automáticamente cualquier cambio de la clave, y entonces dejaría de comprobar lo
único que importa de una clave de almacenamiento, que es **ser la misma de
ayer**. Si alguien la cambia, todos los borradores guardados en los navegadores
de quienes usan la aplicación quedan huérfanos, y eso es un cambio de
comportamiento que un test tiene que detectar, no acompañar.

### El tabulador: orden estricto donde se puede, alcanzabilidad donde no

El recorrido con teclado comprueba de dos formas distintas, y la diferencia tiene
causa técnica:

- **Orden estricto** en las tres primeras tarjetas del catálogo y en los tres
  campos del formulario con su botón. Ahí el test afirma exactamente dónde cae el
  foco en cada pulsación.
- **Alcanzabilidad** en el resto, con un ayudante `tabularHasta` que pulsa el
  tabulador hasta llegar. El número de pulsaciones hasta el panel del presupuesto
  **no es estable**, y no por un descuido: los botones «−» de los selectores
  están desactivados cuando el valor está en su mínimo, y **un botón desactivado
  no recibe el foco**. Un número fijo sería una trampa que se rompe al cambiar
  una cantidad.

Lo que queda probado es lo que exige el apartado 3 de `CLAUDE.md`: que todo es
alcanzable con el teclado. Si un control deja de serlo, el bucle se agota y el
test falla nombrándolo.

### La separación entre las dos suites, comprobada en los dos sentidos

La protección es doble —ni las carpetas ni los patrones de archivo coinciden— y
se verificó con su control positivo, porque un «0» no distingue entre «no hay
nada» y «esto no está buscando»:

| Comprobación                             | Resultado                                  | Control que la valida                      |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `npx playwright test --list`             | **5 tests en 5 archivos**, todos de `e2e/` | la misma orden encuentra los 5 `spec.ts`   |
| Archivos de `src/` en esa lista          | **0**                                      | ↑ la misma búsqueda sí encuentra algo      |
| `npx vitest list` con archivos de `e2e/` | **0**                                      | la misma orden cuenta los **45** de `src/` |

### Los archivos de configuración

| Archivo                | Qué se hizo                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `playwright.config.ts` | nuevo: `testDir: './e2e'`, solo Chromium, el `webServer`, idioma y zona horaria    |
| `tsconfig.e2e.json`    | nuevo: para que `tsc -b` **también revise `e2e/`** (decisión del usuario)          |
| `tsconfig.json`        | una referencia más                                                                 |
| `vite.config.ts`       | `preview: { port: 4173, strictPort: true }`                                        |
| `eslint.config.js`     | el bloque de React se acota a `src/`, y `e2e/` recibe el suyo con globales de Node |
| `package.json`         | tres scripts: `test:e2e`, `test:e2e:ui` y `test:e2e:report`                        |

Dos decisiones de esa tabla merecen explicación:

- **`reuseExistingServer: false`**, petición del usuario (C8-1). Con `true`, un
  `preview` que se hubiera quedado abierto de hace un rato se reutilizaría y los
  tests pasarían sobre **un build antiguo** sin que nada lo dijera. Así cada
  ejecución compila. Y como el puerto está fijado con `strictPort`, si está
  ocupado el servidor no arranca: falla pronto y con un mensaje legible, en lugar
  de probar contra otra cosa.
- **`tsc -b` incluye ahora `e2e/`**, con su consecuencia aceptada: un error de
  tipos en un test E2E para `npm run build`. El motivo es que un archivo que
  nadie revisa envejece mal, y hasta esta fase el compilador solo miraba `src` y
  `vite.config.ts`.

El `.gitignore` **no ha hecho falta tocarlo**: tiene `playwright-report`,
`test-results`, `blob-report` y `/playwright/.cache` desde la Fase 1, bajo el
comentario «Playwright (Fase 8)». Lo que se hizo fue comprobarlo (ver las
verificaciones).

### Documentación

- `docs/prompts/fase-08.md` con el registro de la fase.
- `README.md`: Playwright en el stack, los tres scripts nuevos y el `--headed`,
  un apartado sobre los tests de extremo a extremo con la descarga de los
  navegadores y sus tamaños, `e2e/` en la estructura, y la nota de que los tests
  unitarios viven junto al código **y los E2E son la excepción**, porque no
  prueban un archivo sino la aplicación entera desde fuera.
- **Ningún ADR nuevo.** No ha aparecido ninguna decisión que lo merezca: todo lo
  decidido en esta fase es configuración de herramientas, y está explicado en los
  comentarios de los archivos y aquí. Inventar un ADR para que la fase tenga uno
  sería documentación de adorno.

---

## Verificaciones de la Fase 8

| Comprobación           | Resultado                                                    | Código de salida |
| ---------------------- | ------------------------------------------------------------ | ---------------- |
| `npm test` (Vitest)    | **560 de 560 en verde**, 45 archivos, **ninguno modificado** | 0                |
| `npm run test:e2e`     | **5 de 5 en verde**, 9,3 s                                   | 0                |
| `npx tsc -b`           | sin una sola línea de salida, incluyendo ya `e2e/`           | 0                |
| `npm run lint`         | sin una sola línea de salida                                 | 0                |
| `npm run format:check` | «All matched files use Prettier code style!»                 | 0                |
| `npm run build`        | 249,17 kB de JS (77,29 kB comprimido), 16,48 kB de CSS       | 0                |
| `npm audit`            | 0 vulnerabilidades                                           | 0                |
| Probado por el usuario | en `test:e2e:ui` y con `--headed`                            | —                |

**El build es la mejor prueba de que esta fase no ha tocado la aplicación.** Los
nombres de los archivos compilados son `index-BpmhP4VQ.js` e
`index-yYO2TO7R.css`, **exactamente los mismos** que se verificaron en producción
al cerrar la Fase 7. Esos nombres salen del contenido, así que dos builds con el
mismo nombre son el mismo contenido. La Fase 8 solo ha añadido tests.

### La columna de códigos de salida no es decorativa

Está ahí porque el **primer** informe de `tsc` de esta fase salió con un rótulo
«código: 0» mientras tsc estaba fallando con diecisiete errores: el `$?` era el
de `tail` al final de la tubería, no el de `tsc`. Es exactamente la familia de
problemas del apartado 5 de `CLAUDE.md`, que entró en las normas en la Fase 4 por
un caso igual. Desde ese momento, cada comando guarda su código **antes** de
encadenar nada. Ver el problema **P38**.

### El control de que los recorridos no están huecos

El ciclo rojo-verde del apartado 3 de `CLAUDE.md` no se puede ejecutar tal cual
en un test E2E sobre funcionalidad ya hecha: el test nace en verde. Y **un test
que no se ha visto fallar no demuestra nada**, así que cada recorrido lleva un
control que puede dar negativo:

| Recorrido            | Su control                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recorrido completo   | Se afirmó **`2.541,26 €` a propósito**: tres de los cinco tests se pusieron rojos informando `Received: "2.541,25 €"`, el valor real leído del navegador. Revertido |
| Borrador             | Pareja positivo/negativo sobre la misma cadena: contiene `online-store`, no contiene `Tienda online`, `250000`, `2.500,00` ni `priceCents`                          |
| Volcado completo     | El mismo volcado contiene `online-store` y `lastNumber`, y **no contiene ninguna `@`**, tras haber escrito un correo y emitido el documento                         |
| Impresión            | Los mismos elementos, **visibles antes** de emular la impresión y ocultos después, y visibles **otra vez** al volver a `screen`                                     |
| Teclado y formulario | Afirman un estado del foco, una URL y un número de navegaciones concretos, que fallan solos si el recorrido se rompe                                                |
| Reloj                | Se incorpora solo: con el reloj sin congelar, las aserciones de fecha fallarían porque hoy no es el 10/03/2026                                                      |

De los dos que **no** se pusieron rojos con el céntimo de más, uno es el del
teclado —que solo afirma el total mensual— y el otro el del formulario, que no
afirma ninguna cifra. Que fallaran exactamente los tres que miran esa cifra, y no
los cinco, es parte de lo que valida el control.

### Los informes existen y Git no los ve

Esta comprobación tenía que distinguir «el `.gitignore` funciona» de «no hay nada
que ignorar»:

| Comprobación                                                | Resultado                                              |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `playwright-report/` y `test-results/` **existen en disco** | **sí**: 536 KB y 5 KB                                  |
| `git status --porcelain` tras una ejecución completa        | solo los cambios previstos; **ninguna de las dos**     |
| `git check-ignore -v`                                       | las nombra git: líneas **39 a 42** del `.gitignore`    |
| Control negativo                                            | `playwright.config.ts` **no** está ignorado (código 1) |

### Revisión de secretos (ejecutada al final, después de la documentación)

**Diez categorías de datos**, cada una con su control positivo. Esta vez la
búsqueda se hizo con `git grep --cached`, es decir, **sobre el índice**: lo que
literalmente va a entrar en el commit, y no sobre los archivos del disco. Son 18
archivos nuevos o modificados, con el índice completo como contexto.

**Y lo primero fue comprobar el instrumento**, porque había un motivo concreto
para dudar: `git diff --stat` muestra `package-lock.json` como binario, y
`git grep` se salta los binarios. Resultó que sí lo lee —14 coincidencias de
«playwright»—, así que la revisión cubre los 18 archivos y no 17.

| #   | Categoría                                                          | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                    | Control que valida la búsqueda                                                  |
| --- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | Direcciones de correo (expresión genérica)                         | **48 coincidencias al cerrar la fase, las 48 identificadas**; cinco de ellas son ejemplos escritos en esta misma revisión y en la verificación en producción, que se redactó después. Las nuevas del código son todas `ana@example.com`, en los recorridos E2E, sobre un dominio reservado por la RFC 2606: la corrección **C7-4 se ha respetado**. El desglose por dominios dejó además un hallazgo para la Fase 10: ver el pendiente nº 20 | se valida sola: encuentra la `noreply`, que está desde la Fase 1                |
| 2   | **Identificador del correo personal** del usuario, aportado por él | **0 coincidencias**                                                                                                                                                                                                                                                                                                                                                                                                                          | `Owencl9` con la misma orden: 17 coincidencias en 6 archivos                    |
| 3   | Proveedores de correo personal                                     | **0 coincidencias**                                                                                                                                                                                                                                                                                                                                                                                                                          | la misma expresión con `github` dentro: 8 archivos                              |
| 4   | Rutas con el nombre de usuario de Windows                          | **8 coincidencias, ninguna de esta fase.** Las 8 están en dos archivos anteriores y son una decisión ya tomada: ver el pendiente nº 17, **cuya lista de sitios se ha corregido con este hallazgo**                                                                                                                                                                                                                                           | `ms-playwright` con la misma orden: 5 archivos                                  |
| 4b  | **La carpeta temporal de la sesión**                               | **0 coincidencias.** Era un riesgo real de esta fase: se trabajó con rutas absolutas de esa carpeta para la captura de prueba del navegador                                                                                                                                                                                                                                                                                                  | el mismo control que la fila 4                                                  |
| 5   | Claves, tokens y contraseñas                                       | ninguna. Solo la palabra en prosa, en las normas y al documentar estas mismas revisiones                                                                                                                                                                                                                                                                                                                                                     | encontró esas menciones                                                         |
| 6   | Direcciones IP                                                     | ninguna                                                                                                                                                                                                                                                                                                                                                                                                                                      | `localhost` con la misma orden: 3 archivos, uno de ellos `playwright.config.ts` |
| 7   | Teléfonos                                                          | **uno, el ficticio de la agencia** (`+34` y nueve ceros). La primera expresión no lo encontró: ver más abajo                                                                                                                                                                                                                                                                                                                                 | se valida sola al encontrarlo                                                   |
| 8   | URL con credenciales, del tipo `esquema://usuario:clave@`          | ninguna. Las dos únicas coincidencias del repositorio son **la descripción de esta categoría**, escrita al documentar esta revisión y la de la Fase 7                                                                                                                                                                                                                                                                                        | se valida sola, igual que en las fases 6 y 7                                    |
| 9   | NIF, CIF y DNI con forma real                                      | solo el ficticio de la agencia, `B00000000`, en sus tres apariciones                                                                                                                                                                                                                                                                                                                                                                         | la expresión reconoce la forma real de un CIF: por eso encuentra el ficticio    |
| 10  | Datos de terceros                                                  | ninguno. **No hay ni un correo ajeno en todo el repositorio** —lo garantiza la categoría 1—, las menciones a un profesor **describen** el incidente de la Fase 1 sin reproducir el dato, y hay **cero archivos `.pdf`, `.docx` o `.pptx` versionados**                                                                                                                                                                                       | `BIG School` con la misma orden: 3 archivos                                     |

El término de la fila 2 **lo aportó el usuario en el momento de ejecutar la
revisión y no se escribe en el repositorio**: es precisamente el dato que no debe
aparecer (pendiente nº 15 y corrección C4-11). Aquí se describe, no se reproduce.

#### Una categoría dio un falso negativo, y hubo que repetirla

**La primera expresión de teléfonos devolvió 0, y en el repositorio hay un
teléfono.** El patrón exigía seis o más dígitos **seguidos** tras el prefijo, y el
teléfono ficticio de la agencia está escrito en grupos separados por espacios
(`+34 000 000 000`), así que no podía coincidir con nada. Un cero que parecía una
buena noticia.

Lo destapó saber de antemano que ese teléfono existe —lo documentó la Fase 7—, es
decir, **el control positivo haciendo exactamente su trabajo**. Repetida con una
expresión que admite grupos separados, devuelve una coincidencia: la esperada, y
ninguna más.

Es la cuarta vez en dos fases que ocurre lo mismo con otro disfraz: `grep -c`
contando líneas sobre un archivo minificado, un filtro que excluía justo el
dominio buscado, un escapado roto y ahora un patrón que no admite espacios. **La
lección ya no es una sorpresa:** un «sin coincidencias» solo vale si la misma
búsqueda encuentra algo que se sabe que está.

#### Un hallazgo de consistencia, no de seguridad

La revisión destapó que los recorridos nuevos introducían un **segundo** nombre de
empresa inventado para los datos de prueba, cuando los 560 tests anteriores usaban
uno solo. No era un problema de datos —los dos son inventados— pero sí dos cosas
donde el proyecto tiene una. **Se alinearon las cinco apariciones** con el nombre
que ya existía.

Y como esos cinco cambios se hicieron **después** de la revisión, la revisión se
repitió al terminar, sobre el índice ya corregido. Es la corrección **C2-5** de la
Fase 2 —una revisión describe un contenido concreto, y editar algo después la
invalida— y van **cuatro fases seguidas** haciendo falta.

#### Y la repetición encontró algo, que es la razón de repetirla

En la segunda pasada, **la categoría 4 pasó de 8 coincidencias a 9**. La novena
era texto escrito al corregir el pendiente nº 17 de este mismo archivo: para
documentar en qué archivos sigue viva la ruta de trabajo, se citó **literalmente**
el prompt en el que el usuario aprobó dejarla, y ese prompt la contiene. El
párrafo que documentaba dónde está el dato **metió el dato en un archivo donde no
estaba**.

Es el enunciado exacto de la corrección **C1-6** de la Fase 1, que está en el
apartado 5 de `CLAUDE.md` desde entonces, con su remedio incluido: describir el
dato en lugar de reproducirlo. Corregido así, la categoría vuelve a 8.

Lo que esta fase añade no es la norma, que ya existía, sino **cómo se detectó**:
no por recordarla al escribir, sino porque la revisión se repitió después de
editar y porque se comparó el recuento con el de la pasada anterior. Un 9 donde
antes había un 8 es un hallazgo; un 9 mirado sin el 8 delante habría pasado por
normal. Ver el problema **P42** del registro de la fase.

---

## Verificación en producción (commit `77bd38e`)

Hecha el 26/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó **al servidor** con `git ls-remote`, no al
caché local de `origin/main`, y coincide con el local:
`77bd38e0e5dd19f73c27f13c2e00f73155f57056`. Árbol de trabajo limpio, sin un solo
archivo sin seguimiento.

**El mensaje del commit se escribió en un archivo fuera del proyecto y se pasó
con `git commit -F`** (como en las fases 6 y 7). Comprobado antes de enviarlo que
el archivo era UTF-8 sin BOM —los tres primeros bytes son `46 61 73`, no
`ef bb bf`, y la `á` de «catálogo» está guardada como `c3 a1` y no como el `e1`
de CP1252— y después, que el mensaje guardado por git conserva sus 27 líneas con
tildes, y que **autor y committer** llevan los dos la dirección `noreply`, sin
ningún proveedor de correo personal.

| Comprobación                                                                | Resultado                                                                          |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `index.html`                                                                | HTTP 200, **638 bytes**, y referencia los mismos recursos que el build local       |
| JS publicado                                                                | `index-BpmhP4VQ.js`, **249.170 bytes, idéntico byte a byte** al local (`cmp`)      |
| CSS publicado                                                               | `index-yYO2TO7R.css`, **16.482 bytes, idéntico byte a byte** al local (`cmp`)      |
| `index.html`                                                                | **idéntico byte a byte** también                                                   |
| Control negativo de `cmp`                                                   | comparar el JS con el CSS **sí** detecta la diferencia, así que `cmp` funciona     |
| Cabeceras de seguridad                                                      | **4 de 4** de `vercel.json`, más `Strict-Transport-Security`                       |
| Control de la búsqueda de cabeceras                                         | una cabecera inventada no aparece, así que no hay falsos positivos                 |
| Sourcemaps (`.js.map`, `.css.map`)                                          | HTTP 404                                                                           |
| **`e2e/` y sus seis archivos, `playwright.config.ts`, `tsconfig.e2e.json`** | **HTTP 404 los ocho** (petición del usuario)                                       |
| `docs/privado/` y el PDF que contiene                                       | HTTP 404                                                                           |
| Código fuente, documentación, configuración y rutas de ataque               | HTTP 404 en las **44 rutas probadas**                                              |
| Control positivo de esos 404                                                | `/`, el JS y el favicon devuelven **200**, así que el 404 significa «no publicado» |

**Los tres archivos publicados son los mismos que verificó la Fase 7**, con el
mismo nombre y los mismos bytes. No es una casualidad ni un despliegue que no se
haya hecho: es la consecuencia de que esta fase **no toque la aplicación**. Los
nombres salen del contenido, así que un nombre igual es un contenido igual.

Y conviene decir qué **no** podía demostrar esta comprobación, porque callarlo
sería presentarla como más fuerte de lo que es: al ser los bytes idénticos a los
de la fase anterior, la comparación no distingue «Vercel ha desplegado este
commit» de «Vercel sirve todavía el anterior». Lo que sí demuestra es que **lo
que hay publicado coincide exactamente con este build**.

**Y ese hueco lo cerró el usuario, con una evidencia que la comparación no podía
dar.** En GitHub, el commit `77bd38e` muestra el check de despliegue de Vercel en
verde, **1 de 1**: Vercel sí desplegó este commit. Así que las dos mitades de la
afirmación están cubiertas, cada una por su medio: que el despliegue ocurrió lo
dice el estado del check, y que lo desplegado es exactamente este build lo dice
el `cmp`.

La anotación vale sobre todo por lo que enseña del método. Una comprobación que
no puede distinguir dos situaciones no se arregla repitiéndola ni afinándola:
**se complementa con otra que mire desde otro sitio**. Y el primer paso para eso
es haber dicho en voz alta qué era lo que no se podía demostrar, porque un hueco
que no se nombra tampoco se cierra.

### Que nada de los tests E2E viaja en el paquete publicado

Es la comprobación propia de esta fase, y se hace con la pareja de marcadores que
la hace válida: la misma búsqueda, sobre el mismo archivo, encuentra lo que tiene
que estar y no encuentra lo que no.

| Marcador                                                                     | Esperado | Resultado    |
| ---------------------------------------------------------------------------- | -------- | ------------ |
| `Agencia Ejemplo`, `Imprimir o guardar en PDF`, `Volver al configurador`     | presente | **presente** |
| `A pagar el primer día`, `La numeración se lleva en este navegador`          | presente | **presente** |
| `Escribe el nombre del cliente.`, `nombre@example.com`                       | presente | **presente** |
| `configurador-presupuestos:budget-draft:v1`                                  | presente | **presente** |
| `Comercial del Norte`, `ana@example.com` (datos de prueba)                   | ausente  | **ausente**  |
| `ConfiguratorPage`, `DocumentPage`, `tabularHasta`, `exampleBudget`          | ausente  | **ausente**  |
| `playwright`, `Playwright`, `emulateMedia`, `setFixedTime`, `localhost:4173` | ausente  | **ausente**  |
| `ESTO-NO-EXISTE-EN-NINGUN-SITIO` (control negativo)                          | ausente  | ausente      |

Las dos mitades juntas son lo que vale: **la aplicación entera está publicada y
ni una sola línea de los recorridos de prueba lo está**. `nombre@example.com` sí
viaja, porque es el mensaje de error que lee quien usa la aplicación;
`ana@example.com` no, porque solo existe en los tests. Y `localhost:4173` ausente
confirma que la dirección del servidor de pruebas no se ha colado en el paquete.

---

## Completado en la Fase 9

### Reglas de accesibilidad en el lint (pendiente nº 3)

`eslint-plugin-jsx-a11y` entra en el bloque de `eslint.config.js` que cubre
`src/`, no en el de `e2e/`, que no tiene ni un componente. Su configuración
recomendada trae **34 reglas: 31 activas como error** y tres que ella misma
desactiva (`anchor-ambiguous-text`, `label-has-for` y
`control-has-associated-label`).

**El plugin declara compatibilidad hasta ESLint 9 y aquí se usa con ESLint 10**,
así que npm cortaba la instalación. Se resolvió con un `overrides` en
`package.json` acotado a ese paquete —y no con `--legacy-peer-deps`, que cambia
la resolución del árbol entero y no queda escrito en ninguna parte—. Ver el
problema **P43**.

**No apareció ni un aviso de accesibilidad en los 45 archivos de la
aplicación**, y ese cero solo significa algo por dos comprobaciones que lo
acompañan:

| Comprobación                                                                                                                   | Resultado                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Control positivo** (petición del usuario): un archivo temporal con un `<img>` sin `alt` y un `div` con `onClick` sin teclado | **3 errores de `jsx-a11y`**, código de salida **1**. Las reglas disparan de verdad con ESLint 10 |
| Que las reglas alcancen a las subcarpetas, y no solo a la raíz de `src/`                                                       | las **34** se aplican sobre `src/features/client-form/ClientForm.tsx`                            |
| Lint del proyecto real, con el archivo de control ya borrado                                                                   | **sin una sola línea de salida**, código de salida **0**                                         |

Y el cero tiene una explicación que está en el código, no en la suerte:
**todos los `onClick` del proyecto están sobre un `<button>`**, y no hay ni un
`<img>` ni un `<a>`. Las reglas no tienen nada que denunciar porque la revisión
a mano de las fases 2, 4 y 7 ya dejó la aplicación así. Lo que estas reglas
comprueban es estático, así que **no sustituyen a esa revisión**: ninguna regla
puede saber si un nombre accesible es útil.

### La aserción hueca de la Fase 7, cerrada y demostrada

La Fase 7 dejó anotada una aserción de `ClientForm.test.tsx` que no vigilaba lo
que parecía vigilar: `expect(queryByText(…)).not.toBeInTheDocument()` pasa igual
si ese texto ya no existe en ninguna parte.

**Medido, y era peor que lo anotado:** con el mensaje del correo borrado de la
aplicación, de los 15 tests de ese archivo **solo se puso rojo uno, y era otro**.
En el proyecto entero lo detectan **10 de los 560**, nueve de ellos en
`validateClientData.test.ts`. El mensaje no estaba desprotegido; el test que
decía protegerlo no lo protegía.

**El arreglo no es el que la Fase 7 había propuesto.** Aquella nota proponía
comparar contra el principio del mensaje, lo cual arregla otra cosa —el test
estaba atado al ejemplo del texto, y eso también se ha hecho— pero deja la
aserción igual de hueca. Lo que cierra el hueco es un **control positivo dentro
del propio test**: tras comprobar que escribiendo en un campo limpio no aparece
ningún error, se envía el formulario y se comprueba, **con el mismo
localizador**, que entonces sí aparece.

| Paso | Estado                                  | Resultado                                                                |
| ---- | --------------------------------------- | ------------------------------------------------------------------------ |
| 1    | Mensaje borrado, **aserción antigua**   | **verde** — la prueba de que estaba hueca                                |
| 2    | Mensaje borrado, **aserción corregida** | **rojo**: `Expected the element to have attribute`                       |
| 3    | Mensaje restaurado, aserción corregida  | **verde**, 48 tests, y `git diff` del archivo de la aplicación **vacío** |

### El informe de cobertura

| Métrica    | Resultado             |
| ---------- | --------------------- |
| Sentencias | **97,99 %** (439/448) |
| Ramas      | **96,31 %** (235/244) |
| Funciones  | **99,11 %** (112/113) |
| Líneas     | **97,94 %** (428/437) |

**La cifra solo mide Vitest**, como dejó anotado la Fase 8: los cinco recorridos
de Playwright ejercitan muchísimo código y no aparecen aquí.

Las **9 sentencias** que faltan se miraron una por una: **seis** son el `default`
de un `switch` con `const x: never = service` en `calculateSubtotals`,
`createBudgetLine` y `parseDraft` —código que existe para **no compilar** el día
que alguien añada una cuarta forma de pago, no para ejecutarse—, una es el
descarte de un descuento de importe cero, una el valor por defecto del reloj de
`Configurator` (ningún test lo usa: todos inyectan una fecha fija, que es lo que
los hace deterministas) y una la salida temprana del selector de cantidad. No se
han añadido tests para subir el porcentaje: el desglose completo está en
`docs/prompts/fase-09.md`.

### Un duplicado agrupado, sin perder ningún caso

De los **512 bloques `it()`** (los 560 tests salen de ahí: las tablas `it.each`
expanden varios casos cada una), catorce títulos se repetían y **doce no eran
duplicados**: el mismo nombre sobre funciones distintas.

El duplicado real era uno: cinco tests de `buildPriceLabel.test.ts` que prueban
reglas de formato que ya prueba `formatEuros.test.ts`, **cuatro de ellos con la
misma entrada y la misma salida esperada**. Desde la Fase 3 `buildPriceLabel`
son dos líneas que llaman a `formatEuros`.

Decisión del usuario entre tres opciones: **los cinco casos pasan a una tabla
`it.each`** titulada «delega el formato en formatEuros». No se ha borrado ningún
caso ni se ha tocado un importe esperado, y **el total sigue en 560**. Lo que
cambia es lo que afirman: antes decían cinco cosas sobre un formato que esta
función ya no hace.

### Husky: el gancho de pre-commit

`.husky/pre-commit` ejecuta `format:check`, `lint` y los tests de Vitest, unos
25 segundos. **Los E2E no están ahí a propósito**: necesitan compilar, levantar
un servidor y abrir un navegador.

| Comprobación                                                                           | Resultado                                                                              |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Que el gancho **bloquee** un commit (archivo mal formateado, **sin añadir al índice**) | `husky - pre-commit script failed (code 1)`, y `HEAD` igual antes y después            |
| Que `set -e` corte en el primer fallo                                                  | solo se ejecutó `format:check`; no siguió con el lint ni los tests                     |
| Que el archivo no tenga BOM ni CRLF (lo romperían bajo `sh`)                           | empieza por el byte `23` (`#`) y tiene **cero retornos de carro**                      |
| Que `prepare` **no tumbe una instalación sin ganchos** (petición del usuario)          | en una carpeta sin `.git`, husky imprime «.git can't be found» y sale con código **0** |

**Hallazgo que corrigió un comentario propio:** husky 9 ya sale con código 0 por
su cuenta sin `.git`, así que el `|| true` del script `prepare` **no es lo que
protege a GitHub Actions ni a Vercel**. Lo que cubre es que husky no esté
instalado (un `npm ci --omit=dev`). Ver la corrección **C9-8**.

**Husky no se ha complicado en Windows**, así que no ha hecho falta activar el
primer elemento del orden de recortes.

### GitHub Actions

`.github/workflows/ci.yml`: un job con las seis comprobaciones, en el orden que
**falla rápido y barato primero** —formato, lint, tipos, tests, build y, al
final, los E2E, que son lo único que necesita compilar, servir y descargar un
navegador—.

El repositorio es privado y el gasto de pago está bloqueado a 0 $, así que las
medidas de coste no son estilo:

| Medida                                 | Qué evita                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `runs-on: ubuntu-latest`               | Los _larger runners_, que cuestan varias veces más por minuto                  |
| `push` solo en `main` + `pull_request` | La ejecución **duplicada** de una rama con pull request abierto                |
| `concurrency` con `cancel-in-progress` | Terminar una ejecución que el push siguiente ya ha dejado obsoleta             |
| `timeout-minutes: 20`                  | Que algo colgado gaste hasta el límite de **seis horas** del valor por defecto |
| Caché de npm y del navegador           | Volver a descargar 332,8 MB de navegador en cada ejecución                     |
| Solo Chromium                          | Descargar tres navegadores cuando la configuración usa uno                     |
| `permissions: contents: read`          | Cualquier permiso que este workflow no necesita. **Ningún secreto**            |

Dos detalles con su motivo:

- **20 minutos y no los 15 del plan** (corrección C9-6): la primera ejecución es
  la única sin caché de ninguna clase —baja dependencias, descarga el navegador,
  instala sus librerías con apt y compila dos veces—, y un corte por tiempo en
  el primer intento se parece demasiado a un fallo real.
- **El informe de Playwright se sube solo si fallan los E2E** (petición del
  usuario), con siete días de retención, y con una condición más estrecha que el
  `if: failure()` del prompt: `failure() && steps.e2e.outcome == 'failure'`. Con
  `failure()` a secas, un fallo del lint también activaría el paso, que
  intentaría subir una carpeta que en ese caso no existe.

**Las versiones mayores de las cuatro acciones oficiales se consultaron al
registro** en lugar de escribirlas de memoria, y eran todas más nuevas de lo
esperado: `checkout@v7`, `setup-node@v7`, `cache@v6` y `upload-artifact@v7`.

### Documentación

- `README.md`: el stack con las tres herramientas nuevas, un apartado
  **«Comprobaciones automáticas»** con los tres escalones (editor, pre-commit e
  integración continua) y qué pasa en cada uno, el apartado de accesibilidad, y
  las funcionalidades previstas actualizadas a las fases 10 y 11.
- `docs/prompts/fase-09.md`: el registro de la fase, con **cuatro problemas
  (P43 a P46)** y **diez correcciones del usuario (C9-1 a C9-10)**.
- **Ningún ADR nuevo.** Lo decidido aquí es configuración de herramientas, y está
  razonado en los comentarios de cada archivo. Inventar un ADR para que la fase
  tenga uno sería documentación de adorno.

---

## Verificaciones de la Fase 9

| Comprobación           | Resultado                                                           | Código de salida |
| ---------------------- | ------------------------------------------------------------------- | ---------------- |
| `npm run format:check` | «All matched files use Prettier code style!»                        | 0                |
| `npm run lint`         | sin una sola línea de salida, ya con las 31 reglas de accesibilidad | 0                |
| `npx tsc -b`           | sin una sola línea de salida                                        | 0                |
| `npm test` (Vitest)    | **560 de 560 en verde**, 45 archivos                                | 0                |
| `npm run coverage`     | 97,99 % de sentencias                                               | 0                |
| `npm run build`        | 249,17 kB de JS (77,29 kB comprimido), 16,48 kB de CSS              | 0                |
| `npm run test:e2e`     | **5 de 5 en verde**, 9,4 s                                          | 0                |
| `npm audit`            | 0 vulnerabilidades, con las dos dependencias nuevas                 | 0                |

**El build vuelve a ser la prueba de que esta fase no ha tocado la aplicación.**
Los archivos compilados son `index-BpmhP4VQ.js` e `index-yYO2TO7R.css`,
**exactamente los mismos nombres** que verificó la Fase 7 y repitió la Fase 8.
Los nombres salen del contenido, así que dos builds con el mismo nombre son el
mismo contenido.

**Los 560 tests se mantienen exactos**, y eso era un criterio del usuario: la
agrupación del duplicado se hizo con `it.each`, que conserva los cinco casos
como cinco tests, en lugar de fundirlos en uno (que habría dejado 556).

### Revisión de secretos (ejecutada al final, después de la documentación)

**Doce comprobaciones sobre el índice** —lo que literalmente va a entrar en el
commit, con `git grep --cached`, y no sobre los archivos del disco—, cada una
con su control positivo. Son **10 archivos**: 3 nuevos y 7 modificados.

**Y lo primero fue comprobar el instrumento:** `git grep --cached` ve las líneas
de los diez archivos, incluido `package-lock.json` con 6.299, que es el que la
Fase 8 temía que se saltara por parecer binario.

| #   | Categoría                                         | Coincidencias | Dónde                                                  | Control positivo                                                          |
| --- | ------------------------------------------------- | ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | Direcciones de correo (expresión genérica)        | **17**        | `PROGRESO.md` 14, `ClientForm.test.tsx` 3              | se valida sola: encuentra la `noreply`, intencionada desde la Fase 1      |
| 2   | **El nombre de la agencia** del usuario           | **0**         | —                                                      | la misma orden con `-i` sobre un término conocido: 7 líneas en 2 archivos |
| 3   | Proveedores de correo personal                    | **0**         | —                                                      | la misma expresión con `github` dentro: 4 archivos                        |
| 4   | Rutas con el nombre de usuario de Windows         | **0**         | —                                                      | la misma maquinaria de rutas sobre una que sí existe: 3 archivos          |
| 4b  | **La carpeta temporal de la sesión**              | **0**         | —                                                      | la misma orden sobre rutas presentes: 4 archivos                          |
| 5   | Claves, tokens y contraseñas                      | **28**        | `PROGRESO.md` 22, `README.md` 3, `fase-09.md` 3        | se valida sola: encuentra esas menciones en prosa                         |
| 6   | Direcciones IP                                    | **0**         | —                                                      | la misma maquinaria de números con puntos: 3 archivos                     |
| 7   | Teléfonos (admitiendo grupos separados)           | **2**         | `PROGRESO.md`                                          | se valida sola al encontrar el teléfono ficticio                          |
| 8   | URL con credenciales (`esquema://usuario:clave@`) | **3**         | `PROGRESO.md`                                          | se valida sola, igual que en las fases 6, 7 y 8                           |
| 9   | NIF, CIF y DNI con forma real                     | **1**         | `PROGRESO.md`                                          | la expresión reconoce la forma real: por eso encuentra el ficticio        |
| 10a | Datos de terceros                                 | **7**         | `PROGRESO.md` 6, `README.md` 1                         | se valida sola: encuentra el nombre del máster                            |
| 10b | Archivos ajenos versionados (`.pdf`, `.docx`, …)  | **0**         | — (sobre los **157** archivos del índice, no sobre 10) | la misma orden sin el filtro cuenta 157 archivos, 29 de ellos `.md`       |

**Las 17 de la categoría 1, identificadas una por una:** 14 son la dirección
`noreply` intencionada y las citas de dominios de ejemplo que la documentación
de las fases 1, 7 y 8 ya tenía escritas; las 3 de `ClientForm.test.tsx` son el
mismo correo de prueba sobre un dominio **reservado por la RFC 2606**, y son
anteriores a esta fase. **Ninguno de los tres archivos nuevos contiene una sola
dirección de correo.**

**Las 28 de la categoría 5 son todas prosa**: la palabra «secretos» en las
normas, en los apartados que describen estas mismas revisiones y, en los
archivos nuevos, las tres frases que dicen que el workflow **no usa ninguno**.
Más la palabra «token» dentro del nombre de un error de JavaScript.

**La categoría 7 tiene dos coincidencias y una de ellas es un falso positivo**,
que conviene decir en lugar de presentarla como un hallazgo: son **los nueve
dígitos del identificador de GitHub que van dentro de la dirección `noreply`**
—una expresión de teléfonos no puede distinguirlos de un número— y el teléfono
ficticio de la agencia, `+34` y nueve ceros, que ya estaba documentado desde la
Fase 7.

#### Dos comprobaciones dirigidas, por ser las novedades de esta fase

| Comprobación                                                                                                     | Resultado                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Que el workflow no referencie ningún secreto** (`secrets.`, `GITHUB_TOKEN`, `env:`, tokens con forma de clave) | **0 coincidencias.** Sus únicas cuatro expresiones son `github.workflow`, `github.ref`, `runner.os` y el hash del lock |
| **El dominio genérico del pendiente nº 20** (el que retiró la corrección C7-4)                                   | **5 coincidencias, las 5 en `PROGRESO.md`** y todas anteriores: ninguna la ha añadido esta fase                        |

El control positivo de la primera es la misma orden sobre el mismo archivo
buscando algo que sí está (7 líneas con `uses:`, `runs-on` o `${{`), y el de la
segunda, la misma maquinaria sobre el dominio reservado (3 archivos).

**El término de la categoría 2 lo aportó el usuario en el momento de ejecutar la
revisión y no se escribe en el repositorio**, aquí tampoco: es precisamente el
dato que no debe aparecer (pendiente nº 15 y corrección C1-6). Se describe, no se
reproduce.

#### La revisión se repitió, y la repetición movió tres recuentos

Escribir este apartado modificó dos archivos del índice, así que la revisión
anterior describía un contenido que ya no era el del commit. Es la corrección
**C2-5** de la Fase 2, y van **cinco fases seguidas** haciendo falta. Repetida
entera, **tres recuentos subieron y los otros nueve quedaron igual**:

| Categoría                          | 1.ª pasada | 2.ª pasada | Por qué                                                    |
| ---------------------------------- | ---------- | ---------- | ---------------------------------------------------------- |
| 5 — Claves, tokens y contraseñas   | 28         | **33**     | las cinco frases de este apartado que nombran la categoría |
| 8 — URL con credenciales           | 3          | **4**      | la descripción del patrón, escrita en la tabla de arriba   |
| Dirigida — secretos en el workflow | **0**      | **1**      | los nombres de las claves buscadas, citados en la tabla    |

**La tercera es la que había que mirar**, y por eso se comparó: un 1 donde antes
había un 0, justo en la comprobación de que el workflow no usa secretos, es la
forma que tendría un hallazgo de verdad. No lo es: la coincidencia está en este
archivo, en la frase que **describe** la comprobación, y sobre `.github/` y
`.husky/` el recuento sigue siendo **0**. Es el problema **P42** de la Fase 8 con
otro disfraz —documentar una comprobación mete en un archivo el patrón que la
comprobación busca—, pero sin su consecuencia: allí lo que se reproducía era una
ruta con un nombre de usuario, y aquí son **nombres de funciones de GitHub**, que
no son un dato de nadie.

Y conviene decir en voz alta dónde para esto, porque no para solo: cada vez que
se documenta un recuento, el documento cambia el recuento. Las cifras de arriba
son las de la segunda pasada **incluyendo el texto que las explica**, que es el
único punto en el que la cuenta se queda quieta. Lo que no se puede es dar por
buena una cifra medida antes de escribir el párrafo que la comenta.

---

## Verificación en producción (commit `e62115e`)

Hecha el 26/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó **al servidor** con `git ls-remote`, no al
caché local de `origin/main`, y coincide con el local:
`e62115e7aea00850b78887e10dc2d516fd8da823`. Con su control negativo: la misma
comparación contra el commit anterior **no** coincide, así que la comparación
funciona. Árbol de trabajo limpio.

**El mensaje del commit se escribió en un archivo fuera del proyecto y se pasó
con `git commit -F`** (como en las fases 6, 7 y 8). Comprobado antes de enviarlo
que era UTF-8 sin BOM —los tres primeros bytes son `46 61 73`, no `ef bb bf`, y
la `ó` de «código» está guardada como `c3 b3` y no como el `f3` de CP1252— y
después, que el mensaje guardado por git es **idéntico al archivo de origen**
(con `diff`, y con el control negativo que confirma que `diff` detecta
diferencias cuando las hay) y que **autor y committer** llevan los dos la
dirección `noreply`.

### La integración continua, en su primera ejecución (comprobado por el usuario)

| Comprobación                                             | Resultado                                               |
| -------------------------------------------------------- | ------------------------------------------------------- |
| Ejecución **CI #1** sobre `e62115e`                      | **Success**, 1 m 55 s en total (el job, 1 m 52 s)       |
| `npm ci`, el paso donde se ejecuta el `prepare` de Husky | **en verde, 7 s**                                       |
| Tests de Vitest **en el servidor**                       | **45 archivos y 560 de 560**, igual que en este equipo  |
| El paso del informe de Playwright                        | **saltado (0 s)** y la sección de artefactos **vacía**  |
| Checks del commit                                        | **«All checks have passed», 2 de 2**: CI y Vercel       |
| Despliegue de Vercel                                     | **«Deployment has completed»**                          |
| La aplicación en producción                              | **carga y funciona**, comprobado a mano en el navegador |

**El paso saltado es evidencia, no una ausencia.** Su condición es
`failure() && steps.e2e.outcome == 'failure'`, y los recorridos pasaron: un
artefacto subido ahí habría significado que la condición estaba mal escrita. Y
con los 560 tests dando el mismo número en Linux y en Windows queda cerrado de
hecho el riesgo que la Fase 8 anticipó al fijar el idioma y la zona horaria en
`playwright.config.ts`.

Con esto queda cerrada la corrección **C9-2** por sus dos mitades, cada una en
su servidor: el script `prepare` no rompe la instalación de GitHub Actions ni la
de Vercel. La comprobación en local no podía decir nada de ninguna de las dos.

### La segunda ejecución y la caché, con una predicción que no se cumplió (CI #2 sobre `3fbe9ab`)

Comprobado por el usuario en la pestaña **Actions**, sobre el commit de
verificación de la Fase 9:

| Qué se miró                       | CI #1 (`e62115e`) | CI #2 (`3fbe9ab`)        |
| --------------------------------- | ----------------- | ------------------------ |
| Resultado                         | Success           | **Success**              |
| Duración del job                  | 1 m 52 s          | **1 m 47 s**             |
| Caché de npm                      | se crea           | **«Cache hit»**, ~46 MB  |
| Caché del navegador de Playwright | se crea           | **«Cache hit»**, ~293 MB |
| Paso «Instalar Chromium»          | 19 s              | **10 s**                 |

**La lección está en la predicción que falló.** Yo había escrito que la segunda
ejecución tardaría «bastante menos», y la diferencia fueron **5 segundos de
112**. El criterio que propuse para saber si la caché funcionaba —«si tarda lo
mismo, la clave está mal»— era malo, porque confunde dos cosas distintas:
**reutilizar la caché** y **ir más rápido**. El discriminador correcto es el que
de verdad lo dice: la línea **«Cache hit»** del registro y los **megabytes
restaurados**. Las dos cachés acertaron, y la más pesada —los ~293 MB del
navegador— solo ahorra red: su paso bajó de 19 a 10 segundos, y esos 9 segundos
se diluyen en un job donde **59 de los 112 son Vitest y los recorridos de
Playwright**, que son CPU y no se cachean. Una caché ahorra descargas, no
trabajo.

### Los archivos publicados

| Comprobación                                                      | Resultado                                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `index.html`                                                      | HTTP 200, **638 bytes**, **idéntico byte a byte** al build local (`cmp`)                         |
| JS publicado                                                      | `index-BpmhP4VQ.js`, **249.170 bytes, idéntico byte a byte**                                     |
| CSS publicado                                                     | `index-yYO2TO7R.css`, **16.482 bytes, idéntico byte a byte**                                     |
| `favicon.svg`                                                     | **9.522 bytes, idéntico byte a byte**                                                            |
| Control negativo de `cmp`                                         | comparar el JS con el CSS **sí** detecta la diferencia, así que `cmp` funciona                   |
| Cabeceras de seguridad                                            | **4 de 4** de `vercel.json`, más `Strict-Transport-Security`                                     |
| Control de la búsqueda de cabeceras                               | una cabecera inventada no aparece, así que no hay falsos positivos                               |
| Sourcemaps (`.js.map`, `.css.map`)                                | HTTP 404                                                                                         |
| **`.github/workflows/ci.yml`, `.husky/pre-commit` y `coverage/`** | **HTTP 404 las tres, y también sus carpetas** (petición del usuario)                             |
| Código fuente, documentación, configuración y rutas de ataque     | HTTP 404 en las **20 rutas probadas**                                                            |
| Control positivo de esos 404                                      | `/`, `index.html`, el favicon y el JS devuelven **200**, así que el 404 significa «no publicado» |

**Los cuatro archivos son los mismos que verificaron las fases 7 y 8**, con el
mismo nombre y los mismos bytes, y van **tres fases consecutivas**. No es un
despliegue que no se haya hecho: el check de Vercel de este commit está en
verde. Es la consecuencia de que estas fases no toquen la aplicación.

### Que nada de las herramientas de esta fase viaja en el paquete publicado

Con la pareja de marcadores que hace válida la comprobación: la misma búsqueda,
sobre el mismo archivo, encuentra lo que tiene que estar y no encuentra lo que no.

| Marcador                                                                           | Esperado | Resultado    |
| ---------------------------------------------------------------------------------- | -------- | ------------ |
| `Tu presupuesto`, `A pagar el primer día`, `Imprimir o guardar en PDF`             | presente | **presente** |
| `Escribe el nombre del cliente.`, la clave del borrador                            | presente | **presente** |
| **`Escribe un correo con el formato`** — el mensaje que vigila el test arreglado   | presente | **presente** |
| `ubuntu-latest`, `actions/checkout`, `cancel-in-progress`, `timeout-minutes`       | ausente  | **ausente**  |
| `husky`, `pre-commit`, `format:check`, `jsx-a11y`, `ms-playwright`                 | ausente  | **ausente**  |
| `CONTROL-TEMPORAL` y `FORMATO-ROTO-TEMPORAL`, los dos archivos temporales borrados | ausente  | **ausente**  |
| `delega el formato`, el título del `it.each` nuevo                                 | ausente  | **ausente**  |
| `ESTO-NO-EXISTE-EN-NINGUN-SITIO` (control negativo)                                | ausente  | ausente      |

**La fila del medio es la que más dice de esta fase.** El mensaje del correo
**sí** viaja en el paquete publicado, y por eso importaba que su test lo
vigilara de verdad: es texto que lee quien usa la aplicación. Las dos filas de
los archivos temporales confirman lo otro: ni el archivo de control de
accesibilidad ni el que se usó para ver fallar el gancho llegaron a ninguna
parte.

---

## Completado en la Fase 10

### La revisión del historial completo, y los dos puntos ciegos que encontró

**20 commits, 161 rutas que han existido alguna vez, 11 categorías, cada una con
su control positivo.** El detalle está en
[docs/prompts/fase-10.md](docs/prompts/fase-10.md); aquí, el resultado y lo que
enseñó.

| Resultado                                                         | Categorías                                                                        |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **0 coincidencias**                                               | 2a, 2b, 2c (agencia, dominio y correo del usuario), 3, 4b, 5a, 5b, 6, 9 (DNI), 11 |
| Coincidencias **identificadas una por una** y todas intencionadas | 1 (365), 4 (169), 7 (314), 8 (20), 9-CIF (22), 10 (316)                           |

Las identidades de los 20 commits son **una sola** como autor y como committer,
la dirección `noreply`. Y ningún archivo ajeno —`.pdf`, `.docx`, imágenes— ha
entrado en ningún commit: las 161 rutas son código, documentación y
configuración.

**El método falló dos veces, y lo cazó el control positivo las dos.**

1. **`git grep -I` se saltaba `package-lock.json`.** `.gitattributes` lo declara
   `-diff` desde la Fase 1 —para que su diff no estorbe—, y ese atributo hace
   que Git lo trate como binario, así que el filtro de binarios lo excluía **sin
   avisar**. Las primeras pasadas corrieron sobre el historial menos **91.656
   líneas**. Repetido todo con `-a`: ningún resultado cambió, pero eso solo se
   sabe después de mirarlo.
2. **`grep` abandonó una enumeración** al toparse con un byte NUL, por el mismo
   tipo de filtro. El byte venía del hallazgo siguiente.

Ninguno de los dos dio un error: dieron un número más bajo del que tocaba.

**El tercero de la fase llegó después y fuera de esta revisión**, al limpiar el
árbol para el pendiente nº 17: un patrón con las barras invertidas mal escapadas
devolvió vacío sobre un archivo que sí las contenía. El mensaje del commit
`1f639f8` cuenta los tres juntos bajo este epígrafe; el reparto correcto es
**dos aquí y uno allí**, y se deja dicho aquí en lugar de reescribir el commit.

### El PDF ajeno estaba en `.git`, sin estar en ningún commit

`git fsck --dangling` devolvió **22 blobs no alcanzables** (1,95 MB): versiones
preparadas con `git add` y corregidas antes de commitear. Entre ellas, **el PDF
de requisitos del máster** (627.735 bytes, con el correo de una persona) y **dos
borradores de la Fase 1 que citaban los términos de búsqueda** en lugar de
describirlos: los borradores previos a la corrección **C1-6**, que es la norma
que lo prohíbe.

La revisión de la Fase 5 no podía verlos, y no fue un descuido:
`git rev-list --all --objects` lista lo **alcanzable**, y un objeto sin
referencia no aparece ahí por definición.

| Comprobación (petición del usuario)                                                           | Resultado           |
| --------------------------------------------------------------------------------------------- | ------------------- |
| Los 22 blobs en `git rev-list --objects --all`                                                | **0 de 22**         |
| Los 22 blobs en `git rev-list --objects refs/remotes/origin/main`                             | **0 de 22**         |
| **Control positivo:** los blobs de `PROGRESO.md`, `README.md` y `package-lock.json` de `HEAD` | **1 y 1**, los tres |

Así que **nunca salieron de este equipo**: un `push` solo transfiere objetos
alcanzables. Limpiados con autorización, en dos pasos y con la comprobación
antes de la acción (`git reflog expire --expire-unreachable=now --all` y
`git gc --prune=now`), tras verificar que el reflog no citaba **ningún commit
fuera de los 20**:

| Después                                 | Resultado                                 |
| --------------------------------------- | ----------------------------------------- |
| Blobs sueltos                           | **0** (antes 22), y `git fsck` sin salida |
| Objetos alcanzables                     | **390**, los mismos                       |
| Commits                                 | **20**, `HEAD` en `3fbe9ab`               |
| El término de la agencia en los sueltos | **0** (antes 5)                           |
| `docs/privado/…pdf`                     | **627.735 bytes**, intacto y aún ignorado |

### La Content-Security-Policy, y el guardián que la vigila

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self';
object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Ocho directivas, **sin `unsafe-inline` ni `unsafe-eval`**. Se puede ser así de
estricto porque se comprobó antes que la aplicación no carga nada de fuera: ni
un `style=` en línea, ni un `<style>`, ni un `url(` en el CSS, ni una fuente
web, ni un `fetch`, ni una URL absoluta. `X-Frame-Options` **se queda** junto a
`frame-ancestors`, para navegadores que no entiendan la segunda.

**El problema de fondo era cómo comprobarla**, y es lo mejor de la fase: los
recorridos E2E corren contra `vite preview`, que no sabe nada de `vercel.json`,
así que un `npm run test:e2e` en verde **no decía nada de la CSP**. Dos piezas:

- **`vite.config.ts` lee `vercel.json`** y sirve esas cabeceras en el `preview`.
  Una sola fuente, imposible de desfasar. Si la regla desapareciera, la función
  **lanza un error** en lugar de servir cero cabeceras.
- **`e2e/cspGuard.ts`** recoge las violaciones por dos vías —el evento
  `securitypolicyviolation` y la consola de Chromium— y pone el recorrido en
  rojo. Está en el desmontaje de un fixture automático, así que ningún recorrido
  puede olvidarse de comprobarlo.

**El control positivo que pidió el usuario** (quitar `style-src` a propósito)
demostró algo que no se buscaba:

| Paso | CSP                          | Resultado                                                               | Código |
| ---- | ---------------------------- | ----------------------------------------------------------------------- | ------ |
| 1    | La estricta                  | **5 passed** (10,8 s)                                                   | 0      |
| 2    | Sin `style-src`, a propósito | **5 failed**, y el fallo **solo** en `cspGuard.ts`, en ninguna aserción | 1      |
| 3    | Restaurada                   | **5 passed** (9,1 s)                                                    | 0      |

Con la hoja de estilos bloqueada, **todo lo que comprueban los cinco recorridos
seguía pasando**: buscan textos, roles, encabezados y foco, no colores. Sin el
guardián, una CSP que deja la aplicación desnuda habría salido en verde.

### Dependabot, para dos ecosistemas

`.github/dependabot.yml`: `npm` y `github-actions`, **mensual**, con los menores
y parches **agrupados en un solo pull request** por ecosistema y las mayores por
separado. El segundo ecosistema no es opcional: las acciones del workflow están
fijadas por versión mayor y no aparecen en ningún `package.json`.

Queda escrito en el archivo el disparador del **pendiente nº 21**: cuando llegue
el pull request de la versión siguiente de `eslint-plugin-jsx-a11y`, hay que
mirar su rango de dependencias de pares y **retirar el `overrides`** si ya admite
ESLint 10. Dependabot sube la versión, pero no sabe por qué existe el
`overrides`.

Dos notas que se anotan en lugar de disimularse: sus pull requests **no pasan por
el gancho de pre-commit** —los crea por API, así que la única red es el
workflow— y sus mensajes **están en inglés**, lo que desvía del apartado 2 de
`CLAUDE.md` y no es configurable.

### Los pendientes nº 17 y nº 20, resueltos

**Nº 17, la ruta de usuario de Windows.** Estaba en **169 líneas de los 20
commits, sin excepción**: 7 por commit en el inventario del entorno, 1 en
`docs/prompts/fase-01.md` y 1 más en `docs/prompts/fase-00.md` hasta que la
Fase 5 lo limpió. **Decisión del usuario: no se reescribe el historial**, con
sus razones escritas en el pendiente. Se ha limpiado del árbol actual
sustituyendo las rutas por `%USERPROFILE%` y `%LOCALAPPDATA%` —que describen el
sitio sin nombrar el perfil y siguen siendo ejecutables—, y la aparición que
vive dentro de una cita de un prompt se ha **redactado con marca visible y nota
al pie**: una redacción señalada no falsifica el registro, borrarla en silencio
sí. Comprobado: **0 coincidencias en el árbol**, con el control positivo de que
la misma expresión sigue encontrando las 8 en `HEAD`.

**Nº 20, el dominio genérico de la C7-4.** El pendiente contaba un dominio y la
corrección había retirado **tres**, con 21 citas en total: un hallazgo de esta
fase. Decisión del usuario: **la documentación se queda** —narra una corrección y
no contiene ningún dato de nadie— y **se neutraliza solo el comentario del
código**, que era el único sitio donde el dominio aparecía como si fuera un
ejemplo utilizable. La mención en el mensaje de commit de `835940f` también se
queda: cambiarla exigiría reescribir el historial.

### La lista de publicación, para ejecutarla a mano

[docs/fase-10-publicacion-github.md](docs/fase-10-publicacion-github.md), en
tres bloques: antes de cambiar la visibilidad, el cambio y después. **Los
nombres de los ajustes están consultados en la documentación de GitHub**, no
escritos de memoria, que es la lección 3 de la Fase 9. Incluye un paso de la
**cuenta** y no del repositorio, pedido por el usuario y que resultó ser el más
valioso: «Block command line pushes that expose my email» hace que GitHub
**rechace** un push cuyo último commit lleve una dirección privada de la cuenta,
es decir, automatiza la única norma del apartado 5 de `CLAUDE.md` que llevaba
nueve fases dependiendo de que alguien se acordara.

### Documentación

- `README.md`: la tabla de cabeceras pasa a cinco, con dos apartados nuevos —la
  CSP directiva por directiva y cómo se comprueba, y Dependabot— y el enlace a
  la lista de publicación.
- `docs/prompts/fase-10.md`: el registro de la fase, con **cuatro problemas
  (P47 a P50)** y **catorce correcciones del usuario (C10-1 a C10-14)**, más que
  en ninguna otra fase —la que más tenía era la 4, con once—, y seis de ellas
  llegaron mientras el usuario revisaba los documentos que esta fase estaba
  escribiendo.
- `.github/workflows/ci.yml`: el comentario que daba el repositorio por privado.
- **Ningún ADR nuevo.** Las dos decisiones con fondo —no reescribir el historial
  y describir el dominio en lugar de reproducirlo— son decisiones sobre datos
  concretos, con sus razones en los pendientes nº 17 y nº 20 y en el registro de
  la fase.

---

## Verificaciones de la Fase 10

| Comprobación           | Resultado                                              | Código de salida |
| ---------------------- | ------------------------------------------------------ | ---------------- |
| `npm run format:check` | sin cambios pendientes (tras formatear `README.md`)    | 0                |
| `npm run lint`         | sin una sola línea de salida                           | 0                |
| `npx tsc -b`           | sin una sola línea de salida                           | 0                |
| `npm test` (Vitest)    | **560 de 560 en verde**, 45 archivos                   | 0                |
| `npm run build`        | 249,17 kB de JS (77,29 kB comprimido), 16,48 kB de CSS | 0                |
| `npm run test:e2e`     | **5 de 5 en verde**, con la CSP servida por el preview | 0                |
| `npm audit`            | 0 vulnerabilidades                                     | 0                |

**El build es otra vez la prueba de que la aplicación no ha cambiado**, y esta
fase lo pone a prueba de verdad: se ha reescrito un comentario del código. Los
archivos siguen siendo `index-BpmhP4VQ.js` (**249.170 bytes**) e
`index-yYO2TO7R.css` (**16.482**), los mismos que las fases 7, 8 y 9. Los
comentarios no llegan al paquete publicado, y el nombre sale del contenido.
Comprobado además con la pareja de marcadores: el texto nuevo del comentario
**no** está en el JS y el mensaje de error del formulario **sí**.

### Revisión de secretos (ejecutada al final, después de la documentación)

**Sobre el índice** —lo que literalmente va a entrar en el commit, con
`git grep --cached`, y no sobre los archivos del disco—: **17 archivos**, 4
nuevos y 13 modificados, **6.381 líneas**. Y esta vez con `-a` en todas las
órdenes, por lo que destapó el problema **P47**.

Lo primero, el instrumento: las 17 rutas son legibles y la orden ve también
`package-lock.json`, que no entra en este commit pero sí está en el índice.

| #      | Categoría                                                                     | Coincidencias | Qué son / control positivo                                                                                                   |
| ------ | ----------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1      | Correos (expresión genérica)                                                  | **25**        | todas en `PROGRESO.md`, y **ninguna en los 4 archivos nuevos** (comprobado aparte)                                           |
| **2a** | El nombre de la agencia (`-i`)                                                | **0**         | control: la misma orden con `-i` sobre «husky», 21 líneas                                                                    |
| **2b** | El dominio del usuario                                                        | **0**         | ídem                                                                                                                         |
| **2c** | El correo del usuario                                                         | **0**         | ídem                                                                                                                         |
| 3      | Proveedores de correo personal                                                | **0**         | control: la misma expresión con `users.noreply.github` dentro, 12 líneas                                                     |
| 4      | Rutas con el nombre de usuario                                                | **0**         | control: las variables que las sustituyen, **12 líneas** (pendiente nº 17)                                                   |
| 4b     | Carpeta temporal **y el identificador de esta sesión** (petición del usuario) | **1**         | la **descripción de esta misma categoría** en el registro de la fase. Los dos identificadores de la carpeta de sesión: **0** |
| 5a     | Cadenas con forma de credencial                                               | **0**         | control: la misma expresión con `noreply` dentro, 33 líneas                                                                  |
| 5b     | Asignaciones `clave = valor largo`                                            | **0**         | control: la misma forma con `(version\|resolved\|integrity)` sobre el índice, **404**                                        |
| 6      | Direcciones IP                                                                | **0**         | control: la maquinaria de números con puntos, 21 líneas                                                                      |
| 7      | Teléfonos                                                                     | **6**         | 5 son el identificador de GitHub dentro de la dirección `noreply`; 1, el teléfono ficticio                                   |
| 8      | URL con credenciales                                                          | **4**         | las cuatro son la **descripción del patrón** en este archivo                                                                 |
| 9      | NIF / CIF / DNI                                                               | **1**         | el CIF ficticio de la agencia. DNI: 0                                                                                        |
| 10     | Datos de terceros                                                             | **16**        | «profesor» (11), «docente» (4), «tutor» (1) y «tutoriales» (2): el incidente C1-6 descrito                                   |
| 11     | Archivos ajenos versionados                                                   | **0**         | sobre los **161** archivos del índice. Control: el mismo filtro cuenta 31 `.md`                                              |

#### Dos comprobaciones dirigidas, por ser las novedades de la fase

| Comprobación                                                                                        | Resultado                                                                               |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Que **ni `ci.yml` ni `dependabot.yml` referencien un secreto** (`secrets.`, `GITHUB_TOKEN`, `env:`) | **0.** Control positivo: `uses:`, `runs-on` e `interval:` dan 7 líneas en esos archivos |
| Que **los tres dominios retirados por la C7-4 no aparezcan en los 4 archivos nuevos**               | **0.** Control positivo: la misma expresión sobre los 17 da 6 líneas, todas antiguas    |

**Los términos de las categorías 2a, 2b y 2c los aportó el usuario en el chat y
no se escriben en ningún archivo**, aquí tampoco: son precisamente los datos que
no deben aparecer. Se describen, no se reproducen (pendiente nº 15 y corrección
C1-6).

Y una nota de método que esta fase deja clara: **la categoría 4b coincide con la
descripción de la propia categoría**, igual que las cuatro de la 8. Documentar
una comprobación mete en el archivo el patrón que la comprobación busca. Es el
bucle que la Fase 9 describió, y por eso esta vez el usuario fijó la regla de
antemano: **una sola pasada escrita aquí**, y la comprobación posterior
—necesaria, porque escribir este apartado cambia el contenido del commit— se
hace y se reporta en el chat, sin volver a tocar el archivo.

---

## Verificación en producción (commit `1f639f8`)

Hecha el 27/11/2026 sobre https://configurador-presupuestos.vercel.app, después
del `push`. El SHA remoto se consultó **al servidor** con `git ls-remote`, no al
caché local de `origin/main`, y coincide con el local:
`1f639f83096af21d57442fbb3eac1657dd6df8ae`. Con su control negativo: la misma
comparación contra el commit anterior **no** coincide.

**El mensaje del commit se escribió en un archivo fuera del proyecto y se pasó
con `git commit -F`** (como en las fases 6 a 9), comprobado antes que era UTF-8
sin BOM —primeros bytes `46 61 73`, 51 bytes `c3` de letras acentuadas y **0**
bytes `f3` de CP1252— y después, que el mensaje **guardado en el objeto del
commit es idéntico byte a byte** al archivo de origen: 3.447 bytes los dos, con
`diff` y con `cmp`, y cada uno con su control negativo contra el mensaje del
commit anterior. Autor y committer, los dos con la dirección `noreply`.

Un detalle de método que merece quedar escrito, porque la primera comprobación
pareció fallar: `git log --format=%B` **añade un salto de línea al extraer**, así
que el `diff` contra el archivo daba una diferencia de una línea en blanco. No
era del commit. La comparación válida es contra el objeto en crudo
(`git cat-file commit HEAD`), y ahí no hay diferencia.

### La integración continua y el despliegue (comprobado por el usuario)

| Comprobación                        | Resultado                                         |
| ----------------------------------- | ------------------------------------------------- |
| Ejecución **CI #3** sobre `1f639f8` | **Success**, 1 m 44 s, todos los pasos en verde   |
| El paso del informe de Playwright   | **saltado (0 s)**: los recorridos pasaron         |
| Checks del commit                   | **«All checks have passed», 2 de 2**: CI y Vercel |
| Despliegue de Vercel                | **«Deployment has completed»**                    |

### Las cabeceras y los archivos publicados

| Comprobación                                                                                                                   | Resultado                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **`Content-Security-Policy`**                                                                                                  | presente, con **las ocho directivas exactas** de `vercel.json`                  |
| Las otras cuatro cabeceras                                                                                                     | **4 de 4**, más `Strict-Transport-Security` de Vercel                           |
| Control de la búsqueda de cabeceras                                                                                            | una cabecera inventada no aparece: no hay falsos positivos                      |
| **La CSP también sobre los recursos**, no solo sobre el HTML                                                                   | presente en el `.js`, el `.css` y el `favicon.svg`, los tres con HTTP 200       |
| `index.html`                                                                                                                   | **638 bytes, idéntico byte a byte** al build local (`cmp`)                      |
| JS publicado                                                                                                                   | `index-BpmhP4VQ.js`, **249.170 bytes, idéntico byte a byte**                    |
| CSS publicado                                                                                                                  | `index-yYO2TO7R.css`, **16.482 bytes, idéntico byte a byte**                    |
| `favicon.svg`                                                                                                                  | **9.522 bytes, idéntico byte a byte**                                           |
| Control negativo de `cmp`                                                                                                      | comparar el JS con el CSS **sí** detecta la diferencia                          |
| Sourcemaps (`.js.map`)                                                                                                         | HTTP 404                                                                        |
| **`vercel.json`, `vite.config.ts`, `e2e/cspGuard.ts`, `.github/dependabot.yml`, el documento de publicación y `/.git/config`** | HTTP **404** los seis                                                           |
| Control positivo de esos 404                                                                                                   | `/` y `/favicon.svg` devuelven **200**, así que el 404 significa «no publicado» |

**Van cuatro fases consecutivas con los mismos cuatro archivos**, y esta vez
además con la CSP delante: una cabecera no cambia un byte del contenido.

### La CSP en un navegador de verdad (comprobado por el usuario)

Con la consola abierta y **recarga forzada**, que es lo que descarta que se esté
viendo una copia en caché:

| Recorrido                 | Resultado                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| La aplicación             | **con sus estilos**, que es justo lo que el control positivo del guardián rompía                                                                                    |
| El borrador tras recargar | **sobrevive**: vuelve al configurador con el presupuesto y **sin los datos del cliente**, como fija el [ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md) |
| El documento              | `PRE-2026-0004`, correcto                                                                                                                                           |
| La vista de impresión     | correcta                                                                                                                                                            |
| **La consola**            | **«No issues»: ni un error, y ni un mensaje de CSP**                                                                                                                |

Con «All levels» aparece **un aviso amarillo, y conviene decir qué es en lugar de
omitirlo**: `[Violation] 'click' handler took 2784ms`, de Chrome, en el botón de
imprimir. No es un error ni tiene nada que ver con la CSP: `window.print()`
**bloquea el hilo mientras el diálogo de impresión está abierto**, y Chrome mide
ese tiempo como si fuera trabajo del manejador. Los 2,8 segundos son el rato que
el diálogo estuvo abierto, no una lentitud de la aplicación.

### Dependabot, funcionando desde el primer minuto

No esperó al calendario mensual: al subir `dependabot.yml` hizo su **revisión
inicial** y abrió **3 pull requests**.

| PR  | Qué propone                                                        | CI        | Qué demuestra                                                    |
| --- | ------------------------------------------------------------------ | --------- | ---------------------------------------------------------------- |
| #1  | `typescript-eslint` 8.73 → 8.74, **en el grupo** `minor-and-patch` | **verde** | La agrupación funciona: los menores y parches van juntos         |
| #2  | `typescript` 6.0 → **7.0** (mayor)                                 | **rojo**  | **La red funcionando** (ver abajo)                               |
| #3  | `@types/node` 24 → **26** (mayor)                                  | **verde** | Una mayor puede ser inofensiva, y por eso se miran de una en una |
| —   | `github-actions`                                                   | ninguno   | Las cuatro acciones ya están en su versión mayor más reciente    |

**El rojo de la #2 es el mejor resultado posible de esta fase**, y conviene
decirlo con precisión: una versión mayor de TypeScript rompió las comprobaciones
**en un pull request**, no en `main`. El workflow de la Fase 9 la frenó antes de
llegar a ninguna parte, y Dependabot la trajo por separado —y no dentro del
grupo de menores y parches— precisamente porque una mayor merece su propio
registro de CI. Las tres se deciden en la Fase 11; no se ha aceptado ninguna.
**Qué le pasa exactamente a TypeScript 7 se diagnostica entonces**, al decidir
el pull request, y no se adivina aquí.

Y la cuarta fila es una confirmación discreta de la Fase 9: aquella fase
consultó las versiones de las acciones al registro en lugar de escribirlas de
memoria, y Dependabot, que es quien de verdad lo sabe, **no ha encontrado nada
que actualizar**.

---

## Completado en la Fase 11

Última fase. **No se ha tocado código, tests, configuración ni dependencias.**

### El documento que pide el máster

[docs/desarrollo-con-ia.md](docs/desarrollo-con-ia.md): cómo se ha desarrollado
la aplicación con IA, en siete apartados —resumen, el proceso por fases, cómo se
ha trabajado con la IA, las decisiones, los problemas más significativos, las
correcciones del usuario y lo aprendido—. Enlazado desde el README. Cada cifra
sale de un archivo del repositorio o de `git log`: 79 correcciones en las fases 0
a 10, 50 problemas, 13 ADR, 22 commits y 161 archivos al cierre de la Fase 10.

### La documentación puesta al día

El repositorio es público desde el 27/11/2026 y había afirmaciones de estado que
decían lo contrario. Corregidas en `README.md` (el estado «en desarrollo (Fase 7
de 11)» y lo que daba por pendiente), en la cabecera y la tabla de fases de este
archivo, y en el apartado 5 de `CLAUDE.md`. **La narración fechada de los
registros de fase no se toca**: «el repositorio queda privado» es cierto en el
registro de la Fase 1, y reescribirlo falsificaría la evidencia del TFM.
`.github/workflows/ci.yml` ya estaba al día desde la Fase 10.

### La lista de publicación, ejecutada por el usuario (27/11/2026)

Resultado de
[docs/fase-10-publicacion-github.md](docs/fase-10-publicacion-github.md),
completada a mano. Es el pendiente nº 1, cerrado:

| Paso  | Resultado                                                                                                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A0    | «Keep my email addresses private» y «Block command line pushes that expose my email», **las dos activadas**                                                                                     |
| A1    | `7ed6a31` subido y **CI #7 en verde**                                                                                                                                                           |
| A2    | Sin secretos ni variables en Actions, y sin secretos de Dependabot                                                                                                                              |
| A3    | Permisos del workflow en **solo lectura**; «Allow GitHub Actions to create and approve pull requests» **desmarcada**                                                                            |
| A5    | Registros de Actions revisados: sin artefactos y solo rutas de la máquina de GitHub                                                                                                             |
| **B** | **Repositorio público el 27/11/2026**                                                                                                                                                           |
| A4    | Tras publicar: **«Require approval for all external contributors»**                                                                                                                             |
| C1    | Secret Protection y **Push protection** activadas                                                                                                                                               |
| C2    | Secret scanning: **«No secrets found»**, 0 alertas abiertas y 0 cerradas                                                                                                                        |
| C3    | Dependency graph, Dependabot alerts y Dependabot security updates **activados**; grouped security updates desactivado; malware alerts sin activar (opcional). **0 alertas de vulnerabilidades** |
| C4    | Dependabot vigila `package.json` y `.github/workflows/ci.yml`: los dos ecosistemas                                                                                                              |
| C5    | Ruleset **«proteger-main»**, Active, sobre la rama por defecto, con **solo** «Restrict deletions» y «Block force pushes», y bypass vacío                                                        |
| C6    | CI en verde; no ha habido pushes nuevos                                                                                                                                                         |
| C7    | **Private vulnerability reporting** activado                                                                                                                                                    |
| C8    | En Vercel, **Git Fork Protection** activada, y también Build Logs and Source Protection                                                                                                         |

El orden se respetó, y en el caso de A4 no es una preferencia: **GitHub solo
muestra «Require approval for all external contributors» en los repositorios
públicos**. Mientras el repositorio era privado, en su lugar aparecía otra
opción, «Run workflows from fork pull requests», que estaba desmarcada. El
ruleset de C5 va después por un motivo distinto: con GitHub Free los rulesets de
rama están disponibles en repositorios públicos.

**Nota sobre la numeración de CI:** la ejecución de `7ed6a31` es la **#7**. Los
números #4, #5 y #6 son los tres pull requests de Dependabot, no pushes.

### Los tres pull requests de Dependabot

**Cerrados sin fusionar por el usuario el 28/11/2026**, cada uno con su motivo
escrito en el propio pull request: no introducir cambios a dos días de la entrega
del TFM, y revisarlos después. Eran el **grupo de menores y parches** de
`typescript-eslint`, de 8.73 a 8.74 (#1), y dos **mayores**, que el
`dependabot.yml` manda por separado a propósito para que alguien las lea:
`typescript` 7.0.2 (#2) y `@types/node` 26.6.6 (#3). Quedan **0 abiertos y 3
cerrados**. Ninguno de los tres es el del pendiente nº 21, que sigue esperando
una versión de `eslint-plugin-jsx-a11y` que admita ESLint 10.

### Lo que queda fuera, con su motivo

El usuario decidió que la última fase fuera **sencilla y solo con lo esencial**,
sin funcionalidades nuevas ni cambios de código. De ahí salen los tres:

| #   | Pendiente                                     | Decisión                                                                                                                                                                                                     |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2   | El favicon sigue siendo el de Vite            | **Fuera.** Es un cambio de código                                                                                                                                                                            |
| 14  | El resumen fijo en un lateral                 | **Fuera.** Mejora opcional de maquetación, y también código                                                                                                                                                  |
| 22  | Los cuatro problemas con numeración duplicada | **No se renumera**, para no romper las referencias cruzadas de este archivo ni de los once registros de fase. Se citan como «P2 de la Fase 0» y «P2 de la Fase 1», que resuelve la ambigüedad sin tocar nada |

---

## Verificaciones de la Fase 11

Esta fase no toca código, y las comprobaciones sirven para demostrar justamente
eso.

| Comprobación           | Resultado                                                                 | Código de salida |
| ---------------------- | ------------------------------------------------------------------------- | ---------------- |
| `npm run format:check` | «All matched files use Prettier code style!»                              | 0                |
| `npm run lint`         | sin una sola línea de salida                                              | 0                |
| `npm test`             | **560 tests en 45 archivos**, todos en verde (16,4 s)                     | 0                |
| `npm run build`        | `index-BpmhP4VQ.js` (249.170 bytes) e `index-yYO2TO7R.css` (16.482)       | 0                |
| `npm run test:e2e`     | **5 recorridos en verde** (9,2 s), con el guardián de la CSP sin disparar | 0                |

Los dos nombres del build repiten los de las fases 7, 8, 9 y 10. El nombre sale
del contenido del archivo, así que repetirlo es la prueba de que el paquete
publicado no ha cambiado.

### Revisión de secretos sobre el índice

Sobre lo que va a entrar en el commit, con `git grep --cached` y `-a` en todas
las órdenes: **6 archivos** —4 modificados y 2 nuevos— y **163 rutas** en el
índice (las 161 del cierre de la Fase 10 más los dos documentos de esta fase).
Lo primero, el instrumento: la orden ve los seis archivos y lee su contenido.

| #      | Categoría                                     | Coincidencias | Qué son / control positivo                                                                                                                                                                                                                                                                                                |
| ------ | --------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Correos (expresión genérica)                  | **16**        | todas anteriores salvo una: 1 en `CLAUDE.md` (la dirección `noreply` de la norma) y 15 en `PROGRESO.md`. **0 en los dos archivos nuevos.** La única que añade este commit es la dirección de la línea `Co-Authored-By`, escrita al documentar aquí la revisión del mensaje (control: 16 líneas añadidas con «Fase 11»)    |
| **2a** | El nombre de la agencia (`-i`)                | **0**         | control: la misma orden con `-i` sobre «husky», 4 archivos                                                                                                                                                                                                                                                                |
| **2b** | El dominio del usuario                        | **0**         | control: la misma forma sobre `vercel.app`, 3                                                                                                                                                                                                                                                                             |
| **2c** | El correo del usuario, completo               | **0**         | control: la misma forma sobre la dirección `noreply` del proyecto, 2                                                                                                                                                                                                                                                      |
| 3      | Proveedores de correo personal                | **0**         | control: la misma expresión con `users.noreply.github` dentro, 7                                                                                                                                                                                                                                                          |
| 4      | Rutas con el nombre de usuario                | **0**         | control: las variables que las sustituyen (`%USERPROFILE%`, `%LOCALAPPDATA%`), 4                                                                                                                                                                                                                                          |
| 4b     | Carpeta temporal e identificador de la sesión | **0**         | control: la misma forma de ruta con barras sobre `docs/prompts`, 28                                                                                                                                                                                                                                                       |
| 5a     | Cadenas con forma de credencial               | **0**         | control: la misma expresión con `noreply` dentro, 59                                                                                                                                                                                                                                                                      |
| 5b     | Asignaciones `clave = valor largo`            | **0**         | **el primer patrón no podía encontrar una clave JSON, y lo delató su propio control: ver P51 a P55 del registro.** Corregido, el control da 404 líneas en `package-lock.json`                                                                                                                                             |
| 6      | Direcciones IP                                | **0**         | el instrumento reconoce una IP privada de muestra; control de la maquinaria de números con puntos, 7 líneas                                                                                                                                                                                                               |
| 7      | Teléfonos                                     | **5**         | **el primer patrón no podía coincidir con el teléfono ficticio, repitiendo el P40 de la Fase 8.** Con el patrón validado contra él: 2 son el identificador de GitHub dentro de la dirección `noreply`, 1 es la línea que narra ese P40 y las 2 que añade este commit son la descripción del P54 en el registro de la fase |
| 8      | URL con credenciales                          | **4**         | las cuatro son la **descripción del patrón** en tablas de revisiones anteriores de este archivo. Se valida sola                                                                                                                                                                                                           |
| 9      | NIF / CIF / DNI                               | **1**         | el CIF ficticio de la agencia, anterior. DNI: 0                                                                                                                                                                                                                                                                           |
| 10     | Datos de terceros                             | **10**        | «profesor» (6), «docente» (6), «tutor» (4) y «tutoriales» (2): el incidente C1-6 descrito. Las **3 líneas que añade este commit** son el rol «tutor técnico» del prompt maestro, la descripción del PDF ajeno y esta misma celda                                                                                          |
| 11     | Archivos ajenos versionados                   | **0** de 163  | control: el mismo filtro cuenta 33 `.md`                                                                                                                                                                                                                                                                                  |

Las cifras de las categorías 1, 7 y 10 son **las finales, medidas después de
redactar esta tabla**, y las tres incluyen la descripción de la propia revisión:
documentar un hallazgo reintroduce el dato del hallazgo, que es el P42 de la
Fase 8. La alternativa —no describir qué se encontró— deja un número sin
auditar.

**Los términos de las categorías 2a, 2b y 2c los aportó el usuario en el chat y
no se escriben en ningún archivo**, aquí tampoco: son precisamente los datos que
no deben aparecer. Se describen, no se reproducen (pendiente nº 15 y corrección
C1-6).

Y una comprobación de alcance que añade esta fase, a petición del usuario: la 5b
**corregida** sobre los 22 commits del historial da solo los hashes de
`package-lock.json` (6.806 líneas) y los datos de la ruta del favicon (22, una
por commit). La revisión de la Fase 10 **no estaba afectada**: su control
positivo dio 5.998 líneas, y un patrón que no casa con JSON no puede dar miles
de coincidencias de `integrity`.

### El mensaje del commit, revisado aparte

Vive fuera del árbol, así que `git grep --cached` no lo alcanza (corrección
C10-13). Escrito fuera del proyecto, en **UTF-8 sin BOM, comprobado byte a
byte**, y pasado con `git commit -F`.

Las 11 categorías sobre el archivo del mensaje dan **una sola coincidencia**: la
dirección `noreply@anthropic.com` de la línea `Co-Authored-By`. Las demás, 0,
cada una con su control positivo o con su instrumento comprobado sobre una
muestra: la expresión de la 4b reconoce la ruta real de la carpeta de sesión, la
de la 6 una IP privada, la de la 8 una URL con credenciales, la de la 9 un CIF y
un DNI de forma real, y la de la 11 una referencia a un PDF.

---

## Pendiente y vigilado

| #   | Asunto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Cuándo               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | ~~**Repositorio privado todavía, y el cambio de visibilidad lo hace el usuario a mano**~~ **resuelto el 27/11/2026**: el usuario ejecutó la lista completa de [docs/fase-10-publicacion-github.md](docs/fase-10-publicacion-github.md) —el ajuste de la cuenta, los cinco del repositorio, el cambio de visibilidad y los ocho de después— y el repositorio es **público**. El resultado paso a paso está en «Completado en la Fase 11». Los dos que no se podían saltar están activados: la **protección de push** y **«Require approval for all external contributors»**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                    |
| 2   | El favicon sigue siendo el de Vite. **Queda fuera de la entrega**: el usuario decidió que la Fase 11 fuera sencilla, solo con lo esencial y sin cambios de código                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                    |
| 3   | ~~`eslint-plugin-jsx-a11y` (reglas de accesibilidad)~~ **resuelto en la Fase 9**: 31 reglas activas sobre el JSX de `src/`, instaladas con un `overrides` porque el plugin declara compatibilidad solo hasta ESLint 9, y **comprobadas con un control positivo** que las vio disparar. Cero avisos en los 45 archivos de la aplicación                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                    |
| 4   | ~~Confirmar con el usuario los precios, el IGIC y las reglas de descuento~~ **resuelto en la Fase 3**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                    |
| 5   | ~~El `Service` type y el catálogo real sustituirán los datos provisionales de `App.tsx`~~ **resuelto en la Fase 2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                    |
| 6   | Si se regenera el andamiaje, usar `--eslint`: la plantilla ya usa Oxlint por defecto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                    |
| 7   | ~~Sustituir la conversión provisional de céntimos a euros de `buildPriceLabel` por el `formatEuros` probado~~ **resuelto en la Fase 3**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                    |
| 8   | ~~El contador «Servicios seleccionados» es provisional: lo reemplaza el resumen del presupuesto~~ **resuelto en la Fase 4**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —                    |
| 9   | ~~**Los meses de contratación no están en `BudgetLine`.** Entran con su selector~~ **resuelto en la Fase 4**: unión discriminada, meses obligatorios en la línea mensual                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                    |
| 10  | ~~**Decidir si el resumen muestra «lo que se paga hoy»**~~ **resuelto en la Fase 4**: sí, como línea informativa «A pagar el primer día (orientativo)», fuera del tipo `Budget` ([ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                    |
| 11  | ~~**A qué subtotal se aplica el descuento por pack**~~ **resuelto en la Fase 6**: a los tres bloques, con la condición evaluada sobre todo el presupuesto. Con ella se decidieron otras cuatro cosas que la especificación no contestaba —qué cuenta como servicio distinto, sumar en lugar de encadenar, los umbrales sobre el subtotal sin descontar y el tope por bloque— en el [ADR 0010](docs/adr/0010-como-se-aplican-los-descuentos.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                    |
| 12  | ~~`calculateBudget` es el único punto de entrada del cálculo: los componentes no deben hacer cuentas~~ **cumplido en las fases 4, 5 y 6**: ni el reducer, ni el proveedor, ni `Configurator`, ni el botón de reiniciar, ni el resumen, ni la línea del presupuesto hacen una sola cuenta. En la Fase 6 los descuentos y sus motivos salen de `calculateBudget`, y la pista del selector de meses sale de una función con tests que comparte la condición con la estrategia. **Cumplido también en la Fase 7**: ni el documento, ni el formulario, ni `Configurator` hacen una cuenta, y la fecha de validez y el número salen de funciones con tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                    |
| 13  | ~~**Añadir al apartado 1 de `CLAUDE.md` la norma de ritmo de la corrección C3-1**~~ **resuelto al abrir la Fase 4**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                    |
| 14  | **Mejora opcional, solo si sobra tiempo:** resumen fijo en un lateral en pantallas anchas, para no tener que bajar hasta el final para ver los totales. Petición del usuario en la Fase 4. Es maquetación, no cálculo: **se recorta antes que cualquier cosa de la lista del apartado 9 de `CLAUDE.md`**. **No se hace**: el usuario decidió que la última fase fuera sencilla, solo con lo esencial y sin funcionalidades nuevas ni cambios de código                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                    |
| 15  | ~~**Los términos concretos de la revisión de secretos los aporta el usuario**~~ **cumplido en la Fase 10**: los aportó en el chat al autorizar la fase —el nombre de la agencia, su dominio y su correo—, con la instrucción expresa de no escribirlos en ningún archivo. Las tres categorías dieron **0 coincidencias en los 20 commits**, y el control positivo de la primera no fue un término inventado: la misma expresión **sí** encontró el nombre de la agencia en los objetos no alcanzables de este mismo repositorio. En la documentación se describen, no se reproducen (corrección C4-11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                    |
| 16  | ~~**Decidir si los datos del cliente se guardan en el borrador.**~~ **resuelto en la Fase 7**: no se guardan en ninguna parte. Lo sostiene dónde vive el estado —fuera del reducer, que es lo único que el borrador serializa— y no la intención de no escribir la línea que los guardaría. Con dos tests que lo comprueban sobre el contenido real del navegador ([ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —                    |
| 17  | **La ruta absoluta de trabajo, con el nombre de usuario de Windows, sigue en el historial y también en el árbol actual.** Entró en la Fase 1 en `docs/prompts/fase-00.md`; en la Fase 5 se sustituyó **en ese archivo** por `%USERPROFILE%\…`, pero los commits anteriores la conservan. **La revisión de la Fase 8 encontró que sigue viva en dos archivos más**, que la redacción anterior de este pendiente no nombraba: `docs/fase-00-inventario-entorno.md` (**7 apariciones**: la carpeta del proyecto, la ruta de Git, el Escritorio, OneDrive y el editor) y `docs/prompts/fase-01.md` (**1**, dentro de un prompt en el que el usuario aprobó expresamente dejar esas rutas tal cual, y que por eso las contiene). Así que no es una fuga, es una **decisión tomada** cuya lista de sitios estaba mal anotada. ~~**Decidir en la Fase 10 si se limpia**~~ **resuelto en la Fase 10.** La revisión midió el alcance real —**169 líneas en los 20 commits, sin excepción**, incluido el primero— y con ese dato delante el usuario decidió **no reescribir el historial**, con sus razones: el dato es su nombre de usuario de Windows, que **ya es público** como autor de los 20 commits y como cuenta de GitHub, y reescribir los 20 a tres días de la entrega cambiaría todos los SHA, rompería las referencias cruzadas de este archivo y de los registros de fase, y dejaría sin correspondencia los despliegues ya verificados. **Sí se ha limpiado el árbol actual**: las 7 rutas del inventario pasan a `%USERPROFILE%` y `%LOCALAPPDATA%` —que describen el sitio sin nombrar el perfil y siguen siendo ejecutables— y la que vivía dentro de una cita de un prompt está **redactada con marca visible y nota al pie**. Comprobado: **0 coincidencias en el árbol**, con el control positivo de que la misma expresión sigue encontrando las 8 en `HEAD` | —                    |
| 18  | ~~**Nada en pantalla explica para qué sirven los meses.**~~ **resuelto en la Fase 6**: la pista bajo el selector de meses («Desde 12 meses: 10 % de descuento» → «Descuento por permanencia aplicado»), asociada al campo, y el motivo de cada descuento en el resumen, como pide el apartado 4.4 del prompt maestro. La pista comparte la condición con la estrategia, así que no puede anunciar un descuento que el presupuesto no lleva                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                    |
| 19  | ~~**Decidir si se muestra el compromiso total de los servicios mensuales**~~ **resuelto en la Fase 6**: no se muestra. Sería una cuarta cifra confundible con un total, y encima parcial, porque no incluiría el pago inicial ni el anual ([ADR 0011](docs/adr/0011-sin-compromiso-total.md))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                    |
| 20  | **El dominio genérico que la corrección C7-4 retiró del código sigue citado en la documentación.** La revisión de la Fase 8 contó los dominios uno a uno y encontró **13 apariciones** de ese dominio —el que está registrado por alguien y que la C7-4 sustituyó por los reservados de la RFC 2606—: 5 en este archivo, 7 en `docs/prompts/fase-07.md` y **1 en un comentario de `validateClientData.ts`** que explica precisamente por qué no se usa. Ninguna es una dirección utilizable: las 13 **describen la corrección**. Pero la norma C1-6 del apartado 5 de `CLAUDE.md` pide describir el dato en lugar de reproducirlo, y estas citas lo reproducen. ~~**Decidir en la Fase 10**~~ **resuelto en la Fase 10**, y con un hallazgo que corrige el propio pendiente: la C7-4 no retiró un dominio, retiró **tres**, y los tres seguían citados, **21 apariciones** en total. Decisión del usuario: **la documentación se queda** —narra una corrección y no contiene ningún dato de nadie, que es lo que distingue este caso de la C1-6— y **se neutraliza solo el comentario del código**, que era el único sitio donde el dominio aparecía como si fuera un ejemplo utilizable. La mención en el mensaje de commit de `835940f` también se queda: cambiarla exigiría reescribir el historial. Este pendiente sigue redactado sin reproducir el dominio, a propósito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                    |
| 21  | **El `overrides` de `eslint-plugin-jsx-a11y` es temporal por definición.** Está en `package.json` porque la 6.10.2, que es la última publicada, declara como dependencia de pares `eslint: ^3 \|\| … \|\| ^9` y el proyecto usa ESLint 10. El plugin funciona —la Fase 9 lo demostró con un control positivo que vio disparar tres reglas—, pero el `overrides` **silencia una comprobación de npm**, así que no debe quedarse más de lo necesario. **Retirarlo en cuanto el plugin publique una versión que admita ESLint 10 en su rango**, y comprobar entonces que el lint sigue dando los mismos resultados. **Dependabot ya está configurado para el ecosistema `npm`** (Fase 10) y abrirá el pull request de la versión nueva, así que el aviso llegará solo. El disparador está escrito también en `.github/dependabot.yml`, porque Dependabot **sube la versión pero no sabe por qué existe el `overrides`**: si nadie lo retira a mano, se queda                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Vigilancia posterior |
| 22  | **La numeración de los problemas tiene cuatro duplicados, y son los cuatro primeros.** `docs/prompts/fase-00.md` tiene su propio P1 a P4 y `docs/prompts/fase-01.md` volvió a empezar en P1; desde P5 la numeración ya es global y llega sin huecos hasta P46. Lo encontró la Fase 9 al comprobar que empezar en P43 no dejaba un hueco. **No es un error de contenido**: los ocho problemas existen y están descritos. Es una referencia ambigua: «el problema P2» no identifica uno solo. ~~**Decidir en la Fase 11**~~ **decidido en la Fase 11: no se renumera**, para no romper las referencias cruzadas de este archivo ni de los once registros de fase. La alternativa resuelve la ambigüedad sin tocar nada: se citan como «P2 de la Fase 0» y «P2 de la Fase 1»                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                    |

### Riesgos abiertos (del inventario de la Fase 0)

| ID  | Riesgo                                        | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3  | Secretos en un repositorio público            | abierto y vigilado — **el historial completo revisado en la Fase 10**: 20 commits, 11 categorías, cada una con su control positivo, y los 22 objetos no alcanzables limpiados. Lo que queda del riesgo no está en lo ya escrito, sino en lo que se escriba a partir de ahora, y los dos ajustes que lo cubren **están activados desde el 27/11/2026**: el **escaneo de secretos** («No secrets found», 0 alertas) y la **protección de push**, que impide en lugar de avisar |
| R4  | Finales de línea CRLF/LF                      | **cerrado** en la Fase 1                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| R5  | Copia de seguridad del Escritorio en OneDrive | abierto — **no activarla**, y la Fase 10 le ha dado un motivo nuevo y concreto: la carpeta `.git` llegó a contener el PDF ajeno como objeto no alcanzable, y una copia de seguridad se lo habría llevado sin que nadie lo supiera. Ya está limpiado, pero el riesgo es estructural: lo que se prepara con `git add` y se corrige después vive un tiempo en `.git`                                                                                                            |
| R7  | Descarga de los navegadores de Playwright     | **cerrado** en la Fase 8 — 332,8 MB descargados, 742,8 MB en disco, fuera del proyecto, y el navegador comprobado arrancando                                                                                                                                                                                                                                                                                                                                                 |
| R8  | **Plazo de entrega**                          | abierto y crítico                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

## Siguiente paso

**El proyecto está cerrado.** Las doce fases, de la 0 a la 11, están cerradas, y
la última no ha tocado código: la aplicación que se entrega es la misma que
verificaron en producción las fases 7, 8, 9 y 10.

Lo que queda no es desarrollo:

| Qué                                         | Cuándo                                   |
| ------------------------------------------- | ---------------------------------------- |
| Las diapositivas y el vídeo de demostración | Días 29 y 30, reservados desde la Fase 0 |
| La entrega                                  | 30/11/2026                               |

Y dos cosas quedan vigiladas para después de la entrega, ninguna urgente: los
tres pull requests de Dependabot cerrados sin fusionar, que se revisarán
entonces, y el pendiente nº 21, que espera una versión de
`eslint-plugin-jsx-a11y` que admita ESLint 10 en su rango.

### Aviso de plazo (apartado 9 de CLAUDE.md) — revisión del riesgo R8

| Dato               | Al cerrar la Fase 9 (26/11) | Al abrir la Fase 10 (27/11) | Al cerrar la Fase 10 (27/11) | Al cerrar la Fase 11 (28/11) |
| ------------------ | --------------------------- | --------------------------- | ---------------------------- | ---------------------------- |
| Fases pendientes   | 2 (la 10 y la 11)           | 2 (la 10 y la 11)           | 1 (la 11)                    | **0**                        |
| Días de desarrollo | 2,5 (resto del 26, 27 y 28) | 2 (el 27 y el 28)           | 1,5 (resto del 27 y el 28)   | **—**                        |
| Ritmo necesario    | 0,8 fases al día            | 1 fase al día               | 0,7 fases al día             | **—**                        |

A 28/11/2026 están cerradas **las doce fases**, y la última columna no tiene
ritmo que calcular porque no queda ninguna. Se ha retirado la columna de antes
de la Fase 9 para que la tabla siga leyéndose; está en el historial de este
archivo.

**El desarrollo ha terminado dentro del plazo, con el 29 y el 30 intactos** para
las diapositivas y el vídeo, que es lo que el apartado 9 de `CLAUDE.md` reservó
en la Fase 0 y lo que las revisiones del riesgo R8 han venido protegiendo fase a
fase. La Fase 11 ha entrado en una sesión y no ha tocado código, así que no ha
podido comerse ese margen.

**El riesgo R8 se cierra como riesgo de desarrollo** y queda solo como riesgo de
calendario sobre los dos entregables que necesitan tiempo del usuario.

**No se han propuesto recortes, y el orden preacordado se ha quedado sin nada
que recortar:**

1. ~~Husky~~ — **hecho en la Fase 9**, y sin complicaciones en Windows.
2. ~~Tests E2E extra~~ — dejaron de ser un recorte disponible en la Fase 8: los
   cinco recorridos son los que pidió el usuario y están hechos.
3. **GitHub Actions avanzado** — hecho también.
4. ~~Borradores en `localStorage`~~ — fuera de la lista desde la Fase 5.

La **mejora opcional nº 14** (el resumen fijo en un lateral) y el **favicon**
(nº 2) quedan fuera de la entrega, y no por falta de margen: el usuario decidió
que la última fase fuera sencilla, solo con lo esencial y sin cambios de código.

Nunca se recortan el cálculo del presupuesto, los tests de la lógica de negocio,
el despliegue, el README, las slides ni el vídeo. Los recortes se proponen; no se
aplican por iniciativa propia.
