import {
  MAX_MONTHS,
  MAX_QUANTITY,
  MIN_QUANTITY,
} from '../../shared/constants/business-rules'
import type { BudgetLine } from '../../shared/types/budget'
import type { Service } from '../../shared/types/service'
import { normalizeNumber } from '../../shared/utils/normalizeNumber'

/**
 * ¿Es un objeto con campos, y no un array ni `null`?
 *
 * `typeof null` es `'object'` y `typeof []` también, así que hay que preguntar
 * las tres cosas. El tipo de retorno —`valor is Record<string, unknown>`— es un
 * predicado de tipo: dentro del `if` TypeScript deja leer campos del objeto,
 * pero cada campo vale `unknown`, así que **sigue obligando a comprobar antes
 * de usarlo**. Es exactamente lo que se quiere al leer datos que no son de
 * fiar: poder mirarlos sin que el compilador dé nada por supuesto.
 */
function esObjetoConCampos(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

/**
 * Valida lo que se ha leído del navegador y lo convierte en líneas de
 * presupuesto. **Función pura: no toca `localStorage`.**
 *
 * Recibe `unknown` porque es lo que de verdad hay: `JSON.parse` devuelve
 * cualquier cosa, y el contenido de `localStorage` lo puede editar quien quiera
 * desde las herramientas del navegador. Un tipo de TypeScript no comprueba nada
 * en tiempo de ejecución, así que declarar que lo leído es un borrador sería
 * una promesa que nadie verifica. Aquí se verifica.
 *
 * ## Las tres formas de tratar un dato malo
 *
 * Las tres están decididas por el usuario al autorizar la fase, y son
 * distintas a propósito:
 *
 * | Qué falla | Qué se hace | Por qué |
 * | --- | --- | --- |
 * | **La estructura** (no es un objeto, `lines` no es un array) | se descarta todo | Es un formato desconocido, y un formato desconocido no se interpreta. Apartado 4.6 del prompt maestro: se descarta y se empieza de cero |
 * | **Una línea** (sin identificador, servicio inexistente o repetido) | se descarta esa línea | Lo demás es trabajo legítimo del usuario. Tirar un presupuesto de cinco servicios porque uno se retiró del catálogo sería perder lo que sí se puede recuperar |
 * | **Un número** (fuera de rango, decimal, texto) | se normaliza | Un número raro no invalida la línea: el rango válido está definido y hay una función probada que acerca cualquier valor a él |
 *
 * El servicio **siempre** sale del catálogo que se recibe, buscándolo por
 * identificador, y la línea guarda ese objeto tal cual. De ahí vienen el precio,
 * el nombre y la forma de pago, nunca del borrador: es lo que hace que editar
 * `localStorage` no pueda cambiar un importe. Hay un test que lo comprueba con
 * `toBe`, que compara identidad.
 *
 * @param raw Lo leído y convertido desde JSON. Cualquier cosa.
 * @param services El catálogo con el que se resuelven los identificadores.
 */
export function parseDraft(
  raw: unknown,
  services: readonly Service[],
): readonly BudgetLine[] {
  if (!esObjetoConCampos(raw) || !Array.isArray(raw.lines)) {
    return []
  }

  const lineas: BudgetLine[] = []
  const identificadoresVistos = new Set<string>()

  for (const guardada of raw.lines as readonly unknown[]) {
    if (!esObjetoConCampos(guardada)) {
      continue
    }

    const { serviceId } = guardada

    if (typeof serviceId !== 'string' || serviceId === '') {
      continue
    }

    // Un identificador repetido duplicaría el importe del servicio, y para
    // contratar dos unidades está la cantidad. Se queda la primera línea.
    if (identificadoresVistos.has(serviceId)) {
      continue
    }

    const service = services.find((candidato) => candidato.id === serviceId)

    // Lo más probable que puede salir mal con el tiempo: un borrador guardado
    // antes de que ese servicio se retirara del catálogo.
    if (!service) {
      continue
    }

    identificadoresVistos.add(serviceId)

    /*
     * `normalizeNumber` recibe `unknown` justamente para esto. Se escribió en
     * la Fase 4 para los selectores de pantalla y ya traía previsto este
     * segundo uso: trunca decimales, acerca al rango por el lado por el que se
     * ha salido y manda al mínimo lo que no es un número.
     */
    const quantity = normalizeNumber(guardada.quantity, {
      min: MIN_QUANTITY,
      max: MAX_QUANTITY,
    })

    /*
     * Los meses solo existen en las líneas mensuales, y el `switch` sobre la
     * forma de pago es lo que permite construir cada tipo concreto de la unión
     * `BudgetLine`: igual que en `createBudgetLine`, un objeto cuyo campo es
     * una unión no encaja en una unión de objetos.
     *
     * Un `months` guardado en un servicio de pago único o anual **se ignora**
     * (decisión del usuario): no interviene en ningún importe, así que no
     * invalida la línea, y la línea se construye con la forma que le toca por
     * su servicio.
     *
     * Si faltan los meses no hay caso especial que escribir: el mínimo de
     * `normalizeNumber` es el `minMonths` del servicio, así que un valor
     * ausente devuelve justo los meses mínimos, que es con los que nace una
     * línea nueva en `createBudgetLine`.
     */
    switch (service.payment) {
      case 'monthly':
        lineas.push({
          service,
          quantity,
          months: normalizeNumber(guardada.months, {
            min: service.minMonths,
            max: MAX_MONTHS,
          }),
        })
        break
      case 'one-time':
        lineas.push({ service, quantity })
        break
      case 'yearly':
        lineas.push({ service, quantity })
        break
      default: {
        // Rama inalcanzable: si algún día hay una cuarta forma de pago, esta
        // asignación deja de compilar y el aviso aparece aquí, que es donde hay
        // que decidir cómo se recupera del borrador.
        const formaDePagoNoCubierta: never = service
        throw new Error(
          `Forma de pago no contemplada: ${JSON.stringify(formaDePagoNoCubierta)}`,
        )
      }
    }
  }

  return lineas
}
