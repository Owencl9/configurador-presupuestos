# ADR 0004 — Patrón Strategy para los descuentos

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 1 (se implementa en la Fase 6)

## Contexto

El apartado 4.3 del prompt maestro define cuatro reglas de descuento con
condiciones y bases de cálculo distintas:

| Descuento | Condición | Se aplica sobre |
|---|---|---|
| Pack | 3 o más servicios distintos | el subtotal |
| Permanencia | servicios mensuales de 12 meses o más | solo esos servicios |
| Importe | pago único superior a 3.000 € | solo el pago único |
| Tope | el descuento total no supera el 20 % | el conjunto |

Son reglas comerciales: es previsible que cambien, que se añadan nuevas o que se
desactiven por temporada.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **Strategy: una clase o función por descuento + un calculador que las combina** | Cada regla se prueba aislada; añadir una regla es añadir un archivo y registrarlo, sin tocar las demás; el orden de aplicación queda explícito en el calculador | Más archivos que una sola función |
| Una función con condicionales encadenados | Todo a la vista en un sitio | Crece en anidamiento con cada regla; un test que falla no señala qué regla falló; añadir una regla obliga a modificar código ya probado |
| Tabla de reglas declarativa | Muy compacta | Las cuatro reglas no comparten forma: se aplican sobre bases distintas. Forzarlas a una misma tabla la vuelve ilegible |

## Decisión

Se usa el **patrón Strategy**: cada tipo de descuento es una estrategia
independiente con la misma interfaz, y un calculador las ejecuta en orden y
combina los resultados.

- Cada estrategia recibe el presupuesto y devuelve el descuento que le
  corresponde en céntimos, más el motivo, para poder mostrarlo en el resumen.
- Una estrategia que no se cumple devuelve cero, no lanza una excepción.
- El **tope del 20 % no es una estrategia**: es una restricción que el calculador
  aplica al total, después de sumar las demás. Mezclarlo con las otras lo haría
  depender del orden de ejecución.
- Todo se implementa con TDD, regla a regla.

## Consecuencias

- Los tests describen las reglas de negocio una por una, y sirven de
  documentación ejecutable de las tarifas de la agencia.
- Se puede probar el tope del 20 % de forma aislada, combinando descuentos que
  por separado sumarían más.
- El resumen del presupuesto puede explicar **el motivo de cada descuento**, como
  exige el apartado 4.4 del prompt maestro, porque cada estrategia lo devuelve
  junto al importe.
- **Coste:** más archivos y una indirección más para seguir el flujo del
  cálculo. Es el precio de poder probar y cambiar cada regla por separado, y en
  una aplicación cuyo núcleo son estas reglas, está justificado.
- Es una decisión del apartado 4.3 del prompt maestro, no una elección libre:
  este ADR documenta por qué encaja, no si usarlo.
