import { describe, expect, it } from 'vitest'

import { EMPTY_CLIENT_DATA, normalizeClientData } from './clientData'

describe('EMPTY_CLIENT_DATA', () => {
  it('tiene los tres campos vacíos', () => {
    /*
     * Es el estado inicial del formulario. Los tres campos son cadenas vacías y
     * no `undefined` a propósito: un `<input>` controlado de React al que se le
     * pasa `undefined` como valor deja de estar controlado y avisa por consola.
     */
    expect(EMPTY_CLIENT_DATA).toEqual({ name: '', company: '', email: '' })
  })
})

describe('normalizeClientData', () => {
  it('recorta los espacios de los tres campos', () => {
    /*
     * Lo que se guarda y se imprime es el valor recortado. Un nombre escrito
     * como «  Ana Pérez  » saldría en el documento con esos espacios delante, y
     * en un documento que se envía a un cliente eso se ve.
     */
    expect(
      normalizeClientData({
        name: '  Ana Pérez  ',
        company: ' Comercial del Norte ',
        email: '  ana@ejemplo.example ',
      }),
    ).toEqual({
      name: 'Ana Pérez',
      company: 'Comercial del Norte',
      email: 'ana@ejemplo.example',
    })
  })

  it('deja vacíos los campos que solo tienen espacios', () => {
    expect(
      normalizeClientData({ name: 'Ana', company: '   ', email: '\t\n' }),
    ).toEqual({ name: 'Ana', company: '', email: '' })
  })

  it('no modifica el objeto que recibe', () => {
    const escrito = { name: ' Ana ', company: '', email: '' }

    normalizeClientData(escrito)

    expect(escrito.name).toBe(' Ana ')
  })

  it('devuelve un objeto nuevo', () => {
    const escrito = { name: 'Ana', company: '', email: '' }

    expect(normalizeClientData(escrito)).not.toBe(escrito)
  })
})
