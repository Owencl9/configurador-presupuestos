import { useState } from 'react'

import { useBudget } from './context/BudgetContext'
import { BudgetPanel } from './features/budget/BudgetPanel'
import { ResetBudgetButton } from './features/budget/ResetBudgetButton'
import { BudgetDocument } from './features/budget-document/BudgetDocument'
import { assignBudgetNumber } from './features/budget-document/budgetNumberStorage'
import { ClientForm } from './features/client-form/ClientForm'
import {
  type ClientData,
  EMPTY_CLIENT_DATA,
} from './features/client-form/clientData'
import { ServiceCatalog } from './features/service-catalog/ServiceCatalog'

export interface ConfiguratorProps {
  /**
   * De dónde sale «ahora». Por defecto, el reloj del sistema.
   *
   * Existe para que los tests puedan fijar la fecha: el documento muestra la
   * emisión y la validez, y su número lleva el año dentro. Sin esta puerta, un
   * test que comprueba `PRE-2026-0001` dejaría de pasar el 1 de enero. Es el
   * mismo recurso que el tipo de IGIC en `BudgetSummary` y las estrategias en
   * `calculateBudget`: un valor por defecto para la aplicación y una puerta
   * para los tests.
   */
  readonly now?: () => Date
}

/**
 * Lo que el presupuesto ya emitido tiene y no se puede recalcular.
 *
 * El número y la fecha van **juntos** en un solo estado porque se reparten en el
 * mismo instante y tienen que seguir estando de acuerdo: el año del número sale
 * de esa fecha. Como dos estados sueltos podrían discrepar.
 */
interface DocumentoEmitido {
  readonly number: string
  readonly issueDate: Date
}

/**
 * La pantalla del configurador y, desde la Fase 7, la del documento.
 *
 * Es el contenido que hasta la Fase 4 estaba dentro de `App`. Se separó por un
 * motivo concreto de React: **un componente no puede consumir un Context que él
 * mismo renderiza**. `App` pone el proveedor, y este componente, que está
 * dentro, es el primero que puede leerlo.
 *
 * ## Las dos vistas
 *
 * El documento **sustituye** al configurador en lugar de abrirse debajo, y eso
 * no es una decisión de maquetación: es lo que garantiza el apartado 4.5. Si el
 * catálogo y los selectores siguieran en la página, no saldrían impresos solo
 * mientras el CSS de impresión acertara a ocultarlos, y además seguirían en el
 * recorrido del teclado del documento. Lo que no existe no se puede imprimir.
 *
 * Se consigue con un estado y sin ninguna librería de rutas: no hay URL que
 * compartir —el documento depende de datos que no se guardan— así que un
 * enrutador no aportaría nada (apartado 7 de `CLAUDE.md`).
 *
 * ## Dónde vive cada cosa, y por qué importa
 *
 * | Dato                  | Dónde vive                  | Consecuencia                                                   |
 * | --------------------- | --------------------------- | -------------------------------------------------------------- |
 * | Las líneas            | el reducer del Context      | se guardan en el borrador de `localStorage`                    |
 * | Los datos del cliente | un `useState` de aquí       | **no** se guardan en ninguna parte (ADR 0013)                  |
 * | El número y la fecha  | un `useState` de aquí       | se olvidan al recargar y al empezar de nuevo                   |
 * | El contador           | `localStorage`, clave propia | sobrevive, para que el siguiente número no repita el anterior |
 *
 * La fila del cliente es la decisión nº 16 convertida en código: el efecto que
 * guarda el borrador serializa **el estado del reducer**, así que un dato que
 * vive fuera de él no puede acabar en el navegador por un descuido de una fase
 * futura. Hay un test de integración que lo comprueba sobre el contenido real
 * de `localStorage`, con control positivo.
 */
export function Configurator({
  now = () => new Date(),
}: ConfiguratorProps = {}) {
  const {
    lines,
    selectedIds,
    toggleService,
    changeQuantity,
    changeMonths,
    removeService,
    reset,
  } = useBudget()

  const [cliente, setCliente] = useState<ClientData>(EMPTY_CLIENT_DATA)
  const [documento, setDocumento] = useState<DocumentoEmitido | null>(null)
  const [viendoDocumento, setViendoDocumento] = useState(false)

  /**
   * Prepara el documento con los datos ya validados.
   *
   * El número se reparte **una sola vez**: si ya hay uno, se conserva. Volver
   * atrás, cambiar un servicio y volver a entrar es el mismo presupuesto
   * afinándose, no uno nuevo (decisión del usuario al autorizar la fase).
   */
  function prepararDocumento(datos: ClientData) {
    setCliente(datos)

    if (documento === null) {
      const issueDate = now()

      setDocumento({ number: assignBudgetNumber(issueDate), issueDate })
    }

    setViendoDocumento(true)
  }

  /**
   * Empieza de nuevo: vacía el presupuesto y **olvida el número y el cliente**.
   *
   * Lo pidió el usuario y el motivo es que lo que viene después es otro
   * presupuesto, probablemente de otra persona. El contador de `localStorage`
   * **no** se toca: si se borrara, el presupuesto siguiente repetiría el número
   * del anterior, y un número repetido es justo lo que un número de presupuesto
   * existe para evitar.
   */
  function empezarDeNuevo() {
    reset()
    setCliente(EMPTY_CLIENT_DATA)
    setDocumento(null)
  }

  if (viendoDocumento && documento !== null) {
    return (
      <BudgetDocument
        lines={lines}
        client={cliente}
        budgetNumber={documento.number}
        issueDate={documento.issueDate}
        onBack={() => {
          setViendoDocumento(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Configurador de Presupuestos
        </h1>
        <p className="mt-2 text-slate-600">
          Selecciona los servicios y obtén el presupuesto calculado
          automáticamente.
        </p>

        <div className="mt-10">
          <ServiceCatalog selectedIds={selectedIds} onToggle={toggleService} />
        </div>

        <div className="mt-12">
          <BudgetPanel
            lines={lines}
            onQuantityChange={changeQuantity}
            onMonthsChange={changeMonths}
            onRemove={removeService}
          />

          {/*
           * Fuera de `BudgetPanel` a propósito: borrar el presupuesto entero no
           * es parte del resumen, y así el panel —que tiene sus doce tests y se
           * reutiliza en el documento— no ha tenido que cambiar para que esta
           * fase añada un botón.
           */}
          <ResetBudgetButton
            hasLines={lines.length > 0}
            onReset={empezarDeNuevo}
          />
        </div>

        {/*
         * El formulario se dibuja **solo con el presupuesto lleno**, y la
         * condición está aquí y no dentro del componente por un detalle de
         * React que costó un test: un `return null` dentro del componente no lo
         * desmonta, así que sus `useState` sobreviven y el formulario del
         * presupuesto siguiente aparecería con los datos del cliente anterior.
         * No renderizarlo sí lo desmonta.
         *
         * `initialClient` se lee al montar, que es justo lo que hace falta: al
         * volver del documento, el formulario reaparece con lo último que se
         * envió en lugar de obligar a escribirlo otra vez.
         */}
        {lines.length > 0 && (
          <ClientForm initialClient={cliente} onSubmit={prepararDocumento} />
        )}
      </main>
    </div>
  )
}
