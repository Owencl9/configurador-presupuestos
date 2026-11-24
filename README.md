# Configurador de Presupuestos

Aplicación web para configurar el presupuesto de los servicios de una agencia de
desarrollo web y marketing digital. Se seleccionan los servicios y se obtiene el
importe calculado automáticamente, con descuentos, IGIC, desglose por tipo de
pago y opción de imprimirlo o guardarlo en PDF.

Trabajo Final de Máster — Máster en Desarrollo con Inteligencia Artificial
(BIG School). Desarrollado con asistencia de IA y documentado fase a fase.

**🔗 Aplicación en funcionamiento: https://configurador-presupuestos.vercel.app**

> **Estado: en desarrollo (Fase 3 de 11 completada).** La aplicación ya está
> desplegada y se actualiza automáticamente con cada `push`. El catálogo de
> servicios es el definitivo y **la aritmética del presupuesto ya está
> implementada y probada**: subtotales separados por forma de pago, base
> imponible e IGIC al 7 %, todo en céntimos enteros. Lo que falta es la interfaz
> que la usa (Fase 4), el estado (Fase 5) y los descuentos (Fase 6).

> ### ⚠️ Los precios son ficticios
>
> Todos los importes, mínimos de contratación y descripciones de servicios de
> este repositorio son **inventados**. Están elegidos para que el catálogo
> resulte verosímil y para poder probar las reglas de negocio, pero **no son las
> tarifas reales de ninguna agencia** y no sirven como referencia de precios ni
> como oferta comercial. El repositorio es público y las tarifas reales del autor
> no se publican. El aviso está también en la cabecera de
> [`src/shared/data/services.ts`](src/shared/data/services.ts).

## Stack tecnológico

| Área                                 | Herramienta                |
| ------------------------------------ | -------------------------- |
| Interfaz                             | React 19 + TypeScript 6    |
| Empaquetado y servidor de desarrollo | Vite 8                     |
| Estilos                              | Tailwind CSS 4             |
| Tests unitarios y de integración     | Vitest 5 + Testing Library |
| Tests E2E                            | Playwright _(Fase 8)_      |
| Calidad de código                    | ESLint 10 + Prettier 3     |
| Integración continua                 | GitHub Actions _(Fase 9)_  |
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

| Comando                | Qué hace                                                         |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | servidor de desarrollo con recarga en caliente                   |
| `npm run build`        | comprueba los tipos y genera la versión de producción en `dist/` |
| `npm run preview`      | sirve en local lo generado por `build`                           |
| `npm test`             | ejecuta los tests una vez                                        |
| `npm run test:watch`   | ejecuta los tests y se queda vigilando los cambios               |
| `npm run coverage`     | informe de cobertura de tests                                    |
| `npm run lint`         | análisis estático con ESLint                                     |
| `npm run format`       | formatea el código con Prettier                                  |
| `npm run format:check` | comprueba el formato sin modificar archivos                      |

## Estructura del proyecto

Organización por ámbito (_Scope Rule_): lo compartido en `shared/`, lo
específico de cada funcionalidad en su propia carpeta.

```
├── docs/                   Documentación del TFM
│   ├── adr/                Decisiones técnicas (Architecture Decision Records)
│   └── prompts/            Registro de prompts por fase (evidencia de desarrollo con IA)
├── public/                 Archivos servidos tal cual
└── src/
    ├── features/           Código propio de cada funcionalidad
    │   ├── budget/           Cálculo: subtotales, IGIC y orden de cálculo
    │   └── service-catalog/  Catálogo: agrupación por categorías y formato del precio
    ├── shared/             Código usado por varias funcionalidades
    │   ├── components/     Componentes reutilizables (ServiceCard)
    │   ├── constants/      Reglas de negocio y sus valores (IGIC, descuentos)
    │   ├── data/           Catálogo de servicios (archivo de datos editable)
    │   ├── types/          Tipos de TypeScript del dominio
    │   └── utils/          Utilidades compartidas (formato de importes en euros)
    └── test/               Configuración común de los tests
```

A medida que avancen las fases se añadirán más carpetas en `src/features/`
(formulario de cliente, documento final), `src/context/` (estado global) y
`e2e/` (tests de Playwright).

Los tests viven junto al código que prueban: `ServiceCard.tsx` y
`ServiceCard.test.tsx` están en la misma carpeta.

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
el tipo de IGIC, los tres descuentos y el tope del 20 %. Cambiar el IGIC es
cambiar un número en ese archivo, y no hay ningún otro sitio que haya que tocar.

El orden de cálculo es **subtotal → descuentos → base imponible → IGIC →
total**, y se aplica por separado a cada forma de pago. El presupuesto no tiene
un total único: tiene tres, porque un pago inicial, una cuota mensual y una
cuota anual se pagan en momentos distintos y sumarlos daría un importe que el
cliente no paga nunca.

Todo el dinero se calcula con **enteros en céntimos**
([ADR 0003](docs/adr/0003-dinero-en-centimos.md)) y solo se convierte a euros al
mostrarlo. El IGIC se redondea al céntimo más cercano, una sola vez por bloque
de pago y después de los descuentos
([ADR 0007](docs/adr/0007-redondeo-del-igic.md)).

## Funcionalidades

- ✅ Catálogo de servicios agrupados por categoría, con pago único, mensual o anual
- ✅ Cálculo del presupuesto: subtotales por forma de pago, base imponible e IGIC

### Previstas

- Construcción del presupuesto con cantidades y permanencias mínimas
- Descuentos por pack, permanencia e importe, con tope máximo del 20 %
- Desglose en pantalla del pago inicial, la cuota mensual y los pagos anuales
- Datos del cliente, número de presupuesto y validez
- Vista imprimible del presupuesto, para guardar como PDF desde el navegador
- Borradores guardados en el navegador

## Despliegue

La aplicación está desplegada en **Vercel** (plan Hobby, gratuito) y conectada
al repositorio: cada `push` a `main` genera un despliegue nuevo
automáticamente. No hace falta configurar nada más, porque Vercel detecta Vite y
sirve el contenido de `dist/`.

El proyecto **no usa ninguna variable de entorno**, de modo que no hay secretos
que gestionar en el despliegue ([ADR 0002](docs/adr/0002-sin-backend.md)).

`vercel.json` añade cuatro cabeceras de seguridad a todas las respuestas:

| Cabecera                                           | Para qué                                          |
| -------------------------------------------------- | ------------------------------------------------- |
| `X-Content-Type-Options: nosniff`                  | el navegador no adivina el tipo de archivo        |
| `Referrer-Policy: strict-origin-when-cross-origin` | no se filtra la URL completa al salir del sitio   |
| `X-Frame-Options: DENY`                            | la página no puede incrustarse en un iframe ajeno |
| `Permissions-Policy`                               | cámara, micrófono y geolocalización desactivados  |

HTTPS y `Strict-Transport-Security` los sirve Vercel por defecto. La
`Content-Security-Policy` se añadirá en la Fase 10, cuando la aplicación esté
terminada y pueda probarse en un despliegue de vista previa: es la única
cabecera que puede dejar la página en blanco si se escribe mal.

## Metodología

- **TDD** en toda la lógica de negocio: primero el test, se comprueba que falla,
  después la implementación mínima y por último la refactorización. **87 tests
  en verde** al cerrar la Fase 3.
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
- [Estado del desarrollo](PROGRESO.md)
- [Normas del proyecto](CLAUDE.md)
