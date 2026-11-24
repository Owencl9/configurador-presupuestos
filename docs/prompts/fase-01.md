# Registro de prompts — Fase 1: Proyecto inicial

**Fechas:** 23–24/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** crear el proyecto con Vite (React + TypeScript), Tailwind y Vitest; fijar `.gitignore`, `.gitattributes`, `git init`, `CLAUDE.md` y `PROGRESO.md`; y construir el primer componente (`ServiceCard`) con TDD.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque de la fase con comprobaciones previas

> Vamos a empezar la Fase 1 del proyecto Configurador de Presupuestos.
>
> Antes de nada, lee:
> - `docs/prompt-maestro.md` (instrucciones del proyecto)
> - `docs/fase-00-inventario-entorno.md` (estado del entorno, riesgos y mis decisiones del apartado 9)
> - `docs/prompts/fase-00.md` (registro de la Fase 0)
>
> Comprobaciones previas, solo lectura:
> 1. Confirma si existe ya una carpeta `.git` dentro del proyecto. El commit de prueba `cb8f969` debería haberse hecho en tu carpeta temporal, no aquí. Si existe, explícame por qué antes de seguir.
>
> Condiciones para la Fase 1:
> 2. La carpeta ya contiene `docs/`. Al crear el proyecto con Vite, no se puede borrar nada existente. Si Vite pregunta por la carpeta no vacía, usa la opción de ignorar los archivos existentes, nunca la de eliminarlos. Explícame cómo lo vas a hacer antes de ejecutarlo.
> 3. El repositorio de GitHub se creará como PRIVADO. Lo haremos público en la Fase 10, después de la revisión de secretos.
>
> Presenta el plan de la Fase 1 y espera mi autorización antes de ejecutar nada.

Tres exigencias en un solo prompt, y las tres acertadas: verificar que el commit de prueba de la Fase 0 no había contaminado el proyecto, blindar `docs/` antes de ejecutar el andamiaje, y cambiar el repositorio a privado hasta la revisión de secretos.

### Prompt 2 — Autorización con una condición sobre `npm audit`

> Adelante con el plan de la Fase 1. Respuestas:
> 1. Nombre visible: "Configurador de Presupuestos". Correcto.
> 2. Sí, instala `prettier-plugin-tailwindcss`.
> 3. Sí, ServiceCard presentacional en esta fase.
>
> Una condición: si `npm audit` muestra vulnerabilidades, enséñamelas y explícame su gravedad, pero no ejecutes `npm audit fix --force` sin mi autorización.
>
> Acepto reservar el 29 y el 30 para slides y vídeo.

### Prompt 3 — Separar la comprobación de la acción

> El borrado se ejecuta aunque la comprobación encuentre referencias. Sepáralo en dos pasos: primero ejecuta solo la comprobación y enséñame el resultado; si no hay ninguna referencia, borra los archivos en un segundo comando.

Rechazo de un comando ya propuesto. Ver la corrección **C1-4**.

### Prompt 4 — Registro de la memoria del proyecto

> Al final del proyecto necesitaré un documento que explique cómo he desarrollado la aplicación: proceso, uso de la IA, decisiones, problemas y cómo se resolvieron. Para facilitarlo:
>
> 1. En cada `docs/prompts/fase-XX.md` registra también: las correcciones que yo te he hecho y por qué, lo que aprendí en esa fase y uno o dos momentos que merecería la pena mostrar en el vídeo. Añádelo a `fase-00.md` y `fase-01.md` con lo ocurrido hasta ahora.
> 2. Crea `docs/decisiones-previas.md` con este contexto, que no conoces porque ocurrió antes de trabajar contigo: inicialmente planteé un "Auditor SEO con IA" (Python, Flask, rastreo web, OpenAI). Lo descarté por su complejidad y por el plazo, y lo sustituí por este Configurador de Presupuestos.
> 3. Anota en `CLAUDE.md` como norma del proyecto mantener este registro en cada fase.

### Prompt 5 — Dos correcciones antes del primer commit

> Antes del commit, dos cambios:
>
> 1. La búsqueda del correo personal usó un dominio equivocado, no el de mi agencia. Repite la búsqueda en los archivos preparados con el dominio correcto y con la parte local de mi dirección, y enséñame el resultado.

*(Cita redactada: el prompt original nombraba los dominios. Se han sustituido por una descripción, porque este archivo se publica y el dominio del autor no aparecía en el repositorio hasta entonces. Ver el hallazgo al final de **C1-6**.)*
> 2. No quiero versionar `docs/documento-proyecto-final.pdf`: es un documento interno del máster, no es mío y contiene el email de un profesor. Quítalo del índice (sin borrarlo de mi disco), añádelo al `.gitignore` y actualiza las referencias que lo mencionen en la documentación para indicar que es un documento interno no publicado.

Ver las correcciones **C1-6** y **C1-7**.

### Prompt 6 — Aprobación del commit y publicación

> Apruebo la lista y el mensaje. Haz el commit. De acuerdo con dejar las rutas `C:\Users\Owen`.
>
> Ya he creado el repositorio privado en GitHub (sin README, sin `.gitignore` y sin licencia). Conéctalo y sube el código. Antes del push, enséñame el comando que vas a ejecutar.

El usuario creó el repositorio él mismo desde el navegador, de modo que marcó «Private» viéndolo en pantalla, sin intermediarios. Y mantuvo el mismo criterio que en todo el proyecto: ver el comando antes de que se ejecute, también cuando la acción ya estaba autorizada. El `push` es la primera operación de la fase que sale del equipo y no se puede deshacer del todo, así que es justo donde ese criterio vale más.

---

## 2. Resumen de lo generado

### Comprobaciones previas (solo lectura)

| Objetivo | Resultado |
|---|---|
| ¿Existe `.git` en el proyecto? | **No.** Verificado con `Test-Path`, búsqueda recursiva y `git rev-parse --is-inside-work-tree`, que además recorre todos los directorios padre |
| Versiones publicadas en npm | create-vite 9.3.4, Vite 8.3.8, Tailwind 4.3.5, Vitest 5.1.1, TypeScript 7.0.2 |
| Compatibilidad con Node v24.20.0 | todas cumplen sus `engines` |
| ¿Está instalada la CLI de GitHub (`gh`)? | No. Se decide **no instalarla**: el repositorio se crea desde el navegador |
| Autenticación para el `push` con 2FA | resuelta: `credential.helper=manager` en la configuración de máquina y Git Credential Manager presente |

### Andamiaje sin riesgo para `docs/`

El proyecto se generó en una **carpeta temporal vacía** y se copió después a la raíz. Ver el problema **P5**.

```
npx create-vite@latest configurador-presupuestos --template react-ts --eslint --no-immediate --no-interactive
```

Tras la copia se verificó que los cuatro archivos de `docs/` conservaban exactamente los mismos bytes que antes.

### Dependencias

| Grupo | Paquetes |
|---|---|
| Plantilla | React 19.3.1, TypeScript 6.0.3, Vite 8.3.8, ESLint 10.15.0, typescript-eslint 8.73.0 |
| Tailwind | tailwindcss 4.3.5, @tailwindcss/vite 4.3.5 |
| Tests | vitest 5.1.1, @vitest/coverage-v8, jsdom 31.0.1, @testing-library/react 16.3.3, jest-dom 8.0.0, user-event 14.6.13 |
| Formato | prettier 3.10.1, eslint-config-prettier 10.1.8, prettier-plugin-tailwindcss 0.8.1 |

**`npm audit`: 0 vulnerabilidades.** La condición del prompt 2 sobre `npm audit fix --force` no llegó a aplicarse.

### Archivos de configuración creados o modificados

| Archivo | Contenido |
|---|---|
| `vite.config.ts` | plugins de React y Tailwind, y bloque `test` de Vitest con `jsdom` y cobertura |
| `src/index.css` | `@import 'tailwindcss'` y la tipografía base |
| `src/test/setup.ts` | matchers de jest-dom y limpieza del DOM tras cada test |
| `.prettierrc.json` | **tarea F1-b**: `endOfLine: lf`, sin punto y coma, comillas simples, plugin de Tailwind |
| `.prettierignore` | excluye lo generado y `docs` (ver problema **P3**) |
| `.gitattributes` | **tarea F1-a**: `* text=auto eol=lf`, binarios declarados |
| `.vscode/settings.json` | **tarea F1-c**: `files.eol: "\n"`, formatear al guardar, TypeScript del proyecto |
| `.vscode/extensions.json` | las cuatro extensiones recomendadas |
| `.gitignore` | ampliado con `.env*`, `coverage`, informes de Playwright, `.vercel` y archivos de Windows |
| `eslint.config.js` | añadido `eslint-config-prettier/flat` al final de `extends` |
| `tsconfig.app.json` | `strict: true` explícito (ver problema **P2**) |
| `index.html` | `lang="es"`, título y descripción del proyecto |
| `package.json` | scripts de test, cobertura y formato |

### Primer componente con TDD

`src/shared/components/ServiceCard.tsx` y su test. El ciclo se ejecutó completo y por ese orden:

| Paso | Qué ocurrió |
|---|---|
| 1. Test primero | 5 tests escritos antes de que el componente existiera |
| 2. **Comprobar que falla** | `Failed to resolve import "./ServiceCard". Does the file exist?` |
| 3. Implementación mínima | componente presentacional, sin estado propio |
| 4. Verde | 5 de 5 en verde |

Los tests cubren el contenido mostrado, el nombre accesible del botón, la llamada a `onToggle` y el estado `aria-pressed` en ambos sentidos.

### Documentación

`CLAUDE.md`, `PROGRESO.md`, `README.md` (sustituyendo el de la plantilla), `docs/decisiones-previas.md`, este registro y cinco ADR: stack, sin backend, dinero en céntimos, Strategy para descuentos y ESLint en lugar de Oxlint.

### Git y publicación

| Paso | Resultado |
|---|---|
| `git init` | rama `main`, con `.gitignore` y `.gitattributes` ya presentes antes del primer `git add` |
| Normalización de finales de línea | al preparar el índice, Git avisó: `in the working copy of 'docs/prompt-maestro.md', CRLF will be replaced by LF`. Es el `.gitattributes` funcionando: el archivo tenía CRLF en disco y entró al repositorio en LF |
| Primer commit | `d4a12de`, 34 archivos, 2.586 líneas |
| Autoría | `Owen Carballo Lopez <360282380+Owencl9@users.noreply.github.com>` |
| `git push -u origin main` | correcto. Git Credential Manager autenticó sin abrir el navegador, porque ya tenía credenciales válidas |
| Verificación posterior | el commit de `origin/main` coincide con el local, con los mismos 34 archivos y sin ninguno de los excluidos |

El repositorio queda **privado**. Se hará público en la Fase 10, tras la revisión de secretos.

### Verificaciones de cierre

| Comprobación | Resultado |
|---|---|
| `npm run format` | solo reformateó `CLAUDE.md` y `README.md`; el código ya estaba limpio |
| `npm run lint` | 0 errores, 0 avisos |
| `npm test` | 5 de 5 en verde |
| `npm run build` | correcto — 221,82 kB de JS (69,56 kB comprimido), 11,87 kB de CSS |

### Revisión de seguridad previa al primer commit

Apartado 5 del prompt maestro. Tabla corregida tras las correcciones **C1-6** y **C1-7** del usuario.

| Comprobación | Resultado |
|---|---|
| `node_modules`, `dist`, `coverage` en el índice | ninguno |
| Archivos `.env` | ninguno |
| `package-lock.json` versionado | sí, como debe ser |
| Patrones de secretos (claves de OpenAI, tokens de GitHub, claves de AWS, claves privadas, `password=`…) | sin coincidencias |
| Correo personal del autor | **sin coincidencias** — búsqueda repetida con el dominio correcto tras la corrección C1-6 |
| Búsqueda amplia de **cualquier** dirección de correo | 6 coincidencias. Cinco son la dirección `@users.noreply.github.com`, intencionada. La sexta era el correo de un profesor en `docs/prompts/fase-00.md`: **retirado** (ver C1-7) |
| Documento interno del máster (PDF) | **retirado del índice** y añadido al `.gitignore` (ver C1-7) |
| Firma del autor | `Owen Carballo Lopez <360282380+Owencl9@users.noreply.github.com>` |
| Finales de línea en el índice | 32 archivos en LF, 0 en CRLF |

La primera versión de esta tabla afirmaba que el correo personal no aparecía en ningún archivo, pero se había buscado un dominio equivocado, y no incluía la búsqueda genérica de direcciones de correo, que es la que encontró el problema real. Queda registrado en C1-6 porque es precisamente el tipo de error que el documento final del TFM debe recoger: **un informe de seguridad en verde no vale más que la comprobación que lo sostiene.**

---

## 3. Problemas encontrados y cómo se resolvieron

### P1 — La plantilla de Vite ya no instala ESLint

**Síntoma:** la ayuda de `create-vite` 9.3.4 reveló una opción inesperada: `--eslint / --no-eslint   use ESLint instead of Oxlint (only for React templates)`. Es decir, la plantilla de React **ya usa Oxlint por defecto**, no ESLint.

**Impacto:** el apartado 3 del prompt maestro especifica ESLint, y la Fase 9 exige «ESLint con reglas de accesibilidad». `eslint-plugin-jsx-a11y`, que es el estándar de hecho para accesibilidad en JSX, es ecosistema de ESLint. Haber aceptado el valor por defecto habría dejado la Fase 9 sin base y obligado a replantearla.

**Resolución:** generar el proyecto con `--eslint`. Documentado en [ADR 0005](../adr/0005-eslint-en-lugar-de-oxlint.md), con una advertencia: si alguna vez se regenera el andamiaje, hay que recordar el flag.

**Cómo se detectó:** leyendo `--help` antes de ejecutar el comando, en lugar de ejecutarlo con los parámetros que se daban por buenos. Ese paso se hizo por otro motivo —averiguar cómo evitar las preguntas interactivas— y encontró algo que nadie estaba buscando.

### P2 — `strict` no aparecía en el `tsconfig.json`

**Síntoma:** `tsconfig.app.json` no contenía `"strict": true`, lo que en un proyecto que se evalúa por su calidad es alarmante. `tsc --showConfig` tampoco lo mostraba.

**Diagnóstico:** en lugar de suponer, se creó un archivo temporal con un parámetro sin tipo (`export function f(x) { return x }`) y se compiló. El compilador lo rechazó con `error TS7006: Parameter 'x' implicitly has an 'any' type`, y el archivo se eliminó acto seguido.

**Conclusión:** TypeScript 6 activa `strict` por defecto. No era un descuido de la plantilla.

**Resolución:** se declara `"strict": true` explícitamente de todas formas. La calidad del proyecto no debe depender de un valor por defecto que ya ha cambiado entre versiones mayores del compilador, ni obligar a quien lea el repositorio a conocer ese detalle.

### P3 — Prettier quería reformatear los documentos de la Fase 0

**Síntoma:** `prettier --check .` señaló cuatro archivos: los tres documentos de la Fase 0 y el README de la plantilla. Todo el código estaba ya limpio.

**Causa:** Prettier realinea las tablas de Markdown. Los documentos de la Fase 0 están escritos a mano y la fase está cerrada.

**Resolución:** añadir `docs` a `.prettierignore`. Son documentos del TFM, no código: reformatearlos generaría un diff enorme en una fase que no se está tocando y haría ilegible el historial, que es justo el problema que las tareas F1-a/b/c trataban de evitar. El README no estaba en ese caso, porque se reescribió por completo en esta fase.

**Comprobado antes de actuar:** se ejecutó `--check` (que no modifica nada) antes de `--write`, precisamente para ver qué iba a cambiar.

### P4 — Ruido de PowerShell al redirigir la salida de errores

**Síntoma:** la primera ejecución de los tests mostró, mezclado con el resultado, un bloque de error de PowerShell: `NativeCommandError`, `node.exe : En línea: 1 Carácter: 1`.

**Causa:** redirigir la salida de errores de un programa nativo con `2>&1` hace que Windows PowerShell 5.1 envuelva cada línea en un objeto de error, incluso cuando el programa ha terminado bien. No era un fallo de Vitest.

**Resolución:** dejar de usar `2>&1` con comandos nativos. La salida de errores ya se recoge igualmente. Las ejecuciones siguientes salieron limpias.

### P5 — La carpeta del proyecto no estaba vacía

**Síntoma:** `create-vite` ofrece, ante una carpeta no vacía, un menú cuya **primera opción** es *«Remove existing files and continue»*. La carpeta contenía `docs/` con el prompt maestro, el inventario de la Fase 0 y el PDF de requisitos del máster (documento interno que, tras la corrección **C1-7**, no se versiona).

**Resolución:** no usar ese menú. El proyecto se generó en una carpeta temporal vacía —donde no hay nada que preguntar— y se copió después a la raíz con `Copy-Item`, previa verificación de que no había ningún nombre en común.

**Por qué así y no eligiendo «ignorar»:** con el menú, la seguridad de `docs/` depende de acertar la opción. Con la carpeta temporal, **ningún comando ejecutado tiene capacidad de borrar nada dentro del proyecto**. Es la diferencia entre cumplir una norma y hacer que incumplirla sea imposible.

**Ventaja añadida:** la CLI resultó tener preguntas nuevas (instalar dependencias, modo interactivo). Al ejecutarse en la carpeta temporal, cualquier pregunta inesperada era inocua. Después se descubrió `--no-interactive`, que las elimina todas.

---

## 4. Decisiones tomadas en esta fase

| Decisión | Motivo |
|---|---|
| Generar el andamiaje en una carpeta temporal y copiarlo | Hace imposible, no solo improbable, que se borre `docs/` |
| `--eslint` en lugar del Oxlint por defecto | Lo exige el apartado 3 del prompt maestro y lo necesita la Fase 9. [ADR 0005](../adr/0005-eslint-en-lugar-de-oxlint.md) |
| Repositorio **privado** hasta la Fase 10 | Decisión del usuario. Hacer público lo privado es trivial; lo contrario es imposible |
| Declarar `strict: true` aunque TypeScript 6 ya lo active | No depender de un valor por defecto que ha cambiado entre versiones mayores |
| `ServiceCard` presentacional, con el precio ya formateado | El formato de euros es lógica de negocio y tiene su propio TDD en la Fase 3. Implementarlo ahora obligaría a escribirlo dos veces |
| Nombre accesible del botón con `<span className="sr-only">`, no con `aria-label` | El texto visible queda contenido en el accesible (criterio WCAG 2.5.3) y el nombre se construye desde el contenido, que es más robusto |
| Excluir `docs` de Prettier | Son documentos escritos a mano, no código. Ver el problema **P3** |
| Eliminar los recursos de demostración de Vite | Dejar imágenes y CSS sin usar en el repositorio de un TFM es ruido. Se comprobó antes que nada los referenciaba |
| No instalar la CLI de GitHub (`gh`) | El repositorio se crea desde el navegador: cero instalaciones globales y el usuario ve con sus ojos que marca «Private» |
| No instalar Playwright, Husky ni jsx-a11y todavía | Son las fases 8 y 9. Playwright descarga ~400 MB que no hacen falta aún |
| Dejar el favicon de Vite por ahora | Cambiarlo no es alcance de la Fase 1. Anotado en `PROGRESO.md` para la Fase 11 |
| No versionar el PDF de requisitos del máster | Decisión del usuario. Material docente ajeno y con datos de contacto de terceros. Ver **C1-7** |
| Revisar secretos buscando **categorías de datos**, no archivos conocidos | Un `.gitignore` no protege de un dato copiado a mano en otro archivo. Ver **C1-7** |

---

## 5. Correcciones del usuario y por qué

### C1-1 — Explicar el tratamiento de la carpeta no vacía *antes* de ejecutar

**Corrección:** el usuario no se limitó a prohibir la opción de borrar: exigió que el asistente explicara **cómo** lo iba a hacer antes de ejecutar nada.

**Por qué:** una instrucción como «usa la opción de ignorar, nunca la de eliminar» deja la seguridad de `docs/` en manos de que el asistente acierte al elegir en un menú. Pedir la explicación por adelantado es lo que permitió detectar que había una forma mejor: no llegar al menú.

**Resultado:** la estrategia de la carpeta temporal (problema **P5**). La exigencia de explicar produjo una solución mejor que la que el propio usuario había pedido.

### C1-2 — Repositorio privado hasta la Fase 10

**Corrección:** el apartado 5 del prompt maestro da el repositorio por público desde el principio. El usuario lo cambió a privado hasta después de la revisión de secretos.

**Por qué:** publicar es irreversible. Lo que entra en el historial de un repositorio público queda en las cachés y en los *forks* de cualquiera que lo haya clonado, aunque después se borre. Es el riesgo R3 del inventario de la Fase 0.

**Anotado en `CLAUDE.md`:** privado no relaja ninguna norma de secretos, porque el historial que se escribe ahora es el que se publicará.

### C1-3 — No ejecutar `npm audit fix --force` sin autorización

**Corrección:** el usuario autorizó la fase pero puso una condición: enseñarle las vulnerabilidades y su gravedad, sin aplicar la corrección forzada.

**Por qué:** `npm audit fix --force` **instala versiones mayores de las dependencias ignorando los rangos declarados**. Puede romper el proyecto para resolver una vulnerabilidad que quizá ni siquiera afecte a código que se ejecuta en producción. Es una corrección que exige leer antes qué propone.

**En esta fase no llegó a aplicarse:** `npm audit` devolvió 0 vulnerabilidades. La condición queda vigente para las fases siguientes.

### C1-4 — Una comprobación y la acción que condiciona no pueden ir en el mismo comando

**Corrección:** el asistente propuso un único comando de PowerShell que (a) buscaba referencias a los recursos de demostración de Vite y (b) los borraba a continuación. El usuario lo rechazó:

> El borrado se ejecuta aunque la comprobación encuentre referencias. Sepáralo en dos pasos.

**Por qué tenía razón:** el comando no tenía ninguna condición entre la búsqueda y el `Remove-Item`. Si la búsqueda hubiera encontrado referencias, las habría mostrado por pantalla **y habría borrado los archivos igualmente**. Una comprobación que no puede impedir la acción no es una comprobación: es decoración.

**Resolución:** se ejecutó solo la búsqueda, y después una segunda verificación —buscar `ServiceCard`, que sí existe— para confirmar que la herramienta de búsqueda estaba mirando realmente dentro del proyecto y que los cero resultados eran un negativo real y no un filtro mal puesto. Solo entonces se borró, en un comando aparte.

**Consecuencia permanente:** la norma se incorporó a `CLAUDE.md` (apartado 1), porque no es un detalle de este borrado concreto, sino un patrón que se repite siempre que un comando comprueba algo antes de modificar, borrar o publicar.

**Es la corrección más importante de la fase en cuanto al método de trabajo**, porque corrige un hábito del asistente y no un resultado.

### C1-5 — Mantener el registro de la memoria del proyecto en cada fase

**Corrección:** el usuario pidió ampliar el registro de cada fase con las correcciones, los aprendizajes y los momentos aprovechables para el vídeo, y llevarlo también a las fases ya cerradas.

**Por qué:** el documento final del TFM tiene que explicar **cómo** se desarrolló la aplicación. Eso no se reconstruye de memoria al terminar: los detalles que lo hacen creíble —qué falló, qué se corrigió y por qué— se olvidan en días. Pedirlo en la Fase 1 y no en la 11 es la diferencia entre un documento con evidencias y uno escrito de oído.

**Resolución:** secciones 5, 6 y 7 en cada registro, `docs/decisiones-previas.md` para el contexto anterior al repositorio, y el apartado 8.1 de `CLAUDE.md` como norma permanente, con una regla explícita: **las correcciones se registran también cuando dejan al asistente en mal lugar**, porque un registro que solo recoge aciertos no sirve como evidencia.

### C1-6 — La revisión de secretos buscaba el dominio equivocado

**Corrección:** al revisar los archivos antes del primer commit, el asistente buscó el correo personal del usuario usando un dominio equivocado. El usuario lo corrigió e indicó el dominio real de su agencia.

**Por qué era un error real, y no un detalle:** el asistente tomó el término de la dirección con la que el usuario está identificado en la sesión de la herramienta, y la dio por buena como «el correo personal del usuario» sin comprobarlo. El resultado fue un informe de seguridad que decía «el correo personal no aparece en ningún archivo» **cuando en realidad no se había buscado el correo personal**. La conclusión era correcta por casualidad, no por la comprobación.

Es el mismo error de fondo que el aprendizaje 7 de esta fase: una búsqueda sin resultados y una búsqueda mal planteada se parecen mucho en pantalla.

**Resolución:** se repitió la búsqueda con el dominio correcto y con la parte local de la dirección —ambas sin coincidencias— y se añadió una **búsqueda amplia de cualquier dirección de correo electrónico**, que no depende de acertar el término. Esa búsqueda genérica es ahora la que se usa, porque no presupone qué hay que encontrar. Y encontró algo (ver C1-7).

**Hallazgo derivado — documentar la corrección introdujo el dato.** Al escribir esta misma sección, el asistente citó literalmente el prompt del usuario, que nombraba los dos dominios, y los repitió en la tabla de verificación y en `PROGRESO.md`. Resultado: una búsqueda de esos términos sobre el índice pasó de cero coincidencias a nueve, todas creadas por el propio registro. El dominio de la agencia del autor no aparecía en ninguna parte del repositorio hasta ese momento.

Ninguna formaba una dirección de correo completa, así que la búsqueda genérica seguía limpia, pero el dato estaba. Se sustituyeron por descripciones (*«el dominio de su agencia»*, *«la parte local de la dirección»*), que mantienen intacto el valor del registro: la lección es **que el término de búsqueda era erróneo**, no cuál era.

**Lo que enseña:** la revisión de secretos tiene que ejecutarse **después** de escribir la documentación de la fase, no antes. Documentar un problema de datos personales es una forma habitual de volver a introducirlos, y es un error que se comete precisamente cuando se está siendo cuidadoso.

### C1-7 — No versionar el documento interno del máster

**Corrección:** el usuario pidió retirar `docs/documento-proyecto-final.pdf` del repositorio —sin borrarlo de su disco— porque es un documento interno del máster, no es obra suya y contiene la dirección de correo de un profesor.

**Por qué:** son dos problemas distintos en el mismo archivo. Uno es de **autoría**: el repositorio de un TFM se publica como trabajo propio, y redistribuir material docente ajeno no corresponde. El otro es de **datos de terceros**: una dirección de correo que no es suya quedaría publicada de forma permanente, con el agravante del riesgo R3 (lo publicado permanece en las cachés y en los *forks*).

**Resolución:** `git rm --cached` para sacarlo del índice conservándolo en el disco, entrada en el `.gitignore` con el motivo, y actualización de las cuatro referencias que lo mencionaban en la documentación para indicar que es un documento interno no publicado.

**Hallazgo derivado — el mismo problema en texto plano.** La búsqueda amplia de correos electrónicos introducida por C1-6 encontró que **el correo de ese profesor estaba también escrito en texto plano** en `docs/prompts/fase-00.md`, en un párrafo sobre los requisitos de entrega. Es decir: retirar el PDF no habría resuelto nada, porque el dato seguía publicándose en un archivo Markdown. Se sustituyó por una referencia genérica a «la dirección de contacto que indica el documento oficial».

De paso se corrigió en esa misma línea una afirmación que la decisión de la Fase 10 había dejado obsoleta: decía que el repositorio «será público», cuando ahora es privado durante el desarrollo.

**Lo que esto enseña sobre el método:** la corrección del usuario apuntaba a un archivo; la causa real era un tipo de dato. Un `.gitignore` no protege de un dato copiado a mano en otro sitio. Por eso la revisión previa al commit no puede consistir en comprobar una lista de archivos conocidos, sino en **buscar categorías de datos** —direcciones de correo, claves, tokens— en todo lo que va a entrar.

---

## 6. Aprendizajes de la fase

1. **Leer `--help` antes de ejecutar un comando que se cree conocido.** `npm create vite` se ha escrito millones de veces, y en la versión 9 dejó de instalar ESLint. El flag `--no-interactive` y el descubrimiento de Oxlint salieron de la misma lectura. Ejecutar de memoria habría pasado por alto las dos cosas.

2. **La diferencia entre «cumplir una norma» y «hacer que incumplirla sea imposible».** Prohibir una opción de un menú deja la seguridad en manos del acierto. Generar el proyecto en una carpeta temporal quita al comando la capacidad de borrar. Es el mismo criterio de ingeniería que hay detrás de los tipos de TypeScript o de las ramas protegidas de Git.

3. **Qué es realmente el ciclo rojo-verde.** Ver `Failed to resolve import "./ServiceCard"` no es un paso administrativo: es lo que demuestra que el test ejercita el código. Un test escrito después de la implementación puede estar comprobando algo distinto de lo que uno cree, y nunca se sabrá.

4. **Un componente presentacional es un componente que se puede probar.** `ServiceCard` no tiene estado ni conoce el presupuesto: recibe qué mostrar y a quién avisar. Por eso sus cinco tests son legibles y no necesitan montar media aplicación.

5. **El nombre accesible de un botón no es su texto visible.** Con varias tarjetas en pantalla, un botón que dice «Añadir» no identifica nada para quien navega por lista de botones. La solución (texto corto visible + texto completo oculto para lectores de pantalla) se puede comprobar en un test con `toHaveAccessibleName`, así que la accesibilidad deja de ser una revisión final y pasa a ser un requisito probado.

6. **Las versiones de las herramientas se mueven más rápido que los tutoriales.** Tailwind 4 no genera `tailwind.config.js`, TypeScript 6 activa `strict` por defecto y la plantilla de Vite cambió de analizador. Los tres detalles contradicen la documentación que más circula por internet.

7. **Verificar que una herramienta de verificación funciona.** Al buscar referencias a los archivos a borrar, el resultado fue «ningún resultado». Antes de fiarse, se buscó algo que sí existía. Un filtro mal escrito y un negativo real se parecen mucho en pantalla.

8. **Una revisión de secretos se plantea por categorías de datos, no por archivos.** Buscar «¿está el archivo X?» falla en cuanto el dato se ha copiado a mano a otro sitio, que es lo que había ocurrido con el correo del profesor. Buscar «¿hay alguna dirección de correo aquí dentro?» no depende de acertar de antemano qué hay que encontrar. La segunda forma encontró lo que la primera no podía ver.

9. **Los datos de terceros son tan sensibles como los propios.** La revisión del apartado 5 del prompt maestro está redactada pensando en claves y contraseñas, pero en un repositorio público el correo de otra persona, un nombre o un documento ajeno son igual de irreversibles. Y a diferencia de una clave, no se pueden rotar.

---

## 7. Momentos para el vídeo

### Momento 1 — El ciclo TDD completo sobre `ServiceCard`

**Qué se ve:** el archivo de test escrito y guardado cuando el componente **todavía no existe**. Se ejecuta `npm test` y falla con `Failed to resolve import "./ServiceCard". Does the file exist?`. Se escribe el componente. Se ejecuta otra vez: `Tests 5 passed (5)`.

**Por qué merece estar en el vídeo:** es TDD en treinta segundos y sin explicaciones teóricas. El fallo en rojo es la prueba visual de que el test no está pasando por casualidad, que es exactamente lo que la metodología exige y lo que el apartado 7 del prompt maestro pide explicar paso a paso. Conecta además con el commit de prueba de la Fase 0: el mismo criterio de no fiarse de lo que no se ha visto fallar.

### Momento 2 — El comando que rechacé

**Qué se ve:** el asistente propone un comando que busca referencias a unos archivos y a continuación los borra. Aparece el diálogo de permiso. En lugar de aceptar, se rechaza con el motivo: el borrado se ejecutaría igualmente aunque la búsqueda encontrase referencias. El asistente lo reconoce, lo separa en dos pasos, añade una verificación extra de que la búsqueda funciona y lo incorpora como norma permanente a `CLAUDE.md`.

**Por qué merece estar en el vídeo:** es el momento que mejor explica qué significa desarrollar con IA de forma responsable. No se ve a la IA escribiendo código impresionante, se ve **la supervisión humana funcionando**: el asistente propone algo defectuoso, el desarrollador lo detecta, y la corrección queda incorporada al proyecto para que no se repita. Para un Trabajo Final de Máster sobre desarrollo con IA, vale más que cualquier demostración de velocidad.

### Momento 3 (alternativa, si sobra tiempo) — `strict` y el archivo de prueba

**Qué se ve:** falta `"strict": true` en la configuración de TypeScript. En lugar de suponer, se crea un archivo con un parámetro sin tipo, se compila, el compilador lo rechaza con `TS7006` y el archivo se borra. Conclusión: TypeScript 6 lo activa por defecto.

**Por qué merece estar en el vídeo:** es un ejemplo brevísimo de comprobar en lugar de suponer, y explica por qué en el repositorio hay una opción aparentemente redundante con un comentario que la justifica.

### Momento 4 — El correo que no estaba donde parecía

**Qué se ve:** el informe previo al commit da la revisión de seguridad en verde, con la fila «el correo personal no aparece en ningún archivo». El desarrollador detecta que el asistente ha buscado el dominio equivocado y le hace repetir la búsqueda con el correcto. Al repetirla, se añade una búsqueda genérica de **cualquier** dirección de correo, y aparece la de un profesor escrita en texto plano dentro de un archivo Markdown, justo el mismo dato por el que el desarrollador estaba retirando un PDF del repositorio.

**Por qué merece estar en el vídeo:** encadena tres ideas en un minuto y medio. Primero, que un informe en verde no vale más que la comprobación que lo sostiene. Segundo, que la supervisión humana detectó un fallo que la IA no podía ver, porque la IA no sabía cuál era el dominio correcto. Y tercero, que retirar el archivo no habría resuelto el problema, porque el dato estaba copiado en otro sitio: la revisión hay que plantearla por **tipo de dato**, no por lista de archivos.

Es, además, el momento que mejor justifica ante un tribunal por qué el repositorio se mantuvo privado hasta después de la revisión de secretos.

---

**Recomendación para el guion:** si solo entran dos momentos en el vídeo, los más rentables son el **1** (el ciclo TDD en rojo y verde, que demuestra la metodología) y el **4** (el correo, que demuestra la supervisión). El **2** y el **3** sirven como material de reserva si hace falta rellenar.
