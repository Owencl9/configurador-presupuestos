# Configurador de Presupuestos

Aplicación web para configurar el presupuesto de los servicios de una agencia de
desarrollo web y marketing digital. Se seleccionan los servicios y se obtiene el
importe calculado automáticamente, con descuentos, IGIC, desglose por tipo de
pago y opción de imprimirlo o guardarlo en PDF.

Trabajo Final de Máster — Máster en Desarrollo con Inteligencia Artificial
(BIG School). Desarrollado con asistencia de IA y documentado fase a fase.

> **Estado: en desarrollo (Fase 1 de 11 completada).**
> La URL de la aplicación desplegada se añadirá aquí en cuanto esté publicada.

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
| Despliegue                           | Vercel                     |

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
    ├── shared/             Código usado por varias funcionalidades
    │   └── components/     Componentes reutilizables (ServiceCard)
    └── test/               Configuración común de los tests
```

A medida que avancen las fases se añadirán `src/features/` (catálogo,
presupuesto, formulario de cliente, documento final), `src/context/` (estado
global) y `e2e/` (tests de Playwright).

## Funcionalidades previstas

- Catálogo de servicios agrupados por categoría, con pago único, mensual o anual
- Construcción del presupuesto con cantidades y permanencias mínimas
- Descuentos por pack, permanencia e importe, con tope máximo del 20 %
- Cálculo del IGIC y desglose de pago inicial, cuota mensual y pagos anuales
- Datos del cliente, número de presupuesto y validez
- Vista imprimible del presupuesto, para guardar como PDF desde el navegador
- Borradores guardados en el navegador

## Metodología

- **TDD** en toda la lógica de negocio: primero el test, se comprueba que falla,
  después la implementación mínima y por último la refactorización.
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
