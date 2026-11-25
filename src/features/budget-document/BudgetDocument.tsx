import { AGENCY } from '../../shared/constants/agency'
import { BUDGET_VALIDITY_DAYS } from '../../shared/constants/business-rules'
import type { BudgetLine } from '../../shared/types/budget'
import { formatEuros } from '../../shared/utils/formatEuros'
import { formatSpanishDate } from '../../shared/utils/formatSpanishDate'
import { BudgetSummary } from '../budget/BudgetSummary'
import { calculateBudget } from '../budget/calculateBudget'
import { calculateFirstPaymentCents } from '../budget/calculateFirstPaymentCents'
import type { ClientData } from '../client-form/clientData'
import { calculateValidUntil } from './budgetValidity'
import { DocumentLines } from './DocumentLines'

export interface BudgetDocumentProps {
  /** Las líneas del presupuesto. */
  readonly lines: readonly BudgetLine[]
  /** Los datos del cliente, ya validados y recortados. */
  readonly client: ClientData
  /** El número ya repartido, `PRE-2026-0001`. */
  readonly budgetNumber: string
  /** Fecha de emisión. De ella sale también la de validez. */
  readonly issueDate: Date
  /** Vuelve al configurador. */
  readonly onBack: () => void
}

const ID_TITULO = 'documento-titulo'

/**
 * El documento del presupuesto, con aspecto de presupuesto y listo para
 * imprimir o guardar en PDF (apartado 4.5 de la especificación).
 *
 * ## No calcula nada
 *
 * Todos los importes salen de `calculateBudget`, igual que en la pantalla, y el
 * desglose lo dibuja **el mismo `BudgetSummary`**. Eso no es ahorro de código:
 * es la garantía de que lo impreso y lo que se vio en pantalla son la misma
 * cifra. Un resumen propio para el documento sería una segunda implementación de
 * las mismas reglas, y dos implementaciones acaban discrepando.
 *
 * La fecha de validez la calcula `calculateValidUntil`, que tiene sus tests, y
 * la cifra del primer día, `calculateFirstPaymentCents`. Aquí no hay ni una
 * suma (pendiente nº 12 de PROGRESO.md).
 *
 * ## Las dos cifras que no están, y por qué
 *
 * - **Ningún total general.** Sumar un pago único con dos cuotas recurrentes da
 *   un importe que nadie paga ([ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md)).
 * - **Ningún compromiso total** (meses × cuota). Depende de doce meses de futuro
 *   y encima sería parcial ([ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md)).
 *
 * Los dos ADR señalan **esta fase** como su momento de riesgo, porque una hoja
 * con huecos invita a rellenarlos. Hay tests negativos que lo vigilan, así que
 * la decisión no depende de que alguien recuerde haberla leído.
 *
 * Lo que **sí** se imprime es la línea «A pagar el primer día (orientativo)»,
 * decisión del usuario al autorizar la fase, con la etiqueta idéntica a la de la
 * pantalla y con la frase que dice qué incluye pegada debajo. El ADR 0008 lo
 * exige así: suelta, esa cifra vuelve a parecer el total que no es.
 */
export function BudgetDocument({
  lines,
  client,
  budgetNumber,
  issueDate,
  onBack,
}: BudgetDocumentProps) {
  const budget = calculateBudget(lines)
  const primerPagoCents = calculateFirstPaymentCents(budget)
  const validez = calculateValidUntil(issueDate)

  /** Las filas del cliente que tienen contenido. Una fila vacía parece un dato perdido. */
  const filasCliente = [
    { etiqueta: 'Empresa', valor: client.company },
    { etiqueta: 'Correo', valor: client.email },
  ].filter(({ valor }) => valor !== '')

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0">
      {/* Los dos botones, en la única parte de la pantalla que no se imprime.
          La clase `no-print` la oculta el CSS de impresión de `index.css`, y hay
          un test que comprueba que está puesta. */}
      <div className="no-print mx-auto mb-6 flex max-w-3xl flex-wrap gap-3 px-4">
        <button
          type="button"
          onClick={() => {
            window.print()
          }}
          className="rounded-md bg-slate-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Imprimir o guardar en PDF
        </button>

        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Volver al configurador
        </button>
      </div>

      <article
        aria-labelledby={ID_TITULO}
        className="mx-auto max-w-3xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none"
      >
        {/* La cabecera no se parte entre dos páginas: los datos de quien emite
            el presupuesto y el número van juntos o no significan lo mismo. */}
        <header className="flex break-inside-avoid flex-col gap-6 border-b border-slate-300 pb-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {AGENCY.name}
            </p>
            <p className="text-sm text-slate-600">NIF {AGENCY.taxId}</p>
            <p className="text-sm text-slate-600">{AGENCY.street}</p>
            <p className="text-sm text-slate-600">{AGENCY.city}</p>
            <p className="text-sm text-slate-600">{AGENCY.phone}</p>
            <p className="text-sm text-slate-600">{AGENCY.email}</p>
            <p className="text-sm text-slate-600">{AGENCY.website}</p>
          </div>

          <div className="sm:text-right">
            <h1 id={ID_TITULO} className="text-2xl font-bold text-slate-900">
              Presupuesto {budgetNumber}
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Fecha de emisión: {formatSpanishDate(issueDate)}
            </p>
            <p className="text-sm text-slate-700">
              Válido {BUDGET_VALIDITY_DAYS} días, hasta el{' '}
              {formatSpanishDate(validez)}
            </p>

            {/* La nota de la numeración, decisión del usuario: se ve en
                pantalla y **no se imprime**. Va pegada al número porque es ahí
                donde hace falta: un `PRE-2026-0001` parece de una serie de
                empresa, y sin servidor (ADR 0002) cada navegador lleva la suya.
                El ADR 0012 lo razona y el README lo repite. */}
            <p className="no-print mt-2 text-xs text-slate-500">
              La numeración se lleva en este navegador, así que otro equipo
              puede emitir el mismo número.
            </p>
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Cliente
          </h2>
          <p className="mt-2 font-medium text-slate-900">{client.name}</p>
          {filasCliente.map(({ etiqueta, valor }) => (
            <p key={etiqueta} className="text-sm text-slate-700">
              {valor}
            </p>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Servicios
          </h2>
          <div className="mt-3">
            <DocumentLines lines={lines} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Importes
          </h2>

          <div className="mt-3">
            {/* El mismo componente que la pantalla, con el mismo presupuesto:
                lo impreso no puede discrepar de lo que se vio. Trae su propio
                h3 «Resumen» y un h4 por bloque, así que la jerarquía del
                documento queda h1 → h2 → h3 → h4, sin saltos. */}
            <BudgetSummary budget={budget} />
          </div>

          {/* La línea del primer día, con su etiqueta exacta y la explicación
              pegada debajo, como exige el ADR 0008. */}
          <div className="mt-6 break-inside-avoid rounded-lg bg-slate-100 p-4 print:border print:border-slate-300">
            <p className="flex flex-wrap justify-between gap-2 font-semibold text-slate-900">
              <span>A pagar el primer día (orientativo)</span>
              <span className="tabular-nums">
                {formatEuros(primerPagoCents)}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Incluye el pago inicial, la primera cuota mensual y el primer pago
              anual, cada uno con su IGIC. No incluye las cuotas siguientes.
            </p>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-300 pt-4 text-xs text-slate-500">
          <p>
            Documento de ejemplo. Los importes y los datos de la agencia son
            ficticios.
          </p>
        </footer>
      </article>
    </div>
  )
}
