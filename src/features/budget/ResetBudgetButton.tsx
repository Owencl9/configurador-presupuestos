import { useEffect, useRef, useState } from 'react'

export interface ResetBudgetButtonProps {
  /** Si hay algo que borrar. Con el presupuesto vacío no se muestra nada. */
  readonly hasLines: boolean
  /** Se invoca solo cuando la confirmación se acepta. */
  readonly onReset: () => void
}

const ID_PREGUNTA = 'reiniciar-presupuesto-pregunta'

/** Las cuatro cosas que puede estar enseñando el componente. */
type Vista = 'oculto' | 'boton' | 'aviso' | 'mensaje'

/**
 * «Empezar de nuevo»: vacía el presupuesto, con confirmación en dos pasos.
 *
 * Es el botón del apartado 4.6 del prompt maestro. Borrar el presupuesto **no
 * se puede deshacer** —no hay historial ni papelera—, así que un solo clic no
 * basta: decisión del usuario al autorizar la fase.
 *
 * ## Por qué no `window.confirm`
 *
 * Es una línea de código y lo resolvería, pero el diálogo del navegador no se
 * puede etiquetar en español ni dar estilo, bloquea la página entera, algunos
 * navegadores permiten silenciarlo —y entonces el presupuesto se borraría sin
 * preguntar— y no se puede probar con Testing Library sin sustituir una función
 * global. La confirmación va dentro de la página.
 *
 * ## El foco, que es la parte que no se ve
 *
 * | Momento | Dónde va el foco | Por qué |
 * | --- | --- | --- |
 * | Se abre el aviso | al propio aviso | Tiene nombre accesible, así que un lector de pantalla lee la pregunta completa. **No** al botón de borrar: el mismo Enter que abre el aviso lo confirmaría sin leerlo |
 * | Se cancela | al botón «Empezar de nuevo» | Es de donde venía. Si no, el foco cae al cuerpo del documento y hay que recorrer la página otra vez |
 * | Se confirma | al mensaje de que se ha borrado | El botón ya no existe —no hay nada que borrar—, así que el foco necesita un destino, y el mensaje es además la confirmación de que ha ocurrido |
 *
 * Nada de esto se ve mirando la pantalla con un ratón en la mano, y los cuatro
 * tests del foco son la única forma de que siga funcionando dentro de tres
 * fases.
 */
export function ResetBudgetButton({
  hasLines,
  onReset,
}: ResetBudgetButtonProps) {
  const [preguntando, setPreguntando] = useState(false)
  const [borrado, setBorrado] = useState(false)

  const botonRef = useRef<HTMLButtonElement>(null)
  const avisoRef = useRef<HTMLDivElement>(null)
  const mensajeRef = useRef<HTMLParagraphElement>(null)

  /*
   * Los dos estados se limpian cuando dejan de tener sentido:
   *
   * - Si vuelven a haber líneas, el mensaje «se ha borrado» ya no describe la
   *   pantalla. Sin esto, quitar más tarde la última línea con su propio botón
   *   haría reaparecer un mensaje que habla de una acción que nadie hizo, y el
   *   foco saltaría a él.
   * - Si el presupuesto se vacía por otra vía con el aviso abierto, la pregunta
   *   se queda sin objeto. Sin esto, volvería a aparecer al añadir el siguiente
   *   servicio.
   *
   * Se ajusta **durante el render**, comparando con el valor anterior, y no en
   * un `useEffect`. Es el patrón que documenta React para «ajustar el estado
   * cuando cambia una prop», y la diferencia es real: React descarta este
   * render a medias y vuelve a empezar con el estado ya corregido, así que la
   * pantalla nunca llega a dibujarse con el mensaje de más. Con un efecto se
   * dibujaría primero mal y se corregiría después, que es lo que avisa la regla
   * `react-hooks/set-state-in-effect` de ESLint.
   */
  const [lineasAntes, setLineasAntes] = useState(hasLines)

  if (lineasAntes !== hasLines) {
    setLineasAntes(hasLines)

    if (hasLines) {
      setBorrado(false)
    } else {
      setPreguntando(false)
    }
  }

  /*
   * La vista se **deriva** del presupuesto y de los dos estados, en lugar de
   * guardarse en un tercer estado que habría que mantener de acuerdo con los
   * otros dos. Es el mismo criterio que con los identificadores marcados del
   * catálogo: lo que se puede calcular no se guarda, porque dos copias de la
   * misma cosa pueden discrepar.
   */
  const vista: Vista = hasLines
    ? preguntando
      ? 'aviso'
      : 'boton'
    : borrado
      ? 'mensaje'
      : 'oculto'

  /*
   * El foco se mueve según **lo que hay en pantalla**, no según qué botón se
   * acaba de pulsar. La diferencia importa: al confirmar, el presupuesto se
   * vacía en el mismo instante, así que el componente pasa de «aviso» a
   * «mensaje» de una vez, y una lógica atada al clic tendría que adivinar en
   * qué orden llegan los dos cambios.
   *
   * `vistaAnterior` es un `useRef` y no un estado porque cambiarlo no debe
   * provocar un dibujado: es memoria, no información de la pantalla.
   */
  const vistaAnterior = useRef<Vista>('oculto')

  useEffect(() => {
    if (vista === 'aviso') {
      avisoRef.current?.focus()
    } else if (vista === 'mensaje') {
      // Solo se llega aquí después de confirmar: `borrado` no se pone de
      // ninguna otra forma.
      mensajeRef.current?.focus()
    } else if (vista === 'boton' && vistaAnterior.current === 'aviso') {
      // Se ha cancelado. Y la condición es necesaria: sin ella, el botón
      // robaría el foco al aparecer, es decir, al añadir el primer servicio.
      botonRef.current?.focus()
    }

    vistaAnterior.current = vista
  }, [vista])

  if (vista === 'oculto') {
    return null
  }

  if (vista === 'mensaje') {
    return (
      <p
        ref={mensajeRef}
        tabIndex={-1}
        className="mt-6 rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-700"
      >
        Se ha borrado el presupuesto. Puedes empezar a añadir servicios.
      </p>
    )
  }

  if (vista === 'aviso') {
    return (
      <div
        ref={avisoRef}
        tabIndex={-1}
        role="group"
        aria-labelledby={ID_PREGUNTA}
        className="mt-6 rounded-lg border border-slate-300 bg-white p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        <p id={ID_PREGUNTA} className="text-sm text-slate-900">
          ¿Seguro que quieres borrar el presupuesto? Se perderán los servicios
          añadidos.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setPreguntando(false)
              setBorrado(true)
              onReset()
            }}
            className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Sí, borrar el presupuesto
          </button>
          <button
            type="button"
            onClick={() => setPreguntando(false)}
            className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      ref={botonRef}
      type="button"
      onClick={() => setPreguntando(true)}
      className="mt-6 cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-slate-700 underline transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      Empezar de nuevo
    </button>
  )
}
