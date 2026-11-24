import type { BudgetLine, Subtotals } from '../../shared/types/budget'

/**
 * Reparte las líneas del presupuesto en los tres subtotales del apartado 4.4:
 * pago inicial, cuota mensual y pago anual.
 *
 * Es el primer paso del orden de cálculo (`subtotal → descuentos → base
 * imponible → IGIC → total`) y una función **pura**: recibe las líneas, no lee
 * ningún estado y devuelve un objeto nuevo.
 *
 * Las tres cifras no se suman entre ellas. Son importes de naturaleza distinta
 * —uno se paga una vez, otro cada mes y otro cada año— y mantenerlos separados
 * desde el primer paso del cálculo es lo que impide que acaben confundidos en
 * el documento final.
 */
export function calculateSubtotals(lines: readonly BudgetLine[]): Subtotals {
  let oneTimeCents = 0
  let monthlyCents = 0
  let yearlyCents = 0

  for (const { service, quantity } of lines) {
    const importe = service.priceCents * quantity

    /*
     * `switch` sobre `service.payment`, que es el discriminante de la unión
     * `Service` (Fase 2). TypeScript comprueba que los tres casos están
     * cubiertos: si algún día se añadiera una cuarta forma de pago al tipo
     * `PaymentType`, el compilador señalaría este `switch` como incompleto por
     * el `never` de la rama por defecto, en lugar de dejar que un servicio
     * desapareciera del presupuesto sin aviso.
     */
    switch (service.payment) {
      case 'one-time':
        oneTimeCents += importe
        break
      case 'monthly':
        monthlyCents += importe
        break
      case 'yearly':
        yearlyCents += importe
        break
      default: {
        const formaDePagoNoCubierta: never = service
        throw new Error(
          `Forma de pago no contemplada: ${JSON.stringify(formaDePagoNoCubierta)}`,
        )
      }
    }
  }

  return { oneTimeCents, monthlyCents, yearlyCents }
}
