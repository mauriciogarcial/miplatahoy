
## 1. Objetivo

Definir el **modelo de datos conceptual y lógico** que soporta el MVP de MiPlataHoy: registro de usuarios, bolsillos/cuentas, movimientos, categorización con IA, metas/presupuestos, resúmenes y notificaciones, de acuerdo con las historias de usuario del backlog.

---

## 2. Alcance

Incluye:

- Datos para:
    
    - Autenticación y seguridad.
        
    - Cuentas / bolsillos y saldo total.
        
    - Movimientos (ingresos/gastos), adjuntos y recurrencias.
        
    - Categorías de ingreso/gasto.
        
    - IA: clasificación automática, resúmenes y consejos.
        
    - Metas, presupuestos y alertas.
        
    - Notificaciones, métricas, feedback y planes (freemium básico).
        
- Pensado para implementación en **MySQL** con un backend **FastAPI**.
    

No entra en detalle de particionamiento, multi-tenant avanzado ni optimizaciones específicas de motor.

---

## 3. Modelo Conceptual – Visión General

Entidades principales y relaciones:

- Un **Usuario**:
    
    - Tiene muchas **Cuentas/Bolsillos**.
        
    - Tiene muchos **Movimientos** (a través de sus cuentas).
        
    - Tiene muchas **Metas de Ahorro**.
        
    - Tiene muchos **Presupuestos por Categoría**.
        
    - Recibe muchos **Resúmenes Mensuales** y **Consejos**.
        
    - Tiene muchas **Alertas** y **Notificaciones**.
        
    - Tiene muchas **Configuraciones de Notificación**.
        
    - Puede tener una **Suscripción/Plan**.
        
    - Genera muchos **Eventos de Métricas**, **Logs de Auditoría**, **Feedback**.
        
- Una **Cuenta/Bolsillo**:
    
    - Pertenece a un **Usuario**.
        
    - Tiene muchos **Movimientos**.
        
- Un **Movimiento**:
    
    - Pertenece a una **Cuenta** y a un **Usuario**.
        
    - Puede pertenecer a una **Categoría** (opcional o múltiple niveles).
        
    - Puede estar asociado a una **Configuración de Recurrencia**.
        
    - Puede tener muchos **Adjuntos**.
        
    - Puede tener metadatos de **IA** (clasificación, confianza, prompts).
        
- Una **Categoría**:
    
    - Puede tener jerarquía (padre/hijo) para soportar subcategorías.
        
    - Se usa por **Movimientos** y **Presupuestos**.
        
- Una **Meta de Ahorro**:
    
    - Pertenece a un **Usuario**.
        
    - Puede estar asociada a una o varias **Cuentas** (o genérica).
        
- Un **Presupuesto por Categoría**:
    
    - Pertenece a un **Usuario**.
        
    - Se asocia a una **Categoría**.
        
- Un **Resumen Mensual**:
    
    - Pertenece a un **Usuario**.
        
    - Resume información de **Movimientos** y genera **Consejos IA**.
        

---

## 4. Diagrama conceptual (Mermaid)

Opcional, por si quieres pegarlo en tu repo / documentación:

`erDiagram      USUARIO ||--o{ CUENTA : tiene     USUARIO ||--o{ MOVIMIENTO : registra     USUARIO ||--o{ META_AHORRO : define     USUARIO ||--o{ PRESUPUESTO_CATEGORIA : configura     USUARIO ||--o{ RESUMEN_MENSUAL : recibe     USUARIO ||--o{ ALERTA : recibe     USUARIO ||--o{ NOTIFICACION : recibe     USUARIO ||--o{ EVENTO_METRICA : genera     USUARIO ||--o{ FEEDBACK : envia      CUENTA ||--o{ MOVIMIENTO : mueve      CATEGORIA ||--o{ CATEGORIA : subcategoria     CATEGORIA ||--o{ MOVIMIENTO : clasifica     CATEGORIA ||--o{ PRESUPUESTO_CATEGORIA : limita      MOVIMIENTO ||--o{ ADJUNTO_MOVIMIENTO : tiene     MOVIMIENTO }o--|| RECURRENCIA : sigue     MOVIMIENTO ||--o{ EVENTO_IA : clasificado_por      RESUMEN_MENSUAL ||--o{ CONSEJO_COACH : genera      PLAN ||--o{ SUSCRIPCION_USUARIO : asigna     USUARIO ||--o{ SUSCRIPCION_USUARIO : posee      NOTIFICACION }o--|| ALERTA : proviene_de`

---

## 5. Detalle de Entidades

### 5.1 USUARIO

**Descripción:** Representa a la persona que usa MiPlataHoy.

**Atributos principales (lógico):**

- `id_usuario` (PK)
    
- `email`
    
- `password_hash`
    
- `proveedor_auth` (local, google, etc.)
    
- `nombre_opcional`
    
- `onboarding_visto` (bool)
    
- `preferencias_idioma`
    
- `preferencias_moneda` (para MVP: COP fijo, pero se deja abierto)
    
- `estado_cuenta` (activo, bloqueado, eliminado)
    
- `fecha_creacion`
    
- `fecha_ultima_sesion`
    

**Relaciones:**

- 1:N con **CUENTA**, **MOVIMIENTO**, **META_AHORRO**, **PRESUPUESTO_CATEGORIA**, **RESUMEN_MENSUAL**, **ALERTA**, **NOTIFICACION**, **EVENTO_METRICA**, **FEEDBACK**, **SUSCRIPCION_USUARIO**.
    

---

### 5.2 CUENTA (Bolsillo)

**Descripción:** Bolsillos donde el usuario guarda dinero: efectivo, cuentas bancarias, billeteras digitales, etc.

**Atributos:**

- `id_cuenta` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `tipo_cuenta` (efectivo, ahorros, corriente, nequi, daviplata, billetera, otro)
    
- `nombre` (ej. “Efectivo casa”, “Ahorros Banco X”)
    
- `saldo_actual`
    
- `moneda` (para MVP: COP)
    
- `es_principal` (bool)
    
- `esta_activa` (bool)
    
- `fecha_creacion`
    
- `fecha_actualizacion`
    

**Relaciones:**

- 1:N con **MOVIMIENTO**.
    
- Opcional: relación con **META_AHORRO** si decides asociarlas a cuentas específicas.
    

---

### 5.3 CATEGORIA

**Descripción:** Estructura de categorías de ingresos/gastos que usa la IA y el usuario.

**Atributos:**

- `id_categoria` (PK)
    
- `tipo` (INGRESO | GASTO)
    
- `nombre` (Alimentación, Transporte, Deudas, etc.)
    
- `id_categoria_padre` (FK → CATEGORIA, opcional para subcategorías)
    
- `nivel` (1 = principal, 2 = subcategoría, etc.)
    
- `orden_visual`
    
- `es_activa` (bool)
    

**Relaciones:**

- 1:N consigo misma para jerarquía.
    
- 1:N con **MOVIMIENTO**.
    
- 1:N con **PRESUPUESTO_CATEGORIA**.
    

---

### 5.4 MOVIMIENTO

**Descripción:** Registro de ingreso o gasto del usuario.

**Atributos:**

- `id_movimiento` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `id_cuenta` (FK → CUENTA)
    
- `id_categoria` (FK → CATEGORIA, opcional si está sin clasificar)
    
- `tipo_movimiento` (INGRESO | GASTO)
    
- `monto`
    
- `fecha_movimiento`
    
- `descripcion` (texto libre)
    
- `es_recurrente` (bool)
    
- `id_recurrencia` (FK → RECURRENCIA, opcional)
    
- `origen_registro` (manual, demo, generado_por_recurrencia, importado)
    
- `clasificacion_origen` (manual, ia, regla)
    
- `confianza_ia` (0–1, opcional)
    
- `fue_corregida_categoria` (bool)
    
- `fecha_creacion`
    
- `fecha_actualizacion`
    

**Relaciones:**

- 1:N con **ADJUNTO_MOVIMIENTO**.
    
- N:1 con **CUENTA**, **CATEGORIA**, **USUARIO**.
    
- 1:N con **EVENTO_IA** (clasificación, resumen de prompts usados).
    
- N:1 con **RECURRENCIA** si aplica.
    

---

### 5.5 RECURRENCIA

**Descripción:** Configuración para movimientos recurrentes.

**Atributos:**

- `id_recurrencia` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `tipo` (INGRESO | GASTO)
    
- `periodicidad` (semanal, quincenal, mensual, otro)
    
- `monto_por_defecto`
    
- `id_cuenta_por_defecto`
    
- `id_categoria_por_defecto` (opcional)
    
- `descripcion_por_defecto`
    
- `fecha_inicio`
    
- `fecha_proxima_ejecucion`
    
- `esta_activa` (bool)
    

**Relaciones:**

- 1:N con **MOVIMIENTO** (las instancias generadas).
    

---

### 5.6 ADJUNTO_MOVIMIENTO

**Descripción:** Imágenes/archivos asociados a un movimiento (recibos, facturas).

**Atributos:**

- `id_adjunto` (PK)
    
- `id_movimiento` (FK → MOVIMIENTO)
    
- `tipo_archivo` (imagen, pdf, etc.)
    
- `url_archivo`
    
- `tamanio_bytes`
    
- `metadata_ocr` (JSON opcional con datos extraídos)
    
- `fecha_subida`
    

---

### 5.7 META_AHORRO

**Descripción:** Metas de ahorro configuradas por el usuario.

**Atributos:**

- `id_meta` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `nombre`
    
- `monto_objetivo`
    
- `monto_acumulado` (cacheado para lecturas rápidas)
    
- `fecha_objetivo` (opcional)
    
- `estado` (activa, alcanzada, cancelada)
    
- `fecha_creacion`
    
- `fecha_cierre` (cuando se alcanza/cancela)
    

**Relaciones:**

- El avance real se calcula a partir de **MOVIMIENTOS** marcados como aportes a meta (puede requerir tabla puente `MOVIMIENTO_META` si quieres granularidad).
    

---

### 5.8 PRESUPUESTO_CATEGORIA

**Descripción:** Presupuesto o tope de gasto por categoría y periodo.

**Atributos:**

- `id_presupuesto` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `id_categoria` (FK → CATEGORIA)
    
- `periodo` (ej. `YYYY-MM`)
    
- `monto_maximo`
    
- `monto_ejecutado` (cacheado, se recalcula periódicamente)
    
- `umbral_alerta` (ej. 0.8 para 80%)
    
- `esta_activo` (bool)
    
- `fecha_creacion`
    
- `fecha_actualizacion`
    

**Relaciones:**

- 1:N con **ALERTA** (cuando se superan umbrales).
    

---

### 5.9 ALERTA

**Descripción:** Representa una condición financiera relevante: presupuesto cercano o superado, meta alcanzada, etc.

**Atributos:**

- `id_alerta` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `tipo_alerta` (presupuesto_80, presupuesto_100, meta_alcanzada, etc.)
    
- `id_presupuesto` (FK → PRESUPUESTO_CATEGORIA, opcional)
    
- `id_meta` (FK → META_AHORRO, opcional)
    
- `mensaje_interno` (texto para mostrar en app)
    
- `origen` (sistema, ia)
    
- `fecha_generacion`
    
- `esta_resuelta` (bool)
    
- `fecha_resolucion` (opcional)
    

**Relaciones:**

- 1:N con **NOTIFICACION** (la alerta puede generar varias notificaciones).
    

---

### 5.10 NOTIFICACION

**Descripción:** Lo que realmente ve el usuario como “notificación” (in-app y/o email).

**Atributos:**

- `id_notificacion` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `id_alerta` (FK → ALERTA, opcional)
    
- `tipo_canal` (in_app, email)
    
- `titulo`
    
- `mensaje`
    
- `fue_leida` (bool para in-app)
    
- `fue_enviada` (bool para email)
    
- `fecha_enviada`
    
- `fecha_leida`
    

---

### 5.11 RESUMEN_MENSUAL

**Descripción:** Resumen financiero generado (con apoyo de IA) por mes.

**Atributos:**

- `id_resumen` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `mes` (ej. `YYYY-MM`)
    
- `ingresos_totales`
    
- `gastos_totales`
    
- `saldo_neto`
    
- `categoria_top_gasto` (FK → CATEGORIA, opcional)
    
- `variacion_vs_mes_anterior` (porcentaje)
    
- `texto_resumen` (resultado en lenguaje natural)
    
- `texto_contexto_datos` (JSON con agregados usados para IA, opcional)
    
- `fecha_generacion`
    
- `origen` (ia, manual)
    

**Relaciones:**

- 1:N con **CONSEJO_COACH**.
    

---

### 5.12 CONSEJO_COACH

**Descripción:** Mensajes/insights generados por IA para el usuario (mensual o mini-mensajes en el home).

**Atributos:**

- `id_consejo` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `id_resumen` (FK → RESUMEN_MENSUAL, opcional)
    
- `tipo` (mensual, home, educativo)
    
- `texto`
    
- `nivel_severidad` (info, warning, alerta)
    
- `fecha_generacion`
    
- `fue_mostrado` (bool)
    
- `fecha_mostrado` (opcional)
    

---

### 5.13 CONFIGURACION_NOTIFICACION

**Descripción:** Preferencias del usuario para notificaciones (ej. correo activado, tipo de alertas).

**Atributos:**

- `id_config` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `recibir_email_resumen` (bool)
    
- `recibir_email_alerta_presupuesto` (bool)
    
- `recibir_notificaciones_in_app` (bool)
    
- `frecuencia_recordatorio_feedback` (ej. nunca, baja, media)
    
- `fecha_ultima_actualizacion`
    

---

### 5.14 EVENTO_METRICA

**Descripción:** Eventos clave de uso para entender adopción y retención.

**Atributos:**

- `id_evento` (PK)
    
- `id_usuario` (FK → USUARIO, opcional si anonimizas)
    
- `tipo_evento` (movimiento_creado, resumen_leido, categoria_corregida, etc.)
    
- `detalle` (JSON con metadata no sensible)
    
- `timestamp`
    

---

### 5.15 FEEDBACK

**Descripción:** Comentarios que dejan los primeros usuarios sobre la app.

**Atributos:**

- `id_feedback` (PK)
    
- `id_usuario` (FK → USUARIO, opcional)
    
- `origen` (in_app, encuesta, taller)
    
- `texto`
    
- `email_contacto_opcional`
    
- `rating_opcional` (1–5)
    
- `fecha_envio`
    

---

### 5.16 PLAN y SUSCRIPCION_USUARIO (Freemium simple)

**PLAN**

- `id_plan` (PK)
    
- `nombre` (free, premium, etc.)
    
- `descripcion`
    
- `limite_cuentas`
    
- `limite_metas`
    
- `limite_presupuestos`
    
- `incluye_reportes_avanzados` (bool)
    
- `precio_mensual` (para info)
    
- `esta_activo` (bool)
    

**SUSCRIPCION_USUARIO**

- `id_suscripcion` (PK)
    
- `id_usuario` (FK → USUARIO)
    
- `id_plan` (FK → PLAN)
    
- `fecha_inicio`
    
- `fecha_fin` (opcional)
    
- `estado` (activa, cancelada, vencida)
    

---

### 5.17 EVENTO_IA

**Descripción:** Metadatos de llamadas a la IA (clasificación de movimientos, resúmenes, consejos).

**Atributos:**

- `id_evento_ia` (PK)
    
- `id_usuario` (FK → USUARIO, opcional)
    
- `tipo_uso` (clasificacion_movimiento, resumen_mensual, consejo, educacion)
    
- `id_movimiento` (FK → MOVIMIENTO, opcional)
    
- `id_resumen` (FK → RESUMEN_MENSUAL, opcional)
    
- `proveedor` (openai, gemini, otro)
    
- `modelo`
    
- `prompt_truncado` (texto sanitizado)
    
- `respuesta_truncada`
    
- `costo_estimado` (tokens/crédito, opcional)
    
- `fecha_llamada`
    
- `exitoso` (bool)
    
- `mensaje_error` (si aplica)
    

---

### 5.18 LOG_AUDITORIA

**Descripción:** Trazabilidad de cambios en datos críticos (movimientos, metas, presupuestos, usuario).

**Atributos:**

- `id_log` (PK)
    
- `id_usuario` (FK → USUARIO que hizo el cambio)
    
- `entidad` (MOVIMIENTO, CUENTA, META_AHORRO, etc.)
    
- `id_entidad` (ID del registro afectado)
    
- `accion` (CREAR, ACTUALIZAR, ELIMINAR)
    
- `valores_antes` (JSON)
    
- `valores_despues` (JSON)
    
- `timestamp`
    

---

### 5.19 FAQ (Centro de Ayuda)

**Descripción:** Preguntas frecuentes administrables.

**Atributos:**

- `id_faq` (PK)
    
- `categoria_tema` (registro, movimientos, metas, seguridad, etc.)
    
- `pregunta`
    
- `respuesta`
    
- `orden`
    
- `esta_activa` (bool)
    
- `fecha_actualizacion`
    

---

## 6. Consideraciones para el Modelo Físico (MySQL)

- Convención de nombres:
    
    - Tablas en `snake_case` plural: `usuarios`, `cuentas`, `movimientos`, etc.
        
    - Claves primarias enteras autoincrementales (`INT UNSIGNED AUTO_INCREMENT`) o UUID si lo prefieres.
        
- Claves foráneas bien definidas con `ON DELETE RESTRICT` o `ON DELETE CASCADE` según el caso.
    
- Índices recomendados:
    
    - `movimientos(id_usuario, fecha_movimiento)` para listados e históricos.
        
    - `movimientos(id_usuario, id_categoria, fecha_movimiento)` para reportes.
        
    - `presupuestos_categoria(id_usuario, id_categoria, periodo)` para cálculo de ejecución.
        
    - `resumenes_mensuales(id_usuario, mes)`.
        
- Soporte a **soft delete** opcional mediante columnas `eliminado_en` o `esta_eliminado` en tablas clave.
    
- Campos tipo `JSON` donde se requiera flexibilidad (`detalle`, `metadata_ocr`, agregados para IA, etc.).