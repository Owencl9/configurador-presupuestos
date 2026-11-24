# ADR 0002 — Sin backend, sin base de datos y sin autenticación

**Fecha:** 24/11/2026
**Estado:** aceptada
**Fase:** 1

## Contexto

La aplicación calcula presupuestos a partir de un catálogo de servicios y unas
reglas de negocio conocidas. Hay que decidir si algo de eso necesita vivir en un
servidor.

Lo que la aplicación hace con datos: leer un catálogo fijo, calcular importes y
guardar el presupuesto en curso para recuperarlo más tarde.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **Todo en el navegador** | Sin coste, sin credenciales, sin superficie de ataque, despliegue estático, el tribunal puede clonarlo y ejecutarlo sin configurar nada | Los presupuestos no se comparten entre dispositivos ni quedan guardados en ningún servidor |
| Backend con base de datos | Permitiría un histórico de presupuestos y acceso multidispositivo | Requiere servidor, base de datos, autenticación y gestión de secretos. Nada de eso lo pide el proyecto, y multiplica el trabajo en un plazo ya ajustado |
| Función serverless solo para la IA | Permitiría el extra opcional 4.7 | Obliga a gestionar una clave de API justo donde el apartado 5 exige más cuidado. El usuario descartó el extra en la Fase 0 |

## Decisión

**Toda la aplicación se ejecuta en el navegador.** No hay backend, ni base de
datos, ni login, ni funciones de servidor.

- El catálogo de servicios es un archivo de datos del propio proyecto.
- El cálculo ocurre en el cliente.
- Los borradores se guardan en `localStorage`.
- El documento final se genera con la función de imprimir del navegador y CSS de
  impresión, sin librerías de PDF.

## Consecuencias

- **El repositorio no contiene ningún secreto.** Esto es lo que permite
  publicarlo sin riesgo, que es un requisito de entrega del máster.
- No se necesitan credenciales de prueba para evaluar la aplicación.
- Los datos del presupuesto no salen del equipo de quien lo usa: no hay cuestión
  de protección de datos que resolver.
- `localStorage` es la única persistencia, y es **poco fiable por naturaleza**:
  el usuario puede borrarla, y su contenido puede estar manipulado o
  corrompido. Todo lo que se lea de ahí debe validarse antes de usarse, y la
  aplicación debe descartarlo y empezar de cero si no es válido, sin romperse.
- Los precios y las reglas de negocio son **visibles** en el código del
  navegador. Es aceptable: son las tarifas públicas de una agencia, no
  información reservada.
