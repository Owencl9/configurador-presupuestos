/* =============================================================================
 * FORMATO DEL BORRADOR GUARDADO EN EL NAVEGADOR
 * =============================================================================
 *
 * **Este archivo define qué se guarda y bajo qué clave, y es el único sitio
 * donde se cambia.** `serializeDraft` escribe esta forma, `parseDraft` la
 * valida y `draftStorage` la lleva y la trae de `localStorage`.
 *
 * ## Qué se guarda: lo mínimo
 *
 * Solo el identificador de cada servicio, la cantidad y los meses. **Ni
 * precios, ni nombres, ni importes, ni IGIC, ni totales.** Al recuperar el
 * borrador, todo eso se vuelve a sacar del catálogo (`shared/data/services.ts`),
 * así que nadie puede rebajarse un precio editando el almacenamiento del
 * navegador: como mucho puede cambiar qué servicios figuran, que es lo mismo que
 * puede hacer pulsando botones.
 *
 * Hay un test de `serializeDraft` que lo comprueba sobre el JSON resultante,
 * con control positivo.
 *
 * ## Qué NO se guarda: nada personal
 *
 * No hay ningún dato personal en el borrador. Los datos del cliente —nombre,
 * empresa y correo— llegan en la **Fase 7**, y si algún día se guardaran, el
 * campo iría aquí y habría que decidirlo antes: un nombre y un correo en
 * `localStorage` son datos personales en un ordenador que puede ser compartido,
 * y el presupuesto funciona igual sin ellos.
 * ========================================================================== */

/**
 * Clave del borrador en `localStorage`, **con la versión del formato dentro**.
 *
 * La versión no es decorativa: si el formato cambia en una fase posterior, la
 * clave pasa a `:v2` y los borradores escritos con el formato antiguo quedan
 * ignorados sin llegar a leerse. Es la forma más segura de tratar un formato
 * desconocido, porque no hay que acertar interpretándolo.
 *
 * El prefijo con el nombre de la aplicación evita choques con cualquier otra
 * cosa guardada en el mismo dominio.
 */
export const DRAFT_STORAGE_KEY = 'configurador-presupuestos:budget-draft:v1'

/**
 * Una línea del presupuesto, tal y como se guarda.
 *
 * `months` es **opcional aquí y solo aquí**, al contrario que en
 * `MonthlyBudgetLine`, donde es obligatorio. El motivo es que este tipo
 * describe lo que hay escrito en el navegador, no lo que la aplicación
 * considera válido: un borrador de una versión anterior, o editado a mano,
 * puede no tenerlo. Ponerle valor es trabajo de `parseDraft`.
 */
export interface StoredDraftLine {
  readonly serviceId: string
  readonly quantity: number
  readonly months?: number
}

/**
 * El borrador completo.
 *
 * Es un objeto con un campo y no un array suelto a propósito: así, si alguna
 * vez hay que guardar algo más (la fecha del borrador, por ejemplo), el formato
 * crece sin cambiar de naturaleza.
 *
 * **Describe lo que escribimos, no lo que leemos.** Lo que se lee de
 * `localStorage` es `unknown` hasta que `parseDraft` lo valide: un tipo de
 * TypeScript desaparece al compilar y no comprueba nada en tiempo de ejecución,
 * así que declarar que lo leído es un `StoredDraft` sería una promesa que nadie
 * verifica.
 */
export interface StoredDraft {
  readonly lines: readonly StoredDraftLine[]
}
