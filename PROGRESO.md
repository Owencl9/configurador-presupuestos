# Estado del desarrollo

**Última actualización:** 24/11/2026
**Fase actual:** **Fase 4 completada**. El presupuesto funciona de punta a
punta en el navegador: añadir servicios, elegir cantidad y meses con sus
mínimos, y el resumen con los tres bloques de pago, su IGIC y su total. 190
tests en verde. Probado en local por el usuario. Pendiente de commit y de
verificación en producción.
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
| 3    | Lógica de negocio con TDD: formato de euros, subtotales, IGIC                | ✅ cerrada 24/11/2026 |
| 4    | Componentes del presupuesto con TDD                                          | ✅ cerrada 24/11/2026 |
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
| Descuento por pack    | 3 servicios distintos → 5 % del subtotal  | Fase 6       |
| Descuento permanencia | 12 meses o más → 10 % de esos servicios   | Fase 6       |
| Descuento por importe | pago único > 3.000 € → 5 % del pago único | Fase 6       |
| Tope de descuento     | 20 % como máximo                          | Fase 6       |

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

---

## Pendiente y vigilado

| #   | Asunto                                                                                                                                                                                                                                                                                                   | Cuándo                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | **Repositorio privado.** Hacerlo público tras la revisión de secretos                                                                                                                                                                                                                                    | Fase 10                |
| 2   | El favicon sigue siendo el de Vite                                                                                                                                                                                                                                                                       | Fase 11                |
| 3   | `eslint-plugin-jsx-a11y` (reglas de accesibilidad)                                                                                                                                                                                                                                                       | Fase 9                 |
| 4   | ~~Confirmar con el usuario los precios, el IGIC y las reglas de descuento~~ **resuelto en la Fase 3**                                                                                                                                                                                                    | —                      |
| 5   | ~~El `Service` type y el catálogo real sustituirán los datos provisionales de `App.tsx`~~ **resuelto en la Fase 2**                                                                                                                                                                                      | —                      |
| 6   | Si se regenera el andamiaje, usar `--eslint`: la plantilla ya usa Oxlint por defecto                                                                                                                                                                                                                     | —                      |
| 7   | ~~Sustituir la conversión provisional de céntimos a euros de `buildPriceLabel` por el `formatEuros` probado~~ **resuelto en la Fase 3**                                                                                                                                                                  | —                      |
| 8   | ~~El contador «Servicios seleccionados» es provisional: lo reemplaza el resumen del presupuesto~~ **resuelto en la Fase 4**                                                                                                                                                                              | —                      |
| 9   | ~~**Los meses de contratación no están en `BudgetLine`.** Entran con su selector~~ **resuelto en la Fase 4**: unión discriminada, meses obligatorios en la línea mensual                                                                                                                                 | —                      |
| 10  | ~~**Decidir si el resumen muestra «lo que se paga hoy»**~~ **resuelto en la Fase 4**: sí, como línea informativa «A pagar el primer día (orientativo)», fuera del tipo `Budget` ([ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md))                                                            | —                      |
| 11  | **A qué subtotal se aplica el descuento por pack**: a los tres bloques o solo a alguno. La regla dice «el subtotal» y hay tres                                                                                                                                                                           | Fase 6                 |
| 12  | ~~`calculateBudget` es el único punto de entrada del cálculo: los componentes no deben hacer cuentas~~ **cumplido en la Fase 4**, y sigue vigilado en las fases 5 a 7                                                                                                                                    | Fases 5-7              |
| 13  | ~~**Añadir al apartado 1 de `CLAUDE.md` la norma de ritmo de la corrección C3-1**~~ **resuelto al abrir la Fase 4**                                                                                                                                                                                      | —                      |
| 14  | **Mejora opcional, solo si sobra tiempo:** resumen fijo en un lateral en pantallas anchas, para no tener que bajar hasta el final para ver los totales. Petición del usuario en la Fase 4. Es maquetación, no cálculo: **se recorta antes que cualquier cosa de la lista del apartado 9 de `CLAUDE.md`** | Fase 11, si hay margen |

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

**Fase 5 — Estado del presupuesto.** Context con `useReducer` y borradores en
`localStorage` con validación.

El trabajo de la Fase 4 deja la fase siguiente bastante acotada:

- El estado ya existe y está en un solo sitio, el `useState` de `App.tsx`, con
  **cuatro funciones** que son exactamente las acciones del reducer: alternar
  un servicio, cambiar la cantidad, cambiar los meses y quitar.
- **Ningún componente tendrá que cambiar.** `ServiceCatalog` seguirá recibiendo
  `selectedIds` y `onToggle`, y `BudgetPanel` las líneas y sus tres avisos. Solo
  cambia quién se los pasa.
- El estado son **las líneas**, y los identificadores marcados del catálogo se
  derivan de ellas. No hay dos listas que puedan discrepar.
- `normalizeNumber` ya está escrita, recibe `unknown` y tiene 15 tests. Es la
  pieza con la que se validará lo que venga de `localStorage`, que es el punto
  del apartado 4.6 que exige no romperse con datos dañados.

No se inicia sin autorización expresa del usuario.

### Aviso de plazo (apartado 9 de CLAUDE.md)

**El margen ha mejorado, y bastante.** El plan contaba con los días 25 a 28
para las fases 4 a 11. A 24/11/2026 están cerradas las fases 0 a 4: la Fase 4
se ha hecho **el mismo día 24**, que no estaba en el cálculo.

| Dato                                 | Antes de la Fase 4  | Ahora                   |
| ------------------------------------ | ------------------- | ----------------------- |
| Fases pendientes                     | 8 (de la 4 a la 11) | **7** (de la 5 a la 11) |
| Días de desarrollo (25, 26, 27 y 28) | 4                   | 4                       |
| Ritmo necesario                      | 2 fases al día      | **1,75 fases al día**   |

Las dos fases cerradas el día 24 —la 3 y la 4— eran una de lógica pura y otra
de componentes, y las dos cupieron en una sesión. Eso es la mejor estimación
disponible para las fases 5, 6 y 7, que se parecen a ellas.

**Las dos que no se parecen siguen siendo las mismas:** la Fase 8 (descarga de
los navegadores de Playwright, riesgo **R7**) y la Fase 9 (Husky y GitHub
Actions, que tocan configuración y pueden pelearse con Windows).

**No se proponen recortes.** Estaba acordado proponerlos al cerrar la Fase 4 si
no se había recuperado margen, y se ha recuperado. El riesgo **R8** sigue
abierto —sigue siendo el más serio del proyecto— y el momento natural para
revisar esto otra vez es **al cerrar la Fase 7**, cuando la aplicación esté
funcionalmente completa y lo que quede sean calidad, despliegue y entrega. Si
en ese punto las fases 8 y 9 amenazan los días 29 y 30, el orden preacordado
es: 1) Husky, 2) tests E2E extra, 3) GitHub Actions avanzado, 4) borradores en
localStorage, y ahora además, antes que todos ellos, la mejora opcional nº 14
de la lista de arriba. Nunca se recortan el cálculo del presupuesto, los tests
de la lógica de negocio, el despliegue, el README, las slides ni el vídeo.

Los recortes se proponen; no se aplican por iniciativa propia.
