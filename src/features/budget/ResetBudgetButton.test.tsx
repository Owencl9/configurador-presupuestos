import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ResetBudgetButton } from './ResetBudgetButton'

/** El botón que abre la confirmación. */
const botonEmpezar = () =>
  screen.getByRole('button', { name: 'Empezar de nuevo' })

/** El aviso de confirmación, buscado por su nombre accesible. */
const aviso = () => screen.getByRole('group', { name: /Seguro que quieres/ })

const botonConfirmar = () =>
  screen.getByRole('button', { name: 'Sí, borrar el presupuesto' })

const botonCancelar = () => screen.getByRole('button', { name: 'Cancelar' })

describe('ResetBudgetButton', () => {
  it('no muestra nada si el presupuesto está vacío', () => {
    const { container } = render(
      <ResetBudgetButton hasLines={false} onReset={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el botón si hay líneas en el presupuesto', () => {
    render(<ResetBudgetButton hasLines onReset={vi.fn()} />)

    expect(botonEmpezar()).toBeInTheDocument()
  })

  describe('la confirmación en dos pasos', () => {
    it('al pulsar el botón pregunta y todavía no borra nada', async () => {
      const user = userEvent.setup()
      const onReset = vi.fn()
      render(<ResetBudgetButton hasLines onReset={onReset} />)

      await user.click(botonEmpezar())

      expect(aviso()).toBeInTheDocument()
      expect(botonConfirmar()).toBeInTheDocument()
      expect(botonCancelar()).toBeInTheDocument()
      // Lo importante de los dos pasos: el primero no destruye nada.
      expect(onReset).not.toHaveBeenCalled()
    })

    it('el aviso dice qué se pierde, no solo que hay que confirmar', async () => {
      const user = userEvent.setup()
      render(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      await user.click(botonEmpezar())

      // «¿Seguro?» a secas obliga a adivinar qué pasa al contestar. La acción
      // no se puede deshacer, así que el aviso dice qué se pierde.
      expect(
        screen.getByText(/Se perderán los servicios añadidos/),
      ).toBeInTheDocument()
    })

    it('cancelar cierra el aviso y no borra nada', async () => {
      const user = userEvent.setup()
      const onReset = vi.fn()
      render(<ResetBudgetButton hasLines onReset={onReset} />)

      await user.click(botonEmpezar())
      await user.click(botonCancelar())

      expect(
        screen.queryByRole('group', { name: /Seguro que quieres/ }),
      ).not.toBeInTheDocument()
      expect(botonEmpezar()).toBeInTheDocument()
      expect(onReset).not.toHaveBeenCalled()
    })

    it('confirmar borra el presupuesto una sola vez', async () => {
      const user = userEvent.setup()
      const onReset = vi.fn()
      render(<ResetBudgetButton hasLines onReset={onReset} />)

      await user.click(botonEmpezar())
      await user.click(botonConfirmar())

      expect(onReset).toHaveBeenCalledTimes(1)
    })

    it('se abre con el teclado', async () => {
      const user = userEvent.setup()
      render(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      await user.tab()
      expect(botonEmpezar()).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(aviso()).toBeInTheDocument()
    })
  })

  describe('el foco', () => {
    it('va al aviso al abrirlo', async () => {
      const user = userEvent.setup()
      render(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      await user.click(botonEmpezar())

      /*
       * El foco va al aviso y no al primer botón del aviso, y menos al de
       * borrar: con el foco en «Sí, borrar el presupuesto», un Enter de más
       * —el mismo con el que se ha abierto— borraría el presupuesto sin que
       * nadie haya leído la pregunta.
       *
       * El aviso tiene nombre accesible, así que al recibir el foco un lector
       * de pantalla lee la pregunta completa.
       */
      expect(aviso()).toHaveFocus()
    })

    it('vuelve al botón al cancelar', async () => {
      const user = userEvent.setup()
      render(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      await user.click(botonEmpezar())
      await user.click(botonCancelar())

      // Sin esto, el foco se quedaría en el cuerpo del documento al
      // desaparecer el aviso, y quien navega con el teclado tendría que
      // recorrer la página otra vez desde el principio.
      expect(botonEmpezar()).toHaveFocus()
    })

    it('va al mensaje de confirmación tras borrar', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ResetBudgetButton hasLines onReset={vi.fn()} />,
      )

      await user.click(botonEmpezar())
      await user.click(botonConfirmar())

      // El presupuesto se ha quedado vacío, así que el componente recibe
      // `hasLines={false}`: es lo que hace el proveedor en la aplicación.
      rerender(<ResetBudgetButton hasLines={false} onReset={vi.fn()} />)

      const mensaje = screen.getByText(/Se ha borrado el presupuesto/)

      expect(mensaje).toBeInTheDocument()
      expect(mensaje).toHaveFocus()
    })
  })

  describe('vuelta a empezar', () => {
    it('el mensaje desaparece y vuelve el botón al añadir un servicio', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ResetBudgetButton hasLines onReset={vi.fn()} />,
      )

      await user.click(botonEmpezar())
      await user.click(botonConfirmar())
      rerender(<ResetBudgetButton hasLines={false} onReset={vi.fn()} />)
      rerender(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      expect(
        screen.queryByText(/Se ha borrado el presupuesto/),
      ).not.toBeInTheDocument()
      expect(botonEmpezar()).toBeInTheDocument()
    })

    it('el aviso abierto se cierra si el presupuesto se vacía por otra vía', async () => {
      /*
       * El caso: se abre el aviso y, sin contestarlo, se quita la última línea
       * con el botón de la propia línea. Si el aviso no se cerrara, volvería a
       * aparecer al añadir el siguiente servicio, preguntando por una
       * confirmación que nadie ha pedido.
       */
      const user = userEvent.setup()
      const { rerender } = render(
        <ResetBudgetButton hasLines onReset={vi.fn()} />,
      )

      await user.click(botonEmpezar())
      rerender(<ResetBudgetButton hasLines={false} onReset={vi.fn()} />)
      rerender(<ResetBudgetButton hasLines onReset={vi.fn()} />)

      expect(
        screen.queryByRole('group', { name: /Seguro que quieres/ }),
      ).not.toBeInTheDocument()
      expect(botonEmpezar()).toBeInTheDocument()
    })

    it('no muestra el mensaje de borrado si nunca se confirmó nada', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ResetBudgetButton hasLines onReset={vi.fn()} />,
      )

      await user.click(botonEmpezar())
      await user.click(botonCancelar())
      rerender(<ResetBudgetButton hasLines={false} onReset={vi.fn()} />)

      expect(
        screen.queryByText(/Se ha borrado el presupuesto/),
      ).not.toBeInTheDocument()
    })
  })
})
