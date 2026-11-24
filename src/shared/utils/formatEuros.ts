/**
 * Convierte un importe en céntimos al formato español de euros:
 * `1.200,00 €`, `0,50 €`, `-62,50 €`.
 *
 * Es el **único** punto del proyecto donde el dinero deja de ser un entero y
 * pasa a ser texto. Todo el cálculo ocurre en céntimos enteros (ADR 0003) y
 * esta función se llama solo al mostrar.
 *
 * ## Por qué está escrita a mano y no con `Intl.NumberFormat`
 *
 * `Intl` es la herramienta correcta para formatear números por idioma, pero
 * aquí no sirve, por tres motivos comprobados en la Fase 3:
 *
 * 1. **No agrupa los millares de cuatro cifras en español.** Devuelve
 *    `1200,00 €`, no `1.200,00 €`, porque la norma de la RAE escribe las
 *    cantidades de cuatro cifras sin separador. El apartado 4.3 de la
 *    especificación fija el formato con separador. Se puede forzar con
 *    `useGrouping: 'always'`, pero entonces ya se están sobreescribiendo a mano
 *    las reglas del idioma que justificaban usar `Intl`.
 * 2. **Con `style: 'currency'` separa el importe del símbolo con un espacio
 *    irrompible** (U+00A0), no con un espacio normal: un carácter invisible que
 *    hace fallar tests sin que se vea el motivo en el mensaje de error.
 * 3. **Depende de los datos de idiomas de cada versión de Node**, que han
 *    cambiado entre versiones en otros idiomas. Los tests se ejecutarán en
 *    GitHub Actions (Fase 9), en otra máquina y con otra versión.
 *
 * Escrita a mano el resultado es exactamente predecible y no hay ninguna
 * división en coma flotante: solo una división entera y un resto.
 */
export function formatEuros(cents: number): string {
  if (!Number.isInteger(cents)) {
    /*
     * `Number.isInteger` descarta de una sola vez los decimales, `NaN` y los
     * infinitos. Lanzar en lugar de redondear es una decisión del usuario:
     * recibir aquí un número con decimales significa que el dinero se ha ido a
     * coma flotante en algún punto del cálculo, y redondearlo en silencio
     * ocultaría el error justo donde se vuelve visible. La validación de
     * `localStorage` de la Fase 5 es la responsable de que un borrador dañado
     * no llegue hasta aquí.
     */
    throw new Error(
      `formatEuros espera un número entero de céntimos y ha recibido ${cents}.`,
    )
  }

  // El signo se trata aparte: el resto de una división de un número negativo
  // también es negativo en JavaScript (-6250 % 100 es -50), así que calcular
  // los decimales sobre el valor negativo produciría «-62,-50 €».
  const signo = cents < 0 ? '-' : ''
  const absoluto = Math.abs(cents)

  const euros = Math.trunc(absoluto / 100)
  // Dos cifras siempre: 5 céntimos son «05», no «5».
  const decimales = String(absoluto % 100).padStart(2, '0')
  // Inserta un punto en cada posición que tenga un múltiplo de tres cifras a su
  // derecha, recorriendo el número de derecha a izquierda. `\B` evita poner un
  // punto al principio en los importes de exactamente tres cifras.
  const conMillares = String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${signo}${conMillares},${decimales} €`
}
