# Fase 10 — Revisión del historial, CSP, Dependabot y repositorio público

**Fecha:** 27/11/2026
**Estado al empezar:** fases 0 a 9 cerradas y verificadas en producción. 560
tests de Vitest y 5 recorridos de Playwright en verde. Repositorio **privado**.
**Estado al terminar:** historial completo revisado con las 11 categorías,
`Content-Security-Policy` en producción con un guardián que la vigila en los
E2E, Dependabot configurado para dos ecosistemas, los pendientes nº 17 y nº 20
resueltos y la lista de publicación lista para que la ejecute el usuario.

**La aplicación no ha cambiado.** El build de esta fase genera
`index-BpmhP4VQ.js` (249.170 bytes) e `index-yYO2TO7R.css` (16.482), los mismos
nombres y los mismos tamaños que verificaron las fases 7, 8 y 9. Lo único que se
ha tocado del código es **un comentario**, y los comentarios no llegan al
paquete publicado: por eso el nombre del archivo, que sale de su contenido, no
se ha movido.

---

## 1. Los prompts del usuario

### Prompt de apertura

> Vamos a empezar la Fase 10 del Configurador de Presupuestos: revisión de
> seguridad del historial, CSP, Dependabot y preparación para hacer público el
> repositorio.
>
> Antes de nada, lee CLAUDE.md, PROGRESO.md (sobre todo «Siguiente paso» y
> «Pendiente y vigilado»), docs/prompt-maestro.md y docs/prompts/fase-09.md.
> […]
>
> Primer paso, antes de nada más: anota en PROGRESO.md el resultado de CI #2
> sobre 3fbe9ab, que comprobé yo […]. Añade, en breve, la lección: la predicción
> de que CI #2 tardaría «bastante menos» no se cumplió (5 s de 112) y el
> criterio «si tarda lo mismo, la clave está mal» era malo, porque confunde
> reutilizar la caché con ir más rápido; el discriminador correcto es la línea
> «Cache hit» y los megabytes restaurados. […] Y corrige la tabla del aviso de
> plazo (riesgo R8) a fecha 27/11.
>
> Alcance:
>
> 1. Revisión de TODO el historial de git (todos los commits, incluidos archivos
>    que ya no existen), con las 11 categorías de la revisión de secretos y sus
>    controles positivos. Para la categoría 2 (el nombre de la agencia) te daré
>    el patrón en el chat; nunca lo escribas en ningún archivo.
> 2. Pendiente nº 17: mi ruta de usuario de Windows en los documentos de las
>    fases 0 y 1. Quítala de los archivos actuales, describiéndola en lugar de
>    copiarla […]. Después dime en qué commits del historial aparece y
>    plantéame las opciones […]. NO reescribas el historial ni hagas push
>    --force sin mi autorización expresa.
> 3. Pendiente nº 20: el dominio genérico que retiró la C7-4 […]. Propón qué
>    hacer.
> 4. CSP: añade una Content-Security-Policy en vercel.json, lo más estricta
>    posible sin romper la aplicación. Compruébala con los E2E y en producción
>    (la aplicación, el borrador, el documento y la impresión).
> 5. Dependabot: .github/dependabot.yml para npm y github-actions […]. Ten en
>    cuenta el pendiente nº 21.
> 6. Prepara la lista de lo que tengo que hacer yo en GitHub para hacer público
>    el repositorio […] y qué ajustes de seguridad conviene activar antes y
>    después.
>
> Criterios: […] Los 560 tests, los 5 E2E y el workflow siguen en verde. La
> aplicación no debería cambiar salvo por la CSP. La revisión de secretos, al
> final y después de la documentación, sin bucles: una pasada final, y si la
> documentas, la comprobación posterior va solo en el chat. El pendiente nº 22
> se deja para la Fase 11.

### Prompt de autorización, con una condición

> Plan aprobado, con estas respuestas:
>
> 1. Cita de fase-01.md: opción (a), redactada con marca visible y nota al pie.
> 2. Pendiente 20: opción (a), se queda la documentación y se neutraliza solo el
>    comentario del código.
> 3. E2E y CSP: opción (a), vite.config.ts lee vercel.json. **Además,
>    condición: los E2E tienen que FALLAR si el navegador registra una violación
>    de la CSP** (por ejemplo, escuchando el evento securitypolicyviolation o
>    los mensajes de consola de CSP), **y demuéstralo con un control positivo:
>    una CSP más estricta a propósito (por ejemplo, sin style-src) tiene que
>    ponerlos en rojo**; después se restaura.
> 4. Dependabot: mensual, con menores y parches agrupados, tanto en npm como en
>    github-actions. Las alertas de seguridad llegan aparte.
> 5. Orden: el tuyo.
>
> Sobre el historial: tráeme los datos (en qué commits aparece la ruta) antes de
> cualquier decisión. No reescribas nada sin mi autorización.

Con los tres términos de la revisión, **aportados en el chat y con la
instrucción expresa de no escribirlos en ningún archivo**: el nombre de la
agencia, el dominio del usuario y su correo personal. En este documento se
describen, no se reproducen (pendiente nº 15 y corrección C1-6). El tercero
llegó con un matiz que ahorró ruido: buscar el correo **completo** y no el
nombre de pila suelto, porque el nombre de pila es público en la firma de los 20
commits y habría devuelto cientos de coincidencias inútiles.

### Prompts de decisión sobre el historial y los objetos sueltos

> 1. Confirma con git rev-list --all --objects que ese blob (y los demás
>    sueltos) no es alcanzable desde ningún commit ni desde
>    refs/remotes/origin/main, con su control positivo. Así queda demostrado que
>    no está en GitHub.
> 2. No muestres en el chat el correo del mailto ni ningún dato del PDF:
>    enmascáralos. En la documentación, descríbelo («el PDF de requisitos, con
>    el correo de una persona»), nunca lo copies (lección C1-6). […]
> 3. Después dame la tabla resumen de toda la revisión y propónme la limpieza
>    local de los objetos sueltos […], explicando qué borra y qué no, y espera
>    mi autorización. El original de docs/privado/ no se toca.

Y, con la tabla ya revisada:

> 1. Limpieza local: autorizada. […]
> 2. Pendiente 17: **no se reescribe el historial.** Motivo: el dato es mi
>    nombre de usuario de Windows, que ya es público como autor de los 20
>    commits y en mi usuario de GitHub; reescribir los 20 commits a tres días de
>    la entrega rompería los SHA, las referencias cruzadas y la correspondencia
>    con Vercel. Se limpia de los archivos actuales y se documenta la decisión
>    con sus razones.
> 3. La mención del dominio genérico en el mensaje de 835940f se queda: no es un
>    dato de nadie y cambiarla exigiría reescribir el historial.
> 4. En la revisión final de secretos, que la categoría 4b busque también el
>    identificador de la carpeta temporal de esta sesión.

### Cuatro prompts de revisión durante la fase

Dos pidiendo resultados **en el chat** porque las capturas de pantalla se
cortaban (la tabla de las 11 categorías y el recuento de los E2E con la CSP
restaurada), uno corrigiendo una frase de `dependabot.yml` y uno con dos ajustes
al documento de publicación. Están en el apartado de correcciones (C10-4 a
C10-7).

---

## 2. Resumen de lo generado

| Archivo                                        | Qué es         | Qué hace                                                                        |
| ---------------------------------------------- | -------------- | ------------------------------------------------------------------------------- |
| `vercel.json`                                  | modificado     | La `Content-Security-Policy`, ocho directivas                                   |
| `vite.config.ts`                               | modificado     | El `preview` **lee `vercel.json`** y sirve sus cabeceras                        |
| `e2e/cspGuard.ts`                              | **nuevo**      | El guardián: pone en rojo cualquier recorrido si el navegador bloquea algo       |
| Los 5 `e2e/*.spec.ts`                          | modificados    | Una línea cada uno: importan `test` del guardián                                |
| `.github/dependabot.yml`                        | **nuevo**      | `npm` y `github-actions`, mensual, menores y parches agrupados                  |
| `.github/workflows/ci.yml`                      | modificado     | El comentario que daba el repositorio por privado                               |
| `docs/fase-10-publicacion-github.md`            | **nuevo**      | La lista de lo que hace el usuario a mano, con los nombres consultados          |
| `src/features/client-form/validateClientData.ts` | modificado   | El comentario del pendiente nº 20: describe el dominio en lugar de citarlo       |
| `docs/fase-00-inventario-entorno.md`            | modificado     | Las 7 rutas de usuario → variables de entorno, con su nota. Y un recuento        |
| `docs/prompts/fase-01.md`                       | modificado     | La cita redactada con marca visible                                             |
| `PROGRESO.md`                                   | modificado     | CI #2, la fase, el plazo, los pendientes y el siguiente paso                    |
| `README.md`                                     | modificado     | Las cabeceras de seguridad, Dependabot y el guardián de la CSP                  |
| `docs/prompts/fase-10.md`                       | **nuevo**      | Este documento                                                                  |

**Ninguna instalación.** La CSP es una cabecera, Dependabot es un YAML que lee
GitHub, y la revisión del historial se hace con `git grep` y `git log`.
`npm audit` sigue en **0 vulnerabilidades** porque el árbol de dependencias no
se ha tocado.

**Ningún ADR nuevo.** Las dos decisiones con fondo de esta fase —no reescribir
el historial y describir el dominio en lugar de reproducirlo— son decisiones del
usuario sobre datos concretos, con sus razones registradas aquí y en los
pendientes nº 17 y nº 20 de `PROGRESO.md`. La CSP y Dependabot son
configuración, razonada donde se aplica.

---

## 3. La revisión del historial completo

**20 commits, 161 rutas distintas que han existido alguna vez, y
`git grep … $(git rev-list --all)`**, que recorre el árbol de cada commit y por
tanto ve también los archivos que ya no existen. Antes de la primera categoría
se comprobó el instrumento, y no de cualquier manera: se buscó un texto que está
en `src/App.tsx` de un commit antiguo y **no** en el de `HEAD`. Las dos mitades
—encuentra lo viejo, no encuentra lo que se borró— son lo que demuestra que la
búsqueda lee contenido y no nombres de archivo.

| #      | Categoría                                 | Coincidencias                                   | Control positivo (obligatorio en los ceros)                                                                 |
| ------ | ----------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1      | Correos, expresión genérica               | **365 líneas**, 9 dominios distintos            | se valida sola: encuentra la dirección `noreply`                                                            |
| **2a** | El nombre de la agencia (`-i`)            | **0**                                           | **la misma expresión encuentra 5 coincidencias** en los objetos sueltos del repositorio (ver más abajo)      |
| **2b** | El dominio del usuario, completo          | **0**                                           | la expresión reconoce la forma, probada sobre una dirección de muestra                                      |
| **2c** | El correo del usuario, completo           | **0**                                           | ídem                                                                                                        |
| 3      | Proveedores de correo personal            | **0**                                           | la misma expresión con `users.noreply.github` dentro: **350 líneas**                                        |
| 4      | Rutas con el nombre de usuario de Windows | **169 líneas**, 3 archivos, **20 de 20 commits** | se valida sola                                                                                              |
| 4b     | La carpeta temporal de la sesión          | **0**                                           | la expresión reconoce la ruta real del scratchpad de esta sesión                                            |
| 5a     | Cadenas con forma de credencial real      | **0**                                           | la misma expresión con `noreply` dentro: **470 líneas**; y reconoce un token de muestra                     |
| 5b     | Asignaciones `clave = valor largo`        | **0**                                           | la misma forma con `(version\|resolved\|integrity)`: **5.998 líneas**                                       |
| 6      | Direcciones IP                            | **0**                                           | la maquinaria de números con puntos: **26.042 líneas**; y reconoce una IP privada de muestra                |
| 7      | Teléfonos                                 | **314 líneas**                                  | se valida sola                                                                                              |
| 8      | URL con credenciales                      | **20 líneas** (una por commit)                  | se valida sola                                                                                              |
| 9      | NIF / CIF / DNI con forma real            | DNI **0** · CIF **22 líneas**                   | DNI: la expresión reconoce un documento de forma real. CIF: se valida sola                                  |
| 10     | Datos de terceros                         | **316 líneas**                                  | se valida sola: el nombre del máster y la escuela, 118 líneas                                               |
| 11     | Archivos ajenos versionados               | **0** de 161 rutas                              | **el mismo filtro sobre los objetos sueltos sí encuentra un PDF**                                           |

**Lo que son las coincidencias que no son cero**, porque un número sin
identificar no dice nada: la 1 son la dirección `noreply` (158 veces) y dominios
reservados por la RFC 2606, más 22 del dominio genérico que retiró la C7-4. La 7
son el identificador numérico de GitHub **dentro** de la dirección `noreply`
—una expresión de teléfonos no puede distinguirlo de un número—, las tiradas de
ceros y nueves de los tests del IGIC y el teléfono ficticio de la agencia. La 8
son las 20 copias de la **descripción del patrón** en `PROGRESO.md`, una por
commit. La 9 es el CIF ficticio. Y la 10 son las palabras «profesor» (176),
«docente» (80), «tutoriales» (40) y «tutor» (20): el incidente de la C1-6
**descrito**, sin un solo dato de la persona. Es la norma funcionando y dejando
rastro de que funcionó.

**Lo que no es una categoría pero también se revisó:** los 20 commits tienen
**una sola identidad** como autor y como committer, la dirección `noreply`. En
los mensajes de commit hay cuatro direcciones: la de la línea `Co-Authored-By`
(20 veces), dos de ejemplo reservadas y **una con el dominio genérico de la
C7-4**, en el mensaje de `835940f`. Referencias: solo `main` y `origin/main`,
apuntando al mismo commit; 0 entradas de _stash_; 0 commits y 0 árboles sueltos.

---

## 4. Problemas y soluciones

### P47 — `git grep -I` saltaba en silencio el archivo más grande del repositorio

**Síntoma.** El control positivo de la categoría 5b —la misma expresión buscando
`version`, `resolved` o `integrity`, que están miles de veces en
`package-lock.json`— devolvió **0**. El control falló, así que la categoría no
era válida.

**La causa, que es de manual.** `.gitattributes` declara
`package-lock.json -diff` desde la Fase 1, una decisión deliberada para que el
diff del lockfile no estorbe al revisar. El atributo `-diff` hace que Git trate
el archivo **como binario**, y `git grep -I` —cuya única misión es saltarse los
binarios— lo excluía sin escribir una línea. Las primeras pasadas se ejecutaron
sobre el historial **menos 91.656 líneas**, sumando las de los 20 commits.

**Cómo se resolvió.** Repetir todo con `-a` (tratar cualquier archivo como
texto). Se comprobó además **cuántos archivos más estaba saltando el filtro**:
161 archivos distintos con `-a` frente a 160 con `-I`, así que era ese y solo
ese. Incluido el lockfile, ningún resultado cambió —no contiene ni una dirección
de correo, ni un token, ni una ruta—, pero eso **solo se sabe después de
mirarlo**, y antes de mirarlo la revisión decía «cero» sobre un corpus
incompleto.

**Y volvió a pasar diez minutos después, con otra herramienta.** Al volcar los
objetos sueltos a un archivo para revisarlos, `grep` detectó un byte NUL,
imprimió «Binary file … matches» y **dejó de enumerar**. El recuento que había
sobre la mesa en ese momento era incompleto por la misma razón: un filtro de
binarios que nadie había pedido. Se repitió con `grep -a`. El byte NUL venía
precisamente del hallazgo del P48.

**La lección no es «usar `-a`».** Es que el fallo no se parecía a un fallo: no
hubo error, no hubo aviso, solo un número más bajo de lo que tocaba. Es la
familia del problema **P9** de la Fase 2, que ya había reaparecido en la Fase 5
con un escapado mal puesto: **dos veces más aquí dentro, en esta misma
revisión**, y una tercera después, en el P49. Lo destapó el **control positivo**
del apartado 5 de `CLAUDE.md` en la Fase 2 (P9), en la Fase 5 (P21) y aquí en la
categoría 5b. Los otros dos de esta fase, no: el del byte NUL lo delató **una
línea anómala en la salida** y el del P49, **la discrepancia con un recuento que
ya se había medido un minuto antes** con otra herramienta. Conviene decirlo así
en lugar de redondearlo: el control positivo lo destapó **tres de las cinco
veces**, no es una red infalible, y las otras dos lo que salvó la revisión fue
mirar la salida con desconfianza.

### P48 — El PDF ajeno seguía vivo en `.git`, como objeto no alcanzable

**Síntoma.** `git fsck --dangling` devolvió **22 blobs sueltos**, 1,95 MB. Uno
de 627.735 bytes empezaba por `%PDF-1.4`.

**Qué eran.** Versiones preparadas con `git add` y corregidas **antes** de
commitear, que Git conserva como objetos sin referencia. Tres con nombre:

- **El PDF de requisitos del máster**, el material ajeno que la Fase 1 retiró
  del índice con `git rm --cached`. Contiene **el correo de una persona**. Aquí
  se describe y no se reproduce, igual que en el chat, donde se enmascaró a
  petición del usuario.
- **Un borrador de `PROGRESO.md` y otro de `docs/prompts/fase-01.md`** que, al
  documentar la revisión de secretos de la Fase 1, **citaban los términos de
  búsqueda** —el nombre de la agencia y el identificador del correo personal—
  en lugar de describirlos. Son los borradores **previos a la corrección
  C1-6**, que es justamente la norma que prohíbe eso.

**Por qué la revisión de la Fase 5 no los vio, y no fue un descuido.** Aquella
revisión usó `git rev-list --all --objects`, que lista lo **alcanzable**. Un
objeto sin referencia no aparece ahí por definición. Hacen falta `git fsck` o
`git cat-file --batch-all-objects`, que miran la base de objetos y no el grafo
de commits.

**Lo que había que demostrar antes de decidir nada**, y lo pidió el usuario con
esas palabras: que no están en GitHub.

| Comprobación                                                                     | Resultado    |
| -------------------------------------------------------------------------------- | ------------ |
| Los 22 blobs en `git rev-list --objects --all`                                    | **0 de 22**  |
| Los 22 blobs en `git rev-list --objects refs/remotes/origin/main`                 | **0 de 22**  |
| **Control positivo:** los blobs de `PROGRESO.md`, `README.md` y `package-lock.json` de `HEAD`, con el mismo filtro | **1 y 1**, los tres |

Un `push` transfiere solo objetos alcanzables desde la referencia que se empuja,
y `origin/main` apunta al mismo commit que `main`: el remoto tiene esos 390
objetos y ninguno más.

**Cómo se resolvió, con autorización del usuario.**
`git reflog expire --expire-unreachable=now --all` y `git gc --prune=now`, en
dos pasos y después de mostrar la comprobación —porque el apartado 1 de
`CLAUDE.md` no permite que la comprobación viaje en el mismo comando que la
acción—. Antes de ejecutar se verificó lo único que podía doler: que **el reflog
no citara ningún commit fuera de los 20**, es decir, que no hubiera nada
recuperable que perder. No lo había.

| Después de la limpieza                   | Resultado                                |
| ---------------------------------------- | ---------------------------------------- |
| Blobs sueltos                            | **0** (antes 22)                         |
| Salida de `git fsck`                     | **0 líneas**                             |
| Objetos alcanzables                      | **390**, los mismos                      |
| Commits                                  | **20**, `HEAD` en `3fbe9ab`              |
| El término de la agencia en los sueltos  | **0** (antes 5)                          |
| `docs/privado/…pdf`                      | **627.735 bytes**, intacto y aún ignorado |

El motivo de limpiar no fue la publicación: esos objetos nunca iban a GitHub.
Fue el **riesgo R5**, y conviene decirlo con precisión: el inventario de la
Fase 0 comprobó que el proyecto está **fuera** de OneDrive, y así sigue. El
riesgo es **si se activara** la copia de seguridad del Escritorio —que es
justamente lo que aquel inventario dejó escrito que no se active—, porque
entonces se llevaría la carpeta `.git` con el documento de un tercero dentro.
Los datos de terceros no se pueden rotar.

### P49 — La misma expresión, tres herramientas, dos falsos negativos

**Síntoma.** Buscar la ruta de usuario con `grep -E` desde Bash devolvió
**vacío** sobre un archivo que la contenía siete veces. El mismo patrón, con el
mismo aspecto, funcionaba con `git grep` un minuto antes.

**La causa.** El número de barras invertidas que hay que escribir cambia según
cuántas capas atraviesa el patrón antes de llegar al motor de expresiones
regulares. Lo que funciona en una no funciona en la otra, y el síntoma de haberse
equivocado **es idéntico al de que no haya nada**.

**Cómo se resolvió.** Buscando por una subcadena sin barras (`Users`), que no
puede romperse al escaparse, y confirmando el resultado con la herramienta que ya
había funcionado. Las siete apariciones aparecieron donde decía el pendiente
nº 17.

**La lección, que es la de esta fase entera:** en una revisión de seguridad, un
«sin coincidencias» **no es un resultado**. Es un resultado o es una búsqueda
rota, y las dos cosas se escriben igual en la pantalla.

### P50 — Los E2E habrían dado la CSP por buena sin comprobarla

**Síntoma.** Los cinco recorridos se ejecutan contra `vite preview`, que no sabe
nada de `vercel.json`. Tal cual, un `npm run test:e2e` en verde **no dice
absolutamente nada** de la cabecera que sí sirve Vercel.

**Cómo se resolvió, y es lo mejor de la fase.** Dos piezas, la segunda a
petición del usuario:

1. **`vite.config.ts` lee `vercel.json`** y sirve esas cabeceras en el
   `preview`. La CSP tiene una sola fuente y los recorridos prueban la cabecera
   literal que va a producción. Si la regla de `vercel.json` desapareciera, la
   función **lanza un error** en lugar de devolver cero cabeceras: un `preview`
   sin cabeceras dejaría los tests pasando sin comprobar nada.
2. **`e2e/cspGuard.ts`**, un _fixture_ automático que recoge las violaciones de
   la CSP por dos vías —el evento `securitypolicyviolation` del documento y los
   mensajes que Chromium escribe en la consola— y **pone el test en rojo** si
   hay alguna. Vive en el desmontaje del fixture para que ningún recorrido pueda
   olvidarse de comprobarlo.

**Y el control positivo que pidió el usuario demostró algo que no se esperaba.**
Se quitó `style-src 'self'` de la CSP, con lo que `default-src 'none'` bloquea
la hoja de estilos:

| Paso | CSP                             | Resultado                                                              | Código |
| ---- | ------------------------------- | ---------------------------------------------------------------------- | ------ |
| 1    | La estricta                     | **5 passed** (10,8 s)                                                  | 0      |
| 2    | Sin `style-src`, a propósito    | **5 failed**, y el fallo **solo** en `cspGuard.ts`, en ninguna aserción | 1      |
| 3    | Restaurada                      | **5 passed** (9,1 s)                                                   | 0      |

La fila 2 es la que enseña: **con la hoja de estilos bloqueada, todo lo que
comprueban los cinco recorridos seguía pasando**. Buscan textos, encabezados,
roles y foco, no colores. Sin el guardián, una CSP que deja la aplicación
desnuda habría salido en verde, y la única pista habría estado en una consola
que nadie mira. El mensaje del navegador, además, citaba la política recibida
palabra por palabra, lo que prueba de paso que la cabecera llegaba de verdad.

---

## 5. La CSP, directiva por directiva

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self';
object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Se puede ser así de estricto porque **la aplicación no carga nada de fuera**, y
eso se comprobó antes de escribir la cabecera: ni un `style=` en línea, ni un
`<style>`, ni un `url(` en el CSS, ni una fuente web, ni un `fetch`, ni una URL
absoluta. La tipografía es la del sistema.

| Directiva                | Por qué ese valor                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `default-src 'none'`     | Todo prohibido por defecto; lo demás son excepciones nombradas. Cubre fuentes, conexiones, iframes, workers y multimedia, que no se usan |
| `script-src 'self'`      | El único script es el módulo de `/assets/`. React en producción no usa `eval`, así que no hace falta `unsafe-eval`                  |
| `style-src 'self'`       | La hoja compilada de Tailwind. **Sin `unsafe-inline`**, que es la mitad del valor de una CSP                                       |
| `img-src 'self'`         | El `favicon.svg`. No hay ninguna otra imagen ni ningún `data:`                                                                     |
| `form-action 'none'`     | El formulario del cliente nunca navega: su manejador corta el envío. Lo prueba el recorrido del formulario, que además comprueba que los datos no acaban en la URL |
| `frame-ancestors 'none'` | El equivalente moderno del `X-Frame-Options: DENY`, **que se queda** para navegadores que no entiendan esta directiva              |
| `base-uri 'none'`        | Nada puede inyectar un `<base>` que redirija las rutas relativas                                                                   |
| `object-src 'none'`      | Redundante con `default-src`, explícito a propósito: es la directiva cuyo valor por defecto más daño hace si un navegador la trata distinto |

**Dos cosas que no lleva, con su motivo:** `require-trusted-types-for 'script'`,
porque solo lo entiende Chromium y quedaría sin probar en el resto, y
`upgrade-insecure-requests`, porque no hay un solo recurso en `http://`.

**Y un detalle incómodo:** `vercel.json` se valida contra un esquema y rechaza
propiedades desconocidas, así que **no puede llevar comentario**, a diferencia de
todos los demás archivos de configuración de este proyecto. La explicación de
cada directiva vive por eso aquí y en el README, y no al lado de la cabecera. No
se probó si una clave `//` colaría: el sitio para averiguarlo habría sido el
despliegue.

---

## 6. La verificación en producción (commit `1f639f8`)

El `push` dejó el remoto en `1f639f8`, consultado **al servidor** con
`git ls-remote` y con su control negativo. El mensaje se pasó con
`git commit -F` desde un archivo fuera del proyecto, y el **objeto del commit lo
guarda idéntico byte a byte**: 3.447 bytes los dos, con `diff` y con `cmp`.
Detalle de método: `git log --format=%B` **añade un salto de línea al extraer**,
así que la primera comparación acusó una diferencia que no era del commit; la
comparación válida es contra `git cat-file commit HEAD`.

| Comprobación                                                     | Resultado                                                                    |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **CI #3** sobre `1f639f8` (comprobado por el usuario)             | **Success**, 1 m 44 s, y el paso del informe de Playwright **saltado (0 s)** |
| Checks del commit y despliegue                                   | **2 de 2**, «Deployment has completed»                                       |
| **La CSP en producción**                                         | presente con **las ocho directivas exactas**, y también sobre el `.js`, el `.css` y el `favicon.svg` |
| Las otras cuatro cabeceras                                       | 4 de 4, más `Strict-Transport-Security`. Control: una cabecera inventada no aparece |
| Los cuatro archivos publicados                                   | **idénticos byte a byte** al build local, con el control negativo de `cmp`   |
| Sourcemaps, `vercel.json`, `vite.config.ts`, `cspGuard.ts`, `dependabot.yml`, `/.git/config` | **404** los seis. Control positivo: `/` y el favicon dan 200        |
| **En el navegador, con la consola abierta y recarga forzada** (comprobado por el usuario) | la aplicación **con sus estilos**, el borrador sobrevive a la recarga sin los datos del cliente, el documento y la impresión correctos, y la consola **sin un solo mensaje de CSP** |

El único aviso de la consola es amarillo y de Chrome:
`[Violation] 'click' handler took 2784ms`, en el botón de imprimir. **No tiene
nada que ver con la CSP**: `window.print()` bloquea el hilo mientras el diálogo
está abierto, y Chrome mide ese rato como trabajo del manejador.

### Dependabot abrió tres pull requests el primer día

No esperó al calendario: al subir `dependabot.yml` hizo su revisión inicial.

| PR  | Qué propone                                                        | CI        | Qué demuestra                                                 |
| --- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------- |
| #1  | `typescript-eslint` 8.73 → 8.74, **en el grupo** `minor-and-patch` | **verde** | La agrupación funciona                                        |
| #2  | `typescript` 6.0 → **7.0** (mayor)                                 | **rojo**  | **La red funcionando**                                        |
| #3  | `@types/node` 24 → **26** (mayor)                                  | **verde** | Una mayor puede ser inofensiva: por eso van de una en una     |
| —   | `github-actions`                                                   | ninguno   | Las cuatro acciones ya están en su mayor más reciente         |

**El rojo de la #2 es el mejor resultado posible de la fase**, y hay que decirlo
con precisión: una versión mayor de TypeScript rompió las comprobaciones **en un
pull request y no en `main`**. El workflow de la Fase 9 la frenó, y Dependabot la
trajo **por separado** —fuera del grupo de menores y parches— precisamente
porque una mayor merece su propio registro de CI. Las tres se deciden en la
Fase 11; no se ha aceptado ninguna, y **qué le ocurre a TypeScript 7 se
diagnostica entonces, no se adivina aquí**.

La cuarta fila es una confirmación discreta de la Fase 9: aquella fase consultó
al registro las versiones de las acciones en lugar de escribirlas de memoria, y
Dependabot, que es quien de verdad lo sabe, **no ha encontrado nada que
actualizar**.

**Candidato para el vídeo**, si hay hueco además de los dos momentos del
apartado 9: la lista de pull requests de Dependabot con un check rojo entre dos
verdes, que cuenta en una sola captura para qué sirve la integración continua.

---

## 7. Correcciones del usuario

### C10-1 — Un guardián que no se ha visto disparar no es un guardián

**Corrección.** Al autorizar: «los E2E tienen que **FALLAR** si el navegador
registra una violación de la CSP […] y demuéstralo con un control positivo: una
CSP más estricta a propósito (por ejemplo, sin style-src) tiene que ponerlos en
rojo; después se restaura.»

**Por qué.** Mi plan decía «compruebo la CSP con los E2E», y eso era **falso sin
esta condición**: los recorridos habrían pasado igual con la CSP rota, porque no
mira ninguno si el navegador ha bloqueado algo. El usuario no pidió una
comprobación más; pidió que la comprobación que yo ya había prometido **pudiera
dar un resultado negativo**. Es el apartado 5 de `CLAUDE.md`, y la demostración
está en el P50: cinco tests en rojo por el guardián y por nada más.

### C10-2 — Demuéstrame que no está en GitHub, no me lo digas

**Corrección.** «Confirma con `git rev-list --all --objects` que ese blob (y los
demás sueltos) no es alcanzable desde ningún commit ni desde
`refs/remotes/origin/main`, con su control positivo.»

**Por qué.** Yo había escrito que los objetos sueltos «no viajan en un push»,
que es cierto y era **una afirmación sobre cómo funciona Git**, no una medición
sobre este repositorio. La diferencia importa justo aquí: el dato que se
publicaba era irreversible. La petición de incluir `origin/main` **por
separado** es la parte fina: `--all` incluye las referencias remotas, pero
comprobarlo aparte es lo que responde a la pregunta que de verdad se hacía, que
no era «¿es alcanzable?» sino «¿está en el servidor?».

### C10-3 — Describe el dato del PDF, no lo copies

**Corrección.** «No muestres en el chat el correo del mailto ni ningún dato del
PDF: enmascáralos. En la documentación, descríbelo […], nunca lo copies (lección
C1-6).»

**Por qué.** Es la C1-6 aplicada **antes** de que volviera a pasar, y llegó
mientras yo estaba a punto de enseñar el contenido de un documento ajeno para
explicar un hallazgo. El patrón es viejo en este proyecto: **documentar una fuga
es una de las formas más habituales de reproducirla**. Y había un agravante,
porque el dato era de un tercero: no se puede rotar ni pedir permiso después.

### C10-4 — Los resultados, en el chat y en una tabla

**Corrección.** Dos veces: «dame aquí en el chat una tabla resumen con los
números de cada categoría […]. Las capturas se me cortan y no veo los
resultados» y, más tarde, «confírmame aquí en el chat el resultado de los 5 E2E
con la CSP ya restaurada (cuántos passed y el código de salida), que en la
captura no lo vi».

**Por qué.** No es una preferencia de formato: es supervisión. El usuario no
puede autorizar una limpieza irreversible ni dar por buena una CSP a partir de
una salida de terminal que su pantalla recorta. Yo estaba produciendo evidencia
que **él no podía leer**, que es lo mismo que no producirla. La lección para el
resto del proyecto es que el resumen va en el mensaje, no en la salida del
comando.

### C10-5 — Una frase que decía lo contrario de lo que pasó

**Corrección.** «`dependabot.yml`, líneas 19-21: la frase está al revés. Lo que
se habría escrito de memoria (v4/v5) es lo que estaba dos o tres versiones
mayores por detrás de las actuales (v6/v7), no al contrario.»

**Por qué.** Tenía razón y el error era mío de lectura, no de datos: tenía la
tabla de la Fase 9 delante. Escrita como la escribí, la frase decía que las
versiones **publicadas** iban por detrás de las que yo habría escrito de
memoria, que es exactamente el argumento contrario al que justifica tener
Dependabot vigilando las acciones. Un comentario que invierte su propio
razonamiento es peor que no tener comentario, porque el siguiente que lo lea
deducirá lo contrario de lo que pasó.

### C10-6 — Un ajuste de la cuenta, que protege más que uno del repositorio

**Corrección.** «Añade al bloque A un paso de cuenta (no de repositorio): en
Settings de mi cuenta → Emails, confirmar «Keep my email addresses private» y
activar «Block command line pushes that expose my email». Comprueba los nombres
exactos en la documentación.»

**Por qué.** Mi lista cubría el repositorio y se había dejado fuera la cuenta,
que es donde está el ajuste **más valioso de todos** para este proyecto: GitHub
mira la dirección del autor del último commit en cada `push` y lo **rechaza** si
es una dirección privada de la cuenta. Es decir, convierte en automática la
única norma del apartado 5 de `CLAUDE.md` que llevaba nueve fases dependiendo de
que alguien se acordara: firmar con la dirección `noreply` y no con la personal.
Una protección de la cuenta cubre además cualquier otro repositorio, no solo
este.

### C10-7 — Dos cosas distintas que se llaman parecido

**Corrección.** «C5 y la tabla del bloque B: lo que se desactiva al hacer
público son los «push rulesets», que no son el ruleset de rama de C5. Comprueba
en la documentación el motivo real de crearlo después (creo que con la cuenta
gratuita los rulesets no están disponibles en repositorios privados) y corrige
la explicación.»

**Por qué.** Era un error de verdad, y de los que más engañan: la instrucción
**estaba bien** —crear el ruleset después de publicar— y el motivo que yo había
escrito era falso. Un paso correcto con una razón inventada es peor que un paso
mal, porque nadie lo revisa: funciona. GitHub avisa de que al cambiar la
visibilidad se desactivan los _push rulesets_, que son otra cosa (reglas sobre
rutas y tamaños de archivo, en repositorios privados de planes de pago). El
motivo real, consultado en la documentación, es el que el usuario sospechaba:
**con GitHub Free los rulesets están disponibles en repositorios públicos**, y
en los privados hacen falta Pro, Team o Enterprise. Hasta publicar, la opción no
existía.

### C10-8 — Que la categoría 4b busque también el identificador de esta sesión

**Corrección.** «En la revisión final de secretos, que la categoría 4b busque
también el identificador de la carpeta temporal de esta sesión.»

**Por qué.** La categoría 4b buscaba el **patrón** de las carpetas temporales
(`AppData\Local\Temp`, `/tmp/`), y esta fase ha usado la carpeta de sesión
muchas veces para archivos intermedios. Si una de esas rutas se hubiera colado
en un documento, aparecería por su identificador —una cadena larga y única— y no
necesariamente por el patrón. Es la misma lógica que la del apartado 5 de
`CLAUDE.md` cuando exige buscar categorías y no archivos conocidos, aplicada un
nivel más abajo: buscar **el dato concreto** además de su forma.

### C10-9 — No describas una captura que no has mirado

**Corrección.** «La captura que Playwright guardó del fallo no la hemos mirado y
probablemente ya no existe. No describas lo que muestra.»

**Por qué.** Yo había escrito, en el momento para el vídeo, cómo se veía la
aplicación con la hoja de estilos bloqueada —«texto negro sobre blanco, el
presupuesto en una columna»—. Era **verosímil y no comprobado**: la carpeta está
en el `.gitignore` y se sobrescribe en cada ejecución. Una descripción inventada
dentro de un documento de evidencias contamina lo que sí está medido.

### C10-10 — El riesgo R5, con precisión

**Corrección.** «El inventario concluye que el proyecto está hoy fuera de
OneDrive. Precisa que el riesgo es **si se activara** la copia del Escritorio.»

**Por qué.** Mi frase hacía parecer que el PDF ajeno estaba sincronizándose en la
nube. El riesgo es condicional y el inventario de la Fase 0 lo dejó comprobado y
escrito; exagerarlo habría convertido un hallazgo real en una alarma falsa.

### C10-11 — La evidencia, en el chat y como texto

**Corrección.** «Pégame aquí en el chat, como texto, el `git diff` final de
`README.md`, no dentro de la salida de un comando: es lo que voy a revisar.»

**Por qué.** Es la C10-4 un paso más allá. No basta con que el dato esté en
pantalla: tiene que estar **donde el supervisor lo lee**, y una salida de
terminal que su pantalla recorta no cumple. Lo que se revisa antes de publicar
un repositorio no puede depender de un desplazamiento.

### C10-12 — «La categoría 4 fue 1, no 0», y el cuarto punto ciego

**Corrección.** «En la categoría 4 el recuento anterior fue 1, no 0. Enséñame
qué línea es y en qué archivo. Si es una ruta con mi usuario, hay que quitarla
antes del commit.»

**Por qué.** El `1` que recordaba era un recuento **por archivo** de la primera
exploración, no un total, así que el dato que yo había dado era correcto. Pero la
pregunta valió más que si hubiera acertado él: al ampliar la búsqueda apareció
que **mi patrón solo cubría barras invertidas** (`C:\Users\…`) y no las barras
normales de Git Bash (`/c/Users/…`), que son las que yo había usado durante toda
la sesión. El recuento ampliado también dio 0, así que no hubo fuga —y por eso no
cuenta como uno de los tres puntos ciegos del P47 y el P49—, pero era un punto
ciego **potencial** que nadie había visto. Una comprobación que solo cubre una de
las dos formas de escribir el dato es media comprobación.

### C10-13 — El mensaje del commit también se revisa

**Corrección.** «Pásale las búsquedas de la revisión al mensaje completo, porque
`git grep --cached` no revisa los mensajes de commit.» Más dos retoques del
texto: «control positivo **en cada una que dio cero**» y «dos puntos ciegos» →
«tres», por no cuadrar con este documento.

**Por qué.** Es un hueco de verdad en mi revisión, y de los que no se ven: el
mensaje vive **fuera del árbol de trabajo**, así que ninguna de las dieciséis
búsquedas lo alcanzaba, y en cambio se publica con el commit y es **inmutable
sin reescribir el historial**. El historial de este proyecto ya tiene un dominio
citado en un mensaje (`835940f`) que se queda precisamente por eso.

### C10-14 — Dos números que no se podían sumar

**Corrección.** «El resumen de `PROGRESO.md` dice dos puntos ciegos y el mensaje
del commit dice tres. Compáralo con lo que cuentan los dos documentos y dime
cuál es el correcto **antes de cambiar nada**.»

**Por qué.** Los dos números eran correctos y se referían a ámbitos distintos
—dos en la revisión del historial, tres en la fase—, que es la misma familia del
P45 y de la C9-5: **cifras escritas al lado que no se pueden sumar a la vista**.
La corrección no pedía elegir un número, pedía **que el ámbito estuviera
escrito**. Y el «antes de cambiar nada» evitó el arreglo fácil: cambiar el dígito
habría dejado el documento cuadrado y el reparto sin explicar.

---

## 7. Aprendizajes de la fase

### 1. «Sin coincidencias» no es un resultado

Es la lección de las fases 2, 5, 8 y 9, y esta fase la ha cobrado **tres veces
en una sesión**: `git grep -I` saltándose el archivo más grande por un atributo
de `.gitattributes`, `grep` abandonando la enumeración al toparse con un byte
NUL, y un patrón roto por el escapado de las barras invertidas. Ninguno de los
tres dio un error. Los tres dieron un número más bajo del que tocaba, que es la
forma que tiene este fallo de no parecerse a un fallo.

Lo nuevo que enseña es **de dónde salen los puntos ciegos**: ninguno de los tres
estaba en la expresión de búsqueda. Estaban en una decisión razonable tomada en
otra fase y por otro motivo —que el diff del lockfile no estorbe—, en el valor
por defecto de una herramienta y en una capa de comillas. Un punto ciego no se
encuentra pensando mejor la búsqueda; se encuentra buscando algo que se sabe que
está.

### 2. Lo que no está en ningún commit puede estar en el repositorio

Un objeto de Git sin referencia no aparece en `git log`, ni en `git rev-list
--all --objects`, ni en ningún `git grep` sobre commits. Durante cinco fases, la
conclusión «el PDF del máster nunca entró en el historial» fue **cierta y
tranquilizadora**, y el archivo estaba en `.git/objects` todo el tiempo.

Las dos mitades hay que decirlas juntas, porque la segunda sin la primera es
alarmismo: **nunca estuvo en GitHub** —se demostró objeto por objeto, contra
`origin/main` y con control positivo— y **sí estaba en el disco**, en una
carpeta que una copia de seguridad del Escritorio se llevaría sin preguntar. La
pregunta útil no era «¿se ha publicado?» sino «¿dónde está físicamente el
dato?».

### 3. Un test puede pasar sobre una aplicación que nadie querría ver

Los cinco recorridos pasaron con la hoja de estilos **bloqueada por la CSP**.
Están bien escritos y es precisamente por eso: comprueban textos, roles,
encabezados y foco, que es lo que los hace robustos y lo que evita que se rompan
cuando cambia un color. Esa misma virtud los vuelve ciegos a que la aplicación
se sirva sin un solo estilo.

La conclusión no es «comprobar también los estilos»: sería frágil y se arrastra
mal. Es que **hay fallos que no viven en el DOM**, y para esos no se mira la
página, se mira lo que el navegador dice que ha tenido que bloquear. Un fixture
automático en el desmontaje convierte eso en una red que no se puede olvidar de
poner.

### 4. Un paso correcto con un motivo inventado es más peligroso que un paso mal

La corrección C10-7 es el ejemplo exacto: «crea el ruleset después de publicar»
estaba bien, y la razón que le puse al lado era falsa. Un paso que funciona no
se revisa, así que el motivo falso se queda ahí y la siguiente decisión que se
apoye en él saldrá mal. La defensa que ha funcionado aquí es la misma que en la
Fase 9 con las versiones de las acciones: **consultar la documentación en lugar
de escribir lo plausible**, y aceptar que una página diga que no estás seguro
—en la lista está anotado que las páginas de GitHub no coinciden del todo sobre
el plan Pro, y la instrucción está redactada para valer en las dos lecturas—.

### 5. La evidencia que el supervisor no puede leer no es evidencia

Dos correcciones de esta fase (C10-4) fueron el usuario pidiendo en el chat
números que yo ya había mostrado en una salida de terminal que su pantalla
recortaba. No es un problema de formato: una de esas cifras era la que tenía que
autorizar un borrado irreversible. En un trabajo asistido por IA, el resumen
legible **es parte del entregable**, no un adorno del final.

---

## 8. Momentos para el vídeo

### Momento 1 — Los cinco tests en verde sobre una aplicación en blanco

**Qué se ve en pantalla.** Se quita `style-src 'self'` de la CSP de
`vercel.json`. Se lanza `npm run test:e2e`: **5 failed**. Se abre el fallo y se
lee de dónde viene: `cspGuard.ts`, el guardián, **y ninguna aserción de ningún
recorrido**. Se restaura la directiva y vuelven las 5 en verde.

Para el vídeo hay que **reproducir el control** —quitar la directiva, lanzar los
recorridos— y enseñar en ese momento la captura que Playwright guarda del fallo
en `test-results/`, que es la que muestra cómo queda la aplicación con la hoja
de estilos bloqueada. **Aquí no se describe porque no se ha mirado**, y esa
carpeta está en el `.gitignore` y se sobrescribe en cada ejecución, así que la
de aquel momento ya no existe.

**Por qué importa.** En treinta segundos se ve una idea que cuesta explicar con
palabras: unos tests bien escritos pueden pasar sobre algo que ningún cliente
aceptaría, y la cabecera que lo rompía era **la que esta fase añadía para hacer
la aplicación más segura**. Enseña también en qué consiste supervisar a una IA:
yo había escrito en el plan «compruebo la CSP con los E2E», y la condición que
el usuario añadió al autorizar es lo único que convirtió esa frase en verdad.

### Momento 2 — El documento ajeno que llevaba nueve fases en el repositorio

**Qué se ve en pantalla.** `git log --all -- "*.pdf"`, vacío. La conclusión de
la Fase 5 en `PROGRESO.md`: «el PDF nunca entró». Y después
`git fsck --dangling`, que devuelve 22 objetos, y uno de 627.735 bytes cuyo
primer byte es `%PDF`. Al lado, el PDF de `docs/privado/`: **el mismo tamaño
exacto**. Después, la comprobación de que ningún commit lo alcanza —ni
`origin/main`— con su control positivo sobre tres archivos que sí están
publicados, la autorización del usuario, los dos comandos de limpieza y
`git fsck` devolviendo **0 líneas** con los 390 objetos y los 20 commits
intactos.

**Por qué importa.** Es la diferencia entre «está publicado» y «está en el
disco», que es una distinción que casi nadie hace y que aquí se ve en dos
comandos. Y es un buen momento para enseñar el orden de trabajo que exige este
proyecto: **primero se demuestra dónde está el dato, después se pide
autorización, y solo entonces se borra** —nunca en el mismo comando—, con la
verificación posterior puesta al lado para que el borrado no haya que creérselo.
