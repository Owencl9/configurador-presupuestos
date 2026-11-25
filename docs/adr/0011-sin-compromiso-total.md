# ADR 0011 — El presupuesto no muestra el compromiso total de los servicios mensuales

**Fecha:** 25/11/2026
**Estado:** aceptada
**Fase:** 6

## Contexto

Desde la Fase 4, una línea de servicio mensual tiene **meses de contratación**,
y desde la Fase 6 esos meses cambian un importe: a partir de doce activan el
descuento por permanencia.

Eso vuelve a plantear una pregunta que la Fase 4 dejó aparcada —«el compromiso
total se deja para más adelante»— y que era el pendiente nº 19 de `PROGRESO.md`:
si la pantalla debe mostrar **meses × cuota**, es decir, lo que el cliente
acabará pagando por toda la permanencia.

```
SEO Profesional, 12 meses:  409,28 €/mes  →  ¿4.911,36 € en total?
```

Es una cifra real, fácil de calcular y que alguien querrá saber. Y es también la
cuarta cifra grande de una pantalla que ya ha decidido dos veces no tener un
total:

- El [ADR 0007](0007-redondeo-del-igic.md) descartó el total general del
  presupuesto: sumar un pago único con dos cuotas recurrentes da un importe que
  nadie paga.
- El [ADR 0008](0008-el-primer-pago-es-presentacion.md) admitió «a pagar el
  primer día» como **línea informativa**, fuera del tipo `Budget`, porque
  responde a una pregunta con fecha: *¿cuánto hay que pagar para empezar?*

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **No mostrarlo** (elegida) | La pantalla mantiene una sola cifra grande por bloque, y ninguna de ellas es un total inventado | Quien quiera saber el compromiso tiene que multiplicar |
| Mostrarlo junto a la cuota | Es un dato real y útil para decidir una permanencia | Es la cifra más alta de la pantalla y la más fácil de confundir con «lo que cuesta el presupuesto»; y no incluye el pago inicial, así que tampoco es eso |
| Mostrarlo solo en el documento imprimible (Fase 7) | El documento es el sitio donde un cliente compara ofertas | Aplaza la decisión en lugar de tomarla, y el documento es precisamente donde una cifra equivocada hace más daño |

## Decisión

**No se muestra el compromiso total.** Decisión del usuario al abrir la Fase 6.

El criterio es el del ADR 0008, aplicado a esta cifra: **una cantidad de dinero
en pantalla tiene que responder a una pregunta con respuesta exacta.**

- «¿Cuánto pagas cada mes?» → 409,28 €/mes. Exacta.
- «¿Cuánto pagas el primer día?» → 3.072,51 €. Exacta, y etiquetada como
  orientativa.
- «¿Cuánto te cuesta el compromiso?» → depende de que la permanencia se cumpla,
  de que no se cambie de plan, de que no suba la tarifa y de que no se añadan
  servicios. Son 4.911,36 € **si nada cambia en un año**, y en doce meses algo
  cambia casi siempre.

Hay además una razón de forma: esa cifra **no incluye el pago inicial ni el
pago anual**, así que tampoco sería «lo que cuesta todo». Sería una cuarta
cantidad parcial al lado de otras tres, y la única sin una fecha que la
explique.

Lo que sí hace la Fase 6 es **hacer visible para qué sirven los meses**, que era
el problema real que el usuario detectó al probar la Fase 5 (pendiente nº 18):
bajo el selector de meses hay ahora una pista —«Desde 12 meses: 10 % de
descuento», o «Descuento por permanencia aplicado»— y el motivo del descuento
aparece en el resumen. Los meses ya no parecen un campo que no hace nada, y no
ha hecho falta inventar un importe para conseguirlo.

Por el mismo motivo, `calculateLineAmountCents` **no multiplica por los meses**
desde la Fase 4, y el descuento por permanencia se calcula sobre la cuota de un
mes: el 10 % de 450,00 €, no el 10 % de 5.400,00 €. El descuento rebaja la cuota
mensual, así que tiene que salir en la misma unidad que la cuota que rebaja.

## Consecuencias

### Lo que mejora

- La pantalla tiene **tres cifras grandes y una informativa**, y todas se pueden
  explicar en una frase con una fecha dentro.
- El presupuesto no promete un importe que depende de doce meses de futuro.

### Lo que cuesta

- Un cliente que quiera comparar dos permanencias tiene que multiplicar él. Es
  una multiplicación, y a cambio no hay ninguna cifra ambigua en el documento.

### Lo que hay que vigilar

- **La Fase 7 es el momento de riesgo.** El documento imprimible invita a
  rellenar huecos con cifras «para que quede completo», y el compromiso total es
  la primera que aparece. Si alguna vez se decide incluirla, tiene que llevar su
  etiqueta pegada —qué incluye, qué no y bajo qué supuesto— igual que el primer
  pago lleva la suya.
- Si el negocio pasa a facturar la permanencia por adelantado, esta decisión
  cambia: entonces el compromiso sí sería un importe con fecha, y además habría
  que revisar el ADR 0007, porque pasaría a ser parte del pago inicial.
