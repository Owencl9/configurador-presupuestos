# ADR 0010 — Cómo se aplican los descuentos: por bloque, sumados y con tope truncado

**Fecha:** 25/11/2026
**Estado:** aceptada
**Fase:** 6

## Contexto

El [ADR 0004](0004-strategy-para-descuentos.md) decidió en la Fase 1 **con qué
patrón** se implementan los descuentos: una estrategia por regla y un calculador
que las combina. Lo que no podía decidir entonces, porque el cálculo no existía
todavía, es **sobre qué** se aplican.

El apartado 4.3 de la especificación dice:

> - **Descuento por pack:** si el presupuesto incluye 3 o más servicios
>   distintos, 5 % sobre el subtotal.
> - **Descuento por permanencia:** servicios mensuales contratados 12 meses o
>   más, 10 % sobre esos servicios.
> - **Descuento por importe:** si el pago único supera 3.000 €, 5 % adicional
>   sobre el pago único.
> - **Tope de descuento:** el descuento total nunca supera el 20 %.

Esa redacción da por supuesto que hay **un** subtotal y **un** descuento total.
Y en este proyecto no los hay: la Fase 3 decidió que el presupuesto son **tres
bloques de pago independientes** sin ningún total general, porque sumar un pago
único con dos cuotas recurrentes da un importe que el cliente no paga en ningún
momento ([ADR 0007](0007-redondeo-del-igic.md)).

De ahí salen cinco preguntas que la especificación no contesta, y que eran el
pendiente nº 11 de `PROGRESO.md`:

1. ¿A qué subtotal se aplica el pack, si hay tres?
2. ¿Qué cuenta como «3 servicios distintos»: líneas, unidades o servicios?
3. ¿Los descuentos de un mismo bloque se suman o se encadenan?
4. ¿Las condiciones se evalúan antes o después de descontar?
5. ¿El tope del 20 % es del presupuesto o de cada bloque?

## Decisión

Las cinco las decidió el usuario al abrir la Fase 6, y se implementan así.

### 1. Cada regla se aplica al bloque que le corresponde, y el pack a los tres

| Regla | Condición, evaluada sobre todo el presupuesto | Bloques a los que descuenta |
| --- | --- | --- |
| Pack (5 %) | 3 o más servicios distintos | **los tres**, cada uno sobre su subtotal |
| Permanencia (10 %) | líneas mensuales de 12 meses o más | cuota mensual |
| Importe (5 %) | subtotal del pago inicial > 3.000 € | pago inicial |

El pack es el caso interesante: su **condición** mira el presupuesto completo
—tres servicios distintos, de cualquier forma de pago— y su **porcentaje** se
aplica a cada bloque por separado. Así un presupuesto de tienda + SEO + hosting
lleva el 5 % en los tres bloques aunque cada bloque tenga una sola línea, que es
lo que un cliente entiende por «me descuentan por contratar el pack».

No hay un «descuento total del presupuesto», por el mismo motivo que no hay un
total: sería una cifra de tres monedas distintas sumadas.

### 2. El pack cuenta servicios distintos, no unidades ni líneas

Se cuenta por identificador de servicio. **Tres unidades de la misma web no son
un pack**: la regla premia la variedad de la contratación, y de premiar el
importe ya se encarga el descuento por importe.

### 3. Los descuentos de un bloque se suman; no se encadenan

Los dos porcentajes se calculan **sobre el subtotal**, y los importes se suman.
La diferencia es medible, y en la cuota mensual del ejemplo del usuario son
2,25 €:

```
Subtotal mensual: 450,00 €

Sumados (así):      5 % → 22,50 €  +  10 % → 45,00 €   = 67,50 €
Encadenados:        5 % → 427,50 €, y el 10 % de eso   = 65,25 €
```

Sumar tiene además una propiedad que encadenar no tiene: **el resultado no
depende del orden** en que se ejecuten las estrategias. Encadenando, el pack
antes de la permanencia y la permanencia antes del pack dan cifras distintas, y
el orden de una lista de estrategias no es una decisión de negocio.

### 4. Los umbrales se evalúan sobre el subtotal sin descontar

Todas las condiciones se miran **antes** de aplicar ninguna rebaja. Si una regla
pudiera mirar el resultado de otra, el descuento volvería a depender del orden:
un pago inicial de 3.100 € al que el pack le quita 155 € se queda en 2.945 € y
**dejaría de cumplir su propia condición**, de modo que el descuento por importe
se aplicaría o no según qué estrategia corriera primero.

### 5. El tope es del 20 % de cada bloque, y se trunca

El tope se aplica **por bloque** y **al final**, después de sumar las
estrategias. No es una estrategia más, es una restricción sobre el resultado: si
fuera una estrategia, su efecto dependería de cuándo se ejecutara.

Y se calcula con **truncamiento**, no con el redondeo comercial del resto del
proyecto:

```
20 % de 9,99 € = 1,998 €   →   redondeando: 2,00 €   (más del 20 %)
                           →   truncando:   1,99 €   ✅
```

**Un tope que se puede superar no es un tope.** Es la única operación de dinero
del proyecto que no usa `Math.round`, y está aislada en una función con su
nombre y su test.

### Dónde se redondea cada descuento

Cada estrategia produce **un** importe por bloque, redondeado al céntimo con
`calculatePercentCents` —la misma función y el mismo redondeo comercial que el
IGIC ([ADR 0007](0007-redondeo-del-igic.md))—, y el descuento del bloque es la
suma de esos importes ya redondeados.

La alternativa era sumar los porcentajes y redondear una sola vez al final.
Produce resultados distintos: con un pago inicial de 3.000,10 € y pack más
importe, redondear por separado da 300,02 € (15.000,5 → 15.001, dos veces) y
redondear la suma da 300,01 €. Un céntimo.

Se eligió redondear por estrategia **por una razón de pantalla**: el resumen
muestra cada descuento con su motivo, así que cada importe mostrado tiene que
ser un número entero de céntimos y la suma de lo que se ve tiene que ser
exactamente lo que se resta. Redondeando solo la suma, el desglose no cuadraría.

### El descuento de un bloque es, por construcción, la suma de sus motivos

`PaymentBlock` lleva `discountCents` y `discounts`, y el primero **no se calcula
aparte**: es `sumDiscountCents(discounts)`. No son dos cálculos que haya que
mantener de acuerdo, es uno.

Cuando el tope recorta, los descuentos **conservan su importe** y se añade una
entrada de ajuste con importe **negativo**:

```
Subtotal                           1.000,00 €
Descuento                           -200,00 €
  Descuento de prueba del 15 %      -150,00 €
  Descuento de prueba del 15 %      -150,00 €
  Tope del 20 % del subtotal         100,00 €
Base imponible                       800,00 €
```

Así ninguna etiqueta miente —un «5 %» sigue valiendo el 5 % del subtotal— y la
columna suma a la vista. La alternativa era repartir el recorte entre los
descuentos proporcionalmente, y entonces la fila «Pack (5 %)» mostraría un
importe que no es el 5 % de nada.

## Consecuencias

### Lo que mejora

- **El resumen explica cada descuento**, que es el apartado 4.4 de la
  especificación, y lo explica con el texto que construye la propia estrategia a
  partir de las constantes: cambiar `PACK_DISCOUNT_PERCENT` cambia el cálculo y
  el rótulo de la pantalla a la vez.
- **Ninguna regla depende de otra ni del orden**, así que cada una se prueba
  aislada y añadir una cuarta es añadir un archivo y registrarlo.
- La base imponible **nunca puede salir negativa**, porque el tope la mantiene
  por encima del 80 % del subtotal. De eso dependía el aviso que
  `calculateIgic` llevaba escrito desde la Fase 3 sobre el redondeo de los
  negativos.

### Lo que cuesta

- Un presupuesto con tres servicios lleva **tres filas de descuento por pack**,
  una por bloque, en lugar de una. Es fiel a lo que ocurre —son tres pagos
  distintos y cada uno se rebaja por su cuenta— pero es más texto en pantalla.
- Con un solo descuento en un bloque, la fila «Descuento» y la de su motivo
  muestran la misma cifra. Decisión del usuario tras verlo en el navegador: se
  conserva, porque así el motivo se ve siempre y el desglose tiene la misma
  forma en los tres bloques.

### Lo que hay que vigilar

- **Con las reglas actuales el tope no se alcanza nunca**: lo máximo que se
  junta en un bloque es el 15 % de la cuota mensual. Está programado y probado
  con estrategias de prueba, y hay un test que comprueba que sigue siendo
  inalcanzable en producción. **El día que alguien suba un porcentaje, ese test
  falla**, y eso es el aviso de que el ajuste del tope empieza a aparecer en
  presupuestos reales y hay que mirar cómo queda en pantalla.
- Los descuentos **no se guardan en ninguna parte**: se calculan siempre. El
  borrador de `localStorage` sigue guardando identificador, cantidad y meses, y
  nada más ([ADR 0009](0009-borradores-en-localstorage.md)). Un descuento
  guardado sería un importe editable desde el navegador, que es exactamente lo
  que la Fase 5 decidió evitar.
- Si alguna vez se añade una regla que descuente sobre **otra base** que no sea
  el subtotal de un bloque ni un subconjunto de sus líneas, esta decisión hay
  que revisarla: el contrato actual de una estrategia es «devuelve importes por
  bloque».
