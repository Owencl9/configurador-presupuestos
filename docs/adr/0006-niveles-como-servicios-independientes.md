# ADR 0006 — Modelo de datos del catálogo: niveles como servicios independientes

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 2

## Contexto

El apartado 4.3 del prompt maestro propone un catálogo de seis servicios. El
usuario pidió uno más variado: doce servicios en cuatro categorías (Diseño web,
Marketing, Mantenimiento e Infraestructura), con **niveles** en algunos de ellos
—SEO Básico y SEO Profesional, Mantenimiento Básico y Premium—, y con una
condición explícita: **los niveles son solo datos**, sin reglas de precio nuevas.
El cálculo y los descuentos siguen siendo los del apartado 4.3.

Hay además una segunda decisión de modelado que no se puede separar de la
primera: el apartado 4.1 dice que los servicios mensuales tienen «un número
mínimo de meses». Los de pago único y los anuales no. Hay que decidir cómo se
representa un campo que solo tiene sentido en una parte de los servicios.

## Opciones consideradas

### Cómo representar los niveles

| Opción                                                   | A favor                                                                                                                       | En contra                                                                                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Servicios independientes** (cada nivel, un servicio)   | No añade ningún concepto nuevo: el cálculo, el presupuesto y los descuentos tratan los niveles como cualquier otro servicio. Cero cambios en la lógica. Añadir un nivel es añadir una fila | El catálogo no «sabe» que SEO Básico y SEO Profesional son alternativas, así que nada impide seleccionar las dos a la vez                                                 |
| Un servicio con variantes anidadas (`levels: [...]`)     | Expresa la relación entre niveles y permitiría excluirlos mutuamente                                                          | Obliga a decidir el nivel al seleccionar, cambia el tipo `Service`, cambia `ServiceCard`, y mete en el presupuesto una pareja servicio + variante. Reglas nuevas donde el usuario pidió que no hubiera ninguna |
| Un campo `level` informativo en cada servicio            | Barato de escribir                                                                                                            | Un campo que nada lee no es información, es un comentario disfrazado de dato. Y sugiere una lógica de niveles que no existe                                               |

### Cómo representar los meses mínimos

| Opción                                      | A favor                                                                                                             | En contra                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Unión discriminada** por forma de pago    | Los datos imposibles no compilan; obliga a comprobar la forma de pago antes de leer los meses, justo lo que las fases 3 a 6 necesitan para separar pago inicial, cuota mensual y pagos anuales | Tres tipos en lugar de uno; hay que entender el concepto para leer el archivo                                                   |
| Campo opcional `minMonths?: number`         | Un solo tipo, más corto                                                                                             | Permite representar un hosting anual con seis meses mínimos: un dato sin sentido que compila y que nadie detecta hasta que calcula mal |

## Decisión

**1. Cada nivel es un servicio independiente del catálogo**, con su propio
`id`, su nombre, su descripción y su precio. No existe ningún campo «nivel» ni
ninguna relación declarada entre SEO Básico y SEO Profesional. Para el cálculo
son dos servicios cualesquiera.

**2. `Service` es una unión discriminada** de `OneTimeService`,
`MonthlyService` y `YearlyService`, con `payment` como discriminante.
`minMonths` existe solo en `MonthlyService`, y ahí es obligatorio.

**3. El catálogo vive en un único archivo de datos** (`src/shared/data/services.ts`)
con los precios en céntimos, y la lógica no conoce ningún servicio concreto:
ni el agrupador, ni el formateador, ni el componente mencionan un `id`
determinado.

**4. Todos los precios son ficticios.** El repositorio es público y las tarifas
reales de la agencia del autor no se publican. Queda advertido en la cabecera
del archivo de datos y en el README.

## Consecuencias

- **El cálculo de las fases 3 a 6 no se entera de que hay niveles.** Es el
  objetivo: la variedad del catálogo es un asunto de datos y no toca la lógica
  de negocio ni sus tests.
- **Se puede seleccionar SEO Básico y SEO Profesional a la vez.** Es la
  contrapartida aceptada de la opción elegida. Un catálogo real lo impediría con
  una regla de exclusión mutua, que es exactamente la clase de regla nueva que
  el usuario descartó. Si alguna vez hiciera falta, se añadiría como dato
  (`excludes: [...]`) sin rehacer el modelo.
- **Los datos incoherentes dejan de compilar o fallan en los tests.** Un
  servicio anual con meses mínimos es un error de `tsc`, y hay un test que lo
  comprueba con `@ts-expect-error` en `src/shared/data/services.test.ts`: si el
  compilador dejara de rechazarlo, la propia directiva pasaría a ser un error y
  `npm run build` fallaría. Lo que el compilador no puede ver —identificadores
  repetidos, precios con decimales, categorías vacías— lo cubren los otros diez
  tests de integridad de ese archivo.
- **Coste de la unión discriminada:** para leer `service.minMonths` hay que
  haber comprobado antes `service.payment === 'monthly'`. En las fases 3 a 6 eso
  es una ventaja, porque es justo la separación que pide el apartado 4.4; en un
  recorrido genérico del catálogo obliga a un `if` que con el campo opcional no
  haría falta.
- **El catálogo permite provocar las cuatro reglas de descuento** del apartado
  4.3: hay doce servicios (pack), seis mensuales (permanencia) y el pago único
  suma más de 3.000 € (importe), de modo que también se alcanza el tope del
  20 %. Un test de integridad vigila la condición de los 3.000 €, para que una
  futura edición de precios no deje un descuento inalcanzable y rompa los tests
  de la Fase 6 sin motivo aparente.
