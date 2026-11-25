/* =============================================================================
 * DATOS DE LA AGENCIA QUE EMITE EL PRESUPUESTO — TODOS FICTICIOS
 * =============================================================================
 *
 * ⚠️ **Nada de este archivo es real, y no puede llegar a serlo.** Es un
 * repositorio público: el nombre, el NIF, la dirección, el teléfono, el correo y
 * la web de este archivo están inventados y elegidos para que se vea que lo
 * están. Los datos reales de una empresa —y los de cualquier tercero— no se
 * versionan (apartado 5 de `CLAUDE.md`).
 *
 * Es la misma decisión que ya se tomó con los precios del catálogo en la Fase 2
 * (`shared/data/services.ts`), por el mismo motivo y con el mismo aviso.
 *
 * ## Cómo están elegidos los valores
 *
 * | Campo     | Por qué no puede ser de nadie                                   |
 * | --------- | --------------------------------------------------------------- |
 * | Nombre    | Lleva «Ejemplo» dentro: no hace falta leer el pie del documento |
 * | NIF/CIF   | Nueve ceros. Es un relleno evidente, no un CIF asignado         |
 * | Dirección | La calle no existe. El código postal es de Canarias, y eso sí   |
 * |           | importa: el impuesto del proyecto es el **IGIC**, así que una    |
 * |           | agencia peninsular en el documento sería incoherente con el 7 % |
 * | Teléfono  | Un 900 podría ser de alguien de verdad; este no es asignable    |
 * | Correo    | El dominio `.example` está **reservado por la RFC 2606**: no    |
 * | y web     | puede pertenecer a nadie, ni ahora ni nunca                     |
 *
 * **Este es el único sitio donde se cambian estos datos.** Quien use la
 * aplicación para presupuestos de verdad tiene que editar este archivo, y los
 * tests de `agency.test.ts` le avisarán de que lo que escriba ya no es ficticio.
 * ========================================================================== */

/**
 * La forma de los datos de la agencia.
 *
 * Son siete cadenas y ninguna es opcional: un documento al que le falte el NIF
 * de quien lo emite está incompleto, y es mejor que falte aquí —donde se ve al
 * editar— que en la hoja impresa.
 */
export interface Agency {
  /** Nombre o razón social. */
  readonly name: string
  /** NIF o CIF. */
  readonly taxId: string
  /** Calle y número. */
  readonly street: string
  /** Código postal y municipio. */
  readonly city: string
  /** Teléfono de contacto. */
  readonly phone: string
  /** Correo de contacto. */
  readonly email: string
  /** Sitio web, sin esquema. */
  readonly website: string
}

/** Los datos ficticios que salen impresos en el documento. */
export const AGENCY: Agency = {
  name: 'Agencia Ejemplo, S.L.',
  taxId: 'B00000000',
  street: 'Calle Ejemplo, 1',
  city: '35001 Las Palmas de Gran Canaria',
  phone: '+34 000 000 000',
  email: 'contacto@agencia-ejemplo.example',
  website: 'www.agencia-ejemplo.example',
}

/**
 * Dominio reservado para ejemplos por la RFC 2606.
 *
 * Exportado para que el test pueda comprobar el correo y la web contra él en
 * lugar de repetir la cadena: si alguien cambia el dominio de los datos, el test
 * falla por el motivo correcto.
 */
export const EXAMPLE_TLD = '.example'
