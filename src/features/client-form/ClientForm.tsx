import { useRef, useState } from 'react'

import {
  type ClientData,
  EMPTY_CLIENT_DATA,
  normalizeClientData,
} from './clientData'
import {
  type ClientErrors,
  type ClientField,
  validateClientData,
} from './validateClientData'

export interface ClientFormProps {
  /**
   * Con qué datos nace el formulario.
   *
   * Se lee **solo al montar**, y eso es justo lo que hace falta: al volver del
   * documento, el formulario se monta de nuevo y aparece con lo último que se
   * envió, en lugar de obligar a escribirlo otra vez. Lo que se hubiera escrito
   * sin enviar sí se pierde, y es aceptable: para llegar al documento hay que
   * haber enviado.
   */
  readonly initialClient?: ClientData
  /** Se invoca solo con los datos **válidos y recortados**. */
  readonly onSubmit: (client: ClientData) => void
}

const ID_TITULO = 'datos-del-cliente-titulo'
const ID_AVISO = 'datos-del-cliente-aviso'

/**
 * Los tres campos, en el orden en que se dibujan y se recorren con el teclado.
 *
 * **Ninguno lleva `maxLength`, y es a propósito.** Un `maxLength` en el
 * `<input>` impide escribir o pegar más allá del tope, lo que parece una mejora
 * pero significa que una razón social de 95 caracteres pegada en el campo se
 * **recorta en silencio**: el documento sale con el nombre de la empresa
 * cortado y nadie se entera. Perder datos sin avisar en un documento que se
 * envía a un cliente es peor que un mensaje de error.
 *
 * Los topes siguen aplicándose, pero donde se pueden explicar: en
 * `validateClientData`, que devuelve «La empresa no puede pasar de 80
 * caracteres.» y deja el texto intacto para que se pueda corregir.
 */
const CAMPOS: readonly {
  readonly field: ClientField
  readonly label: string
  readonly type: string
  readonly required: boolean
  readonly autoComplete: string
}[] = [
  {
    field: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
    autoComplete: 'name',
  },
  {
    field: 'company',
    label: 'Empresa (opcional)',
    type: 'text',
    required: false,
    autoComplete: 'organization',
  },
  {
    field: 'email',
    label: 'Correo electrónico (opcional)',
    type: 'email',
    required: false,
    autoComplete: 'email',
  },
]

/**
 * El formulario de los datos del cliente: nombre, empresa y correo.
 *
 * ## Los datos no salen de aquí, y no se guardan
 *
 * No hay ninguna petición de red: el formulario lleva `onSubmit` interceptado y
 * **no tiene `action`**, así que el navegador no tiene a dónde enviarlo. Y lo
 * que se escribe no va a `localStorage` (ADR 0013): vive en el estado de la
 * pantalla y desaparece al recargar. La propia pantalla lo dice, porque si no,
 * un formulario que aparece vacío tras recargar parecería un fallo.
 *
 * ## Cuándo se valida
 *
 * **Al enviar.** Después, un campo que ya está señalado se revalida en cada
 * pulsación, para que el mensaje se vaya en cuanto el valor sea bueno y cambie
 * si lo que falta es otra cosa. Un campo que no está señalado **no** se valida
 * mientras se escribe: teclear un correo pasa por «a», «an», «ana»…, que no son
 * correos, y protestar en cada letra hace el formulario insoportable.
 *
 * Es el mismo criterio que el selector de cantidad de la Fase 4, que corrige al
 * salir del campo y nunca al teclear.
 *
 * ## Quién decide si este formulario se ve
 *
 * **No este componente.** Lo decide `Configurator`, que lo renderiza solo
 * cuando el presupuesto tiene líneas. La primera versión lo resolvía aquí, con
 * un `if (!hasLines) return null`, y estaba mal por un detalle de React que no
 * se ve: **devolver `null` no desmonta el componente**. React conserva la
 * instancia y sus `useState`, así que el nombre escrito sobrevivía a «Empezar
 * de nuevo» y el formulario del presupuesto siguiente aparecía con los datos
 * del cliente anterior. Lo destapó el test de integración que pedía el usuario.
 *
 * Al no renderizarlo, el componente se desmonta de verdad, su estado se va con
 * él y `initialClient` se vuelve a leer al montarse. La consecuencia de diseño
 * es que **vaciar el presupuesto vacía también este formulario**, también si se
 * vacía quitando los servicios uno a uno.
 *
 * ## Los mensajes van asociados a su campo, no en una región activa
 *
 * Cada error se asocia a su `<input>` con `aria-describedby`, y al enviar el
 * foco salta al primer campo que falla. Así el lector de pantalla anuncia la
 * etiqueta y el mensaje juntos, y no hace falta ninguna región `aria-live`: con
 * tres errores a la vez, tres alertas simultáneas se pisan unas a otras. Es la
 * misma decisión que la pista del selector de meses en la Fase 6.
 */
export function ClientForm({
  initialClient = EMPTY_CLIENT_DATA,
  onSubmit,
}: ClientFormProps) {
  const [datos, setDatos] = useState<ClientData>(initialClient)
  const [errores, setErrores] = useState<ClientErrors>({})

  /*
   * Un `ref` por campo, para poder llevarle el foco al enviar. Es un objeto y
   * no tres variables para que el bucle que dibuja los campos y el que busca el
   * primer error recorran la misma lista.
   */
  const refs = useRef<Partial<Record<ClientField, HTMLInputElement | null>>>({})

  function cambiar(field: ClientField, valor: string) {
    const siguientes = { ...datos, [field]: valor }
    setDatos(siguientes)

    // Solo se revalida lo que ya está señalado. Los demás campos esperan al
    // envío.
    if (errores[field] === undefined) {
      return
    }

    const recalculados = validateClientData(siguientes)
    const siguienteError = recalculados[field]

    setErrores((previos) => {
      const copia = { ...previos }

      if (siguienteError === undefined) {
        delete copia[field]
      } else {
        copia[field] = siguienteError
      }

      return copia
    })
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    // Sin esto, el navegador recargaría la página y pondría los datos del
    // cliente en la URL. Es la línea que mantiene la promesa de que no salen de
    // aquí.
    evento.preventDefault()

    const encontrados = validateClientData(datos)
    setErrores(encontrados)

    const primeroConError = CAMPOS.find(
      ({ field }) => encontrados[field] !== undefined,
    )

    if (primeroConError !== undefined) {
      refs.current[primeroConError.field]?.focus()

      return
    }

    onSubmit(normalizeClientData(datos))
  }

  return (
    <section
      aria-labelledby={ID_TITULO}
      className="mt-12 rounded-lg border border-slate-200 bg-white p-6"
    >
      <h2 id={ID_TITULO} className="text-xl font-semibold text-slate-900">
        Datos del cliente
      </h2>

      <p id={ID_AVISO} className="mt-2 text-sm text-slate-600">
        Estos datos solo se usan para el documento y{' '}
        <strong className="font-semibold">no se guardan</strong>: al recargar la
        página hay que volver a escribirlos. El presupuesto sí se conserva.
      </p>

      <form
        /*
         * `aria-label` convierte el `<form>` en una región con nombre y hace que
         * `getByRole('form')` lo encuentre: un formulario sin nombre accesible
         * no se anuncia como formulario.
         *
         * `noValidate` desactiva los mensajes del navegador, que salen en el
         * idioma del navegador, no se pueden redactar, no se pueden asociar a un
         * campo y no se pueden probar.
         */
        aria-label="Datos del cliente"
        noValidate
        onSubmit={enviar}
        className="mt-6 flex flex-col gap-5"
      >
        {CAMPOS.map(({ field, label, type, required, autoComplete }) => {
          const id = `cliente-${field}`
          const idError = `${id}-error`
          const error = errores[field]

          return (
            <div key={field} className="flex flex-col gap-1">
              <label
                htmlFor={id}
                className="text-sm font-medium text-slate-700"
              >
                {label}
              </label>

              <input
                ref={(elemento) => {
                  refs.current[field] = elemento
                }}
                id={id}
                name={field}
                type={type}
                value={datos[field]}
                required={required}
                autoComplete={autoComplete}
                /*
                 * `aria-invalid` solo cuando hay error: escrito siempre, como
                 * `aria-invalid={false}`, algunos lectores de pantalla lo
                 * anuncian igual.
                 */
                aria-invalid={error === undefined ? undefined : true}
                aria-describedby={error === undefined ? undefined : idError}
                onChange={(evento) => cambiar(field, evento.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 aria-invalid:border-red-600"
              />

              {/* El mensaje lleva un símbolo además del color rojo: el color
                    por sí solo no transmite información (apartado 3 de
                    CLAUDE.md), y en una impresión en blanco y negro o para
                    quien no distingue el rojo, el texto es lo único que queda. */}
              {error !== undefined && (
                <p id={idError} className="text-sm text-red-700">
                  <span aria-hidden="true">⚠ </span>
                  {error}
                </p>
              )}
            </div>
          )
        })}

        <div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Preparar el documento
          </button>
        </div>
      </form>
    </section>
  )
}
