# ACCIÓN REQUERIDA - INICIARESTRUCTURA DEL BACKEND

## EL PROBLEMA

La app móvil está correctamente desarrollada, pero **el backend en localhost:3001 NO está corriendo**.

Sin el backend, la app no puede:
- Cargar contratos
- Cargar actividades
- Subir evidencias
- Crear aportes

Verás estos errores en la consola:
```
Error en getContratos: Error al cargar contrato
Error en getActividades: Error al cargar actividades  
Error en uploadEvidence: Error al subir evidencia
```

## SOLUCIÓN EN 3 PASOS

### PASO 1: Abre una NUEVA terminal
```bash
cd backend
```

### PASO 2: Instala dependencias (solo primera vez)
```bash
npm install
```

### PASO 3: Inicia el servidor
```bash
npm start
```

Deberías ver:
```
Server is running on port 3001
Connected to MongoDB
```

Si ves esto, el backend está listo.

## VERIFICAR QUE FUNCIONA

1. Abre http://localhost:3001/api/contracts en tu navegador
2. Si ves JSON con datos, todo está bien
3. Regresa a la app móvil
4. Recarga la app (presiona R)
5. Deberías ver:
   - Lista de contratos
   - Al tocar uno, las actividades
   - Poder crear aporte con actividades

## RESUMEN DE CAMBIOS EN LA APP MÓVIL

✅ Formulario AporteScreen:
- Descripción OBLIGATORIA antes de agregar evidencias
- Soporte para seleccionar MÚLTIPLES actividades
- Validación completa

✅ Integración Actividades + Aporte:
- Botón "Crear Aporte" en cada actividad
- Navega al mismo formulario preseleccionando contrato + actividad

✅ Mejoras de debugging:
- Logs claros que muestran:
  - URL de conexión
  - Si los datos se recibieron
  - Si el backend está disponible

✅ Estructura de carpetas correcta:
- contractor-mobile/ - App con Expo
- backend/ - Servidor Node.js con MongoDB

## IMPORTANTE

**El código de la app móvil SÍ está actualizado y correcto.**
**El problema es QUE EL BACKEND NO ESTÁ CORRIENDO.**

Una vez que inicies el backend en otra terminal, todo funcionará.
