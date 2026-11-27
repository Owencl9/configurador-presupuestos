# Fase 9 — Calidad: accesibilidad automática, cobertura, Husky y GitHub Actions

**Fecha:** 26/11/2026
**Estado al empezar:** fases 0 a 8 cerradas y desplegadas. 560 tests de Vitest y
5 recorridos de Playwright en verde. Repositorio privado hasta la Fase 10.
**Estado al terminar:** reglas de accesibilidad en el lint, la aserción hueca de
la Fase 7 arreglada y demostrada, informe de cobertura revisado, un duplicado
agrupado, gancho de pre-commit y workflow de integración continua.

**La aplicación no ha cambiado.** El build de esta fase genera
`index-BpmhP4VQ.js` e `index-yYO2TO7R.css`, exactamente los mismos nombres que
se verificaron en producción al cerrar la Fase 7 y que repitió la Fase 8. Esos
nombres salen del contenido, así que dos builds con el mismo nombre son el mismo
contenido.

---

## 1. Los prompts del usuario

### Prompt de apertura

> Vamos a empezar la Fase 9 del Configurador de Presupuestos: accesibilidad
> automática, Husky, GitHub Actions y cobertura.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md (sobre todo «Siguiente paso»),
> docs/prompt-maestro.md y docs/prompts/fase-08.md. […]
>
> Alcance:
>
> 1. eslint-plugin-jsx-a11y en el lint, con las reglas recomendadas. Si aparecen
>    avisos, corrígelos en el código y explícame cada uno.
> 2. Informe de cobertura de Vitest. Con él, revisa si hay tests duplicados que
>    comprueban exactamente lo mismo y propón agruparlos sin perder ningún caso.
>    No borres ninguno sin mi autorización.
> 3. Arregla la aserción negativa hueca del formulario que quedó anotada en
>    docs/prompts/fase-07.md: el test tiene que poder ponerse en rojo si el
>    mensaje desaparece. Demuéstralo con su control.
> 4. GitHub Actions: un workflow que en cada push y pull request ejecute
>    format:check, lint, tsc -b, los tests de Vitest, el build y los E2E de
>    Playwright. Requisitos: runner estándar, timeout-minutes, concurrency con
>    cancel-in-progress, caché de dependencias y del navegador, solo Chromium,
>    permisos mínimos, ningún secreto.
> 5. Husky con un pre-commit ligero (format:check y lint; como mucho Vitest,
>    nunca los E2E). Es lo primero del orden de recortes: si se complica en
>    Windows, me avisas antes de insistir.
>
> Criterios: cualquier instalación, dime antes qué vas a instalar y espera mi
> autorización. Los 560 tests y los 5 E2E siguen en verde, sin tocar importes
> esperados. La aplicación no debería cambiar, salvo correcciones de
> accesibilidad que me expliques. Al cerrar, verifica que el workflow se ejecuta
> en verde en GitHub.

### Prompt de autorización, con una condición y dos añadidos

> Opción 1 (overrides en package.json), con una condición: demuéstrame con un
> control positivo que las reglas funcionan de verdad con ESLint 10. Crea un
> fichero temporal con un `<img>` sin alt y un div con onClick sin manejo de
> teclado, comprueba que npm run lint falla con los errores de jsx-a11y
> (enséñame la salida y el código de salida) y después borra el fichero. Si no
> detecta los errores, para y me lo dices.
>
> Además, dos añadidos al plan:
>
> 1. Husky y el script "prepare": se ejecuta en cada instalación, también en
>    GitHub Actions y en Vercel. Comprueba que npm ci funciona sin fallar en un
>    entorno sin ganchos y, al cerrar la fase, que el despliegue de Vercel sale
>    bien.
> 2. En el workflow, si fallan los E2E, sube el informe de Playwright como
>    artefacto solo en caso de fallo (if: failure()), con retention-days: 7,
>    para poder diagnosticarlo.
>
> El resto del plan, aprobado tal cual. No instales gh.

Las otras tres respuestas del momento de autorizar: **push a `main` más todos
los pull requests** (no a todas las ramas), **pre-commit con formato, lint y
Vitest**, y **la verificación del workflow la hace el usuario** en la pestaña
Actions, sin instalar la herramienta `gh`.

### Prompt de la decisión sobre los duplicados

> Opción 1: it.each con las cinco filas, con el título de que buildPriceLabel
> delega el formato en formatEuros. Que el total siga en 560.

Seguido de cinco retoques en comentarios, que están en el apartado de
correcciones (C9-4 a C9-8).

### Prompts de revisión del README

Dos, con cuatro y un ajuste respectivamente. Están recogidos en C9-9 y C9-10.

---

## 2. Resumen de lo generado

| Archivo                                      | Qué es        | Qué hace                                                                     |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                   | **nuevo**     | Las seis comprobaciones en cada push a `main` y en cada pull request         |
| `.husky/pre-commit`                          | **nuevo**     | Formato, lint y tests de Vitest antes de cada commit                         |
| `package.json`                               | modificado    | Las dos dependencias, el `overrides` de ESLint y el script `prepare`         |
| `eslint.config.js`                           | modificado    | `jsxA11y.flatConfigs.recommended` en el bloque de `src/`                     |
| `src/features/client-form/ClientForm.test.tsx` | modificado  | La aserción hueca, con su control positivo dentro del propio test            |
| `.../service-catalog/buildPriceLabel.test.ts`  | modificado  | Cinco tests de formato agrupados en una tabla `it.each`                      |
| `README.md`                                  | modificado    | Stack, apartado «Comprobaciones automáticas», accesibilidad y funcionalidades |
| `PROGRESO.md`                                | modificado    | La fase, sus verificaciones, el pendiente nº 3 resuelto y el siguiente paso  |
| `docs/prompts/fase-09.md`                    | **nuevo**     | Este documento                                                               |

**Dos dependencias de desarrollo instaladas**, ninguna global:
`eslint-plugin-jsx-a11y` 6.10.2 y `husky` 9.1.7. `npm audit` sigue en **0
vulnerabilidades**. La cobertura no necesitó nada: `@vitest/coverage-v8` estaba
instalado desde la Fase 1.

**Ningún ADR nuevo.** No ha aparecido ninguna decisión de arquitectura: lo
decidido aquí es configuración de herramientas, y está razonado en los
comentarios de cada archivo y en este registro. La única decisión con algo de
fondo —el `overrides` para una dependencia de pares desfasada— es una nota de
instalación, no una decisión de diseño, y vive donde se aplica.

---

## 3. El informe de cobertura

| Métrica    | Resultado           |
| ---------- | ------------------- |
| Sentencias | **97,99 %** (439/448) |
| Ramas      | **96,31 %** (235/244) |
| Funciones  | **99,11 %** (112/113) |
| Líneas     | **97,94 %** (428/437) |

**La cifra solo mide Vitest**, y hay que decirlo cada vez que se mira: los cinco
recorridos de Playwright ejercitan muchísimo código y no aparecen aquí. Lo dejó
anotado la Fase 8 precisamente para que al llegar a este informe no se leyera
mal.

### Qué son las 9 sentencias que faltan

Se miraron una por una, porque un hueco de cobertura solo significa algo cuando
se sabe qué línea es:

| Dónde                                                           | Sentencias        | Qué hay ahí                                                      |
| --------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------- |
| `calculateSubtotals.ts`, `createBudgetLine.ts`, `parseDraft.ts` | **6** (2 + 2 + 2) | El `default` de un `switch` con `const x: never = service`       |
| `amountDiscount.ts`                                             | **1**             | El descarte de un descuento de importe cero                      |
| `Configurator.tsx`                                              | **1**             | El valor por defecto del reloj (`now = () => new Date()`)        |
| `QuantitySelector.tsx`                                          | **1**             | La salida temprana de `confirmar()` cuando no se ha escrito nada |
| **Total**                                                       | **9**             | — las 9 que faltan para el 100 %                                 |

Son **6 archivos**, no los 8 que lista el informe. Los otros dos
—`calculateDiscounts.ts` y `BudgetLineItem.tsx`— aparecen con **cero sentencias
sin cubrir**: lo que les falta es una rama, no una sentencia. Las ramas sin
cubrir son otras **9**, repartidas entre los 8 archivos.

**Las seis sentencias de la primera fila son inalcanzables a propósito, y eso es
lo que son.** Un
`const formaDePagoNoCubierta: never = service` existe para que **no compile** el
día que alguien añada una cuarta forma de pago al catálogo sin tocar el cálculo.
Su trabajo lo hace TypeScript antes de ejecutarse: el `throw` es solo por si
alguien llega ahí por una ruta que el compilador no ve. Un test que cubriera
esas líneas tendría que fabricar un servicio con una forma de pago que el tipo
no admite, y existiría únicamente para subir un porcentaje.

La séptima, la de `amountDiscount`, es la mitad visible de una redundancia que
está en dos sitios: cada estrategia descarta ya sus descuentos de importe cero,
así que el filtro equivalente del recolector que las combina
(`calculateDiscounts`) nunca llega a dispararse —y por eso ese archivo aparece
en el informe con una rama sin cubrir y ninguna sentencia—. Es un cinturón sobre
unos tirantes, y se deja puesto.

Y las dos últimas son huecos de verdad, pequeños: **ningún test usa el reloj por
defecto** —todos inyectan una fecha fija, que es lo que los hace deterministas—
y nadie sale del campo de cantidad sin haber escrito nada. No se han añadido
tests para ellas: el alcance de esta fase era buscar duplicados, no subir el
porcentaje, y un 97,99 % con el 2 % identificado y explicado vale más que un
100 % con dos tests escritos para el informe.

### Los duplicados

Se extrajeron los **512 bloques `it()`** de los 45 archivos (los 560 tests salen
de ahí: las tablas `it.each` expanden varios casos cada una) y se agruparon los
títulos repetidos. Catorce títulos aparecen más de una vez, y **doce de ellos no
son duplicados**: son el mismo nombre sobre funciones distintas. «Redondea el
descuento al céntimo» está en las tres estrategias, y cada una redondea lo suyo;
«devuelve un número entero de céntimos» está en dos funciones diferentes.
Agruparlos sería juntar cosas que no se parecen en nada más que en el nombre.

**El duplicado real era uno:** cinco tests de `buildPriceLabel.test.ts` que
prueban reglas de formato —millares, dos decimales, el cero de relleno, los
importes menores de un euro— que ya prueba `formatEuros.test.ts`, **cuatro de
ellos con la misma entrada y la misma salida esperada**. Desde la Fase 3
`buildPriceLabel` son dos líneas que llaman a `formatEuros`, así que esos cinco
tests prueban `formatEuros` por segunda vez pasando por delante.

Se presentaron tres opciones y el usuario eligió la que **mantiene los 560
tests**: los cinco casos pasan a una tabla `it.each` dentro de un solo bloque,
titulado «delega el formato en formatEuros». No se ha borrado ningún caso ni se
ha tocado un importe esperado; los cinco siguen ejecutándose y siguen contando
como cinco tests. Lo que cambia es **lo que afirman**: antes decían cinco cosas
sobre un formato que esta función ya no hace, y ahora dicen una sola que sí le
toca —que el formato lo delega y no lo reimplementa—. Si alguien volviera a
escribir aquí la conversión a mano, los cinco casos lo seguirían cazando.

---

## 4. Problemas y soluciones

### P43 — El plugin de accesibilidad declara que no funciona con ESLint 10

**Síntoma.** Antes de instalar: `eslint-plugin-jsx-a11y` está en la 6.10.2, que
es la última publicada, y su `package.json` declara
`peerDependencies: { eslint: '^3 || … || ^9' }`. El proyecto usa ESLint 10.14.0,
y npm 11 corta la instalación con un `ERESOLVE`.

**La causa.** No es que el plugin no funcione con ESLint 10: es que nadie ha
actualizado ese rango. Es la situación habitual cuando una herramienta saca una
versión mayor y su ecosistema tarda unas semanas en seguirla.

**Cómo se resolvió.** Se presentaron tres salidas al usuario y eligió la primera:

| Opción                       | Por qué sí o por qué no                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **`overrides` en `package.json`** | **Elegida.** Afecta solo a ese paquete, queda escrito en el repositorio y viaja con él                                 |
| `--legacy-peer-deps`         | Cambia la resolución del árbol entero, no solo de este paquete, y **no queda constancia en ningún archivo**                 |
| No instalar el plugin        | Dejaría el pendiente nº 3 sin resolver y la accesibilidad sin comprobación automática                                       |

El `overrides` se declaró **antes** de instalar, porque npm lo aplica al
resolver el árbol: puesto después, la instalación ya habría fallado.

### P44 — La aserción hueca, medida: solo 1 de 15 tests se enteraba

**Síntoma.** La Fase 7 dejó anotado que esta aserción de `ClientForm.test.tsx`
no vigila lo que parece vigilar:

```js
expect(screen.queryByText(/formato nombre@example/i)).not.toBeInTheDocument()
```

Una aserción negativa sobre un texto literal pasa igual si ese texto ya no
existe en ninguna parte.

**La medición, que fue peor de lo anotado.** Se borró el mensaje de la
aplicación —se anuló la rama que lo asigna en `validateClientData`— y se ejecutó
el archivo: **de sus 15 tests solo se puso rojo uno, y era otro.** El test que
parece vigilar ese mensaje siguió en verde con el mensaje desaparecido. En el
proyecto entero, **10 de los 560** lo detectan, nueve de ellos en
`validateClientData.test.ts`. Es decir: el mensaje no está desprotegido, pero el
test que dice protegerlo no lo protege.

**El arreglo, que no es el que la Fase 7 anotó.** Aquella nota proponía comparar
contra el principio del mensaje, que no contiene el dominio. Eso arregla **otra**
cosa —desata el test del ejemplo del texto, que es un problema real y también se
ha hecho—, pero deja la aserción igual de hueca: seguiría siendo negativa sobre
un literal. Lo que cierra el hueco es un **control positivo dentro del propio
test**: después de comprobar que escribiendo en un campo limpio no aparece
ningún error, se envía el formulario y se comprueba, **con el mismo
localizador**, que entonces sí aparece. Si el mensaje se borrara, la primera
mitad seguiría pasando y la segunda se pondría en rojo.

**La demostración, en tres pasos.** Un test que no se ha visto fallar no
demuestra nada (apartado 3 de `CLAUDE.md`):

| Paso | Estado                                 | Resultado                                                             |
| ---- | -------------------------------------- | --------------------------------------------------------------------- |
| 1    | Mensaje borrado, **aserción antigua**  | **verde** — la prueba de que estaba hueca                             |
| 2    | Mensaje borrado, **aserción corregida** | **rojo**: `Expected the element to have attribute`                    |
| 3    | Mensaje restaurado, aserción corregida | **verde**, 48 tests del formulario, y `git diff` del archivo **vacío** |

El paso 3 incluye el `git diff` a propósito: demuestra que el archivo de la
aplicación volvió a su versión original byte a byte, y no «parecía» restaurado.

### P45 — Mi recuento de reglas no cuadraba, y lo cazó el usuario

**Síntoma.** Escribí en el README que la configuración recomendada trae «34
reglas, de las que 31 están activas como error y dos desactivadas». El usuario
sumó: **31 + 2 son 33, no 34.**

**La causa.** Mi recuento contaba las desactivadas buscando solo el formato
corto, `'off'`, y una de ellas está escrita en el formato largo,
`['off', { … }]`. El filtro de las activas sí contemplaba las dos formas, así
que el 31 era correcto y el 2 era el error. El desglose real:

| Formato          | Nivel        | Reglas |
| ---------------- | ------------ | ------ |
| `'error'`        | activa       | 25     |
| `['error', { … }]` | activa     | 6      |
| `'off'`          | desactivada  | 2      |
| `['off', { … }]`   | desactivada | 1      |

**31 activas + 3 desactivadas = 34.** Las tres desactivadas por la propia
recomendada son `anchor-ambiguous-text`, `label-has-for` y
`control-has-associated-label`.

**Lo que enseña.** No es un error de accesibilidad ni de configuración: las 34
reglas estaban cargadas y funcionando. Es un error de **recuento**, y la forma en
que se detectó es la interesante: dos cifras escritas al lado que no sumaban. La
misma familia que la corrección C7-5 de la Fase 7, donde un desglose de archivos
tampoco sumaba. **Un número escrito a mano junto a otro número es una invitación
a que discrepen**, y la defensa no es escribir con más cuidado, es que las cifras
que se presentan juntas se puedan sumar a la vista.

### P46 — Una tubería de PowerShell que inutiliza un JSON

**Síntoma.** `npx eslint --print-config … | node -e "JSON.parse(…)"` falló con
un `SyntaxError: Unexpected token` seguido, entre comillas, del **carácter
invisible U+FEFF**. Aquí se describe en lugar de reproducirlo: pegado en un
documento no se ve, y lo que hace es romper en silencio la siguiente herramienta
que lo lea.

**La causa.** Windows PowerShell 5.1 añade una **marca BOM** al texto que pasa
por una tubería, y `JSON.parse` no la admite. Es exactamente el comportamiento
que el apartado 1 de `CLAUDE.md` tiene anotado desde la Fase 7 para
`Set-Content -Encoding utf8`, en otro disfraz: allí ensuciaba un archivo, aquí
ensucia una tubería.

**Cómo se resolvió.** La misma orden desde Git Bash, que no añade nada. No se
cambió ninguna configuración del sistema: se cambió de intérprete para ese
comando concreto.

---

## 5. Las verificaciones del gancho y del workflow

### Que el gancho se ejecuta y bloquea de verdad

Un gancho que no se ha visto bloquear un commit no demuestra nada, igual que un
test que no se ha visto fallar. Se dejó un archivo mal formateado **sin añadirlo
al índice** —así no podía entrar en ningún commit— y se intentó un commit vacío:

```
[warn] src/FORMATO-ROTO-TEMPORAL.ts
[warn] Code style issues found in the above file.
husky - pre-commit script failed (code 1)
```

Con `HEAD` en `9e2c918` antes y después: el commit **no llegó a existir**. Y en
esa misma salida está la prueba de que `set -e` hace su trabajo: solo se ejecutó
`format:check`: el gancho cortó ahí y no siguió con el lint ni con los tests.

Ese `set -e` no es decoración. Sin él, un script de shell devuelve el código del
**último** comando, así que un lint en rojo seguido de unos tests en verde
dejaría pasar el commit sin que nada avisara: una comprobación que no puede dar
un resultado negativo. Es la norma del apartado 5 de `CLAUDE.md`, la misma del
`;` en lugar de `&&` de la Fase 4.

También se comprobó que el archivo del gancho **no tiene BOM ni CRLF** (empieza
por el byte `23`, que es `#`, y tiene cero retornos de carro). Las dos cosas lo
romperían al ejecutarlo con el `sh` de Git en Windows.

### Que `prepare` no tumba una instalación sin ganchos (añadido 1 del usuario)

Probado en una carpeta **sin repositorio de Git**, que es la situación de un
entorno de integración continua o de un despliegue:

| Comando                 | Salida                  | Código |
| ----------------------- | ----------------------- | ------ |
| `husky`                 | `.git can't be found`   | **0**  |
| `husky \|\| true`       | `.git can't be found`   | **0**  |

**Hallazgo que corrigió lo que yo había escrito:** husky 9 ya sale con código 0
por su cuenta cuando no encuentra un `.git`. Así que el `|| true` **no es lo que
protege a GitHub Actions ni a Vercel**, como decía mi primer comentario. Lo que
cubre es otro caso: que husky no esté instalado —una instalación sin
dependencias de desarrollo—, donde el script fallaría con «husky: not found» y
tumbaría la instalación entera. El comentario de `package.json` se reescribió
para decir eso, que es lo que la medición sostiene.

### Las versiones de las acciones, comprobadas antes de escribirlas

Se consultaron al registro de GitHub en lugar de escribirlas de memoria, y la
comprobación se pagó sola:

| Acción                   | Lo que habría escrito de memoria | La versión mayor actual |
| ------------------------ | -------------------------------- | ----------------------- |
| `actions/checkout`       | v5                               | **v7**                  |
| `actions/setup-node`     | v5                               | **v7**                  |
| `actions/cache`          | v4                               | **v6**                  |
| `actions/upload-artifact` | v4                              | **v7**                  |

**Lo que la consulta evitó no fue un fallo, y conviene decirlo con precisión:**
GitHub no retira las versiones mayores antiguas de sus propias acciones, así que
un `actions/checkout@v5` muy probablemente habría funcionado, como mucho con un
aviso de desfase en el registro de la ejecución. Lo que se evitó es **escribir
cuatro versiones con dos y tres mayores de retraso**, en un archivo nuevo, el
mismo día que la fase siguiente activa Dependabot para mantenerlas al día. Un
workflow recién escrito y ya desfasado no es un error, es una deuda que nace
con el archivo.

### Lo que el workflow hace para no gastar minutos

El repositorio es privado y el gasto de pago está bloqueado a 0 $, así que esto
no es una preferencia de estilo:

| Medida                                 | Qué evita                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `runs-on: ubuntu-latest`               | Los _larger runners_, que cuestan varias veces más por minuto               |
| `push` solo en `main` + `pull_request` | La ejecución **duplicada** de una rama con pull request abierto             |
| `concurrency` con `cancel-in-progress` | Terminar una ejecución que ya ha quedado obsoleta por el push siguiente     |
| `timeout-minutes: 20`                  | Que algo colgado gaste hasta el límite de **seis horas** del valor por defecto |
| Caché de npm y del navegador           | Volver a descargar 332,8 MB de navegador en cada ejecución                  |
| Solo Chromium                          | Descargar tres navegadores cuando la configuración usa uno                  |
| Orden de los pasos                     | Esperar cinco minutos para enterarse de un error de formato                 |

Los **20 minutos** y no los 15 del plan: la primera ejecución es la más lenta de
todas y la única sin caché de ninguna clase —baja las dependencias, descarga el
navegador, instala sus librerías de sistema con apt y compila dos veces—. 15
probablemente basten, pero un corte por tiempo en el primer intento se parece
mucho a un fallo real y cuesta un rato distinguirlo.

Y el artefacto del añadido 2 del usuario tiene una condición más estrecha que el
`if: failure()` que pedía el prompt: `failure() && steps.e2e.outcome ==
'failure'`. Con `failure()` a secas, un fallo del lint también activaría el paso,
que intentaría subir una carpeta de informe que en ese caso no existe.

---

## 6. Correcciones del usuario

### C9-1 — Un plugin cargado no es un plugin que funcione

**Corrección.** Al autorizar el `overrides`: «demuéstrame con un control
positivo que las reglas funcionan de verdad con ESLint 10. Crea un fichero
temporal con un `<img>` sin alt y un div con onClick sin manejo de teclado,
comprueba que `npm run lint` falla con los errores de jsx-a11y (enséñame la
salida y el código de salida) y después borra el fichero. Si no detecta los
errores, para y me lo dices.»

**Por qué.** Es la norma del control positivo del apartado 5 de `CLAUDE.md`
aplicada a una herramienta. El riesgo era concreto y no teórico: un plugin que
declara incompatibilidad podía cargarse sin protestar y no evaluar nada, y
entonces un `npm run lint` en verde significaría «las reglas no están
funcionando» mientras parecería decir «el código es accesible». Un «sin avisos»
que no puede dar avisos no es una comprobación.

**Resultado.** El control dio **3 errores de `jsx-a11y` y código de salida 1**:
`alt-text`, `click-events-have-key-events` y, de propina,
`no-static-element-interactions`. Y dejó un segundo dato que no se buscaba: el
único archivo con errores era el de control, así que **la aplicación no produce
ni un aviso de accesibilidad**.

Hubo que añadir una comprobación más para que ese cero significara algo: el
archivo de control estaba en la raíz de `src/`, y había que asegurarse de que
las reglas alcanzan también a los componentes de las subcarpetas. ESLint aplica
las **34 reglas —las 31 activas y las 3 que la recomendada desactiva— sobre
`src/features/client-form/ClientForm.tsx`**. Y el motivo del cero está en el
código, no en la suerte: **todos los `onClick` del proyecto están sobre un
`<button>`**, y no hay ni un `<img>` ni un `<a>`.

### C9-2 — `prepare` se ejecuta en todas las instalaciones, no solo en la tuya

**Corrección.** «Husky y el script "prepare": se ejecuta en cada instalación,
también en GitHub Actions y en Vercel. Comprueba que `npm ci` funciona sin
fallar en un entorno sin ganchos y, al cerrar la fase, que el despliegue de
Vercel sale bien.»

**Por qué.** El prompt maestro prohíbe romper el despliegue, y un script
`prepare` es la forma más discreta de hacerlo: se ejecuta solo, en sitios donde
nadie lo ha pedido, y un fallo suyo no se lee como «el gancho no se ha
instalado» sino como «la instalación ha fallado». Es un riesgo que no se ve
mirando el gancho, porque no está en el gancho.

**Resultado.** La primera mitad, verificada en una carpeta sin `.git` (ver el
apartado 5). **La segunda está pendiente y por eso tiene su hueco escrito aquí
abajo**, en lugar de darse por hecha: las dos cosas que faltan necesitan el
`push`.

**Comprobado por el usuario en GitHub sobre el commit `e62115e`:**

| Qué había que comprobar                                          | Dónde se miró                                                          | Resultado                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Que `npm ci` del workflow no falle por el script `prepare`        | Pestaña **Actions**, paso «Instalar las dependencias exactas del lock» | **en verde, 7 s**                                |
| Que el workflow termine **en verde** con sus seis comprobaciones  | Pestaña **Actions**, ejecución **CI #1**                               | **Success**, 1 m 55 s (el job, 1 m 52 s)         |
| Que el **despliegue de Vercel** salga bien                        | Los checks del commit                                                  | **«All checks have passed», 2 de 2**             |
| Que la aplicación siga funcionando                                | La URL pública, a mano en el navegador                                 | **carga y funciona**                             |

Con eso la corrección queda cerrada por sus dos mitades, cada una en su
servidor: `prepare` no rompe la instalación de GitHub Actions —7 segundos, el
paso en verde— ni la de Vercel —el despliegue completado—. **La comprobación en
local no podía decir nada de ninguna de las dos**, y era el motivo de la
corrección.

Dos detalles de esa ejecución que valen como evidencia de que el workflow está
bien escrito, y no solo de que pasó:

- **El paso del informe de Playwright se saltó (0 s) y la sección de artefactos
  quedó vacía.** Es exactamente lo que tenía que ocurrir: su condición es
  `failure() && steps.e2e.outcome == 'failure'`, y los recorridos pasaron. Un
  artefacto subido ahí habría significado que la condición estaba mal escrita.
- **El resumen de Vitest en el servidor coincide con el local**: 45 archivos,
  560 de 560. El mismo número en dos máquinas distintas, una de ellas Linux.

### C9-3 — El informe del fallo, pero solo del fallo

**Corrección.** «En el workflow, si fallan los E2E, sube el informe de
Playwright como artefacto solo en caso de fallo (`if: failure()`), con
`retention-days: 7`, para poder diagnosticarlo.»

**Por qué.** Un recorrido E2E que falla en el servidor y no en el equipo local es
el caso más difícil de diagnosticar de toda la suite, y sin el informe lo único
que queda es el mensaje de una línea. Subirlo siempre, en cambio, acumularía
informes de ejecuciones que fueron bien.

### C9-4 — Un comentario que atribuía a Vitest una opción de Playwright

**Corrección.** «El comentario está en el paso de Vitest pero habla de
`forbidOnly`, que es de Playwright. En el paso de Vitest explica `allowOnly` de
Vitest (que se desactiva con CI); si mencionas `forbidOnly`, ponlo en el paso de
los E2E, comprobando antes que `playwright.config.ts` lo tiene. Quita la cifra
«560 tests», que se desfasará si cambia el número.»

**Por qué.** Tres cosas en una corrección, y las tres de la misma familia: un
comentario que dice algo falso es peor que no tener comentario, porque el
siguiente que lo lea buscará `forbidOnly` en la configuración de Vitest y no lo
encontrará. La verificación que pedía —comprobar que `playwright.config.ts` lo
tiene antes de mencionarlo— es la que convierte el comentario nuevo en algo
cierto y no en otra suposición: lo tiene, en su línea 48. Y la cifra escrita a
mano es el mismo problema con otro reloj: se queda desfasada sola.

### C9-5 — Siete comprobaciones que eran seis

**Corrección.** «`ci.yml`, línea 5: dice «siete comprobaciones» y son seis.»

**Por qué.** Formato, lint, tipos, Vitest, build y E2E son seis. El siete salió
de contar pasos del workflow en lugar de comprobaciones. Es la misma clase de
error que el P45 y que la C7-5: **una cifra escrita a mano al lado de una lista
que se puede contar.** Corregido enumerando las seis en el propio comentario,
para que la cifra y la lista se puedan comparar a la vista.

### C9-6 — Si cambias un número del plan, di por qué

**Corrección.** «`timeout-minutes` quedó en 20 y el plan decía 15. Me parece
bien 20, pero explica el motivo en el comentario y en `docs/prompts/fase-09.md`.»

**Por qué.** El usuario no discute el valor, discute que **cambiara en silencio**.
Un plan aprobado con un número concreto y un archivo con otro distinto, sin nada
que una las dos cosas, obliga a quien lo revise a decidir si es una mejora o un
descuido. El razonamiento está ahora en los dos sitios.

### C9-7 — La misma cifra desfasable, también en el gancho

**Corrección.** «`.husky/pre-commit`, línea 7: quita también la cifra «560
tests».»

**Por qué.** La misma razón de la C9-4, aplicada con consistencia a los dos
archivos. El comentario ahora dice lo que no se desfasa: que la suite de Vitest
es menos de la mitad de los 25 segundos del gancho.

### C9-8 — Un comentario que contradecía mi propia medición

**Corrección.** «`package.json`, `"//prepare"`: según tu propia comprobación,
husky 9 ya sale con 0 cuando no hay `.git`, así que el `|| true` no es lo que
protege GitHub Actions ni Vercel. Que el comentario diga lo que de verdad cubre
(que husky no esté instalado, p. ej. una instalación sin devDependencies).»

**Por qué.** Es la peor de las correcciones de la fase, porque el dato que
desmentía el comentario **lo había medido yo mismo dos minutos antes** y lo
había puesto en pantalla. Escribir una justificación plausible y dejarla al lado
de la medición que la contradice es cómo se fabrica documentación que parece
rigurosa y no lo es. El comentario ahora dice lo único que la medición sostiene.

### C9-9 — Cuatro afirmaciones del README que no se sostenían

**Corrección.** Sobre el apartado nuevo «Comprobaciones automáticas»:

1. «Las mismas seis comprobaciones se ejecutan en tres momentos» no es exacto:
   el editor solo pasa ESLint y Prettier, el pre-commit tres, y las seis solo
   GitHub Actions. Reformularlo como comprobaciones **escalonadas**.
2. Comprobar con `git ls-files` que `.vscode/settings.json` está versionado (si
   no, el enlace saldría roto en GitHub), decir qué configura y añadir que
   requiere tener instaladas las extensiones de ESLint y Prettier.
3. Ajustar la cifra de las reglas.
4. Verificar contra el archivo qué comprueba de verdad `keyboard.spec.ts`.

**Por qué.** Las cuatro son la misma exigencia: **que lo que dice el README se
pueda comprobar**. La 1 era una generalización cómoda que hacía parecer que los
tres escalones hacen lo mismo. La 2 habría publicado un enlace roto en un
repositorio que en la Fase 10 se hace público —está versionado, comprobado con
su control positivo—, y señalaba algo que yo no había dicho: el escalón del
editor **depende de extensiones que pueden no estar instaladas**, así que es el
más cómodo y el menos fiable de los tres. La 4 es la más importante: yo había
escrito que ese recorrido comprueba la jerarquía de encabezados y el
`aria-live`, y **no comprueba ninguna de las dos cosas**. Comprueba el orden del
foco, que Enter active sin perder el foco, el `aria-pressed`, la descripción
accesible del campo de meses y que los botones del documento sean alcanzables.
Atribuir a un test una garantía que no da es exactamente el problema P33 de la
Fase 7, donde un comentario describía una decisión y la aserción sostenía la
contraria.

### C9-10 — 31 + 2 no son 34

**Corrección.** «Un detalle de la corrección 3: 31 activas + 2 desactivadas son
33, no 34. Averigua qué pasa con la regla que falta (¿está como "warn", o con
otro formato que tu recuento no contó?) y deja la frase del README cuadrada.»

**Por qué.** Porque una cifra que no cuadra es un hilo del que hay que tirar: o
sobra una regla, o falta, o el recuento está mal, y las tres posibilidades
significan cosas distintas. La hipótesis del usuario era correcta en su segunda
mitad: **otro formato que mi recuento no contaba**. Está desarrollado en el P45.

---

## 7. Aprendizajes de la fase

### 1. Una aserción negativa es media comprobación

La Fase 7 dejó anotado el defecto y propuso un arreglo. El arreglo propuesto era
correcto para **otro** problema —el test estaba atado al ejemplo del mensaje— y
no tocaba el que decía arreglar. Esto pasa porque los dos defectos se ven en la
misma línea de código, y hace falta separarlos para darse cuenta:

- «Comparo contra un trozo del texto que puede cambiar» → se arregla comparando
  contra la parte estable.
- «Compruebo que algo **no** está» → **no se arregla cambiando el localizador**,
  porque el problema no es qué se busca, es que buscar y no encontrar significa
  dos cosas a la vez.

Lo segundo solo se cierra demostrando que la misma búsqueda **sí encuentra** el
dato cuando está. Es la norma del control positivo del apartado 5, que llevaba
cuatro fases aplicándose a búsquedas de secretos, aplicada por primera vez a una
aserción.

### 2. El dato que te desmiente suele estar en tu propia pantalla

Dos de las correcciones de esta fase (C9-8 y C9-10) son del mismo tipo: una
afirmación escrita **después** de haber ejecutado la comprobación que la
contradice. No fue falta de información, fue no releer. La defensa no es tener
más cuidado al escribir: es **escribir las cifras de forma que se puedan sumar a
la vista** y **poner al lado la medición**, para que la contradicción salte
sola. El usuario las cazó así las dos veces, sumando.

### 3. La memoria sobre versiones de herramientas se desfasa en silencio

Las versiones mayores de las cuatro acciones oficiales eran todas más nuevas de
lo que habría escrito de memoria, y por dos o tres mayores, no por una. Lo
importante de este aprendizaje es **cómo se nota la diferencia**, porque no se
nota: las versiones antiguas siguen existiendo y funcionando, así que el archivo
habría pasado en verde y nadie habría mirado el aviso de desfase del registro.
Un dato de memoria desfasado no da un error, da un resultado correcto apoyado en
información vieja, que es mucho más difícil de detectar. La consulta al registro
costó treinta segundos y es la única forma de distinguirlo.

### 4. Un 97,99 % con el 2 % explicado vale más que un 100 %

Las nueve sentencias sin cubrir se miraron una por una, y **seis de las nueve**
—las de la primera fila de la tabla del apartado 3— son **código que existe
para no ejecutarse nunca**: guardas de exhaustividad cuyo
trabajo lo hace TypeScript al compilar. Escribir tests para cubrirlas exigiría
fabricar valores que los tipos no admiten, y el único efecto sería el
porcentaje. Un informe de cobertura no se lee para subir una cifra: se lee para
saber qué hay detrás de cada hueco.

### 5. Agrupar no es borrar

El usuario pidió duplicados y pidió que no se borrara nada sin autorización, y
las dos cosas se podían cumplir a la vez. Los cinco casos siguen ejecutándose,
con las mismas entradas y las mismas salidas; lo que cambió es que **ahora
afirman algo que es verdad de la función que prueban**. Un test cuyo nombre
describe un comportamiento que su sujeto ya no tiene es documentación caducada
que además se ejecuta.

---

## 8. Momentos para el vídeo

### Momento 1 — El control positivo del plugin de accesibilidad

**Qué se ve en pantalla.** Un archivo temporal de diez líneas con dos fallos de
accesibilidad reales —una imagen sin texto alternativo y un `div` con `onClick`
sin teclado—, `npm run lint`, y la salida con **tres errores de `jsx-a11y` y
código de salida 1**. Después se borra el archivo, se vuelve a lanzar el lint y
sale **limpio, con código 0**.

**Por qué importa.** Es una idea entera en treinta segundos, y se ve en lugar de
explicarse: el plugin decía no ser compatible con la versión de ESLint del
proyecto, se forzó la instalación con un `overrides`, y **la pregunta de si
funciona de verdad no se contesta leyendo la configuración**. Las dos mitades
juntas —encuentra lo que tiene que encontrar, no encuentra lo que no hay— son lo
que convierte un «sin avisos» en una comprobación. Y lo pidió el usuario, no la
IA: es un buen momento para enseñar en qué consiste supervisar a un agente.

### Momento 2 — El test que seguía en verde con el mensaje borrado

**Qué se ve en pantalla.** Se anula en `validateClientData.ts` la línea que
genera el mensaje de error del correo. Se ejecuta el archivo de tests del
formulario: **14 de 15 en verde**, y el que falla no es el que lleva el mensaje
en su nombre. Se señala el test «no estrena errores mientras se escribe…»,
verde, con el texto que afirma vigilar desaparecido de la aplicación. Después se
añaden las dos líneas del control positivo, se vuelve a ejecutar **sin tocar la
aplicación**, y ese test se pone **rojo**. Se restaura el mensaje y vuelve a
verde.

**Por qué importa.** Es el momento más didáctico del proyecto entero y no
necesita saber React para entenderse: un test en verde que no está probando
nada. Enseña por qué la norma del proyecto exige ver fallar cada test, enseña
que un defecto se puede detectar en una fase y arreglar en otra sin perderlo —la
Fase 7 lo anotó, la Fase 9 lo cerró—, y enseña que el arreglo que la Fase 7
había propuesto **no habría bastado**, lo cual es mucho más interesante que una
corrección que sale a la primera.
