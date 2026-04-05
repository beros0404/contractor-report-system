# Configuración MongoDB - Conexión App Móvil

## Datos de Conexión Proporcionados

```
MONGODB_URI=mongodb+srv://valentinabernal1:Valentina1234@cluster0.b4tjngx.mongodb.net/DocumentosContratistas?retryWrites=true&w=majority
PORT=3001
```

## Verificación de Conexión

### 1. Verifica que tu Backend esté corriendo

```bash
# En la carpeta del backend
npm start
# o
node server.js
```

Deberías ver algo como:
```
Server running on http://localhost:3001
Connected to MongoDB
```

### 2. Verifica que la URL del API sea correcta

**Archivo:** `/contractor-mobile/lib/api.ts`

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
```

### 3. Prueba la conexión desde la app móvil

Cuando ejecutes `npm start` en la app móvil, intenta:
- Ir a **Dashboard** → Selecciona un contrato
- Deberías ver las actividades cargadas

Si ves un error como `Cannot reach API`, revisa:
1. ¿Está corriendo el backend en puerto 3001?
2. ¿La URL en `api.ts` es correcta?
3. ¿Tienes internet en tu dispositivo/emulador?

### 4. Prueba crear un aporte

1. Abre la app móvil
2. Ve a **Dashboard** → **Registrar Aporte**
3. Selecciona un contrato
4. Escribe una descripción
5. Agrega una evidencia (archivo/enlace/nota)
6. Presiona "Enviar aporte"

### 5. Verifica en MongoDB

Abre MongoDB Compass o MongoDB Atlas y verifica:

```
Base de datos: DocumentosContratistas
```

Deberías ver colecciones como:
- `contracts` - Los contratos
- `activities` - Las actividades
- `aportes` - Los aportes creados
- `evidencias` - Las evidencias guardadas (AQUÍ ES LO IMPORTANTE)

## Posibles Errores

### Error: "Cannot reach API"
- **Solución:** Verifica que el backend esté corriendo en puerto 3001
- Abre en navegador: `http://localhost:3001/api/contracts?usuarioId=test`

### Error: "MongoDB connection failed"
- **Solución:** Verifica la URI de MongoDB en tu `.env` del backend
- Debe ser exactamente: `mongodb+srv://valentinabernal1:Valentina1234@cluster0.b4tjngx.mongodb.net/DocumentosContratistas?retryWrites=true&w=majority`

### Las evidencias no aparecen en la web
- **Posible causa:** No se están guardando en MongoDB
- **Solución:** Verifica que el endpoint `/api/evidencias` esté creando documentos en la colección `evidencias`

## Endpoints Críticos

Estos son los endpoints que usa la app móvil:

```
GET  /api/contracts?usuarioId={id}
GET  /api/activities?contratoId={id}&usuarioId={id}
POST /api/aportes
POST /api/evidencias/upload
POST /api/evidencias/enlace
POST /api/evidencias/nota
GET  /api/evidencias?contratoId={id}&usuarioId={id}
```

Asegúrate de que todos estén implementados en tu backend.

## Logs Útiles

Para debug, revisa:

**En el backend:**
```javascript
console.log('[v0] Aporte creado:', aporte);
console.log('[v0] Evidencia guardada:', evidencia);
```

**En la app móvil:**
Abre la consola de Expo y busca logs de error.
