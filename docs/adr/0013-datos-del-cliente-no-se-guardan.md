# ADR 0013 — Los datos del cliente no se guardan en ninguna parte

**Fecha:** 25/11/2026
**Estado:** aceptada
**Fase:** 7

## Contexto

La Fase 7 añade un formulario con el **nombre, la empresa y el correo** de la
persona para la que se hace el presupuesto. Son los primeros datos personales
que la aplicación maneja: hasta ahora solo había servicios, cantidades y meses.

Desde la Fase 5 el presupuesto en curso se guarda en `localStorage` para que
siga ahí al volver ([ADR 0009](0009-borradores-en-localstorage.md)), y lo
guardado es deliberadamente mínimo: identificador del servicio, cantidad y
meses. Aquel ADR dejó abierta una pregunta, la nº 16 de `PROGRESO.md`: **si los
datos del cliente debían guardarse también**.

La tentación es clara y razonable. Si el presupuesto sobrevive a un F5, que el
nombre del cliente desaparezca parece un olvido: quien recarga la página tiene
que escribirlo otra vez.

## Opciones consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| **No guardarlos** (elegida) | La aplicación no almacena ningún dato personal en ninguna parte. No hay nada que proteger, que caducar ni que explicar | Al recargar, el formulario aparece vacío |
| Guardarlos en el borrador | Comodidad: el formulario se rellena solo al volver | Un nombre y un correo quedan en el disco de un equipo que puede ser compartido, **indefinidamente y sin que nadie lo haya pedido**. Y en una agencia, ese equipo es el del comercial, con los datos del último cliente a la vista de quien se siente delante |
| Guardarlos y caducarlos a las horas | Reduce la ventana | Añade un mecanismo de caducidad entero —y sus tests— para un problema que desaparece no guardando el dato |
| Pedir permiso para guardarlos | Decide quien usa la aplicación | Es una funcionalidad de consentimiento que la especificación no pide (apartado 7 de `CLAUDE.md`), con su interfaz, su estado y su texto legal |

## Decisión

**Los datos del cliente no se guardan en ningún sitio: ni en `localStorage`, ni
en `sessionStorage`, ni en una cookie, ni se envían a ningún servidor.** Viven
en la memoria de la página mientras está abierta y desaparecen al cerrarla o
recargarla. Decisión del usuario al autorizar la Fase 7.

El borrador sigue guardando exactamente lo de la Fase 5: identificadores,
cantidades y meses.

### Lo que sostiene la decisión no es una intención, es dónde vive el estado

Esta es la parte que importa, porque una promesa de «no guardamos esto» se
rompe sola en la fase siguiente si lo único que la sostiene es que nadie
escriba la línea que lo guarda.

| Dato | Dónde vive | Consecuencia |
| --- | --- | --- |
| Las líneas del presupuesto | el reducer del Context | el efecto que guarda el borrador las serializa |
| **Los datos del cliente** | **un `useState` de `Configurator`** | **el efecto no las ve: no puede guardarlas** |
| El número y la fecha | un `useState` de `Configurator` | se olvidan al recargar |
| El contador de números | `localStorage`, clave propia | sobrevive ([ADR 0012](0012-numero-de-presupuesto.md)) |

El efecto que escribe el borrador serializa **el estado del reducer**, nada más.
Un dato que vive fuera de él no puede acabar en el navegador por un descuido:
haría falta escribir un segundo mecanismo de guardado a propósito.

Y hay dos tests que lo vigilan, que son lo que convierte la decisión en algo
comprobable:

- Uno de integración, sobre el contenido **real** de `localStorage` después de
  rellenar el formulario con un correo: no aparece ni una `@`. Con **control
  positivo**, porque un «no contiene» puede pasar por mirar en el sitio
  equivocado: el mismo volcado sí contiene `corporate-website` y `lastNumber`,
  así que se está leyendo lo que se cree leer.
- Otro en el formulario: `fetch` no se llama, el `<form>` no tiene `action` —sin
  él, un envío sin interceptar recargaría la página con los datos en la URL— y
  el envío se intercepta de verdad.

### La interfaz lo dice

Si la pantalla no avisara, el formulario vacío tras un F5 parecería un fallo. El
formulario lleva una frase breve que explica que esos datos no se guardan. Es la
misma idea que la pista del selector de meses de la Fase 6: **una decisión que
el usuario no puede ver no se distingue de un error**.

## Consecuencias

### Lo que mejora

- La aplicación **no almacena ningún dato personal**, así que no hay datos que
  filtrar, que cifrar, que caducar ni que justificar. En un repositorio que será
  público, es la propiedad más fácil de verificar: no hay nada que buscar.
- La revisión de secretos de cada fase sigue siendo sencilla, porque ningún dato
  de cliente puede haber llegado a un archivo.
- El documento se imprime con los datos que hay en pantalla en ese momento, que
  son los que acaba de escribir quien lo está emitiendo.

### Lo que cuesta

- **Al recargar la página hay que volver a escribir los tres campos.** Es el
  precio aceptado, y está avisado en la pantalla.
- Hubo una consecuencia de implementación que el usuario aceptó expresamente:
  **vaciar el presupuesto vacía también el formulario**. El formulario solo se
  dibuja cuando hay líneas, así que al quedarse el presupuesto sin ninguna el
  componente se desmonta y pierde su estado. Es coherente con «Empezar de
  nuevo», que olvida el cliente a propósito.

### El detalle de React que estuvo a punto de romperlo

La primera versión ocultaba el formulario con un `return null` dentro del propio
componente. **Devolver `null` no desmonta un componente**: React conserva su
estado, así que los `useState` con el nombre y el correo sobrevivían y el
presupuesto siguiente estrenaba formulario con los datos del cliente anterior.
Un dato personal que se ha decidido no guardar, reapareciendo en el documento de
otra persona.

Lo destapó el test de integración de «Empezar de nuevo», que no se escribió para
eso: comprobaba que el número avanzaba al 0002 con el formulario en blanco. La
decisión de dónde vive la condición —en `Configurator`, que renderiza el
formulario o no lo renderiza— dejó de ser una cuestión de estilo en cuanto se
vio qué pasaba con la otra.

### Lo que hay que vigilar

- Cualquier fase futura que quiera «recordar el último cliente» está cambiando
  esta decisión, no añadiendo una comodidad. Tendría que revisar este ADR
  primero.
- Si alguna vez el proyecto enviara el presupuesto por correo, los datos saldrían
  del navegador y esta decisión habría que escribirla otra vez de cero.
