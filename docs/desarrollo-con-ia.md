# Cómo he desarrollado esta aplicación con IA

**Trabajo Final de Máster** — Máster en Desarrollo con Inteligencia Artificial
(BIG School)

**Fecha:** 28/11/2026

Este documento explica **cómo** se ha construido el Configurador de
Presupuestos: el proceso, la forma de trabajar con la IA, las decisiones, los
problemas y cómo se resolvieron. No describe la aplicación —eso está en el
[README](../README.md)— sino el método.

Todas las cifras que aparecen aquí salen de archivos de este repositorio o de
`git log`. Ninguna está redondeada ni escrita de memoria.

---

## 1. Resumen del proyecto

El Configurador de Presupuestos es una aplicación web en la que se eligen los
servicios de una agencia de desarrollo web y marketing digital y se obtiene el
presupuesto calculado al instante, con sus descuentos, su IGIC y el desglose en
pago inicial, cuota mensual y pago anual. Con el presupuesto hecho se escriben
los datos del cliente y se obtiene un documento final, con su número y su fecha
de validez, listo para imprimir o guardar en PDF desde el navegador.

No tiene backend, ni base de datos, ni inicio de sesión: todo el cálculo ocurre
en el navegador ([ADR 0002](adr/0002-sin-backend.md)). La aplicación es sencilla
a propósito; lo que el proyecto quería demostrar es **cómo está construida**.

Los datos que enmarcan el resto del documento. Las dos primeras filas describen
**el proyecto completo**; las demás están **medidas al cierre de la Fase 10**
(27/11/2026), la última fase ya documentada cuando se escribe esto:

| Dato                                  | Valor                                                        |
| ------------------------------------- | ------------------------------------------------------------ |
| Fases (proyecto completo)             | **doce**, numeradas de la Fase 0 a la Fase 11                |
| Días de desarrollo (proyecto completo) | **seis** (23/11/2026 – 28/11/2026)                          |
| Commits en `main`                     | **22**                                                       |
| Archivos versionados                  | **161**                                                      |
| Tests                                 | **560 de Vitest** y **5 recorridos de Playwright**, en verde |
| Decisiones registradas                | **13 ADR**                                                   |
| Problemas registrados                 | **50**                                                       |
| Correcciones del usuario              | **79**                                                       |

La aplicación está publicada en
https://configurador-presupuestos.vercel.app y el código en
https://github.com/Owencl9/configurador-presupuestos.

---

## 2. El proceso por fases

| Fase   | Qué entró                                                           | Cierre   | Commits              |
| ------ | ------------------------------------------------------------------- | -------- | -------------------- |
| 0      | Inventario del entorno, riesgos y decisiones previas                | 23/11    | — (sin código)       |
| 1      | Proyecto con Vite, Tailwind y Vitest; Git; primer componente con TDD | 24/11    | `d4a12de`, `8041d05` |
| —      | **Despliegue adelantado en Vercel**                                 | 24/11    | `f052f87`            |
| 2      | Tipos del dominio y catálogo de doce servicios                      | 24/11    | `8814d83`, `8767605` |
| 3      | Lógica de negocio con TDD: formato en euros, subtotales e IGIC       | 24/11    | `727167e`, `12d4d15` |
| 4      | Componentes del presupuesto: líneas, selectores y resumen            | 24/11    | `259552a`, `06800a0` |
| 5      | Estado con Context y `useReducer`; borradores en `localStorage`      | 24/11    | `fd89b2d`, `c07f289` |
| 6      | Descuentos con el patrón Strategy y el motivo de cada uno            | 25/11    | `7f15f93`, `98f9c97` |
| 7      | Formulario de cliente, número de presupuesto y documento imprimible  | 25/11    | `99dd7ba`, `835940f` |
| 8      | Cinco recorridos de extremo a extremo con Playwright                 | 26/11    | `77bd38e`, `9e2c918` |
| 9      | Accesibilidad automática, cobertura, Husky e integración continua    | 26/11    | `e62115e`, `3fbe9ab` |
| 10     | Revisión del historial, CSP, Dependabot y repositorio público        | 27/11    | `1f639f8`, `7ed6a31` |
| 11     | Documentación de entrega: este documento y el registro final         | 28/11    | el de esta fase y su verificación |

Un commit más, `caaf6bd`, corrige entre las fases 1 y 2 el rastreo de clases de
Tailwind, que estaba compilando utilidades a partir del texto de la
documentación. Con él, los 22 del cierre de la Fase 10.

**Dos decisiones del proceso merecen un párrafo.**

La primera es que **el despliegue se adelantó a la Fase 1**: la aplicación
estuvo publicada en Vercel desde el segundo día, con un solo componente dentro.
Un despliegue que se prueba al final es un riesgo concentrado justo donde no
queda margen, y el proyecto prefirió pagarlo cuando fallar no costaba nada. De
ahí sale el patrón de los dos commits por fase del apartado 3.

La segunda es que **ninguna fase empezó sin autorización expresa**. El plan se
presentaba antes de tocar un archivo —qué se iba a conseguir, qué archivos se
tocaban, qué comandos se iban a lanzar— y se esperaba el permiso. No es una
formalidad: es lo que permitió que decisiones como no reescribir el historial de
Git, o no guardar los datos del cliente, se tomaran con los datos delante y no
como efecto secundario de una implementación ya hecha.

---

## 3. Cómo he trabajado con la IA

La herramienta principal ha sido **Claude Code** (modelo Opus 5) sobre la
extensión de Visual Studio Code. El encargo inicial está en
[docs/prompt-maestro.md](prompt-maestro.md), que le asigna **cinco roles**:
desarrollador frontend, arquitecto de software, responsable de calidad,
especialista en seguridad y tutor técnico.

El quinto es el que más cambia la práctica. El prompt maestro pide expresamente
que no se presuponga conocimiento de React, TypeScript, Vite, Vitest ni
Playwright, y eso convierte cada paso en dos: hacer y explicar. El efecto más
útil no era el buscado: **una explicación mal construida delata una decisión mal
tomada**. Varias de las correcciones del apartado 6 aparecieron porque la
explicación no cuadraba, no porque el código fallara.

Tres mecanismos han sostenido la supervisión.

**El modo Manual.** Claude Code se usó en el modo que pide aprobación para cada
edición y cada comando antes de ejecutarlo. Nada se escribió ni se ejecutó sin
pasar por una pantalla de confirmación, y las ediciones se revisaron en el panel
de diferencias. De ahí sale una de las normas del proyecto: **los archivos se
editan con la herramienta de edición, nunca con comandos de shell**, porque lo
que escribe un comando no aparece en ese panel y deja de poder revisarse antes
de aceptarlo.

**`CLAUDE.md` como memoria de normas.** El archivo
[CLAUDE.md](../CLAUDE.md) de la raíz recoge las reglas permanentes del
repositorio, y ha ido creciendo: cada corrección que valía para más de una fase
se escribió allí **antes** de empezar la siguiente. La lección de una fase se
convierte en regla de la siguiente, y la regla llega antes del trabajo.

**Dos commits por fase, y se revisan por separado.** Cada fase cierra con un
commit del trabajo y, después, uno de verificación, porque **lo que cada uno
afirma se comprueba en sitios distintos**. El primero se revisa contra el código,
los tests y el lint en local: es todo lo que se puede saber sin salir del equipo.
El segundo solo se puede escribir después de mirar la integración continua, el
despliegue de Vercel y la aplicación publicada en un navegador real. Mezclarlos
obligaría a redactar un resultado de producción antes de tenerlo, que es
exactamente la clase de afirmación que este proyecto ha aprendido a no escribir.

**Y un segundo asistente como revisor externo.** Además de Claude Code, usé
Claude en el chat para revisar desde fuera los planes de fase, cada aviso de
permiso antes de aceptarlo, los mensajes de commit y las cifras que iban a
quedar escritas. Muchas de las correcciones registradas en el apartado 6 salieron
de esa revisión: un asistente que no está ejecutando la tarea no arrastra sus
suposiciones, y por eso ve lo que el otro da por hecho. La decisión final, en
todos los casos, fue mía.

---

## 4. Las decisiones importantes

Trece decisiones tienen su propio documento en [docs/adr/](adr/), con contexto,
opciones, decisión y consecuencias.

| Ámbito           | ADR                                                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Herramientas     | [0001](adr/0001-stack-react-typescript-vite-tailwind.md) el stack; [0005](adr/0005-eslint-en-lugar-de-oxlint.md) ESLint en lugar de Oxlint, el nuevo valor por defecto de Vite                                                                                                                    |
| Forma del proyecto | [0002](adr/0002-sin-backend.md) sin backend, sin base de datos y sin autenticación                                                                                                                                                                                                             |
| El dinero        | [0003](adr/0003-dinero-en-centimos.md) céntimos con enteros; [0007](adr/0007-redondeo-del-igic.md) redondeo del IGIC y un bloque por forma de cobro                                                                                                                                              |
| Reglas de negocio | [0004](adr/0004-strategy-para-descuentos.md) Strategy para los descuentos; [0010](adr/0010-como-se-aplican-los-descuentos.md) cómo se aplican; [0006](adr/0006-niveles-como-servicios-independientes.md) niveles como servicios independientes; [0008](adr/0008-el-primer-pago-es-presentacion.md) el primer pago es presentación; [0011](adr/0011-sin-compromiso-total.md) sin compromiso total |
| Los datos        | [0009](adr/0009-borradores-en-localstorage.md) el borrador guarda identificadores, no precios; [0012](adr/0012-numero-de-presupuesto.md) el número de presupuesto; [0013](adr/0013-datos-del-cliente-no-se-guardan.md) los datos del cliente no se guardan                                        |

La que mejor explica para qué sirve un registro de decisiones es el
[ADR 0003](adr/0003-dinero-en-centimos.md), porque **el proyecto lo desmintió a
sí mismo**. Se escribió en la Fase 1 diciendo que el formateo de importes usaría
`Intl.NumberFormat`, que es la herramienta estándar. Al implementarlo en la
Fase 3 resultó que con `es-ES` no pone el separador de millares por debajo de
cinco cifras, siguiendo una norma de la RAE que la especificación del proyecto
no sigue. La decisión de fondo —dinero en céntimos— era correcta; el medio, no.
Se añadió una nota de actualización en lugar de reescribir el documento: borrarlo
habría dejado una documentación impecable y falsa, que oculta que la decisión se
tomó con información incompleta y se corrigió al chocar con la realidad.

---

## 5. Los problemas más significativos

Hay **50 problemas registrados** en [docs/prompts/](prompts/), cada uno con
síntoma, causa, resolución y qué enseña. Estos cuatro casos no son los más
aparatosos: son los que cambiaron una norma del proyecto.

**La revisión de secretos que no abría los archivos**
([P9, Fase 2](prompts/fase-02.md)). Una revisión previa a un commit recorrió
diez categorías de datos sensibles y devolvió «sin coincidencias» en las diez.
Un informe impecable. La desconfianza ante diez ceros seguidos llevó a repetir
la búsqueda con un término que **se sabía presente** en el repositorio, y
devolvió cero también: eso era imposible, y delataba la herramienta en lugar del
contenido. La causa era que `Select-String` aplicado a una tubería de cadenas
busca dentro de esas cadenas, no dentro de los archivos que nombran. **No se
abrió ni un solo archivo en todo el barrido.** De aquí sale la norma del control
positivo: toda revisión de secretos incluye buscar algo que se sabe que existe,
con la misma herramienta y la misma expresión, y si el control falla se repite
con **otra herramienta**, no con otro intento.

**Los rótulos que afirmaban lo contrario de lo que pasaba**
([P15, Fase 4](prompts/fase-04.md) y [P38, Fase 8](prompts/fase-08.md)). Un
mensaje escrito a mano que decía «tsc sin errores» salió por pantalla junto a un
error de compilación, porque iba detrás de un `;` en lugar de un `&&`. En la
Fase 8 volvió a ocurrir con un «código: 0» mientras `tsc` fallaba. Es la misma
familia que el caso anterior: **una comprobación que no puede dar un resultado
negativo no es una comprobación**. La norma que quedó es que ningún mensaje
puede afirmar que algo ha ido bien sin depender del resultado real del comando:
o describe qué se ha ejecutado, o se encadena de forma que solo se imprima si el
comando ha tenido éxito.

**La aserción hueca, medida** ([P44, Fase 9](prompts/fase-09.md)). Un test del
formulario comprobaba que un mensaje de error **no** estuviera en pantalla. Una
aserción negativa sobre un texto literal pasa igual si ese texto ya no existe en
ninguna parte. Para medirlo se borró el mensaje de la aplicación y se ejecutó el
archivo: de sus 15 tests **solo se puso rojo uno, y era otro**. En el proyecto
entero lo detectaban 10 de los 560. El arreglo no fue reescribir el literal, sino
meter un control positivo dentro del propio test: comprobar que el mensaje no
está, enviar el formulario y comprobar con el mismo localizador que entonces sí
aparece. Con el mensaje borrado, la segunda mitad se pone en rojo.

**El documento ajeno que vivía en `.git`**
([P48, Fase 10](prompts/fase-10.md)). El PDF de requisitos del máster —material
docente de terceros— se retiró del índice en la Fase 1 con `git rm --cached` y se
excluyó en el `.gitignore`. Nueve fases después, la revisión del historial
completo lo encontró **vivo dentro de `.git`** como objeto no alcanzable: nunca
estuvo en ningún commit, nunca llegó a GitHub —se demostró, no se afirmó—, pero
seguía ahí porque lo que se prepara con `git add` y se corrige después no
desaparece del repositorio local. Se limpió con autorización expresa. Lo que
enseña es que **lo que no está en ningún commit puede estar en el repositorio**,
y que una copia de seguridad automática de la carpeta se lo habría llevado sin
que nadie lo supiera.

---

## 6. Las correcciones del usuario

Cada registro de fase incluye un apartado de correcciones: qué me corrigió el
usuario, **con el motivo**, y se registran también cuando dejan al asistente en
mal lugar. Un registro que solo recoge los aciertos no sirve como evidencia de
nada.

| Fase         | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | Total  |
| ------------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ------ |
| Correcciones | 4   | 7   | 5   | 1   | 11  | 7   | 5   | 6   | 9   | 10  | 14  | **79** |

Son **79 en las Fases 0 a 10**; las de la Fase 11, la de esta entrega, están en
[su propio registro](prompts/fase-11.md).

La serie no disminuye con el tiempo, y **el máximo está en la última fase
registrada**. Es lo contrario de lo que se esperaría de una curva de aprendizaje,
y tiene una explicación: las fases finales son las de seguridad y documentación,
donde un error no se manifiesta como un test en rojo sino como **una afirmación
que nadie comprueba**. La Fase 3, la de un solo apunte, fue la de TDD puro sobre
funciones de cálculo: ahí el compilador y los tests hacen de supervisor. En la
Fase 10 el supervisor solo podía ser una persona leyendo lo que se afirmaba.

Tres correcciones se convirtieron en norma permanente de `CLAUDE.md`, y el
motivo importa más que el qué:

- **Una comprobación previa no puede ir en el mismo comando que la acción que
  condiciona** (Fase 1). Si un comando comprueba algo y después borra o publica,
  el resultado de la comprobación no impide nada. Dos pasos: primero comprobar y
  mostrar el resultado, después actuar.
- **Comprobar solo lo que cambia una decisión** (Fase 3). Verificar también
  cuesta tiempo, y en un proyecto con fecha de entrega una investigación que no
  cambia ninguna decisión es tiempo que se le quita a lo que sí la cambia. El
  criterio quedó escrito como una pregunta: _¿cambia esto alguna decisión?_ Y
  ante la duda, preguntar antes de lanzarla.
- **Los archivos no se editan con comandos de shell** (Fase 6). El motivo de
  fondo no es que el comando falle: es que el cambio tiene que poder revisarse
  en el panel de diferencias antes de aceptarlo. Además, en Windows
  PowerShell 5.1 `Set-Content -Encoding utf8` añade una marca BOM, `-NoNewline`
  quita el salto de línea final que Prettier exige, y un reemplazo con expresión
  regular sobre un archivo entero no dice cuántas veces va a coincidir ni dónde.

---

## 7. Lo aprendido

**Una comprobación que no puede dar un resultado negativo no es una
comprobación.** Es la idea que más veces reapareció, y siempre disfrazada de otra
cosa: diez categorías de seguridad en verde sin abrir un archivo, un rótulo que
decía «sin errores» sobre un error, una aserción que pasaba con el mensaje
borrado. La respuesta es siempre la misma y cuesta un minuto: buscar algo que se
sabe que está, y ver si aparece. En la revisión del historial completo de la
Fase 10 se aplicó a las once categorías, una por una.

**Un test que no se ha visto fallar no demuestra nada.** El ciclo rojo-verde no
es un trámite: ver `Failed to resolve import "./ServiceCard"` es lo que demuestra
que el test ejercita el código que dice probar. Y tiene un caso difícil que el
proyecto se encontró varias veces: los tests que **nacen en verde** porque
describen algo que ya funciona. Ahí no hay fase roja posible, así que hace falta
un control: cambiar a propósito la regla que el test dice vigilar y comprobar
que se pone rojo. Se hizo en la Fase 6 subiendo el mínimo de permanencia de 12 a
13 meses, y **4 de los 5** tests de integración de los descuentos se pusieron en
rojo; y en la Fase 8 afirmando un céntimo de más en un total, con **tres de los
cinco** recorridos E2E en rojo.

**La IA es rápida afirmando y lenta comprobando, y ahí está el trabajo del
supervisor.** El patrón que se repite en esas 79 correcciones casi nunca es código
mal escrito: es un número que no se ha vuelto a medir, una captura que se
describe sin mirarla, un motivo inventado para un paso correcto. Un paso bien
dado con un motivo falso es más peligroso que uno mal dado, porque el motivo
falso se reutiliza. Las preguntas que más rindieron fueron siempre las mismas
tres: ¿lo has comprobado o lo recuerdas?, ¿puede esto dar un resultado
negativo?, y enséñame la salida.

**Hacer imposible incumplir una norma vale más que recordarla.** Los finales de
línea no dependen de la configuración de Git de cada máquina, sino de tres
archivos del repositorio. El material ajeno no está protegido por una ruta
exacta, sino por una carpeta entera ignorada. Los meses de contratación no son
un campo opcional que alguien debe recordar rellenar, sino una unión discriminada
que no compila sin ellos. Las tres son la misma idea aplicada a un comando, a un
archivo y a un tipo.

**Y la documentación escrita al cerrar cada fase es lo único que hace posible
este documento.** Las 79 correcciones de las Fases 0 a 10, los 50 problemas y las
13 decisiones no se podían reconstruir de memoria dos días antes de entregar. Se escribieron el día
que ocurrieron, incluidas las que no favorecen a nadie, y por eso este documento
se ha podido escribir leyendo el repositorio en lugar de recordando el proyecto.
Fue una corrección del usuario en la Fase 1, y es la que más ha rendido.

---

**Dónde seguir leyendo:** los prompts, problemas, correcciones, aprendizajes y
momentos de cada fase están en [docs/prompts/](prompts/), una fase por archivo.
El estado del desarrollo, en [PROGRESO.md](../PROGRESO.md). Las normas con las
que se ha trabajado, en [CLAUDE.md](../CLAUDE.md).
