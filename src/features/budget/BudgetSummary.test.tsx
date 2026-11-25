import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type {
  AppliedDiscount,
  Budget,
  PaymentBlock,
} from '../../shared/types/budget'
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
  discounts: readonly AppliedDiscount[] = [],
): PaymentBlock => ({
  subtotalCents: taxableBaseCents + discountCents,
  discountCents,
  /*
   * Los motivos llegan en la Fase 6. Se pasan aparte del importe porque este
   * componente tiene que poder recibir un bloque con descuento y sin motivos
   * —es lo que producía la Fase 4— y comportarse bien: la fila «Descuento»
   * aparece igual, y lo que no hay es desglose.
   */
  discounts,
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

  /* ---------------------------------------------------------------------------
   * El motivo de cada descuento (Fase 6).
   *
   * Es lo que pide el apartado 4.4 del prompt maestro —«descuentos aplicados,
   * explicando el motivo de cada uno»— y el pendiente nº 18 de PROGRESO.md.
   *
   * La fila «Descuento» con el total **se conserva** y el detalle va debajo
   * (decisión del usuario al autorizar la fase). Así el desglose no cambia de
   * forma según cuántos descuentos haya, y los tests de la Fase 4 siguen
   * valiendo tal cual.
   * ------------------------------------------------------------------------ */
  describe('el motivo de cada descuento', () => {
    const PACK: AppliedDiscount = {
      id: 'pack',
      label: 'Pack de 3 servicios o más (5 %)',
      amountCents: 2_250,
    }

    const PERMANENCIA: AppliedDiscount = {
      id: 'commitment',
      label: 'Permanencia de 12 meses o más (10 %)',
      amountCents: 4_500,
    }

    /** La cuota mensual del primer ejemplo del usuario, con sus dos motivos. */
    const CUOTA_CON_DOS_DESCUENTOS: Budget = {
      oneTime: VACIO,
      monthly: bloque(38_250, 2_678, 6_750, [PACK, PERMANENCIA]),
      yearly: VACIO,
    }

    it('muestra una fila por motivo, con su importe en negativo', () => {
      render(<BudgetSummary budget={CUOTA_CON_DOS_DESCUENTOS} />)

      expect(
        screen.getByText('Pack de 3 servicios o más (5 %)'),
      ).toBeInTheDocument()
      expect(screen.getByText('-22,50 €')).toBeInTheDocument()
      expect(
        screen.getByText('Permanencia de 12 meses o más (10 %)'),
      ).toBeInTheDocument()
      expect(screen.getByText('-45,00 €')).toBeInTheDocument()
    })

    it('conserva la fila del descuento total encima del detalle', () => {
      /*
       * 22,50 € + 45,00 € = 67,50 €. La fila del total es la que permite leer
       * el desglose sin sumar de cabeza, y es la que ya existía desde la
       * Fase 4: el orden de cálculo del apartado 4.3 se sigue viendo completo.
       */
      render(<BudgetSummary budget={CUOTA_CON_DOS_DESCUENTOS} />)

      expect(screen.getByText('Descuento')).toBeInTheDocument()
      expect(screen.getByText('-67,50 €')).toBeInTheDocument()
    })

    it('no muestra ningún motivo cuando no hay descuento', () => {
      render(<BudgetSummary budget={PRESUPUESTO_COMPLETO} />)

      expect(screen.queryByText(/Pack de/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Permanencia de/)).not.toBeInTheDocument()
    })

    it('muestra la fila del descuento aunque no lleve ningún motivo', () => {
      /*
       * El caso que producía la Fase 4: un bloque con descuento y sin lista de
       * motivos. No puede ocurrir con `calculateBudget` —el importe **es** la
       * suma de los motivos—, pero este componente recibe un presupuesto ya
       * calculado y no debe quedarse en blanco por un dato incompleto: muestra
       * lo que sabe.
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

      expect(screen.getByText('Descuento')).toBeInTheDocument()
      expect(screen.getByText('-125,00 €')).toBeInTheDocument()
    })

    it('muestra el ajuste del tope sin signo, porque devuelve dinero', () => {
      /*
       * El ajuste del tope es el único descuento con importe negativo: recorta
       * lo descontado en lugar de descontar. Con la misma regla de pantalla que
       * los demás —el importe se muestra en negativo— un ajuste de −100,00 €
       * sale como «100,00 €», sin signo. Y entonces la columna suma a la vista:
       *
       *   -150,00 € + -150,00 € + 100,00 € = -200,00 €
       *
       * Con las reglas actuales esta fila no aparece nunca en producción: el
       * máximo que se junta en un bloque es el 15 %. Está probada porque el
       * código tiene que decidirlo igual.
       */
      render(
        <BudgetSummary
          budget={{
            oneTime: bloque(80_000, 5_600, 20_000, [
              {
                id: 'prueba-a',
                label: 'Descuento de prueba',
                amountCents: 15_000,
              },
              {
                id: 'cap',
                label: 'Tope del 20 % del subtotal',
                amountCents: -10_000,
              },
            ]),
            monthly: VACIO,
            yearly: VACIO,
          }}
        />,
      )

      expect(screen.getByText('Tope del 20 % del subtotal')).toBeInTheDocument()
      expect(screen.getByText('100,00 €')).toBeInTheDocument()
      expect(screen.getByText('-150,00 €')).toBeInTheDocument()
    })
  })
})
