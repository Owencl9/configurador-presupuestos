# Fase 11 — Entrega del TFM

**Fecha:** 28/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code, en
modo Manual
**Estado al empezar:** fases 0 a 10 cerradas y verificadas en producción.
Repositorio **público** desde el 27/11/2026, con la lista de publicación
ejecutada a mano por el usuario. 560 tests de Vitest y 5 recorridos de
Playwright en verde.
**Estado al terminar:** documentación de entrega completa. **No se ha tocado
código, tests, configuración ni dependencias**: el build, los tests y la
aplicación publicada son los mismos que verificó la Fase 10.

---

## 1. Los prompts del usuario

### Prompt de apertura

> Fase 11 — Entrega del TFM. Es la última fase y quiero que sea sencilla: solo
> lo esencial, sin funcionalidades nuevas ni cambios de código.

El prompt traía el contexto hecho: el resultado de los catorce pasos A0–C8 de la
lista de publicación, ejecutados por el usuario el 27/11, y la decisión sobre los
tres pull requests de Dependabot, cerrados por él el 28/11. Y cinco encargos:
poner la documentación al día, anotar la decisión sobre Dependabot, anotar los
tres pendientes que quedan fuera, escribir el documento que pide el máster y
cerrar con el registro de la fase.

Con dos condiciones de método: **enseñar el índice del documento antes de
redactarlo** y **enseñar cada edición antes de aplicarla**. Los términos de la
revisión de secretos los aportó en el chat —el nombre de la agencia, el dominio
del usuario y el correo del usuario—, con la instrucción expresa de no
escribirlos en ningún archivo. Aquí tampoco se reproducen: se describen (pendiente nº 15 y corrección
C1-6).

### Prompt del criterio sobre «lo privado»

El plan propuso distinguir **afirmaciones de estado actual** —que se corrigen— de
**narración fechada** —que no se toca—, y el usuario lo aprobó con esas palabras:

> El criterio del punto 1 me encaja: se corrigen las afirmaciones de estado
> actual y no se toca la narración fechada de los registros de fase.

### Prompts de revisión del documento

Tres rondas sobre `docs/desarrollo-con-ia.md`: una sobre el índice (seis
ajustes), una parada en mitad de la redacción (seis puntos, uno de ellos pidiendo
el archivo y la línea de cada cifra) y una tercera sobre las once ediciones de la
documentación (cuatro correcciones). Están todas en el apartado 4.

---

## 2. Resumen de lo generado

| Archivo                             | Qué                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/desarrollo-con-ia.md`         | **Nuevo.** El documento que pide el máster: cómo se ha desarrollado la aplicación con IA, en siete apartados                                   |
| `docs/prompts/fase-11.md`           | **Nuevo.** Este registro                                                                                                                       |
| `README.md`                         | El estado («en desarrollo (Fase 7 de 11)» → terminado), el repositorio público, las diapositivas y el vídeo fuera del repositorio, y el enlace al documento nuevo |
| `PROGRESO.md`                       | Cabecera, fila de la Fase 11, sección «Completado en la Fase 11» con la lista A0–C8, los pendientes nº 1, 2, 14 y 22, el riesgo R3, «Siguiente paso» y el aviso de plazo |
| `CLAUDE.md`                         | Apartado 5: el repositorio es público desde el 27/11/2026                                                                                       |
| `docs/fase-10-publicacion-github.md` | Nota de «Estado: completada» al principio                                                                                                     |

**Lo que no se ha tocado, a propósito:** código, tests, configuración,
dependencias, el favicon (pendiente nº 2), el resumen lateral (nº 14) y la
numeración de los problemas (nº 22, decidido: no se renumera).

---

## 3. Problemas y soluciones

### P51 — Un rótulo que afirmaba «sin coincidencias» junto a tres coincidencias

**Síntoma.** Al comprobar que no quedaban afirmaciones desfasadas sobre la
visibilidad del repositorio, el comando imprimió tres coincidencias y, debajo,
un eco escrito a mano que decía «(sin coincidencias arriba = ninguna de esas tres
expresiones)».

**Causa.** El eco iba después de un `;`, así que se imprime siempre, diga lo que
diga el comando. Es **exactamente** el problema P15 de la Fase 4 y el P38 de la
Fase 8, y la norma que lo prohíbe está en el apartado 5 de `CLAUDE.md` desde la
Fase 4.

**Resolución.** Las tres coincidencias se leyeron una por una y las tres eran
correctas: dos describen la corrección hecha en esta fase y la tercera es la
narración fechada de la Fase 1, que el criterio aprobado deja intacta. El
resultado era bueno; **el rótulo era falso**. Se retiró y se informó en el chat.

**Lo que enseña.** Saber una norma no basta para cumplirla: esta cayó en la
última fase del proyecto, en una comprobación de treinta segundos, después de
haberla escrito dos veces en `CLAUDE.md`. Lo que la caza no es recordarla, es
mirar la salida antes de rotularla.

### P52 — Editar una tabla alineada por Prettier obliga a medir el relleno

**Síntoma.** Las filas de la tabla «Pendiente y vigilado» de `PROGRESO.md`
llevan hasta 1.800 espacios de relleno. Una edición exige reproducir ese relleno
al carácter, y contarlo a ojo en la pantalla no es fiable.

**Causa.** `PROGRESO.md` **no** está en el `.prettierignore` —solo lo está
`docs/`—, así que Prettier alinea sus tablas al ancho de la celda más larga.

**Resolución.** Dos medidas antes de editar: una pasada que sustituye cada racha
de espacios y de guiones por su longitud (`<1768>`, `[52]`), y comprobar la
consistencia de cada ancho contra el contenido de la celda más larga. Las
ediciones entraron a la primera.

**Efecto secundario que conviene saber leer:** al acortarse la celda más larga,
Prettier realinea **todas** las filas de la tabla, así que un cambio de contenido
en una fila aparece en el diff como un cambio en las veintidós. No es ruido que
se pueda evitar: es la consecuencia de tener tablas alineadas y un formateador.

### P53 — La categoría 5b no podía encontrar una clave JSON

**Síntoma.** En la revisión de secretos de esta fase, la categoría 5b
—asignaciones `clave = valor largo`— dio **0**, y su control positivo, la misma
expresión buscando `version`, `resolved` o `integrity`, dio **0 también**.

**Causa.** El patrón exigía el `:` **pegado** al nombre de la clave
(`[A-Za-z0-9_-]{3,}[[:space:]]*[:=]`), y en JSON la clave va entre comillas:
`"integrity": "sha512-…"`. La comilla que hay entre el nombre y los dos puntos
rompía la coincidencia, así que el patrón **no podía casar con ninguna
asignación JSON**, y el archivo con 404 líneas de `integrity` del repositorio
pasaba por limpio.

**Resolución.** Admitir la comilla opcional (`[A-Za-z0-9_-]{3,}"?[[:space:]]*`).
El control pasó a dar 404 líneas en `package-lock.json` sobre el índice, y la
categoría, 0 en los seis archivos del commit. A petición del usuario se repitió
la 5b corregida **sobre los 22 commits del historial**: 6.806 líneas en
`package-lock.json` y 22 en `public/favicon.svg` —los hashes del lockfile y los
datos de la ruta del SVG—, ninguna otra. La revisión de la Fase 10 **no estaba
afectada**: su control dio 5.998 líneas, y un patrón que no casa con JSON no
puede dar miles de coincidencias de `integrity`.

**Lo que enseña.** El control positivo no es un trámite del final: es lo único
que distingue «no hay nada» de «esto no está buscando». Aquí funcionó
exactamente como se diseñó, y en el mismo comando.

### P54 — La categoría de teléfonos, otra vez incapaz de encontrar el teléfono

**Síntoma.** La categoría 7 dio **0** sobre los seis archivos, y su control
positivo devolvió cuatro líneas que **no eran teléfonos**: números decimales
como `1133.9999999999998`.

**Causa.** El patrón pedía nueve dígitos seguidos empezando por 6-9
(`[6-9][0-9]{8}`), y el teléfono ficticio de la agencia está escrito en grupos
separados por espacios y empieza por cero: `+34 000 000 000`. No podía coincidir
con nada.

**Es la repetición literal del P40 de la Fase 8**, con el mismo teléfono y la
misma causa, documentada además en `PROGRESO.md` desde entonces: «el patrón
exigía seis o más dígitos **seguidos** tras el prefijo […] así que no podía
coincidir con nada. Un cero que parecía una buena noticia».

**Resolución.** El orden correcto, que es el que la Fase 8 ya había dejado
escrito: **primero el control, después la categoría**. Con un patrón de grupos
de tres dígitos con espacios opcionales, el control encuentra el teléfono
conocido en `src/shared/constants/agency.ts:62`, y la categoría da 3
coincidencias en los seis archivos: dos son el identificador de GitHub dentro de
la dirección `noreply` y la tercera es, precisamente, la línea de `PROGRESO.md`
que narra el P40.

**Lo que enseña.** Un control positivo puede dar un número alto y no valer nada:
estos cuatro «aciertos» eran decimales. El control tiene que encontrar **la cosa
concreta que se sabe que existe**, no cualquier cosa.

### P55 — Un comando de revisión sin control, y las revisiones en el sitio equivocado

**Síntoma.** El primer intento de repetir la 5b sobre el historial completo
devolvió **una salida vacía**, que leída de corrido parece «no hay nada en
ningún commit».

**Causa.** Los 22 SHA se pasaron **después** del `--`, así que `git grep` los
trató como rutas y no como revisiones: no buscó en ningún commit. Y el comando
iba **sin control positivo**, que es lo que lo habría delatado en el mismo
segundo.

**Resolución.** Las revisiones antes del `--`, y el control positivo **primero**:
6.894 líneas con `(version|resolved|integrity)` sobre los 22 commits, y solo
entonces la categoría.

**Lo que enseña.** La norma del control positivo se escribió para las categorías
de la revisión, pero vale para cualquier comando cuyo resultado esperado sea
cero. Tres de los cinco problemas de esta fase —el P51, el P53 y el P55— son la
misma criatura: un cero que no significaba lo que parecía.

---

## 4. Correcciones del usuario

### C11-1 — Una cifra sin fecha caduca

**Corrección:** «22 commits» y «161 archivos» dejarán de ser ciertas con los
commits de esta fase; o se dice a qué momento se refieren, o se recalculan antes
del commit. Y «11 fases» hay que aclararlo: se cuentan de la Fase 0 a la 11, y la
tabla del proceso tiene que incluir la fila de la Fase 11.

**Por qué:** un documento de entrega se lee después de la entrega. Una cifra sin
fecha es una afirmación que el propio repositorio desmiente al commit siguiente.

**Resolución:** la tabla del apartado 1 dice qué filas son del proyecto completo
y qué filas están medidas al cierre de la Fase 10, y la tabla del proceso incluye
la Fase 11.

### C11-2 — «Cuatro» casos, cinco problemas nombrados

**Corrección:** el apartado 5 decía «cuatro» y nombraba P9, P15, P38, P44 y P48.

**Por qué:** es una cifra que se puede contar en la misma frase. Un lector que
cuenta cinco y lee «cuatro» deja de fiarse del resto de las cifras, y el
documento entero se sostiene sobre cifras.

**Resolución:** son cuatro **casos**, y uno de ellos (los rótulos que afirman lo
contrario de lo que pasa) agrupa dos problemas, el P15 y el P38. Escrito así.

### C11-3 — «No baja, sube» exageraba

**Corrección:** la serie de correcciones por fase es 4, 7, 5, 1, 11, 7, 5, 6, 9,
10, 14. Lo exacto es que **no disminuye** con el tiempo y que el máximo está en
la última fase registrada, no que «suba».

**Por qué:** la serie tiene dientes de sierra; «sube» describe otra curva. Y el
argumento no necesitaba el adorno: no disminuir ya es lo contrario de lo que se
esperaría de una curva de aprendizaje.

### C11-4 — Dos días, no tres

**Corrección:** hoy es el 28/11 y la entrega es el 30; son dos días.

**Por qué:** era una cuenta de dos números, escrita de memoria, en el apartado
que habla precisamente de no reconstruir nada de memoria.

### C11-5 — El ADR 0005 va con las herramientas

**Corrección:** el ADR 0005 (ESLint en lugar de Oxlint) estaba agrupado con «los
datos».

**Por qué:** una tabla que agrupa por ámbito y coloca una decisión en el ámbito
equivocado estorba más que no agrupar.

### C11-6 — El segundo asistente, en el documento

**Corrección:** añadir que, además de Claude Code, el usuario usó un segundo
asistente (Claude, en el chat) como revisor externo de los planes, de cada aviso
de permiso, de los mensajes de commit y de las cifras; que muchas correcciones
registradas salieron de esa revisión; y que la decisión final fue siempre suya.

**Por qué:** es parte de cómo se ha desarrollado la aplicación, y un documento
sobre el uso de la IA que omite la mitad del montaje de supervisión no describe
el método real.

### C11-7 — La tabla mezclaba dos momentos distintos

**Corrección:** el encabezado decía «medidos al cierre de la Fase 10» y dos de
las filas —fases y días— describen el proyecto completo.

**Por qué:** un dato con la etiqueta temporal equivocada es peor que un dato sin
etiqueta, porque parece comprobado.

### C11-8 — El mismo total en cuatro sitios tiene que cuadrar

**Corrección:** el total de correcciones aparece en la tabla del apartado 1, en
el 6 y dos veces en el 7. O se actualizan todos al nuevo total, o se dice
explícitamente «79 en las Fases 0 a 10».

**Por qué:** una cifra repetida en cuatro sitios es cuatro oportunidades de
contradecirse.

**Resolución:** decisión del usuario, las cuatro dicen «Fases 0 a 10» y remiten a
este registro para las de la Fase 11. El total no se toca.

### C11-9 — De dónde sale cada cifra, con archivo y línea

**Corrección:** el usuario pidió el origen exacto de cuatro afirmaciones del
documento —«10 de los 560», «13 meses, 4 de 5 tests en rojo», «un céntimo de más
en un total de los recorridos E2E» y «fue una corrección del usuario en la Fase
1»— y que se corrigiera la que no estuviera documentada así.

**Por qué:** es la auditoría más rápida que existe sobre un documento de cifras,
y no se puede contestar de memoria.

**Resultado:** las cuatro estaban documentadas —`fase-09.md:243`,
`fase-06.md:158`, `fase-08.md:574` y `fase-01.md:328` (C1-5)—, pero **dos estaban
mal citadas**: los «5 tests» son concretamente los cinco de integración de los
descuentos del ciclo 9, y a la del céntimo le faltaba el resultado, «tres de los
cinco recorridos en rojo». Corregidas las dos.

### C11-10 — Un salto de línea que faltaba

**Corrección:** dejar una línea en blanco entre «(BIG School)» y «**Fecha:**»
para que no se rendericen pegadas.

### C11-11 — Recortar por cuenta propia al pasarse del límite

**Corrección:** al terminar la redacción, el documento medía 3.050 palabras
frente al tope de 2.500 que había fijado el usuario. En lugar de **parar y
decirlo**, se empezó a recortar prosa por iniciativa propia, y en el recorte se
perdió un dato: el documento final deja de mencionar que lleva **su número y su
fecha de validez**. Lo cazó el usuario, no el recorte.

**Por qué:** el límite de palabras era una decisión suya, no un margen que
optimizar sin consultar. Y un recorte silencioso sobre texto ya revisado no se
puede revisar: el usuario había aprobado un índice que incluía ese contenido, y
al desaparecer no quedó ninguna señal de que hubiera desaparecido. Es la misma
familia que la corrección C1-1 —explicar antes de ejecutar— aplicada a la
redacción en lugar de a un comando.

**Resolución:** el dato está restaurado y comprobado contra el código, no contra
el recuerdo: [`BudgetDocument.tsx`](../../src/features/budget-document/BudgetDocument.tsx)
imprime «Válido 30 días, hasta el …». La extensión la decidió el usuario después,
con las dos cifras delante: se mide sobre la prosa (2.556 palabras) y no se
recorta nada más.

### C11-12 — «Los tres de versión mayor» era falso

**Corrección:** de los tres pull requests de Dependabot, el #1
(`typescript-eslint` 8.73 → 8.74) era el **grupo de menores y parches**; solo el
#2 (`typescript` 7) y el #3 (`@types/node` 26) son mayores y venían por separado.

**Por qué:** la frase no solo contaba mal tres cosas: hacía ilegible la decisión
del `dependabot.yml`, que agrupa menores y parches **precisamente** para
distinguirlos de las mayores.

### C11-13 — El motivo de A4 era otro

**Corrección:** A4 no va después de publicar porque «antes no había forks ajenos
posibles». Va después porque **GitHub solo muestra «Require approval for all
external contributors» en los repositorios públicos**; mientras era privado, en
su lugar aparecía «Run workflows from fork pull requests», desmarcada.

**Por qué:** es la lección número 3 de la Fase 9 y la corrección C10-7, otra vez:
un paso correcto con un motivo inventado es más peligroso que un paso mal dado,
porque el motivo se reutiliza. Y aquí el motivo inventado era además más
tranquilizador que el real.

### C11-14 — El motivo real de lo que queda fuera

**Corrección:** el favicon y el resumen lateral no quedan fuera «por falta de
margen», sino porque el usuario decidió que la última fase fuera sencilla y solo
con lo esencial. Y no es cierto que el nº 14 sea «el único recorte que el
proyecto ha llegado a aplicar», porque el favicon también queda fuera.

**Por qué:** atribuir a la falta de tiempo una decisión de alcance falsea las dos
cosas: hace parecer apretada una entrega que no lo ha estado, y esconde que hubo
una decisión. Corregido en los dos sitios donde estaba escrito.

### C11-15 — «Cinco revisiones seguidas», sin comprobarlo

**Corrección:** el usuario pidió contar en `PROGRESO.md` las revisiones del
riesgo R8 antes de afirmar que habían sido cinco.

**Qué encontró la comprobación:** lo único documentado son «**cuatro** revisiones
seguidas» ([PROGRESO.md](../../PROGRESO.md)), y además se referían a otro aviso
—el de las fases 8 y 9—, no a la protección del 29 y el 30. La cifra estaba
inventada y el número se ha retirado de la frase.

**Por qué:** es un número adorno, de los que nadie comprueba porque no sostienen
ninguna decisión. Y por eso mismo son los que sobreviven en un documento de
entrega.

---

## 5. Aprendizajes de la fase

### 1. La última fase no es la fase segura

El P51 es el mismo error de la Fase 4 y de la Fase 8, en la fase que no tocaba
código y después de dos vueltas de la norma por `CLAUDE.md`. Y el P54 es la
repetición **literal** del P40 de la Fase 8: el mismo teléfono, la misma causa y
la misma norma ya escrita. Un error de método no se cura escribiéndolo: se cura
mirando la salida antes de rotularla, cada vez. Lo que sí funcionó las tres
veces fue el control positivo, que es precisamente lo que las fases anteriores
dejaron montado para esto.

### 2. Un límite que fija el usuario no es un parámetro a optimizar

Pasarse de 2.500 palabras es un dato que hay que **entregar**, no un problema que
resolver por cuenta propia. Lo que convirtió el exceso en un error no fue
recortar: fue recortar sin decirlo, sobre contenido ya aprobado, dejando el dato
perdido sin ninguna señal.

### 3. Hay dos clases de frase en una documentación, y envejecen distinto

Una **afirmación de estado** («el repositorio es privado») caduca; una
**narración fechada** («el repositorio queda privado», en el registro de la Fase
1) es cierta para siempre. Corregir la segunda no es actualizar, es falsificar la
evidencia. El criterio lo aprobó el usuario antes de tocar nada, y es lo que
permitió limitar los cambios a cuatro archivos en lugar de a veinte.

### 4. «Archivo y línea» es la auditoría más barata que hay

Cuatro preguntas del usuario sobre el origen de cuatro cifras destaparon dos
citas mal hechas en un documento que ya había pasado dos revisiones. No hizo
falta leer el documento entero: basta preguntar por lo que un número tendría que
poder demostrar.

### 5. Un formateador y una tabla alineada son un compromiso, no un detalle

Las tablas alineadas de `PROGRESO.md` se leen mejor en crudo y cuestan un diff de
305 líneas cada vez que cambia la celda más larga. `docs/` está en el
`.prettierignore` precisamente por eso, y la raíz no. Saber cuál de las dos
reglas aplica a cada archivo es parte de poder editarlo.

---

## 6. Momentos para el vídeo

### Momento 1 — El recuento de correcciones saliendo del repositorio

**Qué se ve en pantalla:** un solo comando recorriendo los once registros de fase
y contando los encabezados de corrección, con la serie en la salida: 4, 7, 5, 1,
11, 7, 5, 6, 9, 10, 14 → **79**. Y al lado, el apartado 6 de
`docs/desarrollo-con-ia.md` con la misma tabla.

**Por qué importa:** es la demostración de que el documento del máster no está
escrito de memoria. La cifra que un tribunal podría poner en duda —cuántas veces
corrigió el humano a la IA— se calcula delante, en dos segundos, desde la
evidencia que se fue escribiendo fase a fase. Y enseña el número incómodo: el
máximo está en la penúltima fase, no en la primera.

### Momento 2 — El rótulo que mentía, en la última fase

**Qué se ve en pantalla:** la salida de la comprobación de afirmaciones
desfasadas: tres coincidencias y, debajo, el eco «(sin coincidencias arriba…)».
Las dos cosas juntas, en la misma pantalla.

**Por qué importa:** es el P15 de la Fase 4 repitiéndose en la última fase del
proyecto, con la norma que lo prohíbe escrita en `CLAUDE.md` desde entonces. En
un vídeo sobre desarrollo con IA vale más que cualquier captura de algo que
funciona: muestra qué tipo de error comete un asistente —afirmar antes de
mirar—, que la supervisión humana no es un trámite final, y que el resultado era
correcto mientras el informe era falso. Que es el peor caso posible, porque no
se nota.
