import type { Service } from '../../shared/types/service'
import { buildAmountLabel } from '../../shared/utils/buildAmountLabel'

/**
 * Texto del precio de un servicio, listo para mostrar en una `ServiceCard`:
 * `1.200,00 €`, `250,00 €/mes` o `120,00 €/año`.
 *
 * `ServiceCard` recibe el precio ya formateado y no calcula nada (decisión de
 * la Fase 1), así que alguien tiene que construir ese texto. Ese alguien es
 * esta función, que vive en la funcionalidad del catálogo porque lo que hace es
 * decidir **qué** importe de un servicio se muestra en su tarjeta: el precio.
 *
 * Lo que no vive aquí es *cómo* se escribe un importe con su sufijo. Eso está
 * en `shared/utils/buildAmountLabel`, porque desde la Fase 4 lo necesita
 * también el presupuesto, para el precio unitario y el importe de cada línea.
 * Esta función se quedó en dos líneas, y es la señal de que ya no hace nada
 * propio salvo elegir el importe.
 *
 * Historia de este archivo, que resume bien el proyecto: en la Fase 2 tenía
 * dentro una conversión provisional de céntimos a euros; la Fase 3 la sustituyó
 * por `formatEuros`; la Fase 4 se ha llevado la tabla de sufijos a `shared/`.
 * Sus **ocho tests no han cambiado ni una línea en ninguno de los tres
 * cambios**, porque describen lo que la función produce y no cómo lo hace.
 */
export function buildPriceLabel(service: Service): string {
  return buildAmountLabel(service.priceCents, service.payment)
}
