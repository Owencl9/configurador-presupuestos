# Registro de prompts — Fase 3: Lógica de negocio con TDD

**Fecha:** 24/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** confirmar las reglas de negocio del apartado 4.3, centralizarlas en un único archivo de constantes e implementar con TDD el formato de importes en euros, los subtotales separados por forma de pago y el cálculo del IGIC.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque de la fase, con las reglas confirmadas y una pregunta concreta

> Vamos a empezar la Fase 3 del Configurador de Presupuestos: lógica de negocio con TDD.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md, docs/prompt-maestro.md y docs/prompts/fase-02.md. Las fases 1 y 2 están cerradas y desplegadas.
>
> Reglas de negocio confirmadas (los precios del catálogo son ficticios, así que mantengo los valores de ejemplo del apartado 4.3):
>
> - Descuento por pack: 3 o más servicios distintos, 5 % sobre el subtotal.
> - Descuento por permanencia: servicios mensuales contratados 12 meses o más, 10 % sobre esos servicios.
> - Descuento por importe: pago único superior a 3.000 €, 5 % adicional sobre el pago único.
> - Tope: el descuento total nunca supera el 20 %.
> - IGIC: 7 %, configurable en el archivo de constantes.
> - Orden de cálculo: subtotal → descuentos → base imponible → IGIC → total, todo en céntimos.
>
> Recuerda que en esta fase solo van el formato en euros (formatEuros, sustituyendo la conversión provisional de buildPriceLabel), los subtotales separados por tipo de pago y el cálculo del IGIC. Los descuentos con Strategy son la Fase 6, pero deja las reglas registradas en las constantes.
>
> Propón cómo redondear el IGIC a céntimos y explícamelo antes de implementarlo.
>
> Presenta el plan de la Fase 3 y espera mi autorización.

Tres cosas que este prompt hace bien y que conviene retener para el documento final:

1. **Acota el alcance por adelantado.** «Los descuentos son la Fase 6, pero deja las reglas registradas» es una instrucción muy precisa: separa el *valor* de una regla de su *implementación*, y evita la tentación de adelantar la fase siguiente porque las constantes ya están delante.
2. **Pide la explicación antes de la implementación**, y de una decisión concreta, no de todo. El redondeo del IGIC es la única parte de esta fase donde hay varias respuestas defendibles.
3. **Confirma las reglas sin confirmar los precios**, que es justo la ambigüedad que hubo que preguntar (ver la pregunta 1 del plan): el catálogo de la Fase 2 tiene sus propios importes y los valores de ejemplo del apartado 4.3 son otros.

### Prompt 2 — Autorización, con respuestas a las cinco preguntas y una instrucción de ritmo

> Apruebo el plan de la Fase 3. Respuestas:
> 1. Sí: el catálogo de la Fase 2 se queda como está; lo que confirmo son las reglas.
> 2. (a) Tres IGIC, uno por forma de pago.
> 3. (a) formatEuros lanza un error si recibe un número que no es entero.
> 4. De acuerdo: BudgetLine es { service, quantity } y los meses entran en la Fase 4.
>    Formato: mantenemos 1.200,00 € con separador de millares en cuatro cifras.
>
> Sobre el plazo: no adelantamos la decisión de recortes, pero a partir de ahora prioriza avanzar. Haz las comprobaciones que afecten al resultado o a la seguridad, y evita investigaciones que no cambien ninguna decisión; si dudas, pregúntame antes de lanzarlas.
>
> Adelante, empezando por el ciclo 1.

El segundo párrafo es una **norma de trabajo nueva**, y es la continuación directa de la corrección C2-4 de la Fase 2. Ver **C3-1**.

---

## 2. Resumen de lo generado

### Archivos nuevos

| Archivo                                      | Qué hace                                                      | Tests  |
| -------------------------------------------- | ------------------------------------------------------------- | ------ |
| `shared/constants/business-rules.ts`         | Las ocho reglas del apartado 4.3 con sus valores, en un sitio | 10     |
| `shared/utils/formatEuros.ts`                | Céntimos → `1.200,00 €`, `-62,50 €`                            | 13     |
| `shared/types/budget.ts`                     | `BudgetLine`, `Subtotals`, `PaymentBlock`, `Budget`            | —      |
| `features/budget/calculateSubtotals.ts`      | Reparte las líneas en los tres subtotales                     | 9      |
| `features/budget/calculateIgic.ts`           | El IGIC redondeado a céntimos                                 | 9      |
| `features/budget/calculateBudget.ts`         | El orden de cálculo completo, tres bloques                    | 9      |
| `docs/adr/0007-redondeo-del-igic.md`         | La decisión del redondeo, razonada                            | —      |

**50 tests nuevos. Con los 37 anteriores, 87 en verde.**

### Archivos modificados

| Archivo                             | Cambio                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `service-catalog/buildPriceLabel.ts` | Borrada la conversión provisional de la Fase 2; ahora llama a `formatEuros`                 |
| `shared/data/services.test.ts`       | El test del umbral de pago único lee `AMOUNT_DISCOUNT_THRESHOLD_CENTS` en vez del literal   |
| `docs/adr/0003-dinero-en-centimos.md` | Nota de actualización: el formateo no usa `Intl`, y el redondeo se razona en el ADR 0007   |

### Los cuatro ciclos TDD

| Ciclo | Qué se probó          | Fallo visto antes de implementar                        | Verde |
| ----- | --------------------- | ------------------------------------------------------- | ----- |
| 0     | Reglas de negocio     | `Failed to resolve import "./business-rules"` — 0 tests | 10    |
| 1     | `formatEuros`         | `Failed to resolve import "./formatEuros"` — 0 tests    | 13    |
| 2     | `calculateSubtotals`  | `Failed to resolve import "./calculateSubtotals"`       | 9     |
| 3     | `calculateIgic`       | `Failed to resolve import "./calculateIgic"`            | 9     |
| 4     | `calculateBudget`     | `Failed to resolve import "./calculateBudget"`          | 9     |

El paso de refactorización en verde del ciclo 1 fue **borrar la conversión provisional de la Fase 2**: `buildPriceLabel` pasó a llamar a `formatEuros` y sus ocho tests siguieron pasando sin tocar ni una línea de ellos. Es la mejor evidencia posible de que el cambio era seguro: los mismos ocho tests contra una implementación distinta.

### El redondeo del IGIC

Está razonado entero en [ADR 0007](../adr/0007-redondeo-del-igic.md). En una línea:

```ts
Math.round((baseCents * ratePercent) / 100)
```

Tres decisiones: multiplicar por el porcentaje **entero** y dividir al final; redondeo **comercial** (al más cercano, empates hacia arriba); y **un único redondeo por bloque de pago**, sobre la base imponible completa y después de los descuentos.

### Los tres bloques de pago

La decisión de diseño más consecuente de la fase. El presupuesto no tiene un total: tiene tres.

```
Pago inicial    2.500,00 €  + IGIC 175,00 €  =   2.675,00 €
Cuota mensual     250,00 €  + IGIC  17,50 €  =     267,50 € /mes
Pago anual        120,00 €  + IGIC   8,40 €  =     128,40 € /año
```

Sumar los tres daría 2.870 €, un importe que el cliente no paga en ningún momento, porque mezcla un pago único con dos cuotas recurrentes. `Budget` son tres `PaymentBlock` independientes, cada uno con su subtotal, su descuento, su base, su IGIC y su total.

### Verificaciones de cierre

| Comprobación           | Resultado                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `npm run format:check` | en verde (tras reformatear 4 archivos nuevos)                   |
| `npm run lint`         | 0 errores, 0 avisos                                             |
| `npm test`             | **87 de 87**                                                    |
| `npm run build`        | correcto — 224,88 kB de JS (70,73 kB comprimido), 11,42 kB de CSS |

No se ha instalado ninguna dependencia, así que `npm audit` no cambia respecto a la Fase 1.

---

## 3. Problemas encontrados y cómo se resolvieron

### P10 — `Intl.NumberFormat` no pone el separador de millares en español

**Síntoma.** La Fase 2 dejó anotado que `Intl.NumberFormat` con `style: 'currency'` separa el importe del símbolo € con un espacio irrompible (U+00A0), y la Fase 3 iba a usarlo para `formatEuros` con ese cuidado en mente. Al comprobarlo apareció algo bastante peor:

```
450       → "450,00 €"      ✅
1200      → "1200,00 €"     ❌ esperábamos 1.200,00 €
2500      → "2500,00 €"     ❌
1999.99   → "1999,99 €"     ❌
12345.67  → "12.345,67 €"   ✅
```

**Causa.** No es un error de `Intl`: es la norma de la RAE, que escribe las cantidades de cuatro cifras sin separador de millares, y los datos de idiomas de Unicode la aplican correctamente. El apartado 4.3 de la especificación fija el formato con separador, y los ocho tests de `buildPriceLabel` de la Fase 2 ya exigían `1.200,00 €` y `1.999,99 €`.

**Resolución.** `formatEuros` se escribe a mano. Se puede forzar el separador con `useGrouping: 'always'`, pero entonces ya se están sobreescribiendo a mano las reglas del idioma que justificaban usar `Intl`, y seguiría quedando el espacio irrompible. Se añadió un tercer motivo: `Intl` depende de los datos de idiomas que traiga cada versión de Node, que han cambiado entre versiones en otros idiomas, y los tests se ejecutarán en GitHub Actions (Fase 9) en otra máquina.

**Lo que enseña.** La nota que dejó la Fase 2 era correcta pero incompleta, y haberla escrito sirvió igualmente: obligó a comprobar la herramienta antes de usarla, y por eso apareció el problema de verdad. Una nota para la fase siguiente no tiene que acertar el diagnóstico; basta con que señale dónde mirar.

### P11 — La conversión provisional de la Fase 2 no sabía tratar importes negativos

**Síntoma.** La función `centimosAEurosProvisional` que vivía en `buildPriceLabel.ts`, ejecutada con un importe negativo:

```
-6250 → "-62,-50 €"
-50   → "0,-50 €"
-1    → "0,-1 €"
```

**Causa.** En JavaScript el resto de una división con un número negativo también es negativo: `-6250 % 100` es `-50`, no `50`. La función calculaba los decimales sobre el valor negativo, así que el signo aparecía dos veces, y además `padStart(2, '0')` no rellenaba nada porque `"-50"` ya tiene dos caracteres.

**Por qué no había dado la cara.** Ningún precio del catálogo es negativo. El error estaba escrito, desplegado en producción y era inalcanzable.

**Cuándo habría dado la cara.** En la **Fase 6**: un descuento se muestra como `-62,50 €`.

**Resolución.** `formatEuros` trata el signo aparte y calcula euros y céntimos sobre el valor absoluto. El primer test del ciclo 1 es precisamente el del importe negativo, y hay otros dos: uno de menos de un euro (`-0,50 €`) y uno con separador de millares (`-12.345,67 €`).

**Lo que enseña.** Es el caso contrario al de los tests de datos de la Fase 2. Allí los tests vigilaban un archivo que alguien editaría a mano; aquí el test encontró un error que ya existía en código escrito, probado y publicado, porque los ocho tests de la Fase 2 solo pasaban importes positivos: eran los únicos que el catálogo podía producir. **El TDD no protege de los casos que no se le ocurren a quien escribe los tests**, y lo que los trajo a la superficie no fue el TDD, sino preguntarse quién más va a llamar a esta función y con qué.

### P12 — El CSS publicado cambia de nombre al añadir archivos de lógica

**Síntoma.** El `build` de cierre produjo un CSS distinto del de la Fase 2: 11,42 kB frente a 11,39 kB, con otro nombre de archivo, aunque esta fase no ha tocado ni un estilo ni un componente.

**Causa.** Es el problema **P7** de la Fase 2, ya diagnosticado y decidido: Tailwind extrae candidatos a clase del texto de los archivos `.ts` sin distinguir código de clases de CSS, así que una palabra nueva en el código puede compilar una utilidad. Son unos 30 bytes.

**Resolución: ninguna, y a propósito.** Está decidido en la corrección C2-4 de la Fase 2 que esto no se corrige, y la norma de ritmo del prompt 2 de esta fase dice explícitamente que no se lancen investigaciones que no cambien ninguna decisión. Se anota, se identifica con el problema ya conocido y se sigue.

---

## 4. Decisiones tomadas en esta fase

| Decisión                                                                   | Motivo                                                                                                                                                                      |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tres bloques de pago independientes, sin total general                      | Un pago único y dos cuotas recurrentes no se suman: el resultado sería un importe que nadie paga. [ADR 0007](../adr/0007-redondeo-del-igic.md)                               |
| Un único redondeo del IGIC por bloque, después de los descuentos            | La suma de redondeos no es el redondeo de la suma. Caso construido: siete líneas de 0,07 € dan 0 céntimos de IGIC línea a línea y 3 sobre la base                           |
| Redondeo comercial, empates hacia arriba                                    | Es el de la facturación española y el de una calculadora. El bancario existe para evitar sesgos al acumular millones de redondeos, y aquí hay tres por presupuesto           |
| El porcentaje se guarda como número (`7`), no como factor (`0.07`)          | Mantiene la aritmética en enteros y deja el valor intermedio en el número matemático exacto                                                                                 |
| `formatEuros` escrito a mano, no con `Intl.NumberFormat`                    | `Intl` no pone el separador de millares en cuatro cifras en español (**P10**), usa un espacio irrompible y depende de la versión de Node                                     |
| `formatEuros` lanza un error con un número no entero                        | Decisión del usuario. Un céntimo con decimales significa que el dinero se ha ido a coma flotante: redondear en silencio ocultaría el error justo donde se vuelve visible      |
| El tipo de IGIC se pasa por parámetro, con la constante como valor por defecto | Permite tests del 0 % y del 9,5 % sin tocar la configuración real, y deja un único punto del código que lee el valor configurado. Mismo criterio que `groupServicesByCategory` |
| `BudgetLine` es `{ service, quantity }`, sin meses                          | Los meses se usan en el descuento por permanencia y en el total comprometido, y ninguno existe en la Fase 3. El tipo crece cuando crece su uso                              |
| Un test de coherencia para el archivo de constantes                         | Mismo criterio que los tests de datos de la Fase 2: el archivo está hecho para editarse a mano, y una edición incoherente no da ningún error visible                        |
| El test del umbral de 3.000 € pasa a leer la constante                      | Un literal repetido en un test deja de comprobar la regla en el momento en que alguien cambia la regla                                                                      |
| Nota de actualización en el ADR 0003 en lugar de reescribirlo               | Un ADR registra lo que se decidió y cuándo. Reescribirlo borraría que la decisión sobre `Intl` se tomó con información incompleta, que es parte de lo que el TFM documenta    |

---

## 5. Correcciones del usuario y por qué

### C3-1 — Una norma de ritmo: comprobar solo lo que cambia una decisión

**Corrección.** Al autorizar la fase, el usuario añadió una instrucción de trabajo: «prioriza avanzar. Haz las comprobaciones que afecten al resultado o a la seguridad, y evita investigaciones que no cambien ninguna decisión; si dudas, pregúntame antes de lanzarlas».

**Por qué.** Es la continuación de la corrección **C2-4** de la Fase 2, donde el usuario detuvo un experimento para explicar 40 bytes de CSS. Allí fue una intervención puntual; aquí se convierte en norma general, con un criterio aplicable —*¿cambia esto alguna decisión?*— y con una vía de escape: preguntar antes de lanzar, en lugar de decidir por cuenta propia.

**Es una corrección preventiva, y eso la hace interesante.** No corrige un error ya cometido en esta fase: anticipa el que el asistente ya cometió en la anterior. Para el documento final es un ejemplo claro de cómo se gobierna un agente: la lección de una fase se convierte en una regla de la siguiente, y la regla llega **antes** del trabajo, no después del incidente.

**Cómo se aplicó, con un caso real a favor y otro en contra.**

- **A favor del rigor:** las comprobaciones numéricas del redondeo (dos millones de bases, los empates, el 9,5 %, el comportamiento de `Intl`) se hicieron **antes** de proponer el plan, porque de ellas dependían decisiones que el usuario tenía que aprobar. Una de ellas cambió la propuesta por completo: el hallazgo del separador de millares (**P10**) descartó `Intl`.
- **A favor de parar:** al cerrar la fase, el CSS publicado cambió de nombre y de tamaño (**P12**). Es el patrón que en la Fase 2 habría disparado una investigación. Esta vez se identificó con el problema P7 ya documentado, se anotó en dos líneas y no se investigó.

La diferencia entre los dos casos es exactamente la que pide la norma: el primero cambiaba una decisión pendiente de aprobación y el segundo no cambiaba ninguna.

---

## 6. Aprendizajes de la fase

1. **Una decisión de redondeo son tres decisiones.** «Redondear a céntimos» parece una sola cosa y son tres independientes: *cómo* se multiplica (entero o factor decimal), *cómo* se redondea (comercial o bancario) y *dónde y cuántas veces* se redondea (por línea, por bloque o una vez). La tercera es la que más afecta al resultado y la que menos se suele plantear: es la diferencia entre 0 y 3 céntimos de IGIC en el caso de las siete líneas de 0,07 €.

2. **La evidencia a veces dice que da igual, y hay que contarlo.** Se comprobaron `base * 0.07` y `base * 7 / 100` sobre dos millones de bases esperando encontrar un caso donde difirieran, y **no lo hay**. La decisión se mantuvo, pero el argumento cambió: ya no es «el factor decimal da resultados distintos», sino «el entero deja el valor intermedio en el número exacto, así que el redondeo lo decide la regla y no un error que apunta en la buena dirección». Un argumento que se puede razonar vale más que uno que solo se puede ejecutar — y presentar la comprobación que *no* confirmó la hipótesis es parte de documentar un desarrollo con IA honestamente.

3. **El TDD no cubre los casos que no se le ocurren a quien escribe los tests.** Los ocho tests de `buildPriceLabel` de la Fase 2 estaban bien escritos, pasaban, y la función tenía un error que producía `-62,-50 €`. Nadie le pasó un número negativo porque el catálogo no los tiene. Lo que encontró el error no fue el TDD, sino preguntarse **quién más va a llamar a esta función**: en la Fase 6, un descuento.

4. **Lo provisional se sustituye sin tocar sus tests, y eso es la prueba.** La conversión de céntimos a euros de la Fase 2 se borró y `buildPriceLabel` pasó a llamar a `formatEuros`. Los ocho tests siguieron en verde **sin modificar ni uno**. Unos tests que describen comportamiento y no implementación son los que permiten cambiar la implementación y saber que no se ha roto nada.

5. **Un valor repetido en un test deja de probar la regla.** El test de la Fase 2 comprobaba que el catálogo supera «300_000». Desde que existe el archivo de constantes, ese literal es una copia: subir el umbral a 5.000 € dejaría el test comprobando una cifra que ya no es la regla, y en verde. Centralizar las constantes no sirve de nada si los tests no las leen.

6. **La herramienta estándar no siempre cumple la especificación, y conviene mirar antes de confiar.** `Intl.NumberFormat` es la forma correcta de formatear números por idioma y aquí no servía, porque aplica una norma de la RAE que la especificación del proyecto no sigue. No es un fallo de la herramienta: es que «formato español» y «lo que hace `es-ES`» no son lo mismo. La única forma de saberlo fue ejecutarlo y mirar la salida, que son dos minutos.

7. **Un tipo de datos puede crecer más tarde.** `BudgetLine` no lleva los meses de contratación, aunque el apartado 4.2 los pide, porque en esta fase nada los usa: hacen falta para el descuento por permanencia (Fase 6) y para el total comprometido. Añadir un campo que nadie lee obliga a decidir hoy, con menos información, qué significa exactamente, y a mantener un valor que ningún test puede comprobar.

8. **Un ADR desmentido se anota, no se reescribe.** El ADR 0003 decía que el formateo usaría `Intl.NumberFormat`. Reescribirlo habría dejado una documentación impecable y falsa: borraría que la decisión se tomó con información incompleta en la Fase 1 y que se corrigió al implementarla en la Fase 3. La nota de actualización conserva las dos cosas, que es justo lo que un registro de decisiones tiene que conservar.

---

## 7. Momentos para el vídeo

### Momento 1 — El céntimo que desaparece

**Qué se ve:** un presupuesto con siete líneas de 0,07 €. Se calcula el IGIC de las dos formas posibles y se enseñan los dos resultados en pantalla:

```
IGIC línea a línea:  0 + 0 + 0 + 0 + 0 + 0 + 0  =  0 céntimos
IGIC sobre la base:  7 % de 0,49 €               =  3 céntimos
```

A continuación, el test que fija cuál de las dos hace la aplicación: «aplica el IGIC una sola vez sobre la base, no línea a línea».

**Por qué merece estar en el vídeo:** explica en treinta segundos, con dos números, por qué la especificación pedía documentar y probar el orden de cálculo. No es una preferencia de estilo: las dos formas son defendibles, dan resultados distintos, y una de las dos descuadra el presupuesto respecto a su propia base imponible. Es el mejor ejemplo del proyecto de una decisión técnica con consecuencia visible, y conecta directamente con el ADR 0003 de la Fase 1.

### Momento 2 — El error que llevaba una fase en producción

**Qué se ve:** la función de conversión a euros de la Fase 2, que lleva días desplegada y tiene ocho tests en verde. Se le pasa un importe negativo:

```
-6250 → "-62,-50 €"
```

Después, el primer test del ciclo 1 de la Fase 3, escrito antes de la función nueva, que exige `-62,50 €`. Y el motivo del error en una línea de consola: `-6250 % 100` es `-50`, no `50`.

**Por qué merece estar en el vídeo:** es el contrapunto honesto al discurso del TDD. Ocho tests, bien escritos, en verde, sobre código con un error — porque todos pasaban importes positivos, que eran los únicos que el catálogo podía producir. Y lo que lo encontró no fue un test, sino preguntarse quién más iba a usar esa función: un descuento de la Fase 6, en negativo. Encaja como tercer episodio de la serie que ya llevan el correo de la Fase 1 y las diez categorías en verde de la Fase 2: **una comprobación en verde solo cubre lo que se le ocurrió a quien la escribió.**

### Momento 3 (alternativa) — `Intl` no escribe 1.200,00 €

**Qué se ve:** una línea de consola con `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(1200)` y su resultado: `"1200,00 €"`, sin el punto de los millares. Al lado, el test del proyecto que exige `1.200,00 €`, y el apartado 4.3 de la especificación en pantalla.

**Por qué merece estar en el vídeo:** es un ejemplo breve y concreto de que «usar la herramienta estándar» no equivale a «cumplir el requisito», y de que dos minutos de comprobación cambiaron una decisión del plan antes de escribir una línea de código. Si hay que elegir solo dos momentos de esta fase, es el que se queda fuera: los momentos 1 y 2 explican más en menos tiempo.

---

**Recomendación para el guion:** el **1** es el más rentable para explicar la lógica de negocio y el valor de haberla documentado; el **2** es el más rentable para explicar la metodología y la supervisión, y cierra una serie de tres fases consecutivas sobre comprobaciones que parecían en verde y no lo estaban.
