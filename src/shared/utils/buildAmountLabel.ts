import type { PaymentType } from '../types/service'
import { formatEuros } from './formatEuros'

/**
 * Sufijo que acompaña a un importe según la forma de pago.
 *
 * Es un `Record` con una clave por cada valor de `PaymentType`, no un `switch`
 * ni una cadena de `if`. La ventaja es que el compilador exige que estén
 * **todas** las claves: si algún día se añadiera una cuarta forma de pago, este
 * objeto dejaría de compilar y el error aparecería aquí, en el sitio donde hay
 * que decidir qué sufijo le corresponde, en lugar de mostrar un importe sin
 * unidad.
 */
const SUFIJOS: Record<PaymentType, string> = {
  'one-time': '',
  monthly: '/mes',
  yearly: '/año',
}

/**
 * Texto de un importe en céntimos con el sufijo de su forma de pago:
 * `1.200,00 €`, `250,00 €/mes`, `120,00 €/año`.
 *
 * Está en `shared/` porque lo usan dos funcionalidades, como pide el apartado 6
 * de CLAUDE.md: el catálogo lo usa para el precio de una tarjeta —a través de
 * `buildPriceLabel`, que le pasa el precio del servicio— y el presupuesto para
 * el precio unitario y el importe de cada línea.
 *
 * El sufijo importa más de lo que parece en el presupuesto. «500,00 €» y
 * «500,00 €/mes» son dos presupuestos muy distintos, y la diferencia entre los
 * dos son cuatro caracteres.
 *
 * El formato del importe lo pone `formatEuros`, que es quien tiene las reglas
 * del formato español y sus trece tests. Esta función solo pega el sufijo.
 */
export function buildAmountLabel(cents: number, payment: PaymentType): string {
  return `${formatEuros(cents)}${SUFIJOS[payment]}`
}
