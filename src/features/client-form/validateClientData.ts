import {
  CLIENT_EMAIL_MAX_LENGTH,
  CLIENT_NAME_MIN_LENGTH,
  CLIENT_TEXT_MAX_LENGTH,
} from '../../shared/constants/business-rules'
import { type ClientData, normalizeClientData } from './clientData'

/** Los campos que pueden tener error. */
export type ClientField = keyof ClientData

/**
 * Un mensaje por campo con error. Los campos correctos no aparecen.
 *
 * Es un objeto por campo y no un booleano ni una lista de textos, y el motivo es
 * de accesibilidad: cada mensaje tiene que acabar asociado a **su** campo con
 * `aria-describedby`, y para eso hay que saber de qué campo es. Un resumen de
 * errores suelto obliga a quien usa un lector de pantalla a averiguar a qué se
 * refiere cada frase.
 */
export type ClientErrors = Partial<Record<ClientField, string>>

/**
 * Un correo «con pinta de correo»: algo, una arroba, algo, un punto, algo.
 *
 * **Deliberadamente permisiva, y conviene decir por qué.** Las expresiones
 * estrictas que circulan por ahí rechazan direcciones perfectamente válidas
 * —las que llevan `+`, las de dominios nuevos, las de más de cuatro letras de
 * extensión—, y un formulario que rechaza el correo de alguien que lo ha escrito
 * bien es peor que uno que acepta un correo con una errata.
 *
 * La única validación real de una dirección es **enviarle algo**, y aquí no se
 * envía nada a ninguna parte: los datos del cliente no salen del navegador. Así
 * que esto solo atrapa los errores evidentes —falta la arroba, hay un espacio,
 * no hay dominio—, que es exactamente lo que puede atrapar sin un servidor.
 *
 * Al excluir la arroba de los dos lados (`[^\s@]`), la expresión exige **una
 * sola**: `ana@@ejemplo.example` no coincide sin necesidad de contarlas.
 */
const CORREO_PLAUSIBLE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida los datos del cliente. **Función pura.**
 *
 * Valida los valores **recortados**, así que los espacios de los lados no
 * cuentan como caracteres: tres espacios no son un nombre de tres letras. No
 * modifica lo que recibe.
 *
 * Reglas, decididas por el usuario al autorizar la Fase 7:
 *
 * - **Nombre**: obligatorio, entre `CLIENT_NAME_MIN_LENGTH` y
 *   `CLIENT_TEXT_MAX_LENGTH` caracteres.
 * - **Empresa**: opcional, hasta `CLIENT_TEXT_MAX_LENGTH`.
 * - **Correo**: opcional, y si se escribe algo tiene que parecer un correo.
 *
 * Devuelve **todos** los errores a la vez, no el primero: pedir que se corrija
 * un campo y, al enviar otra vez, descubrir que había un segundo mal es la forma
 * más rápida de que alguien abandone un formulario.
 */
export function validateClientData(data: ClientData): ClientErrors {
  const { name, company, email } = normalizeClientData(data)
  const errores: ClientErrors = {}

  if (name === '') {
    errores.name = 'Escribe el nombre del cliente.'
  } else if (name.length < CLIENT_NAME_MIN_LENGTH) {
    errores.name = `El nombre tiene que tener al menos ${String(CLIENT_NAME_MIN_LENGTH)} caracteres.`
  } else if (name.length > CLIENT_TEXT_MAX_LENGTH) {
    errores.name = `El nombre no puede pasar de ${String(CLIENT_TEXT_MAX_LENGTH)} caracteres.`
  }

  // La empresa es opcional: vacía no es un error, solo larga lo es.
  if (company.length > CLIENT_TEXT_MAX_LENGTH) {
    errores.company = `La empresa no puede pasar de ${String(CLIENT_TEXT_MAX_LENGTH)} caracteres.`
  }

  if (email !== '') {
    if (email.length > CLIENT_EMAIL_MAX_LENGTH) {
      errores.email = `El correo no puede pasar de ${String(CLIENT_EMAIL_MAX_LENGTH)} caracteres.`
    } else if (!CORREO_PLAUSIBLE.test(email)) {
      /*
       * El ejemplo del mensaje usa `example.com`, que la RFC 2606 reserva, y no
       * un dominio de aspecto genérico con una extensión real: los que se
       * usaban antes aquí están registrados por alguien, y este texto **viaja
       * en el JS publicado** de un repositorio público. Es la corrección C7-4,
       * y aquí importa más que en los tests, porque esto lo lee quien usa la
       * aplicación. Los dominios concretos que se retiraron no se escriben en
       * este archivo a propósito (pendiente nº 20): se describen en lugar de
       * reproducirlos, que es la norma del apartado 5 de `CLAUDE.md`.
       */
      errores.email =
        'Escribe un correo con el formato nombre@example.com, o déjalo vacío.'
    }
  }

  return errores
}
