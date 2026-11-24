import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Budget, PaymentBlock } from '../../shared/types/budget'
import { BudgetSummary } from './BudgetSummary'

/**
 * Atajo para escribir un bloque de pago. Se construyen a mano, sin pasar por
 * `calculateBudget`: este componente recibe un presupuesto ya calculado y lo
 * único que hace es colocarlo en pantalla, así que los tests tienen que poder
 * darle cualquier combinación, incluida una con descuento, que la Fase 4 no
 * sabe producir todavía.
 */
const bloque = (
  taxableBaseCents: number,
  igicCents: number,
  discountCents = 0,
): PaymentBlock => ({
  subtotalCents: taxableBaseCents + discountCents,
  discountCents,
  taxableBaseCents,
  igicCents,
  totalCents: taxableBaseCents + igicCents,
})

const VACIO = bloque(0, 0)

/** El ejemplo del ADR 0007, que es el que se enseña en el README. */
const PRESUPUESTO_COMPLETO: Budget = {
  oneTime: bloque(250_000, 17_500),
  monthly: bloque(25_000, 1_750),
  yearly: bloque(12_000, 840),
}

describe('BudgetSummary', () => {
  it('muestra los tres bloques de pago por separado', () => {
    render(<BudgetSummary budget={PRESUPUESTO_COMPLETO} />)

    expect(
      screen.getByRole('heading', { name: 'Pago inicial' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Cuota mensual' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Pago anual' }),
    ).toBeInTheDocument()
  })

  it('mantiene la jerarquía de encabezados sin saltos', () => {
    // El panel que lo contiene usa un h2, así que el resumen es h3 y cada
    // bloque h4. Sin saltos: un lector de pantalla puede recorrer el
    // presupuesto por su índice.
    render(<BudgetSummary budget={PRESUPUESTO_COMPLETO} />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveAccessibleName(
      'Resumen',
    )
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(3)
  })

  it('no muestra un bloque sin importe', () => {
    // Un presupuesto de solo diseño web no tiene cuota mensual. Mostrar «Cuota
    // mensual 0,00 € + IGIC 0,00 € = 0,00 €» es ruido que además parece un
    // error de cálculo.
    render(
      <BudgetSummary
        budget={{
          oneTime: bloque(120_000, 8_400),
          monthly: VACIO,
          yearly: VACIO,
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Pago inicial' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Cuota mensual' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Pago anual' }),
    ).not.toBeInTheDocument()
  })

  it('muestra base imponible, IGIC y total de cada bloque', () => {
    render(
      <BudgetSummary
        budget={{
          oneTime: bloque(250_000, 17_500),
          monthly: VACIO,
          yearly: VACIO,
        }}
      />,
    )

    expect(screen.getByText('Base imponible')).toBeInTheDocument()
    expect(screen.getByText('2.500,00 €')).toBeInTheDocument()
    expect(screen.getByText('175,00 €')).toBeInTheDocument()
    expect(screen.getByText('2.675,00 €')).toBeInTheDocument()
  })

  it('pone el sufijo a los importes de las cuotas, no solo al título', () => {
    /*
     * El detalle que distingue un presupuesto correcto de uno engañoso. Un
     * «267,50 €» suelto bajo el título «Cuota mensual» se lee mal en cuanto la
     * cifra se copia, se imprime o se lee en voz alta. Con «/mes» pegado al
     * importe, el dato no se puede separar de su unidad.
     */
    render(
      <BudgetSummary
        budget={{
          oneTime: VACIO,
          monthly: bloque(25_000, 1_750),
          yearly: VACIO,
        }}
      />,
    )

    expect(screen.getByText('267,50 €/mes')).toBeInTheDocument()
  })

  it('indica el tipo de IGIC aplicado', () => {
    render(<BudgetSummary budget={PRESUPUESTO_COMPLETO} />)

    expect(screen.getAllByText('IGIC (7 %)').length).toBeGreaterThan(0)
  })

  it('refleja otro tipo de IGIC si se le indica', () => {
    // La etiqueta no puede mentir: si el presupuesto se calculó con otro tipo,
    // el resumen tiene que decir ese y no el configurado por defecto. Por eso
    // el tipo es una prop y no una constante leída aquí dentro.
    render(
      <BudgetSummary budget={PRESUPUESTO_COMPLETO} igicRatePercent={9.5} />,
    )

    expect(screen.getAllByText('IGIC (9,5 %)').length).toBeGreaterThan(0)
  })

  describe('la fila del descuento', () => {
    it('no aparece cuando no hay descuento', () => {
      // En toda la Fase 4 el descuento vale 0: las estrategias son la Fase 6.
      render(<BudgetSummary budget={PRESUPUESTO_COMPLETO} />)

      expect(screen.queryByText('Descuento')).not.toBeInTheDocument()
      expect(screen.queryByText('Subtotal')).not.toBeInTheDocument()
    })

    it('aparece con el importe en negativo cuando hay descuento', () => {
      /*
       * Este test se escribe en la Fase 4 aunque el descuento no exista hasta
       * la Fase 6, y es a propósito: deja la pantalla terminada para cuando
       * llegue el dato. La Fase 6 implementará las estrategias y no tendrá que
       * tocar ningún componente ni volver a decidir cómo se muestra.
       *
       * Con descuento aparece el orden de cálculo completo del apartado 4.3:
       * subtotal → descuento → base imponible → IGIC → total.
       */
      render(
        <BudgetSummary
          budget={{
            oneTime: bloque(250_000, 17_500, 12_500),
            monthly: VACIO,
            yearly: VACIO,
          }}
        />,
      )

      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      expect(screen.getByText('2.625,00 €')).toBeInTheDocument() // el subtotal
      expect(screen.getByText('Descuento')).toBeInTheDocument()
      expect(screen.getByText('-125,00 €')).toBeInTheDocument()
    })
  })
})
