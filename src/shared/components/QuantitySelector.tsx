import { useState } from 'react'

import { normalizeNumber } from '../utils/normalizeNumber'

export interface QuantitySelectorProps {
  /** Identificador del campo, para unirlo con su etiqueta. Debe ser único. */
  id: string
  /** Etiqueta visible y corta: «Meses» o «Cantidad». */
  label: string
  /** Nombre del servicio, que se añade al nombre accesible del campo. */
  itemName: string
  /** Unidad en plural para el texto de ayuda: «meses» o «unidades». */
  unit: string
  /** Valor confirmado. Lo manda quien usa el componente, no el componente. */
  value: number
  /** Mínimo admitido, incluido. */
  min: number
  /** Máximo admitido, incluido. */
  max: number
  /**
   * Se invoca con el valor **ya corregido**, solo cuando cambia de verdad: al
   * salir del campo, al pulsar Enter o al usar los botones. Nunca en cada
   * pulsación del teclado.
   */
  onChange: (value: number) => void
}

/**
 * Selector numérico con botones de más y menos, un campo para escribir y un
 * mínimo y un máximo.
 *
 * Es el «selector de cantidad o meses» del plan de la Fase 4, y es **uno solo
 * para las dos cosas**: cambian la etiqueta, la unidad y los límites, que
 * llegan por props. Dos componentes separados tendrían la misma lógica de
 * corrección escrita dos veces.
 *
 * ## Cuándo se corrige lo que se escribe
 *
 * **Al salir del campo o al pulsar Enter, nunca al teclear.** Es una decisión
 * del usuario del proyecto y tiene un motivo concreto: con el mínimo en 6
 * meses, escribir «12» pasa por un «1» intermedio que está por debajo del
 * mínimo. Corrigiendo en cada pulsación, ese «1» se volvería un 6 y sería
 * imposible escribir 12.
 *
 * Mientras se escribe, el texto se guarda tal cual en el estado del componente
 * y no se avisa a nadie. Al confirmar, el valor pasa por `normalizeNumber` —que
 * trunca decimales, descarta lo que no es un número y acerca al rango lo que se
 * sale— y solo entonces se llama a `onChange`.
 *
 * Componente presentacional: no conoce el presupuesto ni las reglas de negocio.
 * Los límites son datos que recibe, y quien se los pasa los lee de
 * `shared/constants/business-rules.ts`.
 */
export function QuantitySelector({
  id,
  label,
  itemName,
  unit,
  value,
  min,
  max,
  onChange,
}: QuantitySelectorProps) {
  /*
   * El texto que se está escribiendo, mientras se escribe.
   *
   * `null` significa «no se está editando»: entonces el campo muestra el valor
   * confirmado que llega por props. Así los botones y cualquier cambio de
   * fuera se reflejan solos, sin tener que sincronizar dos estados.
   */
  const [textoEditado, setTextoEditado] = useState<string | null>(null)

  const textoMostrado = textoEditado ?? String(value)
  const idAyuda = `${id}-ayuda`
  const nombreAccesible = `${label} de ${itemName}`

  /** Confirma lo escrito: lo corrige, avisa si ha cambiado y sale de edición. */
  function confirmar() {
    if (textoEditado === null) {
      return
    }

    const corregido = normalizeNumber(textoEditado, { min, max })

    setTextoEditado(null)

    // No se avisa de un cambio que no lo es. Escribir «12» donde ya había 12 y
    // salir del campo no debería recalcular el presupuesto.
    if (corregido !== value) {
      onChange(corregido)
    }
  }

  /*
   * Los botones no necesitan corrección: pasan por `normalizeNumber` de todas
   * formas para que el rango se aplique en un solo sitio, y están desactivados
   * en los extremos, así que nunca pueden salirse.
   */
  function cambiarEn(paso: number) {
    onChange(normalizeNumber(value + paso, { min, max }))
  }

  const claseBoton =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-lg font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {/* La etiqueta visible se mantiene corta («Meses») y el nombre
            accesible nombra el servicio, para que con cinco líneas en pantalla
            se sepa de cuál es este campo. El texto visible queda contenido en
            el accesible, como exige el criterio WCAG 2.5.3.

            Son dos elementos, uno oculto a los lectores y otro oculto a la
            vista, y no un texto corto más un añadido: el cálculo del nombre
            accesible recorta los espacios de cada nodo de texto, así que
            «Meses» + « de SEO Básico» se anunciaría «Mesesde SEO Básico».
            Mismo patrón que el botón de `ServiceCard`. */}
        <span aria-hidden="true">{label}</span>
        <span className="sr-only">{nombreAccesible}</span>
      </label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => cambiarEn(-1)}
          disabled={value <= min}
          className={claseBoton}
        >
          <span aria-hidden="true">−</span>
          <span className="sr-only">Reducir {nombreAccesible}</span>
        </button>

        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={textoMostrado}
          min={min}
          max={max}
          step={1}
          aria-describedby={idAyuda}
          onChange={(evento) => setTextoEditado(evento.target.value)}
          onBlur={confirmar}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') {
              // Sin esto, pulsar Enter dentro de un formulario lo enviaría. No
              // hay formulario todavía —llega en la Fase 7— y cuando llegue
              // este componente no debe cambiar de comportamiento.
              evento.preventDefault()
              confirmar()
            }
          }}
          className="w-20 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-center text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        />

        <button
          type="button"
          onClick={() => cambiarEn(1)}
          disabled={value >= max}
          className={claseBoton}
        >
          <span aria-hidden="true">+</span>
          <span className="sr-only">Aumentar {nombreAccesible}</span>
        </button>
      </div>

      {/* El rango, en texto y asociado al campo. Es lo que explica por qué un
          botón está desactivado: el gris por sí solo no transmite información
          (apartado 3 de CLAUDE.md). */}
      <p id={idAyuda} className="text-xs text-slate-500">
        Entre {min} y {max} {unit}
      </p>
    </div>
  )
}
