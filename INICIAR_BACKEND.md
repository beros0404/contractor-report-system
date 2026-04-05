# Iniciar el Backend - MongoDB

El problema es que el backend NO está corriendo. Sin el backend en `localhost:3001`, la app móvil no puede:
- Cargar contratos (getContrato falla)
- Cargar actividades (loadActividades falla)
- Subir evidencias (uploadEvidence falla)

## INSTRUCCIONES PARA INICIAR EL BACKEND

### Paso 1: Abre una terminal en la carpeta del backend
```bash
cd backend
```

### Paso 2: Instala dependencias (si no las has instalado)
```bash
npm install
```

### Paso 3: Asegúrate que tienes las variables de entorno
Crea o verifica que existe un archivo `.env` en la carpeta `backend/` con:
```
MONGODB_URI=mongodb+srv://valentinabernal1:Valentina1234@cluster0.b4tjngx.mongodb.net/DocumentosContratistas?retryWrites=true&w=majority
PORT=3001
```

### Paso 4: Inicia el servidor
```bash
npm start
```

O si quieres usar nodemon (reinicia automáticamente al cambiar código):
```bash
npm run dev
```

### Paso 5: Verifica que está corriendo
Deberías ver algo como:
```
Server is running on port 3001
Connected to MongoDB
```

### Paso 6: Prueba la conexión
Abre en tu navegador:
```
http://localhost:3001/api/contratos/usuario/{tu-usuario-id}
```

Si ves JSON con datos, el backend funciona correctamente.

## PROBLEMAS COMUNES

**Error: Cannot find module 'mongoose'**
→ Ejecuta `npm install` en la carpeta backend

**Error: ECONNREFUSED 127.0.0.1:27017**
→ MongoDB no está disponible. Asegúrate que:
  - Tienes acceso a la URL de MongoDB Atlas
  - Tu IP está whitelisteda en MongoDB Atlas
  - La contraseña es correcta

**Error: PORT 3001 already in use**
→ Otro proceso está usando el puerto 3001. Cambia el PORT a 3002 en `.env`

**La app móvil sigue sin cargar datos**
→ Verifica que:
  1. El backend está corriendo en http://localhost:3001
  2. La app móvil está en la MISMA red que tu computadora
  3. Usa `ipconfig getifaddr en0` (Mac) o `ipconfig` (Windows) para obtener tu IP local
  4. Si no es localhost, reemplaza en `lib/api.ts`:
     ```typescript
     const API_URL = 'http://TU-IP-LOCAL:3001';
     ```

## VERIFICAR QUE TODO FUNCIONA

Una vez que el backend esté corriendo:

1. Abre la app móvil
2. Ve al tab de Contratos
3. Deberías ver la lista de contratos
4. Toca un contrato
5. Deberías ver la lista de actividades
6. Presiona + para agregar aporte
7. Se debería cargar el formulario con actividades disponibles

Si aún no funciona, revisa los logs del backend y la app móvil.
