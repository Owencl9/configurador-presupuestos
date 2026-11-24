import type { Category, Service } from '../../shared/types/service'

/** Una categoría junto con los servicios que le corresponden. */
export interface CategoryGroup {
  readonly category: Category
  readonly services: readonly Service[]
}

/**
 * Agrupa los servicios por categoría, respetando el orden en que se han
 * declarado las categorías y el orden de los servicios dentro de cada una.
 *
 * Recibe los datos como parámetros en lugar de importarlos del catálogo. Eso
 * la convierte en una **función pura**: con las mismas entradas devuelve
 * siempre lo mismo y no depende de nada externo. La consecuencia práctica es
 * que se puede probar con tres servicios inventados en vez de con el catálogo
 * entero, y que editar una tarifa no rompe los tests de agrupación.
 *
 * Las categorías sin ningún servicio no aparecen en el resultado: un
 * encabezado sin nada debajo es ruido en pantalla y una sección vacía para un
 * lector de pantalla.
 */
export function groupServicesByCategory(
  services: readonly Service[],
  categories: readonly Category[],
): CategoryGroup[] {
  return categories
    .map((category) => ({
      category,
      services: services.filter((service) => service.category === category.id),
    }))
    .filter((group) => group.services.length > 0)
}
