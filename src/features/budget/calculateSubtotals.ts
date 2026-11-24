import type { BudgetLine, Subtotals } from '../../shared/types/budget'
import { calculateLineAmountCents } from './calculateLineAmountCents'

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

  for (const line of lines) {
    const { service } = line

    /*
     * El importe no se calcula aquí. Hasta la Fase 4 esta línea era
     * `service.priceCents * quantity`, y entonces era el único sitio que
     * multiplicaba. Al mostrar el importe de cada línea en pantalla apareció un
     * segundo sitio, así que la multiplicación se extrajo a su propia función
     * con sus tests, y esta pasó a llamarla. Las nueve comprobaciones de
     * `calculateSubtotals.test.ts` siguieron en verde sin tocar ninguna.
     */
    const importe = calculateLineAmountCents(line)

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
