# Fase 0 — Inventario del entorno de desarrollo

**Fecha de comprobación:** 23/11/2026
**Método:** comandos exclusivamente de lectura (sin instalaciones ni cambios de configuración).
**Carpeta del proyecto:** `C:\Users\Owen\Desktop\Proyecto Final\configurador-presupuestos`

---

## 1. Resumen ejecutivo

| | |
|---|---|
| Bloqueantes para empezar la Fase 1 | **0** |
| Acciones completadas en esta fase | **3** (política de PowerShell, extensiones de VS Code, ajustes de Git para Windows) |
| Acciones pendientes antes del primer commit | **2** (cuenta de GitHub, identidad de Git) |

El equipo es apto para el proyecto. No falta ningún programa esencial: Node.js, npm, Git y VS Code están instalados y funcionando. Lo pendiente era **configuración**, no instalación.

**Autorizado y ejecutado por el usuario el 23/11/2026:** política de ejecución de PowerShell, instalación de las cuatro extensiones de VS Code y los cuatro ajustes de Git que no dependen de la identidad del autor. Queda pendiente únicamente la cuenta de GitHub y, con ella, `user.name` y `user.email`.

---

## 2. Instalado y verificado

| Componente | Versión detectada | Requisito del proyecto | Estado |
|---|---|---|---|
| Windows | 11 Pro (10.0.26300) | — | OK |
| Arquitectura | AMD64 (x64) | x64 | OK |
| PowerShell | 5.1.26100.9818 | 5.1 o superior | OK |
| Node.js | v24.20.0 (`C:\Program Files\nodejs\node.exe`) | 20.19+ para Vite 7 | OK, con margen |
| npm | 11.19.0 | incluido con Node | OK |
| Git | 2.56.1.windows.1 (`C:\Users\Owen\AppData\Local\Programs\Git\cmd\git.exe`) | 2.40+ | OK |
| VS Code | instalado, CLI `code` disponible en el PATH | — | OK |
| Extensión Claude Code | `anthropic.claude-code` | — | OK |
| Espacio libre en C: | 357,5 GB | ~2 GB (node_modules + navegadores de Playwright) | OK, muy holgado |
| Acceso a registry.npmjs.org | HTTP 200 | necesario para `npm install` | OK |
| Registro de npm | `https://registry.npmjs.org/` (oficial) | oficial | OK |

### Comprobación de OneDrive (requisito explícito)

| Comprobación | Resultado |
|---|---|
| Carpeta real del Escritorio | `C:\Users\Owen\Desktop` |
| Redirección en el registro (User Shell Folders → Desktop) | `C:\Users\Owen\Desktop` (sin redirigir) |
| Carpeta de OneDrive en el equipo | `C:\Users\Owen\OneDrive` |
| ¿El proyecto está dentro de OneDrive? | **NO** |

**Conclusión:** la ruta del proyecto está fuera de OneDrive. Correcto.
**Advertencia:** no activar en el futuro la copia de seguridad del Escritorio en OneDrive. Sincronizar `node_modules` (decenas de miles de archivos pequeños) provoca bloqueos de archivos, instalaciones corruptas y consumo de CPU.

---

## 3. Pendiente — configuración obligatoria antes del primer commit

### 3.1. Política de ejecución de scripts de PowerShell

| Ámbito | Valor |
|---|---|
| MachinePolicy | Undefined |
| UserPolicy | Undefined |
| CurrentUser (HKCU) | **no definida → por defecto `Restricted`** |
| LocalMachine (HKLM) | **no definida → por defecto `Restricted`** |

La política efectiva en una terminal normal de VS Code es **`Restricted`**: PowerShell no ejecuta ningún archivo de script `.ps1`.

En `C:\Program Files\nodejs` existen tres lanzadores: `npm`, `npm.cmd` y `npm.ps1`. PowerShell elige `npm.ps1`, que está bloqueado por la política. Al escribir `npm install` en la terminal integrada aparecerá:

```
npm.ps1 : No se puede cargar el archivo ... porque la ejecución de scripts
está deshabilitada en este sistema.
```

Lo mismo afectará a `npx`, a los hooks de Husky y a cualquier script de npm.

**Nota:** en la sesión de Claude Code esta política aparece como `Bypass`, pero solo porque la variable de entorno `PSExecutionPolicyPreference=Bypass` se aplica al proceso actual. No es un cambio permanente y no afecta a las terminales que abra el usuario.

**Solución:** `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
Afecta solo a este usuario, no requiere permisos de administrador y es la configuración recomendada por Microsoft para equipos de desarrollo: permite los scripts locales y exige firma únicamente a los descargados de internet.

**[RESUELTO — 23/11/2026]** Ejecutado con autorización del usuario:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

El comando devolvió un aviso (`el valor queda invalidado por una directiva definida en un ámbito más específico`) porque el ámbito `Process` de la sesión de Claude Code seguía en `Bypass`. **No es un fallo:** el valor se escribió correctamente. Verificado de dos formas:

| Comprobación | Resultado |
|---|---|
| Valor en `HKCU\...\ShellIds\Microsoft.PowerShell` | `RemoteSigned` |
| `Get-ExecutionPolicy` en una terminal limpia (sin la variable `PSExecutionPolicyPreference`) | `RemoteSigned` |
| Ejecución real de `npm.ps1 --version` sin `Bypass` | `11.19.0` — funciona |

Riesgo R1 cerrado.

### 3.2. Identidad de Git

| Clave | Valor actual |
|---|---|
| `user.name` | **NO DEFINIDO** |
| `user.email` | **NO DEFINIDO** |
| `init.defaultBranch` | **NO DEFINIDO** (Git usaría `master`) |
| `core.editor` | `code --wait` (configurado por el instalador de Git) |

Sin `user.name` y `user.email`, Git rechaza cualquier commit. Hay que definirlos antes del primer commit de la Fase 1.

`init.defaultBranch` debe ser `main`: es el nombre que GitHub, Vercel y GitHub Actions esperan por defecto.

**[RESUELTO — 23/11/2026]** Identidad configurada con los datos facilitados por el usuario:

```
user.name  = Owen Carballo Lopez
user.email = 360282380+Owencl9@users.noreply.github.com
```

Verificado en tres niveles, no solo releyendo la configuración:

| Comprobación | Resultado |
|---|---|
| `git config --global --list` | ambas claves presentes |
| `git var GIT_AUTHOR_IDENT` | `Owen Carballo Lopez <360282380+Owencl9@users.noreply.github.com>` — la firma exacta que se estampará |
| Commit real en un repositorio desechable (carpeta temporal, eliminado después) | commit `cb8f969` aceptado, rama `main`, autoría correcta |

La tercera comprobación valida de una vez la identidad, que los commits funcionan y que `init.defaultBranch=main` surte efecto.

### 3.3. Cuenta de GitHub

No existe todavía. Es imprescindible: el repositorio público en GitHub es un requisito de entrega del máster.

Conviene crearla **antes del primer commit**, no después, porque de ella depende qué correo electrónico queda grabado para siempre en el historial público de commits (ver riesgo R2).

**[RESUELTO — 23/11/2026]** Cuenta creada por el usuario: **`Owencl9`**, con «Keep my email addresses private» y verificación en dos pasos activadas. URL prevista del repositorio: `github.com/Owencl9/configurador-presupuestos`. Riesgo R2 cerrado: el correo real del usuario no aparecerá en el historial.

---

## 4. Pendiente — recomendado

### 4.1. Extensiones de VS Code

Instalada: `anthropic.claude-code`. Faltan las cuatro del plan de desarrollo:

| Extensión | Identificador | Para qué sirve |
|---|---|---|
| ESLint | `dbaeumer.vscode-eslint` | marca los errores de lint mientras se escribe |
| Prettier | `esbenp.prettier-vscode` | formatea el código al guardar |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | autocompletado y vista previa de las clases de Tailwind |
| Playwright | `ms-playwright.playwright` | ejecuta y depura los tests E2E desde el panel de VS Code |

No son imprescindibles para que el proyecto funcione (ESLint, Prettier y Playwright se ejecutan igualmente desde la terminal), pero sin ellas se pierde el aviso inmediato de errores en el editor.

**[RESUELTO — 23/11/2026]** Instaladas con autorización del usuario mediante `code --install-extension`. Estado verificado con `code --list-extensions --show-versions`:

```
anthropic.claude-code@2.1.330
bradlc.vscode-tailwindcss@0.16.0
dbaeumer.vscode-eslint@3.0.34
esbenp.prettier-vscode@12.4.0
ms-playwright.playwright@1.1.19
```

### 4.2. Ajustes de Git para Windows

| Clave | Valor actual | Valor propuesto | Motivo |
|---|---|---|---|
| `core.autocrlf` | no definido | `false` | evitar que Git convierta los finales de línea por su cuenta. Los controlaremos con un `.gitattributes` en la Fase 1. Si no, Prettier y Git se contradicen y cada archivo aparece modificado por completo en cada commit. |
| `core.longpaths` | no definido | `true` | `node_modules` genera rutas muy profundas. Sin esto, Git puede fallar con «Filename too long». |
| `pull.rebase` | no definido | `false` | fija el comportamiento de `git pull` y elimina el aviso de Git al hacer el primer `pull`. |

**[RESUELTO — 23/11/2026]** Los cuatro ajustes aplicados con autorización del usuario. Estado verificado con `git config --global --list`:

```
core.editor="C:\Users\Owen\AppData\Local\Programs\Microsoft VS Code\bin\code" --wait
core.autocrlf=false
core.longpaths=true
init.defaultbranch=main
pull.rebase=false
```

**Rutas largas en Windows:** `LongPathsEnabled = 0` en el registro, es decir, el límite de 260 caracteres sigue activo en el sistema. Cambiarlo requiere privilegios de administrador y reinicio. **No se considera necesario:** la ruta del proyecto ocupa 61 caracteres, deja margen de sobra, y `core.longpaths` resuelve el caso de Git. Queda documentado por si apareciese el problema.

---

## 4.bis. Tareas heredadas para la Fase 1 (requisito del usuario)

El usuario aprobó `core.autocrlf false` y añadió una condición que **debe cumplirse en la Fase 1**: los finales de línea no pueden depender de la configuración global de Git de cada máquina, sino quedar fijados dentro del propio repositorio. Es un criterio más robusto que el planteado inicialmente, porque sobrevive a un cambio de equipo o a un clonado por parte del tribunal evaluador.

| # | Tarea | Archivo | Momento |
|---|---|---|---|
| F1-a | `* text=auto eol=lf` (más las declaraciones `binary` de imágenes y PDF) | `.gitattributes` en la raíz | **Antes del primer commit**, junto al `.gitignore` |
| F1-b | `"endOfLine": "lf"` | configuración de Prettier | Al configurar Prettier |
| F1-c | `"files.eol": "\n"` | `.vscode/settings.json` (versionado) | Al configurar VS Code |

Con los tres, el repositorio guarda siempre LF, Prettier escribe siempre LF y VS Code crea los archivos nuevos con LF, con independencia de lo que tenga configurado Git en la máquina. Hay que registrarlo también en `CLAUDE.md` cuando se cree en la Fase 1.

---

## 5. Riesgos y dependencias identificados

| ID | Riesgo | Impacto | Cuándo | Mitigación |
|---|---|---|---|---|
| R1 | ~~Política `Restricted` de PowerShell bloquea `npm`, `npx` y Husky~~ | Alto — impide trabajar | Fase 1, primer `npm install` | **CERRADO 23/11/2026.** `RemoteSigned` aplicado y verificado ejecutando `npm.ps1` sin `Bypass` |
| R2 | ~~El correo del `user.email` queda **público y permanente** en el historial de commits~~ | Medio — privacidad | Antes del primer commit | **CERRADO 23/11/2026.** `user.email` apunta al correo `@users.noreply.github.com` y la privacidad del correo está activada en GitHub |
| R3 | Secretos en un repositorio público | Alto — irreversible: lo publicado queda en el historial y en los *forks* aunque se borre | Todas las fases | `.gitignore` creado **antes** del primer commit; revisión antes de cada commit (apartado 5 del prompt maestro) |
| R4 | Finales de línea CRLF/LF: cada archivo aparece como modificado íntegramente | Medio — ruido que hace ilegible el historial, mala impresión en el TFM | Fase 1 | Parcial: `core.autocrlf false` aplicado. Pendientes las tareas **F1-a/b/c** del apartado 4.bis, que fijan LF en el repositorio y no en la máquina |
| R5 | Activación futura de la copia de seguridad del Escritorio en OneDrive | Alto — corrompe `node_modules`, bloquea archivos | En cualquier momento | No activarla. Si llegara a activarse, mover el proyecto a `C:\dev\` |
| R6 | La ruta contiene un espacio (`Proyecto Final`) | Bajo | Todas las fases | Node, npm, Vite y Git lo gestionan bien. Entrecomillar siempre las rutas en la terminal (`cd "..."`). No se propone mover nada. |
| R7 | Descarga de los navegadores de Playwright (~400 MB) | Bajo | Fase 8 | Espacio y conectividad verificados y suficientes |
| R8 | **Fecha de entrega: 30/11/2026**, con un plan de 11 fases | **Crítico — es el principal riesgo del proyecto** | Desde ya | Despliegue adelantado tras la Fase 1, plan de recorte por orden de prioridad y aviso proactivo sobre slides y vídeo. Ver el apartado 9 |

---

## 6. Cuentas necesarias

| Cuenta | ¿Obligatoria? | Cuándo crearla | Para qué |
|---|---|---|---|
| **GitHub** | Sí (requisito del máster) | **Hecho (Fase 0)** — usuario `Owencl9` | Repositorio público, GitHub Actions, Dependabot |
| **Vercel** | Sí (el despliegue es un requisito de entrega) | **Justo después de la Fase 1** (decisión del usuario, apartado 9.2) | Despliegue de la aplicación. Se crea entrando con la cuenta de GitHub, sin tarjeta de crédito |
| Cuenta de proveedor de IA | **No** | ~~Extra opcional 4.7~~ | **Descartado** por decisión del usuario (apartado 9.6). No se necesita ninguna cuenta más |

Ambas cuentas son gratuitas y suficientes en su plan libre para este proyecto.

---

## 7. Decisión sobre la carpeta de trabajo

Se confirma como raíz del proyecto:

```
C:\Users\Owen\Desktop\Proyecto Final\configurador-presupuestos
```

- Fuera de OneDrive.
- Contiene ya `docs/` con `prompt-maestro.md` y el documento oficial de requisitos del máster en PDF. **Este último no se versiona:** es material interno del máster, no es obra del autor y contiene datos de contacto de terceros. Está excluido en el `.gitignore` desde la Fase 1 y sus requisitos quedan resumidos en `docs/prompts/fase-00.md`.
- Aquí se ejecutará `git init` y aquí vivirá `package.json` en la Fase 1.
- No se propone cambiar de ubicación.

---

## 8. Estado de la Fase 0

- [x] Verificado Windows, PowerShell y la política de ejecución
- [x] Verificado Node.js y npm
- [x] Verificado Git y su configuración global
- [x] Verificado VS Code y sus extensiones
- [x] Confirmado que la carpeta de trabajo no está en OneDrive
- [x] Inventario de lo instalado y lo pendiente
- [x] Riesgos y cuentas identificados
- [x] Política de PowerShell ajustada a `RemoteSigned` y verificada
- [x] Extensiones de VS Code instaladas (4) y verificadas
- [x] Ajustes de Git para Windows aplicados (`init.defaultBranch`, `core.autocrlf`, `core.longpaths`, `pull.rebase`)
- [x] Cuenta de GitHub creada (`Owencl9`), con privacidad del correo y verificación en dos pasos
- [x] Identidad de Git configurada y validada con un commit real

## ✅ FASE 0 CERRADA — 23/11/2026

El entorno está listo para programar. Riesgos cerrados: **R1** (política de PowerShell) y **R2** (correo público). Riesgos abiertos y vigilados: **R3** (secretos), **R4** (finales de línea, parcial), **R5** (OneDrive), **R6** (espacio en la ruta), **R7** (Playwright) y **R8** (plazo, crítico).

Decisiones de gestión del plazo tomadas y documentadas en el apartado 9.

**Siguiente paso:** a la espera de la autorización del usuario para comenzar la Fase 1. Esa fase debe incluir las tareas F1-a/b/c del apartado 4.bis (finales de línea en LF) y el `.gitignore` **antes del primer commit**. El despliegue en Vercel vendrá inmediatamente después, según el apartado 9.2.

---

## 9. Gestión del plazo y plan de recorte (riesgo R8)

**Fecha de entrega confirmada por el usuario: 30/11/2026.** Hoy es 23/11/2026.

**Decisiones del usuario (23/11/2026). Sustituyen a la propuesta inicial de calendario por días, que queda descartada.**

### 9.1. Sin calendario por días: se trabaja fase a fase

No se asigna una fecha a cada fase. El usuario puede avanzar varias fases en un mismo día y marca él el ritmo: **no se pasa a la fase siguiente sin que lo indique expresamente**, conforme al apartado 8 del prompt maestro.

Queda descartada la tabla de calendario día a día que se había propuesto: presuponía un ritmo de trabajo que no corresponde fijar al asistente.

### 9.2. Despliegue en Vercel adelantado

El despliegue se adelanta a **justo después de tener la Fase 1 funcionando**, en lugar de esperar a la Fase 10.

Motivo: detectar los problemas de publicación cuanto antes. Vercel se conecta al repositorio de GitHub y redespliega en cada push, así que adelantarlo no cuesta tiempo —lo ahorra— y cada push queda verificado en producción desde el principio.

La Fase 10 conserva el resto de su contenido: revisión de secretos, `npm audit`, Dependabot, cabeceras de seguridad y verificación en producción.

### 9.3. Obligación de aviso sobre slides y vídeo

Las slides y el vídeo con grabación de pantalla son **entregables obligatorios** del documento oficial del TFM, y no son código: requieren tiempo del usuario que no se comprime con ayuda de la IA.

**Encargo expreso del usuario al asistente:** avisar en cuanto el ritmo ponga en riesgo disponer de tiempo suficiente para prepararlos. El aviso debe ser proactivo, no esperar a que el usuario pregunte.

Procedimiento: al cerrar cada fase, se compara el estado real con lo que falta y, si el margen para slides y vídeo se estrecha, se avisa en el propio resumen de la fase y se propone activar el plan de recorte del apartado 9.4.

### 9.4. Plan de recorte, por orden de aplicación

Si el plazo aprieta, se recorta **en este orden** y nunca por iniciativa propia del asistente: cada recorte se propone y se espera la autorización del usuario.

| Orden | Qué se recorta | Fase afectada |
|---|---|---|
| 1.º | **Husky** (comprobaciones automáticas antes de commit y push) | 9 |
| 2.º | **Tests E2E extra**: se mantiene únicamente el recorrido principal | 8 |
| 3.º | **GitHub Actions avanzado**: se simplifica el flujo de integración continua | 9 |
| 4.º | **Borradores en localStorage** (apartado 4.6) | 5 |

### 9.5. Intocable: no se recorta en ningún caso

| Elemento | Motivo |
|---|---|
| **Cálculo correcto del presupuesto**, con descuentos e IGIC | Es el núcleo funcional del proyecto |
| **Tests de la lógica de negocio** (TDD) | Es el núcleo metodológico y lo que distingue al proyecto |
| **Despliegue en funcionamiento** | Entregable obligatorio del máster |
| **README completo** | Entregable obligatorio del máster |
| **Slides de presentación** | Entregable obligatorio del máster |
| **Vídeo con grabación de pantalla** | Entregable obligatorio del máster |

### 9.6. Extra opcional 4.7: descartado

El párrafo de introducción redactado por IA (apartado 4.7 del prompt maestro) **queda descartado** por decisión del usuario. No se implementará ni se volverá a proponer.

Implicaba además una función de servidor en Vercel y la gestión de una clave de API, es decir, superficie de riesgo añadida justo donde el apartado 5 exige más cuidado.

### 9.7. Alcance funcional

Se mantiene íntegro el alcance de los apartados **4.1 a 4.5** del prompt maestro. El 4.6 (borradores) solo se retiraría si se llegase al cuarto nivel del plan de recorte.
