# ADR 0012 — El número de presupuesto: formato, contador y una serie por navegador

**Fecha:** 25/11/2026
**Estado:** aceptada
**Fase:** 7

## Contexto

El apartado 4.5 de la especificación pide que el documento del presupuesto lleve
**un número y una fecha de validez**. Un número de presupuesto sirve para dos
cosas: identificar un documento concreto cuando alguien llama por teléfono para
hablar de él, y dejar claro que hay un orden —el 0007 es posterior al 0006—.

El problema es que un contador es, por definición, **un dato compartido**: hace
falta un sitio único que recuerde cuál fue el último número repartido. Y este
proyecto no tiene ese sitio, porque no tiene servidor
([ADR 0002](0002-sin-backend.md)): todo ocurre en el navegador de quien usa la
aplicación.

El formato lo fijó el usuario al autorizar la fase: `PRE-AAAA-NNNN`, por ejemplo
`PRE-2026-0001`, con el contador en `localStorage` bajo una clave versionada y
validado al leerlo como todo lo que viene del navegador
([ADR 0009](0009-borradores-en-localstorage.md)).

Quedaban por decidir tres cosas que la especificación no contestaba, y que son
las que este documento registra: **cuándo se reparte el número**, **cuándo
avanza el contador** y **qué se hace con el hecho de que la serie no sea única**.

## Opciones consideradas

### Cuándo se reparte el número

| Opción | A favor | En contra |
| --- | --- | --- |
| **Al abrir el documento por primera vez** (elegida) | Solo recibe número un presupuesto que alguien ha terminado de configurar y ha querido ver como documento | Hay un instante, entre configurar y abrir, en el que el presupuesto todavía no tiene número |
| Al cargar la aplicación | El número existe desde el principio | **Cada visita quemaría un número**, incluida la de quien entra, mira el catálogo y se va. La serie se llenaría de huecos |
| En cada impresión | No hace falta guardar nada entre vistas | Imprimir dos veces el mismo presupuesto daría **dos números distintos** para el mismo documento, que es justo lo que un número existe para evitar |

### Cuándo avanza el contador

| Opción | A favor | En contra |
| --- | --- | --- |
| **En el mismo instante en que se reparte** (elegida) | El número repartido queda reservado antes de que nadie lo vea. No hay ventana en la que dos documentos puedan recibir el mismo | El contador avanza aunque después no se imprima nada |
| Al imprimir | Solo gasta número lo que llega a papel | El documento tendría que mostrar un número que aún no está reservado, y volver atrás y entrar otra vez lo cambiaría |

### Qué hacer con una serie que no es única

| Opción | A favor | En contra |
| --- | --- | --- |
| **Aceptarlo y decirlo** (elegida) | Mantiene el proyecto sin servidor y sin cuentas. El aviso convierte una limitación oculta en una limitación conocida | Dos personas distintas pueden tener las dos un `PRE-2026-0001` |
| Añadir un servidor con el contador | La serie sería única de verdad | Contradice el [ADR 0002](0002-sin-backend.md) y el apartado 7 de `CLAUDE.md`, y mete una base de datos y un despliegue en un TFM que no los necesita |
| Usar algo aleatorio y único, como un UUID | Sin colisiones y sin contador | No es un número de presupuesto: no tiene orden, no se dicta por teléfono y no se parece a nada que un cliente haya recibido antes |

## Decisión

### El formato

`PRE-AAAA-NNNN`, con el año de la **fecha de emisión** y el contador a cuatro
dígitos como mínimo, rellenado con ceros a la izquierda.

```
PRE-2026-0001        el primero del año
PRE-2026-0042        el cuarenta y dos
PRE-2026-10000       por encima de 9999 crece a cinco dígitos
```

El año sale de la fecha de emisión y no del reloj, para que **el año del número
y la fecha impresa no puedan discrepar**: son el mismo dato leído una sola vez.

Por encima de 9999 el número crece en lugar de volver al 0001 o quedarse en
`PRE-2026-9999`: un número repetido es peor que un número largo. Lo que no se
hace es rellenar a más de cuatro dígitos, porque `PRE-2026-000001` no se
parecería a un número de presupuesto.

### El reparto y el contador

- El número se reparte **una sola vez por presupuesto**, al abrir el documento
  por primera vez. Volver atrás, cambiar un servicio y entrar otra vez es el
  mismo presupuesto afinándose: conserva su número.
- El contador avanza en ese mismo instante, y vive en `localStorage` bajo
  `configurador-presupuestos:budget-counter:v1` con dos campos:

  ```json
  { "year": 2026, "lastNumber": 7 }
  ```

- **La serie es anual.** Si el año guardado no es el de la emisión, la serie
  empieza otra vez en 1, porque el año ya va dentro del número.
- **«Empezar de nuevo» olvida el número asignado** (decisión del usuario): lo
  que viene después es otro presupuesto, probablemente de otra persona, y el
  documento siguiente recibe un número nuevo. **El contador no se borra**: si se
  borrara, ese presupuesto siguiente repetiría el número del anterior.

### La clave es distinta de la del borrador, a propósito

El borrador usa `configurador-presupuestos:budget-draft:v1` y el contador una
clave propia, aunque las dos podrían vivir en el mismo objeto. Están separadas
porque **tienen vidas distintas**: el borrador se borra al empezar de nuevo y el
contador tiene que sobrevivir a eso. Guardarlos juntos haría que un formato
nuevo de borrador —un `:v2`— se llevara por delante la numeración.

### Lo que se lee del navegador no es de fiar

`parseBudgetCounter` recibe `unknown` y devuelve el contador o `null`, con 26
tests. Rechaza lo que no es un objeto, los años que no son enteros de cuatro
cifras, los `lastNumber` que no son enteros positivos y los valores por encima
del tope. Si algo de eso llega, la serie empieza en 1, que es la norma del
apartado 4.6: un formato desconocido se descarta y se empieza de cero.

Hay un tope, `MAX_BUDGET_COUNTER = 999_999`, y existe por un hallazgo concreto:
`Number.isInteger(1e21)` es `true`, y `String(1e21)` es `'1e+21'`. Sin tope, un
contador manipulado a mano en el navegador podía imprimir
**`PRE-2026-1e+21`** en el documento de un cliente. El tope no es una previsión
de uso —nadie emite un millón de presupuestos desde un navegador—, es el borde
que impide que un número deje de ser un número.

## Consecuencias

### Lo que mejora

- El documento tiene un identificador con orden y con año, dictable por
  teléfono, y el mismo presupuesto conserva el suyo entre vistas e impresiones.
- La numeración no añade servidor, cuentas ni dependencias.
- El reparto del número es **la única pieza con efectos** de todo el mecanismo.
  Las otras tres —validar, dar formato y hablar con el navegador— son puras o
  devuelven valores en lugar de lanzar, así que se prueban sin navegador y sin
  componentes.

### Lo que cuesta

- **Cada navegador lleva su propia serie.** Dos personas distintas pueden
  recibir las dos un `PRE-2026-0001`, y la misma persona en otro equipo empieza
  de nuevo en el 0001. Es la consecuencia directa de no tener servidor.
- Borrar los datos del sitio en el navegador reinicia la numeración.
- Si el navegador no permite escribir —navegación privada, cookies bloqueadas,
  cuota agotada—, el documento sale con su número igualmente: lo que se pierde
  es la memoria de cuál fue el último, no el número.

### Cómo se avisa

El aviso aparece en **tres sitios y no en un cuarto**:

| Dónde | Por qué |
| --- | --- |
| Este ADR | Es la decisión, con su razonamiento |
| El `README` | Quien evalúa el proyecto tiene que saber qué hace y qué no |
| Una nota pequeña **en pantalla**, junto al número | Es donde hace falta: un `PRE-2026-0001` parece de una serie de empresa |
| **No en el documento impreso** | Decisión del usuario. Un cliente no tiene por qué leer que su número de presupuesto puede estar repetido: es un problema del emisor, no del receptor |

La nota en pantalla lleva la clase que el CSS de impresión oculta, y tiene **dos
tests**: uno comprueba que está y el otro que lleva esa clase. Los dos juntos
son la decisión completa; cualquiera de ellos solo describiría la mitad.

### Lo que hay que vigilar

- Si alguna vez el proyecto tuviera un servidor, esta decisión cambia entera: el
  contador se iría allí, la serie pasaría a ser única y la nota de pantalla
  dejaría de tener sentido.
- La fecha de emisión entra por una puerta inyectable (`now`), igual que el tipo
  de IGIC y las estrategias de descuento. Los tests fijan la fecha, así que
  ninguno depende del día en que se ejecuten. **Un test de fechas con el reloj
  del sistema caduca**, y suele hacerlo el 1 de enero.
