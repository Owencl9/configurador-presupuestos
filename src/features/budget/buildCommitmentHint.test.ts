import { describe, expect, it } from 'vitest'

import {
  COMMITMENT_DISCOUNT_MIN_MONTHS,
  COMMITMENT_DISCOUNT_PERCENT,
  MAX_MONTHS,
  MIN_QUANTITY,
} from '../../shared/constants/business-rules'
import { qualifiesForCommitmentDiscount } from '../../shared/strategies/commitmentDiscount'
import type { BudgetLine, MonthlyBudgetLine } from '../../shared/types/budget'
import type { MonthlyService } from '../../shared/types/service'
import { buildCommitmentHint } from './buildCommitmentHint'

const SEO: MonthlyService = {
  id: 'seo',
  name: 'SEO de ejemplo',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 25_000,
  payment: 'monthly',
  minMonths: 6,
}

const TIENDA: BudgetLine = {
  quantity: 1,
  service: {
    id: 'tienda',
    name: 'Tienda de ejemplo',
    description: 'Solo para los tests.',
    category: 'web-design',
    priceCents: 250_000,
    payment: 'one-time',
  },
}

const HOSTING: BudgetLine = {
  quantity: 1,
  service: {
    id: 'hosting',
    name: 'Hosting de ejemplo',
    description: 'Solo para los tests.',
    category: 'infrastructure',
    priceCents: 12_000,
    payment: 'yearly',
  },
}

function mensual(months: number): MonthlyBudgetLine {
  return { service: SEO, months, quantity: MIN_QUANTITY }
}

describe('buildCommitmentHint', () => {
  it('no da ninguna pista para una línea de pago único', () => {
    // La permanencia en meses no significa nada en un servicio que se paga una
    // vez: ni hay selector de meses, ni habría descuento que anunciar.
    expect(buildCommitmentHint(TIENDA)).toBeNull()
  })

  it('no da ninguna pista para una línea anual', () => {
    expect(buildCommitmentHint(HOSTING)).toBeNull()
  })

  it('anuncia el descuento cuando faltan meses para llegar', () => {
    const pista = buildCommitmentHint(mensual(6))

    expect(pista).toBe(
      `Desde ${COMMITMENT_DISCOUNT_MIN_MONTHS} meses: ${COMMITMENT_DISCOUNT_PERCENT} % de descuento`,
    )
  })

  it('sigue anunciándolo con un mes de menos del mínimo', () => {
    /*
     * El borde de la regla, visto desde la pantalla: con once meses la pista
     * todavía invita, con doce confirma. Es el mismo límite que el descuento, y
     * el test de abajo comprueba que no se pueden separar.
     */
    const pista = buildCommitmentHint(
      mensual(COMMITMENT_DISCOUNT_MIN_MONTHS - 1),
    )

    expect(pista).toContain(`Desde ${COMMITMENT_DISCOUNT_MIN_MONTHS} meses`)
  })

  it('confirma el descuento con los meses justos del mínimo', () => {
    expect(buildCommitmentHint(mensual(COMMITMENT_DISCOUNT_MIN_MONTHS))).toBe(
      'Descuento por permanencia aplicado',
    )
  })

  it('confirma el descuento por encima del mínimo', () => {
    expect(
      buildCommitmentHint(mensual(COMMITMENT_DISCOUNT_MIN_MONTHS + 1)),
    ).toBe('Descuento por permanencia aplicado')
  })

  it('dice lo mismo que la regla en todos los meses posibles', () => {
    /*
     * **El test que importa de verdad de este archivo.** Recorre todos los
     * meses que se pueden elegir en la aplicación y comprueba que la pista
     * confirma el descuento exactamente cuando la regla lo concede.
     *
     * Es lo que impide que la pantalla mienta. La pista y el descuento podrían
     * perfectamente escribirse con dos comparaciones distintas —una en el
     * componente y otra en la estrategia—, y entonces un cambio del mínimo de
     * meses en `business-rules.ts` dejaría a una de las dos diciendo lo
     * contrario de la otra. Las dos pasan por
     * `qualifiesForCommitmentDiscount`, y este test lo demuestra en lugar de
     * confiar en que siga siendo así.
     */
    for (let months = 1; months <= MAX_MONTHS; months++) {
      const linea = mensual(months)
      const tieneDescuento = qualifiesForCommitmentDiscount(linea)

      expect(buildCommitmentHint(linea), `con ${months} meses`).toBe(
        tieneDescuento
          ? 'Descuento por permanencia aplicado'
          : `Desde ${COMMITMENT_DISCOUNT_MIN_MONTHS} meses: ${COMMITMENT_DISCOUNT_PERCENT} % de descuento`,
      )
    }
  })
})
