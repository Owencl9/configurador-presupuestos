import type { PaymentType, Service } from '../../shared/types/service'

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
 * Convierte céntimos a euros en formato español. **Función provisional.**
 *
 * La conversión de dinero a texto es lógica de negocio y le corresponde su
 * propio ciclo TDD en la Fase 3, junto con los precios y el IGIC definitivos.
 * Pero el catálogo de la Fase 2 ya necesita mostrar algo, así que la conversión
 * se concentra **aquí, en un único sitio**: en la Fase 3 se sustituye esta
 * llamada por la función `formatEuros` ya probada y este bloque se borra. No
 * hay ninguna otra parte del código que convierta céntimos a euros.
 *
 * Está escrita a mano, sin `Intl.NumberFormat`, para que el resultado sea
 * exactamente predecible. Conviene saberlo para la Fase 3: `Intl` con
 * `style: 'currency'` separa el importe del símbolo € con un **espacio
 * irrompible** (U+00A0), no con un espacio normal, y es una fuente clásica de
 * tests que fallan por un carácter invisible.
 */
function centimosAEurosProvisional(centimos: number): string {
  const euros = Math.trunc(centimos / 100)
  // Dos cifras siempre: 5 céntimos son «05», no «5».
  const decimales = String(centimos % 100).padStart(2, '0')
  // Agrupa de tres en tres desde la derecha e inserta el punto de los millares.
  const conMillares = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${conMillares},${decimales} €`
}

/**
 * Texto del precio de un servicio, listo para mostrar en una `ServiceCard`:
 * `1.200,00 €`, `250,00 €/mes` o `120,00 €/año`.
 *
 * `ServiceCard` recibe el precio ya formateado y no calcula nada (decisión de
 * la Fase 1), así que alguien tiene que construir ese texto. Ese alguien es
 * esta función, que vive en la funcionalidad del catálogo porque el sufijo
 * `/mes` o `/año` es presentación del catálogo, no una regla de negocio.
 */
export function buildPriceLabel(service: Service): string {
  return `${centimosAEurosProvisional(service.priceCents)}${SUFIJOS[service.payment]}`
}
