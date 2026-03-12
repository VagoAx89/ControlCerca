# 📱 Control de Cerca Eléctrica - PWA

## 🎯 Archivos Necesarios

Para que tu app funcione como PWA necesitas estos archivos en el servidor:

```
📁 Tu Servidor/Hosting
├── 📄 App.html              (Tu aplicación principal)
├── 📄 manifest.json         (Configuración de la PWA)
├── 📄 service-worker.js     (Para funcionar offline)
└── 🖼️ cercas.png            (Icono de la app - 512x512px recomendado)
```

## 🚀 Cómo Instalar

### 1️⃣ Subir Archivos al Servidor

Sube todos los archivos a tu servidor web o hosting. **IMPORTANTE**: Los archivos deben estar en la raíz o ajusta las rutas en el código.

### 2️⃣ Requisitos del Servidor

- ✅ Debe tener **HTTPS** (obligatorio para PWA)
- ✅ Configurar los headers correctos (opcional pero recomendado):

```
Content-Type: application/manifest+json    (para manifest.json)
Content-Type: application/javascript       (para service-worker.js)
```

### 3️⃣ Instalar en el Celular

#### 📱 Android (Chrome):
1. Abre la app en Chrome
2. Aparecerá un banner "Agregar a inicio"
3. O ve al menú ⋮ → "Instalar aplicación"

#### 🍎 iOS (Safari):
1. Abre la app en Safari
2. Toca el botón "Compartir" 📤
3. Selecciona "Agregar a pantalla de inicio"

## 🖼️ Sobre el Icono (cercas.png)

### Especificaciones Recomendadas:
- **Tamaño**: 512x512 píxeles (mínimo 192x192)
- **Formato**: PNG con fondo transparente o sólido
- **Diseño**: Simple y reconocible

### Si no tienes el icono:
Puedes crear uno rápido usando:
- Canva (template de icono de app)
- Photoshop/Figma
- O usar un emoji: ⚡ como placeholder

### Ajustar el Icono:
Si tu icono tiene otro nombre, edita `manifest.json`:
```json
"icons": [
  {
    "src": "tu-icono.png",  // ← Cambia aquí
    ...
  }
]
```

## ⚙️ Configuración Avanzada

### Cambiar el Nombre de la App:
Edita `manifest.json`:
```json
"name": "Tu Nombre Largo",
"short_name": "Nombre Corto"
```

### Cambiar Colores:
Edita `manifest.json`:
```json
"background_color": "#667eea",  // Color de fondo al abrir
"theme_color": "#667eea"        // Color de la barra superior
```

### Actualizar la App:
Cuando hagas cambios:
1. Edita el archivo que necesites
2. Cambia la versión del cache en `service-worker.js`:
```javascript
const CACHE_NAME = 'cerca-control-v1.0.1'; // ← Incrementa aquí
```

## 🔧 Solución de Problemas

### La app no se instala:
- ✅ Verifica que estás usando HTTPS
- ✅ Revisa la consola del navegador (F12)
- ✅ Asegúrate que `manifest.json` y `service-worker.js` estén accesibles

### La app no funciona offline:
- ✅ Espera unos segundos después de cargar por primera vez
- ✅ Recarga la página (el service worker necesita activarse)
- ✅ Verifica en DevTools → Application → Service Workers

### Los cambios no se ven:
- ✅ Limpia el cache del navegador
- ✅ O agrega `?v=2` al final de App.html (ej: `App.html?v=2`)
- ✅ Incrementa la versión en el service worker

## 📊 Verificar que Funciona

### Opción 1: Chrome DevTools
1. Abre DevTools (F12)
2. Ve a pestaña "Application"
3. Verifica:
   - ✅ Manifest cargado correctamente
   - ✅ Service Worker: "Activated and running"
   - ✅ Cache Storage: Archivos guardados

### Opción 2: Lighthouse
1. DevTools → Lighthouse
2. Selecciona "Progressive Web App"
3. Click en "Generate Report"
4. Debe pasar la mayoría de las pruebas

## 🎨 Personalización Futura

En `manifest.json` puedes agregar:

### Screenshots (para tiendas de apps):
```json
"screenshots": [
  {
    "src": "screenshot1.png",
    "sizes": "1080x1920",
    "type": "image/png"
  }
]
```

### Atajos (Android):
```json
"shortcuts": [
  {
    "name": "Activar Cerca",
    "url": "/App.html?action=fence",
    "icons": [{ "src": "cercas.png", "sizes": "192x192" }]
  }
]
```

## 🔐 Seguridad

- ✅ El service worker solo funciona en HTTPS
- ✅ Firebase ya usa HTTPS por defecto
- ✅ Las credenciales se guardan en localStorage del navegador
- ✅ No se comparte información entre usuarios

## 📞 Notas Importantes

1. **Primera vez**: La app necesita conexión para cargar
2. **Offline**: Después funciona sin internet (excepto comandos a Firebase)
3. **Actualizar**: Incrementa versión en service-worker.js
4. **Cache**: Se limpia automáticamente en cada actualización

## 🎉 ¡Listo!

Ahora tu app es una **PWA completa** que:
- ✅ Se instala como app nativa
- ✅ Funciona offline (interfaz)
- ✅ Tiene icono personalizado
- ✅ Carga súper rápido
- ✅ Se actualiza automáticamente

---

**Creado con ❤️ para control de cerca eléctrica**
