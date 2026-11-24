# ADR 0003 — El dinero se calcula en céntimos, con enteros

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 1 (se aplica a partir de la Fase 3)

## Contexto

La aplicación suma importes, aplica varios descuentos en cascada y calcula el
IGIC. El resultado es un presupuesto que una agencia entrega a un cliente: si los
céntimos no cuadran, el documento pierde credibilidad.

JavaScript representa todos los números con coma flotante de doble precisión
(IEEE 754), que no puede representar exactamente la mayoría de los decimales:

```js
0.1 + 0.2            // 0.30000000000000004
1200 * 0.05          // 60.00000000000001
(350 * 6) * 0.1      // 210.00000000000003
```

Estos errores no se cancelan: se acumulan a lo largo de la cadena
subtotal → descuentos → base imponible → IGIC → total, y pueden desviar el
total final en un céntimo o más. También producen fallos intermitentes en los
tests, donde `expect(total).toBe(1134)` falla por `1133.9999999999998`.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **Enteros en céntimos** | Exacto; sin dependencias; aritmética de enteros nativa; los tests comparan valores exactos | Hay que convertir a euros al mostrar, y redondear de forma explícita en las divisiones |
| Números decimales en euros | Es lo más directo de escribir | Produce errores de redondeo acumulados y tests frágiles. Inaceptable en el núcleo del proyecto |
| Librería de decimales (decimal.js, dinero.js) | Exacta y con API para dinero | Una dependencia más, con su API que aprender, para un cálculo que con enteros es trivial. Contradice el criterio de mantener la solución más sencilla |

## Decisión

**Todos los importes se representan y se calculan como números enteros de
céntimos.** La conversión a euros ocurre únicamente en la capa de presentación,
en formato español (`1.234,56 €`), con `Intl.NumberFormat`.

Reglas de aplicación:

- Los precios del catálogo se declaran en céntimos (1.200 € → `120000`).
- Los porcentajes se aplican con `Math.round()` explícito, y el redondeo se
  documenta y se prueba. No se deja un `.5` al criterio implícito del lenguaje.
- Ninguna función de negocio devuelve euros. Las variables de céntimos lo
  indican en su nombre o en su tipo.

## Consecuencias

- Los tests comparan enteros exactos, de modo que un fallo señala un error real
  de la lógica y no un artefacto del coma flotante.
- El orden de cálculo y los puntos de redondeo quedan explícitos, que es
  justamente lo que el apartado 4.3 del prompt maestro exige documentar y probar.
- **Coste:** hay que recordar la unidad en todo momento. Un `120000` mal
  interpretado como euros es un error silencioso. Se mitiga con nombres
  explícitos y con los tipos de TypeScript.
- Hay un único punto de formateo, así que cambiar el formato de salida no obliga
  a tocar la lógica.
