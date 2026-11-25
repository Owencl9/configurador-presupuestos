import { describe, expect, it } from 'vitest'

import { AGENCY, EXAMPLE_TLD } from './agency'

/*
 * Este archivo no prueba ninguna lógica: prueba que los datos de la agencia
 * **siguen siendo ficticios**. Es el mismo criterio que los tests del catálogo
 * de la Fase 2 y los de las reglas de negocio de la Fase 3, aplicado a lo único
 * que en este proyecto no se puede equivocar dos veces: un dato personal
 * publicado en un repositorio público.
 *
 * Un precio mal puesto se corrige con un commit. Un dato real publicado ya está
 * publicado, y además —si fuera de un tercero— no se puede rotar como se rota
 * una contraseña (apartado 5 de `CLAUDE.md`).
 *
 * El día que alguien use esta aplicación para presupuestos de verdad, estos
 * tests se pondrán en rojo. Eso **es** el aviso, no un estorbo: que quien lo
 * haga sepa que acaba de meter datos reales en un repositorio y decida si ese
 * repositorio debe seguir siendo público.
 */
describe('datos de la agencia', () => {
  it('tiene los siete campos rellenos', () => {
    // Un documento al que le falte el NIF de quien lo emite está incompleto, y
    // es mejor que el hueco se vea aquí que en la hoja impresa.
    for (const [campo, valor] of Object.entries(AGENCY)) {
      expect(valor, `el campo «${campo}» está vacío`).not.toBe('')
      expect(valor.trim(), `el campo «${campo}» solo tiene espacios`).not.toBe(
        '',
      )
    }
  })

  it('usa un dominio reservado para ejemplos en el correo y en la web', () => {
    /*
     * `.example` está **reservado por la RFC 2606** precisamente para esto: no
     * se puede registrar, así que ni el correo ni la web pueden ser de nadie.
     * Un `.com` inventado sí puede existir, o pasar a existir mañana.
     */
    expect(AGENCY.email.endsWith(EXAMPLE_TLD)).toBe(true)
    expect(AGENCY.website.endsWith(EXAMPLE_TLD)).toBe(true)
  })

  it('no usa ningún dominio real en el correo ni en la web', () => {
    // El control por el otro lado: no basta con que acabe en `.example`, hay
    // que comprobar que no se ha colado una extensión real por delante.
    const EXTENSIONES_REALES = ['.com', '.es', '.net', '.org', '.io', '.dev']

    for (const extension of EXTENSIONES_REALES) {
      expect(
        AGENCY.email,
        `el correo de la agencia contiene «${extension}»`,
      ).not.toContain(extension)
      expect(
        AGENCY.website,
        `la web de la agencia contiene «${extension}»`,
      ).not.toContain(extension)
    }
  })

  it('tiene un NIF que es claramente un relleno', () => {
    // Una letra y ocho o nueve ceros. No es un identificador asignado a nadie,
    // y se ve a simple vista que no lo es.
    expect(AGENCY.taxId).toMatch(/^[A-Z]0+$/)
  })

  it('tiene un teléfono que no es asignable', () => {
    // Solo ceros después del prefijo del país. Un 900 o un 6 inventados podrían
    // ser el número de alguien.
    expect(AGENCY.phone.replace(/[\s+]/g, '')).toMatch(/^340+$/)
  })

  it('se nombra como un ejemplo', () => {
    expect(AGENCY.name.toLowerCase()).toContain('ejemplo')
  })
})
