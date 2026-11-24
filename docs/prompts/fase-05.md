# Registro de prompts — Fase 5: Estado con Context y borradores en localStorage

**Fecha:** 24/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** sacar el estado del presupuesto de `App.tsx` a un Context con `useReducer`, y guardar el presupuesto en curso como borrador en `localStorage`, validando todo lo que vuelve y sin guardar nada que pueda alterar un importe.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque, con los criterios de seguridad escritos antes del plan

> Vamos a empezar la Fase 5 […]: estado con Context y useReducer, y borradores en localStorage, con TDD.
>
> Criterios para esta fase:
>
> - El reducer es una función pura con sus tests, y los componentes no cambian su comportamiento: los 190 tests actuales tienen que seguir en verde.
> - En localStorage se guarda solo lo mínimo: el identificador de cada servicio, la cantidad y los meses. Nunca precios, nombres ni importes: al cargar, todo eso sale siempre del catálogo. **Así nadie puede cambiar un precio editando el navegador.**
> - Todo lo que venga de localStorage se trata como no fiable y se valida: JSON roto, formato desconocido, servicios que ya no existen en el catálogo, servicios repetidos, cantidades o meses fuera de rango (con normalizeNumber), y meses en servicios que no son mensuales. Si algo no es válido, se descarta sin romper la aplicación.
> - Si localStorage no está disponible (navegación privada o bloqueado), la aplicación funciona igual, simplemente sin guardar.
> - La clave de localStorage lleva versión […]
> - No se guarda ningún dato personal. Los datos del cliente llegan en la Fase 7, y allí decidiremos si se guardan o no.
>
> Trabajamos a ritmo normal, sin prisa: si una comprobación aporta algo, se hace.

Lo que este prompt hace y conviene retener: **llega con el modelo de amenaza resuelto**. No dice «guarda el presupuesto», dice qué se guarda, qué no, y por qué: *«así nadie puede cambiar un precio editando el navegador»*. Esa frase es la que decide el formato del borrador, y de ella sale el [ADR 0009](../adr/0009-borradores-en-localstorage.md) entero. También fija la lista de casos inválidos **antes** de que existiera una sola línea de validación, así que los 23 tests de `parseDraft` son la lista del prompt, no un repaso posterior.

### Prompt 2 — Autorización, con un riesgo nombrado y una parada de control

> Autorizo el plan de la Fase 5. Respuestas: 1 (a) el Service va en la acción […]; 2 src/Configurator.tsx; 3 el enfoque mixto […]; 4 ignorar los months en servicios que no son mensuales; 5 **(b): confirmación en dos pasos dentro de la página, sin window.confirm** […] Que sea accesible: el foco va al aviso al abrirlo y vuelve a un sitio lógico al cancelar o confirmar. 6 y 7, sí.
>
> Un riesgo que quiero cubierto con test: **que al arrancar no se escriba el estado vacío encima del borrador antes de leerlo.** El borrador se lee al crear el estado (inicialización perezosa de useReducer), no en un efecto posterior. Quiero un test que monte la aplicación con un borrador guardado y compruebe que, después del primer render, el borrador sigue intacto en localStorage y las líneas aparecen en pantalla. **Ten en cuenta también el doble montaje de StrictMode en desarrollo.**
>
> Haz una parada al terminar el ciclo 4, antes de empezar con React (ciclo 5), con el mismo resumen corto de estado: tests, tsc, lint y format.

### Prompt 3 — Visto bueno y cómo probarlo a mano

> Visto bueno. Sigue con los ciclos 5, 6 y 7.
>
> Para al terminar el 7 […] En esa parada dime también cómo probarlo yo en local, paso a paso y sin dar nada por sabido: 1. Añadir servicios, recargar con F5 […] 2. Pulsar "Empezar de nuevo", cancelar, y luego confirmar. 3. Abrir la aplicación en una ventana de incógnito. 4. Romper el borrador a mano desde las herramientas de desarrollo del navegador y recargar: **qué tecla pulsar, dónde está localStorage en Chrome o Edge, y qué escribir para romperlo.**

### Prompt 4 — Resultado de la prueba, una corrección y una consulta de solo lectura

> Lo he probado en local y funciona […] Una observación para la documentación: el borrador con priceCents **se reescribió limpio al recargar, no al tocar algo** como dijiste. Me parece correcto (guarda la versión ya validada y el borrador se lee antes de guardar), pero confírmalo y descríbelo así en la documentación.
>
> La prueba de bloquear los datos del sitio no la hago, porque está cubierta por los tests automáticos.
>
> Antes de la documentación, una consulta de solo lectura que no cambia nada. Quiero que el documento del máster con los requisitos del TFM no sea visible en el repositorio final, tampoco en el historial. […] No reescribas el historial ni cambies nada: es solo para saber qué habrá que limpiar en la Fase 10.

### Prompt 5 — Alto a una vía ya descartada

> No investigues más el PDF. Revisa tú `docs/prompts/fase-00.md` y el resto de documentos del repositorio que resuman los requisitos del TFM, y dime si el resumen está escrito con nuestras palabras o parece copiado de un documento. Si tienes dudas sobre alguna frase concreta, enséñamela y lo decido yo. Borra el script y el texto extraído de la carpeta temporal […]

---

## 2. Resumen de lo generado

### Archivos nuevos

| Archivo                                      | Qué hace                                                        | Tests |
| -------------------------------------------- | --------------------------------------------------------------- | ----- |
| `context/budgetReducer.ts`                   | El estado y las cinco acciones. Función pura                     | 19    |
| `context/BudgetContext.ts`                   | El Context y el hook `useBudget`                                 | —     |
| `context/BudgetProvider.tsx`                 | Guarda el estado, lee y escribe el borrador                      | 16    |
| `features/budget/draftFormat.ts`             | La clave versionada y la forma de lo guardado                    | —     |
| `features/budget/serializeDraft.ts`          | Líneas → borrador. Función pura                                  | 7     |
| `features/budget/parseDraft.ts`              | `unknown` + catálogo → líneas válidas. Función pura               | 23    |
| `features/budget/draftStorage.ts`            | Junta serialización, validación y navegador                      | 14    |
| `features/budget/ResetBudgetButton.tsx`      | «Empezar de nuevo» con confirmación en dos pasos y foco          | 13    |
| `shared/utils/safeLocalStorage.ts`           | Leer, escribir y borrar sin poder lanzar                         | 8     |
| `Configurator.tsx`                           | El contenido que antes estaba en `App`                           | —     |
| `docs/adr/0009-borradores-en-localstorage.md` | La decisión de qué se guarda y cómo se valida                    | —     |

**110 tests nuevos. Con los 190 anteriores, 300 en verde.**

### Archivos modificados

| Archivo              | Cambio                                                                           |
| -------------------- | -------------------------------------------------------------------------------- |
| `src/App.tsx`        | Deja de tener estado: queda en el proveedor más `<Configurator />`                |
| `src/App.test.tsx`   | **Los ocho tests de la Fase 4, intactos**; se añaden diez de borradores          |
| `src/test/setup.ts`  | Vacía `localStorage` antes de cada test                                          |

### Los siete ciclos TDD

| Ciclo | Qué se probó                              | Fallo visto antes de implementar          | Verde  |
| ----- | ----------------------------------------- | ----------------------------------------- | ------ |
| 1     | `budgetReducer`                           | `Failed to resolve import` — 0 tests      | 19     |
| 2     | `serializeDraft` y el formato             | `Failed to resolve import` — 0 tests      | 7      |
| 3     | `parseDraft`                              | `Failed to resolve import` — 0 tests      | 23     |
| 4     | `safeLocalStorage` y `draftStorage`       | `Failed to resolve import` — 0 tests      | 8 + 14 |
| 5     | `BudgetProvider` y `useBudget`            | `Failed to resolve import` — 0 tests      | 16     |
| 6     | `ResetBudgetButton`                       | `Failed to resolve import` — 0 tests      | 13     |
| 7     | `App` de punta a punta con borradores     | **8 fallos de aserción**                  | 10     |

En el ciclo 7, dos de los tests nuevos **pasaron desde el principio**: el que comprueba que no hay botón «Empezar de nuevo» con el presupuesto vacío y el que comprueba que la aplicación arranca vacía con un borrador dañado. Los dos pasaban por el motivo equivocado —la aplicación no leía ningún borrador todavía—, y conviene registrarlo: en un ciclo TDD con varios tests, los que ya están en verde antes de implementar no demuestran nada hasta que el resto lo esté.

---

## 3. Problemas encontrados y cómo se resolvieron

### P19 — ESLint rechazó la primera versión del botón, y tenía razón

**Síntoma.** Con los 13 tests del botón en verde, `npm run lint` falló:

```
Avoid calling setState() directly within an effect   react-hooks/set-state-in-effect
```

**Causa.** El componente tiene dos estados —«estoy preguntando» y «se acaba de borrar»— que dejan de tener sentido cuando el presupuesto cambia por otra vía: si se vuelven a añadir servicios, el mensaje «se ha borrado» ya no describe la pantalla. Los limpiaba con un `useEffect` que miraba `hasLines`, y eso provoca un **dibujado en cascada**: la pantalla se dibuja primero con el mensaje de más y se corrige después.

**Resolución.** El patrón que documenta React para «ajustar el estado cuando cambia una prop»: guardar el valor anterior en un estado y compararlo **durante el render**. React descarta el render a medias y vuelve a empezar con el estado ya corregido, así que la pantalla nunca llega a dibujarse mal.

**Lo que lo hace un buen episodio para el TFM:** los tests estaban en verde y el comportamiento visible era correcto. Lo que ESLint señaló no fue un fallo, fue un **defecto de diseño con consecuencias visibles solo en un caso límite**. Y la refactorización se hizo con los 31 tests del botón y de `App` como red: en verde antes y en verde después, sin tocar ninguno.

### P20 — El test de `StrictMode` podía estar en verde sin probar nada

**Síntoma.** No hubo síntoma. El test que el usuario pidió —que el doble montaje de `StrictMode` no destruya el borrador— pasó a la primera.

**La duda.** Un test que dice «aguanta el doble montaje» solo vale si en el entorno de test **hay** doble montaje. `StrictMode` duplica el montaje en desarrollo, y si Vitest ejecutara una compilación de producción de React, el test estaría en verde sin haber ejercido nada de lo que dice su nombre.

**Cómo se resolvió.** Un espía que cuenta las lecturas de `localStorage` durante el arranque, con una aserción de que son **más de una**. El arranque solo lee una vez —la del borrador, al crear el estado—, así que más de una lectura significa que el montaje ha ocurrido dos veces de verdad.

**Lo que enseña.** Es el **control positivo aplicado a un test**, no a una búsqueda. Normalmente se pregunta «¿este test puede fallar si el código está mal?»; aquí la pregunta era «¿este test está ejecutando la situación que describe?», y la respuesta no se podía deducir leyéndolo.

### P21 — Una búsqueda de correos que no podía dar positivo

**Síntoma.** Durante la revisión del historial, la búsqueda de direcciones de correo en los mensajes de commit devolvió **cero coincidencias**. Los mensajes sí contienen una dirección: la línea `Co-Authored-By` de cada commit.

**Causa.** La expresión regular estaba escrita con escapes de BRE (`\+`, `\{2,\}`) y se le pasó la opción `-E`, que la interpreta como ERE. En ERE, `\+` deja de significar «uno o más» y pasa a ser **un signo más literal**, así que la expresión buscaba algo que no existe.

**Cómo se detectó.** El control positivo: la misma orden buscando una simple `@` encontró los diez commits. Sin él, el informe habría dicho «no hay ninguna dirección en los mensajes de commit» y habría sido falso.

**Resolución.** Repetir la búsqueda con la expresión bien escrita —solo aparece la dirección de atribución de Anthropic, diez veces— y rehacer además la búsqueda del contenido **por un camino distinto** (`git log --all -p` sobre todos los diffs, en lugar de `git grep` sobre los árboles), como exige el apartado 5 de `CLAUDE.md` cuando un control falla. Los dos caminos coinciden.

**Es la cuarta aparición de la misma familia de problemas**, y la serie es ya un hilo del proyecto: el correo de la Fase 1, las diez categorías en verde de la Fase 2 (**P9**), el rótulo «tsc sin errores» de la Fase 4 (**P15**) y esta.

### P22 — El foco no se podía atar al clic

**Síntoma.** La primera versión de la gestión del foco decidía adónde moverlo según **qué botón se había pulsado**. Al escribir el test de «confirmar», apareció un desajuste: en la aplicación, confirmar cambia dos estados a la vez —el del botón y el del presupuesto, que está en el proveedor— y React los agrupa en un solo dibujado; en el test, el cambio del proveedor se simula con un `rerender` aparte, así que llegan en dos pasos.

**Consecuencia.** La lógica atada al clic funcionaba en la aplicación y dejaba el foco en el aire en el test, es decir, **daba un resultado distinto según cómo llegaran los cambios**. Eso no es un problema del test: es una señal de que la lógica dependía de un orden que no controla.

**Resolución.** Mover el foco según **lo que hay en pantalla** y no según lo que se pulsó: el componente calcula cuál de sus cuatro vistas corresponde, y un efecto reacciona al cambio de vista. Con eso, los dos caminos —agrupado y en dos pasos— acaban igual.

### P23 — Volver a intentar lo que ya había fallado en la Fase 0

**Síntoma.** Para comprobar si algún documento copiaba literalmente del PDF del máster, el asistente escribió un script en Node con `zlib` para extraer el texto del PDF. Devolvió ruido binario.

**Causa.** El PDF no permite extraer su texto con las herramientas disponibles. **Eso estaba ya escrito en el repositorio**, en el problema **P1** del registro de la Fase 0, con los tres intentos que fallaron entonces —el lector del agente sin `poppler`, Python sin instalar y un script de Node con `zlib`, que devolvió 2 bytes—. El tercero es exactamente el que se repitió.

**Resolución.** El usuario lo paró, pidió revisar los documentos leyéndolos y borrar el script. La revisión se hizo así y no hizo falta nada más: ninguno de los tres sitios que resumen los requisitos contiene citas literales.

**Lo que enseña, y no es cómodo:** el registro del proyecto solo sirve si se lee **antes** de actuar, y en esta ocasión no se leyó. Es además una reincidencia en la corrección **C0-4** de la Fase 0 («no insistir en una vía técnica que ya ha fallado»), con la misma vía técnica y el mismo archivo.

---

## 4. Decisiones tomadas en esta fase

| Decisión                                                                     | Motivo                                                                                                                                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El borrador guarda **solo identificador, cantidad y meses**                   | Decisión del usuario. Lo guardado no puede cambiar ningún importe, y el borrador no caduca si cambia una tarifa. [ADR 0009](../adr/0009-borradores-en-localstorage.md) |
| La versión del formato va **en la clave**                                     | Un formato desconocido se ignora sin leerlo, que es la forma más segura de tratarlo                                                                                 |
| **Tres respuestas distintas** según qué falle del borrador                    | Decisión del usuario: descartar todo si la estructura no se entiende, descartar la línea si es ella, y normalizar los números                                       |
| La acción de añadir lleva el **servicio entero**, no su identificador         | Decisión del usuario. El reducer no conoce el catálogo: se prueba con servicios inventados y la traducción ocurre en un solo sitio                                   |
| El estado del presupuesto **son las líneas**                                  | Lo marcado en el catálogo se deriva de ellas: no hay dos listas que puedan discrepar. Si la Fase 7 guardara datos del cliente, el estado pasaría a ser un objeto    |
| El Context expone **funciones con nombre**, no el `dispatch`                   | Los componentes de la Fase 4 encajan sin cambiar, y nadie más necesita el catálogo para construir una acción                                                       |
| El proveedor va **dentro de `App`**                                           | Así `<App />` es la aplicación completa y los ocho tests de integración de la Fase 4 siguen funcionando sin envolverlos                                             |
| El contenido de `App` se muda a **`Configurator.tsx`**                         | Un componente no puede consumir un Context que él mismo renderiza                                                                                                   |
| El valor inicial del Context es **`null`**                                     | Permite distinguir «no hay proveedor» de «el presupuesto está vacío». Con un valor verosímil, un componente mal colocado funcionaría a medias                       |
| `useBudget` **lanza** si se usa fuera del proveedor                            | No es un dato de nadie, es un error de programación: tiene que aparecer en el primer render                                                                          |
| El borrador se lee en la **inicialización perezosa** del `useReducer`          | Si se leyera en un efecto, el guardado del primer render borraría el borrador antes de leerlo                                                                       |
| Guardar es **un efecto**, no parte de cada acción                              | Un solo sitio que escribe, en lugar de cinco que podrían olvidarse                                                                                                  |
| Un presupuesto vacío **borra la clave**                                        | No deja un borrador vacío ni un rastro de uso sin ninguna utilidad                                                                                                  |
| `safeLocalStorage` vive en **`shared/`**                                       | No sabe nada de presupuestos: guarda y lee JSON. La Fase 7 probablemente lo necesite                                                                                |
| Lo que se lee de `localStorage` es **`unknown`**                               | Un tipo de TypeScript no comprueba nada en ejecución: declarar que lo leído es un borrador sería una promesa que nadie verifica                                     |
| «Empezar de nuevo» con **confirmación en dos pasos**                           | Decisión del usuario sobre la recomendación del asistente, que era un botón directo. Borrar no se puede deshacer                                                    |
| **No `window.confirm`**                                                        | No se puede etiquetar en español, bloquea la página, algunos navegadores permiten silenciarlo y no se puede probar sin sustituir una función global                 |
| El foco va **al aviso**, no al botón de borrar                                 | El mismo Enter que abre el aviso lo confirmaría sin que nadie lea la pregunta                                                                                        |
| El botón de reiniciar va **fuera de `BudgetPanel`**                            | Borrar el presupuesto no es parte del resumen, y así el panel y sus doce tests no cambian                                                                            |
| `localStorage.clear()` en `setup.ts`                                           | jsdom tiene un solo almacenamiento por archivo de test: sin esto, cada test heredaría el borrador del anterior                                                       |

---

## 5. Correcciones del usuario y por qué

Esta fase tiene siete. Dos son de método, dos de producto, dos de precisión en lo que se afirma y una de estado: comprobar en lugar de recordar.

### C5-1 — El borrador se reescribe al cargar, no al tocar algo

**Corrección.** En las instrucciones de prueba manual, el asistente escribió que el borrador manipulado se reescribiría limpio «en cuanto toques cualquier cosa». El usuario probó y corrigió: *«se reescribió limpio al recargar, no al tocar algo. Me parece correcto (guarda la versión ya validada y el borrador se lee antes de guardar), pero confírmalo y descríbelo así en la documentación»*.

**Por qué tenía razón.** El efecto que guarda se ejecuta justo después del **primer** dibujado, y en ese momento el estado ya son las líneas validadas. Lo que describió el asistente sería el comportamiento si el guardado dependiera de una acción del usuario, que no es el caso. La descripción equivocada no venía de un error del código, sino de no haber seguido el orden de ejecución de lo que se acababa de escribir.

**Lo que lo hace valioso:** la corrección venía con **la explicación correcta incluida** —«el borrador se lee antes de guardar»—, es decir, el usuario había entendido el mecanismo mejor que la descripción que estaba corrigiendo. Y pidió confirmarlo antes de documentarlo, en lugar de aceptar la explicación nueva tal cual. Se confirmó y se fijó con un test (`reescribe ya limpio, en el primer render, un borrador con datos de más`), así que la documentación describe algo comprobado y no algo observado una vez.

### C5-2 — No insistir en el PDF; mirar los documentos

**Corrección.** Ver el problema **P23**. El asistente volvió a intentar extraer el texto del PDF con un script de Node, que es el tercer intento fallido de la Fase 0. El usuario lo paró: *«No investigues más el PDF. Revisa tú `docs/prompts/fase-00.md` y el resto de documentos […] Si tienes dudas sobre alguna frase concreta, enséñamela y lo decido yo»*.

**Por qué tenía razón, dos veces.** Primero, porque la vía ya estaba descartada por escrito en el repositorio. Y segundo, porque **la pregunta no necesitaba el PDF**: lo que se quería saber es si nuestros documentos están escritos con nuestras palabras, y eso se contesta leyéndolos. La comparación automática contra el original era una respuesta más ambiciosa a una pregunta que no la pedía.

**Y la corrección trae su propio reparto de trabajo:** el asistente señala las frases dudosas y **decide el usuario**. Se señalaron dos —una que nombra el procedimiento interno de entrega de la plataforma del máster y otra que nombra el máster y la escuela—, ninguna de ellas un error, las dos decisiones suyas.

### C5-3 — Confirmación en dos pasos, en contra de la recomendación

**Corrección.** El plan ofrecía tres variantes para el botón de empezar de nuevo y recomendaba la más simple: un botón directo, «porque es lo que pide la especificación, sin más». El usuario eligió la (b): confirmación en dos pasos dentro de la página, sin `window.confirm`, *«que sea accesible: el foco va al aviso al abrirlo y vuelve a un sitio lógico al cancelar o confirmar»*.

**Por qué tenía razón.** El argumento del asistente —«la especificación dice un botón»— confundía la letra con el objetivo. La acción **no se puede deshacer**: no hay historial, ni papelera, ni copia. Un clic accidental destruye el trabajo, y el coste de evitarlo son treinta líneas y una sesión de tests.

**Lo que añadió y no estaba en ninguna de las tres variantes:** el requisito del foco. Esa frase es la que convirtió un «¿seguro?» en una pieza accesible, y es también la que generó los cuatro tests de foco y el problema **P22**.

### C5-4 — Un riesgo nombrado antes de que existiera el código

**Corrección.** No corrige nada ya hecho: añade un requisito al plan aprobado. *«Un riesgo que quiero cubierto con test: que al arrancar no se escriba el estado vacío encima del borrador antes de leerlo […] Ten en cuenta también el doble montaje de StrictMode en desarrollo.»*

**Por qué es la petición más fina de la fase.** El plan ya decía que el borrador se leería en la inicialización perezosa, así que el riesgo estaba **evitado por diseño** y era muy fácil de dar por resuelto. Lo que el usuario pidió no fue el diseño, fue **la prueba de que el diseño sigue ahí**: un test que falle el día que alguien mueva esa lectura a un efecto porque le parezca más ordenado.

Y la segunda frase vale por sí sola: `StrictMode` monta dos veces en desarrollo, y es exactamente la situación en la que un guardado mal colocado destruye datos. Eso no sale de leer el plan; sale de saber qué hace la herramienta. De ahí salió el problema **P20**: comprobar que el test del doble montaje está ejerciendo un doble montaje.

### C5-5 — Dos paradas de control a mitad del trabajo

**Corrección.** *«Haz una parada al terminar el ciclo 4, antes de empezar con React»* y, después, *«Para al terminar el 7, antes de la documentación y el commit»*, las dos con el mismo resumen de estado: tests, `tsc`, lint, formato y build.

**Por qué importa.** Las dos paradas caen en fronteras reales del trabajo: la primera separa la lógica pura —cuatro ciclos sin una línea de React— del código de componentes, y la segunda separa el código de la documentación. Partir el trabajo así tiene un efecto que se notó: en la parada del ciclo 4 el estado era revisable en un minuto, y la del ciclo 7 destapó el error de ESLint (**P19**) antes de que hubiera documentación escrita describiendo un diseño que iba a cambiar.

**Es gobierno, no desconfianza.** Un agente que trabaja siete ciclos seguidos y aparece al final con 110 tests y diez archivos nuevos entrega algo que no se puede revisar.

### C5-6 — Decidir no hacer una comprobación, con el criterio del proyecto

**Corrección.** Es la más interesante de las seis, porque la aplicó el usuario **sobre sí mismo**: *«La prueba de bloquear los datos del sitio no la hago, porque está cubierta por los tests automáticos»*.

**Por qué es correcto.** El asistente había propuesto esa prueba manual y, al describirla, había añadido que el caso ya estaba cubierto por dos tests que fuerzan a `localStorage` a lanzar excepciones, y que la prueba manual añadía poco. El usuario aplicó la norma de ritmo del apartado 1 de `CLAUDE.md` —su propia norma, acordada en la Fase 3— y descartó la comprobación que no cambiaba ninguna decisión, quedándose con las cuatro que sí: recargar, el botón, el incógnito y romper el borrador a mano.

**Lo que enseña, y sirve para el documento final:** la norma de «comprobar solo lo que decide» no es una excusa del agente para hacer menos. Es un criterio de los dos, y aquí lo usó la persona para no gastar tiempo en tocar la configuración de su navegador y tener que acordarse de deshacerlo.

### C5-7 — Comprobar el estado, no recordarlo

**Corrección.** Antes de la revisión de secretos, el usuario paró el trabajo: *«dime en qué estado está cada uno de estos puntos, **comprobándolo, no de memoria**»*, y pidió la evidencia de cuatro cosas concretas: la frase neutralizada, la existencia de `docs/privado/`, la salida de `git check-ignore -v` para el PDF en su ubicación nueva, y si se había hecho `git add` o algún commit.

**Qué encontró la comprobación.** Que **ninguno de los cuatro estaba hecho**. El asistente había señalado las dos frases dudosas y se había quedado esperando una decisión, sin decirlo con claridad al pasar a la documentación; la carpeta `docs/privado/` no existía; y el PDF seguía protegido solo por una regla de ruta exacta.

**Por qué la forma de preguntar es la lección.** Cuatro preguntas con su evidencia pedida por adelantado —una línea de un archivo, un `ls`, la salida de una orden concreta y dos órdenes de Git— no se pueden contestar de memoria ni de forma aproximada. Es la misma supervisión de la corrección **C4-9** de la Fase 4 («pedir la evidencia no es desconfianza, es el procedimiento»), y aquí además destapó cuatro cosas sin hacer en lugar de confirmar cuatro hechas.

**Y trajo una mejora de fondo**: pasar de ignorar **un archivo** a ignorar **una carpeta**. La regla antigua protegía el documento que ya existía; la carpeta protege los que aparezcan. Es exactamente el criterio que el apartado 5 de `CLAUDE.md` aplica a la revisión de secretos —categorías de datos y no archivos conocidos— trasladado al `.gitignore`.

**Un detalle de orden que la corrección obligó a pensar:** la regla de exclusión tiene que existir **antes** de mover el archivo. Al revés, el PDF pasa por una ruta no ignorada y cualquier `git add -A` en esa ventana lo mete en el índice. Es la norma del apartado 1 de `CLAUDE.md` —una comprobación no puede ir en el mismo paso que la acción que condiciona— aplicada a una mudanza de archivos.

---

## 6. Aprendizajes de la fase

### 1. Dónde se lee el estado inicial decide si el guardado es seguro

El mismo código —leer un borrador y guardarlo cuando cambia— es correcto o destructivo según **cuándo** se lea:

| Dónde se lee el borrador        | Qué pasa en el primer render                                                      |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Al crear el estado              | el estado nace con las líneas: nunca existe un instante en que valga «vacío»      |
| En un efecto posterior          | el primer render está vacío, y el efecto que guarda **borra el borrador**         |

La versión mala no falla a veces: falla **siempre**, y en silencio, porque borrar un borrador no produce ningún error. Lo único que se ve es que la aplicación «no guarda», y eso se confunde con cualquier otra cosa.

Es un buen ejemplo para explicar qué aporta nombrar un riesgo por adelantado: el diseño correcto cuesta lo mismo que el incorrecto si se decide antes, y cuesta una tarde de depuración si se decide después.

### 2. El control positivo también se aplica a los tests

El proyecto llevaba desde la Fase 2 aplicando el control positivo a las **búsquedas**. Esta fase lo ha aplicado a un **test**: el del doble montaje de `StrictMode` pasaba, pero nada demostraba que estuviera ejerciendo un doble montaje. Un espía que cuenta las lecturas del almacenamiento lo convirtió en una comprobación de verdad.

La pregunta que conviene hacerse ante un test que pasa a la primera no es solo «¿podría fallar si el código estuviera mal?», sino **«¿está ocurriendo la situación que describe su nombre?»**. Son dos preguntas distintas y la segunda casi nunca se hace.

### 3. Cuarta aparición de la comprobación que no puede dar negativo

La serie del proyecto suma una: una expresión regular que mezclaba escapes de BRE con el modo ERE y por tanto **no podía encontrar nada**. Dijo «no hay ninguna dirección de correo en los mensajes de commit» y la había en los diez.

| Fase | Episodio                                             | Qué lo delató                  |
| ---- | ---------------------------------------------------- | ------------------------------ |
| 1    | Un correo en texto plano que la lista de archivos no veía | Búsqueda por categorías        |
| 2    | Diez categorías en verde buscando en los nombres     | Control positivo (**P9**)      |
| 4    | «tsc sin errores» impreso encima de un error         | El usuario, al leer la pantalla |
| 5    | Expresión BRE con `-E`: nunca podía coincidir        | Control positivo (**P21**)     |

Lo que la serie enseña ya no es una técnica, es un hábito: **una comprobación en verde no dice nada hasta que se demuestra que puede ponerse en rojo.**

### 4. ESLint puede revisar el diseño, no solo el estilo

`react-hooks/set-state-in-effect` paró una versión del botón que tenía sus 13 tests en verde y se comportaba bien en pantalla. Lo que señalaba no era un error visible, era un dibujado en cascada: la pantalla se pintaba primero mal y se corregía después.

Para alguien que viene de PHP y CSS es un buen ejemplo de qué aportan estas herramientas más allá del formato: **había una forma mejor de escribirlo, y la regla sabía cuál.** El arreglo fue sustituir un efecto por una comparación durante el render, y los 31 tests afectados siguieron en verde sin tocar ninguno.

### 5. El foco no se ata a lo que se pulsa, sino a lo que hay en pantalla

La gestión del foco escrita «al pulsar confirmar, mueve el foco aquí» daba resultados distintos según si los dos cambios de estado llegaban juntos o por separado, y eso ocurre de verdad: React agrupa los cambios de un mismo evento, pero un test puede simularlos en dos pasos.

La versión que funciona calcula **qué vista corresponde** y reacciona al cambio de vista. Es la misma idea que ya guiaba el estado del presupuesto —lo que se puede derivar no se guarda— aplicada al foco.

### 6. Una deuda bien colocada se cobra sola

La validación de números de esta fase son cuatro llamadas a `normalizeNumber` y **ningún caso especial**, porque en la Fase 4 el usuario decidió que esa función recibiera `unknown` pensando exactamente en este momento. El caso «faltan los meses» no necesitó ni una línea: el mínimo del rango es el `minMonths` del servicio, así que un valor ausente devuelve los meses mínimos, que es con los que nace una línea nueva.

Es el mejor argumento del proyecto a favor de decidir las fronteras antes de necesitarlas, y no es una intuición del asistente: es una decisión del usuario de hace una fase, con su motivo escrito.

### 7. Validar no es una regla, son tres

La tentación al validar datos que no son de fiar es tener una sola respuesta —descartar— porque es fácil de explicar y de probar. La decisión del usuario fue separar tres casos:

- la **estructura** no se interpreta: se descarta todo;
- una **línea** mala se descarta sola, porque lo demás es trabajo legítimo;
- un **número** fuera de rango se acerca al rango, porque el rango está definido.

La diferencia práctica se ve con un ejemplo: un presupuesto de cinco servicios del que uno se ha retirado del catálogo. Con la regla única se pierden los cinco; con las tres, se pierde uno.

### 8. Una lista de archivos protege el pasado; una carpeta protege el futuro

El PDF de requisitos estaba excluido del repositorio por su **nombre exacto**. Funcionaba, y sigue siendo cierto que ese archivo no se versiona. Pero la protección solo cubría el documento que ya existía: el día que aparezca otro material ajeno en `docs/`, nadie garantiza que quien lo deje ahí se acuerde de añadir su nombre al `.gitignore`.

Pasar a ignorar **`docs/privado/` entera** cambia la naturaleza de la protección: deja de depender de que alguien se acuerde. Es el mismo razonamiento que el apartado 5 de `CLAUDE.md` aplica a la revisión de secretos —buscar categorías de datos y no archivos conocidos— trasladado al `.gitignore`, y la misma idea que el apartado 4 con los finales de línea: **la protección tiene que estar en el repositorio y no depender de una persona.**

Y un detalle de orden que vale para cualquier mudanza de archivos sensibles: **la regla de exclusión primero, el movimiento después.** Al revés queda una ventana —de segundos, pero existe— en la que el archivo está en una ruta no ignorada.

### 9. Lo que está en el registro hay que leerlo antes de actuar

El asistente repitió un intento técnico que el propio repositorio documentaba como fallido, en el archivo del que estaba hablando. El coste fue pequeño —un script y dos minutos— pero el problema es de método: el registro de prompts existe para que las lecciones de una fase lleguen a la siguiente, y eso solo funciona si se consulta **antes**, no si se cita después.

---

## 7. Momentos para el vídeo

### Momento 1 — El precio falso que la aplicación ignora

**Qué se ve:** la aplicación con «Web corporativa» en el presupuesto, a 1.200,00 € más IGIC. Se abre F12 → Application → Local Storage, y se enseña lo único que hay guardado:

```json
{ "lines": [{ "serviceId": "corporate-website", "quantity": 1 }] }
```

Se señala lo que **no** hay: ni nombres, ni precios, ni totales. Después se edita a mano el valor para añadir `"priceCents": 1`, se pulsa Enter y **F5**. En pantalla, la web corporativa sigue costando 1.200,00 €.

Y al volver a mirar Local Storage, el `priceCents` ha desaparecido: la aplicación reescribió el borrador ya validado al cargar la página.

**Por qué merece estar en el vídeo:** se entiende sin saber programar, en veinte segundos, y demuestra una decisión de seguridad con una acción, no con una afirmación. Es además la respuesta a la pregunta que cualquier tribunal hará sobre una aplicación sin backend: *si todo está en el navegador, ¿no puede el usuario cambiar los precios?* La respuesta se ve en pantalla.

### Momento 2 — El borrador roto y la aplicación que no se rompe

**Qué se ve:** en Local Storage se sustituye el borrador por un JSON cortado por la mitad —`{"lines":`— y se pulsa F5. La aplicación arranca con el presupuesto vacío, sin pantalla en blanco y **sin un solo error en la consola**, que se enseña abierta al lado.

Después, los tres casos que el usuario escribió en el prompt de arranque antes de que existiera el código: un servicio que ya no está en el catálogo (desaparece esa línea y el resto se conserva), 10.000 unidades y 500 meses (quedan en 99 y 36), y un formato desconocido (presupuesto vacío).

Se cierra con el archivo `parseDraft.test.ts` y sus 23 tests, que son esa misma lista.

**Por qué merece estar en el vídeo:** es el apartado 4.6 de la especificación cumplido y comprobable, y enseña el recorrido completo de la metodología: un criterio escrito en un prompt → una lista de casos → un test por caso → el comportamiento en pantalla.

### Momento 3 (alternativa) — La confirmación, con el teclado

**Qué se ve:** se llega al botón «Empezar de nuevo» con el tabulador y se abre con Enter. El contorno del foco queda en **el recuadro del aviso**, no en el botón de borrar, y un lector de pantalla lee la pregunta completa. Un `Tab` lleva a «Sí, borrar»; otro, a «Cancelar». Al cancelar, el foco **vuelve al botón de donde venía**.

Al lado, la frase del usuario que lo pidió —«el foco va al aviso al abrirlo y vuelve a un sitio lógico al cancelar o confirmar»— y los cuatro tests que lo fijan.

**Por qué merece estar en el vídeo:** muestra accesibilidad real, de la que no sale en ninguna lista de comprobación automática, y muestra al usuario eligiendo lo más costoso sobre la recomendación del asistente, que proponía un botón directo porque «es lo que pide la especificación».

---

**Recomendación para el guion:** el **1** es el más rentable de toda la fase —responde a la pregunta incómoda de una aplicación sin backend con una demostración de veinte segundos— y el **2** es el que mejor enseña la metodología completa, del prompt al test y del test a la pantalla. El **3** se queda fuera si hay que elegir dos, porque el foco es difícil de ver en vídeo sin narrarlo.
