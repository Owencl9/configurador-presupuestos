import {
  AMOUNT_DISCOUNT_PERCENT,
  AMOUNT_DISCOUNT_THRESHOLD_CENTS,
} from '../constants/business-rules'
import { calculatePercentCents } from '../utils/calculatePercentCents'
import { formatEuros } from '../utils/formatEuros'
import type { DiscountStrategy } from './discountStrategy'

/**
 * El motivo que se muestra en el resumen.
 *
 * El umbral se escribe con `formatEuros`, la misma función que escribe todos
 * los importes de la aplicación, así que el texto dice «3.000,00 €» con el
 * formato español de la especificación. Si mañana el umbral sube a 5.000 €,
 * este texto lo dirá sin que nadie lo edite.
 */
const MOTIVO = `Pago inicial superior a ${formatEuros(AMOUNT_DISCOUNT_THRESHOLD_CENTS)} (${AMOUNT_DISCOUNT_PERCENT} %)`

/**
 * **Descuento por importe**: si el subtotal del pago inicial supera los
 * 3.000 €, un 5 % sobre ese mismo bloque.
 *
 * Tres detalles que esta regla no comparte con las otras dos:
 *
 * 1. **El umbral es estricto.** El apartado 4.3 dice «si el pago único
 *    *supera* 3.000 €», así que 3.000,00 € exactos no lo activan y 3.000,01 €
 *    sí. La permanencia, en cambio, es inclusiva: «12 meses *o más*». Cada una
 *    tiene su test, porque la diferencia entre `>` y `>=` aquí son 150 € de
 *    factura.
 *
 * 2. **Afecta a un solo bloque**, el del pago inicial. Una cuota mensual alta
 *    no lo activa: la regla habla del pago único, y dejar que una cuota
 *    recurrente rebajara el pago inicial mezclaría dos importes que el cliente
 *    paga en momentos distintos.
 *
 * 3. **No necesita las líneas**, solo el subtotal. Es la estrategia más simple
 *    de las tres, y la que mejor enseña para qué sirve que todas tengan la
 *    misma forma: el calculador la ejecuta igual que a las demás sin saber que
 *    es más sencilla.
 *
 * El umbral se evalúa sobre el subtotal **antes de cualquier descuento**, como
 * todas las condiciones de esta fase: si el pack se descontara primero, un
 * presupuesto de 3.100 € bajaría a 2.945 € y dejaría de cumplir su propia
 * condición, de modo que el resultado dependería del orden de ejecución. Ver
 * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md).
 */
export const amountDiscount: DiscountStrategy = ({ subtotalsCents }) => {
  const subtotalCents = subtotalsCents.oneTime

  if (subtotalCents <= AMOUNT_DISCOUNT_THRESHOLD_CENTS) {
    return []
  }

  const amountCents = calculatePercentCents(
    subtotalCents,
    AMOUNT_DISCOUNT_PERCENT,
  )

  if (amountCents <= 0) {
    return []
  }

  return [{ id: 'amount', label: MOTIVO, block: 'oneTime', amountCents }]
}
