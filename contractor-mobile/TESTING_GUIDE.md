# Guía de Pruebas - App Móvil de Gestión de Contratos

## Flujo de Pruebas Completo

### 1. Pruebas de Autenticación

#### Test 1.1: Login Exitoso
- [ ] Abrir la app
- [ ] Ingresar credenciales válidas (email y contraseña)
- [ ] Presionar "Iniciar sesión"
- [ ] Verificar que redirija a la pantalla principal (Contratos)
- [ ] Verificar que se carga el nombre del usuario

#### Test 1.2: Login Fallido
- [ ] Ingresar email incorrecto
- [ ] Ingresar contraseña incorrecta
- [ ] Verificar que se muestre mensaje de error
- [ ] Verificar que permanece en pantalla de login

#### Test 1.3: Logout
- [ ] En el perfil, presionar botón de cerrar sesión
- [ ] Verificar que regresa a pantalla de login
- [ ] Verificar que se limpian los datos de sesión

### 2. Pruebas de Pantalla de Contratos

#### Test 2.1: Carga de Contratos
- [ ] Desde la pestaña "Contratos" en el menú inferior
- [ ] Verificar que se carguen todos los contratos del usuario
- [ ] Verificar que se filtren los contratos finalizados
- [ ] Verificar que se muestre el contador correcto

#### Test 2.2: Información de Contrato
- [ ] Verificar que se muestren: número, entidad, objeto
- [ ] Verificar que se muestren: valor, fecha de fin
- [ ] Verificar que se muestre estado del contrato (Activo/Inactivo)
- [ ] Verificar que se muestre nombre del supervisor

#### Test 2.3: Indicador de Urgencia
- [ ] Identificar un contrato que vence en < 30 días
- [ ] Verificar que muestre tag "Vence pronto"
- [ ] Verificar que muestre número de días restantes
- [ ] Verificar que el color sea rojo/naranja

#### Test 2.4: Navegación a Actividades
- [ ] Presionar en un contrato
- [ ] Verificar redirección a ActividadesDetalleScreen
- [ ] Verificar que se muestre el número de contrato seleccionado
- [ ] Verificar que se carguen las actividades

#### Test 2.5: Pull-to-Refresh
- [ ] En la pantalla de contratos, deslizar hacia abajo
- [ ] Verificar que aparezca spinner de recarga
- [ ] Verificar que se actualicen los datos

### 3. Pruebas de Pantalla de Actividades

#### Test 3.1: Carga de Actividades
- [ ] Seleccionar un contrato
- [ ] Verificar que se carguen todas las actividades
- [ ] Verificar que se muestren en orden (por número)
- [ ] Verificar que se muestre resumen de estadísticas

#### Test 3.2: Información de Actividad
- [ ] Verificar número de actividad
- [ ] Verificar título y descripción
- [ ] Verificar estado (Activa/Completada/Sin iniciar/Baja)
- [ ] Verificar peso porcentual

#### Test 3.3: Evidencias por Actividad
- [ ] Seleccionar una actividad con evidencias
- [ ] Verificar que se muestren todas las evidencias
- [ ] Verificar nombre, tipo y fecha de cada evidencia
- [ ] Verificar ícono correspondiente al tipo

#### Test 3.4: Actividad sin Evidencias
- [ ] Seleccionar actividad sin evidencias registradas
- [ ] Verificar que muestre mensaje "Sin evidencias"
- [ ] Verificar que botón "Agregar evidencia" sea visible

#### Test 3.5: Resumen de Estadísticas
- [ ] Verificar contador de actividades completadas
- [ ] Verificar contador de actividades en progreso
- [ ] Verificar contador total de evidencias
- [ ] Verificar que los números sean correctos

### 4. Pruebas de Formulario de Evidencias

#### Test 4.1: Abrir Formulario
- [ ] Presionar botón "+" en una actividad
- [ ] Verificar que se abra modal de formulario
- [ ] Verificar que se muestre nombre de la actividad
- [ ] Verificar que haya 3 pestañas: Archivo, Enlace, Nota

#### Test 4.2: Registro de Archivo
- [ ] Presionar pestaña "Archivo"
- [ ] Presionar "Tomar Foto"
  - [ ] Verificar que se abra la cámara
  - [ ] Tomar una foto
  - [ ] Verificar que se suba correctamente
  - [ ] Verificar confirmación de éxito
- [ ] Repetir con "Desde Galería"
  - [ ] Verificar que se abra galería
  - [ ] Seleccionar imagen
  - [ ] Verificar que se suba correctamente
- [ ] Repetir con "Cargar Documento"
  - [ ] Seleccionar PDF o documento
  - [ ] Verificar que se suba correctamente

#### Test 4.3: Registro de Enlace
- [ ] Presionar pestaña "Enlace"
- [ ] Ingresar URL válida (ej: https://google.com)
- [ ] Ingresar título (opcional)
- [ ] Presionar "Agregar Enlace"
- [ ] Verificar confirmación de éxito
- [ ] Verificar que aparezca en lista de evidencias

#### Test 4.4: Registro de Nota
- [ ] Presionar pestaña "Nota"
- [ ] Ingresar título (opcional)
- [ ] Ingresar contenido de la nota
- [ ] Presionar "Guardar Nota"
- [ ] Verificar confirmación de éxito
- [ ] Verificar que aparezca en lista de evidencias

#### Test 4.5: Validación de Formulario
- [ ] Intentar guardar enlace sin URL
- [ ] Verificar que muestre error "Por favor ingresa una URL"
- [ ] Intentar guardar nota sin contenido
- [ ] Verificar que muestre error "Por favor escribe el contenido"
- [ ] Intentar subir archivo sin seleccionar
- [ ] Verificar que muestre error apropiado

#### Test 4.6: Cerrar Formulario
- [ ] Abrir formulario
- [ ] Presionar X o tocar fuera del modal
- [ ] Verificar que se cierre correctamente
- [ ] Verificar que vuelva a vista anterior

### 5. Pruebas de Visualización de Evidencias

#### Test 5.1: Ver Evidencias en Lista
- [ ] En actividad con evidencias, ver la lista
- [ ] Verificar que se muestren todos los tipos
- [ ] Presionar en una evidencia de archivo
- [ ] Verificar navegación a pantalla de detalle

#### Test 5.2: Pantalla de Detalle - Archivo
- [ ] Ver evidencia de tipo archivo
- [ ] Verificar que se muestre nombre del archivo
- [ ] Verificar que se muestre tamaño
- [ ] Verificar que se muestre tipo MIME
- [ ] Verificar botón "Descargar archivo"
- [ ] Presionar botón de descarga
- [ ] Verificar que muestre confirmación

#### Test 5.3: Pantalla de Detalle - Enlace
- [ ] Ver evidencia de tipo enlace
- [ ] Verificar que se muestre URL
- [ ] Verificar que se muestre título (si existe)
- [ ] Presionar botón "Abrir enlace"
- [ ] Verificar que se abra en navegador

#### Test 5.4: Pantalla de Detalle - Nota
- [ ] Ver evidencia de tipo nota
- [ ] Verificar que se muestre título (si existe)
- [ ] Verificar que se muestre contenido completo
- [ ] Verificar formato de texto

#### Test 5.5: Información de Fecha
- [ ] En todas las evidencias, verificar fecha
- [ ] Verificar que el formato sea correcto (DD/MMM/YYYY)
- [ ] Verificar que sea la fecha de creación

### 6. Pruebas de Navegación

#### Test 6.1: Navegación Completa
- [ ] Login → Contratos → Actividades → Evidencias → Detalle
- [ ] Presionar botón atrás en cada pantalla
- [ ] Verificar que se regresa a pantalla anterior
- [ ] Verificar que se preserva estado

#### Test 6.2: Navegación por Pestañas
- [ ] Cambiar entre Contratos, Dashboard, Calendario, Perfil
- [ ] Verificar que se conserve estado de cada pestaña
- [ ] Cambiar a otra y volver
- [ ] Verificar que la información se preserve

#### Test 6.3: Deep Linking
- [ ] Navegar directamente a actividades de un contrato
- [ ] Navegar directamente a detalle de evidencia
- [ ] Verificar que funcionen correctamente

### 7. Pruebas de Rendimiento

#### Test 7.1: Tiempo de Carga
- [ ] Medir tiempo de carga inicial de Contratos (< 2s)
- [ ] Medir tiempo de carga de Actividades (< 1.5s)
- [ ] Medir tiempo de carga de lista de Evidencias (< 1s)

#### Test 7.2: Scrolling
- [ ] Hacer scroll en lista de contratos
- [ ] Verificar que sea suave sin lag
- [ ] Hacer scroll en lista de actividades
- [ ] Hacer scroll en lista de evidencias

#### Test 7.3: Manejo de Memoria
- [ ] Abrir y cerrar formularios múltiples veces
- [ ] Verificar que no haya memory leaks
- [ ] Navegar entre pantallas repetidamente
- [ ] Verificar que la app funcione correctamente

### 8. Pruebas de Casos Extremos

#### Test 8.1: Sin Datos
- [ ] Usuario con 0 contratos
- [ ] Contrato con 0 actividades
- [ ] Actividad con 0 evidencias
- [ ] Verificar mensajes vacíos apropiados

#### Test 8.2: Muchos Datos
- [ ] Usuario con 50+ contratos
- [ ] Contrato con 100+ actividades
- [ ] Actividad con 50+ evidencias
- [ ] Verificar que funcione sin lag

#### Test 8.3: Caracteres Especiales
- [ ] Títulos con acentos ñáéíóú
- [ ] URLs con parámetros complejos
- [ ] Notas con emojis
- [ ] Verificar que se muestren correctamente

### 9. Pruebas de Errores

#### Test 9.1: Sin Conexión
- [ ] Activar modo avión
- [ ] Intentar cargar contratos
- [ ] Verificar mensaje de error
- [ ] Desactivar modo avión
- [ ] Intentar refrescar

#### Test 9.2: Timeout del Servidor
- [ ] Simular servidor lento
- [ ] Verificar comportamiento
- [ ] Verificar que muestre spinner de carga
- [ ] Verificar time out después de cierto tiempo

#### Test 9.3: Errores de API
- [ ] Respuestas 400, 401, 403, 404, 500
- [ ] Verificar que se muestren mensajes útiles
- [ ] Verificar que no se cuelgue la app

### 10. Pruebas en Dispositivos

#### Test 10.1: Android
- [ ] Versión 8.0+
- [ ] Versión 10+
- [ ] Versión 14+
- [ ] Verificar en cada versión

#### Test 10.2: iOS
- [ ] iOS 13+
- [ ] iOS 15+
- [ ] iOS 17+
- [ ] Verificar en cada versión

#### Test 10.3: Diferentes Tamaños
- [ ] Teléfono pequeño (5")
- [ ] Teléfono mediano (6")
- [ ] Teléfono grande (6.7"+)
- [ ] Tablet
- [ ] Verificar layout en cada uno

#### Test 10.4: Orientación
- [ ] Retrato
- [ ] Apaisado
- [ ] Cambio de orientación
- [ ] Verificar que se reajuste correctamente

## Reporte de Bugs

Al encontrar un bug, reportar:
- Descripción exacta del problema
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento actual
- Dispositivo y versión de sistema
- Versión de la app
- Logs si están disponibles

## Checklist de Lanzamiento

- [ ] Todas las pruebas pasadas
- [ ] Sin errores en consola
- [ ] Sin memory leaks
- [ ] Velocidad de carga aceptable
- [ ] Interfaz consistente
- [ ] Textos correctos en español
- [ ] Permisos solicitados correctamente
- [ ] Documentación actualizada
- [ ] Versión incrementada
- [ ] Listo para producción
