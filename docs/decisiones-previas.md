# Decisiones previas al desarrollo

Este documento recoge lo que ocurrió **antes** de empezar a desarrollar con
asistencia de IA, y que por tanto no aparece en el registro de prompts de
ninguna fase. Explica por qué el proyecto es este y no otro, y por qué está
planteado como está.

Sin este contexto, varias decisiones del repositorio parecen arbitrarias: la
ausencia de backend, la insistencia en el plazo o el peso que se le da a los
tests.

---

## 1. El punto de partida: un auditor SEO con IA

Mi primera idea para el Trabajo Final de Máster fue un **auditor SEO con
inteligencia artificial**:

| Elemento | Planteamiento inicial |
|---|---|
| Lenguaje | Python |
| Framework web | Flask |
| Función principal | rastreo automatizado de sitios web |
| Análisis | API de OpenAI sobre el contenido rastreado |
| Infraestructura | servidor propio |

La idea era atractiva y encajaba con el máster, porque la IA estaba en el centro
del producto, no solo en el proceso de desarrollo.

## 2. Por qué lo descarté

Lo descarté por dos motivos, y el segundo fue el decisivo.

### 2.1. Complejidad desproporcionada

Un rastreador web no es un componente sencillo de hacer bien:

- **Seguridad del rastreador.** Un proceso que descarga y procesa contenido
  arbitrario de internet es, por definición, una superficie de ataque: hay que
  validar lo que entra, limitar a dónde se conecta, controlar el tamaño de las
  descargas y evitar que una URL malintencionada afecte al servidor.
- **Servidor.** Flask necesita un servidor en funcionamiento, con su despliegue,
  su mantenimiento y su monitorización.
- **Costes de la API.** Cada análisis consume tokens de pago. Un error en un
  bucle de rastreo puede generar un gasto real e imprevisto.

Nada de eso es insalvable, pero todo eso es trabajo que **no se ve en el
resultado** y que consume justamente el tiempo que el proyecto necesitaba para
lo que sí se evalúa.

### 2.2. El plazo

El plazo disponible no daba margen para resolver bien la infraestructura **y**
entregar una aplicación terminada, documentada, probada y desplegada. Entre
entregar un proyecto ambicioso a medias y uno modesto bien acabado, elegí el
segundo.

## 3. Qué elegí en su lugar

El **Configurador de Presupuestos**: una aplicación que calcula el presupuesto de
los servicios de mi agencia de desarrollo web y marketing digital.

| Criterio | Auditor SEO con IA | Configurador de Presupuestos |
|---|---|---|
| Infraestructura | servidor Flask | ninguna: todo en el navegador |
| Coste de funcionamiento | API de pago + servidor | cero |
| Secretos que gestionar | clave de API | ninguno |
| Superficie de ataque | rastreo de contenido externo | ninguna entrada externa |
| Despliegue | manual, con mantenimiento | estático y gratuito |
| Dónde está la dificultad | en la infraestructura | en la calidad del código |

El cambio de proyecto es lo que permite que **el repositorio no contenga ningún
secreto**, que es a su vez lo que permite publicarlo sin riesgo, como exige la
entrega del máster. Queda documentado en
[ADR 0002 — Sin backend](adr/0002-sin-backend.md).

La IA sigue siendo central en el proyecto, pero ha cambiado de sitio: ya no es
una función del producto, sino **el método de desarrollo**. Eso es lo que
documentan `docs/prompts/` y `docs/adr/`.

Una ventaja añadida: el Configurador resuelve un problema real de mi agencia.
Los presupuestos los calculaba a mano, con el riesgo de equivocarme en los
descuentos o en el IGIC. No es un ejercicio inventado para el máster.

## 4. De dónde viene la metodología

La forma de trabajar no la improvisé. Está inspirada en el **proyecto de ejemplo
del módulo de Calidad** del máster, del que tomé tres cosas:

| Elemento | Qué aporta |
|---|---|
| **TDD** en la lógica de negocio | el test se escribe primero y se comprueba que falla; en una aplicación que calcula dinero, es la única forma de confiar en el resultado |
| **Registro de prompts por fase** | deja constancia de cómo se ha usado la IA, que es lo que se evalúa en un máster de desarrollo con IA |
| **ADR** (Architecture Decision Records) | cada decisión importante queda con su contexto, sus alternativas y sus consecuencias, en lugar de perderse en la cabeza de quien la tomó |

Lo que añadí fue aplicarlo a **un caso real de mi agencia** en lugar de a un
ejercicio, y desarrollarlo **fase a fase con autorización explícita** en cada
paso, en vez de pedir la aplicación completa de una vez.

## 5. Nota sobre el proyecto descartado

El auditor SEO no se ha desarrollado: no existe código, ni repositorio, ni
documentación suya. Cualquier referencia a «Auditor SEO IA» que aparezca en
notas o en el historial de conversaciones con el asistente **pertenece a esa idea
descartada y no tiene relación con este proyecto**. Así quedó indicado al
asistente en el primer prompt de la Fase 0.

---

*Documento dictado por el autor y transcrito el 24/11/2026, durante la Fase 1,
para incorporar al repositorio un contexto anterior al inicio del desarrollo
asistido.*
