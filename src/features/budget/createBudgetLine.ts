import type { BudgetLine } from '../../shared/types/budget'
import type { Service } from '../../shared/types/service'

/**
 * Unidades con las que nace una línea del presupuesto.
 *
 * Es un literal y no una constante de negocio: «una unidad» no es una regla
 * configurable del apartado 4.3, es el significado de añadir algo. El mínimo
 * de la cantidad sí es una regla, y lo aplica `normalizeNumber`.
 */
const UNIDADES_INICIALES = 1

/**
 * Construye la línea de presupuesto de un servicio recién añadido.
 *
 * **Es el único sitio del proyecto que decide con qué valores nace una línea.**
 * Si el valor inicial de los meses se escribiera en el componente que añade el
 * servicio, habría que repetirlo en la Fase 5 al recuperar un borrador y en la
 * Fase 7 al duplicar un presupuesto, y los tres sitios podrían no coincidir.
 *
 * Los meses iniciales son los **mínimos del propio servicio**, no un número
 * fijo: cada servicio mensual tiene su `minMonths` (6 en los de SEO, 3 en los
 * de mantenimiento), y una línea que naciera con menos meses de los que admite
 * su servicio sería inválida desde el primer instante.
 *
 * Función pura: no modifica el servicio que recibe y lo guarda tal cual, sin
 * copiarlo, para que la línea y el catálogo no puedan discrepar.
 */
export function createBudgetLine(service: Service): BudgetLine {
  /*
   * `switch` sobre el discriminante, con las tres formas de pago enumeradas, y
   * no un `if` para el caso mensual y un `return` para «los demás». No es
   * estilo: TypeScript **rechaza** la versión corta.
   *
   * El motivo es que un objeto cuyo campo es una unión no encaja en una unión
   * de objetos. Con `service` reducido a `OneTimeService | YearlyService`,
   * `{ service, quantity }` no es asignable a
   * `OneTimeBudgetLine | YearlyBudgetLine`, porque el compilador no puede saber
   * cuál de los dos tipos de línea está construyendo. Hay que estrechar hasta
   * **una** forma de pago, y entonces cada rama construye un tipo concreto.
   *
   * De paso se gana la misma garantía que en `calculateSubtotals`: si algún día
   * se añadiera una cuarta forma de pago a `PaymentType`, la rama por defecto
   * dejaría de compilar y el error aparecería aquí, donde hay que decidir con
   * qué valores nace esa línea.
   */
  switch (service.payment) {
    case 'monthly':
      return {
        service,
        quantity: UNIDADES_INICIALES,
        months: service.minMonths,
      }
    case 'one-time':
      return { service, quantity: UNIDADES_INICIALES }
    case 'yearly':
      return { service, quantity: UNIDADES_INICIALES }
    default: {
      const formaDePagoNoCubierta: never = service
      throw new Error(
        `Forma de pago no contemplada: ${JSON.stringify(formaDePagoNoCubierta)}`,
      )
    }
  }
}
