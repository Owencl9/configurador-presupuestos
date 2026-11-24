import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DRAFT_STORAGE_KEY } from '../features/budget/draftFormat'
import { saveDraftLines } from '../features/budget/draftStorage'
import type { BudgetLine } from '../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  Service,
} from '../shared/types/service'
import { BudgetProvider } from './BudgetProvider'
import { useBudget } from './BudgetContext'

afterEach(() => {
  vi.restoreAllMocks()
})

const WEB: OneTimeService = {
  id: 'web',
  name: 'Web de ejemplo',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000,
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const CATALOGO: readonly Service[] = [WEB, SEO]

const BORRADOR: readonly BudgetLine[] = [
  { service: WEB, quantity: 2 },
  { service: SEO, quantity: 1, months: 12 },
]

/**
 * Componente de prueba: lo mínimo para ver y usar todo lo que ofrece el
 * Context.
 *
 * Los componentes de verdad —`ServiceCatalog`, `BudgetPanel`— no consumen el
 * Context: siguen recibiendo props, igual que en la Fase 4. Así que hace falta
 * una sonda como esta para probar el proveedor por su cuenta, sin arrastrar
 * media aplicación a un test que solo mira el estado.
 */
function Sonda() {
  const {
    lines,
    selectedIds,
    toggleService,
    changeQuantity,
    changeMonths,
    removeService,
    reset,
  } = useBudget()

  return (
    <div>
      <p>Marcados: {selectedIds.join(',')}</p>
      <ul>
        {lines.map((linea) => (
          <li key={linea.service.id}>
            {linea.service.id} x{linea.quantity}
            {'months' in linea ? ` ${String(linea.months)} meses` : ''}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => toggleService('web')}>
        Alternar web
      </button>
      <button type="button" onClick={() => toggleService('seo')}>
        Alternar seo
      </button>
      <button type="button" onClick={() => toggleService('no-existe')}>
        Alternar inexistente
      </button>
      <button type="button" onClick={() => changeQuantity('web', 5)}>
        Cantidad 5 de web
      </button>
      <button type="button" onClick={() => changeMonths('seo', 24)}>
        Meses 24 de seo
      </button>
      <button type="button" onClick={() => removeService('web')}>
        Quitar web
      </button>
      <button type="button" onClick={reset}>
        Reiniciar
      </button>
    </div>
  )
}

/** Monta la sonda dentro del proveedor, con el catálogo de mentira. */
function montar() {
  return render(
    <BudgetProvider services={CATALOGO}>
      <Sonda />
    </BudgetProvider>,
  )
}

/** Los identificadores que hay ahora en el presupuesto, leídos de la pantalla. */
const marcados = () => screen.getByText(/^Marcados:/).textContent

function hacerFallar(metodo: 'getItem' | 'setItem' | 'removeItem') {
  vi.spyOn(Storage.prototype, metodo).mockImplementation(() => {
    throw new DOMException('Acceso denegado al almacenamiento', 'SecurityError')
  })
}

describe('BudgetProvider', () => {
  describe('al arrancar', () => {
    it('empieza con el presupuesto vacío si no hay borrador', () => {
      montar()

      expect(marcados()).toBe('Marcados: ')
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('recupera el borrador guardado', () => {
      saveDraftLines(BORRADOR)

      montar()

      expect(marcados()).toBe('Marcados: web,seo')
      expect(screen.getByText('web x2')).toBeInTheDocument()
      expect(screen.getByText('seo x1 12 meses')).toBeInTheDocument()
    })

    it('no escribe el presupuesto vacío encima del borrador antes de leerlo', () => {
      /*
       * El riesgo concreto que este test cubre (lo pidió el usuario al
       * autorizar la fase): si el borrador se leyera en un efecto posterior al
       * primer render, el estado valdría «vacío» durante ese primer render, y
       * el efecto que guarda habría borrado el borrador antes de que nadie lo
       * leyera. El presupuesto se perdería al abrir la aplicación, y el día que
       * ocurriera no habría forma de saber que alguna vez estuvo guardado.
       *
       * Lo que lo impide es que el borrador se lee **al crear el estado**, con
       * la inicialización perezosa de `useReducer`: el estado nace ya con las
       * líneas recuperadas y no existe ningún instante en que valga «vacío».
       *
       * Se compara la cadena exacta, no su contenido: así el test no solo
       * comprueba que el borrador sigue habiendo, sino que es el mismo.
       */
      saveDraftLines(BORRADOR)
      const guardadoAntes = localStorage.getItem(DRAFT_STORAGE_KEY)

      montar()

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(guardadoAntes)
      expect(screen.getByText('web x2')).toBeInTheDocument()
    })

    it('reescribe ya limpio, en el primer render, un borrador con datos de más', () => {
      /*
       * La otra cara del test anterior, y la que explica por qué el guardado
       * del primer render no solo es inofensivo, sino útil.
       *
       * Si el borrador trae basura —un precio inventado, una línea de un
       * servicio retirado, un número imposible—, `parseDraft` la descarta al
       * crear el estado, y el guardado que ocurre inmediatamente después deja
       * en el navegador la versión ya validada. **Ocurre al cargar la página,
       * sin que el usuario toque nada**: el borrador se cura solo.
       *
       * El orden es el que hace que esto sea seguro y no destructivo: primero
       * se lee (al crear el estado), después se escribe (en el efecto). Al
       * revés, lo escrito pisaría lo que aún no se había leído.
       */
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          lines: [
            {
              serviceId: 'web',
              quantity: 2,
              priceCents: 1,
              name: 'Web gratis',
            },
            { serviceId: 'servicio-retirado', quantity: 1 },
          ],
        }),
      )

      montar()

      // Sin pulsar nada: lo guardado ya es la versión limpia.
      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(
        '{"lines":[{"serviceId":"web","quantity":2}]}',
      )
      expect(screen.getByText('web x2')).toBeInTheDocument()
    })

    it('tampoco lo pierde con el doble montaje de StrictMode', () => {
      /*
       * En desarrollo, `StrictMode` monta cada componente dos veces y ejecuta
       * los efectos dos veces a propósito, para que salgan a la luz los
       * efectos que no aguantan repetirse. Es exactamente el escenario en el
       * que un guardado mal colocado destruiría el borrador, y es además el
       * modo en el que el usuario ve la aplicación al ejecutar `npm run dev`:
       * `main.tsx` envuelve la aplicación en `StrictMode`.
       */
      saveDraftLines(BORRADOR)
      const guardadoAntes = localStorage.getItem(DRAFT_STORAGE_KEY)

      // Espía sin sustituir el comportamiento: solo cuenta las lecturas.
      const lecturas = vi.spyOn(Storage.prototype, 'getItem')

      render(
        <StrictMode>
          <BudgetProvider services={CATALOGO}>
            <Sonda />
          </BudgetProvider>
        </StrictMode>,
      )

      const lecturasAlArrancar = lecturas.mock.calls.length

      /*
       * Control de que este test prueba lo que dice. La única lectura que hace
       * el arranque es la del borrador, en la inicialización del `useReducer`.
       * Más de una significa que `StrictMode` ha montado dos veces de verdad;
       * si fuera exactamente una, este test estaría en verde sin haber ejercido
       * el doble montaje, y no distinguiría «aguanta el doble montaje» de «aquí
       * no hay doble montaje».
       */
      expect(lecturasAlArrancar).toBeGreaterThan(1)

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(guardadoAntes)
      expect(screen.getByText('web x2')).toBeInTheDocument()
    })

    it('descarta un borrador dañado y arranca vacío, sin romperse', () => {
      localStorage.setItem(DRAFT_STORAGE_KEY, '{"lines":[{"serviceId":')

      expect(() => montar()).not.toThrow()
      expect(marcados()).toBe('Marcados: ')
    })
  })

  describe('las acciones', () => {
    it('añade y quita un servicio del catálogo', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))
      expect(screen.getByText('web x1')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))
      expect(screen.queryByText('web x1')).not.toBeInTheDocument()
    })

    it('añade un servicio mensual con sus meses mínimos y los cambia', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(screen.getByRole('button', { name: 'Alternar seo' }))
      expect(screen.getByText('seo x1 6 meses')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Meses 24 de seo' }))
      expect(screen.getByText('seo x1 24 meses')).toBeInTheDocument()
    })

    it('cambia la cantidad y quita por identificador', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))
      await user.click(
        screen.getByRole('button', { name: 'Cantidad 5 de web' }),
      )
      expect(screen.getByText('web x5')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Quitar web' }))
      expect(screen.queryByText(/^web/)).not.toBeInTheDocument()
    })

    it('no hace nada con un identificador que no está en el catálogo', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(
        screen.getByRole('button', { name: 'Alternar inexistente' }),
      )

      expect(marcados()).toBe('Marcados: ')
    })

    it('reiniciar vacía el presupuesto', async () => {
      const user = userEvent.setup()
      saveDraftLines(BORRADOR)
      montar()

      await user.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(marcados()).toBe('Marcados: ')
    })
  })

  describe('el borrador se mantiene al día', () => {
    it('guarda el presupuesto al añadir un servicio', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBe(
        '{"lines":[{"serviceId":"web","quantity":1}]}',
      )
    })

    it('guarda el cambio de cantidad', async () => {
      const user = userEvent.setup()
      montar()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))
      await user.click(
        screen.getByRole('button', { name: 'Cantidad 5 de web' }),
      )

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('"quantity":5')
    })

    it('borra el borrador al quedarse el presupuesto vacío', async () => {
      const user = userEvent.setup()
      saveDraftLines(BORRADOR)
      montar()

      await user.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
    })
  })

  describe('sin almacenamiento disponible', () => {
    it('la aplicación funciona igual, simplemente sin guardar', async () => {
      /*
       * Navegación privada, cookies bloqueadas o cuota agotada. El criterio de
       * la fase es que no pase nada más que no haber borradores, y la forma de
       * comprobarlo es provocar el fallo: si no se provoca, este caso se
       * descubre en producción.
       */
      hacerFallar('getItem')
      hacerFallar('setItem')
      const user = userEvent.setup()

      expect(() => montar()).not.toThrow()

      await user.click(screen.getByRole('button', { name: 'Alternar web' }))

      expect(screen.getByText('web x1')).toBeInTheDocument()
    })
  })
})

describe('useBudget', () => {
  it('avisa con un error claro si se usa fuera del proveedor', () => {
    /*
     * React escribe el error en la consola además de lanzarlo, así que se
     * silencia solo durante este test: la salida de `npm test` tiene que
     * seguir siendo legible, y un error esperado que se imprime en rojo invita
     * a pensar que algo ha fallado.
     */
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Sonda />)).toThrow(/BudgetProvider/)
  })
})
