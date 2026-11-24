import type { BudgetLine } from '../../shared/types/budget'
import type { Service } from '../../shared/types/service'
import {
  readJson,
  removeKey,
  writeJson,
} from '../../shared/utils/safeLocalStorage'
import { DRAFT_STORAGE_KEY } from './draftFormat'
import { parseDraft } from './parseDraft'
import { serializeDraft } from './serializeDraft'

/**
 * El borrador del presupuesto, de las líneas al navegador y del navegador a las
 * líneas.
 *
 * Es la **única** capa de esta funcionalidad que tiene efectos secundarios: las
 * tres piezas que usa —`serializeDraft`, `parseDraft` y `safeLocalStorage`— son
 * funciones puras o devuelven valores en lugar de lanzar. Aquí solo se decide
 * qué se llama y en qué orden, y eso es lo que hace que la lógica de validación
 * se pueda probar sin navegador.
 */

/**
 * Recupera el borrador guardado y lo convierte en líneas de presupuesto.
 *
 * Devuelve **siempre** un array, nunca `null` ni una excepción: el presupuesto
 * vacío es el resultado correcto cuando no hay borrador, cuando el navegador no
 * deja leer y cuando lo guardado está dañado. Son tres situaciones distintas que
 * llevan a la misma decisión, y distinguirlas aquí obligaría a quien llama a
 * tratarlas por separado sin poder hacer nada diferente con ellas.
 *
 * El catálogo llega por parámetro y no se importa aquí para que los tests
 * puedan pasarle uno de mentira —es la forma de probar qué pasa con un servicio
 * retirado— y para que la función no decida por su cuenta con qué datos se
 * resuelve un identificador.
 */
export function loadDraftLines(
  services: readonly Service[],
): readonly BudgetLine[] {
  return parseDraft(readJson(DRAFT_STORAGE_KEY), services)
}

/**
 * Guarda el presupuesto actual como borrador.
 *
 * **Un presupuesto vacío borra la clave** en lugar de guardar una lista de cero
 * líneas. Las dos cosas se recuperan igual, pero no dejar un borrador vacío
 * detrás es menos sorprendente para quien mira el almacenamiento del navegador
 * y evita que quede un rastro de uso de la aplicación sin ninguna utilidad.
 *
 * @returns `true` si se ha guardado. `false` si el navegador no lo permite, y
 * entonces no pasa nada más: la aplicación sigue funcionando sin borradores.
 */
export function saveDraftLines(lines: readonly BudgetLine[]): boolean {
  if (lines.length === 0) {
    return clearDraft()
  }

  return writeJson(DRAFT_STORAGE_KEY, serializeDraft(lines))
}

/**
 * Borra el borrador guardado.
 *
 * Es lo que ocurre al empezar un presupuesto nuevo (apartado 4.6 del prompt
 * maestro): si el borrador sobreviviera, volvería a aparecer en la siguiente
 * visita el presupuesto que se acaba de descartar.
 */
export function clearDraft(): boolean {
  return removeKey(DRAFT_STORAGE_KEY)
}
