# Registro de prompts — Fase 2: Tipos y catálogo de servicios

**Fecha:** 24/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** definir los tipos de TypeScript del dominio, crear el archivo de datos con el catálogo de servicios y mostrarlo agrupado por categorías, sustituyendo los datos provisionales de `App.tsx`.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque de la fase con el catálogo ampliado

> Vamos a empezar la Fase 2 del Configurador de Presupuestos.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md, docs/prompt-maestro.md y docs/prompts/fase-01.md para tener el contexto completo. La Fase 1 está cerrada y desplegada.
>
> Catálogo de servicios:
>
> - Quiero un catálogo más variado que el del apartado 4.3: unos 12 servicios en 4 categorías (Diseño web, Marketing, Mantenimiento e Infraestructura), con niveles en algunos servicios (por ejemplo, SEO Básico y SEO Profesional, o Mantenimiento Básico y Premium) como servicios independientes del catálogo.
> - No quiero reglas de precio nuevas: los niveles son solo datos, y el cálculo y los descuentos siguen siendo los del apartado 4.3.
> - Todos los precios son ficticios a propósito: el repositorio será público y no quiero publicar las tarifas reales de mi agencia. Indícalo en el código y en el README.
> - Propónme la lista completa con nombre, descripción, precio y tipo de pago antes de crearla.
>
> Incluye también la línea pendiente en PROGRESO.md sobre la verificación en producción del arreglo de Tailwind.
>
> Presenta el plan de la Fase 2 y espera mi autorización antes de crear o modificar archivos.

Tres instrucciones que acotan la fase antes de que empiece: **ampliar los datos sin ampliar las reglas**, no publicar tarifas reales, y aprobar la lista de servicios antes de que exista el archivo. La primera es la que más trabajo ahorró: dejó claro desde el principio que la variedad del catálogo era un asunto de datos y que la lógica de las fases 3 a 6 no se tocaba.

### Prompt 2 — Autorización, con una corrección sobre el estado de la verificación

> Apruebo el catálogo de 12 servicios tal cual. Respuestas:
> a) De acuerdo con buildPriceLabel y la conversión provisional marcada, que se sustituirá por formatEuros en la Fase 3.
> b) Unión discriminada.
> c) Sí, el catálogo sigue siendo visual en esta fase.
>
> Una corrección sobre el punto 5: el arreglo de Tailwind SÍ se verificó en producción al final de la sesión anterior. El CSS publicado era index-HOzYXBrc.css, de 10.189 bytes, igual que el build local; habían desaparecido las tres utilidades sobrantes y se conservaban las clases en uso; y las cuatro cabeceras de seguridad llegaban correctamente (4 de 4, más HSTS). Regístralo en PROGRESO.md como verificado, con esos datos, no como pendiente. Describe las utilidades sin escribir su nombre literal, pero sin escribirlo mal a propósito.
>
> Adelante con la Fase 2.

Ver las correcciones **C2-1** y **C2-2**.

### Prompt 3 — El `.gitignore` y los permisos locales (a mitad de la fase)

> Ha aparecido la carpeta .claude/ con settings.local.json, que contiene mis permisos locales de Claude Code. Añade .claude/settings.local.json al .gitignore y comprueba que no entra en el commit.

Ver la corrección **C2-3**.

### Prompt 4 — Parar un experimento innecesario

> No hace falta el experimento: tu hipótesis es correcta y suficiente. La utilidad filter procede de la palabra "filter" en servicios.filter(...), que Tailwind extrae del código. Es inofensiva (unos pocos bytes) y no se corrige. Anótalo en una o dos líneas en el registro de la fase y continúa: documentación, revisión de secretos y propuesta de commit.

Ver la corrección **C2-4**.

### Prompt 5 — La revisión de secretos quedó invalidada por las ediciones posteriores

> Apruebo la lista de 15 archivos y el mensaje del commit. Apruebo también la norma del control positivo para el apartado 5 de CLAUDE.md: añádela.
>
> Antes del commit: has editado fase-02.md, PROGRESO.md y README.md después de la revisión de secretos válida. Repítela sobre los archivos del commit con la búsqueda corregida y su control positivo, y enséñame el resultado.
>
> Si sale limpia, haz el commit y el push, y comprueba en producción que el catálogo de 12 servicios se ve en la URL desplegada. Después dame el resumen de cierre de la Fase 2.

Ver la corrección **C2-5**.

---

## 2. Resumen de lo generado

### Tipos del dominio

`src/shared/types/service.ts`. La decisión de fondo es que `Service` no es un tipo con campos opcionales, sino una **unión discriminada** de tres tipos —`OneTimeService`, `MonthlyService` y `YearlyService`— con `payment` como discriminante.

| Consecuencia                        | Qué significa en la práctica                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Los datos imposibles no compilan    | `minMonths` solo existe en el tipo mensual. Un hosting anual con seis meses mínimos es un error de `tsc`, no un dato raro            |
| Obliga a comprobar antes de leer    | Para usar `service.minMonths` hay que haber comprobado `service.payment === 'monthly'`. Es justo la separación que pide el apartado 4.4 |

### Catálogo

`src/shared/data/services.ts`: 12 servicios, 4 categorías, precios **en céntimos**, con el aviso de precios ficticios en la cabecera del archivo.

| Categoría       | Servicios                                                                | Pago                    |
| --------------- | ------------------------------------------------------------------------ | ----------------------- |
| Diseño web      | Landing page de campaña, Web corporativa, Tienda online                  | único                   |
| Marketing       | SEO Básico, SEO Profesional, Gestión de redes sociales                   | mensual (mín. 6, 6 y 3) |
| Mantenimiento   | Mantenimiento Básico, Mantenimiento Premium, Actualización de contenidos  | mensual (mín. 3)        |
| Infraestructura | Hosting y dominio, Correo corporativo, Migración a servidor              | anual, anual y único    |

El reparto no es decorativo: con 12 servicios, 6 mensuales y más de 3.000 € en pago único, el catálogo permite provocar las cuatro reglas de descuento del apartado 4.3 y el tope del 20 %. Un test de integridad vigila el umbral de los 3.000 €, para que una futura edición de precios no deje un descuento inalcanzable y haga fallar los tests de la Fase 6 sin motivo aparente.

### Los tres ciclos TDD

| Ciclo | Qué se probó                                     | Fallo visto antes de implementar                       | Verde |
| ----- | ------------------------------------------------ | ------------------------------------------------------ | ----- |
| 1     | Integridad del catálogo (`services.test.ts`)      | `Failed to resolve import "./services"` — **0 tests**  | 11    |
| 2     | `buildPriceLabel`                                 | `Failed to resolve import "./buildPriceLabel"`         | 8     |
| 3     | `groupServicesByCategory`                         | `Failed to resolve import "./groupServicesByCategory"` | 7     |
| —     | `ServiceCatalog` (presentación, test también antes) | `Failed to resolve import "./ServiceCatalog"`        | 6     |

**Total de la fase: 32 tests nuevos. Con los 5 de la Fase 1, 37 en verde.**

### La garantía de tipos, comprobada en positivo

El test «no permite declarar meses mínimos en un servicio que no es mensual» no comprueba nada en tiempo de ejecución: lo que prueba ocurre al compilar. Usa `@ts-expect-error`, que invierte el sentido de un comentario de supresión: si el compilador **dejara** de dar error en esa línea, la propia directiva pasaría a ser un error y `npm run build` fallaría.

`tsc -b` pasaba, lo que ya indicaba que el compilador estaba rechazando la línea. Pero eso es un negativo, y un negativo se parece demasiado a un filtro mal puesto (aprendizaje 7 de la Fase 1). Se comprobó en positivo con un archivo temporal sin la directiva, igual que se hizo con `strict` en la Fase 1:

```
src/temporal-comprobacion-tipos.ts(13,3): error TS2353: Object literal may only
specify known properties, and 'minMonths' does not exist in type 'YearlyService'.
```

El detalle revelador está en el final del mensaje: dice **`YearlyService`**, no `Service`. El compilador había usado `payment: 'yearly'` para elegir cuál de los tres tipos de la unión aplicaba. Eso es el discriminante funcionando. El archivo temporal se borró acto seguido y se volvió a compilar para confirmar el verde.

### Accesibilidad

- Jerarquía sin saltos: **h1** (título) → **h2** (categoría) → **h3** (servicio). Desapareció el encabezado genérico «Servicios», porque ahora las secciones son las categorías.
- Cada categoría es un `<section>` con `aria-labelledby` apuntando a su `<h2>`, de modo que es una **región con nombre accesible** y un lector de pantalla puede saltar directamente a «Marketing».
- El contador de seleccionados lleva `aria-live="polite"`.
- Los tests comprueban roles, niveles de encabezado y nombres accesibles —`getAllByRole('heading', { level: 2 })`, `getByRole('region', { name: 'Marketing' })`—, nunca clases de CSS.

### Seguridad

`.claude/settings.local.json` añadido al `.gitignore`. Comprobado por tres vías antes de dar nada por hecho:

| Comprobación                                | Resultado                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `git check-ignore -v`                       | antes: lo ignoraba el **ignore global** del perfil del usuario. Después: `.gitignore:46`     |
| `git add -A --dry-run`                      | solo entran `.gitignore` y los archivos nuevos de la fase. Nada de `.claude/`                |
| `git add .claude/settings.local.json` en seco | rechazado: `The following paths are ignored by one of your .gitignore files`                |

El archivo contenía únicamente dos permisos de PowerShell: ni secretos ni datos personales, así que no hubo fuga.

### Verificaciones de cierre

| Comprobación           | Resultado                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run format:check` | en verde (tras formatear 4 archivos nuevos)                        |
| `npm run lint`         | 0 errores, 0 avisos                                                |
| `npm test`             | **37 de 37**                                                       |
| `npm run build`        | correcto — 224,73 kB de JS (70,64 kB comprimido), 11,39 kB de CSS  |

### Revisión de seguridad previa al commit

Ejecutada **después** de escribir toda la documentación de la fase, como exige el apartado 5 de `CLAUDE.md` tras la lección C1-6. Sobre los **16 archivos** que entran en el commit, buscando **categorías de datos** y no archivos conocidos.

Hubo que ejecutarla tres veces, y las dos primeras no valían: el primer barrido no abrió ningún archivo (problema **P9**) y el segundo quedó invalidado porque después se editaron tres archivos para documentar ese mismo problema (corrección **C2-5**). Los resultados de abajo son los de la tercera, la única ejecutada sobre el contenido definitivo y sin nada entre ella y el `git add`.

| Categoría buscada                            | Resultado                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| Direcciones de correo (cualquiera)           | 1 coincidencia: la dirección `@users.noreply.github.com`, intencionada y ya presente desde la Fase 1 |
| Claves de OpenAI o Anthropic                 | sin coincidencias                                                         |
| Tokens de GitHub                             | sin coincidencias                                                         |
| Claves de AWS                                | sin coincidencias                                                         |
| Claves privadas (`BEGIN … PRIVATE KEY`)      | sin coincidencias                                                         |
| Contraseñas, secretos, claves de API         | sin coincidencias                                                         |
| Cadenas de conexión a bases de datos         | sin coincidencias                                                         |
| Rutas con el nombre de usuario               | sin coincidencias                                                         |
| Teléfonos                                    | sin coincidencias                                                         |
| IBAN y NIF                                   | sin coincidencias                                                         |
| **Control positivo** de la búsqueda de correos | 8 coincidencias en el repositorio completo, todas la dirección `noreply` |
| Archivos ignorados que no entran              | `.claude/`, `dist/`, `node_modules/` y el PDF interno del máster          |

### Publicación y verificación en producción

Commit `8814d83`, 16 archivos, 1.518 líneas añadidas. `push` a `main` verificado comparando el SHA local con el de `origin/main`. Vercel redesplegó automáticamente.

Sobre la URL de producción: los **12 servicios** presentes en el JS publicado, las 4 categorías, los sufijos `/mes` y `/año`, las **4 cabeceras de seguridad** más HSTS, y los sourcemaps y el código fuente en HTTP 404. El JS y el CSS publicados pesan **exactamente lo mismo** que el build local (224.737 y 11.399 bytes), lo que descarta que Vercel haya compilado algo distinto.

**Negativo falso al comprobar los precios:** la búsqueda literal de cinco de los seis importes probados no los encontró en el JS publicado. No faltaban: esbuild minifica los literales numéricos a su forma más corta, y `250000` se publica como `25e4`. Solo `7200` aparece tal cual, porque no tiene forma más breve. Es la tercera vez en esta fase que un «no encontrado» resulta no significar lo que parecía —las otras dos son **P9** y el control positivo—, y las tres veces lo resolvió lo mismo: comprobar la herramienta antes de creerse el resultado.

Datos de terceros: ninguno. El registro describe el ignore global de Git como «el del perfil del usuario», sin reproducir la ruta, y no menciona nombres, correos ni dominios de nadie.

---

## 3. Problemas encontrados y cómo se resolvieron

### P7 — La utilidad `filter` del CSS viene del código, no de la documentación

Al revisar el CSS generado apareció compilada la utilidad `filter`, que la aplicación no usa. Procede de la palabra `filter` en `servicios.filter(...)`: Tailwind extrae candidatos a clase de los `.ts` como texto, sin distinguir una clase de un método de JavaScript, así que `source(none)` no puede evitarlo. Son unos pocos bytes inofensivos y **el usuario decidió no corregirlo** (ver **C2-4**). Matiza de paso el problema **P6** de la Fase 1: de las tres utilidades sobrantes, esa no venía de los `.md`.

**Evidencia de que el arreglo de P6 sí funciona:** el `build` ejecutado antes de escribir la documentación de la fase y el ejecutado después produjeron **exactamente los mismos nombres de recurso** (`index-BJNF-ZiX.css` y `index-DvjE03d8.js`), aunque entre los dos se escribieron un ADR, un registro de fase y dos documentos más. Antes del arreglo, un commit que solo tocaba documentación cambiaba el CSS publicado. Ahora no.

### P8 — Prettier reformateó cuatro de los archivos nuevos

Rutina, pero se resolvió en el orden correcto: primero `format:check`, que no modifica nada y enseña **qué** archivos van a cambiar, y solo después `format --write`. Tras el formateo se volvieron a ejecutar los 37 tests y el build, porque un reformateo que rompe algo es raro pero no imposible.

### P9 — La revisión de secretos no estaba mirando dentro de los archivos

**Síntoma:** la revisión previa al commit recorrió diez categorías de datos sensibles —correos, claves de OpenAI, tokens de GitHub, claves de AWS, claves privadas, contraseñas, cadenas de conexión, rutas con el nombre de usuario, teléfonos, IBAN y NIF— y devolvió **«sin coincidencias» en las diez**. Un informe impecable.

**Cómo se detectó:** por desconfianza del propio resultado. Diez ceros seguidos son justo el escenario de la corrección C1-6 de la Fase 1, así que se ejecutó un **control positivo**: la misma expresión de correo electrónico sobre todo el repositorio, donde la dirección `@users.noreply.github.com` aparece con certeza. Devolvió cero también. Eso era imposible, y delataba la herramienta en lugar del contenido.

**Causa:** en PowerShell, `Select-String -Pattern` aplicado a una **tubería de cadenas de texto** busca dentro de esas cadenas, no dentro de los archivos que nombran. Los 15 nombres de archivo se estaban recorriendo como si fueran el contenido a revisar. Para buscar en los archivos hay que pasar las rutas con `-Path`, o canalizar objetos de archivo en lugar de texto. **No se abrió ni un solo archivo en todo el barrido.**

**Resolución:** se repitió la revisión con dos herramientas distintas en lugar de insistir con la que acababa de fallar: `ripgrep` sobre el repositorio completo y `Select-String -Path` sobre los 15 archivos del commit. Las dos encontraron la misma única coincidencia —la dirección `noreply` intencionada—, y el control positivo pasó a devolver las ocho coincidencias esperadas.

**Lo que enseña:** es la misma lección de C1-6 y del aprendizaje 7 de la Fase 1, pero agravada. Allí la búsqueda estaba bien hecha y mal apuntada: se buscó el término equivocado. Aquí estaba **bien apuntada y mal ejecutada**: el término era correcto, el repositorio era correcto, y la herramienta no leyó nada. Y el resultado tiene peor pinta todavía, porque un informe con diez categorías en verde parece más riguroso que uno con una sola. **El control positivo no es un paso opcional del final: es la única parte de una revisión de seguridad que demuestra que el resto significa algo.**

---

## 4. Decisiones tomadas en esta fase

| Decisión                                                               | Motivo                                                                                                                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Los niveles son servicios independientes, sin campo «nivel»            | Lo pidió el usuario y evita reglas nuevas. [ADR 0006](../adr/0006-niveles-como-servicios-independientes.md)                                           |
| `Service` como unión discriminada por `payment`                        | Hace que los datos imposibles no compilen, y obliga a la separación por forma de pago que necesitan las fases 3 a 6                                   |
| Tests de integridad sobre los **datos**, no solo sobre la lógica        | El archivo de datos está hecho para editarse a mano. Un `id` repetido o un precio en euros no darían ningún error visible: darían un presupuesto mal calculado |
| `groupServicesByCategory` recibe los datos por parámetro               | Función pura: se prueba con tres servicios inventados y editar una tarifa no rompe los tests de agrupación                                             |
| Omitir del resultado las categorías sin servicios                      | Un encabezado sin nada debajo es ruido en pantalla y una sección vacía anunciada para un lector de pantalla                                           |
| `ServiceCatalog` importa el catálogo en lugar de recibirlo por props   | Hay un único catálogo y no se prevé un segundo: una prop para inyectarlo sería un parámetro sin uso. Lo que sí recibe por props es el estado          |
| La conversión provisional de céntimos a euros, en un único punto        | En la Fase 3 se sustituye por `formatEuros` cambiando una llamada, no doce                                                                            |
| Conversión escrita a mano en vez de `Intl.NumberFormat`                | Resultado exactamente predecible mientras es provisional. `Intl` con `style: 'currency'` usa un espacio irrompible (U+00A0) ante el €, fuente clásica de tests que fallan por un carácter invisible. Anotado para la Fase 3 |
| El orden de las categorías es un dato, no alfabético                   | Es una decisión editorial: del sitio web hacia la infraestructura. Hay un test que lo fija                                                             |
| `.claude/settings.local.json` al `.gitignore` del repositorio           | La protección tiene que viajar con el repositorio, no vivir en la configuración de una máquina. Ver **C2-3**                                           |

---

## 5. Correcciones del usuario y por qué

### C2-1 — Una verificación ya hecha no se registra como pendiente

**Corrección:** el plan proponía anotar en `PROGRESO.md` la verificación en producción del arreglo de Tailwind como tarea **pendiente**. El usuario indicó que ya estaba hecha y aportó los datos: `index-HOzYXBrc.css`, 10.189 bytes, idéntico al build local, las tres utilidades sobrantes desaparecidas, las clases en uso conservadas y las cuatro cabeceras de seguridad correctas más HSTS.

**Por qué importa, y a quién corresponde el error:** el propio prompt de arranque de la fase pedía «incluir la línea pendiente», así que el asistente no se lo inventó. Lo que ocurrió es más interesante: **la verificación se hizo y no se escribió**, porque la sesión terminó justo después. Entre una sesión y la siguiente, la única memoria del proyecto es `PROGRESO.md`; lo que no esté ahí, no existe. Y el coste no es olvidar un detalle: es que la fase siguiente reserve tiempo para repetir un trabajo ya hecho, o peor, que el documento final del TFM afirme que algo quedó sin comprobar.

**Resolución:** registrada en `PROGRESO.md` como verificada, con los cuatro datos y la fecha, dentro del apartado de la Fase 1 donde está descrito el hallazgo. **Norma práctica que deja:** una comprobación se escribe en el mismo momento en que se hace, no al cerrar la sesión.

### C2-2 — No escribir algo mal a propósito en la documentación

**Corrección:** para describir las utilidades sobrantes sin volver a introducir sus nombres en un `.md` —que fue la causa del problema P6—, el asistente propuso escribir una de ellas **deliberadamente mal**, con una nota aclarando que estaba mal a propósito. El usuario aceptó no escribir el nombre literal, pero rechazó la errata intencionada.

**Por qué tenía razón:** un error deliberado en documentación es indistinguible de un descuido para quien lo lea después. En un repositorio que se presenta como trabajo evaluable, un lector encuentra una clase mal escrita, no sabe si es intencionado y pierde el tiempo comprobándolo; o peor, la copia. Y la protección era además innecesaria: `source(none)` ya impide que Tailwind rastree los `.md`, de modo que escribir la clase correcta tampoco habría compilado nada. Era un remedio contra un problema ya resuelto, pagado con una documentación peor.

**Resolución:** las tres utilidades se describen en prosa —«la de columnas de rejilla sin variante, la de filtros y la de transformaciones»— y las comprobaciones que necesitan el nombre literal se hacen desde la línea de comandos, donde el texto no queda versionado.

### C2-3 — Los permisos locales no se versionan

**Corrección:** al aparecer `.claude/settings.local.json`, el usuario pidió añadirlo al `.gitignore` y **comprobar que no entra en el commit**. No solo añadirlo: comprobarlo.

**Por qué:** es configuración de una máquina, no del proyecto. No contenía secretos —dos permisos de PowerShell—, pero la norma correcta no depende del contenido de hoy: un archivo de permisos crece, y el criterio del apartado 5 de `CLAUDE.md` es que el historial que se escribe ahora es el que se publicará.

**Hallazgo al comprobarlo:** el archivo **ya estaba ignorado**, pero por el ignore **global** de Git del perfil del usuario, no por el repositorio. Es exactamente el problema que el apartado 4 de `CLAUDE.md` resolvió con los finales de línea: una protección que vive en la configuración del equipo no sobrevive a un clonado en otro ordenador. Al clonar el repositorio en otra máquina, el archivo habría entrado. `git check-ignore -v` lo dejó por escrito: antes señalaba la configuración del usuario; después, `.gitignore:46`.

**Detalle de la resolución:** se ignora el archivo local, no toda la carpeta `.claude/`, por si algún día hiciera falta un `settings.json` compartido del proyecto.

### C2-4 — Verificar también tiene un coste

**Corrección:** tras detectar la utilidad `filter` sobrante en el CSS, el asistente iba a montar un experimento —crear un archivo temporal con una utilidad inexistente, recompilar y comparar— para demostrar que Tailwind extrae palabras del código. El usuario lo detuvo: la hipótesis era correcta y suficiente, el efecto son unos pocos bytes inofensivos, y había documentación, revisión de secretos y commit pendientes.

**Por qué tenía razón:** el asistente estaba aplicando bien un criterio del proyecto —comprobar en lugar de suponer— pero sin ponderar la proporción. El mismo criterio que estuvo justificado con `strict` en la Fase 1 y con la garantía de tipos de esta fase, donde lo que estaba en juego era una garantía del modelo de datos, no lo estaba aquí: un experimento de varios minutos para explicar 40 bytes de CSS que no se van a corregir, a cuatro días de la entrega.

**Lo que enseña, y es lo contrario de lo que suele enseñarse:** el rigor no es gratis. Un asistente puede encadenar comprobaciones indefinidamente sin notar el coste, porque no es él quien tiene el plazo encima. **Decidir cuándo la evidencia ya es suficiente es una decisión humana**, y es tan parte de la supervisión como detectar un comando mal planteado (C1-4 de la Fase 1). Las dos correcciones son del mismo tipo: una paró algo peligroso, esta paró algo inútil.

### C2-5 — Una revisión de secretos caduca en cuanto se edita un archivo

**Corrección:** el asistente ejecutó la revisión de secretos, la dio por buena y **después siguió editando** `fase-02.md`, `PROGRESO.md` y `README.md` —precisamente para documentar el problema P9— antes de proponer el commit. El usuario lo detectó al aprobar la lista de archivos y pidió repetirla, con su control positivo, sobre el estado real de lo que iba a entrar.

**Por qué tenía razón:** la revisión se ejecuta sobre un contenido concreto, no sobre un proyecto en abstracto. Tres de los archivos aprobados habían cambiado después de revisarlos, y uno de esos cambios consistía en **describir un incidente de seguridad**, que es el caso exacto que el apartado 5 de `CLAUDE.md` señala como forma habitual de reintroducir datos: al citar prompts y describir hallazgos se copian datos que se querían retirar. Ocurrió en la Fase 1 con el correo de un profesor (C1-6 y C1-7).

**Lo que hace esta corrección especialmente incómoda:** la norma que se incumplió **la escribió el propio asistente en `CLAUDE.md` al cerrar la Fase 1**, y dice literalmente que la revisión va al final, después de la documentación. El error no fue desconocer la norma: fue aplicarla una vez y no volver a mirarla cuando el trabajo siguió. Una norma de secuencia no se cumple ejecutando el paso en algún momento, sino asegurando que **nada se interpone** entre ese paso y el commit.

**Resolución:** repetida sobre los 16 archivos definitivos —los 15 anteriores más `CLAUDE.md`, que entra en el commit por la norma nueva del control positivo— con la búsqueda corregida y su control positivo, y mostrada al usuario antes de ejecutar nada. Resultado: la única coincidencia es la dirección `noreply` intencionada.

**Norma práctica que deja:** la revisión de secretos es el **último paso antes del `git add`**. Si después se edita cualquier archivo, por pequeño que sea el cambio, la revisión anterior ya no describe lo que se va a publicar y hay que repetirla.

---

## 6. Aprendizajes de la fase

1. **Una unión discriminada convierte una regla de datos en un error de compilación.** «Los meses mínimos solo tienen sentido en los servicios mensuales» puede quedarse en un comentario que alguien ignora, o puede ser un tipo que no compila. Es el aprendizaje 2 de la Fase 1 —la diferencia entre cumplir una norma y hacer que incumplirla sea imposible— aplicado ahora a los datos en lugar de a un comando.

2. **El mensaje de error de un compilador contiene más información de la que parece.** `'minMonths' does not exist in type 'YearlyService'` no dice solo que la línea está mal: dice que el compilador eligió uno de los tres tipos de la unión a partir del valor de `payment`. Leer el nombre exacto del tipo en el mensaje es lo que demuestra que el discriminante funciona.

3. **Se pueden escribir tests que solo fallan al compilar.** `@ts-expect-error` invierte un comentario de supresión: en lugar de callar un error, exige que ese error exista. Si el día que se cambia un tipo la línea deja de ser errónea, la directiva pasa a ser el error. Es una comprobación permanente que no cuesta ni un milisegundo de ejecución, y vive en `npm run build`, no en `npm test`.

4. **Los datos también se prueban.** Un archivo de datos pensado para editarse a mano es una fuente de errores silenciosos: un identificador repetido, un precio en euros donde van céntimos, una categoría que se queda vacía. Ninguno de los tres da un error visible; los tres dan un presupuesto mal calculado. Once tests convierten esos descuidos en un fallo inmediato y con nombre.

5. **Una función pura se prueba con tres datos inventados, no con el catálogo entero.** `groupServicesByCategory` recibe los servicios y las categorías por parámetro en lugar de importarlos. La consecuencia práctica: se puede provocar el caso de la categoría vacía —que en el catálogo real no existe— y cambiar una tarifa no rompe tests que no hablan de tarifas.

6. **La accesibilidad se prueba por roles, no por clases.** `getAllByRole('heading', { level: 2 })` comprueba la jerarquía real del documento; `getByRole('region', { name: 'Marketing' })` comprueba que la sección tiene nombre accesible. Un test que buscara `.text-xl` no habría detectado un salto de h1 a h3, que es lo que de verdad estorba a quien navega con un lector de pantalla.

7. **Lo provisional se concentra en un punto, y se marca.** La conversión de céntimos a euros tenía que existir ya, pero su TDD es de la Fase 3. En lugar de repartirla o de adelantar la fase, vive en una función de cuatro líneas con un comentario que dice qué la sustituye y cuándo. Sustituirla será cambiar una llamada.

8. **Las herramientas no distinguen código de texto.** Tailwind extrae candidatos a clase de los `.ts` sin saber qué es JavaScript, así que `servicios.filter(...)` compila la utilidad `filter`. Es la misma lección del problema P6 de la Fase 1, pero con el origen al revés: entonces el texto de la documentación acabó en el CSS, y ahora es el código.

9. **Verificar tiene un coste, y decidir cuándo parar es humano.** Ver la corrección **C2-4**. El rigor aplicado sin medida consume el recurso más escaso del proyecto, que es el plazo.

10. **Un control positivo es obligatorio en toda revisión de seguridad.** Diez categorías de datos sensibles, diez veces «sin coincidencias», y resultó que la herramienta no había abierto ni un archivo (problema **P9**). La única forma de distinguir «aquí no hay nada» de «esto no está buscando» es pedirle a la misma búsqueda que encuentre algo que se sabe que existe. Dicho de otro modo: **un informe de seguridad no vale más que la comprobación que lo sostiene**, y esa frase ya estaba escrita en el registro de la Fase 1 antes de volver a ocurrir.

11. **Una revisión de seguridad caduca.** Describe un contenido concreto, no un proyecto. Editar un archivo después de revisarlo invalida el informe, y el caso más traicionero es editarlo **para documentar el propio hallazgo de seguridad**. Ver la corrección **C2-5**. La norma del apartado 5 de `CLAUDE.md` ya decía que la revisión va al final; lo que faltaba era entender que «al final» significa que nada se interpone entre la revisión y el `git add`.

12. **Cuando una herramienta falla, se cambia de herramienta, no de intento.** La revisión se repitió con `ripgrep` y con `Select-String -Path`, dos motores distintos sobre el mismo contenido. Dos herramientas independientes que coinciden descartan el error de manejo de una sola; repetir con la que acaba de fallar solo repite el fallo con más convicción.

---

## 7. Momentos para el vídeo

### Momento 1 — El compilador rechaza un dato imposible

**Qué se ve:** un archivo con un servicio de hosting **anual** al que se le añade `minMonths: 6`. Se ejecuta `npx tsc -b` y el compilador responde:

```
error TS2353: Object literal may only specify known properties,
and 'minMonths' does not exist in type 'YearlyService'.
```

Se señala el final del mensaje: dice `YearlyService`, no `Service`.

**Por qué merece estar en el vídeo:** explica en veinte segundos para qué sirven los tipos, sin teoría. No es que el dato sea raro: es que **no existe forma de escribirlo**. Y el nombre del tipo en el mensaje demuestra que el compilador ha razonado sobre el valor de `payment` para elegir qué regla aplicar. Enlaza además con el momento de `strict` de la Fase 1: la misma costumbre de comprobar en positivo, con un archivo temporal que se borra, en lugar de fiarse de que algo no dé error.

### Momento 2 — El `.gitignore` que no viajaba

**Qué se ve:** aparece `.claude/settings.local.json` con los permisos locales. Antes de tocar nada se ejecuta `git check-ignore -v`, que responde señalando el **ignore global del perfil del usuario**. Se añade la línea al `.gitignore` del repositorio y se repite el comando: ahora responde `.gitignore:46`. Y por último, `git add` del archivo, que Git rechaza.

**Por qué merece estar en el vídeo:** el archivo ya estaba ignorado, así que la reacción natural habría sido «no hace falta hacer nada». Pero lo ignoraba el **ordenador**, no el **proyecto**: al clonar el repositorio en otra máquina, el archivo habría entrado. Es la misma lección que la decisión de los finales de línea de la Fase 0, en un caso nuevo y en treinta segundos, y muestra el hábito que más veces ha salvado algo en este proyecto: comprobar el estado real antes de dar un problema por resuelto o por inexistente.

### Momento 3 (alternativa) — Los tests que vigilan los datos

**Qué se ve:** se edita el archivo de servicios y se duplica un identificador, o se escribe un precio con decimales. Se ejecuta `npm test` y falla con un nombre legible: «no repite ningún identificador de servicio», «expresa todos los precios como un número entero de céntimos positivo».

**Por qué merece estar en el vídeo:** el prompt maestro pide que el catálogo sea «fácil de editar sin tocar la lógica», y eso significa que alguien lo editará a mano. Se ve que la red de seguridad cubre también los datos, no solo las funciones, y que un descuido que no produciría ningún error visible —un presupuesto mal calculado— se convierte en un fallo inmediato con nombre propio.

---

### Momento 4 — Diez categorías en verde que no habían mirado nada

**Qué se ve:** la revisión de secretos previa al commit, con las diez categorías —correos, claves, tokens, contraseñas, rutas, teléfonos, IBAN— y un «sin coincidencias» en todas. A continuación, el control positivo: la misma búsqueda de direcciones de correo lanzada sobre todo el repositorio, donde la dirección `noreply` aparece ocho veces. **Devuelve cero.** El informe entero era humo: `Select-String` estaba buscando dentro de los nombres de archivo, no dentro de los archivos. Se repite con `ripgrep` y con la sintaxis corregida, y aparecen las ocho coincidencias y la única del commit.

**Por qué merece estar en el vídeo:** es el mejor argumento del proyecto a favor de la supervisión humana, y lo es precisamente porque **el fallo es de la IA y lo encuentra la propia disciplina del proyecto**, no la suerte. En la Fase 1 ya pasó algo parecido con el correo buscado en el dominio equivocado, y la lección quedó escrita: «un informe de seguridad en verde no vale más que la comprobación que lo sostiene». Aquí se ve esa frase evitando un segundo accidente, una fase después. Para un TFM sobre desarrollo con IA, enseñar que una norma escrita en la Fase 1 cazó un error en la Fase 2 vale más que cualquier demostración de código generado rápido.

---

**Recomendación para el guion:** el **1** es el más rentable para explicar el valor de TypeScript, con una sola línea de salida del compilador. El **4** es el más rentable para explicar la metodología, y encaja como continuación directa del momento del correo de la Fase 1: los dos muestran comprobaciones que parecían en verde y no lo estaban. Si solo entran dos momentos de esta fase, son esos.
