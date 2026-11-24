import type { Budget } from '../../shared/types/budget'

/**
 * Lo que el cliente paga el primer día, en céntimos: el pago inicial más la
 * primera cuota mensual más el primer pago anual, con su IGIC.
 *
 * ## Por qué esto no está dentro de `Budget`
 *
 * La Fase 3 decidió que el presupuesto **no tiene un total general**, porque
 * sumar un pago único con dos cuotas recurrentes da un importe que el cliente
 * no paga en ningún momento ([ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md)).
 * Esta función suma precisamente esos tres bloques, así que la pregunta
 * razonable es en qué se diferencia de aquel total prohibido.
 *
 * Se diferencia en lo que significa. El total prohibido pretendía responder
 * «cuánto cuesta este presupuesto», y a esa pregunta no hay una cifra: depende
 * de cuántos meses se mantenga el servicio. Esta responde «cuánto hay que pagar
 * el primer día», que es un momento concreto y tiene una respuesta exacta.
 *
 * Por eso vive **fuera** del tipo `Budget` y en su propio archivo. Si fuera un
 * campo más del presupuesto, a nadie le extrañaría leerlo como el total, y en
 * dos fases alguien lo mostraría con la etiqueta «Total». La etiqueta de la
 * interfaz —«A pagar el primer día (orientativo)»— es parte de la decisión, no
 * un adorno: la aplicación no cobra nada ni tiene medios de pago, solo calcula
 * un presupuesto.
 *
 * ## Qué suma, exactamente
 *
 * Los **totales** de los tres bloques, con IGIC incluido, porque es el dinero
 * que sale del banco. Y **una sola** cuota de cada clase: la primera mensual y
 * el primer pago anual. El compromiso de toda la permanencia es otra cifra, que
 * esta función no calcula.
 *
 * Es presentación, no una regla de negocio: no cambia ningún importe del
 * presupuesto y ningún descuento depende de ella. Está aquí, con tests, porque
 * es una suma, y los componentes no hacen cuentas.
 */
export function calculateFirstPaymentCents(budget: Budget): number {
  return (
    budget.oneTime.totalCents +
    budget.monthly.totalCents +
    budget.yearly.totalCents
  )
}
