import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'
import { BudgetLineItem } from './BudgetLineItem'

const WEB: OneTimeService = {
  id: 'web',
  name: 'Web corporativa',
  description: 'Solo para los tests.',
  category: 'web-design',
  priceCents: 120_000, // 1.200,00 €
  payment: 'one-time',
}

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO Básico',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000, // 250,00 €/mes
  payment: 'monthly',
  minMonths: 6,
}

const HOSTING: YearlyService = {
  id: 'hosting',
  name: 'Hosting y dominio',
  description: 'Solo para los tests.',
  category: 'infrastructure',
  priceCents: 12_000, // 120,00 €/año
  payment: 'yearly',
}

/** Props de relleno, para que cada test solo escriba lo que le importa. */
const avisos = {
  onQuantityChange: vi.fn(),
  onMonthsChange: vi.fn(),
  onRemove: vi.fn(),
}

/** El campo de meses de la línea, por su nombre accesible. */
const campoDeMeses = (servicio = 'SEO Básico') =>
  screen.getByRole('spinbutton', { name: `Meses de ${servicio}` })

describe('BudgetLineItem', () => {
  it('muestra el nombre del servicio y su precio unitario con el sufijo', () => {
    /*
     * La cantidad es 2 a propósito. Con una sola unidad, el precio unitario y
     * el importe de la línea son el mismo número y el test no podría
     * distinguirlos: buscar «250,00 €/mes» encontraría dos elementos y
     * fallaría. Con dos unidades, el precio unitario sigue siendo 250,00 €/mes
     * y el importe pasa a 500,00 €/mes.
     */
    const linea: BudgetLine = { service: SEO, quantity: 2, months: 6 }
    render(<BudgetLineItem line={linea} {...avisos} />)

    expect(screen.getByText('SEO Básico')).toBeInTheDocument()
    // «250,00 €» y «250,00 €/mes» son dos presupuestos distintos, y la
    // diferencia son cuatro caracteres.
    expect(screen.getByText('250,00 €/mes')).toBeInTheDocument()
  })

  it('muestra el importe de la línea, que es el precio por la cantidad', () => {
    const linea: BudgetLine = { service: SEO, quantity: 2, months: 6 }
    render(<BudgetLineItem line={linea} {...avisos} />)

    // 2 × 250,00 €/mes. El componente no multiplica: el importe lo da
    // `calculateLineAmountCents`, que tiene sus propios tests.
    expect(screen.getByText('500,00 €/mes')).toBeInTheDocument()
  })

  it('no pone sufijo al importe de una línea de pago único', () => {
    const linea: BudgetLine = { service: WEB, quantity: 2 }
    render(<BudgetLineItem line={linea} {...avisos} />)

    expect(screen.getByText('2.400,00 €')).toBeInTheDocument()
  })

  describe('selectores', () => {
    it('ofrece un selector de cantidad en cualquier línea', () => {
      const linea: BudgetLine = { service: WEB, quantity: 1 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(
        screen.getByRole('spinbutton', {
          name: 'Cantidad de Web corporativa',
        }),
      ).toHaveValue(1)
    })

    it('ofrece un selector de meses en una línea mensual, con el mínimo del servicio', () => {
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 12 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(
        screen.getByRole('spinbutton', { name: 'Meses de SEO Básico' }),
      ).toHaveValue(12)
      // El mínimo es el del servicio (6), no un número general: el texto de
      // ayuda es la prueba de que el selector lo ha recibido.
      expect(screen.getByText('Entre 6 y 36 meses')).toBeInTheDocument()
    })

    it('no ofrece selector de meses en una línea de pago único', () => {
      // Los meses no existen en estas líneas, y el tipo no deja ni leerlos.
      const linea: BudgetLine = { service: WEB, quantity: 1 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(screen.getAllByRole('spinbutton')).toHaveLength(1)
      expect(
        screen.queryByRole('spinbutton', { name: /Meses/ }),
      ).not.toBeInTheDocument()
    })

    it('no ofrece selector de meses en una línea anual', () => {
      // Un hosting anual tampoco tiene permanencia en meses: su unidad es el
      // año y la cantidad ya expresa cuántos se contratan.
      const linea: BudgetLine = { service: HOSTING, quantity: 1 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(screen.getAllByRole('spinbutton')).toHaveLength(1)
    })
  })

  describe('avisos a quien usa el componente', () => {
    it('avisa del cambio de cantidad', async () => {
      const onQuantityChange = vi.fn()
      const user = userEvent.setup()
      const linea: BudgetLine = { service: SEO, quantity: 2, months: 6 }
      render(
        <BudgetLineItem
          line={linea}
          {...avisos}
          onQuantityChange={onQuantityChange}
        />,
      )

      await user.click(
        screen.getByRole('button', { name: 'Aumentar Cantidad de SEO Básico' }),
      )

      expect(onQuantityChange).toHaveBeenCalledWith(3)
    })

    it('avisa del cambio de meses', async () => {
      const onMonthsChange = vi.fn()
      const user = userEvent.setup()
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 6 }
      render(
        <BudgetLineItem
          line={linea}
          {...avisos}
          onMonthsChange={onMonthsChange}
        />,
      )

      await user.click(
        screen.getByRole('button', { name: 'Aumentar Meses de SEO Básico' }),
      )

      expect(onMonthsChange).toHaveBeenCalledWith(7)
    })

    it('ofrece un botón de quitar que nombra el servicio', async () => {
      const onRemove = vi.fn()
      const user = userEvent.setup()
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 6 }
      render(<BudgetLineItem line={linea} {...avisos} onRemove={onRemove} />)

      // El mismo texto que usa el catálogo cuando el servicio está marcado, y
      // a propósito: es la misma acción vista desde dos sitios.
      const boton = screen.getByRole('button', {
        name: 'Quitar SEO Básico del presupuesto',
      })

      await user.click(boton)

      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  /* ---------------------------------------------------------------------------
   * La pista del descuento por permanencia (Fase 6, pendiente nº 18).
   *
   * El usuario la pidió después de probar la Fase 5: cambiar los meses no movía
   * ningún importe y la pantalla no explicaba por qué el campo estaba ahí.
   * ------------------------------------------------------------------------ */
  describe('la pista del descuento por permanencia', () => {
    it('invita al descuento cuando faltan meses', () => {
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 6 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(
        screen.getByText('Desde 12 meses: 10 % de descuento'),
      ).toBeInTheDocument()
    })

    it('confirma el descuento cuando se cumple la permanencia', () => {
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 12 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(
        screen.getByText('Descuento por permanencia aplicado'),
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Desde 12 meses: 10 % de descuento'),
      ).not.toBeInTheDocument()
    })

    it('la asocia al campo de los meses, no al de la cantidad', () => {
      /*
       * La pista explica para qué sirven **los meses**. Colgada del campo de
       * cantidad, un lector de pantalla anunciaría el descuento por permanencia
       * al entrar en un campo que no tiene nada que ver con él.
       */
      const linea: BudgetLine = { service: SEO, quantity: 1, months: 12 }
      render(<BudgetLineItem line={linea} {...avisos} />)

      expect(campoDeMeses()).toHaveAccessibleDescription(
        'Entre 6 y 36 meses Descuento por permanencia aplicado',
      )
      expect(
        screen.getByRole('spinbutton', { name: 'Cantidad de SEO Básico' }),
      ).toHaveAccessibleDescription('Entre 1 y 99 unidades')
    })

    it('no aparece en una línea de pago único ni en una anual', () => {
      // No hay selector de meses, así que tampoco hay nada que explicar.
      const web: BudgetLine = { service: WEB, quantity: 1 }
      const { unmount } = render(<BudgetLineItem line={web} {...avisos} />)

      expect(screen.queryByText(/permanencia/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Desde 12 meses/)).not.toBeInTheDocument()

      unmount()

      const hosting: BudgetLine = { service: HOSTING, quantity: 1 }
      render(<BudgetLineItem line={hosting} {...avisos} />)

      expect(screen.queryByText(/permanencia/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Desde 12 meses/)).not.toBeInTheDocument()
    })
  })
})
