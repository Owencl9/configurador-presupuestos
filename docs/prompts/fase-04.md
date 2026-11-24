# Registro de prompts — Fase 4: Componentes del presupuesto con TDD

**Fecha:** 24/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** construir la línea de presupuesto, el selector de cantidad o meses y el resumen, con TDD, de modo que la aplicación pase de enseñar un catálogo a calcular un presupuesto completo en el navegador.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque, con las decisiones ya tomadas

> Vamos a empezar la Fase 4 del Configurador de Presupuestos: componentes del presupuesto con TDD.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md, docs/prompt-maestro.md y docs/prompts/fase-03.md. Las fases 1, 2 y 3 están cerradas y desplegadas.
>
> Primer paso (pendiente nº 13): añade al apartado 1 de CLAUDE.md la norma de ritmo que acordamos en la Fase 3 […]
>
> Decisiones para esta fase (pendientes 8, 9, 10 y 12 de PROGRESO.md):
>
> - Los meses entran en BudgetLine, con un selector que respete el mínimo de cada servicio mensual.
> - El resumen muestra los tres bloques por separado […] Además, una línea informativa claramente etiquetada con lo que se paga el primer día […]
> - Se retira el contador provisional de servicios seleccionados.
> - Los componentes no calculan nada por su cuenta: todos los importes salen de calculateBudget y se muestran con formatEuros.
>
> Presenta el plan de la Fase 4 y espera mi autorización.

Lo que este prompt hace bien, y conviene retener para el documento final: **llega con los pendientes resueltos**. Las tres preguntas que la Fase 3 dejó abiertas (nº 8, 9 y 10) vienen contestadas, así que el plan no tuvo que preguntarlas, solo decidir cómo implementarlas. Es la diferencia entre un registro de pendientes que se arrastra y uno que se usa.

### Prompt 2 — Autorización, con respuestas y cinco ajustes

> Autorizo el plan de la Fase 4. Respuestas: 1 (b) unión discriminada; 2 (a) campo numérico con − y +; 3 el compromiso total se deja para más adelante; 4 sí al ADR 0008. Acepto también tus tres decisiones del apartado 7.
>
> Cinco ajustes antes de empezar:
>
> 1. Corrección al mínimo al salir del campo, no al teclear. Si se corrige en cada pulsación, escribir "12" en un campo con mínimo 6 se rompe en el "1" […] Quiero un test que escriba "12" en los meses de SEO Básico y compruebe que el valor final es 12.
> 2. Valores raros. La función de normalización […] tiene que tratar el campo vacío, los decimales, los negativos y los números absurdos. Propón un tope máximo razonable […] y dímelo antes de fijarlos. Esta función se reutilizará en la Fase 5 para validar los borradores guardados.
> 3. Una sola multiplicación. Si calculateSubtotals calcula precio × cantidad por su cuenta, que pase a usar calculateLineAmountCents en un paso de refactor […] Prefiero una sola fuente del cálculo a que el archivo quede intacto.
> 4. Dos detalles: […] el aria-live se pone en una frase corta de estado […] para que el lector de pantalla no lea todas las cifras en cada cambio.
> 5. La línea del primer día se etiqueta como «A pagar el primer día (orientativo)». La aplicación no cobra nada ni tiene métodos de pago […]

**Los cinco ajustes son el material más valioso de esta fase** para el documento del TFM, porque ninguno es una corrección de un error ya cometido: los cinco son correcciones de un plan aprobado, hechas antes de escribir una línea. Ver el apartado 5.

### Prompt 3 — Una verificación a mitad de trabajo

> Antes de seguir: confirma con git diff que en los tests de la Fase 3 solo ha cambiado cómo se construyen las líneas, y que ningún importe esperado ha cambiado. Enséñame el resumen del diff de esos archivos.

### Prompt 4 — Dos rechazos de método

> No crees un archivo temporal. Esas garantías de tipos van como tests permanentes con @ts-expect-error en el archivo de test que corresponda […] así quedan comprobadas en cada `tsc -b` y no hay nada que borrar después.

> No hace falta contar. Como son pocas líneas, enséñame las líneas cambiadas completas de esos dos archivos […] Así compruebo directamente que no ha cambiado ningún importe esperado, incluidos los que están dentro de un toEqual de varias líneas.

### Prompt 5 — Confirmaciones y una norma nueva

> Confirmo la variante B: renunciamos a la garantía 2 […] Confirmo MIN_QUANTITY = 1, MAX_QUANTITY = 99 y MAX_MONTHS = 36 […] Un detalle: un valor por encima del máximo (por ejemplo 500 meses) se queda en el máximo, no vuelve al mínimo. Quiero un test que lo compruebe.

> Sobre el eco de "tsc sin errores" que se imprimía aunque hubiera errores: a partir de ahora, que ningún mensaje de comprobación diga que algo ha ido bien sin depender del resultado real del comando. Añádelo como norma en el apartado 5 de CLAUDE.md, junto a la del control positivo.

### Prompt 6 — Cierre, tras probarla en el navegador

> La he probado en local: los cálculos son correctos y el comportamiento también. Un ajuste visual antes de cerrar: en las líneas del presupuesto, los selectores no están alineados entre sí, porque se desplazan según el ancho del importe […]

---

## 2. Resumen de lo generado

### Archivos nuevos

| Archivo                                      | Qué hace                                                     | Tests |
| -------------------------------------------- | ------------------------------------------------------------ | ----- |
| `features/budget/createBudgetLine.ts`        | De un servicio a una línea nueva, con sus meses mínimos      | 7     |
| `features/budget/isMonthlyLine.ts`           | Predicado de tipo: ¿esta línea tiene meses?                  | 6     |
| `features/budget/calculateLineAmountCents.ts` | Precio × cantidad, la única multiplicación del proyecto      | 6     |
| `features/budget/calculateFirstPaymentCents.ts` | Lo que se paga el primer día                               | 7     |
| `shared/utils/normalizeNumber.ts`            | Cualquier valor → entero dentro de un rango                  | 15    |
| `shared/utils/buildAmountLabel.ts`           | Importe + sufijo `/mes` o `/año`                             | 6     |
| `shared/components/QuantitySelector.tsx`     | El selector de cantidad **o** de meses                       | 13    |
| `features/budget/BudgetLineItem.tsx`         | Una línea del presupuesto                                    | 10    |
| `features/budget/BudgetSummary.tsx`          | Los tres bloques de pago con su desglose                     | 9     |
| `features/budget/BudgetPanel.tsx`            | Las líneas, el resumen y la frase de estado                  | 12    |
| `src/App.test.tsx`                           | Test de integración con el catálogo real                     | 8     |
| `docs/adr/0008-el-primer-pago-es-presentacion.md` | La decisión del primer pago                             | —     |

**103 tests nuevos. Con los 87 anteriores, 190 en verde.**

### Archivos modificados

| Archivo                               | Cambio                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `shared/types/budget.ts`              | `BudgetLine` pasa a ser una unión discriminada de tres tipos, con los meses            |
| `features/budget/calculateSubtotals.ts` | Deja de multiplicar: llama a `calculateLineAmountCents`                              |
| `features/service-catalog/buildPriceLabel.ts` | Deja su tabla de sufijos a `shared/utils/buildAmountLabel`; se queda en dos líneas |
| `shared/constants/business-rules.ts`  | `MIN_QUANTITY`, `MAX_QUANTITY` y `MAX_MONTHS`                                          |
| `src/App.tsx`                         | El estado pasa a ser las líneas; entra el panel y sale el contador provisional         |
| `CLAUDE.md`                           | Dos normas nuevas: la de ritmo (apartado 1) y la del eco (apartado 5)                  |

### Los diez ciclos TDD

| Ciclo | Qué se probó                     | Fallo visto antes de implementar                   | Verde |
| ----- | -------------------------------- | -------------------------------------------------- | ----- |
| 1     | `createBudgetLine`               | `Failed to resolve import` — 0 tests               | 7     |
| 2     | `isMonthlyLine` y los tipos      | `Failed to resolve import` — 0 tests               | 6     |
| 3     | `calculateLineAmountCents`       | `Failed to resolve import` — 0 tests               | 6     |
| 4     | `calculateFirstPaymentCents`     | `Failed to resolve import` — 0 tests               | 7     |
| 5a    | Los tres topes de negocio        | **3 fallos de aserción** (`isInteger(undefined)`)  | 3     |
| 5b    | El tope frente al catálogo       | **visto fallar** bajando el tope a 2               | 1     |
| 5c    | `normalizeNumber`                | `Failed to resolve import` — 0 tests               | 15    |
| 6     | `QuantitySelector`               | `Failed to resolve import` — 0 tests               | 13    |
| 7     | `buildAmountLabel` y la línea    | `Failed to resolve import` — 0 tests               | 16    |
| 8     | `BudgetSummary`                  | `Failed to resolve import` — 0 tests               | 9     |
| 9     | `BudgetPanel`                    | `Failed to resolve import` — 0 tests               | 12    |
| 10    | `App` de punta a punta           | **8 fallos de aserción**: no existía el panel      | 8     |

### Dos refactorizaciones con los tests como red

Las dos salieron del ajuste 3 del usuario —«prefiero una sola fuente del cálculo a que el archivo quede intacto»— y las dos terminaron igual: **tests en verde antes y después, sin tocar ninguno**.

| Qué se movió                             | De dónde                          | A dónde                       | Tests que no cambiaron |
| ---------------------------------------- | --------------------------------- | ----------------------------- | ---------------------- |
| La multiplicación precio × cantidad      | dentro de `calculateSubtotals`    | `calculateLineAmountCents`    | 9                      |
| La tabla de sufijos `/mes` y `/año`      | `features/service-catalog`        | `shared/utils`                | 8                      |

---

## 3. Problemas encontrados y cómo se resolvieron

### P13 — Las dos garantías de tipos de `BudgetLine` son incompatibles

**Síntoma.** El plan prometía dos garantías con la unión discriminada: que una línea mensual sin meses no compilase y que una línea de pago único **con** meses tampoco. Al escribirlas como tests, `tsc` aceptó una y rechazó la otra, y luego al revés.

**La medición.** Se escribieron las tres garantías como tests con `@ts-expect-error` y se leyó qué directivas quedaban «sin usar», que es como `tsc` dice «esto que esperabas que fallara, compila»:

| Garantía                                                      | Con `months?: never` | Sin él  |
| ------------------------------------------------------------- | -------------------- | ------- |
| 1. Línea mensual **sin** meses no compila                     | ✅                   | ✅      |
| 2. Línea de pago único **con** meses no compila               | ✅                   | ❌      |
| 3. Leer `linea.months` sin estrechar no compila               | ❌                   | ✅      |

**Causa.** El discriminante de `BudgetLine` está **anidado**: no es un campo de la línea, sino de `line.service`. TypeScript estrecha una unión mirando un campo propio del objeto, no uno de su campo, así que no puede elegir qué miembro de la unión es el destino y comprueba los campos contra la suma de los tres. Declarar `months?: never` en los dos tipos no mensuales cierra ese agujero, pero al declararlo el campo **existe** en los tres miembros, y entonces `linea.months` se lee en cualquier línea como `number | undefined`.

**Un tercer camino, descartado.** Duplicar el discriminante en la propia línea (un campo `payment` además de `service.payment`) daría las dos garantías, al precio de crear un estado imposible nuevo: que los dos campos no coincidan. Se cierra un agujero abriendo otro.

**Resolución.** Decisión del usuario: **quedarse con la garantía 3**. Las lecturas están repartidas por todos los componentes; las escrituras pasan por un solo sitio, `createBudgetLine`, que tiene siete tests. Y lo que se pierde es leve —un `months` sobrante en una línea de pago único no lo lee nadie, porque los meses no intervienen en ningún importe—, mientras que lo que se conserva evita el `undefined` y su valor de reserva en código de presentación.

**Lo que enseña.** Está en el apartado 6, aprendizaje 1.

### P14 — `tsc` encontró un error en un test escrito por el propio asistente

**Síntoma.** Al terminar el ciclo 3, con sus seis tests en verde, `tsc -b` falló:

```
calculateLineAmountCents.test.ts(88,49): error TS2345:
  Property 'months' is missing in type '{ service: MonthlyService; quantity: number; }'
  but required in type 'MonthlyBudgetLine'.
```

**Causa.** Un test construía una línea de SEO —un servicio mensual— sin meses. Es exactamente el dato imposible que la garantía 1 del tipo existe para impedir, cometido por quien había escrito la garantía dos ciclos antes.

**Por qué los tests estaban en verde.** Vitest no comprueba tipos: transpila y ejecuta. En tiempo de ejecución, una línea sin meses funciona perfectamente, porque `calculateLineAmountCents` no los usa. El error solo existía para el compilador, y el compilador no se ejecuta con `npm test`, sino con `npm run build`.

**Resolución.** Añadir `months: 6` al test. Un carácter de arreglo y una lección de las buenas.

### P15 — Un rótulo que decía «sin errores» por encima de un error

**Síntoma.** Durante el ciclo 1, la salida de una comprobación fue literalmente:

```
src/features/budget/calculateLineAmountCents.test.ts(88,49): error TS2345: …
--- tsc sin errores ---
```

**Causa.** El eco iba detrás de un `;` en lugar de un `&&`, así que se imprimía siempre, con error o sin él. El rótulo no describía el resultado: lo afirmaba.

**Resolución inmediata.** Se avisó en el mismo mensaje en que apareció, antes de que el usuario lo leyera como un visto bueno.

**Resolución permanente.** Norma nueva en el apartado 5 de `CLAUDE.md`, a petición del usuario: ningún mensaje de comprobación puede afirmar que algo ha ido bien sin depender del resultado real del comando. Si hay que rotular, el texto describe **qué se ha ejecutado** («fin de la salida de tsc»), no cómo ha salido.

**Un segundo caso, el mismo día y de la misma familia.** Al contar líneas del diff, `grep -c` devolvió `0` —el resultado buscado— y con él un código de salida de error, que cortó la cadena `&&` y **se llevó por delante el control positivo que venía detrás**. Un cero sin control positivo no distingue «no hay nada» de «esto no está buscando», que es el problema **P9** de la Fase 2.

### P16 — El nombre accesible decía «Mesesde SEO Básico»

**Síntoma.** El test del nombre accesible del selector falló por un espacio:

```
Expected: Meses de SEO Básico
Received: Mesesde SEO Básico
```

**Causa.** La etiqueta se había escrito como un texto corto más un añadido oculto: `Meses` + `<span class="sr-only"> de SEO Básico</span>`. El cálculo del nombre accesible recorta los espacios al principio y al final de cada nodo de texto antes de concatenarlos, así que el espacio de delante de «de» desapareció.

**Resolución.** El patrón que ya usaba `ServiceCard` desde la Fase 1: dos elementos hermanos, uno visible con `aria-hidden` y otro oculto a la vista con la **frase completa**. El texto visible sigue contenido en el accesible, como exige el criterio WCAG 2.5.3.

**Lo que enseña.** Un patrón que ya funciona en el proyecto es más fiable que una variante que parece más limpia. La variante corta era más bonita de escribir y producía un nombre accesible mal escrito, que solo se oye con un lector de pantalla.

### P17 — Un test que encontró dos elementos iguales

**Síntoma.** El primer test de `BudgetLineItem` falló con «Found multiple elements with the text: 250,00 €/mes».

**Causa.** El test usaba una línea de **una** unidad, y entonces el precio unitario y el importe de la línea son el mismo número: 250,00 €/mes y 250,00 €/mes. El fallo estaba en el test, no en el componente.

**Resolución.** Usar cantidad 2 en ese test, que es cuando los dos números se distinguen (250,00 €/mes el unitario y 500,00 €/mes el importe). Queda escrito en el propio test por qué la cantidad es 2 y no 1, que es la clase de comentario que evita que alguien lo «simplifique» más adelante.

### P18 — Fijar el ancho del importe no alineaba los selectores

**Síntoma.** El usuario pidió, tras probarla en el navegador, un ancho fijo para la columna del importe, porque los selectores se desplazaban según lo que midiera («72,00 €/año» frente a «300,00 €»).

**Lo que la petición no cubría.** Con `flex` y `justify-between`, fijar el ancho del importe alinea los importes y **sigue sin alinear** el selector de cantidad entre una línea mensual (dos selectores) y una de pago único (uno): el grupo de selectores se pega a la columna del importe, así que su borde izquierdo depende de cuántos haya.

**Resolución.** Una **rejilla de tres columnas de ancho declarado**, igual para todas las líneas, en lugar de un ancho fijo en una sola columna. Y un cambio que no estaba pedido pero sin el que la rejilla no cabe: la fila empieza a 1024 px y no a 640 px, porque entre esos dos anchos las tres columnas estrujan el nombre del servicio. Entre 640 y 1024 px se apila, igual que en el móvil.

**Cómo se verificó.** El usuario lo comprobó en el navegador, en pantalla ancha y en ancho de móvil. El asistente solo podía leer el CSS compilado —comprobó que las clases nuevas estaban dentro de su `@media`, con un control negativo para asegurarse de que la búsqueda discriminaba— y eso no es ver una pantalla. La verificación visual de esta fase es del usuario, y conviene que el registro lo diga así.

---

## 4. Decisiones tomadas en esta fase

| Decisión                                                                     | Motivo                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BudgetLine` como unión discriminada, con los meses obligatorios en la mensual | Los datos imposibles no deben compilar, mismo criterio que `Service` en la Fase 2 (ADR 0006). Y `months` es `number`, no `number \| undefined`               |
| Renunciar a la garantía de que una línea no mensual no pueda tener meses      | Es incompatible con la de obligar a comprobar antes de leer (**P13**), y las lecturas son muchas más que las escrituras                                     |
| El primer pago, en su función y **fuera** de `Budget`                         | Es la suma que el ADR 0007 prohibió, pero responde a otra pregunta. Dentro del tipo se leería como el total que no existe. [ADR 0008](../adr/0008-el-primer-pago-es-presentacion.md) |
| Suma los **totales** con IGIC, no las bases                                   | Es el dinero que sale del banco. Hay un test que distingue las dos implementaciones: 287.000 frente a 307.090 céntimos                                      |
| Un solo `QuantitySelector` para cantidad y meses                              | Cambian etiqueta, unidad y límites, que llegan por props. Dos componentes tendrían la misma lógica de corrección por duplicado                              |
| La corrección se aplica al salir del campo o con Enter, nunca al teclear      | Decisión del usuario. Con el mínimo en 6, escribir «12» pasa por un «1»: corrigiendo al teclear sería imposible escribir 12                                 |
| Por encima del máximo se queda en el máximo                                   | Decisión del usuario. Tratar todo lo inválido igual haría parecer que el campo no funciona                                                                   |
| `normalizeNumber` recibe `unknown`                                            | Decisión del usuario, pensando en la Fase 5: si solo aceptara números, alguien convertiría antes, y esa conversión sin comprobar es el error que evita        |
| Comprobar el tipo **antes** de convertir                                      | `Number(true)` es 1, `Number([])` es 0 y `Number([12])` es 12. Convertir primero dejaría pasar valores con pinta de legítimos                                |
| Infinito va al mínimo, no al máximo                                           | Nadie puede haber querido escribirlo: es un dato inválido, no un valor fuera de rango                                                                        |
| Las filas de subtotal y descuento, escritas y probadas aunque valgan 0        | Deja la pantalla terminada: la Fase 6 implementa estrategias y no toca ningún componente                                                                      |
| Un bloque sin importe no se muestra                                           | «Cuota mensual 0,00 € + IGIC 0,00 €» es ruido que además parece un error de cálculo                                                                          |
| El tipo de IGIC es una prop del resumen, con la constante por defecto          | Para que la etiqueta no pueda mentir si algún día un presupuesto se calcula con otro tipo                                                                     |
| El `aria-live`, en una frase corta de estado                                  | Decisión del usuario. Con el resumen entero activo, cada pulsación recitaría quince cifras                                                                    |
| La frase de estado existe también con el presupuesto vacío                     | Una región activa que aparece con su contenido no se anuncia de forma fiable                                                                                 |
| Los dos botones de quitar comparten nombre accesible                           | Es la misma acción vista desde dos sitios, y lo que los distingue es la región en la que están                                                               |
| Rejilla de tres columnas en lugar de un ancho fijo                            | Un ancho fijo en una columna no alinea los selectores entre líneas con uno y con dos (**P18**)                                                               |
| Los topes de cantidad y meses, en el archivo de constantes                    | Deciden qué se puede escribir: son reglas. Y `MAX_MONTHS` tiene que convivir con los 12 meses del descuento por permanencia, que está en el mismo archivo     |

---

## 5. Correcciones del usuario y por qué

Esta fase tiene nueve, y **ninguna corrige un cálculo**: todas corrigen el método de trabajo, la forma de verificar o la forma de documentar. Es un cambio respecto a las fases anteriores que vale la pena señalar en el documento final.

### C4-1 — Un archivo temporal no deja ninguna garantía

**Corrección.** El asistente propuso crear `src/type-check-temporal.ts` para comprobar con `tsc` las garantías de tipos de `BudgetLine`, y borrarlo después. El usuario lo rechazó: «No crees un archivo temporal. Esas garantías de tipos van como tests permanentes con `@ts-expect-error` en el archivo de test que corresponda, igual que hicimos con `Service` en la Fase 2: así quedan comprobadas en cada `tsc -b` y no hay nada que borrar después.»

**Por qué tenía razón, y no solo por limpieza.** Un archivo temporal comprueba la garantía **una vez**, el día en que se escribe. Un test con `@ts-expect-error` la comprueba en cada compilación, **y se rompe solo si la garantía desaparece**: cuando el compilador deja de rechazar la línea marcada, la propia directiva pasa a ser un error y el build falla. Es una comprobación que no puede quedarse en verde por accidente.

**Y hubo una consecuencia que nadie esperaba.** Precisamente por escribir las garantías como tests permanentes se descubrió que **dos de ellas eran incompatibles** (**P13**). El archivo temporal probablemente habría comprobado solo la que se esperaba que funcionara, y la contradicción habría aparecido tres fases más tarde, en forma de `undefined` en una pantalla.

**Y el asistente ya había escrito la conclusión antes de medirla.** El comentario del tipo decía «Comprobado en positivo con un archivo temporal» cuando ese archivo todavía no se había creado y la comprobación no se había hecho. El rechazo lo dejó a la vista. Documentar un resultado antes de obtenerlo es la forma más fácil de documentar algo falso, y aquí además era falso dos veces: por el método y por el resultado.

### C4-2 — Contar palabras no es comprobar un diff

**Corrección.** Para demostrar que los tests de la Fase 3 no habían cambiado ningún importe, el asistente propuso contar las líneas modificadas que contuvieran `expect`, `toBe` o `toEqual`, con control positivo. El usuario lo detuvo: «No hace falta contar. Como son pocas líneas, enséñame las líneas cambiadas completas de esos dos archivos. Así compruebo directamente que no ha cambiado ningún importe esperado, **incluidos los que están dentro de un `toEqual` de varias líneas**.»

**Por qué tenía razón.** La comprobación propuesta tenía un agujero exacto, y el usuario lo nombró. En un `toEqual` de varias líneas, el importe está en su propia línea:

```ts
expect(calculateSubtotals([linea(WEB)])).toEqual({
  oneTimeCents: 120_000,   // ← cambiar este 120_000 no toca ninguna línea con «expect»
  monthlyCents: 0,
  yearlyCents: 0,
})
```

Cambiar ese número modifica una línea que no contiene `expect`, ni `toBe`, ni `toEqual`. El recuento habría dado cero y el informe habría dicho «ningún importe esperado ha cambiado» con un importe cambiado. El control positivo tampoco lo habría salvado: comprobaba que la búsqueda funcionaba, no que buscara lo correcto.

**Lo que lo sustituyó.** `git diff -U0` de los dos archivos, que imprime todas las líneas cambiadas y ninguna de contexto. Son 45 líneas: se leen en veinte segundos y no hay nada que interpretar. El resultado fue que lo único cambiado es el atajo que construye las líneas en los tests, dos veces, más tres líneas de comentario.

**Es la corrección más fina de las nueve**, porque no corrige un error cometido sino una comprobación que iba a dar el resultado correcto por el camino equivocado, y que habría seguido dándolo hasta el día en que no lo diera.

### C4-3 — La corrección al mínimo se aplica al salir del campo

**Corrección.** Ajuste 1 del prompt 2: «Si se corrige en cada pulsación, escribir "12" en un campo con mínimo 6 se rompe en el "1". La corrección se aplica al perder el foco o al pulsar Enter. Quiero un test que escriba "12" […] y compruebe que el valor final es 12.»

**Por qué.** Es un error de diseño que no se ve escribiendo código y se ve a los dos segundos de usar el campo. El plan decía «campo numérico con mínimo, más clamping», sin precisar cuándo se aplica, y la implementación natural —corregir en cada pulsación— deja el campo inutilizable para cualquier valor de dos cifras cuyo primer dígito esté por debajo del mínimo.

**El detalle que lo convierte en una buena corrección:** venía con el test pedido por escrito. No «ten cuidado con esto», sino «quiero un test que compruebe esto». Es la diferencia entre una advertencia y un requisito.

### C4-4 — Mejor una sola fuente del cálculo que un archivo intacto

**Corrección.** Ajuste 3: «Si `calculateSubtotals` calcula precio × cantidad por su cuenta, que pase a usar `calculateLineAmountCents` en un paso de refactor, con los tests existentes en verde antes y después. **Prefiero una sola fuente del cálculo a que el archivo quede intacto.**»

**Por qué.** El plan presumía de que la Fase 4 no tocaría los archivos de cálculo de la Fase 3, y lo presentaba como señal de que la frontera estaba bien puesta. El usuario detectó que ese orgullo escondía una duplicación: la línea del presupuesto necesita el importe precio × cantidad en pantalla, y si `calculateSubtotals` lo sigue calculando por su cuenta, hay dos sitios multiplicando lo mismo. Basta con que uno aprenda algún día a redondear, a aplicar un descuento o a contar meses y el otro no.

**«No tocar nada» es un objetivo equivocado.** Lo que importa no es qué archivos quedan sin cambios, sino cuántos sitios saben hacer la misma cosa.

### C4-5 — El `aria-live` en una frase, no en el resumen

**Corrección.** Ajuste 4: «El `aria-live` se pone en una frase corta de estado (número de servicios y primer pago), no en todo el resumen, para que el lector de pantalla no lea todas las cifras en cada cambio.»

**Por qué.** Es una corrección de accesibilidad **real**, del tipo que no sale en ninguna lista de comprobación. El plan heredaba el `aria-live` del contador provisional y lo habría puesto en el resumen entero, que es lo que cambia. El resultado habría pasado cualquier auditoría automática y habría sido insoportable de usar: quince cifras recitadas cada vez que se pulsa un botón de cantidad.

### C4-6 — «(orientativo)», porque la aplicación no cobra

**Corrección.** Ajuste 5: la línea del primer día se etiqueta «A pagar el primer día (orientativo)», porque «la aplicación no cobra nada ni tiene métodos de pago: solo genera el presupuesto, y la etiqueta debe dejarlo claro».

**Por qué.** Es la única de las nueve que no es técnica, y probablemente la más importante del conjunto. Una cifra etiquetada «A pagar el primer día», en una pantalla que calcula importes con impuestos, se lee como una obligación de pago. El paréntesis cuesta trece caracteres y cambia lo que la pantalla afirma.

### C4-7 — Por encima del máximo, el máximo

**Corrección.** «Un valor por encima del máximo (por ejemplo 500 meses) se queda en el máximo, no vuelve al mínimo. Quiero un test que lo compruebe.»

**Por qué.** La implementación perezosa trata todo lo inválido igual y devuelve el mínimo. Quien escribe 500 meses se encontraría con 6 y concluiría que el campo está roto. Lo correcto es acercarlo al rango por el lado por el que se ha salido.

**En el test quedaron las dos aserciones**, la que comprueba el 36 y una `.not.toBe(6)` que descarta explícitamente el error que la corrección anticipaba.

### C4-8 — Ningún rótulo puede afirmar un resultado que no ha leído

**Corrección.** «A partir de ahora, que ningún mensaje de comprobación diga que algo ha ido bien sin depender del resultado real del comando. Añádelo como norma en el apartado 5 de `CLAUDE.md`, junto a la del control positivo.»

**Por qué.** Ver **P15**. El usuario la colocó deliberadamente **junto a la norma del control positivo**, y la colocación es el argumento: son el mismo problema visto desde dos lados. El control positivo evita una comprobación que no puede dar negativo; esta evita un informe que no puede dar negativo.

### C4-9 — Verificar lo que se afirma, y cómo se verifica

**Corrección.** Dos veces en la misma fase, el usuario paró el trabajo para pedir una verificación concreta de algo que el asistente ya había afirmado: que los tests de la Fase 3 seguían intactos, y que entre los 15 tests de `normalizeNumber` estaba el del valor por encima del máximo.

**Por qué importa registrarlo.** Las dos afirmaciones eran ciertas. No corrigió un error: comprobó una afirmación. Y en las dos ocasiones la comprobación mejoró el trabajo —la primera cambió el método de verificación (C4-2) y la segunda hizo que la evidencia quedara en el registro, enseñando el test en lugar de citarlo de memoria—. Para el documento del TFM es el ejemplo más claro de supervisión humana de un agente: **pedir la evidencia no es desconfianza, es el procedimiento.**

### C4-11 — La revisión de secretos buscaba otra vez un nombre equivocado

**Corrección.** Al preparar la revisión de secretos de esta fase, el asistente
incluyó entre los términos de búsqueda un nombre que **no es el de la agencia
del usuario**: había usado el identificador de su cuenta de correo personal,
tomándolo por el nombre comercial. El usuario lo detuvo antes de ejecutar la
revisión y aportó los términos correctos: el nombre de la agencia y su dominio,
sin distinguir mayúsculas, y en general cualquier dominio real que no sea de
ejemplo.

**Es la segunda vez que ocurre.** La misma confusión se corrigió en la Fase 1
(corrección **C1-6**, «la revisión de secretos buscaba el dominio
equivocado»). Un error que se repite entre fases no es un descuido: es señal de
que el término correcto **no está escrito en ningún sitio del repositorio** —ni
puede estarlo, porque es precisamente uno de los datos que no deben aparecer—,
así que cada revisión vuelve a inferirlo del contexto y lo infiere mal.

**Qué deja previsto para la Fase 10,** que revisará el historial completo antes
de hacer público el repositorio: los términos a buscar son **el nombre de la
agencia y su dominio, y el identificador del correo personal del usuario**.
**Los términos exactos los facilitará el usuario en ese momento**, y no se
escriben aquí.

Esa omisión es deliberada y es la misma norma que ya actuó en la Fase 1: el
apartado 5 de `CLAUDE.md` exige describir este tipo de dato en lugar de
copiarlo, porque documentar un problema de datos personales es una forma
habitual de volver a introducirlos. El asistente lo cumplió a medias en el
primer intento de escribir esta misma corrección —omitió el identificador del
correo y escribió el nombre de la agencia—, y el usuario lo rechazó. Queda
registrado porque ilustra bien el problema: la norma se aplica a **todas** las
categorías de la frase, no solo a la que suena más privada.

**Lo que enseña.** Una revisión por categorías de datos solo es tan buena como
los términos concretos con los que se instancia. «Buscar datos de la agencia»
es la categoría correcta; el término que la hace funcionar es un dato que, por
definición, no puede quedar guardado en el repositorio. De ahí se deduce una
conclusión incómoda y útil: **esta categoría de la revisión no se puede
automatizar del todo**, y necesita al usuario en el momento de ejecutarla. Las
dos veces que falló, falló por eso.

### C4-10 — Comprobar en qué punto quedó algo interrumpido

**Corrección.** Tras interrumpir una ejecución: «Antes de seguir, comprueba en qué punto quedó y dime si había algo a medias.»

**Por qué.** Es una pregunta de higiene que un agente no suele hacerse solo: después de una interrupción, el estado del repositorio no es necesariamente el que el agente cree. Se comprobó con `git status` y `tsc -b` en lugar de responder de memoria, y el resultado fue útil: confirmó que el archivo temporal rechazado **no se había escrito** y que el único pendiente era el error de compilación ya descrito.

---

## 6. Aprendizajes de la fase

### 1. Dos garantías de tipos pueden excluirse, y hay que medirlo

Se pidió a TypeScript que impidiera dos datos imposibles a la vez: una línea mensual sin meses y una línea no mensual con meses. **No se puede tener las dos**, y además la segunda choca con una tercera que resultó más valiosa: obligar a comprobar la forma de pago antes de leer los meses.

La causa es concreta y vale como lección general sobre uniones discriminadas: **TypeScript estrecha una unión mirando un campo del objeto, no un campo de su campo.** Si el discriminante está anidado —aquí, `line.service.payment`— el compilador no puede elegir qué miembro de la unión es el destino y comprueba los campos contra la suma de todos. El truco que lo arregla (`months?: never`) hace existir el campo en los tres miembros, y al existir se puede leer en todos: justo lo que se quería impedir.

Lo importante del episodio no es el detalle de TypeScript, es **que la contradicción no se dedujo, se midió**, escribiendo las tres garantías como tests y leyendo cuáles aceptaba el compilador. Y que apareció porque el usuario exigió escribirlas como tests permanentes en lugar de comprobarlas una vez en un archivo temporal.

### 2. `tsc` encontró un dato imposible en un test del propio asistente

Dos ciclos después de escribir la garantía de que una línea mensual sin meses no compila, el asistente escribió exactamente esa línea en un test. Los seis tests del ciclo estaban **en verde**, porque Vitest no comprueba tipos: transpila y ejecuta, y en ejecución una línea sin meses funciona.

De ahí salen dos cosas para explicar a otra persona:

- **`npm test` y `npm run build` comprueban cosas distintas.** Un proyecto con los tests en verde puede no compilar. Los dos tienen que estar en la lista de cierre de fase, y están.
- **Una garantía de tipos protege también a quien la escribió**, y además el mismo día. Es el argumento más convincente que ha dado el proyecto a favor de los tipos estrictos, porque no es hipotético: ocurrió, con nombre de archivo y número de línea.

### 3. Un informe también puede estar en verde por accidente

Apareció esto en pantalla:

```
error TS2345: Property 'months' is missing …
--- tsc sin errores ---
```

El rótulo iba detrás de un `;` en lugar de un `&&`, así que se imprimía siempre. **La comprobación funcionó; el informe mintió.** Y es más peligroso que un test mal escrito, porque un test lo lee una máquina y un informe lo lee una persona que decide si seguir adelante.

El mismo día, la misma familia de problemas por el otro lado: un `grep -c` que devolvió el `0` esperado y, con él, un código de salida de error que cortó la cadena `&&` y se llevó el control positivo que venía detrás.

De aquí sale la norma nueva del apartado 5 de `CLAUDE.md`, y el usuario la colocó **junto a la del control positivo** a propósito: una evita una comprobación que no puede dar negativo, la otra un informe que no puede dar negativo. El criterio práctico es sencillo: **un rótulo describe qué se ha ejecutado, no cómo ha salido.**

### 4. Lo que se comprueba una vez no está comprobado

El asistente iba a verificar las garantías de tipos con un archivo temporal que se borraría después. El usuario lo cambió por tests permanentes con `@ts-expect-error`, y la diferencia es de naturaleza, no de orden:

| | Archivo temporal | Test con `@ts-expect-error` |
| --- | --- | --- |
| Cuándo comprueba | una vez, el día que se escribe | en cada `tsc -b`, para siempre |
| Si la garantía desaparece | nadie se entera | la directiva pasa a ser error y el build falla |
| Qué queda como evidencia | un párrafo en un documento | código ejecutable |

Y la propia comprobación cambió el resultado del proyecto: por escribirla como test permanente se descubrió que dos garantías eran incompatibles. Con el archivo temporal se habría comprobado la que se esperaba que funcionara, que es lo que suele pasar cuando uno escribe la comprobación y la conclusión en el mismo rato.

Hay un segundo aprendizaje, menos cómodo: el asistente había **escrito en el código el resultado de la comprobación antes de hacerla** («Comprobado en positivo con un archivo temporal»). El rechazo lo dejó a la vista.

### 5. Una comprobación puede acertar por el camino equivocado

Para demostrar que ningún importe esperado había cambiado en los tests de la Fase 3, el asistente propuso contar las líneas modificadas que contuvieran `expect`, `toBe` o `toEqual`. El usuario lo rechazó señalando el agujero exacto: **un importe dentro de un `toEqual` de varias líneas vive en su propia línea**, que no contiene ninguna de esas tres palabras.

El recuento habría dado cero, que era además el resultado correcto en ese momento. Habría parecido una verificación impecable hasta el día en que alguien cambiara un `oneTimeCents: 120_000` y el informe dijera que no se había tocado ningún importe.

Lo sustituyó algo más tonto y mejor: `git diff -U0`, que imprime las líneas cambiadas y nada más. Eran 45. **Cuando el volumen lo permite, mirar el diff completo es superior a cualquier filtro**, porque no hay que acertar con el filtro. Un filtro es una hipótesis sobre dónde puede estar el problema; mirar es no necesitarla.

### 6. El dato que no hace nada todavía necesita que se diga

Los meses entran en el presupuesto en esta fase y **no cambian ningún importe**: la cuota mensual es la de un mes y no se multiplica por la permanencia. Son el dato del descuento de la Fase 6.

Quien prueba la aplicación sube los meses de 6 a 24 y no ve moverse nada, y la conclusión natural es que está roto. Se abordó de tres formas, y las tres hacen falta:

- un **test** que fija que los importes no cambian al cambiar los meses, para que nadie lo «arregle» multiplicando;
- un **comentario** en la función del importe explicando que los meses están a su alcance y no se usan;
- una **advertencia al usuario** antes de que lo probara, en el mensaje de cierre del ciclo.

### 7. Un patrón que ya funciona vale más que una variante más limpia

El nombre accesible del selector salió mal escrito —«Mesesde SEO Básico»— por intentar una variante más elegante de algo que `ServiceCard` ya hacía bien desde la Fase 1. El cálculo del nombre accesible recorta los espacios de cada nodo de texto, así que un texto corto más un añadido oculto se pegan.

Lo interesante es **cómo se detectó**: un test que comprobaba el nombre accesible, no el texto en pantalla. En pantalla todo estaba perfecto; el defecto solo existía para quien usa un lector de pantalla. Los tests de esta fase consultan por rol y por nombre accesible, no por clases ni por texto suelto, y esta es la primera vez que esa decisión —tomada en la Fase 1— ha atrapado algo.

### 8. El test que falla por el test, no por el código

Dos veces en esta fase un test falló por estar mal escrito: el nombre accesible y los dos elementos con el texto «250,00 €/mes» (porque con una unidad el precio unitario y el importe de la línea son el mismo número).

Ninguno de los dos era un error del código, y los dos son útiles de registrar, porque el ciclo TDD no distingue: un test en rojo puede significar «el código no está» o «el test está mal». La única forma de saberlo es **leer el mensaje de error en lugar de ir directamente a cambiar el código**, y en las dos ocasiones el mensaje lo decía con bastante claridad.

### 9. Una petición de maquetación puede no cubrir su propio problema

El usuario pidió un ancho fijo para la columna del importe, para alinear los selectores. Con un `flex` y `justify-between`, eso alinea los importes y **no** alinea el selector de cantidad entre una línea con uno y otra con dos selectores. La solución que sí lo resuelve es otra —una rejilla de tres columnas de ancho declarado— y además obliga a mover el punto de corte de 640 a 1024 px, porque las tres columnas no caben antes.

Lo que enseña, y sirve para cualquier petición: **el usuario describió el síntoma correctamente y propuso un remedio que lo cubría a medias.** Aplicar la petición al pie de la letra habría dejado el problema a medio arreglar, y aplicar algo distinto sin decirlo habría sido peor. Lo que funcionó fue explicar la diferencia en dos frases y proponer la alternativa antes de escribirla.

### 10. Hay cosas que el asistente no puede verificar

La alineación se comprobó leyendo el CSS compilado: que las clases existieran, con sus valores, dentro de su `@media`, y con un control negativo para asegurarse de que la búsqueda discriminaba. **Eso no es ver una pantalla.** La verificación visual de esta fase —en pantalla ancha y en ancho de móvil— la hizo el usuario en el navegador, y el registro lo dice así en lugar de atribuirse la comprobación.

Es un buen recordatorio para el documento final: en un desarrollo asistido por IA hay una frontera clara entre lo que el agente puede comprobar y lo que necesita ojos. Los navegadores de Playwright de la Fase 8 moverán esa frontera, no la borrarán.

---

## 7. Momentos para el vídeo

### Momento 1 — El campo que se rompe en el «1»

**Qué se ve:** el selector de meses de SEO Básico, con el mínimo en 6 meses. Se borra el contenido y se teclea «12». En pantalla, dígito a dígito: `1`, `12`. Se sale del campo con el tabulador y se queda en **12**.

Al lado, la versión que el usuario impidió por escrito antes de que existiera: corrigiendo en cada pulsación, el «1» se convierte en un **6** en el momento de teclearlo, y el campo queda inutilizable para cualquier número de dos cifras.

Y después, los tres tests que fijan el comportamiento: el que escribe «12» y espera 12, el que escribe «2» y espera 6, y el que escribe «500» y espera **36 y no 6**.

**Por qué merece estar en el vídeo:** se entiende sin saber programar y en quince segundos. Es el mejor ejemplo del proyecto de una corrección **preventiva** del usuario: no corrige un error cometido, impide uno que el plan aprobado llevaba dentro. Y la frase que lo motivó —«si se corrige en cada pulsación, escribir 12 se rompe en el 1»— es exactamente el tipo de conocimiento que no sale de leer código, sino de haber usado formularios.

### Momento 2 — El informe que decía «sin errores» encima de un error

**Qué se ve:** la captura literal de la terminal:

```
src/features/budget/calculateLineAmountCents.test.ts(88,49): error TS2345:
  Property 'months' is missing in type '{ service: MonthlyService; quantity: number; }'
  but required in type 'MonthlyBudgetLine'.
--- tsc sin errores ---
```

Dos cosas en una imagen. **Arriba**, el compilador cazando un dato imposible —una línea mensual sin meses— en un test escrito por el propio asistente, dos ciclos después de que el asistente escribiera la garantía que lo impide; con los seis tests de ese ciclo **en verde**, porque Vitest no comprueba tipos. **Abajo**, un rótulo afirmando lo contrario de lo que acababa de pasar, porque iba detrás de un `;` en lugar de un `&&`.

Se cierra con la norma que entró en `CLAUDE.md` ese mismo día, colocada junto a la del control positivo de la Fase 2.

**Por qué merece estar en el vídeo:** es el cuarto episodio de la serie que llevan el correo de la Fase 1, las diez categorías en verde de la Fase 2 y los ocho tests sobre código con un error de la Fase 3. La serie cuenta la tesis del TFM mejor que cualquier resumen: **una comprobación en verde solo cubre lo que se le ocurrió a quien la escribió, y un informe en verde puede no haber leído nada.** Y aquí el que se equivocó y el que lo documentó son el mismo, que es justamente lo que hace útil el registro.

### Momento 3 (alternativa) — Dos garantías que no caben juntas

**Qué se ve:** los tres tests de tipos con `@ts-expect-error` y la tabla de lo que acepta el compilador en cada variante: con `months?: never` se cumplen la 1 y la 2, sin él la 1 y la 3, y las dos columnas tienen un ❌. Después, `tsc` diciendo `Unused '@ts-expect-error' directive`, que es la forma que tiene el compilador de decir «esto que esperabas que fallara, compila».

**Por qué merece estar en el vídeo:** muestra una decisión de diseño que se tomó **con una medición y no con una opinión**, y que cambió lo que el plan prometía. Si hay que elegir dos momentos, este es el que se queda fuera: necesita explicar qué es una unión discriminada, y los momentos 1 y 2 no necesitan explicar nada.

---

**Recomendación para el guion:** el **1** es el más rentable para explicar la supervisión humana —se ve, se entiende y dura quince segundos—, y el **2** para explicar la metodología y su límite, además de cerrar una serie de cuatro fases consecutivas sobre comprobaciones que parecían estar en verde.
