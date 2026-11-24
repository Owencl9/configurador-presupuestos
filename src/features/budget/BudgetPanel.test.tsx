import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type { MonthlyService, OneTimeService } from '../../shared/types/service'
import { BudgetPanel } from './BudgetPanel'

const WEB: OneTimeService = {
  id: 'web',
  name: 'Web corporativa',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000, // 1.200,00 € → con IGIC, 1.284,00 €
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO Básico',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000, // 250,00 €/mes → con IGIC, 267,50 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const LINEA_WEB: BudgetLine = { service: WEB, quantity: 1 }
const LINEA_SEO: BudgetLine = { service: SEO, quantity: 1, months: 6 }

const avisos = {
  onQuantityChange: vi.fn(),
  onMonthsChange: vi.fn(),
  onRemove: vi.fn(),
}

describe('BudgetPanel', () => {
  it('es una región con nombre accesible, para poder saltar a ella', () => {
    render(<BudgetPanel lines={[LINEA_WEB]} {...avisos} />)

    expect(screen.getByRole('region')).toHaveAccessibleName('Tu presupuesto')
    expect(screen.getByRole('heading', { level: 2 })).toHaveAccessibleName(
      'Tu presupuesto',
    )
  })

  describe('con el presupuesto vacío', () => {
    it('explica que todavía no hay servicios', () => {
      render(<BudgetPanel lines={[]} {...avisos} />)

      expect(
        screen.getByText(/Todavía no has añadido ningún servicio/),
      ).toBeInTheDocument()
    })

    it('no muestra el resumen con los bloques a cero', () => {
      // Tres bloques a 0,00 € con su IGIC a 0,00 € no informan de nada y
      // parecen un error de cálculo.
      render(<BudgetPanel lines={[]} {...avisos} />)

      expect(
        screen.queryByRole('heading', { name: 'Resumen' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: 'Pago inicial' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('con líneas', () => {
    it('muestra una línea por servicio, en una lista', () => {
      render(<BudgetPanel lines={[LINEA_WEB, LINEA_SEO]} {...avisos} />)

      // Una lista real, no una pila de cajas: así un lector de pantalla
      // anuncia cuántos servicios hay y permite recorrerlos.
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
      expect(screen.getByText('Web corporativa')).toBeInTheDocument()
      expect(screen.getByText('SEO Básico')).toBeInTheDocument()
    })

    it('muestra el resumen con los bloques que tienen importe', () => {
      render(<BudgetPanel lines={[LINEA_WEB, LINEA_SEO]} {...avisos} />)

      expect(
        screen.getByRole('heading', { name: 'Resumen' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Pago inicial' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Cuota mensual' }),
      ).toBeInTheDocument()
      // No hay servicios anuales en este presupuesto.
      expect(
        screen.queryByRole('heading', { name: 'Pago anual' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('la frase de estado', () => {
    it('dice cuántos servicios hay y cuánto se paga el primer día', () => {
      /*
       * El importe sale de `calculateBudget` y `calculateFirstPaymentCents`, no
       * de este componente:
       *
       *   Pago inicial  1.200,00 € + IGIC  84,00 € = 1.284,00 €
       *   Cuota mensual   250,00 € + IGIC  17,50 € =   267,50 €
       *   El primer día                            = 1.551,50 €
       *
       * La etiqueta «orientativo» la pidió el usuario y no es un adorno: la
       * aplicación no cobra nada ni tiene medios de pago, solo calcula un
       * presupuesto.
       */
      render(<BudgetPanel lines={[LINEA_WEB, LINEA_SEO]} {...avisos} />)

      expect(
        screen.getByText(
          '2 servicios en el presupuesto. A pagar el primer día (orientativo): 1.551,50 €',
        ),
      ).toBeInTheDocument()
    })

    it('usa el singular con un solo servicio', () => {
      render(<BudgetPanel lines={[LINEA_WEB]} {...avisos} />)

      expect(
        screen.getByText(/^1 servicio en el presupuesto\./),
      ).toBeInTheDocument()
    })

    it('es la única parte que se anuncia al cambiar el presupuesto', () => {
      /*
       * Decisión del usuario: el `aria-live` va en una frase corta de estado y
       * **no** en todo el resumen. Con el resumen entero como región activa,
       * cada pulsación de un botón haría que el lector de pantalla recitara
       * las quince cifras del desglose.
       *
       * Se cuenta con `querySelectorAll` porque lo que se comprueba es
       * justamente que no haya más regiones activas, y eso no se puede
       * preguntar por rol ni por texto.
       */
      const { container } = render(
        <BudgetPanel lines={[LINEA_WEB, LINEA_SEO]} {...avisos} />,
      )

      const regionesActivas = container.querySelectorAll('[aria-live]')

      expect(regionesActivas).toHaveLength(1)
      expect(regionesActivas[0]).toHaveTextContent('A pagar el primer día')
    })

    it('existe también con el presupuesto vacío, para poder anunciar el primer cambio', () => {
      // Una región activa que aparece al mismo tiempo que su contenido no se
      // anuncia de forma fiable: tiene que estar ya en la página.
      const { container } = render(<BudgetPanel lines={[]} {...avisos} />)

      expect(container.querySelectorAll('[aria-live]')).toHaveLength(1)
    })
  })

  describe('avisos, identificando el servicio', () => {
    it('pasa el cambio de cantidad con el identificador del servicio', async () => {
      const onQuantityChange = vi.fn()
      const user = userEvent.setup()
      render(
        <BudgetPanel
          lines={[LINEA_WEB, LINEA_SEO]}
          {...avisos}
          onQuantityChange={onQuantityChange}
        />,
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Aumentar Cantidad de Web corporativa',
        }),
      )

      // Con dos líneas en pantalla, un aviso que solo dijera «2» no serviría:
      // hay que saber de qué servicio es.
      expect(onQuantityChange).toHaveBeenCalledWith('web', 2)
    })

    it('pasa el cambio de meses con el identificador del servicio', async () => {
      const onMonthsChange = vi.fn()
      const user = userEvent.setup()
      render(
        <BudgetPanel
          lines={[LINEA_WEB, LINEA_SEO]}
          {...avisos}
          onMonthsChange={onMonthsChange}
        />,
      )

      await user.click(
        screen.getByRole('button', { name: 'Aumentar Meses de SEO Básico' }),
      )

      expect(onMonthsChange).toHaveBeenCalledWith('seo', 7)
    })

    it('pasa el quitar con el identificador del servicio', async () => {
      const onRemove = vi.fn()
      const user = userEvent.setup()
      render(
        <BudgetPanel
          lines={[LINEA_WEB, LINEA_SEO]}
          {...avisos}
          onRemove={onRemove}
        />,
      )

      await user.click(
        screen.getByRole('button', {
          name: 'Quitar SEO Básico del presupuesto',
        }),
      )

      expect(onRemove).toHaveBeenCalledWith('seo')
    })
  })
})
