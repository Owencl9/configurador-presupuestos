import { IGIC_RATE_PERCENT } from '../../shared/constants/business-rules'
import type { Budget, PaymentBlock } from '../../shared/types/budget'
import type { PaymentType } from '../../shared/types/service'
import { buildAmountLabel } from '../../shared/utils/buildAmountLabel'
import { formatEuros } from '../../shared/utils/formatEuros'

export interface BudgetSummaryProps {
  /** El presupuesto ya calculado por `calculateBudget`. */
  budget: Budget
  /**
   * Tipo de IGIC con el que se calculó el presupuesto, solo para la etiqueta.
   *
   * Es una prop y no la constante leída aquí dentro para que la etiqueta no
   * pueda mentir: si algún día un presupuesto se calcula con otro tipo, quien
   * lo calcule pasa el mismo valor que usó. El valor por defecto es el
   * configurado, que es el que usa la aplicación.
   */
  igicRatePercent?: number
}

/** Los tres bloques, en el orden en que se presentan, con su forma de pago. */
const BLOQUES: readonly {
  readonly key: keyof Budget
  readonly title: string
  readonly payment: PaymentType
}[] = [
  { key: 'oneTime', title: 'Pago inicial', payment: 'one-time' },
  { key: 'monthly', title: 'Cuota mensual', payment: 'monthly' },
  { key: 'yearly', title: 'Pago anual', payment: 'yearly' },
]

/**
 * Resumen del presupuesto: los tres bloques de pago, cada uno con su desglose.
 *
 * **No calcula nada.** Recibe el presupuesto que ha producido `calculateBudget`
 * y muestra sus importes con `formatEuros` y `buildAmountLabel`. No hay aquí ni
 * una suma ni un porcentaje (pendiente nº 12 de PROGRESO.md).
 *
 * ## Tres bloques y ningún total general
 *
 * Es la decisión de la Fase 3, y esta pantalla es donde se nota: no hay una
 * cifra final que sume los tres, porque sumar un pago único con dos cuotas
 * recurrentes da un importe que el cliente no paga en ningún momento. Lo que se
 * paga el primer día lo dice el panel, en su frase de estado, con la etiqueta
 * «orientativo». Ver
 * [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).
 *
 * ## Qué filas se ven
 *
 * El orden de cálculo del apartado 4.3 completo: subtotal → descuento → base
 * imponible → IGIC → total. Las dos primeras filas **solo aparecen cuando hay
 * descuento**, porque mientras valga cero dirían dos veces la misma cifra.
 *
 * Desde la Fase 6, bajo la fila del descuento va **una fila por motivo**, con
 * su importe: es el apartado 4.4 del prompt maestro, que pide los descuentos
 * «explicando el motivo de cada uno». La fila del total se conserva (decisión
 * del usuario), así que el desglose tiene siempre la misma forma tanto con un
 * descuento como con dos. Con uno solo, el total y su único motivo muestran la
 * misma cifra: es el precio de que la fila «Descuento» esté siempre en su sitio
 * dentro del orden de cálculo.
 *
 * Las filas de la Fase 4 se escribieron y se probaron **una fase antes de que
 * existiera el dato**, y la apuesta salió bien: la Fase 6 no ha tenido que
 * decidir de nuevo cómo se muestra un descuento, solo añadir el detalle.
 *
 * Un bloque sin importe no se muestra: un presupuesto de solo diseño web no
 * tiene cuota mensual, y «Cuota mensual 0,00 €» es ruido que parece un error.
 *
 * Los sufijos `/mes` y `/año` van **pegados al importe**, no solo en el título
 * del bloque: un «267,50 €» suelto se lee mal en cuanto la cifra se copia, se
 * imprime o se lee en voz alta.
 */
export function BudgetSummary({
  budget,
  igicRatePercent = IGIC_RATE_PERCENT,
}: BudgetSummaryProps) {
  // El tipo se escribe a la española: 9.5 se muestra como «9,5». No es dinero,
  // así que no pasa por `formatEuros`, que exige céntimos enteros.
  const etiquetaIgic = `IGIC (${String(igicRatePercent).replace('.', ',')} %)`

  const visibles = BLOQUES.filter(({ key }) => budget[key].subtotalCents > 0)

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900">Resumen</h3>

      <div className="mt-4 flex flex-col gap-4">
        {visibles.map(({ key, title, payment }) => (
          <BloqueDePago
            key={key}
            title={title}
            payment={payment}
            block={budget[key]}
            igicLabel={etiquetaIgic}
          />
        ))}
      </div>
    </div>
  )
}

interface BloqueDePagoProps {
  title: string
  payment: PaymentType
  block: PaymentBlock
  igicLabel: string
}

/**
 * Un bloque de pago con su desglose.
 *
 * Vive en este archivo y no en el suyo porque no se usa en ningún otro sitio:
 * es una parte de este resumen, no un componente reutilizable. Si algún día lo
 * necesita otra pantalla —el documento imprimible de la Fase 7, por ejemplo—,
 * ese es el momento de sacarlo, y no antes.
 */
function BloqueDePago({ title, payment, block, igicLabel }: BloqueDePagoProps) {
  const hayDescuento = block.discountCents > 0

  /*
   * `print:break-inside-avoid` (Fase 7) solo actúa al imprimir: un bloque de
   * pago partido entre dos páginas deja el IGIC en una hoja y el total en la
   * siguiente. En pantalla no cambia nada, así que los doce tests de este
   * componente siguen en verde sin tocar ninguno.
   */
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <h4 className="font-semibold text-slate-900">{title}</h4>

      <dl className="mt-2 flex flex-col gap-1 text-sm">
        {hayDescuento && (
          <>
            <Fila termino="Subtotal" valor={formatEuros(block.subtotalCents)} />
            <Fila
              termino="Descuento"
              /* En negativo, porque es lo que resta. `formatEuros` sabe
                 escribir importes negativos desde la Fase 3, y hay tres tests
                 suyos dedicados a ello (problema P11). */
              valor={formatEuros(-block.discountCents)}
            />

            {/* El motivo de cada descuento, debajo del total (Fase 6).
                Cumple el apartado 4.4 del prompt maestro y el pendiente nº 18.

                Son pares `dt`/`dd` como las demás filas, sangrados y en letra
                más pequeña: para un lector de pantalla se leen en orden justo
                después de la fila «Descuento», así que la relación se entiende
                sin depender de la sangría, que es solo visual. */}
            {block.discounts.map(({ id, label, amountCents }, indice) => (
              <Fila
                key={`${id}-${indice}`}
                termino={label}
                /* La misma regla que la fila del total y sin ningún caso
                   especial: el importe se muestra en negativo. El ajuste del
                   tope, que es el único descuento con importe negativo porque
                   devuelve parte de lo descontado, sale por tanto **sin**
                   signo, y la columna suma a la vista. */
                valor={formatEuros(-amountCents)}
                detalle
              />
            ))}
          </>
        )}

        <Fila
          termino="Base imponible"
          valor={formatEuros(block.taxableBaseCents)}
        />
        <Fila termino={igicLabel} valor={formatEuros(block.igicCents)} />

        <div className="mt-1 flex items-baseline justify-between border-t border-slate-200 pt-2">
          <dt className="font-semibold text-slate-900">Total</dt>
          <dd className="text-lg font-bold text-slate-900">
            {buildAmountLabel(block.totalCents, payment)}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/**
 * Una fila del desglose: concepto a la izquierda, importe a la derecha.
 *
 * Con `detalle`, la fila es una de las que explican el motivo de un descuento:
 * va sangrada y en letra más pequeña, para que se lea como parte de la fila
 * anterior y no como un concepto más del desglose. La diferencia es solo
 * visual, y es a propósito: **la información no se transmite con el formato**
 * (apartado 3 de `CLAUDE.md`). Lo que explica cada fila es su propio texto
 * —«Pack de 3 servicios o más (5 %)»—, que se lee igual de bien sin ver la
 * sangría.
 */
function Fila({
  termino,
  valor,
  detalle = false,
}: {
  termino: string
  valor: string
  detalle?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${detalle ? 'pl-4 text-xs' : ''}`}
    >
      <dt className={detalle ? 'text-slate-500' : 'text-slate-600'}>
        {termino}
      </dt>
      <dd
        className={`whitespace-nowrap tabular-nums ${detalle ? 'text-slate-500' : 'text-slate-900'}`}
      >
        {valor}
      </dd>
    </div>
  )
}
