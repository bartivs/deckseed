---
title: "{{TITLE}}"
subtitle: "Propuesta"
author: "{{AUTHOR}}"
date: "{{DATE}}"
lang: "{{LANGUAGE}}"
subject: "Documento complementario de la presentación {{PRESENTATION_SLUG}}"
keywords:
  - propuesta
  - seguimiento
---

| Campo | Valor |
|---|---|
| **Tipo** | Propuesta ejecutiva / iniciativa |
| **Estado** | Borrador para discusión |
| **Presentación asociada** | `{{PRESENTATION_SLUG}}` |
| **Propuesta anterior** | {{PREVIOUS_DELIVERABLE}} |

# La idea en una frase

Resumir la recomendación en una oración verificable.

# Relación con la propuesta anterior

## Qué se mantiene

- Decisión, alcance o principio heredado.

## Qué cambia ahora

- Nueva evidencia, alcance o decisión solicitada.

# Por qué — el problema que resuelve

- Problema observable.
- Consecuencia operativa o de negocio.
- Razón para actuar ahora.

# Estado actual y alcance

Describir brevemente los sistemas, equipos o procesos afectados.

# Enfoque propuesto

1. Primer paso acotado.
2. Construcción o cambio principal.
3. Validación técnica y de negocio.
4. Criterio para avanzar, ajustar o detener.

::: {.pagebreak}
:::

# Flujo de trabajo

Describir el pipeline de extremo a extremo. Agregar una figura local aprobada cuando mejore la comprensión:

<!-- ![Pipeline propuesto](proposal-assets/pipeline.png){width=90%} -->

# Ownership y responsabilidades

| Función | Responsable | Responsabilidad | Evidencia de salida |
|---|---|---|---|
| Sponsor | Por definir | Decisión y presupuesto | Aprobación documentada |
| Liderazgo técnico | Por definir | Arquitectura y calidad | Gates y revisión |
| Operación | Por definir | Runtime y recuperación | Métricas y runbooks |
| Negocio / resultado | Por definir | Validación del resultado | Aceptación explícita |

# Beneficios esperados

- Beneficio medible.
- Reducción de riesgo o coste.
- Capacidad organizacional creada.

# Riesgos y controles

| Riesgo | Impacto | Control | Señal de parada |
|---|---|---|---|
| Alcance excesivo | Retraso y doble mantenimiento | Piloto acotado | Hitos incumplidos |
| Calidad insuficiente | Regresiones | Pruebas y revisión independiente | Gate bloqueante |
| Coste variable | Desvío presupuestario | Topes y alertas | Límite alcanzado |

# Cómo arrancar — fases

1. **Preparar:** fijar alcance, responsables, baseline y criterios.
2. **Ejecutar:** producir el primer resultado con trazabilidad completa.
3. **Medir:** comparar calidad, tiempo, coste y riesgo.
4. **Decidir:** continuar, ajustar o detener.

# Decisión solicitada

Especificar quién debe aprobar qué, por cuánto tiempo, con qué presupuesto y bajo qué criterios de salida.

# Referencias

- Presentación asociada: `presentations/{{PRESENTATION_SLUG}}/content.md`.
- Fuentes públicas y documentos internos aprobados.
