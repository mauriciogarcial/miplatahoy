# MiPlataHoy ??

**MiPlataHoy** es una billetera virtual súper sencilla pensada para cómo realmente manejamos la plata en Latinoamérica.

Abres la app, ves en grande **cuánta plata tienes hoy**, tocas ese número para registrar un movimiento, y el sistema se encarga del resto: clasificar, aprender tus hábitos y darte consejos claros.

> _?MiPlataHoy ? Mira cuánto tienes, decide mejor.?_

---

## ?? Objetivo del proyecto

Crear un **coach financiero personal minimalista** que:

- Sea **muy fácil de usar** para cualquier persona (no sólo gente de sistemas).
- Ayude a entender **en qué se va la plata** sin llenar formularios eternos.
- Aprenda de tus movimientos y te dé **consejos simples y accionables**.
- Sirva como **caso de estudio público** de un proyecto desarrollado:
  - con **todas las fases del ciclo de vida de software**, y  
  - **asistido por herramientas de IA** (LLMs, code assistants, etc.).

Todo el proceso (diseño, decisiones, código, errores y aprendizajes) se documentará de forma abierta en este repositorio.

---

## ?? ¿Para quién es MiPlataHoy?

Pensamos en personas de LATAM que:

- Reciben ingresos de nómina, contratos o trabajo independiente.
- Sienten que ?la plata no alcanza? y no saben bien **por qué**.
- No quieren una app complicada, sino algo que:
  - muestre un **número claro al centro**,  
  - permita registrar movimientos en segundos,  
  - y dé **pistas concretas** sobre cómo mejorar.

---

## ?? Idea central de la experiencia

Pantalla principal:

- Un solo número grande: **?Tu plata hoy?**.
- Al tocar ese número, se abre el flujo de registro:

1. **¿Es una entrada o un gasto?**  
2. **¿Es recurrente o puntual?**  
3. (Opcional) Nota corta o etiqueta.

Con esa información, MiPlataHoy:

- va creando **categorías** automáticamente (comida, transporte, deudas, ocio, etc.),
- construye tu **presupuesto real** en segundo plano,
- y te va mostrando **insights y consejos**:  
  - ?Esta semana gastaste más en comida fuera de casa que el promedio del mes.?  
  - ?Tienes 3 gastos recurrentes que podrías revisar: suscripciones / servicios.?  

---

## ?? IA en el proyecto

Este repositorio también es un ejemplo de **desarrollo asistido por IA**:

- Uso de IA para:
  - analizar fuentes sobre **hábitos de gasto en Latinoamérica**,
  - refinar requerimientos y casos de uso,
  - proponer arquitectura y modelos de datos,
  - generar y refactorizar código,
  - crear casos de prueba y datos de ejemplo,
  - analizar errores y sugerir mejoras.
- Todo esto se irá documentando en la carpeta [`docs/`](./docs).

Si te interesa ver **cómo se usa IA en cada fase**, este proyecto está pensado justamente para eso.

---

## ??? Estructura del repositorio (propuesta inicial)

> Esta estructura puede ir cambiando a medida que avance el proyecto.

```text
MiPlataHoy/
  README.md
  backend/          # API, lógica de negocio, modelo de datos
  frontend/         # App web / móvil (UI de la billetera)
  docs/             # Documentación del proceso y decisiones
    00-vision-proyecto.md
    01-descubrimiento-necesidades.md
    02-diseno-arquitectura.md
    03-desarrollo-asistido-ia.md
    04-pruebas-y-calidad.md
    05-despliegue-y-monitoreo.md
    06-lecciones-aprendidas.md
