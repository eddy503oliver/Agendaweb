# 🚀 Guía de Despliegue - Agenda Universitaria

Esta guía te ayudará a desplegar tanto el frontend (GitHub Pages) como el backend (servicios externos).

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub
- ✅ Cuenta en un servicio de hosting (Render, Railway, Heroku, etc.)
- ✅ Node.js instalado localmente

## 🎯 Paso 1: Configurar GitHub Pages (Frontend)

### 1.1 Verificar configuración actual

Tu proyecto ya tiene configurado:
- ✅ `homepage` en `package.json`
- ✅ `base` en `vite.config.ts`
- ✅ `gh-pages` como dependencia
- ✅ Scripts de despliegue

### 1.2 Configurar GitHub Pages en tu repositorio

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **Deploy from a branch**
4. En **Branch**, selecciona **gh-pages** y **/(root)**
5. Haz clic en **Save**

### 1.3 Desplegar manualmente

```bash
# Construir y desplegar
npm run build:prod
```

O usar GitHub Actions (automático):
```bash
# Solo hacer push a main
git push origin main
```

## 🔧 Paso 2: Configurar Backend en Render.com (Recomendado)

### 2.1 Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en **New +** → **Web Service**

### 2.2 Conectar repositorio

1. Selecciona tu repositorio `Agendaweb`
2. Configura el servicio:
   - **Name**: `agenda-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2.3 Configurar variables de entorno

En la sección **Environment Variables**:
```
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion
PORT=10000
```

### 2.4 Desplegar

1. Haz clic en **Create Web Service**
2. Espera a que termine el despliegue
3. Copia la URL generada (ej: `https://agenda-backend.onrender.com`)

## 🔧 Paso 3: Actualizar URL de la API

### 3.1 Editar archivo de configuración

Edita `src/services/api.ts`:

```typescript
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001/api'
  : 'https://tu-backend-url.onrender.com/api'; // 👈 Cambia por tu URL real
```

### 3.2 Reconstruir y desplegar

```bash
npm run build:prod
```

## 🔧 Alternativa: Railway.com

### 1. Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub
3. Haz clic en **New Project** → **Deploy from GitHub repo**

### 2. Configurar

1. Selecciona tu repositorio
2. En **Root Directory**, especifica `server`
3. Railway detectará automáticamente que es Node.js

### 3. Variables de entorno

En **Variables**:
```
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion
PORT=3000
```

## 🔧 Alternativa: Heroku

### 1. Instalar Heroku CLI

```bash
npm install -g heroku
```

### 2. Login y crear app

```bash
heroku login
heroku create agenda-backend
```

### 3. Configurar buildpacks

```bash
heroku buildpacks:set heroku/nodejs
```

### 4. Variables de entorno

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion
```

### 5. Desplegar

```bash
cd server
git init
git add .
git commit -m "Initial backend commit"
git push heroku main
```

## 🔧 Alternativa: Vercel

### 1. Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub
3. Haz clic en **New Project**

### 2. Configurar

1. Importa tu repositorio
2. En **Root Directory**, especifica `server`
3. En **Build Command**: `npm install`
4. En **Output Directory**: `.`
5. En **Install Command**: `npm install`

### 3. Variables de entorno

En **Environment Variables**:
```
NODE_ENV=production
JWT_SECRET=tu-secreto-super-seguro-cambia-esto-en-produccion
```

## 🧪 Paso 4: Probar el despliegue

### 4.1 Verificar frontend

1. Ve a `https://eddy503oliver.github.io/Agendaweb`
2. Verifica que la aplicación cargue correctamente

### 4.2 Verificar backend

1. Prueba el endpoint de salud:
   ```
   https://tu-backend-url.com/
   ```
2. Debería devolver: `{"message":"Agenda API funcionando correctamente"}`

### 4.3 Probar funcionalidad completa

1. Registra un nuevo usuario
2. Crea algunas clases y tareas
3. Verifica que los datos persistan

## 🔍 Solución de problemas

### Error: "Failed to fetch"

**Causa**: URL de API incorrecta o CORS mal configurado
**Solución**: 
1. Verificar que la URL de la API sea correcta
2. Verificar que el backend esté funcionando
3. Revisar configuración de CORS

### Error: "404 Not Found"

**Causa**: Rutas de GitHub Pages incorrectas
**Solución**:
1. Verificar que `base` en `vite.config.ts` coincida con el nombre del repositorio
2. Verificar que `homepage` en `package.json` sea correcto

### Error: "Database locked"

**Causa**: SQLite no es compatible con algunos servicios
**Solución**:
1. Usar PostgreSQL en lugar de SQLite
2. O usar un servicio que soporte SQLite (Railway, Render)

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** del backend en tu servicio de hosting
2. **Verifica las variables de entorno**
3. **Prueba localmente** primero
4. **Consulta la documentación** del servicio que uses

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará disponible en:
- **Frontend**: https://eddy503oliver.github.io/Agendaweb
- **Backend**: https://tu-backend-url.com

¡Tu agenda universitaria estará funcionando en producción! 🚀
