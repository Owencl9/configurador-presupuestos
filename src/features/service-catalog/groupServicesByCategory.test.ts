import { describe, expect, it } from 'vitest'

import { CATEGORIES, SERVICES } from '../../shared/data/services'
import type { Category, Service } from '../../shared/types/service'
import { groupServicesByCategory } from './groupServicesByCategory'

/*
 * Categorías y servicios de prueba, independientes del catálogo real. Así los
 * tests de agrupación no se rompen al editar una tarifa, y se puede provocar a
 * voluntad el caso de una categoría vacía, que en el catálogo real no existe.
 */
const WEB: Category = { id: 'web-design', label: 'Diseño web' }
const MARKETING: Category = { id: 'marketing', label: 'Marketing' }
const INFRAESTRUCTURA: Category = {
  id: 'infrastructure',
  label: 'Infraestructura',
}

function servicioDePrueba(id: string, category: Category['id']): Service {
  return {
    id,
    name: `Servicio ${id}`,
    description: 'Solo para los tests.',
    category,
    priceCents: 10_000,
    payment: 'one-time',
  }
}

describe('groupServicesByCategory', () => {
  it('devuelve las categorías en el orden declarado, no en el de los servicios', () => {
    // Los servicios llegan desordenados y empezando por marketing...
    const servicios = [
      servicioDePrueba('m1', 'marketing'),
      servicioDePrueba('w1', 'web-design'),
    ]

    // ...pero las categorías se declaran con «Diseño web» primero.
    const grupos = groupServicesByCategory(servicios, [WEB, MARKETING])

    // El orden de las categorías lo manda la declaración del catálogo, que es
    // una decisión editorial (del sitio web hacia la infraestructura), no el
    // orden en que aparezcan los servicios ni el alfabético.
    expect(grupos.map((grupo) => grupo.category.id)).toEqual([
      'web-design',
      'marketing',
    ])
  })

  it('coloca cada servicio en su categoría', () => {
    const servicios = [
      servicioDePrueba('w1', 'web-design'),
      servicioDePrueba('m1', 'marketing'),
      servicioDePrueba('w2', 'web-design'),
    ]

    const grupos = groupServicesByCategory(servicios, [WEB, MARKETING])

    expect(grupos[0].services.map((servicio) => servicio.id)).toEqual([
      'w1',
      'w2',
    ])
    expect(grupos[1].services.map((servicio) => servicio.id)).toEqual(['m1'])
  })

  it('conserva dentro de cada categoría el orden de la lista de servicios', () => {
    const servicios = [
      servicioDePrueba('tercero', 'web-design'),
      servicioDePrueba('primero', 'web-design'),
      servicioDePrueba('segundo', 'web-design'),
    ]

    const grupos = groupServicesByCategory(servicios, [WEB])

    // No reordena: el orden de los servicios dentro de una categoría también
    // es una decisión del archivo de datos (de menor a mayor alcance).
    expect(grupos[0].services.map((servicio) => servicio.id)).toEqual([
      'tercero',
      'primero',
      'segundo',
    ])
  })

  it('omite las categorías que no tienen ningún servicio', () => {
    const servicios = [servicioDePrueba('w1', 'web-design')]

    const grupos = groupServicesByCategory(servicios, [
      WEB,
      MARKETING,
      INFRAESTRUCTURA,
    ])

    // Una categoría vacía dejaría en pantalla un encabezado sin nada debajo,
    // que para un lector de pantalla es una sección vacía anunciada como si
    // tuviera contenido.
    expect(grupos).toHaveLength(1)
    expect(grupos[0].category.id).toBe('web-design')
  })

  it('devuelve una lista vacía si no hay servicios', () => {
    expect(groupServicesByCategory([], [WEB, MARKETING])).toEqual([])
  })

  it('no inventa categorías para un servicio cuya categoría no está declarada', () => {
    const servicios = [servicioDePrueba('w1', 'web-design')]

    // Solo se declara marketing, así que no hay ningún grupo donde colocar el
    // servicio de diseño web. Queda fuera, en lugar de crear una categoría
    // sin etiqueta o lanzar un error que dejaría la página en blanco por un
    // dato mal escrito. Quien impide ese caso es el test de integridad de
    // `services.test.ts`, que comprueba que toda categoría usada está
    // declarada. Aquí solo se fija el comportamiento por si ocurriera.
    expect(groupServicesByCategory(servicios, [MARKETING])).toEqual([])
  })

  it('reparte los doce servicios del catálogo real sin perder ninguno', () => {
    const grupos = groupServicesByCategory(SERVICES, CATEGORIES)

    const total = grupos.reduce(
      (suma, grupo) => suma + grupo.services.length,
      0,
    )

    expect(grupos).toHaveLength(4)
    expect(total).toBe(SERVICES.length)
  })
})
