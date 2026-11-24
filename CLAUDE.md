# Normas del proyecto — Configurador de Presupuestos

Instrucciones permanentes para Claude Code en este repositorio. La
especificación completa está en [docs/prompt-maestro.md](docs/prompt-maestro.md)
y manda sobre este archivo en caso de duda.

## 1. Cómo trabajar

- **Una fase a la vez.** No se avanza a la siguiente fase sin autorización
  expresa del usuario (apartado 8 del prompt maestro).
- **Explicar antes de ejecutar**: qué se va a conseguir, qué archivos se tocan,
  qué comandos se van a lanzar. Esperar autorización para instalaciones y
  cambios importantes.
- No instalar programas globales ni modificar la configuración del sistema sin
  autorización.
- El usuario tiene experiencia en desarrollo web, WordPress, PHP, CSS,
  JavaScript y servidores Linux. **No da por conocidos React, TypeScript, Vite,
  Vitest ni Playwright**: hay que explicar lo que se hace con ellos.
- Ante un error, identificar la causa y proponer una solución concreta. No
  reestructurar la aplicación para arreglar un problema pequeño.
- No añadir funcionalidades que no estén en la especificación.
- **Una comprobación previa no puede ir en el mismo comando que la acción que
  condiciona.** Si un comando comprueba algo y después borra, modifica o
  publica, el resultado de la comprobación no impide nada. Dos pasos: primero
  comprobar y mostrar el resultado, después actuar.

## 2. Idioma

- Código, nombres de archivo y ramas de Git: **inglés**.
- Comentarios, documentación, mensajes de commit, textos de interfaz y nombres
  de los tests: **español**.

## 3. Calidad y metodología

- **TDD obligatorio en la lógica de negocio.** El ciclo se ejecuta y se explica
  completo: test primero → comprobar que **falla** → implementación mínima →
  refactorización en verde. Un test que no se ha visto fallar no demuestra nada.
- Al cerrar cada fase deben pasar `npm test`, `npm run lint` y `npm run build`.
  Desde la Fase 8, también los tests de Playwright.
- **Dinero siempre en céntimos** (enteros). La conversión a euros ocurre solo al
  mostrarlo, en formato español (`1.234,56 €`). Ver
  [ADR 0003](docs/adr/0003-dinero-en-centimos.md).
- Las reglas de negocio y sus valores viven **centralizados en un único archivo
  de constantes**, no repartidos por el código.
- Los descuentos se implementan con el patrón Strategy. Ver
  [ADR 0004](docs/adr/0004-strategy-para-descuentos.md).
- Accesibilidad: todo operable con teclado, elementos con nombre accesible y
  encabezados jerárquicos. No transmitir información solo con el color.

## 4. Finales de línea: LF siempre

Decisión del usuario (Fase 0). Los finales de línea se fijan **en el
repositorio**, no en la configuración de Git de cada máquina, para que sobrevivan
a un clonado en otro equipo:

| Archivo                 | Ajuste               |
| ----------------------- | -------------------- |
| `.gitattributes`        | `* text=auto eol=lf` |
| `.prettierrc.json`      | `"endOfLine": "lf"`  |
| `.vscode/settings.json` | `"files.eol": "\n"`  |

No revertir ninguno de los tres ni confiar en `core.autocrlf`.

## 5. Seguridad

- El repositorio es **privado hasta la Fase 10**, y se hará público tras la
  revisión de secretos. Esto cambia el apartado 5 del prompt maestro, que lo daba
  por público desde el principio. **Privado no relaja ninguna norma**: el
  historial que se escribe ahora es el que se publicará.
- Nunca incluir claves, tokens, contraseñas ni datos personales en el código.
- **Revisar antes de cada commit que no entra información sensible, buscando
  categorías de datos y no archivos concretos.** Una lista de archivos
  conocidos falla en cuanto un dato se ha copiado a mano a otro sitio. Hay que
  buscar, sobre lo que va a entrar en el commit: direcciones de correo
  (cualquiera, con una expresión genérica, no solo las que se esperan), claves y
  tokens, rutas con el nombre de usuario y datos de terceros.
- **Toda revisión de secretos incluye un control positivo:** buscar algo que se
  sabe que existe, con la misma herramienta y la misma expresión. Un «sin
  coincidencias» no distingue entre «no hay nada» y «esto no está buscando». Si
  el control falla, se repite la revisión con **otra herramienta**, no con otro
  intento. Ocurrió en la Fase 2 (problema P9): diez categorías en verde porque
  la búsqueda recorría los nombres de archivo y no su contenido.
- **Los datos de terceros son tan sensibles como los propios**, y además no se
  pueden rotar. No se versionan documentos ajenos —material docente del máster,
  por ejemplo— ni nombres, correos o datos de contacto de otras personas.
- **La revisión de secretos se ejecuta al final, después de escribir la
  documentación de la fase**, nunca antes. Documentar un problema de datos
  personales es una forma habitual de volver a introducirlos: al citar un prompt
  o describir un hallazgo se copian los datos que se querían retirar. Ocurrió en
  la Fase 1 (corrección C1-6). Al registrar un incidente de este tipo, se
  describe el dato en lugar de reproducirlo.
- No usar `dangerouslySetInnerHTML` ni insertar HTML a partir de datos del
  usuario.
- Validar todo lo que se lee de `localStorage` antes de usarlo. Si está dañado,
  descartarlo y empezar de cero sin romper la aplicación.
- El correo de los commits es `360282380+Owencl9@users.noreply.github.com`, no el
  correo personal del usuario.

## 6. Estructura

- `src/shared/` → lo que usan varias funcionalidades (types, utils, constants,
  data, strategies, components, hooks).
- `src/features/X/` → lo específico de una funcionalidad.
- `src/context/` → estado global del presupuesto.
- `e2e/` → tests de Playwright con Page Objects.
- `docs/` → documentación, ADR y registro de prompts.

Los tests viven junto al código que prueban (`ServiceCard.tsx` y
`ServiceCard.test.tsx` en la misma carpeta).

## 7. Lo que no se usa

No usar Next.js, Redux, bases de datos, Docker, Sentry, librerías de PDF ni
backend propio. Si algo parece necesitarlo, plantearlo al usuario antes de
cambiar el planteamiento.

El extra opcional del párrafo redactado por IA (apartado 4.7 del prompt maestro)
está **descartado** por decisión del usuario y no se vuelve a proponer.

## 8. Documentación que hay que mantener al día

| Archivo                   | Contenido                                                                        |
| ------------------------- | -------------------------------------------------------------------------------- |
| `PROGRESO.md`             | fase actual, hecho, probado, pendiente y siguiente paso                          |
| `README.md`               | descripción, stack, instalación, estructura, URL del despliegue                  |
| `docs/adr/`               | una decisión importante por archivo: contexto, opciones, decisión, consecuencias |
| `docs/prompts/fase-XX.md` | prompts del usuario, resumen de lo generado, problemas y soluciones              |

Al cerrar cada fase: actualizar `PROGRESO.md`, escribir el registro de prompts y
proponer un commit con un mensaje claro.

### 8.1. Registro de la memoria del proyecto (norma permanente)

Al final del proyecto, el usuario tiene que entregar un documento que explique
**cómo** ha desarrollado la aplicación: el proceso, el uso de la IA, las
decisiones, los problemas y su resolución. Ese documento no se puede reconstruir
de memoria al terminar, así que se va acumulando fase a fase.

Por eso, `docs/prompts/fase-XX.md` incluye **siempre** estas secciones, además de
los prompts, el resumen de lo generado y los problemas:

| Sección                      | Qué recoge                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Correcciones del usuario** | qué me ha corregido el usuario en esa fase, **con el motivo**, no solo el qué. Se registran tanto si tenía razón como si no                      |
| **Aprendizajes de la fase**  | lo que la fase ha dejado aprendido, en términos que sirvan para explicarlo a otra persona                                                        |
| **Momentos para el vídeo**   | uno o dos instantes concretos de la fase que merezca la pena mostrar en el vídeo de demostración, con lo que se ve en pantalla y por qué importa |

Reglas de este registro:

- **Las correcciones se registran también cuando me dejan en mal lugar.** Un
  registro que solo recoge los aciertos no sirve como evidencia de nada. El
  valor de estos documentos para el TFM está en mostrar el trabajo real, con sus
  errores y su supervisión humana.
- Se escribe al cerrar la fase, no al final del proyecto.
- El contexto anterior a este repositorio está en
  [docs/decisiones-previas.md](docs/decisiones-previas.md): conviene leerlo para
  no contradecirlo.

## 9. Plazo

Entrega: **30/11/2026**. Los días **29 y 30 están reservados** para las slides y
el vídeo, que son entregables obligatorios y requieren tiempo del usuario.

Encargo expreso del usuario: **avisar de forma proactiva**, al cerrar cada fase,
si el ritmo pone en riesgo ese margen. Si hay que recortar, el orden preacordado
es: 1) Husky, 2) tests E2E extra, 3) GitHub Actions avanzado, 4) borradores en
localStorage. Nunca se recortan el cálculo del presupuesto, los tests de la
lógica de negocio, el despliegue, el README, las slides ni el vídeo.

Los recortes se **proponen**, nunca se aplican por iniciativa propia.
