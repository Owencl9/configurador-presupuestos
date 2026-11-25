import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AGENCY } from '../../shared/constants/agency'
import type { BudgetLine } from '../../shared/types/budget'
import type {
  MonthlyService,
  OneTimeService,
  YearlyService,
} from '../../shared/types/service'

import { BudgetDocument } from './BudgetDocument'

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
  name: 'SEO Profesional',
  description: 'Solo para los tests.',
  category: 'marketing',
  priceCents: 45_000, // 450,00 €/mes
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

/*
 * Tres servicios distintos y el SEO a doce meses, así que el presupuesto lleva
 * **los dos descuentos**: pack (3 servicios, 5 % en los tres bloques) y
 * permanencia (10 % de la cuota mensual).
 *
 * Las cifras esperadas están calculadas a mano, en céntimos:
 *
 * | Bloque        | Subtotal | Descuentos           | Base    | IGIC 7 %       | Total   |
 * | ------------- | -------- | -------------------- | ------- | -------------- | ------- |
 * | Pago inicial  | 120.000  | 6.000 (pack)         | 114.000 | 7.980          | 121.980 |
 * | Cuota mensual |  45.000  | 6.750 (pack + perm.) |  38.250 | 2.677,5 → 2.678 | 40.928 |
 * | Pago anual    |  12.000  | 600 (pack)           |  11.400 | 798            |  12.198 |
 *
 * A pagar el primer día: 121.980 + 40.928 + 12.198 = **175.106** → 1.751,06 €.
 *
 * La cuota mensual y el pago anual coinciden con el ejemplo 1 que el usuario
 * calculó a mano en la Fase 6 (409,28 €/mes y 121,98 €/año), porque la parte
 * mensual y anual del presupuesto es la misma.
 */
const LINEAS: readonly BudgetLine[] = [
  { service: WEB, quantity: 1 },
  { service: SEO, quantity: 1, months: 12 },
  { service: HOSTING, quantity: 1 },
]

const CLIENTE = {
  name: 'Ana Pérez',
  company: 'Comercial del Norte',
  email: 'ana@ejemplo.example',
}

/** Fecha fija, nunca `new Date()`: el documento muestra dos fechas. */
const EMISION = new Date(2026, 10, 25)

/** Convierte un texto en una expresión regular que lo busca literalmente. */
function comoRegExp(valor: string): RegExp {
  return new RegExp(valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

function dibujarDocumento(extra: Record<string, unknown> = {}) {
  return render(
    <BudgetDocument
      lines={LINEAS}
      client={CLIENTE}
      budgetNumber="PRE-2026-0001"
      issueDate={EMISION}
      onBack={vi.fn()}
      {...extra}
    />,
  )
}

describe('BudgetDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('la cabecera', () => {
    it('lleva el número del presupuesto en el encabezado principal', () => {
      dibujarDocumento()

      expect(
        screen.getByRole('heading', { level: 1, name: /PRE-2026-0001/ }),
      ).toBeInTheDocument()
    })

    it('muestra los siete datos de la agencia', () => {
      /*
       * Los siete salen del archivo de constantes y se comprueban **leyéndolos
       * de ahí**, no repitiéndolos escritos a mano. Así, el día que alguien
       * sustituya los datos ficticios por los reales, este test sigue valiendo
       * en lugar de fallar por el motivo equivocado.
       */
      dibujarDocumento()

      for (const valor of Object.values(AGENCY)) {
        /*
         * La búsqueda es por expresión regular y no por texto exacto porque el
         * NIF va precedido de su etiqueta en el mismo párrafo («NIF
         * B00000000»), y un texto exacto exige que el elemento **entero** sea
         * ese valor. Los valores llevan puntos, comas y un `+`, así que hay que
         * escaparlos antes de convertirlos en expresión.
         */
        expect(screen.getByText(comoRegExp(valor))).toBeInTheDocument()
      }
    })

    it('muestra la fecha de emisión y la de validez, a 30 días', () => {
      dibujarDocumento()

      expect(screen.getByText(/25\/11\/2026/)).toBeInTheDocument()
      expect(screen.getByText(/25\/12\/2026/)).toBeInTheDocument()
    })

    it('dice cuántos días vale el presupuesto, además de la fecha', () => {
      // La fecha sola obliga a contar los días. El número y la fecha juntos no
      // se pueden malinterpretar.
      dibujarDocumento()

      expect(screen.getByText(/30 días/)).toBeInTheDocument()
    })
  })

  describe('los datos del cliente', () => {
    it('muestra el nombre, la empresa y el correo', () => {
      dibujarDocumento()

      expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
      expect(screen.getByText('Comercial del Norte')).toBeInTheDocument()
      expect(screen.getByText('ana@ejemplo.example')).toBeInTheDocument()
    })

    it('no deja filas vacías con los campos opcionales sin rellenar', () => {
      /*
       * Un documento con «Empresa:» y nada detrás parece que falta algo o que la
       * aplicación ha perdido un dato. Si el campo está vacío, la fila no existe.
       */
      dibujarDocumento({
        client: { name: 'Ana Pérez', company: '', email: '' },
      })

      expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
      expect(screen.queryByText(/empresa/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/correo/i)).not.toBeInTheDocument()
    })
  })

  describe('los importes', () => {
    it('muestra los servicios con sus importes', () => {
      dibujarDocumento()

      expect(screen.getByText('SEO Profesional')).toBeInTheDocument()
      expect(screen.getByText('450,00 €/mes')).toBeInTheDocument()
    })

    it('muestra el desglose de los tres bloques de pago', () => {
      // Las cifras de la tabla de arriba, calculadas a mano.
      dibujarDocumento()

      expect(screen.getByText('1.219,80 €')).toBeInTheDocument()
      expect(screen.getByText('409,28 €/mes')).toBeInTheDocument()
      expect(screen.getByText('121,98 €/año')).toBeInTheDocument()
    })

    it('muestra el motivo de cada descuento', () => {
      /*
       * Es el apartado 4.4 del prompt maestro —los descuentos «explicando el
       * motivo de cada uno»— en el sitio donde más falta hace: el cliente lee el
       * documento sin nadie al lado que se lo explique.
       */
      dibujarDocumento()

      expect(
        screen.getAllByText(/Pack de 3 servicios o más/).length,
      ).toBeGreaterThan(0)
      expect(
        screen.getAllByText(/Permanencia de 12 meses o más/).length,
      ).toBeGreaterThan(0)
    })

    it('muestra la línea del primer día con su etiqueta exacta', () => {
      /*
       * **Guardián del [ADR 0008](../../../docs/adr/0008-el-primer-pago-es-presentacion.md).**
       * La etiqueta «(orientativo)» es parte de la decisión, no un detalle de
       * estilo: la aplicación no cobra nada. Decisión del usuario al autorizar
       * la fase: la línea **sí** se imprime, con la etiqueta idéntica a la de la
       * pantalla.
       */
      dibujarDocumento()

      expect(
        screen.getByText(/A pagar el primer día \(orientativo\)/),
      ).toBeInTheDocument()
      expect(screen.getByText('1.751,06 €')).toBeInTheDocument()
    })

    it('explica qué incluye el primer día, pegado a la cifra', () => {
      /*
       * El ADR 0008 lo exige: «La etiqueta "orientativo" y el detalle de qué
       * incluye tienen que viajar con la cifra: suelta, vuelve a parecer un
       * total.» En la pantalla hay contexto alrededor; en una hoja impresa que
       * se reenvía por correo, no.
       */
      dibujarDocumento()

      expect(
        screen.getByText(
          /pago inicial.*primera cuota mensual.*primer pago anual/i,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('las cifras que el documento no muestra', () => {
    it('no muestra ningún total general del presupuesto', () => {
      /*
       * **Guardián del [ADR 0007](../../../docs/adr/0007-redondeo-del-igic.md).**
       * No hay una cifra que sume los tres bloques, porque sumar un pago único
       * con dos cuotas recurrentes da un importe que el cliente no paga en
       * ningún momento.
       *
       * Se comprueban las **etiquetas** y no un importe: la suma de los tres
       * totales es, aritméticamente, la misma cifra que el primer día, y esa sí
       * está —con su etiqueta y su explicación—. Lo que no puede aparecer es
       * algo llamado «total» a secas.
       */
      dibujarDocumento()

      expect(screen.queryByText(/total general/i)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/total del presupuesto/i),
      ).not.toBeInTheDocument()

      /*
       * Y el control que hace fuerte al test: hay **exactamente tres** filas
       * llamadas «Total», una dentro de cada bloque de pago. Cada una es el
       * total de su bloque y está etiquetada dentro de él.
       *
       * Afirmar que no hay ninguna sería falso —las tres son legítimas, y la
       * primera versión de este test falló por eso—. Contarlas es mejor que no
       * mirarlas: el día que alguien añada una cuarta fila «Total» fuera de los
       * bloques, que es exactamente la forma que tendría el total general
       * prohibido, este test se pone en rojo.
       */
      expect(screen.getAllByText(/^Total$/)).toHaveLength(3)
    })

    it('no muestra el compromiso total de los servicios mensuales', () => {
      /*
       * **Guardián del [ADR 0011](../../../docs/adr/0011-sin-compromiso-total.md).**
       * Las dos formas de calcularlo están descartadas: 450,00 € × 12 meses
       * (5.400,00 €) y la cuota ya rebajada × 12 (4.911,36 €, que es justo la
       * cifra que cita el ADR).
       */
      dibujarDocumento()

      expect(screen.queryByText(/5\.400,00/)).not.toBeInTheDocument()
      expect(screen.queryByText(/4\.911,36/)).not.toBeInTheDocument()
    })

    it('avisa en pantalla de que cada navegador lleva su propia numeración', () => {
      /*
       * Decisión del usuario al autorizar la fase: el aviso va en el ADR 0012,
       * en el README y en **una nota pequeña en pantalla junto al número**. Sin
       * él, un número que parece de una serie de empresa es engañoso: no hay
       * servidor, así que otro equipo puede emitir el mismo `PRE-2026-0001`
       * (ADR 0002).
       */
      dibujarDocumento()

      expect(screen.getByText(/navegador/i)).toBeInTheDocument()
    })

    it('no imprime ese aviso', () => {
      /*
       * Y no sale impreso, que es la otra mitad de la decisión: un cliente no
       * tiene por qué leer que su número de presupuesto puede estar repetido.
       * Lo que lo garantiza es la clase que oculta el CSS de impresión, igual
       * que en los dos botones.
       */
      dibujarDocumento()

      expect(screen.getByText(/navegador/i)).toHaveClass('no-print')
    })
  })

  describe('el pie', () => {
    it('avisa de que es un documento de ejemplo con datos ficticios', () => {
      dibujarDocumento()

      expect(
        screen.getByText(
          /Documento de ejemplo\. Los importes y los datos de la agencia son ficticios\./,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('los botones', () => {
    it('imprime al pulsar el botón de imprimir', () => {
      /*
       * `window.print` no está implementado en jsdom: hay que sustituirlo, y de
       * paso así se comprueba que se llama **una sola vez**. Lo que no se puede
       * comprobar con un test es el aspecto de la hoja impresa, porque jsdom no
       * aplica `@media print`. Eso se mira con Ctrl+P en el navegador y, en la
       * Fase 8, emulando el medio de impresión con Playwright.
       */
      const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
      dibujarDocumento()

      screen.getByRole('button', { name: /imprimir o guardar en PDF/i }).click()

      expect(imprimir).toHaveBeenCalledTimes(1)
    })

    it('vuelve al configurador al pulsar el botón de volver', async () => {
      const onBack = vi.fn()
      dibujarDocumento({ onBack })

      await userEvent.click(
        screen.getByRole('button', { name: /volver al configurador/i }),
      )

      expect(onBack).toHaveBeenCalledTimes(1)
    })

    it('marca los dos botones para que no salgan impresos', () => {
      /*
       * Los botones no se esconden solo con CSS de impresión escrito en otro
       * archivo: llevan la clase que ese CSS oculta, y este test comprueba que
       * la llevan. Es la única parte de la impresión que **sí** se puede probar
       * sin un navegador.
       */
      dibujarDocumento()

      expect(
        screen.getByRole('button', { name: /imprimir o guardar en PDF/i })
          .parentElement,
      ).toHaveClass('no-print')
    })
  })
})
