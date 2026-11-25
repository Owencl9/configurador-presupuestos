/**
 * Tipos del presupuesto.
 *
 * Igual que `service.ts`, este archivo solo describe la *forma* de los datos:
 * no tiene valores ni lógica, y desaparece al compilar. Los valores de las
 * reglas de negocio viven en `shared/constants/business-rules.ts` y el cálculo
 * en `features/budget/`.
 */

import type { MonthlyService, OneTimeService, YearlyService } from './service'

/**
 * Lo común a las tres clases de línea: el servicio y cuántas unidades se
 * contratan.
 *
 * `quantity` es un entero mayor o igual que 1, y significa lo mismo en las tres
 * formas de pago: cuántas unidades del servicio se contratan. Dos landing pages
 * son `quantity: 2`, y la cuota mensual de dos planes de SEO es el doble de uno.
 *
 * No se exporta: los tipos que se usan son los tres de abajo y su unión,
 * `BudgetLine`.
 */
interface BudgetLineBase {
  /** Unidades contratadas. Entero mayor o igual que 1. */
  readonly quantity: number
}

/** Línea de un servicio de pago único. No tiene meses de contratación. */
export interface OneTimeBudgetLine extends BudgetLineBase {
  readonly service: OneTimeService
}

/** Línea de un servicio de pago anual. No tiene meses de contratación. */
export interface YearlyBudgetLine extends BudgetLineBase {
  readonly service: YearlyService
}

/**
 * Línea de un servicio mensual, con los meses de contratación elegidos.
 *
 * `months` es **obligatorio**: una línea mensual sin meses no compila. Es la
 * diferencia práctica con un campo opcional, que obligaría a cada lector a
 * decidir un valor de reserva, y el valor de reserva es donde se esconde un
 * error.
 *
 * Los meses **no multiplican la cuota**: `monthlyCents` sigue siendo lo que se
 * paga cada mes. Son el dato del descuento por permanencia de la Fase 6.
 */
export interface MonthlyBudgetLine extends BudgetLineBase {
  readonly service: MonthlyService
  /**
   * Meses contratados. Entero, nunca por debajo del `minMonths` del servicio y
   * nunca por encima de `MAX_MONTHS` (`shared/constants/business-rules.ts`).
   */
  readonly months: number
}

/**
 * Un servicio añadido al presupuesto.
 *
 * **Unión discriminada**, con el mismo criterio que `Service` en la Fase 2
 * ([ADR 0006](../../../docs/adr/0006-niveles-como-servicios-independientes.md)):
 * los datos imposibles no deben compilar. Da estas dos garantías:
 *
 * 1. Una línea mensual **tiene** meses, y el tipo es `number`, no
 *    `number | undefined`.
 * 2. **Leer `months` obliga a comprobar antes la forma de pago**, pasando por
 *    `isMonthlyLine`. No hay forma de leerlo «por si acaso» y poner un valor de
 *    reserva, que es donde se esconden los errores de este tipo.
 *
 * Las dos están probadas con `@ts-expect-error` en
 * `shared/utils/isMonthlyLine.test.ts`: lo que se comprueba ocurre al
 * compilar, y si el compilador dejara de rechazar esas líneas, el propio
 * comentario pasaría a ser un error y `npm run build` fallaría.
 *
 * ## La garantía que este tipo NO da
 *
 * **Escribir `months` en una línea de pago único o anual compila.** Es un dato
 * imposible que el compilador no detiene, al contrario de lo que ocurre con el
 * `minMonths` de `Service`, y conviene saber por qué.
 *
 * En `Service`, `payment` es un discriminante del propio objeto: TypeScript
 * elige el miembro de la unión que corresponde y rechaza los campos sobrantes.
 * En `BudgetLine` el discriminante está **anidado** (`service.payment`), así
 * que TypeScript no puede elegir miembro y comprueba los campos contra la suma
 * de los tres.
 *
 * Se puede cerrar declarando `months?: never` en los dos tipos no mensuales,
 * pero entonces el campo **existe** en los tres miembros y se pierde la
 * garantía 2: `linea.months` se lee en cualquier línea como
 * `number | undefined`. Medido en la Fase 4; las dos son incompatibles y se
 * eligió conservar la 2, porque las lecturas están repartidas por todos los
 * componentes y las escrituras pasan por un solo sitio.
 *
 * **Ese sitio es `createBudgetLine`**, en `features/budget/`, y es lo que
 * sustituye a la garantía que falta: es la única función que construye líneas,
 * decide los meses según la forma de pago y tiene tests que lo comprueban. Si
 * alguna vez hay un segundo constructor de líneas, esta nota deja de ser
 * cierta.
 *
 * Por el mismo motivo —el discriminante anidado— para leer `months` hay que
 * pasar por `isMonthlyLine`, en `shared/utils/`.
 */
export type BudgetLine =
  OneTimeBudgetLine | MonthlyBudgetLine | YearlyBudgetLine

/**
 * Los tres subtotales del presupuesto, separados por forma de pago
 * (apartado 4.4 del prompt maestro). Siempre en céntimos.
 *
 * Las tres cifras son importes de naturaleza distinta y **no se suman entre
 * ellas**: `oneTimeCents` se paga una vez, `monthlyCents` es la cuota de un mes
 * y `yearlyCents` la de un año.
 */
export interface Subtotals {
  /** Suma de los servicios de pago único: el pago inicial. */
  readonly oneTimeCents: number
  /** Cuota de **un** mes, no el total de la permanencia. */
  readonly monthlyCents: number
  /** Cuota de **un** año. */
  readonly yearlyCents: number
}

/**
 * Un descuento aplicado a un bloque de pago, **con su motivo**.
 *
 * El motivo no es decoración: el apartado 4.4 del prompt maestro exige que el
 * resumen explique cada descuento, y la Fase 6 es la que puede cumplirlo porque
 * cada estrategia devuelve el suyo junto al importe
 * ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)).
 *
 * Lo construye la estrategia que lo aplica, leyendo las constantes, así que
 * cambiar un porcentaje en `business-rules.ts` cambia también el texto que se
 * ve en pantalla. Un rótulo escrito a mano podría quedarse diciendo «5 %» con
 * la regla al 8 %.
 */
export interface AppliedDiscount {
  /**
   * Identificador de la regla: `pack`, `commitment`, `amount` o `cap`.
   *
   * Es `string` y no una unión cerrada porque el calculador admite estrategias
   * de prueba, que traen sus propios identificadores. Sirve de clave de lista
   * en React y para distinguir reglas en los tests.
   */
  readonly id: string
  /** El motivo, en español y listo para mostrar: «Pack de 3 servicios o más (5 %)». */
  readonly label: string
  /**
   * Importe del descuento en céntimos, **positivo**: es lo que se resta.
   *
   * La única excepción es el ajuste del tope, que es negativo porque devuelve
   * parte de lo descontado. Así la suma de los descuentos de un bloque es
   * siempre exactamente su `discountCents`, y el desglose de pantalla cuadra
   * con el importe que se resta. Ver
   * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md).
   */
  readonly amountCents: number
}

/**
 * El cálculo completo de una de las tres formas de pago, en el orden que fija
 * el apartado 4.3: subtotal → descuentos → base imponible → IGIC → total.
 *
 * Los cinco importes se guardan, en lugar de recalcularse al mostrarlos, para
 * que el desglose impreso del presupuesto (Fase 7) enseñe exactamente los
 * números con los que se ha calculado el total.
 */
export interface PaymentBlock {
  /** Suma de los precios por la cantidad, antes de descuentos. */
  readonly subtotalCents: number
  /**
   * Descuento aplicado a este bloque, como importe positivo que se resta.
   *
   * Desde la Fase 6 lo escriben las estrategias de descuento, y **es siempre
   * exactamente la suma de `discounts`**: no se calcula por separado, sino con
   * `sumDiscountCents` sobre esa misma lista. Así el desglose que se muestra en
   * pantalla no puede dejar de cuadrar con el importe que se resta.
   */
  readonly discountCents: number
  /**
   * Los descuentos que forman `discountCents`, **cada uno con su motivo**, en el
   * orden en que se muestran.
   *
   * Está vacío cuando ninguna regla se cumple, que es el caso más frecuente, y
   * entonces el resumen no muestra ninguna fila de descuento. Un descuento de
   * importe cero nunca entra en la lista: una fila de «0,00 €» parece un error
   * de cálculo.
   *
   * Vive **dentro del bloque** y no en una lista aparte del presupuesto
   * (decisión del usuario al autorizar la Fase 6): así el importe y su
   * explicación no se pueden desincronizar, y hay un test que comprueba la
   * igualdad en los tres bloques.
   */
  readonly discounts: readonly AppliedDiscount[]
  /** `subtotalCents − discountCents`. Es la base sobre la que se aplica el IGIC. */
  readonly taxableBaseCents: number
  /** IGIC redondeado a céntimos. Un único redondeo por bloque (ADR 0007). */
  readonly igicCents: number
  /** `taxableBaseCents + igicCents`. */
  readonly totalCents: number
}

/**
 * El presupuesto calculado: tres bloques independientes.
 *
 * No hay un «total general», y es deliberado: sumar un pago único, una cuota
 * mensual y una cuota anual daría un importe que el cliente no paga en ningún
 * momento. Ver [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).
 */
export interface Budget {
  /** Pago inicial. */
  readonly oneTime: PaymentBlock
  /** Cuota mensual. */
  readonly monthly: PaymentBlock
  /** Pago anual. */
  readonly yearly: PaymentBlock
}
