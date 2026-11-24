/**
 * Tipos del catálogo de servicios.
 *
 * Este archivo solo describe la *forma* de los datos: no contiene ni valores ni
 * lógica. En TypeScript los tipos desaparecen al compilar, así que nada de lo
 * que hay aquí llega al navegador. Su único efecto es que el compilador avise
 * durante el desarrollo.
 */

/**
 * Formas de pago posibles de un servicio (apartado 4.1 del prompt maestro).
 *
 * Es un *tipo unión*: una variable de tipo `PaymentType` solo puede contener
 * una de estas tres cadenas exactas. Escribir `'mensual'` o `'month'` es un
 * error de compilación, no un fallo que aparezca en producción.
 */
export type PaymentType = 'one-time' | 'monthly' | 'yearly'

/** Identificadores de las cuatro categorías del catálogo. */
export type CategoryId =
  'web-design' | 'marketing' | 'maintenance' | 'infrastructure'

/**
 * Una categoría del catálogo: su identificador y el texto que se muestra.
 *
 * El identificador va en inglés (es código) y la etiqueta en español (es
 * interfaz), según el apartado 2 de CLAUDE.md.
 */
export interface Category {
  readonly id: CategoryId
  /** Texto visible de la categoría, por ejemplo «Diseño web». */
  readonly label: string
}

/**
 * Lo común a todos los servicios, sea cual sea su forma de pago.
 *
 * No se exporta: nadie debe usar un servicio «a medias». Los tipos exportados
 * son los tres de abajo y su unión, `Service`.
 */
interface ServiceBase {
  /** Identificador único y estable. Se usa como clave en el presupuesto. */
  readonly id: string
  /** Nombre visible del servicio. */
  readonly name: string
  /** Descripción breve, de una o dos frases. */
  readonly description: string
  /** Categoría a la que pertenece. */
  readonly category: CategoryId
  /**
   * Precio **en céntimos**, siempre entero.
   *
   * Nunca en euros con decimales: 0,1 + 0,2 no da 0,3 en coma flotante, y un
   * presupuesto que se descuadra por un céntimo no vale nada. Ver
   * [ADR 0003](../../../docs/adr/0003-dinero-en-centimos.md).
   *
   * El significado del importe depende de la forma de pago: es el precio
   * total si es de pago único, el precio de un mes si es mensual y el de un
   * año si es anual.
   */
  readonly priceCents: number
}

/** Servicio que se paga una sola vez, por ejemplo una web corporativa. */
export interface OneTimeService extends ServiceBase {
  readonly payment: 'one-time'
}

/** Servicio con cuota mensual y un número mínimo de meses de contratación. */
export interface MonthlyService extends ServiceBase {
  readonly payment: 'monthly'
  /**
   * Meses mínimos de contratación. Entero y al menos 1.
   *
   * Solo existe en este tipo: ver la nota sobre la unión discriminada en
   * `Service`.
   */
  readonly minMonths: number
}

/** Servicio con cuota anual, por ejemplo el hosting. */
export interface YearlyService extends ServiceBase {
  readonly payment: 'yearly'
}

/**
 * Un servicio del catálogo.
 *
 * **Unión discriminada.** `Service` no es un tipo con campos opcionales, sino
 * la unión de tres tipos distintos, y el campo `payment` es el *discriminante*
 * que indica cuál de los tres es. Esto tiene dos consecuencias prácticas:
 *
 * 1. **Los datos sin sentido no compilan.** `minMonths` solo existe en
 *    `MonthlyService`, así que declarar un hosting anual con meses mínimos es
 *    un error del compilador, no un dato raro que alguien descubre más tarde.
 *    Hay un test de ese comportamiento en `../data/services.test.ts`.
 *
 * 2. **Obliga a comprobar antes de leer.** Para usar `service.minMonths` hay
 *    que haber comprobado primero que `service.payment === 'monthly'`. Dentro
 *    de ese `if`, TypeScript sabe que el servicio es mensual y da acceso al
 *    campo; fuera, no deja ni mencionarlo. En las fases 3 a 6, donde hay que
 *    separar pago inicial, cuota mensual y pagos anuales, esa comprobación
 *    deja de ser una precaución y pasa a estar garantizada.
 *
 * La alternativa era un único tipo con `minMonths?: number` opcional. Es más
 * corta de escribir, pero permite representar datos imposibles. Ver
 * [ADR 0006](../../../docs/adr/0006-niveles-como-servicios-independientes.md).
 */
export type Service = OneTimeService | MonthlyService | YearlyService
