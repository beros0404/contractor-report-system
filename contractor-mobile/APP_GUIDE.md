# Guía de la Aplicación Móvil - Sistema de Gestión de Contratos

## Descripción General

Esta es una aplicación móvil desarrollada con Expo y React Native que permite a los contratistas registrar y gestionar evidencias de actividades relacionadas con sus contratos. El flujo principal es:

**Contratos → Seleccionar Contrato → Ver Actividades → Registrar Evidencias**

## Características Principales

### 1. Autenticación
- Login con Supabase
- Gestión segura de sesiones
- Cierre de sesión

### 2. Gestión de Contratos
- **Pantalla de Contratos** (`ContratosScreen.tsx`)
  - Lista todos los contratos activos e inactivos del usuario
  - Muestra información clave: número, entidad, valor, fecha de vencimiento
  - Indicador visual de contratos que vencen pronto (< 30 días)
  - Contador de días restantes
  - Selección de contrato para ver actividades

### 3. Gestión de Actividades
- **Pantalla de Actividades por Contrato** (`ActividadesDetalleScreen.tsx`)
  - Vista detallada de todas las actividades de un contrato
  - Clasificación por estado: Activa, Completada, Sin Iniciar, Baja
  - Información de peso porcentual de cada actividad
  - Visualización de evidencias asociadas a cada actividad
  - Acceso rápido para agregar nuevas evidencias

### 4. Registro de Evidencias
- **Formulario Mejorado** (`EvidenciaForm.tsx`)
  - 3 formas de registrar evidencias:
    1. **Archivo**: Fotos, imágenes, documentos
       - Tomar foto con cámara
       - Seleccionar desde galería
       - Cargar documentos (PDF, Word, etc.)
    2. **Enlace**: URLs a recursos externos
       - Título (opcional)
       - URL del recurso
    3. **Nota**: Texto libre
       - Título (opcional)
       - Contenido extenso

### 5. Visualización de Evidencias
- **Componente EvidenciasCard**
  - Lista todas las evidencias de una actividad
  - Muestra tipo, nombre y fecha
  - Íconos visuales distintos por tipo
  - Acceso rápido para agregar más

- **Pantalla de Detalle** (`EvidenciaDetalleScreen.tsx`)
  - Vista completa de una evidencia
  - Acciones: descargar, abrir enlace, eliminar
  - Información detallada según el tipo

## Estructura del Proyecto

```
contractor-mobile/
├── screens/
│   ├── ContratosScreen.tsx          # Lista de contratos
│   ├── ActividadesDetalleScreen.tsx # Actividades de un contrato
│   ├── EvidenciaDetalleScreen.tsx   # Detalle de una evidencia
│   ├── DashboardScreen.tsx          # Dashboard inicial
│   ├── CalendarioScreen.tsx         # Calendario de eventos
│   ├── PerfilScreen.tsx             # Perfil del usuario
│   └── LoginScreen.tsx              # Login
├── components/
│   ├── EvidenciaForm.tsx            # Formulario mejorado
│   ├── EvidenciasCard.tsx           # Lista de evidencias
│   ├── ActividadSummary.tsx         # Resumen de actividad
│   ├── ActivityCard.tsx             # Tarjeta de actividad
│   ├── AporteForm.tsx               # Formulario de aportes
│   └── LoadingSpinner.tsx           # Spinner de carga
├── hooks/
│   ├── useAuth.ts                   # Autenticación
│   ├── useContratos.ts              # Lógica de contratos
│   ├── useActividades.ts            # Lógica de actividades
│   └── useEvidencias.ts             # Lógica de evidencias
├── lib/
│   ├── api.ts                       # Cliente API
│   └── supabase.ts                  # Configuración Supabase
├── App.tsx                          # Componente raíz
└── package.json
```

## Flujo de Navegación

```
Login
  ↓
Main Tabs (Contratos, Dashboard, Calendario, Perfil)
  ├─ Contratos
  │   └─ Seleccionar Contrato
  │       └─ ActividadesDetalle
  │           ├─ Ver Actividades
  │           └─ Registrar Evidencias (Modal)
  ├─ Dashboard
  │   ├─ Resumen general
  │   └─ Últimas actividades
  ├─ Calendario
  │   └─ Eventos
  └─ Perfil
      └─ Configuración
```

## Componentes Principales

### ContratosScreen
Pantalla principal para seleccionar contratos. Características:
- Lista de contratos activos
- Filtro automático de finalizados
- Información resumida por contrato
- Indicador de urgencia (< 30 días)
- Pull-to-refresh

### ActividadesDetalleScreen
Detalle de actividades por contrato. Características:
- Lista de actividades con estados visuales
- Resumen de estadísticas (completadas, en progreso, evidencias)
- Vista de evidencias por actividad
- Acceso rápido a registrar evidencias

### EvidenciaForm Mejorado
Formulario tabular con 3 opciones:
1. **Archivo**: Integración con cámara y galería
2. **Enlace**: Captura de URLs con título
3. **Nota**: Editor de texto multilínea

### Hooks Personalizados
- `useContratos`: Carga y gestión de contratos
- `useActividades`: Carga y filtrado de actividades
- `useEvidencias`: Carga y gestión de evidencias

## API Integration

### Endpoints utilizados
- `GET /api/contracts?usuarioId=ID` - Lista de contratos
- `GET /api/activities?contratoId=ID&usuarioId=ID` - Actividades
- `GET /api/evidencias?contratoId=ID&usuarioId=ID` - Evidencias
- `POST /api/evidencias/upload` - Subir archivo
- `POST /api/evidencias/enlace` - Agregar enlace
- `POST /api/evidencias/nota` - Guardar nota

## Instalación y Ejecución

```bash
cd contractor-mobile

# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar la app
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

## Variables de Entorno

Configurar en `app.json` o `app.config.js`:

```javascript
extra: {
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
}
```

## Desarrollo Futuro

### Mejoras planeadas
- [ ] Caché offline de datos
- [ ] Sincronización automática
- [ ] Notificaciones push
- [ ] Compresión de imágenes
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de reportes
- [ ] Compartir evidencias
- [ ] Historial de cambios

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Paginación de listas
- [ ] Animaciones suaves
- [ ] Mejora de rendimiento

## Troubleshooting

### Error de conexión al servidor
- Verificar que el servidor backend esté ejecutándose
- Revisar URL del API en `app.config.js`
- Verificar conectividad de red

### Problema de permisos de cámara/galería
- En Android: Verificar permisos en `AndroidManifest.xml`
- En iOS: Verificar permisos en `Info.plist`
- Solicitar permisos nuevamente desde ajustes

### Error al subir archivos
- Verificar tamaño del archivo (máx. recomendado: 50MB)
- Verificar tipo de archivo permitido
- Revisar espacio disponible en dispositivo

## Notas de Seguridad

- Las credenciales se almacenan de forma segura en Supabase
- Los tokens de sesión se utilizan para todas las peticiones
- Las contraseñas se hashean en el servidor
- Implementar HTTPS en producción

## Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.
