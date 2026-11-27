import { test as base, expect } from '@playwright/test'

/* =============================================================================
 * GUARDIÁN DE LA CONTENT-SECURITY-POLICY (FASE 10)
 * =============================================================================
 *
 * Una CSP mal escrita **no rompe la página de forma visible**. Bloquea un
 * recurso, el navegador lo apunta en la consola y sigue. Ese es el caso
 * peligroso: si la CSP bloqueara la hoja de estilos, la aplicación se serviría
 * sin un solo estilo y los cinco recorridos **seguirían en verde**, porque
 * buscan textos, encabezados y roles, no colores. Pasarían en una aplicación
 * que ningún cliente querría ver.
 *
 * Así que los recorridos no se conforman con que el documento funcione: exigen
 * además que el navegador **no haya registrado ni una violación de la CSP**. Se
 * vigila por dos vías a la vez, y es a propósito:
 *
 * 1. **El evento `securitypolicyviolation`**, que el navegador dispara en el
 *    documento por cada bloqueo. Se registra con `addInitScript`, que se
 *    ejecuta antes que cualquier script de la página, así que el oyente está
 *    puesto antes de que el analizador llegue a las etiquetas de `<head>`.
 * 2. **Los mensajes de la consola**, donde Chromium escribe su propio
 *    «Refused to … because it violates the following Content Security Policy
 *    directive». Esta vía no depende de que nuestro oyente se haya registrado a
 *    tiempo, así que cubre justo el hueco de la primera.
 *
 * La comprobación vive en el desmontaje del fixture, no en cada test: así
 * **ningún recorrido puede olvidarse de hacerla**, que es lo que pasaría con
 * una línea copiada en cinco archivos.
 * ========================================================================== */

/**
 * Marca con la que el oyente del navegador anuncia una violación por la
 * consola. No es una palabra cualquiera: tiene que poder distinguirse de
 * cualquier otro mensaje, y por eso lleva un prefijo que nada más escribe.
 */
const MARCA_DE_VIOLACION = 'CSP-VIOLACION'

/** Lo que Chromium escribe en la consola cuando bloquea algo por la CSP. */
const TEXTO_DE_CHROMIUM = /content security policy/i

export const test = base.extend<{ guardiaCsp: void }>({
  guardiaCsp: [
    async ({ page }, use) => {
      const violaciones: string[] = []

      await page.addInitScript((marca: string) => {
        document.addEventListener('securitypolicyviolation', (evento) => {
          console.error(
            `${marca} directiva=${evento.effectiveDirective} recurso=${evento.blockedURI}`,
          )
        })
      }, MARCA_DE_VIOLACION)

      page.on('console', (mensaje) => {
        const texto = mensaje.text()
        if (
          texto.includes(MARCA_DE_VIOLACION) ||
          TEXTO_DE_CHROMIUM.test(texto)
        ) {
          violaciones.push(texto)
        }
      })

      await use()

      expect(
        violaciones,
        `El navegador registró ${String(violaciones.length)} violación(es) de la Content-Security-Policy:\n` +
          violaciones.join('\n'),
      ).toEqual([])
    },
    // `auto` significa que se aplica a todos los tests del archivo que importe
    // este `test`, sin que ninguno tenga que pedirlo. Un guardián que hay que
    // acordarse de invocar no es un guardián.
    { auto: true },
  ],
})

export { expect }
