/* =============================================================================
 * LOS DATOS DEL CLIENTE
 * =============================================================================
 *
 * **Estos datos no se guardan en ninguna parte.** Ni en `localStorage`, ni en el
 * borrador del presupuesto, ni en un servidor, porque no hay servidor (ADR
 * 0002). Se escriben, se imprimen y se olvidan al recargar la página, y la
 * interfaz lo dice con un texto breve.
 *
 * Es una decisión del usuario, razonada en el ADR 0013 y en el pendiente nº 16
 * de `PROGRESO.md`: un nombre y un correo en el almacenamiento de un navegador
 * son datos personales en un ordenador que puede ser compartido, y el
 * presupuesto funciona igual sin ellos.
 *
 * Lo que sostiene esa decisión en el código no es un comentario, es **dónde vive
 * el estado**: estos datos están en un `useState` de la pantalla, fuera del
 * reducer del presupuesto. El efecto que guarda el borrador serializa el estado
 * del reducer, así que lo que no entra ahí no puede acabar en el navegador por
 * un descuido de una fase futura. Hay un test de integración que lo comprueba
 * sobre el contenido real de `localStorage`.
 * ========================================================================== */

/**
 * Los datos que el cliente escribe y que salen impresos en el documento.
 *
 * Los tres son cadenas, también los opcionales: un campo vacío es `''` y no
 * `undefined`. El motivo es de React —un `<input>` controlado al que se le pasa
 * `undefined` deja de estar controlado— y de simplicidad: así hay un solo tipo
 * para lo que se escribe, lo que se valida y lo que se imprime.
 *
 * Qué es obligatorio lo decide `validateClientData`, no este tipo. Un tipo de
 * TypeScript no puede expresar «al menos dos caracteres».
 */
export interface ClientData {
  /** Obligatorio. */
  readonly name: string
  /** Opcional. */
  readonly company: string
  /** Opcional. */
  readonly email: string
}

/** El estado inicial del formulario: los tres campos vacíos. */
export const EMPTY_CLIENT_DATA: ClientData = {
  name: '',
  company: '',
  email: '',
}

/**
 * Recorta los espacios de los tres campos. **Función pura.**
 *
 * Lo que se imprime es el valor recortado: un nombre escrito como
 * «  Ana Pérez  » saldría con esos espacios en el documento, y en un documento
 * que se envía a un cliente eso se nota. Separada de la validación a propósito
 * —aquí no hay ninguna regla, solo limpieza— y usada por las dos: la validación
 * valida lo recortado y el documento imprime lo recortado.
 */
export function normalizeClientData(data: ClientData): ClientData {
  return {
    name: data.name.trim(),
    company: data.company.trim(),
    email: data.email.trim(),
  }
}
