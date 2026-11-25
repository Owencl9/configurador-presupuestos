import { describe, expect, it } from 'vitest'

import {
  CLIENT_EMAIL_MAX_LENGTH,
  CLIENT_NAME_MIN_LENGTH,
  CLIENT_TEXT_MAX_LENGTH,
} from '../../shared/constants/business-rules'

import { validateClientData } from './validateClientData'

/*
 * Las reglas, decididas por el usuario al autorizar la Fase 7:
 *
 * | Campo   | Obligatorio | Formato                                        |
 * | ------- | ----------- | ---------------------------------------------- |
 * | Nombre  | sí          | entre 2 y 80 caracteres, recortando espacios   |
 * | Empresa | no          | hasta 80 caracteres                            |
 * | Correo  | no          | si se escribe, tiene que parecer un correo     |
 *
 * La función devuelve **un objeto con un mensaje por campo con error**, no un
 * booleano ni una lista de textos. El motivo es de accesibilidad: cada mensaje
 * tiene que acabar asociado a su propio campo con `aria-describedby`, y para eso
 * hay que saber de qué campo es.
 */
describe('validateClientData', () => {
  describe('cuando los datos son válidos', () => {
    it('no devuelve ningún error con los tres campos rellenos', () => {
      expect(
        validateClientData({
          name: 'Ana Pérez',
          company: 'Comercial del Norte',
          email: 'ana@ejemplo.example',
        }),
      ).toEqual({})
    })

    it('no devuelve ningún error solo con el nombre', () => {
      // La empresa y el correo son opcionales: un presupuesto para un
      // particular que no quiere dar su correo es un presupuesto válido.
      expect(
        validateClientData({ name: 'Ana Pérez', company: '', email: '' }),
      ).toEqual({})
    })

    it('devuelve un objeto vacío, no indefinido', () => {
      /*
       * Quien llama hace `Object.keys(errores).length === 0` para decidir si
       * puede continuar. Si en el caso bueno devolviera `undefined`, esa
       * comprobación lanzaría justo cuando todo está bien.
       */
      const errores = validateClientData({
        name: 'Ana',
        company: '',
        email: '',
      })

      expect(errores).toBeDefined()
      expect(Object.keys(errores)).toHaveLength(0)
    })
  })

  describe('el nombre', () => {
    it('es obligatorio', () => {
      const errores = validateClientData({ name: '', company: '', email: '' })

      expect(errores.name).toMatch(/escribe el nombre/i)
    })

    it('no se puede rellenar solo con espacios', () => {
      // Se valida el valor recortado. Sin esto, tres espacios serían un nombre
      // de tres caracteres y pasarían la longitud mínima.
      expect(
        validateClientData({ name: '   ', company: '', email: '' }).name,
      ).toMatch(/escribe el nombre/i)
    })

    it('se valida recortado, así que los espacios de los lados no estorban', () => {
      expect(
        validateClientData({ name: '  Ana  ', company: '', email: '' }),
      ).toEqual({})
    })

    it(`exige al menos ${String(CLIENT_NAME_MIN_LENGTH)} caracteres`, () => {
      /*
       * El borde de la regla, que es donde se rompen. Una letra sola no es un
       * nombre; dos sí pueden serlo, y hay nombres de dos letras.
       */
      expect(
        validateClientData({ name: 'A', company: '', email: '' }).name,
      ).toMatch(/al menos/i)

      expect(
        validateClientData({ name: 'Li', company: '', email: '' }),
      ).toEqual({})
    })

    it(`no pasa de ${String(CLIENT_TEXT_MAX_LENGTH)} caracteres`, () => {
      const justo = 'a'.repeat(CLIENT_TEXT_MAX_LENGTH)
      const unoMas = 'a'.repeat(CLIENT_TEXT_MAX_LENGTH + 1)

      expect(
        validateClientData({ name: justo, company: '', email: '' }),
      ).toEqual({})
      expect(
        validateClientData({ name: unoMas, company: '', email: '' }).name,
      ).toMatch(/no puede pasar/i)
    })
  })

  describe('la empresa', () => {
    it('es opcional', () => {
      expect(
        validateClientData({ name: 'Ana', company: '', email: '' }).company,
      ).toBeUndefined()
    })

    it(`no pasa de ${String(CLIENT_TEXT_MAX_LENGTH)} caracteres`, () => {
      const unoMas = 'a'.repeat(CLIENT_TEXT_MAX_LENGTH + 1)

      expect(
        validateClientData({ name: 'Ana', company: unoMas, email: '' }).company,
      ).toMatch(/no puede pasar/i)
    })
  })

  describe('el correo', () => {
    it('es opcional', () => {
      expect(
        validateClientData({ name: 'Ana', company: '', email: '' }).email,
      ).toBeUndefined()
    })

    /*
     * Las seis direcciones usan **solo dominios reservados** —`example.com`,
     * `.org`, `.net` y el TLD `.example`, que la RFC 2606 reserva justo para
     * esto—, y no es una formalidad: el repositorio es público, y una dirección
     * de prueba sobre un dominio real es una dirección que pertenece a alguien.
     *
     * Lo que cada una demuestra, que es por lo que son seis y no una:
     * la más corta posible, el TLD reservado, un punto en el nombre, el signo
     * más de las etiquetas, un guion con subdominio, y que las mayúsculas se
     * aceptan. Si alguna vez hay que tocar esta lista, lo que no se puede
     * perder es esa variedad.
     */
    it.each([
      'a@example.com',
      'ana@ejemplo.example',
      'nombre.apellido@example.com',
      'con+etiqueta@example.org',
      'con-guion@sub.example.net',
      'MAYUSCULAS@EXAMPLE.COM',
    ])('acepta %s', (correo) => {
      expect(
        validateClientData({ name: 'Ana', company: '', email: correo }).email,
      ).toBeUndefined()
    })

    it.each([
      ['sin arroba', 'ana.ejemplo.example'],
      ['con dos arrobas', 'ana@@ejemplo.example'],
      ['con una arroba en medio del dominio', 'ana@eje@mplo.example'],
      ['con un espacio', 'ana perez@ejemplo.example'],
      ['sin dominio', 'ana@'],
      ['sin nombre', '@ejemplo.example'],
      ['sin punto en el dominio', 'ana@ejemplo'],
      ['solo una arroba', '@'],
    ])('rechaza un correo %s', (_descripcion, correo) => {
      expect(
        validateClientData({ name: 'Ana', company: '', email: correo }).email,
      ).toMatch(/correo/i)
    })

    it(`no pasa de ${String(CLIENT_EMAIL_MAX_LENGTH)} caracteres`, () => {
      // El límite viene de la norma del correo electrónico (RFC 5321), no de un
      // gusto: 254 caracteres es la longitud máxima de una dirección.
      const largo = `${'a'.repeat(CLIENT_EMAIL_MAX_LENGTH)}@ejemplo.example`

      expect(
        validateClientData({ name: 'Ana', company: '', email: largo }).email,
      ).toMatch(/no puede pasar/i)
    })
  })

  it('devuelve los errores de varios campos a la vez', () => {
    /*
     * El formulario enseña todos los errores de golpe, no uno cada vez. Pedir
     * que se corrija un campo, y al enviar descubrir que había otro mal, es la
     * forma más rápida de que alguien abandone un formulario.
     */
    const errores = validateClientData({
      name: '',
      company: 'a'.repeat(CLIENT_TEXT_MAX_LENGTH + 1),
      email: 'esto no es un correo',
    })

    expect(Object.keys(errores).sort()).toEqual(['company', 'email', 'name'])
  })

  it('no modifica el objeto que recibe', () => {
    const escrito = { name: '  Ana  ', company: '', email: '' }

    validateClientData(escrito)

    expect(escrito.name).toBe('  Ana  ')
  })
})
