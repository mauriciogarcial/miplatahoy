## 1. Objetivo

Definir **cómo se mueven los datos** entre los actores, la app (frontend), la API (FastAPI), la base de datos (MySQL) y los servicios de IA / notificaciones, a partir del backlog de historias de usuario del MVP de MiPlataHoy.

Este documento corresponde a la **fase de Construcción** dentro del ciclo **AI-DLC**.

---

## 2. Alcance y Supuestos

- Arquitectura base:
    
    - **Frontend web responsive** (React).
        
    - **Backend** en **FastAPI** exponiendo API REST.
        
    - **Base de datos MySQL** como almacén principal.
        
    - **Proveedor de IA** externo (LLM / visión) encapsulado por una capa de abstracción.
        
    - **Servicio de correo** para notificaciones.
        
    - **Sistema de métricas/logs** para analítica de producto.
        
- Moneda única: **COP**.
    
- Usuario final identificado por cuenta (email/password u OAuth).
    
- No se envían **datos personales sensibles** a la IA (nombre, email, # de cuenta, etc.).
    

---

## 3. Componentes y Almacenes de Datos

### 3.1 Entidades externas

- **E1 – Usuario final**
    
- **E2 – Google OAuth** (login social)
    
- **E3 – Proveedor de IA**
    
    - Clasificación de movimientos.
        
    - Resúmenes mensuales.
        
    - Consejos del coach.
        
    - (Opcional) OCR/visión de recibos.
        
- **E4 – Servicio de correo electrónico**
    
- **E5 – Servicio de métricas / analítica (interno o externo)**
    

### 3.2 Procesos lógicos (backend / dominio)

- **P1 – Gestión de Autenticación**
    
- **P2 – Onboarding y Modo Demo**
    
- **P3 – Gestión de Cuentas/Bolsillos**
    
- **P4 – Gestión de Movimientos**
    
- **P5 – Motor IA de Clasificación de Movimientos**
    
- **P6 – Motor IA de Resúmenes y Coach**
    
- **P7 – Gestión de Metas, Presupuestos y Alertas**
    
- **P8 – Gestión de Notificaciones (in-app / email)**
    
- **P9 – Métricas, Logs y Auditoría**
    
- **P10 – Capa de Abstracción de IA** (adaptador a diferentes proveedores).
    

### 3.3 Almacenes de datos (MySQL)

- **D1 – Usuarios y Autenticación**
    
    - Usuario, email, hash de contraseña, proveedor (local/Google), estado, timestamps.
        
- **D2 – Cuentas/Bolsillos**
    
    - Tipo (efectivo, banco, Nequi, Daviplata, etc.), nombre, saldo actual, usuario.
        
- **D3 – Movimientos**
    
    - Monto, tipo (ingreso/gasto), fecha, cuenta, usuario, descripción, etiquetas, recurrente, adjuntos.
        
- **D4 – Categorías**
    
    - Estructura de categorías y subcategorías (Ingresos/Gastos).
        
- **D5 – Metas y Presupuestos**
    
    - Metas de ahorro, topes por categoría, periodos.
        
- **D6 – Alertas y Notificaciones**
    
    - Alertas de presupuesto, avisos de metas, eventos importantes.
        
- **D7 – Resúmenes y Consejos IA**
    
    - Resumen mensual, textos del coach, recomendaciones.
        
- **D8 – Logs y Métricas**
    
    - Eventos de uso, auditoría de cambios, metadatos de IA (prompts/resp anonimizados).
        

---

## 4. Vista de Alto Nivel (DFD – Nivel 0)

**Flujo general:**

1. **E1 Usuario** interactúa con el **Frontend (React)**.
    
2. El frontend envía/recibe datos a través de la **API REST (FastAPI)**.
    
3. FastAPI:
    
    - Lee/escribe en **D1–D7** (MySQL).
        
    - Envia datos a **P10 Capa de IA**, que a su vez comunica con **E3 Proveedor IA**.
        
    - Envia eventos de notificación a **E4 Servicio de correo**.
        
    - Registra eventos en **D8 Logs y Métricas** y/o **E5 Servicio de analítica**.
        

---

## 5. Flujos de Datos por Proceso

### 5.1 P1 – Gestión de Autenticación

**Flujos principales: registro, login, logout, OAuth.**

1. **Registro email/contraseña**
    
    - `E1 Usuario → Frontend`
        
        - Datos: email, contraseña (texto), nombre opcional.
            
    - `Frontend → API P1` (HTTPS POST `/auth/register`)
        
        - Datos: email, contraseña (texto).
            
    - `P1 → D1`
        
        - La contraseña se transforma a **hash + salt** antes de persistir.
            
        - Se crea registro de usuario.
            
    - `P1 → Frontend`
        
        - Datos: `usuario_id`, token de sesión (JWT o similar), flags (onboarding pendiente).
            
    - `P1 → D8`
        
        - Evento “usuario_registrado”.
            
2. **Inicio de sesión email/contraseña**
    
    - `E1 → Frontend → API /auth/login`
        
    - `P1` valida credenciales vs **D1** (comparación hash).
        
    - Si OK:
        
        - `P1 → Frontend`: token + datos básicos usuario.
            
        - `P1 → D8`: evento “login_ok”.
            
    - Si error:
        
        - `P1 → Frontend`: mensaje genérico “credenciales inválidas”.
            
        - `P1 → D8`: evento “login_fail` (sin detalles sensibles).
            
3. **Inicio de sesión con Google (OAuth)**
    
    - `E1 → Frontend → E2 Google OAuth` (redirección / popup).
        
    - `E2 → Frontend → API P1` código de autorización.
        
    - `P1 → E2` intercambio de token, obtención del email.
        
    - `P1 ↔ D1`:
        
        - Si usuario no existe: crear registro con proveedor = Google.
            
        - Si existe: asociar login.
            
    - `P1 → Frontend`: token + datos usuario.
        
4. **Cierre de sesión**
    
    - `E1 → Frontend → API /auth/logout`
        
    - `P1` invalida token (lista negra o rotación).
        
    - `P1 → D8`: evento “logout”.
        

---

### 5.2 P2 – Onboarding y Modo Demo

**Objetivo:** explicar app y, opcionalmente, cargar datos ficticios.

1. **Onboarding**
    
    - `Frontend → API P2 /onboarding/status`: solicita si ya fue completado.
        
    - `P2 ↔ D1`: lee flag `onboarding_visto`.
        
    - `P2 → Frontend`: estado (pendiente / completado).
        
    - Al finalizar:
        
        - `Frontend → API P2 /onboarding/complete`.
            
        - `P2 → D1`: actualiza flag.
            
2. **Modo Demo**
    
    - `Frontend → API P2 /demo/activar`.
        
    - `P2` no escribe en D3 real; carga **dataset ficticio** (en memoria o en un esquema especial).
        
    - `P2 → Frontend`: movimientos demo, saldo demo.
        
    - Al salir:
        
        - `Frontend → API P2 /demo/desactivar`.
            
        - `P2` limpia sesión demo y vuelve a datos reales.
            

---

### 5.3 P3 – Gestión de Cuentas/Bolsillos

**Flujos de creación y consulta de cuentas.**

1. **Listar cuentas**
    
    - `Frontend → API P3 /accounts`
        
    - `P3 → D2`: consulta bolsillos del usuario.
        
    - `P3 → Frontend`: lista con tipo, nombre, saldo, estado.
        
2. **Crear/editar/eliminar bolsillo**
    
    - `E1 → Frontend` datos: tipo, nombre, saldo inicial.
        
    - `Frontend → API P3 /accounts (POST/PUT/DELETE)`
        
    - `P3 ↔ D2`: inserta/actualiza/marca como borrado.
        
    - `P3 → D3`: puede lanzar procesos de ajuste de saldo histórico si se cambia saldo inicial.
        
    - `P3 → Frontend`: cuenta actualizada + nuevo saldo total.
        
    - `P3 → D8`: evento “cuenta_creada / cuenta_editada / cuenta_eliminada”.
        
3. **Cálculo de saldo total**
    
    - `Frontend → API P3 /balance/total`
        
    - `P3 → D2`: suma saldos de cuentas activas.
        
    - `P3 → Frontend`: valor agregado “MiPlataHoy”.
        

---

### 5.4 P4 – Gestión de Movimientos

Incluye registro rápido, edición, borrado, adjuntos y movimientos recurrentes.

1. **Registro de movimiento (flujo principal)**
    
    - `E1 → Frontend`: toca el saldo → abre formulario.
        
    - `Frontend → API P4 /movements (POST)`
        
        - Datos: `usuario_id` (del token), `cuenta_id`, `monto`, `tipo` (ingreso/gasto), `fecha`, `descripcion` opcional, `es_recurrente`, `periodicidad` opcional.
            
    - `P4 → Validaciones`: monto > 0, fecha válida, cuenta pertenece al usuario, etc.
        
    - `P4 → D3`: inserta movimiento (sin categoría aún o con categoría por defecto).
        
    - `P4 → D2`: recalcula/actualiza saldo de la cuenta.
        
    - `P4 → D8`: evento “movimiento_creado”.
        
    - **Dispara P5 (clasificación IA)** de forma síncrona o asíncrona.
        
2. **Movimientos recurrentes**
    
    - Al crear con `es_recurrente = true`:
        
        - `P4 → D3`: guarda plantilla de recurrencia.
            
    - Proceso programado:
        
        - `Scheduler → P4`: ejecuta job diario.
            
        - `P4 → D3`: busca movimientos recurrentes que deben dispararse hoy.
            
        - `P4 → D3/D2`: crea nuevo movimiento efectivo y actualiza saldo.
            
        - `P4 → D8`: log de generación automática.
            
3. **Adjuntar imágenes / archivos**
    
    - `E1 → Frontend`: selecciona archivo.
        
    - `Frontend → API P4 /movements/{id}/attachments (POST)` con archivo.
        
    - `P4 → Storage` (S3/Blob/local): guarda archivo.
        
    - `P4 → D3`: guarda metadata del adjunto (URL, tipo, tamaño).
        
    - (Opcional OCR) `P4 → P10 → E3`: envía imagen para extracción de texto.
        
    - `E3 → P10 → P4`: devuelve texto extraído (monto, comercio).
        
    - `P4 → D3`: actualiza campos del movimiento con datos sugeridos.
        
    - **Dispara P5** para clasificar mejor.
        
4. **Editar / borrar movimientos**
    
    - `Frontend → API P4 /movements/{id} (PUT/DELETE)`
        
    - `P4 ↔ D3`: actualiza/elimina movimiento.
        
    - `P4 → D2`: recalcula saldo de cuenta.
        
    - `P4 → D8`: escribe histórico de cambios (antes/después).
        

---

### 5.5 P5 – Motor IA de Clasificación de Movimientos

Utiliza IA para clasificar el movimiento en categorías.

1. **Entrada al motor**
    
    - Disparado desde P4 al crear/editar movimiento o al adjuntar recibo.
        
    - `P5 → D3`: lee movimiento (monto, fecha, descripción, tipo, cuenta).
        
    - `P5 → D4`: lee catálogo de categorías.
        
2. **Construcción de prompt (sanitizado)**
    
    - `P5`: arma payload para IA:
        
        - Incluye: descripción, monto, fecha, tipo, nombre genérico de comercio.
            
        - Excluye: nombre del usuario, email, números de cuenta, etc.
            
    - `P5 → P10 Capa IA`: envía prompt + contexto de categorías.
        
3. **Llamada al proveedor IA**
    
    - `P10 → E3`: request de clasificación.
        
    - `E3 → P10`: categoría propuesta + confianza.
        
4. **Actualización de movimiento**
    
    - `P10 → P5`: resultado empaquetado.
        
    - `P5 → D3`: actualiza campos `categoria_id` y `confianza_ia`.
        
    - `P5 → D8`: registra metadatos de IA (prompt/respuesta truncados/anonimizados).
        
5. **Corrección manual por el usuario**
    
    - `E1 → Frontend → API P5 /movements/{id}/categoria (PUT)`.
        
    - `P5 → D3`: actualiza categoría final y marca que fue corregida.
        
    - `P5 → D8`: guarda corrección para análisis futuro (mejora del modelo).
        

---

### 5.6 P6 – Motor IA de Resúmenes y Coach Financiero

Genera resúmenes mensuales, mensajes y tips.

1. **Generación del resumen mensual (job programado)**
    
    - `Scheduler → P6`: una vez al mes.
        
    - `P6 → D3`: obtiene movimientos del mes por usuario.
        
    - `P6 → D4/D5`: categorías y presupuestos asociados.
        
    - `P6`: calcula agregados (total ingresos, total gastos, top categoría, variación vs mes anterior, etc.).
        
    - `P6`: arma contexto **agregado y anonimizado** (solo cifras, categorías, tendencias).
        
    - `P6 → P10 → E3`: envía prompt para redactar resumen y consejos.
        
    - `E3 → P10 → P6`: devuelve texto en lenguaje natural.
        
    - `P6 → D7`: guarda resumen + tips por usuario/mes.
        
    - `P6 → D6`: genera alerta “resumen_mensual_disponible”.
        
    - (Opcional) `P6 → P8`: dispara notificación por email.
        
2. **Consulta del resumen desde la app**
    
    - `Frontend → API P6 /resumen/mensual?mes=YYYY-MM`
        
    - `P6 → D7`: lee resumen/textos coach.
        
    - `P6 → Frontend`: devuelve texto listo para mostrar.
        
3. **Mensajes cortos en la pantalla principal**
    
    - `Frontend → API P6 /coach/mensaje-home`
        
    - `P6 → D3/D4/D5`: consulta datos recientes.
        
    - `P6`: puede reutilizar resumen o generar un mini insight.
        
    - Si usa IA:
        
        - `P6 → P10 → E3`: prompt con datos agregados.
            
        - `E3 → P10 → P6`: texto corto.
            
    - `P6 → Frontend`: mensaje para el home.
        

---

### 5.7 P7 – Metas, Presupuestos y Alertas

Flujos para metas de ahorro y topes por categoría.

1. **Creación de meta o presupuesto**
    
    - `E1 → Frontend`: define nombre, monto objetivo, fecha opcional / categoría + tope.
        
    - `Frontend → API P7 /metas` o `/presupuestos`.
        
    - `P7 → D5`: inserta configuración.
        
2. **Cálculo de avance de metas**
    
    - `Frontend → API P7 /metas` (listado).
        
    - `P7 → D3`: suma movimientos etiquetados como aporte a la meta.
        
    - `P7 → D5`: combina con objetivo.
        
    - `P7 → Frontend`: porcentaje de avance + montos.
        
3. **Monitoreo de presupuestos y generación de alertas**
    
    - Job diario/semanal:
        
        - `Scheduler → P7`.
            
        - `P7 → D3`: suma gastos por categoría/periodo.
            
        - `P7 → D5`: compara contra topes.
            
        - Al superar umbrales (80%, 100%):
            
            - `P7 → D6`: registra alerta.
                
            - `P7 → P8`: dispara notificación in-app / email.
                
            - `P7 → D8`: registra evento de alerta.
                

---

### 5.8 P8 – Gestión de Notificaciones (In-App / Email)

**Objetivo:** entregar al usuario alertas internas y por correo.

1. **Notificaciones in-app**
    
    - Cualquier proceso (P6, P7, etc.) puede:
        
        - `P? → D6`: insertar notificación (tipo, mensaje, leída=false).
            
    - `Frontend → API P8 /notificaciones`
        
    - `P8 → D6`: devuelve lista de notificaciones pendientes.
        
    - **Marcar como leída:**
        
        - `Frontend → API P8 /notificaciones/{id}/leer`.
            
        - `P8 → D6`: actualiza estado.
            
2. **Notificaciones por email**
    
    - Cuando usuario tenga activadas notificaciones:
        
        - Proceso generador (P6, P7) envía mensaje a `P8`.
            
        - `P8 → D1`: obtiene email del usuario.
            
        - `P8 → E4 Servicio correo`: envía email (resumen mensual, alerta presupuesto, etc.).
            
        - `P8 → D8`: registra evento de envío (estado éxito/error).
            

---

### 5.9 P9 – Métricas, Logs y Auditoría

**Objetivo:** entender uso del producto y auditoría de cambios.

En casi todos los procesos:

- `P? → D8`: se registra un evento mínimo:
    
    - Tipo (movimiento_creado, login, resumen_leído, categoría_corregida, etc.).
        
    - `usuario_id` (o pseudónimo).
        
    - Timestamp.
        
    - Metadata no sensible (ej: categoría afectada, tipo de acción).
        
- Opcional:
    
    - `P? → E5`: envío de eventos a sistema de analítica (Posthog/GA/etc.).
        

Para auditoría específica de datos financieros:

- Cambios en movimientos (P4):
    
    - Valores antes y después (monto, fecha, cuenta, categoría).
        
- Cambios en configuración (metas/presupuestos P7).
    

---

### 5.10 P10 – Capa de Abstracción de IA

**Objetivo:** desacoplar la lógica de negocio del proveedor de IA.

- **Entrada** desde P5 y P6:
    
    - Estructuras internas (objetos de dominio): `MovimientoParaClasificacion`, `ContextoResumenMensual`, etc.
        
- **P10**:
    
    - Mapea estos objetos a prompts y payloads del proveedor actual (OpenAI, Gemini, modelo local, etc.).
        
    - Sanitiza datos (borra campos marcados como sensibles).
        
    - Maneja errores (timeouts, límites, costos).
        
- **Salida** hacia P5/P6:
    
    - Respuestas normalizadas: categoría sugerida, textos de resumen, consejos, etc.
        

---

## 6. Consideraciones de Privacidad y Seguridad de Datos

- **No enviar datos sensibles a IA**:
    
    - Los prompts incluyen solo datos **agregados** o **anonimizados**:
        
        - Montos, fechas, categorías, patrones, pero nunca:
            
            - Nombre del usuario.
                
            - Email.
                
            - Números de cuenta o identificadores de billeteras.
                
    - Se aplican rutinas de “sanitización” antes de llamar a P10.
        
- **Protección de credenciales**:
    
    - Contraseñas siempre almacenadas con `hash + salt`.
        
    - Tokens de sesión con expiración y revocación (logout y expiración por inactividad).
        
- **Eliminación de cuenta y datos**:
    
    - Proceso de eliminación marca registros y luego los purga o anonimiza según política.
        

---

## 7. Relación con el Backlog

- Épicas **A, C, D, H, I, M** definen la mayoría de flujos transaccionales principales (auth, cuentas, movimientos, navegación, seguridad, arquitectura).
    
- Épicas **E, F, G** se reflejan directamente en los procesos **P5, P6 y P7** (IA de clasificación, resúmenes, metas/presupuestos/alertas).
    
- Épicas **K y L** se apoyan en **P9** (métricas) y la futura diferenciación de funcionalidades (free/premium) sobre los mismos flujos.