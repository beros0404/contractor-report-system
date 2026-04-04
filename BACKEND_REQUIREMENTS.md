# Requerimientos del Backend para la App Móvil

## Endpoints Requeridos

### 1. Contratos

#### GET /api/contracts
Obtener lista de contratos por usuario

**Query Parameters:**
```
usuarioId: string (requerido)
```

**Respuesta:**
```json
[
  {
    "_id": "id_mongo",
    "numero": "2024-001",
    "entidad": "Alcaldía",
    "objeto": "Servicios de consultoría",
    "valor": 1000000,
    "fechaInicio": "2024-01-01T00:00:00Z",
    "fechaFin": "2024-12-31T23:59:59Z",
    "estado": "activo",
    "contratistaNombre": "Juan Pérez",
    "supervisorNombre": "Maria Garcia",
    "creadoEn": "2024-01-01T00:00:00Z"
  }
]
```

**Status Codes:**
- 200: OK
- 400: usuarioId requerido
- 500: Error del servidor

---

### 2. Actividades

#### GET /api/activities
Obtener actividades de un contrato

**Query Parameters:**
```
contratoId: string (requerido)
usuarioId: string (requerido)
```

**Respuesta:**
```json
[
  {
    "_id": "id_mongo",
    "id": "ACT-001",
    "titulo": "Análisis de requisitos",
    "descripcion": "Realizar análisis inicial",
    "numero": 1,
    "porcentajePeso": 20,
    "estado": "activa",
    "tipo": "automatica",
    "contratoId": "id_contrato",
    "usuarioId": "id_usuario",
    "creadoEn": "2024-01-01T00:00:00Z"
  }
]
```

**Status Codes:**
- 200: OK
- 400: contratoId y usuarioId requeridos
- 500: Error del servidor

---

### 3. Evidencias

#### GET /api/evidencias
Obtener todas las evidencias de un contrato

**Query Parameters:**
```
contratoId: string (requerido)
usuarioId: string (requerido)
```

**Respuesta:**
```json
[
  {
    "id": "EV-123456",
    "actividadId": "ACT-001",
    "contratoId": "id_contrato",
    "usuarioId": "id_usuario",
    "tipo": "archivo",
    "nombre": "foto_prueba.jpg",
    "fecha": "2024-01-15T10:30:00Z",
    "archivo": {
      "nombre": "foto_prueba.jpg",
      "tamaño": 1024000,
      "tipo": "image/jpeg"
    }
  }
]
```

**Status Codes:**
- 200: OK
- 400: contratoId y usuarioId requeridos
- 500: Error del servidor

---

#### POST /api/evidencias/upload
Subir un archivo como evidencia

**Content-Type:** multipart/form-data

**Form Data:**
```
archivo: File
usuarioId: string
contratoId: string
actividadId: string
```

**Respuesta:**
```json
{
  "id": "EV-123456",
  "actividadId": "id_actividad",
  "contratoId": "id_contrato",
  "usuarioId": "id_usuario",
  "tipo": "archivo",
  "nombre": "documento.pdf",
  "fecha": "2024-01-15T10:30:00Z",
  "archivo": {
    "nombre": "documento.pdf",
    "tamaño": 2048000,
    "tipo": "application/pdf"
  }
}
```

**Status Codes:**
- 200: OK
- 400: Faltan datos requeridos
- 413: Archivo demasiado grande
- 500: Error al subir

---

#### POST /api/evidencias/enlace
Guardar un enlace como evidencia

**Content-Type:** application/json

**Body:**
```json
{
  "usuarioId": "id_usuario",
  "contratoId": "id_contrato",
  "actividadId": "id_actividad",
  "url": "https://ejemplo.com",
  "titulo": "Especificaciones del proyecto",
  "descripcion": "Documento de especificaciones"
}
```

**Respuesta:**
```json
{
  "id": "EV-123456",
  "actividadId": "id_actividad",
  "contratoId": "id_contrato",
  "usuarioId": "id_usuario",
  "tipo": "enlace",
  "nombre": "Especificaciones del proyecto",
  "fecha": "2024-01-15T10:30:00Z",
  "enlace": {
    "url": "https://ejemplo.com",
    "titulo": "Especificaciones del proyecto",
    "descripcion": "Documento de especificaciones"
  }
}
```

**Status Codes:**
- 200: OK
- 400: Faltan datos requeridos
- 500: Error al guardar

---

#### POST /api/evidencias/nota
Guardar una nota como evidencia

**Content-Type:** application/json

**Body:**
```json
{
  "usuarioId": "id_usuario",
  "contratoId": "id_contrato",
  "actividadId": "id_actividad",
  "titulo": "Notas de reunión",
  "contenido": "Se discutieron los siguientes puntos..."
}
```

**Respuesta:**
```json
{
  "id": "EV-123456",
  "actividadId": "id_actividad",
  "contratoId": "id_contrato",
  "usuarioId": "id_usuario",
  "tipo": "nota",
  "nombre": "Notas de reunión",
  "fecha": "2024-01-15T10:30:00Z",
  "nota": {
    "titulo": "Notas de reunión",
    "contenido": "Se discutieron los siguientes puntos..."
  }
}
```

**Status Codes:**
- 200: OK
- 400: Faltan datos requeridos
- 500: Error al guardar

---

## Cambios Verificados

### Modelo de Contrato
- [x] Campo `estado` con valores: 'activo', 'inactivo', 'finalizado'
- [x] Campo `supervisorNombre` para mostrar en UI
- [x] Campo `fechaFin` para calcular días restantes
- [x] Índice en `usuarioId` para queries rápidas
- [x] Campos de fecha: `creadoEn`, `actualizadoEn`

### Modelo de Actividad
- [x] Campo `id` único (string, no _id de Mongo)
- [x] Campo `contratoId` para relación
- [x] Campo `estado` con valores válidos
- [x] Campo `porcentajePeso` (number)
- [x] Campo `tipo` ('automatica', 'gestion_detectada', 'ia_sugerida')
- [x] Índice compuesto en `usuarioId` y `contratoId`

### Modelo de Evidencia
- [x] Campo `id` único (string)
- [x] Campo `tipo` con valores: 'archivo', 'enlace', 'nota'
- [x] Campo `nombre` para mostrar en UI
- [x] Campo `fecha` para ordenamiento
- [x] Campos específicos por tipo:
  - `archivo`: nombre, tamaño, tipo
  - `enlace`: url, titulo, descripcion
  - `nota`: titulo, contenido
- [x] Índice compuesto para queries eficientes

---

## Validaciones Requeridas

### GET /api/contracts
```
if (!usuarioId) {
  return 400 - "usuarioId es requerido"
}
```

### GET /api/activities
```
if (!contratoId || !usuarioId) {
  return 400 - "contratoId y usuarioId son requeridos"
}
```

### GET /api/evidencias
```
if (!contratoId || !usuarioId) {
  return 400 - "contratoId y usuarioId son requeridos"
}
```

### POST /api/evidencias/upload
```
if (!usuarioId || !contratoId || !actividadId || !archivo) {
  return 400 - "Faltan datos requeridos"
}
if (archivo.size > 50_000_000) { // 50MB
  return 413 - "Archivo demasiado grande"
}
```

### POST /api/evidencias/enlace
```
if (!usuarioId || !contratoId || !actividadId || !url) {
  return 400 - "Faltan datos requeridos"
}
if (!isValidUrl(url)) {
  return 400 - "URL inválida"
}
```

### POST /api/evidencias/nota
```
if (!usuarioId || !contratoId || !actividadId || !contenido) {
  return 400 - "Faltan datos requeridos"
}
if (contenido.trim().length === 0) {
  return 400 - "El contenido no puede estar vacío"
}
```

---

## Ordenamiento y Filtrado

### Contratos
- Orden por defecto: `creadoEn: -1` (más recientes primero)
- Filtro: `estado !== 'finalizado'`

### Actividades
- Orden: `numero: 1` (orden ascendente)
- Filtro: `contratoId` y `usuarioId`

### Evidencias
- Orden: `fecha: -1` (más recientes primero)
- Filtro: `contratoId` y `usuarioId`

---

## Manejo de Errores

Todos los endpoints deben:
1. Retornar status HTTP apropiado
2. Retornar JSON con estructura:
```json
{
  "error": "Mensaje descriptivo"
}
```

Ejemplos:
- 400: Bad Request (parámetros inválidos)
- 401: Unauthorized (no autenticado)
- 403: Forbidden (sin permisos)
- 404: Not Found (recurso no existe)
- 500: Internal Server Error (error del servidor)

---

## Límites Recomendados

```javascript
{
  maxFileSize: 50_000_000,        // 50MB
  maxRequestSize: 100_000_000,    // 100MB
  timeoutMs: 30000,               // 30 segundos
  rateLimitPerMinute: 100,        // 100 requests/minuto
  maxActivitiesPerPage: 100,
  maxEvidenciasPerPage: 50
}
```

---

## Logs Recomendados

El backend ya tiene logs con emojis, recomendamos mantener:
```
✅ Operación exitosa
❌ Error en la operación
🔍 Búsqueda/Lectura de datos
📦 Respuesta con datos
```

Esto facilita debugging en el lado cliente.

---

## Testing del Backend

Usa Postman o cURL para verificar:

```bash
# Obtener contratos
curl http://localhost:3001/api/contracts?usuarioId=user123

# Obtener actividades
curl http://localhost:3001/api/activities?contratoId=contrato123&usuarioId=user123

# Subir archivo
curl -X POST http://localhost:3001/api/evidencias/upload \
  -F "archivo=@file.pdf" \
  -F "usuarioId=user123" \
  -F "contratoId=contrato123" \
  -F "actividadId=actividad123"

# Agregar enlace
curl -X POST http://localhost:3001/api/evidencias/enlace \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "contratoId": "contrato123",
    "actividadId": "actividad123",
    "url": "https://ejemplo.com",
    "titulo": "Título"
  }'

# Guardar nota
curl -X POST http://localhost:3001/api/evidencias/nota \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "user123",
    "contratoId": "contrato123",
    "actividadId": "actividad123",
    "titulo": "Título",
    "contenido": "Contenido de la nota"
  }'
```

---

## Checklist de Verificación

- [ ] GET /api/contracts retorna lista filtrada
- [ ] GET /api/activities retorna actividades del contrato
- [ ] GET /api/evidencias retorna todas las evidencias
- [ ] POST /api/evidencias/upload funciona con archivos
- [ ] POST /api/evidencias/enlace funciona con URLs
- [ ] POST /api/evidencias/nota funciona con texto
- [ ] Todos los endpoints validan parámetros
- [ ] Todos los endpoints retornan errores apropiados
- [ ] Los índices de MongoDB están creados
- [ ] Las respuestas son consistentes con el esquema

---

## Notas

1. El frontend espera que los IDs de MongoDB estén en `_id`, pero los modelos de Actividad y Evidencia también incluyen un campo `id` (string único) que se usa en la aplicación.

2. Los tiempos de respuesta deben ser < 1 segundo para queries con filtros apropiados.

3. Se recomienda implementar paginación en el futuro para listas grandes.

4. Considerar agregar logs estructurados (JSON) para facilitar análisis en producción.

---

**Verificado**: 2026-04-04  
**Estado**: Listo para implementación
