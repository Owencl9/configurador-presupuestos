# ADR 0008 — El primer pago es presentación, no un total del presupuesto

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 4

## Contexto

El [ADR 0007](0007-redondeo-del-igic.md) decidió en la Fase 3 que el
presupuesto **no tiene un total general**: `Budget` son tres `PaymentBlock`
independientes —pago inicial, cuota mensual y pago anual—, cada uno con su
subtotal, su descuento, su base imponible, su IGIC y su total. Sumar los tres
daría un importe que el cliente no paga en ningún momento, porque mezcla un
pago único con dos cuotas recurrentes.

Aquel ADR dejó una cuestión abierta y la asignó a esta fase:

> Lo que se paga el primer día es una decisión de presentación y le corresponde
> al resumen de la Fase 4.

La Fase 4 construye ese resumen, y el usuario confirmó al abrirla que quiere la
cifra: los tres bloques por separado y, además, **una línea informativa
claramente etiquetada** con lo que se paga el primer día, que es el pago inicial
más la primera cuota mensual más el primer pago anual.

Ahí está la tensión que resuelve este ADR. La cifra que se pide es,
aritméticamente, **exactamente la suma que el ADR 0007 prohibió**. Hay que
decidir si eso contradice la decisión anterior y, si no, qué la distingue y qué
impide que dentro de dos fases alguien la trate como el total que no es.

## Opciones consideradas

### 1. Un campo más en el tipo `Budget`

```ts
interface Budget {
  oneTime: PaymentBlock
  monthly: PaymentBlock
  yearly: PaymentBlock
  firstPaymentCents: number // ← la opción descartada
}
```

| A favor                                                              | En contra                                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Todo lo que hay que mostrar llega en un solo objeto                   | Convierte en **estructura** lo que es una decisión de presentación                                                             |
| `calculateBudget` ya tiene los tres totales delante                   | Un cuarto campo al lado de tres bloques se lee como el resumen de los tres: nadie se extrañaría de verlo con la etiqueta «Total» |
|                                                                      | Reintroduce por la puerta de atrás el total que el ADR 0007 descartó, y sin su justificación                                     |

### 2. La suma dentro del componente del resumen

| A favor                            | En contra                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Es presentación y vive en la vista | **Incumple el pendiente nº 12**: los componentes no hacen cuentas, todo importe sale del cálculo probado |
|                                    | Una suma de dinero sin tests, y precisamente la que más fácil es equivocar: sumar bases en lugar de totales |

### 3. Una función propia, fuera del tipo `Budget` (elegida)

```ts
// features/budget/calculateFirstPaymentCents.ts
export function calculateFirstPaymentCents(budget: Budget): number
```

| A favor                                                                                      | En contra                                                  |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Es una suma de dinero, así que tiene tests, como todo el dinero del proyecto                  | Hay que llamarla aparte: el presupuesto no la trae puesta  |
| **No está dentro de `Budget`**, así que no se puede confundir con un total del presupuesto     | Un archivo más                                             |
| Su nombre dice cuándo, no cuánto: `firstPayment`, no `total`                                   |                                                            |
| Deja constancia escrita, en su documentación y aquí, de por qué no es el total prohibido       |                                                            |

## Decisión

**La cifra del primer pago se calcula en `calculateFirstPaymentCents`, en
`features/budget/`, con TDD, y se queda fuera del tipo `Budget`.**

Lo que la distingue del total prohibido no es la aritmética, que es la misma:
es **la pregunta que responde**.

- «¿Cuánto cuesta este presupuesto?» no tiene una respuesta: depende de cuántos
  meses se mantenga el servicio. Cualquier cifra que se dé es falsa.
- «¿Cuánto hay que pagar el primer día?» es un momento concreto y tiene una
  respuesta exacta.

De ahí se derivan tres consecuencias que forman parte de la decisión:

1. **Suma los totales, con IGIC incluido**, porque es el dinero que sale del
   banco, y no las bases imponibles. Hay un test dedicado a distinguir las dos
   implementaciones: las bases suman 287.000 céntimos y los totales 307.090.
2. **Cuenta una sola cuota de cada clase.** La primera mensual y el primer pago
   anual. El compromiso de toda la permanencia es otra cifra que esta función no
   calcula.
3. **La etiqueta en pantalla es «A pagar el primer día (orientativo)»**,
   decisión expresa del usuario, y es parte del ADR y no un detalle de estilo:
   la aplicación no cobra nada ni tiene medios de pago. Calcula un presupuesto.

## Consecuencias

### Lo que mejora

- El resumen puede dar la cifra útil —casi todo el mundo quiere saber cuánto
  hay que pagar para empezar— sin romper la decisión del ADR 0007 ni inventar
  un total que nadie paga.
- La suma está probada, y uno de sus tests es exactamente el error plausible
  (sumar bases en lugar de totales), que a ojo no se distingue.
- El componente del resumen sigue sin hacer una sola cuenta.

### Lo que cuesta

- Quien muestre el presupuesto tiene que llamar a dos funciones en lugar de
  leer un objeto. Es poco, y es el precio de que la estructura no sugiera lo
  que no es.

### Lo que hay que vigilar

- **Si algún día aparece `firstPaymentCents` dentro de `Budget`, esta decisión
  se ha deshecho**, probablemente con buena intención y para «tenerlo todo
  junto». La Fase 7, que construye el documento imprimible, es el momento de
  mayor riesgo.
- El documento imprimible de la Fase 7 tendrá que decidir si esa línea sale
  impresa y con qué texto. La etiqueta «orientativo» y el detalle de qué
  incluye tienen que viajar con la cifra: suelta, vuelve a parecer un total.
