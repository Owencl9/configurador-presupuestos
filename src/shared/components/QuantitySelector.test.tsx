import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QuantitySelector } from './QuantitySelector'

/*
 * Los límites son los de un servicio de SEO (mínimo 6 meses, tope 36). Se
 * escriben aquí y no se leen de `business-rules.ts`: este componente recibe sus
 * límites por props y no conoce ninguna regla de negocio, que es justo lo que
 * hay que poder comprobar.
 */
const MESES_SEO = {
  id: 'meses-seo',
  label: 'Meses',
  itemName: 'SEO Básico',
  unit: 'meses',
  min: 6,
  max: 36,
}

/** Un `<input type="number">` tiene el rol `spinbutton`. */
const campo = () => screen.getByRole('spinbutton')

describe('QuantitySelector', () => {
  it('muestra la etiqueta, el valor y el rango permitido', () => {
    render(<QuantitySelector {...MESES_SEO} value={12} onChange={vi.fn()} />)

    expect(campo()).toHaveValue(12)
    expect(screen.getByText('Entre 6 y 36 meses')).toBeInTheDocument()
  })

  it('da al campo un nombre accesible que identifica el servicio', () => {
    render(<QuantitySelector {...MESES_SEO} value={12} onChange={vi.fn()} />)

    // Con cinco líneas en pantalla, un campo que solo se llame «Meses» no dice
    // de qué servicio es. La etiqueta visible sigue siendo corta: el nombre del
    // servicio se añade en texto oculto, igual que en `ServiceCard`. El texto
    // visible queda contenido en el accesible (criterio WCAG 2.5.3).
    expect(campo()).toHaveAccessibleName('Meses de SEO Básico')
  })

  it('explica el rango con texto asociado al campo, no solo desactivando botones', () => {
    // Un botón en gris no dice por qué no se puede pulsar, y el color por sí
    // solo no transmite información (apartado 3 de CLAUDE.md). El rango va en
    // texto y está asociado al campo, así que un lector de pantalla lo anuncia
    // al entrar en él.
    render(<QuantitySelector {...MESES_SEO} value={6} onChange={vi.fn()} />)

    expect(campo()).toHaveAccessibleDescription('Entre 6 y 36 meses')
  })

  describe('al escribir en el campo', () => {
    it('deja escribir un número de dos cifras sin corregir la primera', async () => {
      /*
       * EL TEST DE LA FASE, pedido expresamente por el usuario.
       *
       * Con el mínimo en 6, escribir «12» pasa por un «1» intermedio que está
       * por debajo del mínimo. Si la corrección se aplicara en cada pulsación,
       * ese «1» se convertiría en un 6 y sería imposible escribir 12: el campo
       * parecería roto. La corrección se aplica al salir del campo.
       */
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={6} onChange={onChange} />)

      await user.clear(campo())
      await user.type(campo(), '12')

      // Mientras se escribe, el campo muestra lo que se escribe y no se avisa
      // de ningún cambio.
      expect(campo()).toHaveValue(12)
      expect(onChange).not.toHaveBeenCalled()

      await user.tab()

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(12)
    })

    it('sube al mínimo un valor demasiado pequeño al perder el foco', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.clear(campo())
      await user.type(campo(), '2')
      await user.tab()

      expect(onChange).toHaveBeenCalledWith(6)
    })

    it('baja al máximo un valor demasiado grande, sin volver al mínimo', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.clear(campo())
      await user.type(campo(), '500')
      await user.tab()

      expect(onChange).toHaveBeenCalledWith(36)
    })

    it('corrige al pulsar Enter, sin salir del campo', async () => {
      // Pulsar Enter es la forma natural de confirmar lo escrito, y quien lo
      // hace espera ver el resultado sin tener que salir del campo.
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.clear(campo())
      await user.type(campo(), '2{Enter}')

      expect(onChange).toHaveBeenCalledWith(6)
    })

    it('vuelve al mínimo si el campo se deja vacío', async () => {
      // Borrar el campo para escribir otro número es lo más frecuente del
      // mundo. Si se sale del campo vacío, no puede quedarse en blanco: una
      // línea sin cantidad no es un dato válido.
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.clear(campo())
      await user.tab()

      expect(onChange).toHaveBeenCalledWith(6)
    })
  })

  describe('con los botones', () => {
    it('sube de uno en uno', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.click(
        screen.getByRole('button', { name: 'Aumentar Meses de SEO Básico' }),
      )

      expect(onChange).toHaveBeenCalledWith(13)
    })

    it('baja de uno en uno', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={12} onChange={onChange} />)

      await user.click(
        screen.getByRole('button', { name: 'Reducir Meses de SEO Básico' }),
      )

      expect(onChange).toHaveBeenCalledWith(11)
    })

    it('no deja bajar por debajo del mínimo', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={6} onChange={onChange} />)

      const reducir = screen.getByRole('button', {
        name: 'Reducir Meses de SEO Básico',
      })

      expect(reducir).toBeDisabled()

      await user.click(reducir)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('no deja subir por encima del máximo', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()
      render(<QuantitySelector {...MESES_SEO} value={36} onChange={onChange} />)

      const aumentar = screen.getByRole('button', {
        name: 'Aumentar Meses de SEO Básico',
      })

      expect(aumentar).toBeDisabled()

      await user.click(aumentar)

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('sirve igual para la cantidad, con otra etiqueta y otros límites', () => {
    // El mismo componente es el «selector de cantidad o meses» del plan. Si
    // hiciera falta uno distinto para cada cosa, serían dos componentes con la
    // misma lógica de corrección y el doble de sitios donde equivocarse.
    render(
      <QuantitySelector
        id="cantidad-web"
        label="Cantidad"
        itemName="Web corporativa"
        unit="unidades"
        value={2}
        min={1}
        max={99}
        onChange={vi.fn()}
      />,
    )

    expect(campo()).toHaveAccessibleName('Cantidad de Web corporativa')
    expect(screen.getByText('Entre 1 y 99 unidades')).toBeInTheDocument()
  })
})
