# Registro de prompts — Fase 6: Descuentos con el patrón Strategy

**Fecha:** 25/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** implementar las tres reglas de descuento —pack, permanencia e importe— y el tope del 20 % con el patrón Strategy y TDD, mostrar el motivo de cada descuento en el resumen y explicar en pantalla para qué sirven los meses de contratación.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque, con las cinco decisiones ya tomadas y tres ejemplos calculados a mano

> Vamos a empezar la Fase 6 […]: descuentos con el patrón Strategy, con TDD.
>
> Decisiones tomadas (pendientes 11, 18 y 19 de PROGRESO.md):
>
> - Pendiente 11: el descuento por pack (3 servicios o más, 5 %) se aplica a cada bloque por separado: pago inicial, cuota mensual y pago anual. No existe un total único (ADR 0007).
> - El pack cuenta servicios distintos, no unidades: tres unidades de la misma web no son un pack.
> - Descuento por permanencia (10 %): solo sobre las líneas mensuales con 12 meses o más […]
> - Descuento por importe (5 %): sobre el bloque del pago inicial, cuando su subtotal supera estrictamente los 3.000 €.
> - Los descuentos de un mismo bloque se suman, no se encadenan, y siempre se calculan sobre el subtotal. Los umbrales se evalúan sobre el subtotal antes de cualquier descuento.
> - Tope del 20 % por bloque. Con las reglas actuales no se alcanza (el máximo es 15 %), pero tiene que estar programado y probado, por ejemplo con reglas de prueba.
> - Pendiente 18: bajo el selector de meses […] una pista «Desde 12 meses: 10 % de descuento», que cambia a «Descuento por permanencia aplicado» cuando se cumple. En el resumen, cada descuento con su motivo.
> - Pendiente 19: no se muestra el compromiso total (meses × cuota). Documéntalo en un ADR, porque sería otra cifra que se podría confundir con un total.
>
> Criterios: […] Propón dónde se redondea cada descuento y déjalo probado con casos de céntimos impares. […] Los 300 tests actuales siguen en verde, y los importes esperados de los tests anteriores no se tocan, **salvo los casos que ahora deban llevar descuento, y explícame cada uno**. Ningún dato nuevo se guarda en localStorage […]
>
> Usa como casos de test estos ejemplos calculados a mano (IGIC 7 %):
> · Tienda online + SEO Profesional a 12 meses + Hosting: pago inicial 2.541,25 €, cuota 409,28 €/mes, pago anual 121,98 €/año, primer día 3.072,51 €.
> · El mismo, con el SEO a 6 meses: cuota 457,43 €/mes.
> · Tienda online + Web corporativa (sin pack): pago inicial 3.761,05 €.

**Este prompt es la pieza más valiosa de la fase**, y conviene decir por qué con precisión: no pide que se diseñen las reglas, las **trae decididas**, y trae además **la forma de comprobar que están bien implementadas**. Los tres ejemplos son la especificación de la fase en forma de números, escritos antes de que existiera una línea de código.

Lo primero que hizo el asistente fue recalcularlos de cero con las reglas tal y como estaban descritas: los tres cuadraban al céntimo. Eso no es un trámite, es lo que permitió empezar a programar sabiendo que la lectura de las reglas era la misma a los dos lados. Y destapó un detalle que el usuario no había señalado: **dos de los tres ejemplos contienen un empate de medio céntimo en el IGIC** (2.677,5 y 2.992,5 céntimos), resueltos hacia arriba. Es decir, sus cálculos a mano confirmaban la decisión de redondeo comercial del [ADR 0007](../adr/0007-redondeo-del-igic.md) sin haberla consultado.

### Prompt 2 — Autorización, una corrección de precisión y dos paradas

> Autorizo el plan. Las cuatro preguntas, las recomendadas […]
>
> Una corrección: el test «calcula los tres bloques de un presupuesto mixto» usa **SEO Básico (250 €), no SEO Profesional**, así que no es mi ejemplo 1 a 6 meses. Las cifras que propones para él están bien, pero no lo describas así en comentarios ni documentación. Mis tres ejemplos van como tests propios en el ciclo 6, incluido el de SEO Profesional a 6 meses (457,43 €/mes).
>
> Haz la parada del ciclo 6 como propones, con el resumen de estado. Después, al terminar el ciclo 9 y antes de la documentación, para otra vez y dime cómo probarlo en local con mi ejemplo 1 […]

### Prompt 3 — Visto bueno a las desviaciones y una ampliación del encargo

> Visto bueno a la parada y a las dos desviaciones: los archivos se quedan en `shared/utils/` y las estrategias en `shared/strategies/`. Anota las dos en el registro de la fase.
>
> Sigue con los ciclos 7, 8 y 9. Para al terminar el 9 […] con el resumen de estado (tests, tsc, lint, format y build) y las instrucciones para probar mi ejemplo 1 en local: qué añadir, poner el SEO a 12 meses, y qué cifras deben salir en cada bloque, en cada descuento con su motivo y en el primer día. **Incluye también qué pasa al bajar el SEO a 11 meses.**

Esa última frase añadió un test que no estaba en el plan y que es el que mejor describe la regla: el borde de los doce meses visto desde la pantalla.

### Prompt 4 — Resultado de la prueba manual y una decisión de producto

> Lo he probado en local con mi ejemplo 1 y todo cuadra: 3 servicios, SEO a 12 meses (409,28 €/mes, primer día 3.072,51 €) y a 11 meses (457,43 €/mes, primer día 3.120,66 €), y la pista cambia correctamente.
>
> La fila «Descuento» con un solo motivo **se queda como está**: es igual en los tres bloques y así el motivo se ve siempre.
>
> Sigue con la documentación […] después la revisión de secretos con control positivo y la propuesta de commit. Para antes del commit, como siempre.

---

## 2. Resumen de lo generado

### Archivos nuevos

| Archivo | Qué hace | Tests |
| --- | --- | --- |
| `shared/utils/calculatePercentCents.ts` | El único sitio que calcula un porcentaje de dinero | 10 |
| `shared/strategies/discountStrategy.ts` | La forma de una estrategia: tipos y las tres claves de bloque | — |
| `shared/strategies/packDiscount.ts` | Pack: cuenta servicios distintos y descuenta en los tres bloques | 11 |
| `shared/strategies/commitmentDiscount.ts` | Permanencia: solo las líneas mensuales de 12 meses o más | 13 |
| `shared/strategies/amountDiscount.ts` | Importe: umbral estricto sobre el pago inicial | 7 |
| `shared/strategies/calculateDiscounts.ts` | El calculador: agrupa por bloque, suma y aplica el tope | 16 |
| `features/budget/buildCommitmentHint.ts` | El texto de la pista del selector de meses | 7 |
| `docs/adr/0010-como-se-aplican-los-descuentos.md` | Las cinco decisiones de cómo se aplican | — |
| `docs/adr/0011-sin-compromiso-total.md` | Por qué no se muestra meses × cuota | — |

### Archivos modificados

| Archivo | Cambio |
| --- | --- |
| `shared/types/budget.ts` | `AppliedDiscount` nuevo y `discounts` en `PaymentBlock` |
| `features/budget/calculateBudget.ts` | Llama al calculador de descuentos; tercer parámetro para las estrategias |
| `features/budget/calculateIgic.ts` | Pasa a llamar a `calculatePercentCents`. **Sus 9 tests, intactos** |
| `features/budget/BudgetSummary.tsx` | Una fila por motivo bajo la fila del descuento |
| `features/budget/BudgetLineItem.tsx` | Pasa la pista al selector de meses |
| `shared/components/QuantitySelector.tsx` | Prop `hint` opcional, asociada al campo |
| `shared/constants/business-rules.ts` | Los descuentos pasan de «registrados» a «implementados» |

### Archivos movidos (ver la desviación D1)

| Antes | Ahora |
| --- | --- |
| `features/budget/isMonthlyLine.ts` | `shared/utils/isMonthlyLine.ts` |
| `features/budget/calculateLineAmountCents.ts` | `shared/utils/calculateLineAmountCents.ts` |

Los dos con `git mv`, **sin cambiar el cuerpo de la función ni sus tests**.

**88 tests nuevos. Con los 300 anteriores, 388 en verde.**

### Los nueve ciclos

| Ciclo | Qué se probó | Fallo visto antes de implementar | Verde |
| --- | --- | --- | --- |
| 1 | `calculatePercentCents` + refactorización del IGIC | `Failed to resolve import` — 0 tests | 10 |
| 2 | Pack | `Failed to resolve import` — 0 tests | 11 |
| 3 | Permanencia | `Failed to resolve import` — 0 tests | 13 |
| 4 | Importe | `Failed to resolve import` — 0 tests | 7 |
| 5 | El calculador y el tope | `Failed to resolve import` — 0 tests | 16 |
| 6 | `calculateBudget` y los tres ejemplos | **7 fallos de aserción** | 16 |
| 7 | El motivo en el resumen | **2 fallos de aserción** (de 5 tests nuevos) | 14 |
| 8 | La pista del selector | **5 fallos de aserción** | 30 |
| 9 | `App` de punta a punta | **ninguno: pasaron a la primera** (ver P27) | 23 |

---

## 3. Problemas encontrados y cómo se resolvieron

### P24 — Un test que fallaba porque describía una situación imposible

**Síntoma.** En el ciclo 5, el test «no devuelve descuentos de importe cero» falló: esperaba que el bloque mensual no llevara ningún descuento y llevaba dos.

**Causa.** El test estaba mal, no el código. El contexto que construía tenía **una línea mensual de 450,00 €/mes y el subtotal mensual a cero**, una combinación que `calculateSubtotals` no puede producir: si hay una línea mensual, hay subtotal mensual. La estrategia de permanencia calcula su base a partir de las líneas, así que descontó sobre una base que el contexto decía que no existía.

**Resolución.** Contextos coherentes, y una nota en el archivo de test explicando por qué tienen que serlo: *un test con una entrada imposible no mide el comportamiento de la aplicación, mide el comportamiento del código ante algo que nunca va a recibir.*

**Lo interesante es cómo reaccionó el código.** El tope del 20 % recortó ese descuento a cero, porque el 20 % de un subtotal de cero es cero. Es decir, la restricción protege también de una entrada incoherente, y eso ya estaba fijado con el test de la estrategia de prueba al 500 % que comprueba que el descuento nunca supera el subtotal. El fallo no destapó un agujero: destapó que el agujero ya estaba tapado.

### P25 — Dos archivos en el lado equivocado de la frontera (desviación D1)

**Síntoma.** Al escribir la estrategia de permanencia hizo falta `isMonthlyLine` —para saber qué línea es mensual— y `calculateLineAmountCents` —para sumar la base—. Las dos vivían en `features/budget/`, y las estrategias viven en `shared/strategies/`.

**Por qué es un problema y no un detalle.** Una carpeta de `shared/` que importa de `features/` invierte la dependencia: `shared` dejaría de ser «lo que usan varias funcionalidades» para ser «lo que usa una funcionalidad y además otros». El apartado 6 de `CLAUDE.md` lo dice al revés.

**Resolución.** Mover las dos a `shared/utils/` con `git mv`, sin tocar su cuerpo ni sus tests, y actualizar los seis sitios que las importaban. Decisión del usuario, confirmada en la parada del ciclo 6.

Las alternativas eran peores. Importar de `features/` a `shared/` rompe la regla de estructura; duplicar las funciones significa duplicar **precisamente la única multiplicación del proyecto**, que existe para no estar duplicada. Y hay un dato que cierra la discusión: `isMonthlyLine` **ya la importaba el reducer desde `context/`** desde la Fase 5, así que llevaba una fase entera mal colocada y nadie lo había notado.

**Lo que no se vio al planificar:** el plan eligió `shared/strategies/` citando el apartado 6 de `CLAUDE.md`, que nombra `strategies` como carpeta de `shared/`. La elección era correcta, pero **nadie comprobó qué necesitaban las estrategias antes de decidir dónde iban**, y por eso la consecuencia apareció a mitad del ciclo 3 en lugar de en el plan.

### P26 — Un test afectado que no estaba en la lista anunciada

**Síntoma.** El plan anunciaba, con nombre y motivo, los tres tests de `calculateBudget.test.ts` que la fase iba a cambiar. Al implementar el ciclo 6 fallaron **cuatro**.

**Causa.** El que faltaba —«sigue el orden de cálculo del apartado 4.3 en un bloque»— tiene un solo servicio y ninguna regla que se cumpla, así que **sus importes no cambian**, y de ahí salió la predicción. Pero compara con `toEqual`, que compara el objeto completo, y el campo `discounts` que la fase añade a `PaymentBlock` lo rompe igual.

**Resolución.** Añadir `discounts: []` al objeto esperado, con un comentario que distingue las dos cosas: *los importes de este test no han cambiado; lo que ha cambiado es la forma del objeto.*

**Lo que enseña.** El análisis previo buscó **tests cuyos importes cambiaran** y encontró los dos que había. La pregunta correcta era más amplia: *¿qué tests dependen de la forma del objeto, y no solo de sus números?* Un `toEqual` depende de las dos cosas, y eso se ve leyendo el aserto, no calculando importes.

### P27 — El ciclo 9 no pudo tener fase roja, y hubo que demostrar que sus tests sirven

**Síntoma.** Los cinco tests de integración del ciclo 9 pasaron a la primera.

**Causa.** No es un fallo del método, es una consecuencia del orden: los ciclos 6, 7 y 8 ya habían implementado el cálculo, el resumen y la pista, así que al llegar el ciclo 9 el comportamiento que esos tests describen ya existía. Un ciclo TDD necesita que el comportamiento **no** exista todavía.

**Resolución: un control positivo.** Se subió `COMMITMENT_DISCOUNT_MIN_MONTHS` de 12 a 13 y se volvieron a ejecutar: **4 de los 5 se pusieron en rojo**. El quinto siguió verde, y también es correcto: es el que comprueba que el borrador no guarda descuentos, y no depende de ninguna regla. Después se devolvió la constante a 12 y se comprobó con `git diff --stat`, que no devuelve nada para ese archivo.

**Es la quinta aparición de la familia de problemas del proyecto**, y la primera en la que no había ningún síntoma: cinco tests en verde que podrían haber estado comprobando nada. La norma del repositorio —*una comprobación en verde no dice nada hasta que se demuestra que puede ponerse en rojo*— se aplicó aquí a los tests, como ya se hizo en la Fase 5 con el doble montaje de `StrictMode`.

### P28 — Un test que compilaba porque su valor no tenía tipo

**Síntoma.** En la parada del ciclo 6, `tsc -b` falló con dos errores en un test nuevo: `Parameter 'total' implicitly has an 'any' type`.

**Causa.** El test recorría los bloques con `Object.entries(presupuesto)`. Esa función no conserva el tipo de los valores de un objeto con claves conocidas: devuelve `any`. Mientras el cuerpo del bucle solo leyera propiedades, `any` lo permite todo y no hay error; al llamar a `.reduce` sobre un `any`, los parámetros de la función que recibe se quedan sin tipo y `noImplicitAny` sí protesta.

**Resolución.** Una función que devuelve los tres bloques con su nombre y su tipo, en lugar de `Object.entries`. Dos ventajas, y la segunda no se buscaba: el compilador vuelve a comprobar el cuerpo del bucle, y el nombre del bloque acaba en el mensaje de fallo, así que el test dice **qué** bloque incumple la invariante.

**El detalle incómodo:** el test de la Fase 3 que está tres líneas más arriba usa `Object.entries` igual, y lleva tres fases sin que el compilador compruebe nada de lo que hay dentro de su bucle. No se ha tocado —está en verde y comprueba lo que dice— pero queda anotado: **un test puede estar sin comprobar tipos sin que nada lo delate**, porque `any` no produce ningún error hasta que alguien escribe una función dentro.

---

## 4. Decisiones tomadas en esta fase

| Decisión | Motivo |
| --- | --- |
| El pack se aplica **a los tres bloques**, con la condición evaluada sobre todo el presupuesto | Decisión del usuario (pendiente nº 11). La regla dice «el subtotal» y hay tres: no existe un total único al que aplicarla ([ADR 0010](../adr/0010-como-se-aplican-los-descuentos.md)) |
| El pack cuenta **servicios distintos**, por identificador | Decisión del usuario. Premia la variedad; del importe ya se encarga el otro descuento |
| Los descuentos de un bloque **se suman**, no se encadenan | Decisión del usuario. Encadenar da 2,25 € menos en la cuota del ejemplo y, peor, hace que el resultado dependa del orden de las estrategias |
| Los umbrales se evalúan **sobre el subtotal sin descontar** | Decisión del usuario. Si no, un pago inicial de 3.100 € dejaría de cumplir su propia condición después del pack |
| Cada descuento **se redondea por separado** | El resumen muestra cada motivo con su importe, así que cada uno tiene que ser un entero de céntimos y la suma de lo que se ve tiene que ser lo que se resta |
| El tope **se trunca** con `Math.floor` | Un tope que se redondea hacia arriba se puede superar. Es la única operación de dinero del proyecto que no usa el redondeo comercial |
| El tope se aplica **por bloque y al final** | Decisión del usuario. No es una estrategia: si lo fuera, su efecto dependería de cuándo se ejecutara (ADR 0004) |
| El recorte del tope se muestra como **una fila de ajuste negativa** | Decisión del usuario sobre dos opciones. Ninguna etiqueta miente y la columna suma a la vista; repartirlo haría que «Pack (5 %)» mostrara un importe que no es el 5 % |
| `discountCents` **es** `sumDiscountCents(discounts)` | No son dos cálculos que haya que mantener de acuerdo. El desglose de pantalla no puede dejar de cuadrar |
| Los motivos viven **dentro de cada `PaymentBlock`** | Decisión del usuario sobre una lista aparte en `Budget`: así el importe y su explicación no se pueden desincronizar |
| La fila «Descuento» **se conserva** con un solo motivo | Decisión del usuario después de verlo en el navegador: el desglose tiene la misma forma en los tres bloques y el motivo se ve siempre |
| Cada estrategia **construye su propio motivo** con las constantes | Cambiar un porcentaje cambia el cálculo y el texto de la pantalla a la vez. Un rótulo a mano seguiría diciendo «5 %» con la regla al 8 % |
| La pista y el descuento comparten **una sola condición** | `qualifiesForCommitmentDiscount` la usan la estrategia y la pista. Con dos comparaciones, la pantalla podría anunciar un descuento que el presupuesto no lleva |
| La pista va **en el texto asociado al campo**, no en el `aria-live` | Decisión del usuario. Se anuncia al entrar en el campo, y la frase de estado del panel se queda corta como la dejó la Fase 4 |
| **No se muestra el compromiso total** (meses × cuota) | Decisión del usuario (pendiente nº 19). Una cifra de dinero en pantalla tiene que responder a una pregunta con respuesta exacta ([ADR 0011](../adr/0011-sin-compromiso-total.md)) |
| `calculateBudget` acepta **estrategias por parámetro** | Mismo motivo que el tipo de IGIC desde la Fase 3: permite probar el tope —que las reglas reales no alcanzan— sin tocar ninguna regla real |
| Los tres ejemplos del usuario se prueban contra el **catálogo real** | El resto del archivo usa servicios inventados a propósito; estos tres son las cifras de la documentación, así que si cambia un precio tienen que fallar |

### Las dos desviaciones del plan autorizado

| # | Desviación | Estado |
| --- | --- | --- |
| **D1** | Dos archivos movidos de `features/budget/` a `shared/utils/` (`isMonthlyLine` y `calculateLineAmountCents`), porque las estrategias de `shared/` los necesitan. Ver **P25** | Aprobada por el usuario en la parada del ciclo 6. Los archivos se quedan en `shared/utils/` y las estrategias en `shared/strategies/` |
| **D2** | Los tests afectados de `calculateBudget.test.ts` eran cuatro, no los tres anunciados. Ver **P26** | Comunicada en la parada del ciclo 6, con la distinción entre los que cambian de importe y los que solo cambian de forma |

---

## 5. Correcciones del usuario y por qué

### C6-1 — No editar archivos con PowerShell

**Corrección.** Para sustituir seis veces el mismo texto en un archivo de test, el asistente propuso un comando de PowerShell con `Get-Content … -replace … | Set-Content`. El usuario lo rechazó: *«No edites archivos con PowerShell […]. Usa la herramienta de edición normal, como en el resto de la fase. `Set-Content` con `-Encoding utf8` puede añadir una marca BOM al principio del archivo, `-NoNewline` quita el salto de línea final, y un reemplazo con expresión regular puede tocar más sitios de los previstos. Haz el cambio con Edit y enséñamelo.»*

**Por qué tenía razón, en los tres motivos que dio.** Los tres son ciertos y los tres habrían sido difíciles de detectar:

1. **El BOM.** `Set-Content -Encoding utf8` en Windows PowerShell 5.1 escribe una marca de orden de bytes al principio del archivo. No se ve al leerlo, pero es un cambio en el contenido de un repositorio que tiene decidido por escrito cómo se escriben sus archivos (apartado 4 de `CLAUDE.md`).
2. **El salto de línea final.** `-NoNewline` lo elimina, y Prettier lo exige: `npm run format:check` habría fallado por un motivo que no tiene nada que ver con el cambio que se quería hacer.
3. **El alcance del reemplazo.** Una expresión regular sobre todo el archivo no sabe cuántas veces va a coincidir. El asistente creía que eran seis.

**Y la alternativa que pidió era mejor, no solo más segura.** Se comprobó primero cuántas veces aparecía el texto exacto —seis, y las seis donde se esperaba—, y después se hizo el cambio con la herramienta de edición, que informa de cuántas coincidencias ha sustituido. Es la norma del apartado 1 de `CLAUDE.md`: **primero comprobar y mostrar el resultado, después actuar**, en dos pasos y no en un comando que hace las dos cosas.

**Lo que hace esta corrección especialmente útil para el TFM:** el comando rechazado habría funcionado. Los tests habrían pasado y el cambio habría sido el correcto. Lo que el usuario paró no fue un error, fue **una forma de trabajar que no se puede revisar**: un reemplazo con expresión regular sobre un archivo entero no se puede leer antes de ejecutarlo.

### C6-2 — Ese test no es tu ejemplo 1

**Corrección.** El plan describía el test «calcula los tres bloques de un presupuesto mixto» como *«el mismo presupuesto de tu ejemplo 1 con el SEO a 6 meses»*. El usuario corrigió: ese test usa **SEO Básico, de 250 €/mes**, y su ejemplo 1 usa **SEO Profesional, de 450 €/mes**. *«Las cifras que propones para él están bien, pero no lo describas así en comentarios ni documentación.»*

**Por qué tenía razón.** Las dos cifras del pago inicial coinciden —2.541,25 €—, porque la tienda online es la misma y el pack es el mismo, y de ahí salió la confusión. Pero la cuota mensual no se parece: 254,13 €/mes en el test y 409,28 €/mes en el ejemplo. Son dos presupuestos distintos.

**Y la corrección no es de estilo, es de fiabilidad del registro.** Un comentario que dice «este test es el ejemplo 1 del usuario» convierte el test en la referencia de una cifra que no calcula. Quien lo lea dentro de seis meses buscando de dónde salen los 409,28 € llegaría a un test que dice 254,13 € y tendría que decidir cuál de los dos está mal. El usuario protegió **la trazabilidad entre sus cálculos a mano y los tests**, que es justo lo que hace que esos ejemplos sirvan de especificación.

Los tres ejemplos acabaron, como pidió, en su propio bloque de tests contra el catálogo real, y el test mixto conserva sus cifras con un comentario que dice lo que es: tres servicios con el SEO a seis meses.

### C6-3 — Dos paradas, y la segunda con las cifras por adelantado

**Corrección.** Igual que en la Fase 5, el usuario partió el trabajo: una parada al cerrar la lógica (ciclo 6) y otra al terminar los componentes (ciclo 9), *«antes de la documentación y el commit»*, con el resumen de estado completo. Y pidió algo más en la segunda: las instrucciones para probarlo en local **con las cifras que deben salir**, bloque a bloque, descuento a descuento y en el primer día.

**Por qué importa que las cifras vayan por delante.** Una instrucción de prueba que dice «comprueba que los importes son correctos» deja al usuario comparando contra lo que recuerda. Con la tabla escrita antes de abrir el navegador, la prueba manual pasa a ser una comparación exacta: cada fila del resumen tiene un valor esperado, y basta un céntimo de diferencia para que se note. Es el mismo criterio de la corrección **C4-9** —pedir la evidencia por adelantado— aplicado a una prueba que hace la persona.

La parada del ciclo 6 sirvió además para lo que sirven estas paradas: ahí se comunicaron las dos desviaciones (**D1** y **D2**) y el usuario pudo aprobarlas o rechazarlas **antes** de que hubiera documentación escrita describiéndolas.

### C6-4 — Pedir el borde de la regla

**Corrección.** No corrige nada: amplía. *«Incluye también qué pasa al bajar el SEO a 11 meses.»*

**Por qué es la petición más fina de la fase.** El plan probaba la regla por dentro —12 meses sí, 6 meses no— y el usuario pidió el caso de **un mes menos del mínimo**, que es donde una regla mal escrita se rompe sin que se note. Un `>` en lugar de un `>=` pasa todos los tests de 6 y de 24 meses, y falla solo en el 12.

De esa frase salieron un test de integración completo y la tabla comparativa de las instrucciones de prueba, y el caso resultó tener una propiedad que merecía estar escrita: **por debajo de doce meses el número exacto de meses no cambia ningún importe**, porque el único descuento que queda es el pack. Con 11 meses la cuota es la misma que con 6. Eso explica mejor la regla que cualquier descripción de la regla.

### C6-5 — La fila repetida se queda

**Corrección.** El asistente señaló, al cerrar el ciclo 9, que con un solo descuento la fila «Descuento» y la de su motivo muestran la misma cifra, y ofreció cambiarlo. El usuario decidió que no: *«es igual en los tres bloques y así el motivo se ve siempre»*.

**Por qué tenía razón.** El asistente estaba mirando un bloque; el usuario estaba mirando la pantalla completa. Con la fila del total siempre presente, los tres bloques tienen el mismo desglose en el mismo orden, y el ojo puede comparar entre bloques sin tener que leer las etiquetas de cada uno. Quitar la fila cuando sobra haría que el pago inicial y la cuota mensual tuvieran formas distintas, y eso cuesta más que una línea repetida.

**Y es la segunda vez en la fase que decide sobre la redundancia a favor de la claridad.** La primera fue elegir la fila de ajuste del tope en lugar del reparto proporcional: también ahí la opción elegida muestra más números, y a cambio ninguno de ellos miente.

---

## 6. Aprendizajes de la fase

### 1. Un prompt con las decisiones tomadas y los números calculados vale más que cualquier plan

La Fase 6 llegó con cinco decisiones de negocio resueltas y tres presupuestos calculados a mano. El efecto fue inmediato: la primera tarea del asistente no fue diseñar nada, fue **recalcular los tres ejemplos para comprobar que entendía las reglas igual**. Cuadraron al céntimo, y a partir de ahí todo el trabajo tuvo un criterio objetivo de correcto o incorrecto.

Es la diferencia entre «implementa los descuentos» y «implementa los descuentos y con estos datos tiene que salir esto». La segunda forma convierte la especificación en algo **comprobable por una máquina**, y los tres ejemplos acabaron literalmente copiados como tests.

### 2. Decidir dónde vive el código obliga a saber qué necesita ese código

El plan eligió `shared/strategies/` con un buen argumento —el apartado 6 de `CLAUDE.md` nombra esa carpeta— y sin hacerse la pregunta siguiente: *¿de qué dependen las estrategias?* La respuesta eran dos funciones que vivían en `features/`, y la consecuencia apareció a mitad del ciclo 3.

La lección no es que la decisión fuera mala —se quedó, y además corrigió una pieza que llevaba una fase mal colocada—, sino que **una decisión de estructura no se puede tomar mirando solo lo que se va a escribir**. Hay que mirar también lo que se va a importar.

### 3. Un `toEqual` depende de la forma, no solo de los números

El análisis previo de los tests afectados buscó los que cambiaban de importe y acertó con los dos que había. Se le escapó uno que **no cambia de importe** y falla igual, porque compara el objeto completo con `toEqual` y la fase le añadió un campo.

Son dos preguntas distintas y conviene hacerse las dos antes de tocar un tipo compartido:

- ¿Qué tests esperan un **importe** que va a cambiar?
- ¿Qué tests esperan una **forma** que va a cambiar?

La segunda se contesta leyendo los asertos: `toEqual` y `toMatchObject` no son lo mismo. En los tests nuevos de esta fase se usó `toMatchObject` precisamente por eso, para que el día que `PaymentBlock` crezca otra vez no haya que tocarlos.

### 4. Hay ciclos que no pueden ser rojo-verde, y hay que decirlo

El ciclo 9 no tuvo fase roja. No por descuido: los tests de integración describen un comportamiento que los ciclos anteriores ya habían construido, así que no podían fallar. Lo que se puede hacer —y se hizo— es **demostrar que pueden fallar**: cambiar la regla de negocio y comprobar que 4 de los 5 se ponen en rojo.

Eso convierte una afirmación floja («estos tests comprueban los descuentos en pantalla») en una comprobada, y además deja claro qué comprueba cada uno: el quinto siguió verde porque mira el borrador, que no depende de ninguna regla de descuento.

### 5. `any` no avisa de que no está comprobando nada

`Object.entries` sobre un objeto de claves conocidas devuelve valores `any`. Un bucle que solo lee propiedades compila sin una queja, y **sin ninguna comprobación de tipos**. El error aparece únicamente cuando alguien escribe una función dentro del bucle, que es lo que pasó en esta fase con un `reduce`.

Hay un test de la Fase 3 con el mismo patrón, en verde desde entonces. Para alguien que viene de PHP y JavaScript, es el ejemplo más claro de lo que TypeScript aporta y de dónde deja de aportarlo: **el compilador no comprueba lo que no tiene tipo, y no lo dice**.

### 6. Un comando que funciona puede seguir siendo un mal comando

El reemplazo con PowerShell que el usuario paró habría dado el resultado correcto. Lo que no habría dado es la posibilidad de revisarlo: una expresión regular sobre un archivo completo no dice cuántas veces va a coincidir ni dónde, y encima arrastra dos efectos colaterales de la herramienta (el BOM y el salto de línea final) que no tienen nada que ver con el cambio pretendido.

La forma correcta fue la de dos pasos que ya está escrita en el apartado 1 de `CLAUDE.md`: **contar las coincidencias y mostrarlas primero, cambiarlas después**. El asistente las contó porque se lo pidieron, y resultó que su suposición era correcta; eso no cambia nada, porque el valor de comprobar no depende de que la comprobación encuentre un problema.

### 7. Una regla se entiende mejor por su borde que por su definición

«Descuento del 10 % con 12 meses o más» es la definición. Lo que explica la regla es lo que el usuario pidió probar: **con 11 meses la cuota es idéntica a la de 6 meses**, porque por debajo del umbral el número de meses no interviene en ningún importe. En cuanto se cruzan los doce, la cuota baja 48,15 € de golpe.

Dicho así, cualquiera entiende para qué sirve el campo de los meses, que es exactamente lo que el usuario echaba en falta al terminar la Fase 5.

---

## 7. Momentos para el vídeo

### Momento 1 — Los tres ejemplos del prompt, convertidos en tests

**Qué se ve:** a la izquierda, el prompt de arranque con los tres presupuestos calculados a mano por el usuario —«pago inicial 2.541,25 €, cuota 409,28 €/mes, pago anual 121,98 €/año, primer día 3.072,51 €»—. A la derecha, el bloque `describe('los tres ejemplos calculados a mano')` de `calculateBudget.test.ts` con esas mismas cifras.

Y después la aplicación: se añaden Tienda online, SEO Profesional y Hosting y dominio, se escribe 12 en el selector de meses, y el resumen muestra los tres bloques con esas cuatro cifras exactas.

**Por qué merece estar en el vídeo:** es la metodología del proyecto en un solo plano. Una regla de negocio se decide fuera del código, se calcula a mano, se escribe como test y acaba en pantalla, y las cuatro cifras son las mismas en los cuatro sitios. No hace falta saber programar para seguirlo.

### Momento 2 — Un mes menos

**Qué se ve:** con el presupuesto anterior en pantalla, se cambia el selector de meses de **12 a 11** y se pulsa Enter. Tres cosas cambian a la vez:

- la pista bajo el selector pasa de «Descuento por permanencia aplicado» a «Desde 12 meses: 10 % de descuento»;
- la fila «Permanencia de 12 meses o más (10 %) −45,00 €» **desaparece** del resumen;
- la cuota mensual sube de **409,28 €** a **457,43 €**, y el primer día, de 3.072,51 € a 3.120,66 €.

El pago inicial y el pago anual **no se mueven**.

**Por qué merece estar en el vídeo:** explica cuatro decisiones de diseño en cinco segundos y sin narrarlas. Que los descuentos se aplican por bloque (los otros dos no cambian), que la permanencia solo afecta a la cuota mensual, que el límite de los doce meses es exacto, y que la pantalla explica la regla antes de que haya que descubrirla probando. Es además la respuesta al problema que el propio usuario detectó al cerrar la Fase 5: «nada en pantalla explica para qué sirven los meses».

### Momento 3 (alternativa) — El tope que no se puede alcanzar, probado igual

**Qué se ve:** el archivo `calculateDiscounts.test.ts` y su función `estrategiaDePrueba`, con el test que combina dos descuentos del 15 % y comprueba que el resultado es el 20 % y no el 30 %. Al lado, el test que comprueba que **con las reglas reales el tope no se alcanza nunca**, porque lo máximo que se junta en un bloque es el 15 %.

**Por qué merece estar en el vídeo:** es el patrón Strategy justificándose solo. Una regla que no se puede provocar con los datos de producción se prueba inyectando estrategias que no existen en producción, y además queda un test que avisará el día que el tope empiece a morder de verdad. Es un argumento técnico, así que es el candidato a quedarse fuera si hay que elegir dos.

---

**Recomendación para el guion:** el **2** es el más rentable de la fase —cinco segundos, cuatro decisiones y ninguna explicación necesaria— y el **1** es el que mejor enseña el método completo, del prompt del usuario al número en pantalla. El **3** se queda fuera si hay que elegir, igual que su equivalente en la Fase 5.
