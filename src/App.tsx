import { Configurator } from './Configurator'
import { BudgetProvider } from './context/BudgetProvider'

/**
 * La aplicación: el proveedor del presupuesto y la pantalla.
 *
 * Hasta la Fase 4, `App` guardaba el estado en un `useState` y lo repartía por
 * props. Desde la Fase 5 el estado vive en `BudgetProvider` —con un reducer y
 * borradores en `localStorage`— y `App` se queda en estas cuatro líneas.
 *
 * ## Por qué el proveedor está aquí y no en `main.tsx`
 *
 * Donde se coloque el proveedor decide qué significa «montar la aplicación».
 * Puesto en `main.tsx`, `App` sería un componente que no funciona por su cuenta:
 * cualquier test que lo renderizara —los ocho tests de integración que vienen
 * de la Fase 4— tendría que acordarse de envolverlo, y el día que alguien lo
 * olvidara el error sería un `useBudget` fuera de su proveedor.
 *
 * Aquí, `<App />` es la aplicación completa, y los tests de la Fase 4 siguen
 * funcionando sin tocar ni una línea. `main.tsx` solo pone `StrictMode` y la
 * raíz del DOM, que es asunto del navegador y no de la aplicación.
 */
interface AppProps {
  /**
   * De dónde sale «ahora». Solo lo usan los tests; la aplicación no lo pasa y
   * entonces se usa el reloj del sistema.
   *
   * Está aquí porque los tests de integración montan `<App />`, que es la
   * aplicación completa, y el documento de la Fase 7 muestra dos fechas y un
   * número con el año dentro. Sin esta puerta, esos tests dependerían del día en
   * que se ejecutan.
   */
  readonly now?: () => Date
}

function App({ now }: AppProps = {}) {
  return (
    <BudgetProvider>
      <Configurator now={now} />
    </BudgetProvider>
  )
}

export default App
