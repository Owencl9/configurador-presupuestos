# Fase 10 — Publicar el repositorio en GitHub: lo que hace el usuario a mano

**Fecha:** 27/11/2026
**Quién ejecuta esto:** el usuario, en el navegador. La herramienta `gh` no está
instalada —decisión suya en la Fase 9— y **el cambio de visibilidad no se
delega**: es la acción menos reversible del proyecto.

**Sobre los nombres de los ajustes:** están consultados en la documentación de
GitHub en la fecha de arriba, no escritos de memoria. Es la lección número 3 de
la Fase 9: un dato de memoria sobre una herramienta no da un error, da una
instrucción que no se encuentra en la pantalla. Aun así, GitHub reorganiza estos
menús a menudo —el apartado de seguridad se ha llamado «Code security and
analysis», «Code security» y «Advanced Security»—, así que si un nombre no
aparece donde dice aquí, **buscar por el texto del ajuste** en lugar de por la
ruta del menú. Las referencias están al final.

---

## Bloque A — Antes de cambiar la visibilidad

| #   | Qué                                                                                                                                                                                                                                                        | Dónde                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| A0  | **Ajuste de la cuenta, no del repositorio** (y por eso va primero: protege también a cualquier otro proyecto). Confirmar **«Keep my email addresses private»** y activar **«Block command line pushes that expose my email»**. El segundo no es decorativo: en cada `push`, GitHub mira la dirección del autor del último commit y **rechaza el push** si es una de las direcciones privadas de la cuenta. Es decir, es la red que habría parado un commit firmado con el correo personal en lugar de con la dirección `noreply` —exactamente lo que el apartado 5 de `CLAUDE.md` lleva nueve fases pidiendo a mano— | **Settings** de la cuenta (no del repositorio) **→ Emails**, en el apartado «Access» del menú lateral |
| A1  | Que el commit de la Fase 10 esté **subido** y su check de CI **en verde**. Importa más que de costumbre: al hacer público el repositorio, **el historial y los registros de Actions se vuelven visibles para todo el mundo**                                 | Pestaña **Actions**                                                        |
| A2  | Comprobar que **no hay ningún secreto ni variable de Actions definidos**. El workflow no usa ninguno —comprobado en la revisión de secretos—, pero un secreto definido y sin usar seguiría estando ahí, y lo que se revisa es lo que hay, no lo que se recuerda | **Settings → Secrets and variables → Actions**, las dos pestañas vacías    |
| A3  | **Workflow permissions**: dejar el ajuste restringido (solo lectura de «contents» y «packages») y la casilla **«Allow GitHub Actions to create and approve pull requests» sin marcar**. En cuentas personales viene desactivada por defecto; esto es confirmar el techo del repositorio, porque el `permissions: contents: read` del workflow solo se aplica a sí mismo | **Settings → Actions → General**                                           |
| A4  | **Aprobación de los workflows de los forks**: elegir **«Require approval for all external contributors»**. Por defecto GitHub solo exige aprobación a quien colabora por primera vez; con el repositorio público, cualquiera puede abrir un pull request desde un fork, y este ajuste es lo que impide que su código se ejecute en el runner sin que nadie lo mire | **Settings → Actions → General**, apartado «Approval for running fork pull request workflows from contributors» |
| A5  | Un repaso a los **registros de las dos ejecuciones de CI** ya hechas, porque se publican tal cual. En este proyecto contienen nombres de test, tamaños del build y el resumen de Vitest: nada más                                                            | Pestaña **Actions** → cada ejecución                                       |

---

## Bloque B — El cambio de visibilidad

**Settings → General →** hasta el final de la página **→ «Danger Zone» →
«Change visibility» → Public.** GitHub pide escribir el nombre del repositorio y
marcar que se entienden las consecuencias.

Lo que GitHub avisa que ocurre, y lo que significa aquí:

| Consecuencia                                                           | Qué implica en este proyecto                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| El código lo ve cualquiera y **cualquiera puede hacer un fork**         | Es el requisito del máster. De ahí el A4                                                                                              |
| **El historial y los registros de Actions se vuelven públicos**         | Los 20 commits y sus mensajes. Es lo que la revisión de secretos de esta fase ha mirado commit a commit                               |
| **Todos los _push rulesets_ quedan desactivados**                       | **Sin efecto aquí, y conviene no confundirlo con el paso C5.** Un _push ruleset_ es otra cosa: reglas sobre rutas, extensiones y tamaño de archivo, disponibles solo en repositorios privados o internos de planes de pago. Este repositorio no tiene ninguno. El ruleset de C5 es de **rama**, y el motivo de crearlo después es distinto |
| Las estrellas y los _watchers_ se borran                                | Sin efecto: un repositorio privado de un solo autor no tiene                                                                          |
| La actividad se publica en el perfil                                    | Deseable: es la evidencia de desarrollo del TFM                                                                                       |

---

## Bloque C — Después de hacerlo público

| #   | Qué                                                                                                                                                                                                                                                                                 | Dónde                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C1  | **Escaneo de secretos.** En los repositorios públicos se ejecuta solo y es gratuito, así que esto no se activa: se comprueba que está en marcha. **La protección de push sí hay que activarla a mano**, porque no viene puesta ni siquiera en repositorios públicos                   | **Settings →** apartado de seguridad (**«Advanced Security»**, antes «Code security») → Secret Protection / **Push protection** → Enable |
| C2  | **Mirar el resultado del escaneo.** Si aparece una alerta, **parar y avisarme**: una alerta de escaneo de secretos sobre un repositorio recién publicado es exactamente el caso que esta fase existe para evitar, y se trata antes de seguir                                           | Pestaña **Security** → Secret scanning                                                      |
| C3  | **Grafo de dependencias, alertas de Dependabot y actualizaciones de seguridad de Dependabot.** La documentación de GitHub **se contradice** sobre si vienen activados en los repositorios públicos, así que esto no se da por hecho: se mira la página y, donde diga «Enable», se pulsa | **Settings →** apartado de seguridad                                                        |
| C4  | **Actualizaciones de versión de Dependabot.** El archivo `.github/dependabot.yml` ya está en el repositorio; aquí solo se comprueba que GitHub lo ha leído y que aparecen **los dos ecosistemas** (`npm` y `github-actions`). Si no se quiere esperar al día 1, hay un «Check for updates» | **Insights → Dependency graph → Dependabot**                                                 |
| C5  | **Ruleset de rama para `main`**, y **solo ahora, porque antes no se podía**: con GitHub Free los rulesets están disponibles **en repositorios públicos**, y en los privados hacen falta Pro, Team o Enterprise. No es que el cambio de visibilidad lo desactivara (eso es otra cosa, ver el bloque B): es que hasta ahora la opción no estaba disponible. Activar **«Restrict deletions»** y **«Block force pushes»**, y **nada más**. Sin exigir pull request: el flujo del proyecto es empujar directo a `main`, y una regla que lo impida obligaría a saltársela en cada commit | **Settings → Rules → Rulesets → New branch ruleset**, con `main` como objetivo               |
| C6  | Comprobar que **CI sigue en verde** y que las ejecuciones **ya no consumen cuota**: en los repositorios públicos Actions es gratuito. Es lo que dice el comentario actualizado de `ci.yml`                                                                                            | Pestaña **Actions**                                                                          |
| C7  | **Opcional:** activar el **informe privado de vulnerabilidades**, para que alguien que encuentre un fallo pueda avisar sin publicarlo                                                                                                                                               | **Settings →** apartado de seguridad                                                         |
| C8  | **Revisar en Vercel** si hay alguna opción sobre despliegues de **pull requests de forks**. Con el repositorio público cualquiera puede abrir uno, y conviene saber si eso provoca un despliegue de previsualización. **No lo doy por supuesto en ningún sentido: hay que mirarlo**     | Vercel → el proyecto → **Settings → Git**                                                     |

**Lo que no se configura, y por qué:** el **escaneo de código (CodeQL)** es
gratuito en repositorios públicos y sería defendible, pero **no está en la
especificación** y el apartado 7 de `CLAUDE.md` prohíbe añadir lo que no está.
Queda anotado como posible mejora, no como tarea.

---

## Referencias consultadas

- [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- [Enabling push protection for your repository](https://docs.github.com/en/code-security/secret-scanning/enabling-secret-scanning-features/enabling-push-protection-for-your-repository)
- [Managing security and analysis settings for your repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository)
- [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
  y [Troubleshooting rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules),
  que es donde está la disponibilidad por plan. Las dos páginas no son del todo
  consistentes sobre el plan Pro, así que la instrucción de C5 está escrita de
  forma que vale igual en cualquiera de las dos lecturas: **crear el ruleset
  después de publicar**
- [Blocking command line pushes that expose your personal email address](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/blocking-command-line-pushes-that-expose-your-personal-email-address)
