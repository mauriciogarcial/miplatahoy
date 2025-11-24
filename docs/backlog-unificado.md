# Product Backlog Unificado - MiPlataHoy MVP

## Resumen Ejecutivo

Este documento consolida y expande las historias de usuario de tres fuentes diferentes, organizadas en **13 Épicas** que cubren el alcance completo del MVP de MiPlataHoy.

---

## Épica A – Autenticación y Gestión de Usuario

### HU-A1: Registro con Email y Contraseña

**Prioridad:** Alta

**Como** usuario nuevo,  
**Quiero** registrarme con mi correo y una contraseña,  
**Para** crear mi cuenta y empezar a usar MiPlataHoy.

**Criterios de Aceptación:**
1. **Dado que** estoy en la pantalla inicial, **cuando** elijo "Crear cuenta" e ingreso un email válido y una contraseña con complejidad mínima (8+ caracteres, al menos 1 número), **entonces** se crea una nueva cuenta de usuario.
2. **Dado que** ingreso un correo ya registrado, **cuando** intento crear la cuenta, **entonces** la app muestra un mensaje claro indicando que el correo ya existe.
3. **Dado que** ingreso una contraseña que no cumple las reglas de seguridad, **cuando** intento registrarme, **entonces** se bloquea el registro y se muestran las reglas de contraseña claramente.
4. **Dado que** mi registro fue exitoso, **cuando** se complete el proceso, **entonces** quedo autenticado y la app me lleva al onboarding inicial.
5. **Dado que** me registro exitosamente, **cuando** se crea la cuenta, **entonces** el sistema envía un correo de confirmación.

**Notas Técnicas:**
- Las contraseñas nunca se almacenan en texto plano (hash + salt)
- Implementar rate limiting para prevenir ataques de fuerza bruta

---

### HU-A2: Inicio de Sesión con Email y Contraseña

**Prioridad:** Alta

**Como** usuario registrado,  
**Quiero** iniciar sesión con mi correo y contraseña,  
**Para** acceder de forma segura a mi información financiera.

**Criterios de Aceptación:**
1. **Dado que** ya tengo una cuenta, **cuando** ingreso mi correo y contraseña correctos, **entonces** la app me autentica y me lleva a la pantalla principal con mi saldo.
2. **Dado que** ingreso credenciales incorrectas, **cuando** intento iniciar sesión, **entonces** la app me muestra un mensaje de error genérico sin revelar cuál de los datos falló.
3. **Dado que** cierro sesión, **cuando** vuelvo a abrir la app, **entonces** se me solicita nuevamente autenticación antes de mostrar cualquier dato financiero.
4. **Dado que** se pierde la sesión por inactividad o expiración de token, **cuando** intento acceder a una sección protegida, **entonces** la app me redirige a la pantalla de login.
5. **Dado que** no tengo conexión a internet, **cuando** intento iniciar sesión, **entonces** el sistema muestra un mensaje indicando el problema de conectividad.

---

### HU-A3: Inicio de Sesión con Google (OAuth)

**Prioridad:** Media

**Como** usuario que prefiere usar sus cuentas existentes,  
**Quiero** poder iniciar sesión con mi cuenta de Google,  
**Para** registrarme y acceder más rápido sin crear otra contraseña.

**Criterios de Aceptación:**
1. **Dado que** estoy en la pantalla de login, **cuando** selecciono "Continuar con Google", **entonces** se abre el flujo estándar de autenticación de Google.
2. **Dado que** autorizo a MiPlataHoy en Google, **cuando** finaliza el flujo, **entonces** se crea una cuenta nueva automáticamente (si no existía) con datos del perfil de Google y quedo autenticado.
3. **Dado que** ya tengo una cuenta asociada al mismo correo, **cuando** ingreso con Google, **entonces** mi sesión se asocia al mismo usuario sin duplicar cuentas.
4. **Dado que** cancelo el flujo de Google, **cuando** regreso a la app, **entonces** sigo en la pantalla de login sin cambios en mi cuenta.
5. **Dado que** ingreso con Google, **entonces** el sistema no solicita datos adicionales (nombre, correo) ya que los toma del token de Google.

---

### HU-A4: Cierre de Sesión Seguro

**Prioridad:** Alta

**Como** usuario,  
**Quiero** poder cerrar sesión de forma segura,  
**Para** proteger mi información si uso un dispositivo compartido.

**Criterios de Aceptación:**
1. **Dado que** estoy logueado, **cuando** selecciono "Cerrar sesión", **entonces** mi sesión termina y debo autenticarme nuevamente para entrar.
2. **Dado que** cierro sesión, **cuando** vuelvo a la app, **entonces** no puedo ver mi información sin autenticarme.
3. **Dado que** mi sesión expira por inactividad, **cuando** intento realizar una acción, **entonces** soy redirigido al login con un mensaje explicativo.
4. **Dado que** quiero mayor seguridad, **cuando** busco la opción, **entonces** puedo cerrar sesión en todos los dispositivos.

---

## Épica B – Onboarding y Primera Experiencia

### HU-B1: Onboarding Guiado (Máximo 3 Pasos)

**Prioridad:** Alta

**Como** usuario nuevo,  
**Quiero** un onboarding corto de máximo tres pasos,  
**Para** entender rápidamente cómo usar MiPlataHoy sin sentirme abrumado.

**Criterios de Aceptación:**
1. **Dado que** es la primera vez que ingreso, **cuando** me autentico, **entonces** se muestran de 1 a 3 pantallas explicando brevemente el saldo total, el registro de movimientos y el coach IA.
2. **Dado que** estoy en el onboarding, **cuando** decido omitirlo, **entonces** la app me permite saltarlo y me lleva a la pantalla principal.
3. **Dado que** termino el onboarding, **cuando** completo la última pantalla, **entonces** se registra que ya lo vi y no se vuelve a mostrar automáticamente.
4. **Dado que** ya he usado la app antes, **cuando** ingreso de nuevo, **entonces** no se muestra el onboarding completo, pero sí puedo acceder a él desde una sección de ayuda si lo deseo.
5. **Dado que** estoy en el onboarding, **entonces** debo ver un indicador de progreso (Paso 1 de 3).

---

### HU-B2: Ver Ejemplo con Datos Ficticios (Modo Demo)

**Prioridad:** Media

**Como** usuario nuevo,  
**Quiero** ver un ejemplo con datos ficticios,  
**Para** entender cómo se ve MiPlataHoy con movimientos reales sin comprometer mis propios datos.

**Criterios de Aceptación:**
1. **Dado que** soy usuario nuevo, **cuando** termine el onboarding, **entonces** se me ofrece la opción de ver un ejemplo con datos ficticios.
2. **Dado que** acepto ver el ejemplo, **cuando** se activa el modo demo, **entonces** se muestran movimientos de ejemplo, saldo total simulado y un resumen ficticio claramente marcados como "ejemplo".
3. **Dado que** ya entendí el ejemplo, **cuando** salgo del modo demo, **entonces** los datos ficticios desaparecen y se me invita a registrar mi primer movimiento real o configurar mi saldo inicial.
4. **Dado que** estoy en modo demo, **cuando** intento registrar un movimiento, **entonces** la app aclara que ese registro no afectará mi saldo real.
5. **Dado que** completo el tutorial, **entonces** la app debe quedar "limpia" lista para mi primer registro real.

---

## Épica C – Saldo Total y Gestión de Cuentas/Bolsillos

### HU-C1: Ver Saldo Total Grande en la Pantalla Principal

**Prioridad:** Alta (Core)

**Como** usuario de MiPlataHoy,  
**Quiero** ver un único valor grande con "mi plata hoy",  
**Para** entender de inmediato cuánto tengo disponible sin navegar por múltiples pantallas.

**Criterios de Aceptación:**
1. **Dado que** estoy autenticado y tengo al menos una cuenta configurada, **cuando** abro la app, **entonces** se muestra un valor grande en COP que representa el total de efectivo, cuentas bancarias y billeteras digitales.
2. **Dado que** tengo varias cuentas, **cuando** se calcula el total, **entonces** se suman todas las cuentas marcadas como activas para el cálculo del saldo general.
3. **Dado que** no tengo movimientos ni cuentas registradas, **cuando** abro la app, **entonces** se muestra un saldo inicial de $0 COP o un mensaje que invite a registrar la primera cuenta/movimiento.
4. **Dado que** hay un error de conexión, **cuando** no se pueda obtener el saldo actualizado, **entonces** se muestra un mensaje de error o estado "actualizando" y no se presentan valores inconsistentes.
5. **Dado que** mi saldo es negativo, **cuando** veo la pantalla principal, **entonces** el número se muestra en un color distintivo (ej: rojo) indicando deuda.
6. **Dado que** el valor debe mostrarse, **entonces** se presenta en formato de moneda COP (Pesos Colombianos) con separadores de miles.

---

### HU-C2: Ver Detalle por Cuenta desde el Saldo Total

**Prioridad:** Alta

**Como** usuario,  
**Quiero** poder ver el detalle de cada cuenta o "bolsillo" que compone mi saldo total,  
**Para** entender mejor en dónde está mi dinero.

**Criterios de Aceptación:**
1. **Dado que** veo mi saldo total, **cuando** toco una opción de "detalle" o el saldo mismo, **entonces** se muestra una lista de cuentas/billeteras con su saldo individual.
2. **Dado que** tengo diferentes tipos de cuentas (efectivo, cuentas de ahorros, Nequi, Daviplata, otras), **cuando** entro al detalle, **entonces** cada cuenta se identifica con tipo, nombre e ícono distintivo.
3. **Dado que** solo se maneja moneda COP, **cuando** se muestran los saldos, **entonces** todos los valores se presentan en COP sin conversión de moneda.
4. **Dado que** modifico el saldo de una cuenta mediante movimientos, **cuando** regreso al detalle, **entonces** el saldo por cuenta se actualiza acorde a los movimientos registrados.

---

### HU-C3: Registrar Diferentes Tipos de "Bolsillos"

**Prioridad:** Alta

**Como** usuario,  
**Quiero** registrar diferentes tipos de bolsillos (efectivo, cuentas de ahorros, billeteras digitales),  
**Para** reflejar mi realidad financiera dentro de MiPlataHoy.

**Criterios de Aceptación:**
1. **Dado que** estoy en la sección de cuentas, **cuando** creo un nuevo bolsillo, **entonces** puedo elegir el tipo entre opciones predefinidas: Efectivo, Cuenta bancaria (ahorros/corriente), Nequi, Daviplata, Billetera digital, Otro.
2. **Dado que** creo un bolsillo nuevo, **cuando** ingreso nombre y saldo inicial y lo guardo, **entonces** se incluye en el cálculo del saldo total automáticamente.
3. **Dado que** quiero editar un bolsillo, **cuando** cambio su nombre, tipo o hago un ajuste manual de saldo, **entonces** la información se actualiza y el saldo histórico se mantiene.
4. **Dado que** se eliminan bolsillos, **cuando** un bolsillo con movimientos se intenta borrar, **entonces** la app solicita confirmación e indica el impacto (ej. reasignar o eliminar movimientos asociados).
5. **Dado que** tengo múltiples cuentas, **entonces** la suma de estos saldos debe actualizar inmediatamente el "Saldo Total" del Home.

---

## Épica D – Registro y Gestión de Movimientos

### HU-D1: Registro Rápido de Movimiento desde el Valor Central

**Prioridad:** Alta (Core)

**Como** usuario,  
**Quiero** registrar un gasto o ingreso tocando el valor central del saldo,  
**Para** agregar movimientos con el menor número de pasos posibles.

**Criterios de Aceptación:**
1. **Dado que** estoy en la pantalla principal, **cuando** toco el valor del saldo total, **entonces** se abre un flujo guiado de registro de movimiento con el cursor listo en el campo "Monto".
2. **Dado que** inicio el flujo, **cuando** selecciono si es **Ingreso** o **Gasto**, **entonces** la app muestra los campos mínimos requeridos (monto, cuenta, fecha).
3. **Dado que** ingreso un monto válido y selecciono la cuenta y la fecha, **cuando** confirmo el movimiento, **entonces** este se guarda y el saldo total se actualiza inmediatamente.
4. **Dado que** el campo monto está vacío, es cero o negativo, **cuando** intento guardar, **entonces** el sistema valida y muestra un mensaje de error evitando que se registre el movimiento.
5. **Dado que** hay pérdida de conexión al momento de guardar, **cuando** falla el registro, **entonces** la app informa del error claramente y evita mostrar un saldo desactualizado.
6. **Dado que** ingreso caracteres no numéricos en el campo monto, **cuando** escribo, **entonces** el campo solo acepta números y separadores decimales válidos.

---

### HU-D2: Campos Opcionales en el Registro

**Prioridad:** Media

**Como** usuario,  
**Quiero** poder agregar descripción, etiquetas o notas a mis movimientos de forma opcional,  
**Para** tener más contexto sin que sea obligatorio en cada registro.

**Criterios de Aceptación:**
1. **Dado que** estoy registrando un movimiento, **cuando** llego a los campos opcionales, **entonces** puedo agregar una descripción breve en texto libre.
2. **Dado que** agrego descripción, **cuando** guardo el movimiento, **entonces** la IA utiliza este texto para sugerir la categoría.
3. **Dado que** no agrego campos opcionales, **cuando** guardo el movimiento, **entonces** el registro se completa exitosamente solo con los campos obligatorios.
4. **Dado que** quiero agregar etiquetas, **cuando** escribo una etiqueta, **entonces** el sistema sugiere etiquetas previamente usadas.

---

### HU-D3: Registrar Movimientos Recurrentes

**Prioridad:** Alta

**Como** usuario,  
**Quiero** marcar un movimiento como recurrente,  
**Para** que MiPlataHoy tenga en cuenta pagos o ingresos periódicos dentro de mi presupuesto automático.

**Criterios de Aceptación:**
1. **Dado que** estoy registrando un movimiento, **cuando** marco la opción "recurrente" o activo el switch "¿Es recurrente?", **entonces** puedo elegir un periodo (mensual, quincenal, semanal).
2. **Dado que** guardo un movimiento recurrente, **cuando** llega su fecha de recurrencia, **entonces** la app genera automáticamente el nuevo movimiento o me notifica para confirmar (según configuración de UX).
3. **Dado que** edito un movimiento recurrente, **cuando** cambio valor o periodo, **entonces** la recurrencia futura se actualiza según la nueva configuración.
4. **Dado que** decido cancelar una recurrencia, **cuando** desactivo la opción recurrente, **entonces** los movimientos futuros dejan de generarse, sin borrar los movimientos ya registrados.

---

### HU-D4: Adjuntar Imágenes y Archivos a Movimientos

**Prioridad:** Media

**Como** usuario,  
**Quiero** poder adjuntar imágenes o archivos (facturas, recibos) a un movimiento,  
**Para** tener soporte visual de mis gastos e ingresos.

**Criterios de Aceptación:**
1. **Dado que** estoy registrando o editando un movimiento, **cuando** selecciono adjuntar archivo o el ícono de cámara, **entonces** puedo tomar una foto, seleccionar de galería o cargar un archivo permitido.
2. **Dado que** el archivo excede el tamaño máximo soportado o el formato no es válido, **cuando** intento adjuntarlo, **entonces** la app muestra un mensaje de error claro.
3. **Dado que** un movimiento tiene adjuntos, **cuando** consulto su detalle, **entonces** se listan las imágenes/archivos con opción de visualizarlos.
4. **Dado que** elimino un movimiento, **cuando** confirmo su eliminación, **entonces** los adjuntos asociados también dejan de estar disponibles para el usuario.
5. **Dado que** subo una imagen de recibo, **cuando** la IA la procesa, **entonces** intenta extraer el monto y descripción para prellenar campos.

---

### HU-D5: Editar y Borrar Movimientos con Historial de Cambios

**Prioridad:** Alta

**Como** usuario,  
**Quiero** poder editar o borrar movimientos y mantener un historial de cambios,  
**Para** corregir errores sin perder trazabilidad.

**Criterios de Aceptación:**
1. **Dado que** consulto la lista de movimientos, **cuando** selecciono uno, **entonces** puedo acceder a opciones de editar y borrar.
2. **Dado que** edito un movimiento (monto, fecha, cuenta, tipo, categoría, descripción), **cuando** guardo los cambios, **entonces** el saldo total se recalcula y se almacena un registro de la modificación (campo modificado, valor anterior, valor nuevo, fecha del cambio).
3. **Dado que** borro un movimiento, **cuando** confirmo la eliminación, **entonces** este deja de aparecer en listados, resúmenes y cálculos de saldo, pero queda registro en logs de auditoría.
4. **Dado que** existe historial de cambios, **cuando** accedo al detalle avanzado de un movimiento, **entonces** puedo ver quién y cuándo lo modificó.

---

### HU-D6: Selección de Cuenta para el Movimiento

**Prioridad:** Alta

**Como** usuario con múltiples cuentas,  
**Quiero** seleccionar de qué cuenta sale o entra el dinero al registrar un movimiento,  
**Para** mantener el balance correcto en cada bolsillo.

**Criterios de Aceptación:**
1. **Dado que** tengo más de una cuenta configurada, **cuando** registro un movimiento, **entonces** debo seleccionar la cuenta afectada.
2. **Dado que** tengo solo una cuenta, **cuando** registro un movimiento, **entonces** la cuenta se selecciona automáticamente.
3. **Dado que** selecciono una cuenta, **cuando** guardo el movimiento, **entonces** solo el saldo de esa cuenta se actualiza (y el total general).

---

### HU-D7: Registro de Fecha del Movimiento

**Prioridad:** Media

**Como** usuario,  
**Quiero** que la fecha del movimiento se tome automáticamente o poder modificarla,  
**Para** registrar gastos de días anteriores sin perder precisión.

**Criterios de Aceptación:**
1. **Dado que** registro un movimiento, **cuando** no especifico fecha, **entonces** el sistema asigna la fecha y hora actual.
2. **Dado que** quiero registrar un gasto de ayer, **cuando** selecciono cambiar la fecha, **entonces** puedo elegir una fecha anterior mediante selector de fecha.
3. **Dado que** selecciono una fecha futura, **cuando** intento guardar, **entonces** el sistema muestra una advertencia preguntando si es correcto.

---

## Épica E – IA para Clasificación Automática de Movimientos

### HU-E1: Categorización Automática de Movimientos por IA

**Prioridad:** Alta

**Como** usuario,  
**Quiero** que la app clasifique automáticamente mis movimientos en categorías,  
**Para** evitar tener que clasificarlos manualmente todo el tiempo.

**Criterios de Aceptación:**
1. **Dado que** registro un movimiento con descripción, monto y fecha, **cuando** se guarda, **entonces** la IA sugiere una categoría de ingreso o gasto basándose en esa información (y, si existe, en adjuntos).
2. **Dado que** el sistema tiene un conjunto inicial de categorías configuradas, **cuando** se clasifica un movimiento, **entonces** la categoría sugerida pertenece a ese conjunto (Alimentación, Transporte, Deudas, Ocio, etc.).
3. **Dado que** la IA no puede inferir una categoría con confianza mínima, **cuando** esto ocurra, **entonces** el movimiento queda como "Sin categorizar" o "Por clasificar" para revisión manual.
4. **Dado que** hay error con el servicio de IA, **cuando** el modelo no responda, **entonces** el movimiento se guarda sin categoría y la app invita al usuario a categorizar manualmente.
5. **Dado que** las categorías tienen estructura, **cuando** la IA clasifica, **entonces** asigna hasta dos niveles de categorización (ej: Gastos > Alimentación > Restaurantes).

**Notas Técnicas:**
- El prompt enviado a la IA no debe contener datos personales (Nombre, ID, email, números de cuenta) del usuario.

---

### HU-E2: Corregir Categoría Sugerida por IA con Aprendizaje

**Prioridad:** Alta

**Como** usuario,  
**Quiero** poder corregir la categoría sugerida por la IA,  
**Para** que el sistema aprenda de mis decisiones y mejore futuras clasificaciones.

**Criterios de Aceptación:**
1. **Dado que** un movimiento tiene una categoría sugerida por IA, **cuando** no estoy de acuerdo, **entonces** puedo cambiarla manualmente por otra categoría disponible.
2. **Dado que** corrijo una categoría, **cuando** guardo el cambio, **entonces** el movimiento queda con la nueva categoría y se registra la corrección para entrenar o ajustar el modelo.
3. **Dado que** realizo múltiples correcciones similares, **cuando** se acumulen suficientes ejemplos, **entonces** la IA aumenta su tasa de acierto en movimientos con patrones parecidos (fine-tuning o context learning).
4. **Dado que** el usuario no desea que la app aprenda de un movimiento específico, **cuando** se defina tal opción (si aplica), **entonces** ese ejemplo no se usará para ajustar el comportamiento de la IA.
5. **Dado que** corrijo una categoría, **cuando** guardo el cambio, **entonces** el sistema me confirma que "aprenderá" de esta corrección.

---

### HU-E3: Definir Estructura Inicial de Categorías

**Prioridad:** Media

**Como** usuario,  
**Quiero** que la app maneje una estructura clara de categorías de ingresos y gastos,  
**Para** entender en qué se me va la plata.

**Criterios de Aceptación:**
1. **Dado que** se diseña la app, **cuando** se configuran las categorías, **entonces** se dispone al menos de un nivel de categorías básicas (Alimentación, Transporte, Deudas, Ocio, Vivienda, Salud, Educación, etc.).
2. **Dado que** se usa la app en el día a día, **cuando** visualizo reportes o resúmenes, **entonces** se agrupan los movimientos según esa estructura de categorías.
3. **Dado que** se considere soportar más niveles (subcategorías), **cuando** se habiliten, **entonces** la IA y el usuario pueden asignar movimientos a nivel principal o secundario.
4. **Dado que** no se ha definido aún la profundidad definitiva, **cuando** se vaya a implementar, **entonces** se documenta claramente la decisión y su impacto en la interfaz.

---

### HU-E4: Clasificación con Imagen de Recibo

**Prioridad:** Media

**Como** usuario,  
**Quiero** que la IA analice la imagen de un recibo o factura,  
**Para** clasificar el gasto automáticamente según el contenido visual.

**Criterios de Aceptación:**
1. **Dado que** subo una imagen de recibo, **cuando** la IA la procesa, **entonces** extrae información relevante (comercio, monto, fecha si es visible).
2. **Dado que** la IA identifica el comercio, **cuando** sugiere categoría, **entonces** usa el tipo de comercio para una clasificación más precisa.
3. **Dado que** el recibo es de un comercio conocido, **cuando** se clasifica, **entonces** la categoría es consistente con movimientos anteriores del mismo comercio.
4. **Dado que** la imagen no es legible, **cuando** falla la extracción, **entonces** el sistema notifica y permite ingresar los datos manualmente.

---

## Épica F – Resúmenes y Coach Financiero con IA

### HU-F1: Recibir Resumen Mensual en Lenguaje Natural

**Prioridad:** Alta

**Como** usuario,  
**Quiero** recibir un resumen mensual claro y corto de mis finanzas,  
**Para** entender cómo se movió mi dinero sin tener que analizar tablas complejas.

**Criterios de Aceptación:**
1. **Dado que** tengo movimientos registrados en un mes, **cuando** se cierre el periodo mensual, **entonces** la app genera un resumen en lenguaje natural que incluye: totales de ingresos/gastos, categoría con mayor gasto, cambio vs mes anterior.
2. **Dado que** se genera el resumen, **cuando** lo consulto, **entonces** puedo verlo desde la app en una sección de "resumen" o similar, escrito en tono cálido y directo.
3. **Dado que** no existen movimientos en un mes, **cuando** se intenta generar el resumen, **entonces** la app indica que no hay suficiente información para mostrar un análisis.
4. **Dado que** se use IA para redactar el resumen, **cuando** se envíen datos al modelo, **entonces** no se incluirán datos personales sensibles (nombre, correo, números de cuenta).
5. **Dado que** accedo a la app al inicio de mes, **cuando** hay resumen disponible, **entonces** veo una notificación para leerlo.
6. **Dado que** quiero ver resúmenes anteriores, **cuando** accedo al historial, **entonces** puedo consultar resúmenes de meses previos.

---

### HU-F2: Consejos Simples y Accionables

**Prioridad:** Alta

**Como** usuario,  
**Quiero** recibir consejos simples y accionables basados en mi comportamiento,  
**Para** tomar decisiones financieras más conscientes en el día a día.

**Criterios de Aceptación:**
1. **Dado que** se genera el resumen mensual, **cuando** lo abro, **entonces** la app incluye 1–3 recomendaciones concretas relacionadas con mis categorías de gasto más relevantes.
2. **Dado que** mi gasto en una categoría sube significativamente frente al mes anterior, **cuando** esto suceda, **entonces** el coach propone un tip concreto (ej. limitar cierto tipo de gasto, como "Podrías fijar un tope de $200.000 para comida fuera de casa").
3. **Dado que** tengo varios gastos recurrentes pequeños que suman un monto alto, **cuando** el sistema lo detecte, **entonces** el coach sugiere revisar o ajustar esos gastos.
4. **Dado que** el tono del coach debe ser cálido, **cuando** se muestren los mensajes, **entonces** el lenguaje utilizado es cercano, fácil de entender y no hace sentir juzgado al usuario.
5. **Dado que** los tips son contextuales, **cuando** mis patrones cambian, **entonces** los consejos se adaptan a mi nueva situación.

---

### HU-F3: Mensajes Cortos del Coach en la Pantalla Principal

**Prioridad:** Media

**Como** usuario,  
**Quiero** ver mensajes cortos del coach financiero en la pantalla principal,  
**Para** tener pequeños recordatorios o insights sin tener que abrir reportes detallados.

**Criterios de Aceptación:**
1. **Dado que** tengo actividad reciente, **cuando** abro la pantalla principal, **entonces** se muestra un mensaje corto encima o debajo del saldo (ej. "Esta semana gastaste más en X categoría" o "Vas bien con tus gastos de comida").
2. **Dado que** no quiero ver el mensaje en ese momento, **cuando** lo descarto, **entonces** desaparece hasta el siguiente evento relevante.
3. **Dado que** el mensaje se basa en mis datos, **cuando** he limitado el envío de datos al proveedor de IA, **entonces** se respetan las restricciones de privacidad sin exponer información sensible.
4. **Dado que** no hay datos suficientes para un insight, **cuando** esto ocurra, **entonces** el coach puede mostrar un mensaje genérico de bienvenida o invitación a registrar movimientos.
5. **Dado que** el mensaje es dinámico, **cuando** abro la app en diferentes momentos, **entonces** el mensaje puede variar según el contexto.

---

### HU-F4: Explicación de Conceptos Financieros

**Prioridad:** Baja

**Como** usuario poco familiarizado con finanzas,  
**Quiero** que la app me explique conceptos financieros en palabras sencillas,  
**Para** entender mejor mi situación y las recomendaciones del coach.

**Criterios de Aceptación:**
1. **Dado que** encuentro un término que no entiendo (ej. presupuesto, ahorro, gasto fijo), **cuando** lo toco o busco en la sección de educación financiera, **entonces** recibo una explicación simple y contextualizada.
2. **Dado que** la explicación se genera, **cuando** la leo, **entonces** usa ejemplos cotidianos y evita jerga técnica.
3. **Dado que** se usan LLMs para responder preguntas, **cuando** se haga, **entonces** solo se envía al modelo la pregunta del usuario y contexto general, sin datos financieros personales.
4. **Dado que** repito consultas similares, **cuando** la app las detecte, **entonces** puede mostrar respuestas predefinidas optimizadas para reducir consumo de IA.
5. **Dado que** el modelo puede fallar, **cuando** ocurra un error, **entonces** la app muestra un mensaje indicando que no se pudo responder en ese momento.

---

## Épica G – Metas, Presupuestos y Alertas

### HU-G1: Definir Metas Simples de Ahorro y Ver Avance

**Prioridad:** Media

**Como** usuario,  
**Quiero** definir metas simples de ahorro,  
**Para** seguir mi progreso y motivarme a guardar dinero.

**Criterios de Aceptación:**
1. **Dado que** estoy en la sección de metas, **cuando** creo una nueva meta, **entonces** puedo definir un nombre, un monto objetivo y una fecha estimada opcional.
2. **Dado que** tengo movimientos de tipo ahorro relacionados con una meta, **cuando** se registren, **entonces** el avance de la meta se actualiza automáticamente.
3. **Dado que** consulto una meta, **cuando** la veo, **entonces** se muestra al menos el porcentaje de avance y el monto ahorrado vs objetivo.
4. **Dado que** quiero cerrar una meta, **cuando** la marque como alcanzada o cancelada, **entonces** ya no se muestra en la lista activa pero queda disponible en un historial.
5. **Dado que** alcanzo la meta, **cuando** el monto ahorrado iguala o supera el objetivo, **entonces** recibo una notificación de felicitación.

---

### HU-G2: Definir Presupuestos/Topes por Categoría

**Prioridad:** Media

**Como** usuario,  
**Quiero** definir presupuestos máximos por categoría (ej. cenas, ocio),  
**Para** no excederme en mis gastos más importantes.

**Criterios de Aceptación:**
1. **Dado que** estoy en la sección de presupuestos, **cuando** creo un presupuesto, **entonces** puedo seleccionar una categoría y un monto máximo para un periodo (ej. mensual).
2. **Dado que** registro movimientos de una categoría con presupuesto, **cuando** los gastos se acumulen, **entonces** la app muestra la ejecución vs el presupuesto definido con barra de progreso visual.
3. **Dado que** excedo el presupuesto, **cuando** esto ocurra, **entonces** la app marca claramente que se sobrepasó el límite (barra en rojo) en reportes y/o alertas.
4. **Dado que** edito un presupuesto, **cuando** cambio el monto o periodo, **entonces** los cálculos futuros se basan en la nueva configuración (dejando claro cómo se afectan los periodos en curso).

---

### HU-G3: Alertas al Acercarse o Superar el Presupuesto

**Prioridad:** Media

**Como** usuario,  
**Quiero** recibir alertas cuando esté cerca de pasarme de un presupuesto o lo supere,  
**Para** corregir mi comportamiento a tiempo.

**Criterios de Aceptación:**
1. **Dado que** tengo un presupuesto configurado, **cuando** la ejecución alcance un umbral (ej. 80% del monto), **entonces** la app genera una alerta visible dentro de la aplicación (barra amarilla).
2. **Dado que** supero el 100% del presupuesto, **cuando** esto ocurra, **entonces** se genera una alerta adicional que puede mostrarse en la app y/o enviarse por correo según la configuración.
3. **Dado que** el usuario puede preferir menos notificaciones, **cuando** se definan las opciones, **entonces** podrá activar o desactivar alertas por correo.
4. **Dado que** la app necesita evitar spam, **cuando** se envían alertas, **entonces** se gestionan para no repetir el mismo aviso múltiples veces en un corto periodo.
5. **Dado que** leo una alerta, **cuando** la marco como vista, **entonces** desaparece del listado de pendientes.

---

### HU-G4: Sugerencia Automática de Metas por IA

**Prioridad:** Baja

**Como** usuario,  
**Quiero** que la IA me sugiera metas y presupuestos simples con base en mi historial,  
**Para** tener ideas de mejora sin tener que diseñarlas desde cero.

**Criterios de Aceptación:**
1. **Dado que** tengo suficiente historial de movimientos (al menos un mes), **cuando** consulte la sección de metas sugeridas, **entonces** la app puede mostrar propuestas de metas de ahorro o topes de gasto basados en patrones reales.
2. **Dado que** se muestra una meta sugerida, **cuando** la acepto, **entonces** esta se convierte en una meta real editable por mí.
3. **Dado que** no quiero una sugerencia específica, **cuando** la rechazo, **entonces** la app la descarta y puede dejar de mostrar sugerencias similares por un tiempo.
4. **Dado que** se envían datos a la IA para generar sugerencias, **cuando** esto ocurra, **entonces** solo se envían datos financieros agregados y anónimos, sin información personal identificable.

---

### HU-G5: Generación de Presupuesto Basado en Historial

**Prioridad:** Media

**Como** usuario,  
**Quiero** que la app construya un presupuesto automático basado en mis movimientos,  
**Para** tener una guía realista sin tener que crear presupuestos manualmente.

**Criterios de Aceptación:**
1. **Dado que** tengo al menos un mes de movimientos, **cuando** accedo a la sección de presupuesto, **entonces** veo un presupuesto sugerido por categoría que refleja mis patrones reales de gasto promedio.
2. **Dado que** tengo gastos recurrentes identificados, **cuando** se genera el presupuesto, **entonces** estos se incluyen como gastos fijos.
3. **Dado que** mis patrones cambian, **cuando** pasan varios meses, **entonces** el presupuesto sugerido se ajusta automáticamente.

---
### HU-G6: Notificaciones por Email

**Prioridad:** Baja

**Como** usuario,  
**Quiero** recibir notificaciones importantes por correo electrónico,  
**Para** estar informado incluso si no abro la app frecuentemente.

**Criterios de Aceptación:**
1. **Dado que** hay alertas de presupuesto, **cuando** se configuran notificaciones por email, **entonces** recibo un correo cuando supero el 80% de un tope.
2. **Dado que** se genera el resumen mensual, **cuando** tengo emails activados, **entonces** recibo el resumen en mi correo.
3. **Dado que** no quiero emails, **cuando** desactivo la opción en configuración, **entonces** no recibo correos de la app.

---

## Épica H – Navegación y Experiencia de Uso

### HU-H1: Pantalla Principal Minimalista

**Prioridad:** Alta

**Como** usuario,  
**Quiero** una pantalla principal minimalista con mi saldo, mensajes del coach y últimos movimientos,  
**Para** tener una vista clara sin menús complejos.

**Criterios de Aceptación:**
1. **Dado que** abro la app, **cuando** se carga la pantalla principal, **entonces** veo el saldo total grande, un mensaje breve del coach y una lista corta de últimos 5-10 movimientos.
2. **Dado que** la navegación debe ser simple, **cuando** necesito acceder a otras secciones (cuentas, metas, ayuda), **entonces** puedo hacerlo a través de un menú sencillo e intuitivo con máximo 5-6 opciones principales.
3. **Dado que** la app se usa principalmente desde el celular, **cuando** se visualice, **entonces** la pantalla principal se adapta correctamente a un diseño responsive.
4. **Dado que** hay más movimientos históricos, **cuando** veo la lista corta, **entonces** existe una opción clara "Ver todo" para ir al historial completo.

---

### HU-H2: Visualización de Últimos Movimientos

**Prioridad:** Alta

**Como** usuario,  
**Quiero** ver una lista corta de mis últimos movimientos en la pantalla principal,  
**Para** tener contexto rápido de mis transacciones recientes.

**Criterios de Aceptación:**
1. **Dado que** abro la app, **cuando** veo la pantalla principal, **entonces** aparece una lista de los últimos 5-10 movimientos ordenados por fecha.
2. **Dado que** veo un movimiento en la lista, **cuando** lo toco, **entonces** accedo a su detalle completo.
3. **Dado que** quiero ver más movimientos, **cuando** selecciono "Ver todo", **entonces** accedo al historial completo con filtros.
4. **Dado que** cada movimiento se muestra, **cuando** lo veo, **entonces** muestra: monto, tipo (ingreso/gasto indicado por color), categoría y fecha.

---

### HU-H3: Historial Completo con Filtros

**Prioridad:** Media

**Como** usuario,  
**Quiero** acceder a un historial completo de movimientos con opciones de filtrado,  
**Para** buscar y analizar transacciones específicas.

**Criterios de Aceptación:**
1. **Dado que** accedo al historial, **cuando** veo la lista, **entonces** están todos mis movimientos ordenados por fecha (más recientes primero).
2. **Dado que** quiero filtrar, **cuando** selecciono filtros, **entonces** puedo filtrar por: rango de fechas, categoría, cuenta, tipo (ingreso/gasto).
3. **Dado que** aplico filtros, **cuando** veo los resultados, **entonces** se muestra el total filtrado (suma de ingresos y gastos del filtro).
4. **Dado que** busco algo específico, **cuando** uso el buscador, **entonces** puedo buscar por descripción o etiquetas.

---

### HU-H4: Navegación Simple con Menú

**Prioridad:** Alta

**Como** usuario,  
**Quiero** una navegación simple y clara,  
**Para** acceder a todas las funciones sin confundirme.

**Criterios de Aceptación:**
1. **Dado que** estoy en cualquier pantalla, **cuando** busco el menú, **entonces** accedo a opciones claras: Inicio, Historial, Presupuesto, Configuración, Ayuda.
2. **Dado que** navego por la app, **cuando** quiero volver al inicio, **entonces** hay una forma clara de regresar a la pantalla principal.
3. **Dado que** uso el celular, **cuando** navego, **entonces** la experiencia es responsive y optimizada para móvil.
4. **Dado que** el menú es simple, **cuando** lo veo, **entonces** tiene máximo 5-6 opciones principales.

---

## Épica I – Seguridad, Privacidad y Datos Sensibles

### HU-I1: Proteger Datos Financieros mediante Autenticación

**Prioridad:** Alta

**Como** usuario,  
**Quiero** que mis datos financieros estén protegidos mediante autenticación segura,  
**Para** evitar accesos no autorizados.

**Criterios de Aceptación:**
1. **Dado que** no estoy autenticado, **cuando** intento acceder a pantallas con información financiera, **entonces** la app me obliga a iniciar sesión.
2. **Dado que** se almacenan credenciales, **cuando** lo haga el sistema, **entonces** las contraseñas no se guardan en texto plano (hash + salt verificado).
3. **Dado que** cierro sesión, **cuando** lo hago, **entonces** ningún dato financiero queda visible en la app hasta volver a autenticarse.
4. **Dado que** se defina un tiempo de inactividad, **cuando** se exceda, **entonces** la sesión caduca y se requiere login nuevamente.

---

### HU-I2: No Enviar Datos Sensibles a la IA

**Prioridad:** Alta

**Como** usuario,  
**Quiero** que mis datos personales sensibles nunca se envíen a los proveedores de IA,  
**Para** cuidar mi privacidad financiera.

**Criterios de Aceptación:**
1. **Dado que** se llama a un modelo de IA, **cuando** se construye el prompt, **entonces** no se incluyen nombre completo, correo, números de cuenta, datos de billeteras ni claves.
2. **Dado que** se necesiten datos para clasificar un movimiento, **cuando** se envíe la información, **entonces** esta se limita a descripción, monto, fecha y, opcionalmente, datos agregados no identificables.
3. **Dado que** se auditen los prompts, **cuando** se revisen, **entonces** se verifica que no contengan campos marcados como sensibles en la política de la app.
4. **Dado que** un usuario solicite información sobre su privacidad, **cuando** consulte la sección respectiva, **entonces** se explica qué datos se envían o no a la IA.
5. **Dado que** hay datos sensibles en descripciones de movimientos, **cuando** se procesan, **entonces** el sistema los sanitiza antes de enviar a la IA.

---

### HU-I3: Eliminación de Cuenta y Datos (GDPR/Habeas Data)

**Prioridad:** Media

**Como** usuario de MiPlataHoy,  
**Quiero** poder eliminar mi cuenta y todos mis datos financieros,  
**Para** ejercer mi derecho a la privacidad y borrar mi información de la plataforma.

**Criterios de Aceptación:**
1. **Dado que** estoy en la sección de configuración, **cuando** selecciono "Eliminar mi cuenta", **entonces** el sistema me pide doble confirmación explicando que la acción es irreversible.
2. **Dado que** confirmo la eliminación, **cuando** el proceso termina, **entonces** todos mis movimientos, cuentas, preferencias y datos personales son eliminados permanentemente (o anonimizados según política).
3. **Dado que** elimino mi cuenta, **cuando** intento iniciar sesión nuevamente, **entonces** el sistema no reconoce mis credenciales anteriores.
4. **Dado que** inicio el proceso de eliminación, **cuando** cancelo antes de confirmar, **entonces** mi cuenta permanece activa sin cambios.
5. **Dado que** se elimina la cuenta, **cuando** el proceso termina, **entonces** la sesión se cierra y se redirige al inicio.

**Notas Técnicas:**
- Implementar soft-delete inmediato y programar borrado físico de datos
- Documentar qué datos se conservan para auditoría y por cuánto tiempo

---

## Épica J – Soporte, Ayuda y Educación Financiera

### HU-J1: Centro de Ayuda y Preguntas Frecuentes

**Prioridad:** Media

**Como** usuario,  
**Quiero** acceder a una sección de ayuda y preguntas frecuentes,  
**Para** resolver dudas básicas sobre el uso de la app sin contactar soporte.

**Criterios de Aceptación:**
1. **Dado que** tengo dudas, **cuando** entro a la sección de ayuda, **entonces** veo un listado de preguntas frecuentes organizadas por tema sobre registro, movimientos, metas, seguridad, etc.
2. **Dado que** selecciono una pregunta, **cuando** la abro/expando, **entonces** se muestra una respuesta clara y breve.
3. **Dado que** la información puede cambiar, **cuando** el equipo actualice las FAQs, **entonces** los usuarios ven la versión más reciente sin necesidad de actualizar la app.
4. **Dado que** no encuentro respuesta a mi duda, **cuando** busco, **entonces** puedo usar un buscador dentro del FAQ o acceder a un formulario/enlace para pedir soporte adicional.

---

## Épica K – Métricas y Aprendizaje del Producto

### HU-K1: Registrar Eventos Clave de Uso

**Prioridad:** Alta

**Como** owner del producto,  
**Quiero** registrar eventos clave de uso (registros de gastos, uso de resúmenes, correcciones de IA),  
**Para** entender si el MVP está siendo adoptado y qué partes se usan más.

**Criterios de Aceptación:**
1. **Dado que** un usuario registra un gasto, **cuando** se complete la operación, **entonces** se genera un evento interno con timestamp que lo registre (sin datos personales).
2. **Dado que** un usuario abre el resumen mensual, **cuando** lo haga, **entonces** se registra un evento de uso de resumen.
3. **Dado que** un usuario corrige la categoría sugerida por IA, **cuando** lo haga, **entonces** el evento se registra con la información mínima necesaria para análisis de precisión del modelo.
4. **Dado que** el equipo consulte las métricas, **cuando** lo haga (a través de dashboards o consultas internas), **entonces** puede ver agregados como: número de gastos por día, uso de resúmenes y frecuencia de correcciones.

---

### HU-K2: Medir Adopción y Retención del MVP

**Prioridad:** Media

**Como** owner del producto,  
**Quiero** medir usuarios activos al mes y la persistencia de uso después de 2 semanas,  
**Para** evaluar el éxito del MVP.

**Criterios de Aceptación:**
1. **Dado que** los usuarios utilizan la app, **cuando** se definan las métricas, **entonces** se puede calcular el número de usuarios activos al mes (MAU).
2. **Dado que** quiero medir retención, **cuando** analice los datos, **entonces** puedo ver el % de usuarios que siguen usando la app después de 2 semanas de registrarse.
3. **Dado que** hay consultas frecuentes de ayuda, **cuando** se registren, **entonces** puedo ver el % de usuarios que han consultado la sección de ayuda o enviado feedback.
4. **Dado que** se respetan las leyes de privacidad, **cuando** se almacenen estas métricas, **entonces** los datos se guardan de forma agregada o anonimizados según se requiera.

---

## Épica L – Modelo de Negocio y Monetización

### HU-L1: Diferenciar Funcionalidades Gratis y Premium (Freemium)

**Prioridad:** Media

**Como** owner del producto,  
**Quiero** diferenciar funcionalidades gratuitas y premium,  
**Para** aplicar el modelo freemium sin afectar la promesa de simplicidad del MVP.

**Criterios de Aceptación:**
1. **Dado que** se definan funcionalidades "pro" (ej. más cuentas, más reportes, consejos avanzados), **cuando** un usuario gratuito intente usarlas, **entonces** la app muestra que pertenecen al plan premium con información clara.
2. **Dado que** un usuario está en plan gratuito, **cuando** use funcionalidades básicas del MVP, **entonces** no se le muestren anuncios invasivos ni se bloquee la experiencia principal.
3. **Dado que** un usuario actualiza a premium, **cuando** se complete el proceso, **entonces** las funcionalidades pro se habilitan sin perder sus datos anteriores.
4. **Dado que** el catálogo de funcionalidades pro puede cambiar, **cuando** el equipo lo ajuste, **entonces** la app puede actualizar esa información sin requerir cambios estructurales en la base de datos.

---

### HU-L2: Recoger Feedback de los Primeros Usuarios

**Prioridad:** Media

**Como** owner del producto,  
**Quiero** recoger feedback de los primeros usuarios (amigos, comunidades, talleres),  
**Para** mejorar el producto de forma temprana.

**Criterios de Aceptación:**
1. **Dado que** el usuario usa la app, **cuando** finaliza ciertas acciones clave (ej. resumen mensual), **entonces** puede recibir una invitación opcional a dejar feedback.
2. **Dado que** el usuario decide dejar feedback, **cuando** abra el formulario, **entonces** puede enviar comentarios y opcionalmente su correo de contacto.
3. **Dado que** se reciben múltiples feedbacks, **cuando** el equipo los revise, **entonces** puede exportarlos o verlos en una lista consolidada.
4. **Dado que** el usuario no quiere ser molestado, **cuando** rechace repetidamente las invitaciones, **entonces** la app deja de mostrarle recordatorios de feedback por un tiempo.

---

## Épica M – Arquitectura Técnica e IA (Historias Internas)

### HU-M1: Exponer API REST con FastAPI para el Frontend

**Prioridad:** Alta

**Como** equipo de desarrollo,  
**Quiero** exponer una API REST limpia en FastAPI,  
**Para** que el frontend (web responsive) pueda consumir los servicios de MiPlataHoy de forma desacoplada.

**Criterios de Aceptación:**
1. **Dado que** el frontend necesita datos, **cuando** llame a la API, **entonces** puede autenticarse, crear usuarios y manejar movimientos mediante endpoints documentados (OpenAPI/Swagger).
2. **Dado que** la API debe evolucionar, **cuando** se añadan nuevos endpoints, **entonces** se versionan adecuadamente sin romper clientes existentes.
3. **Dado que** se manejen errores, **cuando** ocurra un fallo, **entonces** la API devuelve códigos HTTP apropiados y mensajes de error consistentes en español.
4. **Dado que** se usan migraciones, **cuando** se desplieguen cambios, **entonces** la base de datos se actualiza de forma controlada.

---

### HU-M2: Registrar Logs, Auditoría y Metadatos de IA

**Prioridad:** Media

**Como** equipo de desarrollo,  
**Quiero** registrar logs, auditoría de cambios y metadatos de IA (prompts y respuestas),  
**Para** diagnosticar problemas y mejorar el modelo con el tiempo.

**Criterios de Aceptación:**
1. **Dado que** un usuario crea o edita movimientos, **cuando** esto suceda, **entonces** se registra quién realizó la acción, la fecha y los cambios realizados.
2. **Dado que** se llama al modelo de IA, **cuando** se haga, **entonces** se puede almacenar una versión truncada o anonimizada del prompt y de la respuesta asociada al movimiento (según las políticas internas).
3. **Dado que** haya problemas de clasificación, **cuando** el equipo revise los logs, **entonces** puede identificar patrones y oportunidades de mejora en el modelo o en las reglas.
4. **Dado que** se definan límites de retención, **cuando** se cumplan, **entonces** los logs se archivan o eliminan conforme a la política de datos.

---

### HU-M3: Diseñar Capa de Abstracción para Proveedor de IA

**Prioridad:** Media

**Como** equipo de desarrollo,  
**Quiero** una capa de abstracción para el proveedor de IA,  
**Para** poder usar OpenAI hoy y cambiar a otro proveedor o modelo open source en el futuro sin reescribir toda la lógica de negocio.

**Criterios de Aceptación:**
1. **Dado que** la app use IA para clasificación y resúmenes, **cuando** se implemente la lógica, **entonces** el código de negocio depende de interfaces internas y no directamente del SDK de un proveedor.
2. **Dado que** se quiera probar otro modelo, **cuando** se configure, **entonces** puede cambiarse el proveedor en un solo lugar (configuración/capa de IA) sin modificar múltiples servicios.
3. **Dado que** algunos modelos tienen diferentes formatos de entrada/salida, **cuando** se integren, **entonces** la capa de abstracción se encarga de adaptar las estructuras.
4. **Dado que** se monitoree el uso de tokens y costos, **cuando** el equipo revise la configuración, **entonces** puede obtener métricas de consumo por proveedor o modelo.

---

### HU-M4: Manejo de Errores y Mensajes Amigables

**Prioridad:** Alta

**Como** usuario,  
**Quiero** que los mensajes de error sean claros y en lenguaje sencillo,  
**Para** entender qué pasó y cómo solucionarlo sin frustrarme.

**Criterios de Aceptación:**
1. **Dado que** ocurre un error, **cuando** veo el mensaje, **entonces** está escrito en español claro, sin códigos técnicos.
2. **Dado que** el error tiene solución, **cuando** lo leo, **entonces** incluye una sugerencia de qué hacer (ej: "Intenta de nuevo" o "Revisa tu conexión").
3. **Dado que** es un error inesperado del sistema, **cuando** ocurre, **entonces** el mensaje ofrece disculpas y sugiere intentar más tarde.
4. **Dado que** el error persiste, **cuando** sigo teniendo problemas, **entonces** hay opción de reportar el problema o contactar soporte.

---

### HU-M5: Manejo de Pérdida de Conexión

**Prioridad:** Alta

**Como** usuario,  
**Quiero** que la app maneje adecuadamente la pérdida de conexión a internet,  
**Para** no perder información ni quedar bloqueado al usar la app.

**Criterios de Aceptación:**
1. **Dado que** pierdo conexión mientras registro un movimiento, **cuando** intento guardar, **entonces** el sistema muestra un mensaje claro indicando el problema de conectividad.
2. **Dado que** no hay conexión, **cuando** intento acciones que requieren internet, **entonces** el sistema indica qué funciones no están disponibles.
3. **Dado que** se recupera la conexión, **cuando** vuelvo a intentar la acción, **entonces** funciona normalmente sin necesidad de reiniciar la app.
4. **Dado que** estoy sin conexión, **cuando** la app lo detecta, **entonces** muestra un indicador visual permanente hasta que se restaure.

---

# Resumen del Backlog Unificado

| Épica | Nombre | Historias | Prioridad General |
|-------|--------|-----------|-------------------|
| A | Autenticación y Gestión de Usuario | 5 | Alta |
| B | Onboarding y Primera Experiencia | 2 | Alta |
| C | Saldo Total y Gestión de Cuentas | 3 | Alta |
| D | Registro y Gestión de Movimientos | 7 | Alta |
| E | IA para Clasificación Automática | 4 | Alta |
| F | Resúmenes y Coach Financiero con IA | 4 | Alta |
| G | Metas, Presupuestos y Alertas | 5 | Media |
| H | Navegación y Experiencia de Uso | 4 | Alta |
| I | Seguridad, Privacidad y Datos | 2 | Alta |
| J | Soporte, Ayuda y Educación | 1 | Media |
| K | Métricas y Aprendizaje del Producto | 2 | Media |
| L | Modelo de Negocio y Monetización | 2 | Media |
| M | Arquitectura Técnica e IA | 5 | Alta |
| N | Notificaciones por Email | 1 | Baja |

**Total de Historias de Usuario: 47**

---

# Preguntas Abiertas Consolidadas

## Funcionales
1. **Frecuencia de resúmenes**: ¿El MVP se limita a mensual o se desea soportar semanal y diario?
2. **Profundidad de categorías**: ¿1, 2 o multinivel? Recomendación: 2 niveles para MVP.
3. **Movimientos recurrentes**: ¿Se generan automáticamente o el usuario debe confirmar cada ocurrencia?
4. **Canales de notificación**: ¿Ambas (app y correo) en MVP o solo notificaciones internas?
5. **Alcance del modo demo**: ¿Puede ser reutilizado por usuarios existentes o solo nuevos?

## Técnicas
6. **Capa de abstracción de IA**: ¿Es requisito del MVP o consideración futura?
7. **Manejo offline**: ¿Se requiere funcionalidad offline o conexión constante es aceptable?
8. **Procesamiento de imágenes (OCR)**: ¿Es mandatorio para "Día 1"? Es costoso en tokens.

## Negocio
9. **Plan Premium**: ¿Qué funcionalidades serían premium? ¿Se define post-MVP?
10. **Moneda única (COP)**: ¿Mensaje para usuarios de otros países?
11. **Retención de datos tras eliminación**: ¿Qué se conserva anonimiza