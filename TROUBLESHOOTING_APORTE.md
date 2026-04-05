# Troubleshooting: Registro de Aportes - App Móvil

## ✅ Cambios Realizados

### 1. **Arreglado: Llamada a `getContrato` faltaba userId**
- **Archivo:** `contractor-mobile/screens/AporteScreen.tsx` (línea 161)
- **Problema:** `api.getContrato(contrato.id)` se llamaba sin el segundo parámetro `userId`
- **Solución:** Ahora se llama correctamente: `api.getContrato(contrato.id, resolvedUid)`
- **Impacto:** El contrato ahora se carga correctamente con su `fechaFin` para validaciones

### 2. **Implementación Completa de Múltiples Actividades**
El AporteScreen ya soporta selección múltiple de actividades:
- Array `actividadesSeleccionadas` para almacenar IDs de actividades
- Toggle individual con checkbox visual
- Botón "Todas" para seleccionar/deseleccionar todas
- Las actividades se validan al enviar el formulario

---

## 🔍 Checklist de Diagnóstico

### ¿Por qué no se muestran las actividades?

**Causa 1: Backend no está corriendo**
```bash
# En la terminal del backend, asegúrate que corre en puerto 3001
npm run dev
# o
node dist/server.js
```

**Causa 2: MongoDB no tiene datos**
Ejecuta los seeds:
```bash
node dist/scripts/seed-activities.js
```

**Causa 3: Parámetros incorrectos en la URL**
El endpoint espera:
- `GET /api/activities?contratoId=XXX&usuarioId=YYY`
- Ambos parámetros son OBLIGATORIOS

---

## 📋 Flujo Completo del Aporte (Paso a Paso)

### 1. **Abrir pantalla AporteScreen**
```
✓ Se cargan automáticamente todos los contratos del usuario
✓ Se selecciona el primer contrato por defecto
✓ Al seleccionar un contrato → se cargan sus actividades
```

### 2. **Seleccionar Contrato** (si quieres cambiar)
```
Toca el campo "Contrato activo"
↓
Se abre modal con lista de contratos
↓
Selecciona uno nuevo
↓
Las actividades se recargan automáticamente
```

### 3. **Seleccionar Actividades (MÚLTIPLES)**
```
Verás una lista de checkboxes con las actividades
↓
Toca cada una que quieras registrar (puedes marcar varias)
↓
Usa el botón "Todas" para marcar/desmarcar rápidamente
↓
En el card inferior muestra cuántas seleccionaste
```

### 4. **Llenar Descripción (OBLIGATORIA)**
```
- Escribe la descripción de lo que hiciste
- Sin descripción NO puedes agregar evidencias
- El textarea mostrará: "Descripción obligatoria - Campo bloqueado"
```

### 5. **Agregar Evidencias (DESPUÉS de descripción)**
```
Una vez escribas descripción:
↓
Se desbloqueará la sección de "Evidencias"
↓
Puedes agregar archivos, enlaces o notas
↓
Las evidencias se guardan automáticamente
```

### 6. **Enviar Aporte**
```
Toca "Registrar Aporte"
↓
Se valida:
  - Descripción: obligatoria ✓
  - Actividades: al menos una seleccionada
  - Fecha: no posterior a fechaFin del contrato
  - Evidencias: pueden ser ninguna, 1 o varias
↓
Se crea un único aporte con múltiples actividades
```

---

## 🐛 Errores Comunes y Soluciones

### Error: "Error en getContrato: [Error: Error al cargar contrato]"

**Causa:** El servidor MongoDB no está disponible en `http://localhost:3001`

**Solución:**
```bash
# 1. Verifica que el backend esté corriendo
lsof -i :3001

# 2. Si no aparece, inicia el backend
cd backend
npm install
npm run build
npm run dev

# 3. Verifica que MongoDB está conectado
# Deberías ver en consola: "✓ Conectado a MongoDB"
```

---

### Error: "Las actividades no se muestran"

**Causa:** El endpoint de actividades devuelve un array vacío

**Soluciones:**

1. **Verifica que hay datos en MongoDB**
```bash
# En tu cliente MongoDB (MongoDB Compass, etc.)
# Base de datos: DocumentosContratistas
# Colección: activities
# Filtro: { "contratoId": "tu-contrato-id", "usuarioId": "tu-usuario-id" }
```

2. **Ejecuta los seeds de datos**
```bash
cd backend
npm run build
node dist/scripts/seed-activities.js
```

3. **Verifica la URL del API en mobile**
```
Archivo: contractor-mobile/lib/api.ts
Línea 5: const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

Si usas emulador Android: http://10.0.2.2:3001 (no localhost)
```

---

### Error: "Todas mis actividades dicen que no tienen 'id'"

**Causa:** Las actividades en MongoDB usan `_id` pero el código espera `id`

**Solución:** En el API, asegúrate que `getActividades` devuelve objetos con propiedad `id`:

```typescript
// En activities/routes.js o activities/model.js
// Agregar un alias o getter:
actividadSchema.virtual('id').get(function() {
  return this._id.toString();
});
```

---

## 🧪 Test en Postman o cURL

### Test 1: Obtener contratos del usuario
```bash
curl "http://localhost:3001/api/contracts?usuarioId=usuario-123"
```

### Test 2: Obtener un contrato específico
```bash
curl "http://localhost:3001/api/contracts/contrato-456"
```

### Test 3: Obtener actividades de un contrato
```bash
curl "http://localhost:3001/api/activities?contratoId=contrato-456&usuarioId=usuario-123"
```

### Test 4: Crear un aporte con múltiples actividades
```bash
curl -X POST "http://localhost:3001/api/aportes" \
  -H "Content-Type: application/json" \
  -d '{
    "actividadId": ["act-1", "act-2", "act-3"],
    "fecha": "2026-04-05",
    "descripcion": "Realicé tres actividades importantes",
    "evidenciaIds": ["evid-1"],
    "estado": "completado",
    "monto": 1,
    "usuarioId": "usuario-123",
    "contratoId": "contrato-456"
  }'
```

---

## 📱 Variables de Entorno Requeridas

En `contractor-mobile/app.config.js` o `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_SUPABASE_URL=tu-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-key
GOOGLE_CLIENT_ID=tu-cliente-id
GOOGLE_CLIENT_SECRET=tu-secreto
```

---

## 🔑 Conceptos Clave

### ¿Cómo funciona la selección múltiple de actividades?

```typescript
// El estado almacena un array de IDs
const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<string[]>([]);

// Cuando seleccionas una actividad, togglea su ID en el array
const toggleActividad = (id: string) => {
  setActividadesSeleccionadas((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

// Al enviar, se envía el array completo de IDs
await api.createAporte({
  actividadId: actividadesSeleccionadas, // ["id1", "id2", "id3"]
  ...
}, usuarioId, contratoId);
```

### ¿Cómo se bloquean las evidencias?

```typescript
{descripcion.trim() ? (
  <EvidenciaUpload ... /> // Se muestra si hay descripción
) : (
  <View style={styles.disabledPlaceholder}>
    {/* Candado y mensaje: "Escribe descripción primero" */}
  </View>
)}
```

---

## ✨ Próximos Pasos

1. **Verifica el backend está corriendo en puerto 3001**
2. **Comprueba MongoDB tiene datos** (ejecuta seeds si es necesario)
3. **Prueba en la app móvil:**
   - Abre AporteScreen
   - Deberías ver contratos cargados
   - Al seleccionar uno, deberías ver sus actividades
   - Marca varias actividades con los checkboxes
   - Escribe descripción
   - Agreg evidencias
   - Envía el aporte

4. **Si algo falla:**
   - Revisa los logs del backend
   - Verifica la URL del API en la app
   - Comprueba que MongoDB está conectado
   - Ejecuta los seeds de datos

---

## 📞 Debugging

Para más detalles, agrega logs en `AporteScreen.tsx`:

```typescript
const selectContrato = async (contrato: Contrato, uid?: string) => {
  console.log('[v0] selectContrato:', { contrato, uid });
  try {
    const contratoCompleto = await api.getContrato(contrato.id, resolvedUid);
    console.log('[v0] contratoCompleto:', contratoCompleto);
    // ... resto
  }
};

const loadActividades = async (contratoId: string, uid: string) => {
  const data = await api.getActividades(contratoId, uid);
  console.log('[v0] actividades cargadas:', data);
  setActividades(Array.isArray(data) ? data : []);
};
```

Luego revisa los logs en Expo Go / React Native debugger.
