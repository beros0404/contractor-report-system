# Quick Start - App Móvil de Contratos

## Instalación Rápida (5 minutos)

### 1. Instalación de Dependencias
```bash
cd contractor-mobile
npm install
```

### 2. Configuración
Edita `app.config.js`:
```javascript
extra: {
  apiUrl: 'http://tu-backend-url.com', // Cambiar a tu URL
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
}
```

### 3. Ejecutar
```bash
npm start
```

Luego:
- **Android**: Presiona `a`
- **iOS**: Presiona `i`
- **Web**: Presiona `w`

## Flujo de Uso

### Para el Usuario Final

1. **Inicia sesión** con tus credenciales
2. **Selecciona un contrato** de la lista
3. **Explora actividades** del contrato
4. **Registra evidencias** de 3 formas:
   - Sube fotos/documentos
   - Agrega enlaces
   - Escribe notas
5. **Visualiza** todas tus evidencias

### Para el Desarrollador

#### Agregar una Nueva Pantalla
```typescript
// 1. Crea el archivo en screens/
// 2. Importa en App.tsx
import NuevaPantalla from './screens/NuevaPantalla';

// 3. Agrega ruta
<Stack.Screen name="Nueva" component={NuevaPantalla} />
```

#### Modificar Hooks
```typescript
// Los hooks ya manejan:
// - Carga de datos (loading)
// - Errores (error)
// - Refetch automático

import { useContratos } from './hooks/useContratos';

const { contratos, loading, error, loadContratos } = useContratos();
```

#### Llamar APIs
```typescript
import { api } from './lib/api';

// Contratos
const contratos = await api.getContratos(usuarioId);

// Actividades
const actividades = await api.getActividades(contratoId, usuarioId);

// Evidencias
await api.uploadEvidence(formData, usuarioId, contratoId, actividadId);
await api.addEvidence({ tipo: 'enlace', url: '...', ... });
```

## Estructura Rápida

```
contractor-mobile/
├── screens/        → Pantallas principales
├── components/     → Componentes reutilizables
├── hooks/          → Lógica personalizada
├── lib/            → Utilidades (API, Supabase)
└── App.tsx         → Configuración de navegación
```

## Troubleshooting Rápido

### Error: "Cannot find module"
```bash
npm install
```

### Error de Conexión API
- Verifica URL en `app.config.js`
- Verifica que el servidor está corriendo
- Abre consola: `npm start` → `i` (iOS) o `a` (Android)

### Error de Permisos
- Android: Verifica `AndroidManifest.xml`
- iOS: Verifica `Info.plist`
- Reinicia la app

### Error de Autenticación
- Verifica credenciales de Supabase
- Verifica que el usuario exista
- Revisa logs en `adb logcat` (Android)

## Comandos Útiles

```bash
# Limpiar cache
npm start -- --clear

# Rebuild para Android
npm run android -- --reset-cache

# Ver logs en vivo
npm start -- --verbose

# Detener servidor
Ctrl + C

# Instalar dependencia nueva
npm install nombre-paquete
```

## Variables de Entorno

```bash
# .env (crear archivo)
SUPABASE_URL=tu_url
SUPABASE_KEY=tu_key
API_URL=http://localhost:3001
```

## Testing Rápido

Sin ejecutar pruebas completas, verifica:
1. Login funciona
2. Se cargan contratos
3. Se puede seleccionar contrato
4. Se ven actividades
5. Se pueden agregar evidencias
6. Se ven en la lista

## Recursos

- [Documentación Completa](./APP_GUIDE.md)
- [Guía de Pruebas](./TESTING_GUIDE.md)
- [Resumen de Cambios](../MOBILE_APP_SUMMARY.md)

---

**Más preguntas?** Revisa `APP_GUIDE.md`
