import type { PaymentType, Service } from '../../shared/types/service'
import { formatEuros } from '../../shared/utils/formatEuros'

/**
 * Sufijo que acompaña al importe según la forma de pago.
 *
 * Es un `Record` con una clave por cada valor de `PaymentType`, no un `switch`
 * ni una cadena de `if`. La ventaja es que el compilador exige que estén
 * **todas** las claves: si algún día se añadiera una cuarta forma de pago al
 * tipo `PaymentType`, este objeto dejaría de compilar y el error aparecería
 * aquí, en el sitio donde hay que decidir qué sufijo le corresponde, en lugar
 * de pasar desapercibido y mostrar un precio sin unidad.
 */
const SUFIJOS: Record<PaymentType, string> = {
  'one-time': '',
  monthly: '/mes',
  yearly: '/año',
}

/**
 * Texto del precio de un servicio, listo para mostrar en una `ServiceCard`:
 * `1.200,00 €`, `250,00 €/mes` o `120,00 €/año`.
 *
 * `ServiceCard` recibe el precio ya formateado y no calcula nada (decisión de
 * la Fase 1), así que alguien tiene que construir ese texto. Ese alguien es
 * esta función, que vive en la funcionalidad del catálogo porque el sufijo
 * `/mes` o `/año` es presentación del catálogo, no una regla de negocio.
 *
 * El importe lo formatea `formatEuros`, en `shared/utils`. Aquí vivió una
 * conversión provisional durante la Fase 2, con el acuerdo de sustituirla por la
 * función probada en cuanto existiera; se borró en la Fase 3 y los ocho tests de
 * este archivo siguieron en verde sin tocar ni uno.
 */
export function buildPriceLabel(service: Service): string {
  return `${formatEuros(service.priceCents)}${SUFIJOS[service.payment]}`
}
