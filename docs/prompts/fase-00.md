# Registro de prompts — Fase 0: Preparación del entorno

**Fecha:** 23/11/2026
**Agente de IA:** Claude Code (modelo Opus 5) sobre la extensión de VS Code
**Objetivo de la fase:** verificar el entorno de desarrollo sin instalar nada y producir un inventario de lo instalado y lo pendiente.

---

## 1. Prompts principales del usuario

### Prompt 1 — Arranque del proyecto

> Voy a desarrollar mi Trabajo Final de Máster contigo.
>
> Lee completos estos dos archivos antes de nada:
> - `docs/prompt-maestro.md` → instrucciones del proyecto "Configurador de Presupuestos", normas de trabajo y plan por fases.
> - `docs/documento-proyecto-final.pdf` → requisitos oficiales del TFM.
>
> Sigue sus normas en todo momento.
>
> Importante: si en tu memoria tienes notas sobre un proyecto llamado "Auditor SEO IA", ese proyecto está descartado y no tiene nada que ver con este. Ignóralas.
>
> Mi situación actual:
> - Windows 11, VS Code, Node.js 24 y la extensión de Claude Code.
> - Acabo de instalar Git 2.56.1 y funciona, pero no lo he configurado (ni nombre ni email) y no sé usarlo. Explícamelo todo paso a paso.
> - Todavía no tengo cuenta de GitHub.
>
> Empieza solo por la Fase 0, tal como indica el apartado 13 del prompt maestro, y espera mi confirmación antes de la Fase 1.

### Prompt 2 — Finales de línea fijados en el repositorio

> De acuerdo con `core.autocrlf false`. En la Fase 1, añade un `.gitattributes` con `* text=auto eol=lf` antes del primer commit, y configura Prettier y VS Code (`files.eol`) para usar LF en este proyecto, así los saltos de línea no dependen de la configuración global de Git.

Corrección acertada sobre la propuesta inicial, que se apoyaba solo en la configuración global de Git. Ese enfoque funciona en esta máquina, pero no viaja con el repositorio: cualquier clonado posterior —incluido el del tribunal evaluador— volvería a depender de la configuración local de quien clone. Queda recogida como tarea obligatoria de la Fase 1 (apartado 4.bis del inventario, tareas F1-a, F1-b y F1-c) y debe trasladarse a `CLAUDE.md` al crearlo.

### Prompt 3 — Datos de identidad y fecha de entrega

> Ya tengo la cuenta de GitHub, con el email privado y la verificación en dos pasos activados.
>
> - Nombre para los commits: Owen Carballo Lopez
> - Email noreply: `360282380+Owencl9@users.noreply.github.com`
> - Usuario de GitHub: Owencl9
>
> Sobre la fecha de entrega (R8): 30/11/2026.
>
> Configura `user.name` y `user.email`, verifica que están bien y cierra la Fase 0. No empieces la Fase 1 hasta que te lo diga.

La respuesta sobre la fecha reveló el hallazgo más importante de la fase: **7 días naturales para un plan de 11 fases**. El riesgo R8 pasó de «a confirmar» a crítico y obligó a replanificar el calendario (apartado 9 del inventario).

### Prompt 4 — Gobierno del proyecto y plan de recorte

Ante la propuesta de un calendario día a día, el usuario la rechazó y fijó un marco propio:

> No necesito un calendario por días: puedo avanzar varias fases en un mismo día. Trabajaremos fase a fase, a mi ritmo, y yo te diré cuándo pasar a la siguiente.
>
> Lo que sí quiero mantener del plan:
> 1. Adelantar el despliegue en Vercel justo después de tener la Fase 1 funcionando, para detectar problemas de publicación cuanto antes.
> 2. La entrega es el 30/11. Las slides y el vídeo son obligatorios, así que avísame si en algún momento ves que el ritmo pone en riesgo tener tiempo para prepararlos.
> 3. Plan de recorte si vamos justos: primero se quitan Husky, los tests E2E extra (dejar solo el recorrido principal) y GitHub Actions avanzado; después, los borradores en localStorage (4.6). Nunca se recortan: el cálculo correcto del presupuesto con descuentos e IGIC, los tests de la lógica de negocio, el despliegue, el README, las slides y el vídeo.
> 4. Se descarta el extra opcional de IA (4.7).

**Corrección pertinente.** La propuesta de calendario asignaba fechas a cada fase presuponiendo un ritmo de trabajo del usuario, algo que el apartado 8 del prompt maestro reserva expresamente a su decisión. El diagnóstico del riesgo era correcto; la forma de mitigarlo, no.

Lo aprovechable de la propuesta se conservó: el adelanto del despliegue y el descarte del 4.7. Lo que el usuario añadió y no estaba previsto:

- un **orden explícito de recorte**, que convierte una decisión difícil de improvisar bajo presión en una lista preacordada;
- una **lista de elementos intocables**, que protege el núcleo funcional y metodológico del proyecto;
- una **obligación de aviso proactivo** sobre las slides y el vídeo, que traslada al asistente la vigilancia del plazo.

Recogido en el apartado 9 (subapartados 9.1 a 9.7) del inventario.

### Prompt 5 — Contenido del PDF de requisitos

Ante el fallo de extracción del PDF (ver el problema P1), el usuario pegó directamente en el chat el texto de los requisitos oficiales del TFM: documentación en README, repositorio público en GitHub, despliegue en funcionamiento con URL, slides de presentación, vídeo con grabación de pantalla, y entrega mediante el formulario de la lección «Proyecto Final».

---

## 2. Resumen de lo generado

No se ha generado código. Conforme al apartado 13 del prompt maestro, la Fase 0 es solo de lectura.

**Comprobaciones ejecutadas** (todas de lectura, ninguna con efectos sobre el sistema):

| Objetivo | Comandos |
|---|---|
| Sistema operativo y arquitectura | `Get-CimInstance Win32_OperatingSystem`, `$env:PROCESSOR_ARCHITECTURE` |
| PowerShell y política de ejecución | `$PSVersionTable`, `Get-ExecutionPolicy -List`, lectura de `HKCU`/`HKLM\...\ShellIds\Microsoft.PowerShell` |
| Node.js y npm | `node --version`, `npm --version`, `Get-Command`, `npm config get registry` |
| Git | `git --version`, `git config --global --list`, `git rev-parse --is-inside-work-tree` |
| VS Code y extensiones | `Get-Command code`, `code --list-extensions` |
| Carpeta de trabajo y OneDrive | `Test-Path`, `[Environment]::GetFolderPath('Desktop')`, `User Shell Folders`, variables `OneDrive*` |
| Recursos y conectividad | `Get-PSDrive C`, `Invoke-WebRequest https://registry.npmjs.org/-/ping` |
| Rutas largas | `git config core.longpaths`, `HKLM\...\FileSystem\LongPathsEnabled` |

**Archivos creados:**

- `docs/fase-00-inventario-entorno.md` — inventario completo, riesgos (R1–R8), cuentas necesarias y confirmación de la carpeta de trabajo.
- `docs/prompts/fase-00.md` — este registro.

**Cambios ejecutados tras la autorización expresa del usuario** (hasta ese momento no se había modificado nada del sistema):

| Acción | Comando | Verificación |
|---|---|---|
| Política de ejecución de PowerShell | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` | `RemoteSigned` en `HKCU`; `npm.ps1 --version` → `11.19.0` en una terminal sin `Bypass` |
| Extensiones de VS Code (4) | `code --install-extension` de `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `bradlc.vscode-tailwindcss`, `ms-playwright.playwright` | `code --list-extensions --show-versions` → 5 extensiones |
| Ajustes de Git para Windows (4) | `init.defaultBranch=main`, `core.autocrlf=false`, `core.longpaths=true`, `pull.rebase=false` | `git config --global --list` |

| Identidad de Git | `user.name="Owen Carballo Lopez"`, `user.email="360282380+Owencl9@users.noreply.github.com"` | `git var GIT_AUTHOR_IDENT` y un commit real (`cb8f969`) en un repositorio desechable de la carpeta temporal, eliminado después |

Sobre la última verificación: releer la configuración con `git config --list` solo demuestra que el valor se escribió. Lo que se quería comprobar era que Git **acepta un commit** y lo firma con los datos correctos, de ahí el repositorio de prueba. Confirmó además que `init.defaultBranch=main` surte efecto: la rama creada fue `main`, no `master`.

**Hallazgos principales:**

1. No falta ningún programa esencial. Lo pendiente es configuración, no instalación.
2. La política de ejecución de PowerShell es `Restricted` de forma efectiva, lo que bloquearía `npm` en la terminal de VS Code (riesgo R1).
3. Git no tiene `user.name` ni `user.email`, por lo que rechazaría cualquier commit.
4. `init.defaultBranch` no está definido: Git crearía la rama `master` en lugar de `main`.
5. De las cinco extensiones previstas en VS Code solo está instalada la de Claude Code.
6. La carpeta del proyecto está fuera de OneDrive. Requisito cumplido.

---

## 3. Problemas encontrados y cómo se resolvieron

### P1 — No se pudo leer el PDF de requisitos del máster

*(`docs/documento-proyecto-final.pdf`, documento interno no versionado.)*

**Síntoma:** la lectura del PDF falló con `pdftoppm is not installed` (falta `poppler-utils`, que no viene en Windows).

**Intentos:**
1. Lectura directa del PDF con la herramienta del agente → falló por la dependencia ausente.
2. Comprobación de Python y de la librería `pypdf` para extraer el texto → Python no está instalado en el equipo.
3. Script propio en Node.js (`zlib.inflateSync` sobre los *content streams* del PDF y extracción de los operadores `Tj`/`TJ`), ejecutado en el directorio temporal de la sesión para no ensuciar el repositorio → devolvió 2 bytes, es decir, texto vacío. El PDF probablemente usa flujos de objetos comprimidos o fuentes con codificación propia.

**Resolución:** el usuario interrumpió los intentos y pegó el contenido del documento en el chat. Los requisitos oficiales quedaron así incorporados y contrastados con el apartado 10 del prompt maestro: coinciden, con un matiz que el prompt maestro no recogía: si el repositorio se entregase en privado, habría que justificarlo y dar acceso de lectura a la dirección de contacto que indica el documento oficial. No llegará a aplicarse, porque el repositorio es privado solo durante el desarrollo y se publicará en la Fase 10, antes de la entrega.

**Nota añadida en la Fase 1:** este PDF **ya no se versiona**. Es material interno del máster, ajeno al autor, y contiene datos de contacto de terceros. Se conserva en local y está excluido en el `.gitignore`. La dirección de correo concreta que aparecía citada en este párrafo se ha retirado por el mismo motivo. Ver la corrección **C1-7** del registro de la Fase 1.

**Lección aplicada:** no insistir en una vía técnica que ya ha fallado dos veces cuando existe un camino directo. Para los documentos de requisitos, el texto plano (`.md`) es preferible al PDF.

### P2 — La fecha de entrega deja 7 días para 11 fases

**Síntoma:** el documento oficial indicaba el 26/10/2026, una fecha ya pasada respecto al 23/11/2026. Al preguntar, el usuario confirmó que su fecha real es el **30/11/2026**.

**Impacto:** el prompt maestro define 11 fases sin asignarles calendario. Con 7 días naturales, el calendario pasa a ser la restricción dominante. El riesgo no es técnico, sino de secuencia: los entregables que no son código (slides y vídeo) no se comprimen con ayuda de la IA al mismo ritmo que el código, y un despliegue que falle la víspera no deja margen de diagnóstico.

**Resolución:** el asistente propuso un calendario día a día; el usuario lo rechazó y fijó en su lugar un marco de gobierno propio (ver el prompt 4), recogido en el apartado 9 del inventario: trabajo fase a fase al ritmo del usuario, despliegue adelantado, plan de recorte por orden de prioridad, lista de elementos intocables y obligación de aviso proactivo sobre slides y vídeo.

**Lección aplicada, doble:**

1. Preguntar por las fechas en la fase de preparación, no a mitad del desarrollo. El problema se detectó porque la fecha del documento oficial era incoherente con la fecha real; de no haberse comprobado, la replanificación habría llegado tarde.
2. Diagnosticar el riesgo es tarea del asistente; decidir el ritmo de trabajo, del usuario. La propuesta de calendario mezclaba ambas cosas.

### P3 — Memoria con notas de un proyecto descartado

**Síntoma:** riesgo de contaminar el proyecto con decisiones de un proyecto anterior («Auditor SEO IA»).

**Resolución:** el usuario lo descartó expresamente en el prompt inicial. Esas notas se ignoran y el contexto del proyecto se toma únicamente de `docs/prompt-maestro.md` y del documento oficial del TFM.

### P4 — Lectura engañosa de la política de ejecución

**Síntoma:** `Get-ExecutionPolicy` devolvía `Bypass`, lo que sugería que no había ningún problema.

**Causa:** `Bypass` estaba fijado en el ámbito `Process` mediante la variable de entorno `PSExecutionPolicyPreference`, que establece el propio entorno de Claude Code y heredan los procesos hijos. No refleja lo que ocurre en una terminal abierta por el usuario.

**Resolución:** se leyeron los valores reales del registro en `HKCU` y `HKLM`. Ambos están sin definir, de modo que la política efectiva para el usuario es `Restricted`. El riesgo R1 se habría pasado por alto si se hubiera confiado en la primera lectura.

**Lección aplicada:** al diagnosticar el entorno, verificar el origen del valor y no solo el valor.

---

## 4. Decisiones tomadas en esta fase

| Decisión | Motivo |
|---|---|
| Mantener la carpeta `C:\Users\Owen\Desktop\Proyecto Final\configurador-presupuestos` | Fuera de OneDrive, ya contiene `docs/`, y el espacio en el nombre no causa problemas reales |
| No activar `LongPathsEnabled` en el registro de Windows | Requiere administrador y reinicio; la ruta es corta y `core.longpaths` de Git cubre el caso |
| Crear la cuenta de GitHub en la Fase 0 y no en la Fase 10 | El correo del primer commit queda público y permanente; conviene disponer antes del correo `@users.noreply.github.com` |
| Usar el correo `@users.noreply.github.com` como `user.email` | Decisión del usuario. Evita publicar su dirección real en el historial de un repositorio público (riesgo R2) |
| Fijar los finales de línea en el repositorio (`.gitattributes`) y no solo en la configuración global de Git | Decisión del usuario. La configuración global no viaja con el repositorio; `.gitattributes` sí |
| Trabajar fase a fase, sin calendario por días, al ritmo que marque el usuario | Decisión del usuario. El apartado 8 del prompt maestro le reserva la decisión de cuándo avanzar |
| Adelantar el despliegue en Vercel a justo después de la Fase 1 | Detectar los problemas de publicación cuanto antes. Vercel redespliega en cada push, así que adelantarlo no cuesta tiempo |
| Orden de recorte preacordado y lista de elementos intocables | Decisión del usuario. Evita improvisar decisiones de alcance bajo presión de plazo |
| Descartar definitivamente el extra opcional 4.7 | Decisión del usuario. No se volverá a proponer |
| No instalar nada antes de la autorización | Apartados 8 y 13 del prompt maestro. Las instalaciones y los cambios de configuración se ejecutaron después de que el usuario los autorizara de forma explícita |

Ninguna de estas decisiones tiene entidad suficiente para un ADR. Los primeros ADR se redactarán en la Fase 1 (sin backend, céntimos como unidad monetaria, Strategy para los descuentos).

El contexto anterior a esta fase —por qué el proyecto es este y no el auditor SEO con IA que planteé primero— está en [docs/decisiones-previas.md](../decisiones-previas.md).

---

## 5. Correcciones del usuario y por qué

*Sección añadida el 24/11/2026, durante la Fase 1, al decidir que cada fase registre también las correcciones, los aprendizajes y los momentos aprovechables para el vídeo.*

### C0-1 — Ignorar las notas de un proyecto descartado

**Corrección:** en el primer prompt, antes de cualquier otra cosa, el usuario avisó de que las notas sobre un proyecto «Auditor SEO IA» estaban descartadas.

**Por qué:** el asistente conserva memoria entre conversaciones. Sin ese aviso, habría arrastrado decisiones de un proyecto con Python, Flask y una API de pago a un proyecto sin servidor y sin secretos, que es exactamente lo contrario. La corrección llegó **antes** del error, no después.

### C0-2 — Los finales de línea deben fijarse en el repositorio

**Corrección:** el asistente propuso resolver el problema de CRLF/LF con `core.autocrlf false` en la configuración global de Git. El usuario lo aceptó, pero exigió además un `.gitattributes` con `* text=auto eol=lf`, y configurar Prettier y VS Code para LF.

**Por qué:** la configuración global de Git vive en la máquina y **no viaja con el repositorio**. La propuesta inicial funcionaba en este equipo, pero cualquier clonado posterior —incluido el del tribunal evaluador— volvería a depender de lo que tuviera configurado quien clonase. El `.gitattributes` sí viaja.

**Resultado:** se convirtió en las tareas obligatorias F1-a, F1-b y F1-c, ejecutadas en la Fase 1. Cerró el riesgo R4.

### C0-3 — El ritmo de trabajo lo marca el usuario, no el asistente

**Corrección:** ante el riesgo del plazo, el asistente propuso un calendario con una fecha asignada a cada fase. El usuario lo rechazó y fijó en su lugar un marco propio: trabajo fase a fase a su ritmo, despliegue adelantado, orden de recorte preacordado, lista de elementos intocables y obligación de aviso proactivo.

**Por qué:** el diagnóstico del riesgo era correcto, pero la solución presuponía un ritmo de trabajo que no corresponde fijar al asistente. El apartado 8 del prompt maestro le reserva expresamente al usuario la decisión de cuándo avanzar.

**Lo que mejoró respecto a la propuesta:** el usuario añadió tres cosas que no estaban previstas —un orden explícito de recorte, una lista de intocables y la obligación de aviso— que convierten decisiones difíciles de improvisar bajo presión en acuerdos tomados con antelación.

### C0-4 — No insistir en una vía técnica que ya ha fallado

**Corrección:** tras dos intentos fallidos de extraer el texto del PDF de requisitos, y en medio del tercero, el usuario interrumpió al asistente y pegó el contenido en el chat.

**Por qué:** el asistente estaba escribiendo un script propio en Node.js para descomprimir los flujos internos del PDF, cuando existía un camino directo que costaba treinta segundos. Insistir en la vía técnica era gastar tiempo del plazo en un problema que no era el del proyecto.

---

## 6. Aprendizajes de la fase

1. **Verificar el origen de un valor, no solo el valor.** `Get-ExecutionPolicy` devolvía `Bypass`, que parecía indicar que no había ningún problema. El valor real del registro estaba sin definir, es decir, `Restricted`. El `Bypass` venía de una variable de entorno que establece el propio Claude Code en su proceso y que no afecta a las terminales del usuario. De haber confiado en la primera lectura, `npm install` habría fallado en la Fase 1 sin explicación aparente.

2. **Una comprobación debe probar lo que importa, no lo más cómodo de comprobar.** Releer `git config --list` solo demuestra que un valor se escribió. Lo que había que comprobar era que Git **acepta un commit y lo firma bien**, y eso solo lo demuestra hacer un commit de verdad. De paso confirmó que `init.defaultBranch=main` surtía efecto.

3. **Git tiene tres ámbitos de configuración** (sistema, usuario y repositorio) y el más específico gana. Es lo que explica que la configuración de máquina traiga `core.autocrlf=true` y que, aun así, el valor del usuario (`false`) sea el que se aplica.

4. **El correo del primer commit es permanente.** Queda en el historial público, y en los *forks* de cualquiera que clone el repositorio, aunque después se borre. De ahí la decisión de crear la cuenta de GitHub en la Fase 0, antes de programar, y usar la dirección `@users.noreply.github.com`.

5. **El plazo es un dato técnico, no un detalle administrativo.** Preguntarlo en la fase de preparación cambió el plan entero. Descubierto a mitad del desarrollo, habría llegado tarde.

---

## 7. Momentos para el vídeo

### Momento 1 — La política de PowerShell que parecía estar bien

**Qué se ve:** el asistente ejecuta `Get-ExecutionPolicy`, que responde `Bypass`. Acto seguido lee el registro de Windows y encuentra el valor sin definir: la política real es `Restricted`. Explica que el `Bypass` lo introduce su propio entorno y que, en la terminal del usuario, `npm install` fallaría.

**Por qué merece estar en el vídeo:** es un error que habría pasado desapercibido y que habría aparecido en la fase siguiente disfrazado de «npm no funciona». Muestra que el valor de la IA aquí no fue escribir código, sino **desconfiar de su propia primera lectura**. Dura menos de un minuto y se entiende sin saber PowerShell.

### Momento 2 — Un commit de prueba en una carpeta de usar y tirar

**Qué se ve:** para validar la identidad de Git, el asistente no se limita a releer la configuración: crea un repositorio desechable en una carpeta temporal, hace un commit real (`cb8f969`), comprueba la autoría y la rama, y elimina la carpeta. El proyecto no se toca en ningún momento.

**Por qué merece estar en el vídeo:** ilustra en treinta segundos la diferencia entre comprobar que algo *está configurado* y comprobar que algo *funciona*. Es el mismo criterio que después se aplica al TDD, así que conecta la Fase 0 con el resto del proyecto.
