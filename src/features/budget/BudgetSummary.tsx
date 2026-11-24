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
 * descuento**, porque mientras valga cero dirían dos veces la misma cifra. En
 * toda la Fase 4 vale cero —las estrategias son la Fase 6—, pero la pantalla ya
 * está terminada y probada para cuando llegue el dato.
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
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

/** Una fila del desglose: concepto a la izquierda, importe a la derecha. */
function Fila({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-slate-600">{termino}</dt>
      <dd className="text-slate-900">{valor}</dd>
    </div>
  )
}
