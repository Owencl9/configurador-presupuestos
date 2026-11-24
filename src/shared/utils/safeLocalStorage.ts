/* =============================================================================
 * ACCESO A localStorage QUE NO PUEDE ROMPER LA APLICACIÓN
 * =============================================================================
 *
 * `localStorage` es la única parte del navegador que esta aplicación usa y que
 * puede fallar por motivos ajenos al código:
 *
 * - **Navegación privada o cookies bloqueadas.** En algunos navegadores el
 *   objeto existe pero lanza una excepción al usarlo, e incluso al mencionarlo.
 * - **Cuota agotada.** `setItem` lanza `QuotaExceededError` cuando el dominio
 *   ha llenado su espacio.
 * - **Contenido editado o de otra versión.** Lo guardado es una cadena de
 *   texto que cualquiera puede cambiar desde las herramientas del navegador, y
 *   `JSON.parse` lanza si no es JSON válido.
 *
 * Las tres funciones de abajo convierten esos fallos en un valor: `null` o
 * `false`. Así quien las llama no necesita saber nada de esto, y el criterio de
 * la fase —si no hay almacenamiento, la aplicación funciona igual, simplemente
 * sin guardar— se cumple en un único sitio en lugar de en cada llamada.
 *
 * Vive en `shared/` porque no sabe nada de presupuestos: guarda y lee JSON bajo
 * una clave. Lo que significa cada clave lo deciden las funcionalidades
 * (`features/budget/draftStorage.ts`).
 * ========================================================================== */

/**
 * Lee una clave y la convierte desde JSON.
 *
 * Devuelve **`unknown`** y no un tipo concreto, y es deliberado: lo que hay
 * guardado no es de fiar, así que el compilador no debe dejar usarlo sin
 * comprobarlo antes. Validarlo es trabajo de quien conoce el formato
 * (`parseDraft`, en el caso del borrador).
 *
 * @returns El valor convertido, o `null` si no hay nada, no se puede leer o lo
 * guardado no es JSON válido. Los tres casos se tratan igual porque llevan a la
 * misma decisión: no hay borrador que recuperar.
 */
export function readJson(key: string): unknown {
  try {
    const texto = localStorage.getItem(key)

    if (texto === null) {
      return null
    }

    return JSON.parse(texto)
  } catch {
    /*
     * Sin `console.error`: que no haya almacenamiento no es un error de la
     * aplicación, es una forma legítima de usar el navegador. Un mensaje en la
     * consola en cada arranque de una ventana de incógnito sería ruido que
     * además invita a creer que algo va mal.
     */
    return null
  }
}

/**
 * Guarda un valor como JSON.
 *
 * @returns `true` si se ha guardado, `false` si el navegador no lo permite. El
 * valor de retorno existe para que quien llama **pueda** reaccionar, no para
 * obligarle: la aplicación sigue funcionando sin guardar.
 */
export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Borra una clave.
 *
 * @returns `true` si se ha borrado, `false` si el navegador no lo permite.
 */
export function removeKey(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
