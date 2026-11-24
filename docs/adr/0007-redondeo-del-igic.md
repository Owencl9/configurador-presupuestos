# ADR 0007 — Redondeo del IGIC y un bloque de pago por forma de cobro

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 3

## Contexto

El apartado 4.3 del prompt maestro fija el orden de cálculo
—subtotal → descuentos → base imponible → IGIC → total— y exige que quede
documentado y probado. El tipo de IGIC es el 7 %, configurable.

Aplicar un 7 % a un importe en céntimos produce casi siempre un resultado con
decimales: el 7 % de 0,07 € son 0,49 céntimos. Como todo el dinero se calcula
con enteros ([ADR 0003](0003-dinero-en-centimos.md)), hay que decidir
explícitamente **cómo** se redondea, **dónde** se redondea y **cuántas veces**.
Son tres preguntas distintas y las tres cambian el total que aparece en el
documento que recibe el cliente.

## Opciones consideradas

### 1. Cómo se multiplica

| Opción                | A favor                                                                       | En contra                                                                       |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **`base * 7 / 100`**  | El producto es exacto y el valor intermedio es el número matemático           | Hay que recordar que el tipo se guarda como porcentaje, no como factor          |
| `base * 0.07`         | Se lee como la fórmula de toda la vida                                        | 0,07 no tiene representación binaria exacta: vale 0,070000000000000006…         |

Se comprobó con un script temporal que las dos fórmulas dan **el mismo
resultado en los dos millones de bases** entre 0 € y 20.000 €. La diferencia no
está en el resultado, sino en el razonamiento: con el entero, un empate cae en
`3.5` exacto y lo decide la regla de redondeo; con el factor decimal cae en
`3.500000000000000444` y lo decide la regla *más* un error que casualmente
apunta hacia arriba. Solo la primera se puede defender sin ejecutar nada.

### 2. Cómo se redondea

| Opción                                  | A favor                                                                   | En contra                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Comercial (`Math.round`, empate ↑)**  | Es el redondeo de la facturación española y el de una calculadora         | Sesga una milésima hacia arriba al acumular muchísimos redondeos               |
| Bancario (empate al par)                | Sin sesgo estadístico al acumular                                         | El 7 % de 0,50 € daría 0,03 € y no 0,04 €: sorprende a quien revise la factura |
| Truncar (`Math.floor`)                  | Nunca cobra de más                                                        | Desvía el total sistemáticamente a la baja; no es el criterio de la AEAT       |

### 3. Dónde y cuántas veces se redondea

| Opción                                   | A favor                                                  | En contra                                                                              |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Una vez por bloque, sobre su base**    | El total es exactamente el 7 % de la base que se imprime | Ninguna en este proyecto: el documento no desglosa el IGIC por línea                   |
| Línea a línea, y después se suma         | Cada línea cuadraría por separado                        | La suma de redondeos no es el redondeo de la suma: el total deja de cuadrar con su base |
| Una vez en total, sobre los tres bloques | Un solo número                                           | Mezcla un pago único con cuotas recurrentes: produce un importe que nadie paga         |

Caso construido que descarta la segunda opción: siete líneas de 0,07 €. El 7 %
de cada una redondea a 0, así que el IGIC sumado línea a línea sería **0
céntimos**; el 7 % de la base completa (0,49 €) son **3 céntimos**.

## Decisión

```ts
export function calculateIgic(baseCents: number, ratePercent: number): number {
  return Math.round((baseCents * ratePercent) / 100)
}
```

1. **Se multiplica por el porcentaje entero y se divide al final.** El tipo se
   guarda como número de porcentaje (`7`), no como factor (`0.07`).
2. **Redondeo comercial**, al céntimo más cercano, con los empates hacia arriba.
3. **Un único redondeo por bloque de pago**, sobre la base imponible completa y
   después de los descuentos. Nunca línea a línea.
4. **El presupuesto tiene tres bloques independientes** —pago inicial, cuota
   mensual y pago anual—, cada uno con su subtotal, su descuento, su base, su
   IGIC y su total. **No hay un total general.**
5. **El tipo se pasa por parámetro** a `calculateIgic`, y el único punto del
   código que lee el valor configurado es el parámetro por defecto de
   `calculateBudget`.

## Consecuencias

- El total de cada bloque es, siempre, exactamente su base más el 7 % de su
  base. Un presupuesto que no cuadre señala un error real y no un redondeo.
- **El tipo admite medios puntos pero no décimas.** El 9,5 % —uno de los tipos
  incrementados del IGIC— funciona exacto, porque los medios tienen
  representación binaria exacta. Un tipo del 7,1 % no la tiene y obligaría a
  pasar el archivo de constantes a milésimas. Hay un test en
  `business-rules.test.ts` que vigila esta condición, para que la limitación dé
  un fallo con nombre en lugar de un céntimo mal calculado.
- **No existe un «total del presupuesto».** Lo que se paga el primer día —el
  pago inicial más la primera cuota— es una decisión de presentación y le
  corresponde al resumen de la Fase 4. Si alguna vez hace falta, se calcula en
  la capa que lo muestra y no en el cálculo.
- Los descuentos de la Fase 6 se restan **antes** del IGIC, en el hueco
  `discountCents` que ya existe en cada bloque. Añadirlos no cambia la forma del
  presupuesto ni obliga a tocar los componentes que ya lo muestren.
- `Math.round(-3.5)` devuelve `-3`, no `-4`: redondea hacia el infinito
  positivo, no alejándose del cero. No afecta al cálculo, porque la base
  imponible nunca es negativa, pero está anotado en la función para quien la
  reutilice.
