# ADR 0009 — El borrador guarda identificadores, no precios

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 5

## Contexto

El apartado 4.6 del prompt maestro pide guardar el presupuesto en curso en el
navegador, recuperarlo al volver, ofrecer un botón para empezar de nuevo y, si
lo guardado está dañado, **no romperse**: descartarlo y empezar de cero.

No hay backend ([ADR 0002](0002-sin-backend.md)), así que el único sitio donde
guardar es `localStorage`, y eso tiene una consecuencia que conviene nombrar sin
rodeos: **lo guardado está en el ordenador de quien usa la aplicación y lo puede
editar cualquiera** desde las herramientas de desarrollo del navegador, en
quince segundos y sin conocimientos técnicos. No es un almacén de confianza: es
una entrada de datos más, como un campo de texto.

Eso plantea dos preguntas independientes:

1. **Qué se guarda.** De ello depende lo que un dato manipulado puede llegar a
   cambiar.
2. **Qué se hace con lo que vuelve**, que puede ser cualquier cosa: texto que no
   es JSON, un formato de otra versión, un servicio que ya no existe en el
   catálogo, números absurdos.

Hay además una tercera pregunta, de privacidad, que esta fase decide no abrir
todavía: si se guardan los datos del cliente. El formulario llega en la Fase 7.

## Opciones consideradas

### Qué se guarda

| Opción                                                                 | A favor                                                                              | En contra                                                                                                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. El presupuesto calculado entero**: líneas, precios, IGIC, totales | Se recupera sin recalcular nada. Un solo `JSON.parse` y está en pantalla             | **Un precio editado a mano se convierte en el precio del presupuesto.** Y los importes guardados caducan: si cambia una tarifa del catálogo, el borrador miente |
| **B. Las líneas con su servicio completo**                             | No hay que buscar nada en el catálogo al recuperar                                   | Mismo problema: el `priceCents` guardado dentro del servicio es editable y no vuelve a comprobarse                                                              |
| **C. Solo identificador, cantidad y meses**                            | Lo guardado **no puede cambiar ningún importe**: todo lo demás sale del catálogo al recuperar. El dato es pequeño y legible | Hay que resolver cada identificador contra el catálogo, y decidir qué hacer si no está                                                                         |

### Qué se hace con un dato que no es válido

| Opción                                                 | A favor                                                                        | En contra                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **D. Cualquier cosa rara y se descarta el borrador**   | Una sola regla, fácil de explicar y de probar                                  | Un presupuesto de cinco servicios se pierde entero porque uno se retiró del catálogo. Se tira lo que sí era recuperable |
| **E. Rescatar todo lo posible**                        | No se pierde trabajo del usuario                                               | Interpretar un formato desconocido es adivinar, y adivinar sobre datos que no son de fiar es como entran los errores |
| **F. Según qué falle** (la adoptada)                   | Descarta lo que no se puede interpretar y conserva lo que sí                   | Tres comportamientos en lugar de uno: hay que documentarlos y probarlos por separado                                 |

## Decisión

**Opción C para el contenido y opción F para la validación.** Decidido por el
usuario al autorizar la Fase 5.

### Se guardan tres campos y ninguno más

Bajo la clave `configurador-presupuestos:budget-draft:v1`:

```json
{ "lines": [{ "serviceId": "seo-basic", "quantity": 1, "months": 12 }] }
```

Ni precios, ni nombres, ni descripciones, ni importes, ni IGIC, ni totales, ni
forma de pago. Al recuperar, el `serviceId` se busca en el catálogo y la línea
guarda **ese** objeto, no una copia: de ahí salen el precio, el nombre y la
forma de pago.

Lo que esto consigue se puede decir en una frase: **editar `localStorage` no
puede rebajar un precio.** Como mucho puede cambiar qué servicios figuran en el
presupuesto, que es exactamente lo que cualquiera puede hacer pulsando botones.

**Y ningún dato personal.** El borrador no guarda nada de nadie: es una lista de
identificadores de catálogo y dos números por línea.

### La versión va en la clave

Si el formato cambia en una fase posterior, la clave pasa a `:v2` y los
borradores escritos con el formato antiguo quedan ignorados **sin llegar a
leerse**. Es la forma más segura de tratar un formato desconocido, porque no hay
que acertar interpretándolo. El precio es que la clave antigua se queda ocupando
unos cientos de bytes en el navegador, y se acepta.

### Tres formas de tratar un dato malo, según qué falle

| Qué falla                                                            | Qué se hace           | Por qué                                                                                                   |
| -------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| La **estructura**: no es JSON, no es un objeto, `lines` no es un array | se descarta todo      | Es un formato desconocido y no se interpreta. Es el caso que describe el apartado 4.6                     |
| Una **línea**: sin identificador, servicio inexistente, repetido      | se descarta esa línea | El resto es trabajo legítimo del usuario. El caso más probable con el tiempo es un servicio retirado      |
| Un **número**: fuera de rango, decimal, texto, ausente                | se normaliza          | El rango válido está definido y `normalizeNumber` ya sabe acercar cualquier valor a él                    |

Dos casos más, por la misma lógica:

- Un `months` guardado en un servicio que **no es mensual** se ignora, y la
  línea se conserva: los meses no intervienen en ningún importe.
- Un servicio **repetido** conserva la primera línea. El presupuesto no admite
  dos líneas del mismo servicio —para eso está la cantidad— y dos líneas
  duplicarían su importe.

### Si no hay almacenamiento, la aplicación funciona igual

`localStorage` puede lanzar una excepción por motivos ajenos al código: cookies
bloqueadas, cuota agotada, o incluso al mencionarlo en algunos navegadores en
modo privado. Las tres funciones de `shared/utils/safeLocalStorage.ts`
convierten cualquier fallo en un valor (`null` o `false`) en lugar de propagarlo,
así que el criterio «sin almacenamiento, todo igual pero sin guardar» se cumple
en un único sitio y no en cada llamada.

### Se lee al crear el estado, no en un efecto

El borrador se lee en la inicialización perezosa del `useReducer`, antes del
primer render. No es un detalle de rendimiento: si se leyera en un efecto
posterior, el primer render tendría el presupuesto vacío y el efecto que guarda
**borraría el borrador antes de que nadie lo leyera**. Primero se lee, después se
escribe.

## Consecuencias

### Buenas

- **Un borrador manipulado no puede cambiar un importe.** Hay un test que
  inyecta `priceCents: 1` en el borrador y comprueba que en pantalla siguen
  saliendo 1.200,00 € más IGIC.
- **El borrador no caduca con el catálogo.** Si mañana cambia una tarifa, los
  borradores guardados muestran el precio nuevo, porque nunca guardaron el
  viejo.
- **El borrador se cura solo.** Como el guardado ocurre en el primer render con
  el estado ya validado, un borrador con basura queda reescrito limpio al cargar
  la página, sin que el usuario toque nada.
- **La lógica se prueba sin navegador.** `serializeDraft` y `parseDraft` son
  funciones puras, con 30 tests entre las dos; solo `draftStorage` y el
  proveedor tocan `localStorage`.
- **Lo guardado se puede leer de un vistazo** en las herramientas del navegador,
  y se ve que no hay nada sensible. Eso tiene valor para explicar el proyecto.

### Costes aceptados

- **Recuperar cuesta una búsqueda por línea** en un catálogo de 12 servicios.
  Irrelevante aquí.
- **Tres comportamientos que hay que documentar y probar** en lugar de una regla
  única. Es lo que ocupa la mayor parte de los 23 tests de `parseDraft`.
- **Un servicio retirado del catálogo desaparece del borrador sin avisar.** Se
  descarta la línea y no se muestra ningún mensaje. Es el caso menos malo de los
  disponibles, pero conviene saber que la aplicación no lo cuenta.

### Lo que queda abierto

**Si los datos del cliente —nombre, empresa y correo— se guardan en el
borrador, se decide en la Fase 7**, no aquí. Lo que ya está decidido es que hoy
no se guarda ninguno, y lo que habrá que pesar entonces es que un nombre y un
correo en `localStorage` son datos personales en un ordenador que puede ser
compartido, mientras que el presupuesto se recupera perfectamente sin ellos. El
sitio donde iría el campo está señalado con un comentario en
`features/budget/draftFormat.ts`, para que la decisión se tome mirando el
formato y no de memoria.

Si se añadieran, la clave pasaría a `:v2`.
