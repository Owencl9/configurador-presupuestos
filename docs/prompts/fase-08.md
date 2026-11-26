# Registro de prompts — Fase 8: Tests de punta a punta con Playwright

Fase ejecutada el **26/11/2026**. Cierra el riesgo **R7** (descarga de los
navegadores de Playwright), que llevaba ocho fases abierto, y añade **cinco
recorridos** en un navegador real contra el build local. No cambia ni una línea
de la aplicación.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque, con los criterios por delante

> Vamos a empezar la Fase 8 del Configurador de Presupuestos: pruebas de punta a
> punta con Playwright en un navegador real.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md, docs/prompt-maestro.md y
> docs/prompts/fase-07.md. Las fases 1 a 7 están cerradas y desplegadas; la
> aplicación está funcionalmente completa.
>
> Criterios:
>
> - Instalación (riesgo R7): Playwright como dependencia de desarrollo del
>   proyecto, nada global. Instala solo el navegador Chromium, no los tres. Antes
>   de instalar nada, dime exactamente qué comandos vas a ejecutar, qué se
>   descarga, cuánto ocupa aproximadamente y dónde se guarda en mi ordenador, y
>   espera mi autorización.
> - Los tests van en la carpeta e2e/, separados de los 560 de Vitest, que tienen
>   que seguir en verde sin cambios. Comprueba que Vitest no recoge los tests de
>   e2e/ y que Playwright no recoge los de src/.
> - Se ejecutan contra el build local (npm run build + npm run preview), nunca
>   contra la web publicada.
> - Pocos tests y completos, entre 4 y 6 recorridos: mi ejemplo 1 (Tienda online,
>   SEO Profesional a 12 meses y Hosting) hasta el documento, comprobando las
>   cifras; el borrador que sobrevive a una recarga; el documento en modo
>   impresión con la emulación del medio print, comprobando que no aparecen los
>   botones; y lo que propongas que aporte de verdad.
> - Informes, capturas y vídeos de Playwright no se versionan (comprueba
>   .gitignore).
> - Añade un script npm para ejecutarlos, y documenta en el README cómo
>   lanzarlos.
>
> Trabajamos a ritmo normal. Presenta el plan con tus preguntas y espera mi
> autorización.

Lo que este prompt tiene de notable es que **fija los criterios antes de que
exista el trabajo**, incluidos los dos que podrían haberse olvidado a mitad: que
los 560 tests existentes sigan en verde «sin cambios» y que se compruebe la
separación **en los dos sentidos**. Un criterio escrito antes no se negocia
después.

El plan respondió con cuatro preguntas: si `e2e/` entra en `tsc -b`, qué hacer
con el reloj del sistema, cuántos recorridos, y si añadir los dos scripts
opcionales.

### Prompt 2 — Autorización, respuestas y dos ajustes

> Autorizo el plan. Respuestas:
>
> 1. Sí, e2e/ entra en tsc -b mediante tsconfig.e2e.json.
> 2. (a): reloj fijo con page.clock y las tres cifras exactas. Si la API del
>    reloj da problemas con React, me lo dices antes de pasar a la (b).
> 3. Cinco recorridos, sin el sexto.
> 4. Sí a test:e2e:ui y test:e2e:report.
>
> Dos ajustes:
>
> - En playwright.config.ts usa reuseExistingServer: false, para que los tests
>   siempre se ejecuten sobre un build recién hecho y nunca sobre un preview
>   antiguo que se haya quedado abierto. Con strictPort, si el puerto está
>   ocupado, que falle con un mensaje claro.
> - Antes de la descarga, comprueba que hay espacio libre suficiente en el disco.
>   Después del npm install, enséñame el resumen de npm audit; no ejecutes npm
>   audit fix --force ni cambies versiones sin mi autorización.
>
> Instalación en tres pasos como propones: para después del paso 2 (el --dry-run)
> y enséñame las URL, tamaños y carpeta reales antes de descargar.
>
> Haz una parada después de que los cinco recorridos pasen, antes de la
> documentación, con el resumen de estado (560 tests de Vitest, los E2E, tsc,
> lint, format y build) y cómo lanzar yo test:e2e:ui para verlo.

### Prompt 3 — Rechazo de una investigación sin propósito

Al enseñar el `git diff` después de instalar el paquete, apareció que Git muestra
`package-lock.json` como binario. Se comprobó la configuración —correcta: `text:
auto`, `eol: lf`, sin bytes nulos ni retornos de carro— y aun así se iba a lanzar
un tercer comando para averiguar el motivo. El usuario lo paró:

> No investigues más por qué git muestra package-lock.json como binario: la
> configuración es correcta (text auto, eol lf) y no cambia ninguna decisión.
> Sigue con el paso 2, el --dry-run de Chromium, y enséñame las URL, tamaños y
> carpeta antes de descargar nada.

### Prompt 4 — Autorización de la descarga

> Autorizo la descarga con npx playwright install chromium. Después, mide el
> espacio real que ocupan las cuatro carpetas en disco y comprueba que Playwright
> encuentra el navegador (por ejemplo, con npx playwright --version y una
> ejecución mínima). Luego sigue con el plan.

### Prompt 5 — Visto bueno a la parada y cierre de la fase

> Lo he visto en test:e2e:ui y con --headed, y funciona. Visto bueno a la parada.
>
> Sigue con la documentación (PROGRESO.md, docs/prompts/fase-08.md y el apartado
> del README con los tres comandos y el --headed), anota el riesgo R7 como
> cerrado, y después la revisión de secretos al final con control positivo,
> incluida la categoría [el identificador de su correo personal, que aportó en el
> momento].
>
> En la verificación en producción, comprueba además que e2e/, playwright.config.ts
> y tsconfig.e2e.json devuelven 404.

El término de la revisión de secretos **se describe y no se reproduce**: es
precisamente el dato que no debe aparecer en el repositorio (pendiente nº 15 y
corrección C4-11 de la Fase 4).

---

## 2. Resumen de lo generado

### Archivos nuevos

| Archivo                          | Qué es                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| `playwright.config.ts`           | `testDir: './e2e'`, solo Chromium, el `webServer`, idioma y zona horaria |
| `tsconfig.e2e.json`              | El tercer proyecto de TypeScript, para que `tsc -b` revise `e2e/` |
| `e2e/pages/ConfiguratorPage.ts`  | Page Object del configurador                                 |
| `e2e/pages/DocumentPage.ts`      | Page Object del documento                                    |
| `e2e/exampleBudget.ts`           | El presupuesto de ejemplo, sus cifras y la fecha congelada    |
| `e2e/full-budget.spec.ts`        | Recorrido 1: del catálogo al documento con las cifras         |
| `e2e/draft-persistence.spec.ts`  | Recorrido 2: lo que sobrevive a una recarga y lo que no       |
| `e2e/print-document.spec.ts`     | Recorrido 3: el documento con el medio `print` emulado        |
| `e2e/keyboard.spec.ts`           | Recorrido 4: del catálogo al documento sin ratón              |
| `e2e/client-form.spec.ts`        | Recorrido 5: validación, foco y cero navegaciones             |
| `docs/prompts/fase-08.md`        | Este registro                                                 |

### Archivos modificados

| Archivo            | Cambio                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| `package.json`     | `@playwright/test` y tres scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:report` |
| `tsconfig.json`    | Una referencia más, a `tsconfig.e2e.json`                                |
| `vite.config.ts`   | `preview: { port: 4173, strictPort: true }`                              |
| `eslint.config.js` | El bloque de React acotado a `src/`; bloque nuevo para `e2e/` con globales de Node; tres carpetas de informes en `globalIgnores` |
| `README.md`        | Playwright en el stack, los tres scripts, el `--headed`, el apartado de los E2E, `e2e/` en la estructura |
| `PROGRESO.md`      | La Fase 8 completa, sus verificaciones, R7 cerrado y la revisión del plazo |

**`.gitignore` no se ha tocado**, y es un acierto de la Fase 1: ya tenía
`playwright-report`, `test-results`, `blob-report` y `/playwright/.cache` bajo el
comentario «Playwright (Fase 8)». Lo que se hizo fue comprobarlo.

**Ningún archivo de `src/` se ha modificado.** El build lo confirma: los nombres
de los archivos compilados salen del contenido, y son los mismos de la Fase 7.

### Ningún ADR nuevo

No ha aparecido ninguna decisión que lo merezca. Todo lo decidido en esta fase es
configuración de herramientas, explicado en los comentarios de cada archivo y en
`PROGRESO.md`. **Inventar un ADR para que la fase tenga uno sería documentación
de adorno**, y un `docs/adr/` con trece decisiones reales vale más que uno con
catorce entradas de las que una no decide nada.

---

## 3. Problemas encontrados y cómo se resolvieron

### P36 — Un ajuste de TypeScript que describía otra realidad

`tsconfig.e2e.json` nació copiando `"module": "nodenext"` de
`tsconfig.node.json`, que es el proyecto de `vite.config.ts`. Parecía lo
razonable: los dos son código de Node. `tsc -b` devolvió **diecisiete errores**,
todos el mismo:

```
error TS2835: Relative import paths need explicit file extensions in ECMAScript
imports when '--moduleResolution' is 'node16' or 'nodenext'.
Did you mean './exampleBudget.js'?
```

La salida pedía a gritos el arreglo fácil: poner `.js` en las importaciones. Y
habría funcionado, dejando en el proyecto diecisiete importaciones que apuntan a
archivos `.js` que no existen.

**La causa no era la extensión, era el ajuste.** `nodenext` describe un código que
Node ejecuta directamente, y entonces Node sí exige la extensión porque es lo que
manda el estándar de módulos. Pero estos archivos **no los ejecuta Node**: los
transpila Playwright, que resuelve `'./exampleBudget'` al archivo `.ts` igual que
hace Vite con la aplicación. El ajuste correcto es `"moduleResolution":
"bundler"`, el mismo de `tsconfig.app.json`.

La lección es la del propio mensaje de error: **sugirió el arreglo que silencia
el síntoma, no el que corrige la causa.** Un error de compilador propone lo que
hace callar al compilador, que no siempre es lo mismo.

### P37 — Secciones anidadas, y tres filas donde se esperaba una

Los cinco recorridos se lanzaron por primera vez con **tres pasando y dos
fallando**, los dos que miran el documento:

```
strict mode violation: ... resolved to 3 elements:
    1) <dd>2.541,25 €</dd>
    2) <dd>409,28 €/mes</dd>
    3) <dd>121,98 €/año</dd>
```

El localizador buscaba la `<section>` que contuviera el encabezado «Pago
inicial» y, dentro, la fila «Total». En el documento, las secciones están
**anidadas**: la de «Importes» contiene las tres de los bloques de pago. Así que
el filtro casaba con la sección de dentro **y con la de fuera**, y dentro de la
de fuera hay tres filas «Total».

La solución fue invertir la búsqueda: localizar el encabezado y **subir a su
sección padre** (`.locator('..')`), que es hijo directo de un solo bloque. Se
aplicó también al Page Object del configurador, donde el localizador antiguo
funcionaba por casualidad.

**Y eso es lo interesante del problema:** el mismo código, con el mismo
componente de resumen, funcionaba en el configurador y fallaba en el documento,
porque en el configurador los bloques no están dentro de otra sección. Un
localizador puede estar mal y pasar, mientras la página no le ponga a prueba el
error. El documento se lo puso.

### P38 — Un rótulo que decía «código: 0» mientras tsc fallaba

El primer informe del resultado de `tsc` se construyó así:

```bash
npx tsc -b 2>&1 | tail -30; echo "--- fin de la salida de tsc (codigo: $?) ---"
```

Y salió por pantalla **«codigo: 0» justo debajo de diecisiete errores de
compilación**. El motivo es que `$?` en una tubería devuelve el código del
**último** comando, que era `tail`, y `tail` siempre funciona.

Es exactamente la familia de problemas que el apartado 5 de `CLAUDE.md` prohíbe
desde la Fase 4, donde entró en las normas por un caso idéntico: allí fue un
`echo` detrás de un `;` en lugar de un `&&`. La norma dice que ningún mensaje de
comprobación puede afirmar que algo ha ido bien sin depender del resultado real
del comando.

**Lo que no funcionó fue conocer la norma.** Estaba leída al principio de la
sesión y aun así el comando salió mal, porque la tubería con `tail` se escribe
sola cuando lo que se quiere es acortar una salida larga. La corrección operativa
es concreta: el código se guarda en una variable **antes** de cualquier tubería o
encadenamiento, y se imprime desde ahí.

```bash
npx tsc -b; CODIGO=$?; echo "codigo de salida real de tsc: $CODIGO"
```

Desde ese momento, todas las comprobaciones de la fase llevan su código de
salida, y por eso la tabla de verificaciones de `PROGRESO.md` tiene una columna
para él.

### P39 — Una estimación que se quedó un 42 % corta

El plan dijo que la descarga serían «~235 MB». Las peticiones de cabecera a los
servidores dieron **332,8 MB**. La causa: Playwright 1.65 ya no descarga la
compilación abierta de Chromium sino **Chrome for Testing**, que es más grande, y
añade dos utilidades que la estimación no contemplaba (`winldd` y el peso real de
FFmpeg).

No tuvo consecuencias —había 347 GB libres— pero sí importa el método: **esa
cifra era la base de una autorización**. La diferencia entre estimar y preguntar
al servidor es una petición `curl -sI`, que no descarga el archivo. La estimación
sirvió para pedir permiso de investigar; la cifra real sirvió para pedir permiso
de descargar.

### P40 — Una categoría de la revisión de secretos que no podía encontrar nada

La expresión de teléfonos de la revisión final devolvió **0 coincidencias**. Y en
el repositorio **hay** un teléfono: el ficticio de la agencia, que entró en la
Fase 7 y está documentado.

La causa es pequeña y decisiva: el patrón pedía seis o más dígitos **seguidos**
tras el prefijo internacional, y el teléfono está escrito en grupos separados por
espacios, `+34 000 000 000`. Ningún tramo llega a seis dígitos consecutivos, así
que el patrón no podía coincidir **con nada**, ni con un teléfono real ni con el
ficticio.

Lo destapó **el control positivo**, que en esta categoría estaba disponible
gratis: la Fase 7 había dejado documentado que ese teléfono existe, así que un
cero era imposible. Repetida con una expresión que admite grupos separados, la
búsqueda devuelve exactamente una coincidencia.

Es el cuarto caso de la misma familia en dos fases —`grep -c` contando líneas, un
filtro que excluía el dominio buscado, un escapado roto y ahora un patrón sin
espacios— y de los cuatro este es el más peligroso, porque los otros tres daban
un número raro que invitaba a mirar. **Este daba el número que uno quiere ver.**

### P41 — Una edición que se llevó un encabezado por delante

Al insertar la sección de la Fase 8 en `PROGRESO.md`, el texto que se sustituyó
incluía el encabezado `## Pendiente y vigilado` y su separador, y el texto nuevo
**no los devolvió**. Resultado: la lista de pendientes y la tabla de riesgos
quedaron colgando de «Verificaciones de la Fase 8», sin encabezado propio, en un
archivo de más de dos mil líneas donde eso no se ve leyendo por encima.

Lo detectó una comprobación de estructura —listar en orden todos los encabezados
de nivel 2 del archivo— hecha al ir a insertar la sección siguiente. **No lo
detectó ninguna de las comprobaciones automáticas de la fase**, y conviene decirlo
entero: `prettier --check` reformateó el archivo sin quejarse, y `lint`, `tsc`,
los 560 tests y los 5 recorridos estaban en verde con el encabezado perdido. Un
Markdown con un encabezado de menos sigue siendo Markdown válido.

**La lección es sobre la forma de editar, no sobre el descuido.** Una sustitución
cuyo texto de partida incluye un encabezado que no se quiere cambiar lleva ese
riesgo dentro. Lo que lo evita es anclar la sustitución **entre** las dos cosas
que no se tocan, o comprobar la estructura del documento después de cada
inserción grande.

### P42 — Documentar el hallazgo reintrodujo el dato del hallazgo

La revisión de secretos se repitió al final, porque entre la primera pasada y el
cierre se habían editado cinco archivos (corrección **C2-5**). En la segunda
pasada, la categoría de rutas de Windows pasó de **8 coincidencias a 9**.

La novena era texto escrito por mí: al corregir el pendiente nº 17 de
`PROGRESO.md` para que nombrara los archivos donde la ruta sigue viva, se citó
**literalmente** el prompt en el que el usuario aprobó dejarlas, y ese prompt
contiene la ruta. Es decir: el párrafo que documentaba dónde está el dato **metió
el dato en un archivo donde no estaba**.

Esto no es un caso nuevo, es el enunciado exacto de la corrección **C1-6** de la
Fase 1, que está en el apartado 5 de `CLAUDE.md` desde entonces: «documentar un
problema de datos personales es una forma habitual de volver a introducirlos: al
citar un prompt o describir un hallazgo se copian los datos que se querían
retirar». La norma incluso dice qué hacer: **describir el dato en lugar de
reproducirlo**, que es lo que se hizo al corregirlo.

Lo que esta fase añade a esa norma es **cómo se detecta**: no por recordarla al
escribir, sino porque la revisión se repitió después de editar y **la cifra de
una categoría subió**. Dos normas distintas trabajando juntas —repetir la
revisión tras cualquier edición, y comparar los recuentos en lugar de mirar solo
si hay ceros— encontraron el incumplimiento de una tercera. Un «9» donde antes
había un «8» es un hallazgo; un «9» mirado sin el «8» anterior habría pasado por
normal.

---

## 4. Decisiones tomadas en esta fase

| Decisión                                                        | Motivo                                                                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Cinco recorridos completos**, no veinte pequeños              | Un test E2E es caro de mantener, y lo que aporta es la cadena entera, no la pieza. Las piezas ya las prueban los 560 |
| **Cada recorrido tiene que probar algo que jsdom no pueda**      | Si un E2E repite lo que ya prueba un test unitario, solo añade tiempo de ejecución y un sitio más donde romperse      |
| **El reloj congelado** con `setFixedTime`, no con `install`      | `setFixedTime` falsea la fecha y **deja los temporizadores corriendo**, que es lo que React necesita para dibujar      |
| **La zona horaria y el idioma, fijados en la configuración**     | El documento imprime fechas. Sin fijar la zona, el mismo test daría otro día en el servidor de la Fase 9              |
| **Las claves de `localStorage`, escritas a mano y no importadas** | Importarlas haría que el test siguiera cualquier cambio de la clave, y entonces dejaría de comprobar que es la misma de ayer |
| **Las cifras del ejemplo, en un archivo compartido**             | Lo usan cuatro recorridos: un cambio del catálogo pone los cuatro rojos a la vez, que es la señal correcta            |
| **Orden estricto del tabulador donde se puede, alcanzabilidad donde no** | Un botón desactivado no recibe el foco, así que el número de tabulaciones depende de los valores del presupuesto |
| **`tsc -b` revisa `e2e/`**, con su consecuencia                  | Un archivo que nadie revisa envejece mal. La consecuencia aceptada: un error de tipos en un test para `npm run build` |
| **Los datos de prueba reutilizan el nombre de empresa inventado que ya existía** | Lo destapó la revisión de secretos: los recorridos nuevos traían un segundo nombre inventado donde los 560 tests anteriores usaban uno solo. Dos cosas donde el proyecto tiene una |
| **Ningún ADR**                                                   | No hay ninguna decisión de arquitectura en esta fase. Las de herramientas van en los comentarios y en `PROGRESO.md`   |

---

## 5. Correcciones del usuario y por qué

### C8-1 — `reuseExistingServer: false`

El plan proponía `reuseExistingServer: !process.env.CI`, que es el valor que
aparece en la documentación de Playwright y en todos los ejemplos. El usuario lo
cambió:

> En playwright.config.ts usa reuseExistingServer: false, para que los tests
> siempre se ejecuten sobre un build recién hecho y nunca sobre un preview
> antiguo que se haya quedado abierto.

**Tenía razón, y el fallo que evita es silencioso.** Con `true`, un `vite
preview` olvidado en una terminal de hace una hora se reutiliza, y los cinco
recorridos pasan —o fallan— contra un build que no es el del código actual. No
hay ningún mensaje: los tests se ven verdes y no están probando lo que dicen.

El coste es unos segundos de compilación por ejecución. Lo que se compra con
ellos es que «los tests pasan» signifique «los tests pasan sobre este código».

Y hay un detalle que lo redondea, también del usuario: con `strictPort`, si el
puerto está ocupado el servidor **no arranca**, así que el caso se convierte en un
error inmediato y legible en lugar de en una ejecución contra otra cosa.

### C8-2 — Comprobar el espacio en disco antes de descargar

El plan daba los tamaños pero no comprobaba que cupieran. El usuario lo pidió
explícitamente, y es la clase de comprobación que solo se echa de menos cuando
falla: una descarga de 332 MB que se queda a medias por falta de espacio deja la
caché de Playwright en un estado a medio hacer.

Resultado: 347,48 GB libres, el 0,29 % de lo necesario. Pero la comprobación
valía lo mismo si hubiera dado 200 MB.

### C8-3 — El `npm audit` a la vista, y nada de arreglarlo por iniciativa propia

> Después del npm install, enséñame el resumen de npm audit; no ejecutes npm
> audit fix --force ni cambies versiones sin mi autorización.

La segunda mitad es la importante. `npm audit fix --force` es capaz de **subir
dependencias de versión mayor** para resolver un aviso, lo que en un proyecto con
React 19, Vite 8 y Tailwind 4 puede dejar la aplicación sin compilar a cambio de
silenciar algo que quizá ni afecta. La instrucción convierte una decisión de
dependencias en una decisión del usuario, que es donde le corresponde estar.

Resultado: 0 vulnerabilidades, nada que decidir.

### C8-4 — La parada después del `--dry-run`, con los datos reales

El plan ya proponía separar la comprobación de la descarga. El usuario añadió qué
tenía que ver antes de autorizar: **las URL, los tamaños y la carpeta reales**.

Y ahí se destapó el problema **P39**: el `--dry-run` imprime URL y carpetas pero
**no tamaños**, así que hubo que pedirlos a los servidores. Sin esta corrección,
la descarga se habría autorizado con la estimación del plan, que era un 42 %
baja.

### C8-5 — La parada antes de la documentación

> Haz una parada después de que los cinco recorridos pasen, antes de la
> documentación.

Es la misma corrección **C7-6** de la Fase 7 —«las paradas, antes de cada
frontera»— aplicada sin que hubiera que recordarla. Y tiene un motivo concreto
aquí: entre «los tests pasan» y «la fase está documentada» hay un trabajo largo
que no se puede revisar de un vistazo, y si lo que pasa no es lo que el usuario
esperaba, documentarlo primero significa reescribirlo después.

En esta fase la parada sirvió además para que el usuario viera los recorridos
funcionando con `test:e2e:ui` y `--headed` **antes** de que se escribiera una
sola línea sobre ellos.

### C8-6 — No investigar lo que no decide nada

Al enseñar el diff de la instalación apareció que Git muestra `package-lock.json`
como binario. Se comprobó la configuración, salió correcta, y aun así se iba a
lanzar un tercer comando para averiguar el motivo. El usuario lo paró.

**Tenía razón, y es la norma de ritmo del apartado 1 de `CLAUDE.md` —la que entró
en la Fase 3— incumplida por mí en la Fase 8.** La norma trae su propia pregunta
de control: _¿cambia esto alguna decisión?_ Y la respuesta era que no: la
configuración de finales de línea estaba verificada correcta, el archivo lo
genera npm y nadie lo lee a mano. Lo que había era curiosidad, que es un motivo
legítimo para investigar algo **y no para gastar el tiempo de una fase con
plazo**.

La norma añade qué hacer en caso de duda: preguntar antes de lanzar la
comprobación, no decidirlo por cuenta propia. Tampoco hice eso.

### C8-7 — Las rutas nuevas, en la verificación de producción

> En la verificación en producción, comprueba además que e2e/,
> playwright.config.ts y tsconfig.e2e.json devuelven 404.

Es la lista de rutas comprobadas creciendo con lo que la fase ha añadido. Siete
fases comprobando que `src/` y `docs/` no se publican no dicen nada sobre tres
archivos que no existían. Una lista de comprobación que no crece con el proyecto
va caducando sola.

### C8-8 — La categoría del correo personal en la revisión de secretos

El usuario aportó el identificador de su correo personal como término de búsqueda,
como en las fases 2, 6 y 7. **No se escribe en el repositorio**, porque es
exactamente el dato que no debe aparecer (pendiente nº 15). Aquí se describe.

---

## 6. Aprendizajes de la fase

### 1. Un test de punta a punta se justifica por lo que el simulador no puede hacer

Es la pregunta que decide si un recorrido merece existir: **¿qué prueba esto que
no pueda probar un test de Vitest?** Si la respuesta es «nada», el recorrido solo
añade minutos de ejecución y un sitio más donde romperse.

En esta aplicación las respuestas fueron cuatro, y todas concretas:

- jsdom **no aplica `@media print`**, así que el CSS de impresión no se podía
  probar: solo que los elementos llevaran la clase.
- jsdom **no navega nunca**, así que un formulario al que le faltara el
  `preventDefault` pasaría los 560 tests y pondría los datos del cliente en la
  URL.
- El **orden del tabulador** lo decide el motor del navegador, incluyendo qué
  botones están desactivados.
- Un `localStorage` de verdad **entre dos cargas de página**.

La cuarta parece la más modesta y la segunda es la más grave: es un fallo de
privacidad invisible para toda la suite existente.

### 2. Un mensaje de error propone el arreglo que lo hace callar

`TS2835` sugería literalmente `'./exampleBudget.js'`. Ponerlo habría funcionado y
habría dejado en el proyecto diecisiete importaciones apuntando a archivos que no
existen. El error no estaba en las importaciones: estaba en haber declarado que
este código lo ejecuta Node, cuando lo transpila Playwright.

La pregunta útil ante un error de configuración no es «qué hace que esto pase»
sino **«qué ajuste describe cómo se ejecuta esto de verdad»**.

### 3. Un localizador puede estar mal y pasar

El mismo localizador de bloques funcionaba en el configurador y devolvía tres
elementos en el documento, porque allí las secciones están anidadas y aquí no.
Pasó el primer recorrido y falló el tercero.

De ahí dos cosas. La primera, que **un test en verde no valida sus propios
localizadores**: solo dice que en esa página concreta encontraron algo. La
segunda, que la forma robusta de localizar algo es **partir de lo que lo
identifica** —su encabezado, que es hijo de un solo bloque— y no de su
contenedor, que puede estar dentro de otro igual.

### 4. Saber una norma no es cumplirla

El rótulo «código: 0» sobre diecisiete errores de compilación salió **el mismo
día** en que la norma que lo prohíbe se había leído al empezar la sesión. La
norma estaba clara, el caso de la Fase 4 estaba documentado, y aun así la tubería
con `tail` se escribió sola, porque es lo natural cuando lo que se quiere es
acortar una salida larga.

Lo que arregla esto no es recordar mejor la norma, es **cambiar la forma de
escribir el comando** para que el fallo no quepa: el código de salida se guarda
en una variable antes de cualquier tubería. Una norma que depende de acordarse en
el momento adecuado se incumple; una norma convertida en una manera fija de
escribir algo, no.

### 5. Una cifra que sostiene una autorización se pregunta, no se estima

La estimación de la descarga se quedó un 42 % corta, y la diferencia entre
estimar y saber era una petición de cabecera que no descarga nada.

El matiz está en para qué sirve cada cifra: una estimación vale para **pedir
permiso de averiguarlo**; para **pedir permiso de hacerlo** hace falta el dato
real. Confundir las dos es pedir una autorización sobre información que uno mismo
sabe que es aproximada.

### 6. Un test que nace en verde necesita un control, no un ciclo

El ciclo rojo-verde del TDD no se puede ejecutar sobre funcionalidad ya hecha: el
test nace verde. Pero la razón de ser del ciclo —**un test que no se ha visto
fallar no demuestra nada**— sigue valiendo igual, así que hay que conseguir el
rojo por otra vía.

Las cuatro que se usaron aquí:

| Vía                       | Ejemplo de esta fase                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| Romper a propósito        | Un céntimo de más en un total: tres de cinco recorridos en rojo             |
| Pareja positivo/negativo  | El mismo volcado contiene `online-store` y no contiene ninguna `@`          |
| Antes y después           | Los botones, visibles en pantalla y ocultos en impresión, y visibles otra vez |
| El control incorporado    | Si el reloj no estuviera congelado, las fechas fallarían porque hoy no es el 10/03/2026 |

La tercera es la más elegante de las cuatro, porque **no hay que hacer nada
especial para conseguirla**: la comprobación de que algo desaparece al imprimir
ya contiene la de que estaba ahí antes.

### 7. El `.gitignore` de la Fase 1 se escribió para esta fase

Tenía `playwright-report`, `test-results`, `blob-report` y `/playwright/.cache`
desde el primer commit, siete fases antes de que existiera un solo test de
Playwright, con el comentario «Playwright (Fase 8)». En esta fase no hubo que
tocarlo.

La diferencia práctica es grande: la alternativa habría sido lanzar los
recorridos, ver aparecer 536 KB de informes en `git status` y añadirlos al
`.gitignore` **después** —con la posibilidad real de que, entre una cosa y otra,
un commit se los llevara por delante. Lo que protege de eso no es la diligencia
al revisar un commit, es haber puesto la exclusión antes de que hubiera algo que
excluir.

---

## 7. Momentos para el vídeo

### Momento 1 — La aplicación usándose sola, sin ratón

**Lo que se ve en pantalla:** se escribe en la terminal

```
npx playwright test keyboard.spec.ts --headed
```

Se abre una ventana de Chromium con el configurador. Y entonces, sin que nadie
toque el teclado ni el ratón, **el foco empieza a saltar de tarjeta en tarjeta**:
el borde azul aparece en «Landing page de campaña», en «Web corporativa», en
«Tienda online» —y esa se añade al presupuesto—, sigue bajando hasta «SEO
Profesional», hasta «Hosting y dominio», llega al campo de los meses, se escribe
un 12, aparece el descuento por permanencia, baja por el formulario rellenando
los tres campos y pulsa «Preparar el documento». Aparece el documento con su
número. Doce segundos.

**Por qué importa:** porque la accesibilidad del proyecto deja de ser una
afirmación del README y se ve. El vídeo del TFM puede decir «todo es operable con
teclado», o puede enseñar la aplicación operándose con teclado de principio a
fin. Y hay un detalle que merece señalarse al narrarlo: el foco **no se mueve**
al añadir un servicio, así que se puede deshacer con otro Enter sin buscar nada.

### Momento 2 — El céntimo de más

**Lo que se ve en pantalla:** en `e2e/exampleBudget.ts`, se cambia una sola cifra
—`2.541,25 €` por `2.541,26 €`— y se lanza `npm run test:e2e`. Tres de los cinco
recorridos se ponen en rojo, y el mensaje dice:

```
Expected: "2.541,26 €"
Received: "2.541,25 €"
```

Se revierte el cambio y los cinco vuelven a verde.

**Por qué importa:** es la metodología del proyecto en veinte segundos. Un test
en verde no prueba nada hasta que se demuestra que **puede** ponerse en rojo, y
ese «Received» es la cifra leída de un navegador de verdad, no un número que el
test se haya inventado. El detalle que remata la explicación: **se pusieron rojos
tres y no cinco**, porque los otros dos no afirman esa cifra. Que fallen
exactamente los que miran la cifra, y solo ellos, es parte de lo que valida el
control.

### Momento 3 (alternativa) — El documento desapareciendo al imprimirse

**Lo que se ve en pantalla:** el modo interactivo (`npm run test:e2e:ui`) con el
recorrido de impresión seleccionado. En la lista de pasos de la izquierda se
pincha el anterior a `emulateMedia` y a la derecha se ve el documento **con sus
dos botones y la nota de la numeración**. Se pincha el paso siguiente y la misma
página aparece **sin los botones y sin la nota**, con el presupuesto intacto.

**Por qué importa:** es la fase entera resumida en dos capturas. Lo que hasta
ayer solo podía comprobar una persona pulsando `Ctrl+P` y mirando la vista
previa, ahora lo comprueba un test en dos segundos y cada vez. Y el modo
interactivo lo enseña como lo que es: dos fotos de la misma página, en dos medios
distintos.
