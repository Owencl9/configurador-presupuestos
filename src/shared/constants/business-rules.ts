/* =============================================================================
 * REGLAS DE NEGOCIO DEL PRESUPUESTO
 * =============================================================================
 *
 * **Este es el único archivo del proyecto donde se cambian estos valores.** Lo
 * exige el apartado 4.3 del prompt maestro y el apartado 3 de CLAUDE.md: ni el
 * cálculo, ni los componentes, ni los tests de lógica repiten un porcentaje o
 * un umbral. Si un número de los de abajo aparece escrito a mano en otro
 * archivo, es un error.
 *
 * Todos los importes están **en céntimos** y todos los porcentajes son
 * **números, no factores**: el 7 % se escribe `7`, no `0.07`. Así la aritmética
 * se mantiene en enteros (ADR 0003) y el valor se lee igual que se dice.
 *
 * Los valores son los confirmados por el usuario al abrir la Fase 3. Los
 * precios de los servicios no están aquí: viven en `shared/data/services.ts`,
 * porque son datos del catálogo y no reglas.
 * ========================================================================== */

/**
 * Tipo de IGIC aplicado a la base imponible, en porcentaje.
 *
 * El IGIC es el impuesto indirecto de Canarias, el equivalente al IVA. El 7 %
 * es el tipo general. **Es configurable: cambiar este número cambia todo el
 * cálculo**, y no hay ningún otro sitio que haya que tocar.
 *
 * Admite tipos con medio punto —el 9,5 % de uno de los tipos incrementados
 * funciona exacto—, pero no décimas sueltas como un 7,1 %. El motivo está en
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md): los medios tienen
 * representación binaria exacta y las décimas no, y hay un test que vigila esta
 * condición en `business-rules.test.ts`.
 */
export const IGIC_RATE_PERCENT = 7

/* -----------------------------------------------------------------------------
 * Descuentos
 *
 * **Implementados en la Fase 6** con el patrón Strategy
 * ([ADR 0004](../../../docs/adr/0004-strategy-para-descuentos.md)): una
 * estrategia por regla en `shared/strategies/`, y un calculador que las combina
 * y aplica el tope. Cómo se combinan está en el
 * [ADR 0010](../../../docs/adr/0010-como-se-aplican-los-descuentos.md).
 *
 * Los valores están aquí desde la Fase 3, y resultó ser una buena decisión: la
 * Fase 6 implementó comportamiento sin tener que decidir además cuánto valía
 * cada cosa. **Cambiar cualquiera de estos números cambia el cálculo y los
 * textos de la pantalla a la vez**, porque los motivos que se muestran en el
 * resumen se construyen con ellos.
 * -------------------------------------------------------------------------- */

/** Servicios **distintos** que debe haber en el presupuesto para que sea un pack. */
export const PACK_DISCOUNT_MIN_SERVICES = 3

/** Descuento por pack, en porcentaje sobre el subtotal. */
export const PACK_DISCOUNT_PERCENT = 5

/** Meses de contratación a partir de los cuales hay descuento por permanencia. */
export const COMMITMENT_DISCOUNT_MIN_MONTHS = 12

/** Descuento por permanencia, en porcentaje sobre los servicios mensuales afectados. */
export const COMMITMENT_DISCOUNT_PERCENT = 10

/**
 * Importe de pago único a partir del cual hay descuento por volumen, en
 * céntimos. Son 3.000 €, y la comparación es **estrictamente mayor**: un pago
 * único de exactamente 3.000 € no lo activa.
 */
export const AMOUNT_DISCOUNT_THRESHOLD_CENTS = 300_000

/** Descuento por importe, en porcentaje sobre el pago único. */
export const AMOUNT_DISCOUNT_PERCENT = 5

/**
 * Tope del descuento total, en porcentaje.
 *
 * Los descuentos pueden acumularse, pero nunca por encima de este límite. Es la
 * última regla que aplica el calculador de la Fase 6, después de sumar las
 * estrategias.
 */
export const MAX_TOTAL_DISCOUNT_PERCENT = 20

/* -----------------------------------------------------------------------------
 * Límites de los selectores (Fase 4)
 *
 * No son reglas de precio, pero sí son reglas: deciden qué se puede escribir en
 * una línea del presupuesto. Están aquí, y no en el componente que dibuja el
 * selector, por dos razones. La primera es el apartado 4.3: un único archivo de
 * constantes. La segunda es que el tope de meses tiene que convivir con el
 * mínimo del descuento por permanencia, y las dos cosas solo se pueden mirar a
 * la vez si están en el mismo sitio. Hay un test que lo vigila.
 *
 * Desde la Fase 5 estos límites se aplicarán también a lo que se lea de
 * `localStorage`, que es la otra vía por la que puede entrar un número absurdo.
 * -------------------------------------------------------------------------- */

/**
 * Unidades mínimas de una línea del presupuesto.
 *
 * Una línea con cero unidades no es una línea con cero: es una línea que
 * habría que haber borrado. Quitar un servicio se hace con su botón.
 */
export const MIN_QUANTITY = 1

/**
 * Unidades máximas de una línea del presupuesto.
 *
 * Dos dígitos son de sobra para una agencia: nadie contrata cien webs
 * corporativas, y si alguna vez ocurre es una conversación, no un formulario.
 * El tope mantiene además la aritmética muy lejos de cualquier límite de
 * JavaScript: 99 unidades del servicio más caro del catálogo son 247.500 €.
 */
export const MAX_QUANTITY = 99

/**
 * Meses máximos de contratación de un servicio mensual.
 *
 * Tres años. Un contrato de servicios web más largo que eso no es realista en
 * este negocio y debería plantearse como un presupuesto nuevo.
 *
 * **Tiene que estar por encima de `COMMITMENT_DISCOUNT_MIN_MONTHS`.** Un tope
 * por debajo de esos 12 meses dejaría el descuento por permanencia
 * inalcanzable, sin ningún error que lo delatara: solo una regla de negocio que
 * no se cumple nunca. Hay un test de coherencia que lo comprueba.
 */
export const MAX_MONTHS = 36

/* -----------------------------------------------------------------------------
 * Validez del presupuesto (Fase 7)
 *
 * Tampoco es una regla de precio, pero decide una fecha que va impresa en un
 * documento que se envía a un cliente, así que vive aquí por el mismo motivo
 * que las demás: el apartado 4.3 exige un único archivo de constantes, y
 * cambiar la validez tiene que ser cambiar un número en un sitio.
 * -------------------------------------------------------------------------- */

/**
 * Días que un presupuesto sigue siendo válido desde su fecha de emisión.
 *
 * Treinta, como fija el apartado 4.5 de la especificación. El documento muestra
 * las dos fechas —emisión y validez— y la segunda la calcula
 * `calculateValidUntil`, que toma este valor por defecto.
 *
 * Es un **entero de días**, no un número de meses ni de milisegundos: los meses
 * no tienen todos la misma longitud y los días no tienen todos 24 horas (hay
 * cambios de horario de verano). Ver `features/budget-document/budgetValidity.ts`.
 */
export const BUDGET_VALIDITY_DAYS = 30

/* -----------------------------------------------------------------------------
 * Límites del formulario del cliente (Fase 7)
 *
 * Mismo criterio que los límites de los selectores de arriba: no son reglas de
 * precio, pero son reglas, porque deciden qué se puede escribir. Y están aquí
 * por el mismo motivo —un único archivo de constantes— y por uno más: los
 * mismos números aparecen en la validación y en el **mensaje de error** que lee
 * la persona. Leyéndolos del mismo sitio, el mensaje no puede decir «80
 * caracteres» con el límite puesto en 60.
 *
 * Qué campos son obligatorios es decisión del usuario al autorizar la fase:
 * nombre sí, empresa y correo no.
 * -------------------------------------------------------------------------- */

/**
 * Caracteres mínimos del nombre del cliente.
 *
 * Una letra sola no es un nombre. Dos sí pueden serlo —hay nombres y apellidos
 * de dos letras—, así que el mínimo no puede subir sin dejar fuera a personas
 * reales.
 */
export const CLIENT_NAME_MIN_LENGTH = 2

/**
 * Caracteres máximos del nombre y de la empresa.
 *
 * Ochenta sobran para cualquier nombre o razón social, y el tope existe por dos
 * motivos prácticos: un texto más largo rompe la maqueta del documento impreso,
 * y un campo de texto sin límite es una invitación a pegar dentro cualquier
 * cosa.
 */
export const CLIENT_TEXT_MAX_LENGTH = 80

/**
 * Caracteres máximos del correo del cliente.
 *
 * Este número no es una elección: **254 es la longitud máxima de una dirección
 * de correo** según la norma del protocolo (RFC 5321). Poner menos rechazaría
 * direcciones válidas.
 */
export const CLIENT_EMAIL_MAX_LENGTH = 254
