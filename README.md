# 📚 Agenda Universitaria

Una aplicación web completa para gestionar horarios de clase y tareas universitarias con autenticación de usuarios y persistencia de datos.

## 🚀 Demo en Vivo

**Frontend (GitHub Pages):** https://eddy503oliver.github.io/Agendaweb

**Backend:** [Configurar URL de producción]

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Lucide React** - Iconos modernos
- **date-fns** - Manipulación de fechas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de datos ligera
- **bcryptjs** - Hashing de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cors** - Middleware CORS

## 📋 Funcionalidades

- ✅ **Autenticación de usuarios** (registro/login)
- ✅ **Gestión de horarios de clase**
- ✅ **Gestión de tareas universitarias**
- ✅ **Relación entre clases y tareas**
- ✅ **Dashboard con estadísticas**
- ✅ **Filtrado de tareas** (pendientes, completadas, vencidas)
- ✅ **Diseño responsive**
- ✅ **Persistencia de datos**

## 🚀 Instalación y Uso

### Desarrollo Local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/eddy503oliver/Agendaweb.git
cd Agendaweb
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env en la raíz del proyecto
echo "PORT=5001" > .env
echo "JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion" >> .env
echo "NODE_ENV=development" >> .env
```

4. **Ejecutar en desarrollo:**
```bash
# Solo frontend
npm run dev

# Solo backend
npm run dev:server

# Ambos (frontend + backend)
npm run dev:full
```

### Despliegue en GitHub Pages

1. **Configurar el backend en un servicio externo** (Render, Railway, Heroku, etc.)

2. **Actualizar la URL de la API en producción:**
   - Editar `src/services/api.ts`
   - Cambiar `https://tu-backend-url.com/api` por tu URL real

3. **Desplegar:**
```bash
npm run build:prod
```

## 📁 Estructura del Proyecto

```
agenda/
├── 📁 src/                    # Código fuente del frontend
│   ├── 📁 components/         # Componentes React
│   │   ├── Login.tsx         # Autenticación
│   │   ├── ClassManager.tsx  # Gestión de clases
│   │   ├── TaskManager.tsx   # Gestión de tareas
│   │   └── Dashboard.tsx     # Panel principal
│   ├── 📁 services/          # Servicios de API
│   │   └── api.ts           # Cliente HTTP
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   ├── types.ts             # Definiciones TypeScript
│   └── index.css            # Estilos globales
├── 📁 server/               # Código del backend
│   ├── index.js             # Servidor Express
│   └── database.sqlite      # Base de datos
├── 📄 package.json          # Dependencias y scripts
├── 📄 vite.config.ts        # Configuración de Vite
├── 📄 tsconfig.json         # Configuración TypeScript
└── 📄 .env                  # Variables de entorno
```

## 🔧 Configuración del Backend

### Opciones de Despliegue

1. **Render (Recomendado):**
   - Conectar repositorio de GitHub
   - Configurar variables de entorno
   - Deploy automático

2. **Railway:**
   - Importar desde GitHub
   - Configurar variables de entorno
   - Deploy automático

3. **Heroku:**
   - Conectar repositorio
   - Configurar buildpacks
   - Variables de entorno

### Variables de Entorno Requeridas

```env
PORT=5001
JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion
NODE_ENV=production
```

## 📱 Características de UX/UI

- **Diseño moderno** con gradientes y efectos glassmorphism
- **Animaciones suaves** con CSS transitions
- **Iconos intuitivos** para mejor usabilidad
- **Feedback visual** en interacciones
- **Responsive design** para móviles y tablets
- **Dashboard interactivo** con filtros dinámicos

## 🔒 Seguridad

- **Hashing de contraseñas** con bcrypt
- **Tokens JWT** para autenticación
- **Validación de datos** en frontend y backend
- **CORS configurado** para seguridad
- **Variables de entorno** para configuraciones sensibles

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre** - [GitHub](https://github.com/eddy503oliver)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
