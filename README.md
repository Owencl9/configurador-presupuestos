# Configurador de Presupuestos

Aplicación web para configurar el presupuesto de los servicios de una agencia de
desarrollo web y marketing digital. Se seleccionan los servicios y se obtiene el
importe calculado automáticamente, con descuentos, IGIC, desglose por tipo de
pago y opción de imprimirlo o guardarlo en PDF.

Trabajo Final de Máster — Máster en Desarrollo con Inteligencia Artificial
(BIG School). Desarrollado con asistencia de IA y documentado fase a fase.

**🔗 Aplicación en funcionamiento: https://configurador-presupuestos.vercel.app**

> **Estado: en desarrollo (Fase 7 de 11 completada).** La aplicación ya está
> desplegada y se actualiza automáticamente con cada `push`. **El recorrido
> completo funciona**: se añaden servicios del catálogo, se eligen la cantidad y
> los meses respetando los mínimos de cada servicio, y el resumen se actualiza al
> instante con el pago inicial, la cuota mensual y el pago anual, cada uno con
> sus descuentos —**explicando el motivo de cada uno**—, su base imponible, su
> IGIC al 7 % y su total. **El presupuesto en curso se guarda en el navegador** y
> sigue ahí al volver. Con el presupuesto hecho se escriben los datos del
> cliente y se obtiene **el documento final, con su número y su validez, listo
> para imprimir o guardar en PDF** desde el propio navegador.
>
> La aplicación está **funcionalmente completa**, y además **probada y
> vigilada**: 560 tests de Vitest, 5 recorridos de Playwright en un navegador
> real, reglas automáticas de accesibilidad en el lint, un gancho de pre-commit
> y un workflow de integración continua que repite las seis comprobaciones en
> cada push. Lo que queda es la entrega: repositorio público y documentación
> final.

> ### ⚠️ Los precios son ficticios
>
> Todos los importes, mínimos de contratación y descripciones de servicios de
> este repositorio son **inventados**. Están elegidos para que el catálogo
> resulte verosímil y para poder probar las reglas de negocio, pero **no son las
> tarifas reales de ninguna agencia** y no sirven como referencia de precios ni
> como oferta comercial. El repositorio es público y las tarifas reales del autor
> no se publican. El aviso está también en la cabecera de
> [`src/shared/data/services.ts`](src/shared/data/services.ts).
>
> Lo mismo vale para **los datos de la agencia que emite el presupuesto** —el
> nombre, el NIF, la dirección y el contacto que aparecen en el documento—:
> están inventados y son claramente de ejemplo, con dominios bajo `.example`,
> que la [RFC 2606](https://www.rfc-editor.org/rfc/rfc2606) reserva precisamente
> para esto. Viven en un único archivo,
> [`src/shared/constants/agency.ts`](src/shared/constants/agency.ts), y el
> documento impreso lo dice en su pie.

## Stack tecnológico

| Área                                 | Herramienta                |
| ------------------------------------ | -------------------------- |
| Interfaz                             | React 19 + TypeScript 6    |
| Empaquetado y servidor de desarrollo | Vite 8                     |
| Estilos                              | Tailwind CSS 4             |
| Tests unitarios y de integración     | Vitest 5 + Testing Library |
| Tests E2E                            | Playwright 1.65 (Chromium) |
| Calidad de código                    | ESLint 10 + Prettier 3     |
| Accesibilidad automática             | eslint-plugin-jsx-a11y 6   |
| Comprobaciones antes del commit      | Husky 9                    |
| Integración continua                 | GitHub Actions             |
| Despliegue                           | Vercel (plan Hobby)        |

No hay backend, ni base de datos, ni autenticación: todo el cálculo ocurre en el
navegador. Los borradores se guardan en `localStorage`.

## Requisitos

- Node.js 20.19+ o 22.12+ (desarrollado con Node 24.20)
- npm 10+

## Instalación y ejecución

```bash
git clone https://github.com/Owencl9/configurador-presupuestos.git
cd configurador-presupuestos
npm install
npm run dev
```

El servidor de desarrollo queda en http://localhost:5173.

### Comandos disponibles

| Comando                   | Qué hace                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | servidor de desarrollo con recarga en caliente                   |
| `npm run build`           | comprueba los tipos y genera la versión de producción en `dist/` |
| `npm run preview`         | sirve en local lo generado por `build`                           |
| `npm test`                | ejecuta los tests una vez                                        |
| `npm run test:watch`      | ejecuta los tests y se queda vigilando los cambios               |
| `npm run coverage`        | informe de cobertura de tests                                    |
| `npm run test:e2e`        | ejecuta los tests de extremo a extremo en un navegador real      |
| `npm run test:e2e:ui`     | los mismos, en el modo interactivo de Playwright                 |
| `npm run test:e2e:report` | abre el informe del último lanzamiento de los E2E                |
| `npm run lint`            | análisis estático con ESLint                                     |
| `npm run format`          | formatea el código con Prettier                                  |
| `npm run format:check`    | comprueba el formato sin modificar archivos                      |

`npm test` y `npm run test:e2e` son **dos suites distintas** y no se solapan:
Vitest solo recoge `src/**/*.test.{ts,tsx}` y Playwright solo recoge
`e2e/**/*.spec.ts`. Ni las carpetas ni los patrones de archivo coinciden.

### Los tests de extremo a extremo

Hacen falta **los navegadores de Playwright**, que no vienen con `npm install`
porque no son un paquete de npm. Se descargan una sola vez, y solo Chromium:

```bash
npx playwright install chromium
```

Son unos 330 MB de descarga y unos 740 MB en disco, y **no se guardan en el
proyecto**: van a la caché de Playwright del usuario
(`%LOCALAPPDATA%\ms-playwright` en Windows, `~/.cache/ms-playwright` en Linux).
No hace falta ningún permiso de administrador.

Después, los tres comandos:

```bash
npm run test:e2e           # los cinco recorridos, sin ventana, en unos 10 s
npm run test:e2e:ui        # modo interactivo: la película de cada test, paso a paso
npm run test:e2e:report    # el informe del último lanzamiento
```

Y para **verlos ejecutarse en un navegador con ventana**, que es la forma más
clara de entender qué hacen:

```bash
npx playwright test --headed                     # los cinco
npx playwright test keyboard.spec.ts --headed    # solo el recorrido con teclado
```

**Se ejecutan contra el build local, nunca contra la web publicada.** Playwright
lanza él mismo `npm run build && npm run preview` en
http://localhost:4173, espera a que responda, pasa los tests y apaga el
servidor. El puerto está fijado con `strictPort`, así que si está ocupado el
lanzamiento falla con un mensaje claro en lugar de probar contra otra cosa.

Los cinco recorridos están en [`e2e/`](e2e/), con sus Page Objects:

| Archivo                     | Qué recorre                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `full-budget.spec.ts`       | Catálogo → permanencia de 12 meses → desglose completo → documento, comprobando que las cifras son las mismas      |
| `draft-persistence.spec.ts` | El borrador sobrevive a una recarga y los datos del cliente no, comprobado sobre el `localStorage` real            |
| `print-document.spec.ts`    | El documento con el medio de impresión emulado: los botones y la nota no se imprimen, el presupuesto sí            |
| `keyboard.spec.ts`          | Del catálogo al documento **sin tocar el ratón**, solo con el tabulador y Enter                                    |
| `client-form.spec.ts`       | La validación, el foco en el campo que falla, y que el envío **no navega ni pone los datos del cliente en la URL** |

Los informes, las capturas y las trazas que genera Playwright no se versionan:
`playwright-report/`, `test-results/` y `blob-report/` están en el
`.gitignore`. Solo se generan cuando un test falla.

## Comprobaciones automáticas

Las comprobaciones están **escalonadas**: cuanto más tarde se ejecutan, más
abarcan y más tardan. Cada escalón cubre lo que el anterior no alcanza, y solo
el último pasa las seis.

| Cuándo                   | Qué se ejecuta                                                                                   | Cuánto tarda | Dónde está configurado                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------ |
| Al guardar, en el editor | **dos**: formatea con Prettier y aplica las correcciones automáticas de ESLint                   | instantáneo  | [`.vscode/settings.json`](.vscode/settings.json)       |
| Antes de cada commit     | **tres**: `format:check`, `lint` y los tests de Vitest                                           | unos 25 s    | [`.husky/pre-commit`](.husky/pre-commit)               |
| En cada push y PR        | **las seis**: formato, lint, tipos (`tsc -b`), tests de Vitest, build y los cinco recorridos E2E | minutos      | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |

El escalón del editor **corrige** en lugar de avisar, y por eso es el más
cómodo y el menos fiable de los tres: depende de tener instaladas en VS Code
las extensiones de ESLint (`dbaeumer.vscode-eslint`) y Prettier
(`esbenp.prettier-vscode`), que están recomendadas en
[`.vscode/extensions.json`](.vscode/extensions.json) y se ofrecen solas al
abrir el proyecto. Sin ellas, el editor no hace nada y las dos redes siguientes
son las que avisan. Ese archivo configura además el final de línea en LF, el
salto de línea final, el recorte de espacios sobrantes —salvo en Markdown, donde
dos espacios al final son un salto intencionado— y que el editor use **el
TypeScript del proyecto**, para que informe exactamente de los mismos errores
que `npm run build`.

Los cinco recorridos del último escalón comprueban además, desde la Fase 10, que
**el navegador no ha bloqueado nada por la `Content-Security-Policy`**: lo
vigila [`e2e/cspGuard.ts`](e2e/cspGuard.ts), explicado en el apartado del
despliegue.

**Los tests de Playwright no están en el gancho de pre-commit**, a propósito:
necesitan compilar la aplicación, levantar un servidor y abrir un navegador, y
eso haría insoportable cada commit. Los ejecuta la integración continua.

El gancho se instala solo: el script `prepare` de `package.json` apunta
`core.hooksPath` a `.husky/` después de cada `npm install`, así que basta
clonar el repositorio e instalar.

Sobre el workflow conviene saber tres cosas, que están razonadas en los
comentarios del propio archivo:

- **Runner estándar y permisos mínimos** (`ubuntu-latest`, `contents: read`).
  No usa secretos: no hay nada que autenticar.
- **Cancela la ejecución anterior** si llegan dos pushes seguidos
  (`concurrency` con `cancel-in-progress`) y tiene `timeout-minutes`, para que
  nada se quede colgado gastando minutos.
- **Cachea las dependencias y el navegador** de Playwright, e instala solo
  Chromium. Si los recorridos fallan, sube su informe como artefacto —solo en
  ese caso— con siete días de retención.

### Accesibilidad

Las reglas de [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
entran en el `lint` y se aplican al JSX de `src/`. Su configuración recomendada
trae **34 reglas, de las que 31 están activas como error** y tres las desactiva
ella misma (`anchor-ambiguous-text`, `label-has-for` y
`control-has-associated-label`): que una imagen lleve texto alternativo, que un elemento con
`onClick` sea operable con el teclado, que una etiqueta esté asociada a su
campo. Al activarlas no apareció ni un aviso, y el motivo está en el código:
**todos los `onClick` del proyecto están sobre un `<button>`**.

Lo que esas reglas comprueban es estático, así que **no sustituyen a la revisión
a mano**: ninguna regla puede saber si un nombre accesible es _útil_. Las
decisiones de accesibilidad de este proyecto —la jerarquía de encabezados sin
saltos, las regiones con nombre, el `aria-live` en una frase corta de estado y
no en todo el resumen, el rango permitido en texto y no solo en el gris de un
botón— están tomadas a mano y probadas con Vitest por rol y nombre accesible,
no por clases de CSS.

Lo que sí se comprueba **en un navegador real** es otra cosa, y conviene no
confundirlas: el recorrido `keyboard.spec.ts` no mira los encabezados ni las
regiones activas. Comprueba que la aplicación **se puede usar de punta a punta
sin ratón**, que es justo lo que jsdom no puede responder, porque el orden de
tabulación lo decide el motor del navegador: dónde cae el foco en cada
tabulación, que Enter active el botón enfocado sin perder el foco, que
`aria-pressed` cambie, que el campo de meses anuncie el descuento en su
descripción accesible, y que los dos botones del documento sean alcanzables
—sin eso, quien no usa ratón llegaría al documento y no podría imprimirlo ni
volver atrás.

## Credenciales de prueba

**No hay. La aplicación no tiene inicio de sesión**, así que no existe ningún
usuario ni contraseña de prueba que haya que facilitar para evaluarla: se abre la
URL y está todo disponible desde el primer momento.

No es un olvido, es una decisión tomada al empezar y razonada en el
[ADR 0002](docs/adr/0002-sin-backend.md): sin backend no hay nada que
autenticar. Todo el cálculo ocurre en el navegador, no hay cuentas, no hay
usuarios y no hay ningún dato que pertenezca a una persona y haya que proteger
de otra.

Las dos cosas que la aplicación guarda —el borrador del presupuesto y el
contador de números— viven en el `localStorage` del navegador de quien la usa, y
no contienen ningún dato personal. **Los datos del cliente que se escriben para
el documento no se guardan en ninguna parte**
([ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md)).

## Estructura del proyecto

Organización por ámbito (_Scope Rule_): lo compartido en `shared/`, lo
específico de cada funcionalidad en su propia carpeta.

```
├── docs/                   Documentación del TFM
│   ├── adr/                Decisiones técnicas (Architecture Decision Records)
│   └── prompts/            Registro de prompts por fase (evidencia de desarrollo con IA)
├── e2e/                    Tests de extremo a extremo con Playwright
│   └── pages/              Page Objects: los localizadores, en un solo sitio
├── public/                 Archivos servidos tal cual
└── src/
    ├── main.tsx            Punto de entrada: monta React en el DOM
    ├── App.tsx             El proveedor del estado y la pantalla
    ├── Configurator.tsx    Reparte el estado y elige qué se ve: configurador o documento
    ├── index.css           Tailwind, tipografía base y el CSS de impresión
    ├── context/            Estado global del presupuesto (Context + useReducer)
    ├── features/           Código propio de cada funcionalidad
    │   ├── budget/           Presupuesto: cálculo, líneas, resumen, panel y borradores
    │   ├── budget-document/  Documento final: número, validez y vista imprimible
    │   ├── client-form/      Datos del cliente: validación y formulario
    │   └── service-catalog/  Catálogo: agrupación por categorías y formato del precio
    ├── shared/             Código usado por varias funcionalidades
    │   ├── components/     Componentes reutilizables (ServiceCard, QuantitySelector)
    │   ├── constants/      Reglas de negocio y sus valores (IGIC, descuentos, límites) y los datos ficticios de la agencia
    │   ├── data/           Catálogo de servicios (archivo de datos editable)
    │   ├── strategies/     Una regla de descuento por archivo, y el calculador que las combina
    │   ├── types/          Tipos de TypeScript del dominio
    │   └── utils/          Utilidades compartidas (importes, fechas, porcentajes, normalización, localStorage)
    └── test/               Configuración común de los tests
```

Los tests unitarios y de integración viven **junto al código que prueban**:
`ServiceCard.tsx` y `ServiceCard.test.tsx` están en la misma carpeta. Los de
extremo a extremo son la excepción, y por un motivo: no prueban un archivo, sino
la aplicación entera desde fuera, así que viven aparte en `e2e/`.

### El catálogo de servicios

Los doce servicios están en
[`src/shared/data/services.ts`](src/shared/data/services.ts), agrupados en cuatro
categorías: Diseño web, Marketing, Mantenimiento e Infraestructura. **Para
añadir, quitar o editar un servicio basta con tocar ese archivo**: la lógica no
conoce ningún servicio concreto, los precios se declaran en céntimos y once
tests de integridad avisan si la edición deja el catálogo incoherente
(identificadores repetidos, precios con decimales, categorías vacías…).

Los niveles de un mismo servicio —SEO Básico y Profesional, Mantenimiento Básico
y Premium— son servicios independientes del catálogo, sin reglas de precio
propias. Ver
[ADR 0006](docs/adr/0006-niveles-como-servicios-independientes.md).

### Las reglas de negocio

Los valores viven en un **único archivo**,
[`src/shared/constants/business-rules.ts`](src/shared/constants/business-rules.ts):
el tipo de IGIC, los tres descuentos, el tope del 20 % y los límites de los
selectores (cantidad de 1 a 99 y hasta 36 meses de contratación). Cambiar el
IGIC es cambiar un número en ese archivo, y no hay ningún otro sitio que haya
que tocar.

Ese archivo tiene además **tests de coherencia**, porque está hecho para
editarse a mano y una edición incoherente no da ningún error visible. Vigilan,
por ejemplo, que ningún descuento individual supere el tope del 20 % y que el
máximo de meses esté por encima de los 12 que activan el descuento por
permanencia: un tope menor dejaría ese descuento inalcanzable sin que nada
avisara.

El orden de cálculo es **subtotal → descuentos → base imponible → IGIC →
total**, y se aplica por separado a cada forma de pago. El presupuesto no tiene
un total único: tiene tres, porque un pago inicial, una cuota mensual y una
cuota anual se pagan en momentos distintos y sumarlos daría un importe que el
cliente no paga nunca.

Los **tres descuentos** son una regla por archivo, con el patrón Strategy
([ADR 0004](docs/adr/0004-strategy-para-descuentos.md)): pack del 5 % con tres
servicios distintos, permanencia del 10 % sobre las líneas mensuales de doce
meses o más, e importe del 5 % cuando el pago inicial supera los 3.000 €.
Añadir una regla es añadir un archivo y registrarlo, sin tocar las demás.

Los de un mismo bloque **se suman y no se encadenan**, los umbrales se evalúan
sobre el subtotal **antes** de descontar nada, y el tope del 20 % se aplica a
cada bloque al final —truncado, no redondeado, porque un tope que se puede
superar no es un tope—. Cada descuento llega al resumen **con su motivo**, que
construye la propia regla a partir de las constantes: cambiar un porcentaje
cambia el cálculo y el texto de la pantalla a la vez. Razonado en el
[ADR 0010](docs/adr/0010-como-se-aplican-los-descuentos.md).

Lo que el presupuesto **no** muestra es el compromiso total de los servicios
mensuales (meses × cuota): sería una cuarta cifra confundible con un total, y
encima parcial ([ADR 0011](docs/adr/0011-sin-compromiso-total.md)).

Todo el dinero se calcula con **enteros en céntimos**
([ADR 0003](docs/adr/0003-dinero-en-centimos.md)) y solo se convierte a euros al
mostrarlo. El IGIC se redondea al céntimo más cercano, una sola vez por bloque
de pago y después de los descuentos
([ADR 0007](docs/adr/0007-redondeo-del-igic.md)).

### El borrador guardado en el navegador

El presupuesto en curso se guarda en `localStorage` y se recupera al volver, sin
servidor y sin cuentas de usuario. **Lo guardado es deliberadamente mínimo:** el
identificador de cada servicio, la cantidad y los meses. Ni precios, ni nombres,
ni importes, ni ningún dato personal.

```json
{ "lines": [{ "serviceId": "seo-basic", "quantity": 1, "months": 12 }] }
```

Al recuperarlo, cada identificador se busca en el catálogo y de ahí salen el
precio, el nombre y la forma de pago. La consecuencia práctica es que **editar
el almacenamiento del navegador no puede cambiar un importe**: como mucho puede
cambiar qué servicios figuran, que es lo mismo que se puede hacer pulsando
botones.

Todo lo que se lee se trata como no fiable y se valida: un JSON roto o un
formato desconocido se descartan, una línea de un servicio que ya no existe en
el catálogo se descarta sola y los números fuera de rango se corrigen. Si el
navegador no permite guardar —cookies bloqueadas, cuota agotada— la aplicación
funciona igual, simplemente sin borradores. Razonado en el
[ADR 0009](docs/adr/0009-borradores-en-localstorage.md).

### El documento del presupuesto

Con el presupuesto hecho se escriben los datos del cliente —**solo el nombre es
obligatorio**; la empresa y el correo son opcionales— y se obtiene el documento
final, que **sustituye en pantalla al configurador** en lugar de abrirse debajo.

Eso último no es maquetación: es lo que garantiza que el catálogo y los
selectores **no puedan salir impresos**. No están ocultos, no están en la
página. El CSS de impresión solo tiene que esconder los dos botones del propio
documento, y hay un test que comprueba que llevan la clase que los oculta.

Se imprime o se guarda en PDF con **la impresión del navegador** (`Ctrl+P`), sin
ninguna librería de PDF. Para que el PDF salga limpio conviene desactivar
«Encabezados y pies de página» en el diálogo de impresión: la URL, la fecha y el
número de página los añade el navegador alrededor de la página, y no hay CSS que
pueda quitarlos.

El documento lleva:

| Dato                           | Detalle                                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Los datos de la agencia        | Ficticios, en un único archivo de constantes                                                                                      |
| **El número**, `PRE-2026-0001` | Formato `PRE-AAAA-NNNN`, serie anual, repartido una sola vez por presupuesto ([ADR 0012](docs/adr/0012-numero-de-presupuesto.md)) |
| Las dos fechas                 | La de emisión y la de validez, **30 días** después, las dos a la vista                                                            |
| El cliente                     | Lo escrito en el formulario, sin filas vacías si se dejan en blanco los campos opcionales                                         |
| Los servicios                  | En modo lectura: ni un botón ni un campo                                                                                          |
| Los tres bloques de pago       | **El mismo componente que la pantalla**, con el mismo presupuesto, para que lo impreso no pueda discrepar de lo que se vio        |
| La línea del primer día        | Con su etiqueta y la frase que dice qué incluye pegada debajo ([ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md))       |
| El pie                         | «Documento de ejemplo. Los importes y los datos de la agencia son ficticios.»                                                     |

Lo que **no** lleva: ningún total general
([ADR 0007](docs/adr/0007-redondeo-del-igic.md)) y ningún compromiso total
([ADR 0011](docs/adr/0011-sin-compromiso-total.md)). Las dos ausencias tienen
tests que las vigilan, porque una hoja con huecos invita a rellenarlos.

> **La numeración es de cada navegador.** El contador vive en `localStorage`,
> así que no hay una serie única: dos personas distintas pueden recibir las dos
> un `PRE-2026-0001`, y la misma persona en otro equipo vuelve a empezar por el 0001. Es la consecuencia de no tener servidor
> ([ADR 0002](docs/adr/0002-sin-backend.md)) y está aceptada a propósito, con el
> aviso en pantalla junto al número. En el documento impreso no aparece: un
> cliente no tiene por qué leer que su número puede estar repetido.

**Los datos del cliente no se guardan en ninguna parte**: ni en `localStorage`,
ni en una cookie, ni se envían a ningún servidor. Viven en la memoria de la
página mientras está abierta, así que al recargar hay que escribirlos otra vez, y
la pantalla lo avisa. Lo que sostiene esa promesa no es una intención: el efecto
que guarda el borrador serializa el estado del reducer, y esos datos viven
fuera de él. Razonado en el
[ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md), con dos tests que
lo comprueban sobre el contenido real del navegador.

## Funcionalidades

- ✅ Catálogo de servicios agrupados por categoría, con pago único, mensual o anual
- ✅ Cálculo del presupuesto: subtotales por forma de pago, base imponible e IGIC
- ✅ Construcción del presupuesto: añadir y quitar servicios, elegir la cantidad y
  los meses respetando el mínimo de cada servicio
- ✅ Desglose en pantalla del pago inicial, la cuota mensual y el pago anual, cada
  uno con su base imponible, su IGIC y su total
- ✅ Línea informativa de lo que se paga el primer día
  ([ADR 0008](docs/adr/0008-el-primer-pago-es-presentacion.md))
- ✅ Borrador guardado en el navegador, validado al recuperarlo, y botón para
  empezar de nuevo con confirmación
  ([ADR 0009](docs/adr/0009-borradores-en-localstorage.md))
- ✅ Descuentos por pack, permanencia e importe, con tope del 20 % por bloque,
  **cada uno con su motivo explicado en el resumen**, y una pista bajo el
  selector de meses que dice qué se gana contratando doce
  ([ADR 0010](docs/adr/0010-como-se-aplican-los-descuentos.md))
- ✅ Formulario con los datos del cliente, con validación, mensajes en español
  asociados a su campo y el foco en el primero que falla. **Esos datos no se
  guardan en ninguna parte**
  ([ADR 0013](docs/adr/0013-datos-del-cliente-no-se-guardan.md))
- ✅ Número de presupuesto `PRE-AAAA-NNNN` con serie anual
  ([ADR 0012](docs/adr/0012-numero-de-presupuesto.md)) y validez de 30 días,
  mostrando la fecha de emisión y la de caducidad
- ✅ Documento final con aspecto de presupuesto, que **sustituye en pantalla al
  configurador**, y CSS de impresión para imprimirlo o guardarlo en PDF desde el
  navegador, sin librerías de PDF
- ✅ Cinco recorridos de extremo a extremo en un navegador real, contra el build
  local, incluida la **vista de impresión emulada** y el recorrido completo **solo
  con el teclado**
- ✅ Reglas automáticas de accesibilidad en el lint, gancho de pre-commit e
  integración continua en cada push y pull request
- ✅ `Content-Security-Policy` estricta, vigilada por los tests E2E, y
  Dependabot para las dependencias y para las acciones del workflow

### Previstas

- Slides y vídeo de demostración (Fase 11)

## Despliegue

La aplicación está desplegada en **Vercel** (plan Hobby, gratuito) y conectada
al repositorio: cada `push` a `main` genera un despliegue nuevo
automáticamente. No hace falta configurar nada más, porque Vercel detecta Vite y
sirve el contenido de `dist/`.

El proyecto **no usa ninguna variable de entorno**, de modo que no hay secretos
que gestionar en el despliegue ([ADR 0002](docs/adr/0002-sin-backend.md)).

`vercel.json` añade cinco cabeceras de seguridad a todas las respuestas:

| Cabecera                                           | Para qué                                                    |
| -------------------------------------------------- | ----------------------------------------------------------- |
| `Content-Security-Policy`                          | de dónde puede cargar cada cosa la página: solo de sí misma |
| `X-Content-Type-Options: nosniff`                  | el navegador no adivina el tipo de archivo                  |
| `Referrer-Policy: strict-origin-when-cross-origin` | no se filtra la URL completa al salir del sitio             |
| `X-Frame-Options: DENY`                            | la página no puede incrustarse en un iframe ajeno           |
| `Permissions-Policy`                               | cámara, micrófono y geolocalización desactivados            |

HTTPS y `Strict-Transport-Security` los sirve Vercel por defecto.

### La Content-Security-Policy

```
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self';
object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Se puede ser así de estricto porque **la aplicación no carga nada de fuera**: no
hay fuentes web, ni imágenes externas, ni analítica, ni una sola petición de red
después de la carga. `default-src 'none'` prohíbe todo por defecto y las demás
directivas son las excepciones, las cuatro limitadas al propio origen. **No hay
`unsafe-inline` ni `unsafe-eval`**, que es donde una CSP se queda normalmente a
medias: sin ellos, un script o un estilo inyectado en el HTML no se ejecuta
aunque llegue a la página.

Dos detalles con su motivo: `frame-ancestors 'none'` hace lo mismo que
`X-Frame-Options`, y **las dos se quedan** porque no todos los navegadores
entienden la primera; y `form-action 'none'` se puede poner porque el formulario
del cliente no navega nunca —su envío se resuelve en el navegador— lo cual
también lo comprueba un recorrido E2E.

`vercel.json` es JSON validado contra un esquema, así que **no admite
comentarios**: el razonamiento de cada directiva está en
[`docs/prompts/fase-10.md`](docs/prompts/fase-10.md).

**Cómo se comprueba, que es la parte interesante.** Las cabeceras las sirve
Vercel, y los tests E2E no se ejecutan contra Vercel sino contra `vite preview`.
Para que los recorridos prueben la CSP de verdad y no una copia:

- **`vite.config.ts` lee `vercel.json`** y sirve esas mismas cabeceras en el
  `preview`. La CSP tiene una sola fuente, así que no puede desfasarse respecto
  a la de producción. En el servidor de desarrollo no se aplica, a propósito: el
  recambio en caliente necesita código en línea.
- **[`e2e/cspGuard.ts`](e2e/cspGuard.ts) pone cualquier recorrido en rojo** si
  el navegador registra una violación, por dos vías a la vez: el evento
  `securitypolicyviolation` y los mensajes de la consola. Hace falta porque una
  CSP mal escrita no rompe la página de forma visible: si bloqueara la hoja de
  estilos, la aplicación se serviría **sin un solo estilo** y los cinco
  recorridos seguirían en verde, porque buscan textos, roles y foco. Se
  comprobó quitando `style-src` a propósito: **los 5 se pusieron en rojo, y solo
  por el guardián**.

### Dependabot

[`.github/dependabot.yml`](.github/dependabot.yml) vigila **dos ecosistemas**:
`npm` y `github-actions`. El segundo no es opcional: las acciones del workflow
están fijadas por versión mayor y no aparecen en ningún `package.json`, así que
sin él nadie las actualizaría nunca.

Revisión **mensual**, con los menores y parches **agrupados en un solo pull
request** por ecosistema y las versiones **mayores por separado**, porque una
mayor puede cambiar el comportamiento de una herramienta y merece que alguien la
lea. Las alertas de seguridad son otra cosa y no dependen de ese calendario.

## Metodología

- **TDD** en toda la lógica de negocio: primero el test, se comprueba que falla,
  después la implementación mínima y por último la refactorización. **560 tests
  de Vitest y 5 recorridos de Playwright en verde** al cerrar la Fase 8.
- **Una comprobación en verde no cuenta hasta que se demuestra que puede ponerse
  en rojo.** Las búsquedas de seguridad llevan un control positivo —buscar algo
  que se sabe que existe— y los tests que pasan a la primera se verifican
  cambiando la regla que dicen comprobar, para ver si fallan. En la Fase 6 se
  hizo con los tests de integración de los descuentos: subiendo el mínimo de
  permanencia a 13 meses, 4 de los 5 se pusieron en rojo. En la Fase 8, con los
  recorridos E2E: afirmando un céntimo de más en un total, tres de los cinco se
  pusieron en rojo informando de la cifra real leída del navegador.
- **Las dos suites prueban cosas distintas, y a propósito.** Vitest prueba
  funciones y componentes en un navegador simulado; Playwright prueba lo que
  solo existe en un navegador de verdad: el CSS de impresión, el
  `localStorage` entre recargas, el orden real del tabulador y que el formulario
  no navegue. Un recorrido E2E no repite lo que ya prueba un test unitario.
- **Los datos que no son de fiar se validan en la frontera**: lo que llega de
  `localStorage` pasa por una función pura que lo comprueba antes de que ningún
  componente lo vea. Las funciones que tocan el navegador no pueden lanzar.
- **Accesibilidad** desde el primer componente: todo operable con teclado,
  encabezados sin saltos, regiones con nombre, y ninguna información
  transmitida solo con el color. Los tests consultan por rol y por nombre
  accesible, no por clases de CSS.
- **Dinero en céntimos**: todos los cálculos internos usan enteros, para evitar
  los errores de redondeo de los decimales. Ver
  [ADR 0003](docs/adr/0003-dinero-en-centimos.md).
- **Decisiones documentadas** en [docs/adr/](docs/adr/).
- **Registro de prompts** en [docs/prompts/](docs/prompts/), como evidencia del
  desarrollo asistido por IA.

## Documentación

- [Especificación del proyecto](docs/prompt-maestro.md)
- [Decisiones previas al desarrollo](docs/decisiones-previas.md)
- [Inventario del entorno (Fase 0)](docs/fase-00-inventario-entorno.md)
- [Publicación del repositorio y ajustes de seguridad de GitHub (Fase 10)](docs/fase-10-publicacion-github.md)
- [Estado del desarrollo](PROGRESO.md)
- [Normas del proyecto](CLAUDE.md)
