<<<<<<< HEAD
# Agendaweb
agenda web para llevar control de horario y tareas
=======
# 📚 Agenda Universitaria

Una aplicación web moderna para gestionar horarios de clase y tareas universitarias de manera eficiente.

## ✨ Características

### 📅 Gestión de Horarios de Clase
- **Agregar clases** con nombre, profesor, día, horario y aula
- **Editar información** de clases existentes
- **Eliminar clases** con confirmación
- **Códigos de color** personalizables para cada clase
- **Vista organizada** por días de la semana

### ✅ Gestión de Tareas
- **Crear tareas** con título, descripción y fecha de entrega
- **Establecer prioridades** (Alta, Media, Baja)
- **Marcar como completadas** con un clic
- **Relacionar tareas** con clases específicas
- **Alertas visuales** para tareas vencidas
- **Ordenamiento inteligente** por prioridad y fecha

### 🎨 Interfaz Moderna
- **Diseño responsive** que funciona en móviles y desktop
- **Gradientes y animaciones** suaves
- **Iconos intuitivos** de Lucide React
- **Persistencia de datos** en localStorage
- **Navegación por pestañas** entre horarios y tareas

## 🚀 Instalación

1. **Clona o descarga** este proyecto
2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abre tu navegador** en `http://localhost:3000`

## 📦 Dependencias

- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Lucide React** - Iconos modernos
- **date-fns** - Manipulación de fechas

## 🎯 Cómo Usar

### Gestión de Horarios
1. Haz clic en la pestaña **"Horarios de Clase"**
2. Presiona **"Agregar Nueva Clase"**
3. Completa el formulario con:
   - Nombre de la clase
   - Profesor
   - Día de la semana
   - Horario (inicio y fin)
   - Aula
   - Color personalizado
4. Guarda la clase
5. Edita o elimina clases usando los botones de acción

### Gestión de Tareas
1. Haz clic en la pestaña **"Tareas"**
2. Presiona **"Agregar Nueva Tarea"**
3. Completa el formulario con:
   - Título de la tarea
   - Descripción (opcional)
   - Fecha de entrega
   - Prioridad
   - Clase relacionada (opcional)
4. Marca tareas como completadas haciendo clic en el círculo
5. Edita o elimina tareas según necesites

## 💾 Almacenamiento

Los datos se guardan automáticamente en el **localStorage** del navegador, por lo que:
- ✅ No se pierden al cerrar el navegador
- ✅ Funciona sin conexión a internet
- ✅ Los datos son privados y locales

## 🎨 Personalización

### Colores de Clases
Cada clase puede tener un color personalizado de una paleta predefinida:
- Azul (#667eea)
- Púrpura (#764ba2)
- Rosa (#f093fb)
- Rojo (#f5576c)
- Azul claro (#4facfe)
- Cian (#00f2fe)
- Verde (#43e97b)
- Verde azulado (#38f9d7)

### Prioridades de Tareas
- **Alta** (Rojo) - Tareas urgentes
- **Media** (Amarillo) - Tareas normales
- **Baja** (Verde) - Tareas de baja prioridad

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 **Móviles** (320px+)
- 📱 **Tablets** (768px+)
- 💻 **Desktop** (1024px+)

## 🔧 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la versión de producción
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 con Grid y Flexbox
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: localStorage API

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o tienes una sugerencia, no dudes en crear un issue o pull request.

---

**¡Organiza tu vida universitaria de manera eficiente con esta agenda digital!** 📚✨ 
>>>>>>> 8a11710 (primer commit)
