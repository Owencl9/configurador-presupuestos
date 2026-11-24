import { afterEach, describe, expect, it, vi } from 'vitest'

import { readJson, removeKey, writeJson } from './safeLocalStorage'

const CLAVE = 'test:clave'

/*
 * Los tests de este archivo sustituyen métodos de `Storage` para hacerlos
 * fallar. Sin restaurarlos, el `localStorage` quedaría roto para los tests
 * siguientes del mismo archivo.
 */
afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * Hace que un método del almacenamiento lance una excepción, como ocurre de
 * verdad en el navegador: en navegación privada de algunos navegadores, con las
 * cookies bloqueadas, o cuando se agota la cuota del dominio.
 *
 * Es la única forma de comprobar que la aplicación aguanta sin `localStorage`.
 * Un caso que no se provoca no está probado, y este se descubriría en
 * producción el día que alguien abre una ventana de incógnito.
 */
function hacerFallar(metodo: 'getItem' | 'setItem' | 'removeItem') {
  vi.spyOn(Storage.prototype, metodo).mockImplementation(() => {
    throw new DOMException('Acceso denegado al almacenamiento', 'SecurityError')
  })
}

describe('safeLocalStorage', () => {
  describe('readJson', () => {
    it('devuelve null si la clave no existe', () => {
      expect(readJson(CLAVE)).toBeNull()
    })

    it('devuelve lo que se escribió, convertido desde JSON', () => {
      writeJson(CLAVE, { lines: [{ serviceId: 'web', quantity: 2 }] })

      expect(readJson(CLAVE)).toEqual({
        lines: [{ serviceId: 'web', quantity: 2 }],
      })
    })

    it('devuelve null si lo guardado no es JSON válido', () => {
      localStorage.setItem(CLAVE, '{"lines":')

      expect(readJson(CLAVE)).toBeNull()
    })

    it('devuelve null, sin lanzar, si el navegador no deja leer', () => {
      localStorage.setItem(CLAVE, '{"lines":[]}')
      hacerFallar('getItem')

      expect(() => readJson(CLAVE)).not.toThrow()
      expect(readJson(CLAVE)).toBeNull()
    })
  })

  describe('writeJson', () => {
    it('guarda el valor y devuelve true', () => {
      expect(writeJson(CLAVE, { lines: [] })).toBe(true)
      expect(localStorage.getItem(CLAVE)).toBe('{"lines":[]}')
    })

    it('devuelve false, sin lanzar, si el navegador no deja escribir', () => {
      hacerFallar('setItem')

      expect(() => writeJson(CLAVE, { lines: [] })).not.toThrow()
      expect(writeJson(CLAVE, { lines: [] })).toBe(false)
    })
  })

  describe('removeKey', () => {
    it('borra la clave y devuelve true', () => {
      localStorage.setItem(CLAVE, '{"lines":[]}')

      expect(removeKey(CLAVE)).toBe(true)
      expect(localStorage.getItem(CLAVE)).toBeNull()
    })

    it('devuelve false, sin lanzar, si el navegador no deja borrar', () => {
      hacerFallar('removeItem')

      expect(() => removeKey(CLAVE)).not.toThrow()
      expect(removeKey(CLAVE)).toBe(false)
    })
  })
})
