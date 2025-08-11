import React, { useState, useEffect } from 'react';
import { Task, Class } from '../types';
import { tasksAPI, classesAPI } from '../services/api';
import { Plus, Edit, Trash2, X, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskManagerProps {
  selectedClass: Class | null;
}

const TaskManager: React.FC<TaskManagerProps> = ({ selectedClass }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    classId: selectedClass?.id || ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load tasks and classes from API
  useEffect(() => {
    loadData();
  }, [selectedClass]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, classesData] = await Promise.all([
        tasksAPI.getAll(selectedClass?.id),
        classesAPI.getAll()
      ]);
      setTasks(tasksData);
      setClasses(classesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('El título es obligatorio');
      return;
    }

    try {
      if (editingId) {
        await tasksAPI.update(editingId, {
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
          class_id: formData.classId ? Number(formData.classId) : undefined
        });
      } else {
        await tasksAPI.create({
          title: formData.title,
          description: formData.description,
          due_date: formData.dueDate,
          class_id: formData.classId ? Number(formData.classId) : undefined
        });
      }

      setFormData({
        title: '',
        description: '',
        dueDate: '',
        classId: selectedClass?.id || ''
      });
      setEditingId(null);
      await loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la tarea');
    }
  };

  const handleEdit = (taskData: Task) => {
    setFormData({
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.due_date || '',
      classId: taskData.class_id?.toString() || ''
    });
    setEditingId(taskData.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await tasksAPI.delete(id);
      await loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la tarea');
    }
  };

  const handleToggleComplete = async (id: number) => {
    try {
      await tasksAPI.toggleComplete(id);
      await loadData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado de la tarea');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      classId: selectedClass?.id || ''
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="loading">Cargando tareas...</div>;
  }

  return (
    <div className="task-manager">
      <div className="form-section">
        <h3>{editingId ? 'Editar Tarea' : 'Agregar Nueva Tarea'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title">Título de la Tarea *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Ej: Hacer presentación de matemáticas"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción detallada de la tarea..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Fecha de Entrega</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>

            {!selectedClass && (
              <div className="form-group">
                <label htmlFor="classId">Clase Relacionada</label>
                <select
                  id="classId"
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                >
                  <option value="">Sin clase específica</option>
                  {classes.map(classData => (
                    <option key={classData.id} value={classData.id}>
                      {classData.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar' : 'Agregar'} Tarea
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="tasks-section">
        <h3>
          {selectedClass ? `Tareas de ${selectedClass.name}` : 'Todas las Tareas'}
        </h3>
        
        {tasks.length === 0 ? (
          <p className="no-data">
            {selectedClass 
              ? `No hay tareas para ${selectedClass.name}. ¡Agrega tu primera tarea!`
              : 'No hay tareas registradas. ¡Agrega tu primera tarea!'
            }
          </p>
        ) : (
          <div className="tasks-grid">
            {tasks.map((taskData) => (
              <div key={taskData.id} className={`task-card ${taskData.completed ? 'completed' : ''}`}>
                <div className="task-header">
                  <div className="task-title-section">
                    <button
                      onClick={() => handleToggleComplete(taskData.id)}
                      className={`complete-button ${taskData.completed ? 'completed' : ''}`}
                      title={taskData.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {taskData.completed ? '✅' : '⭕'}
                    </button>
                    <h4 className={taskData.completed ? 'completed-text' : ''}>
                      {taskData.title}
                    </h4>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => handleEdit(taskData)}
                      className="btn-icon"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(taskData.id)}
                      className="btn-icon delete"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="task-details">
                  {taskData.description && (
                    <p className="task-description">{taskData.description}</p>
                  )}
                  {taskData.due_date && (
                    <p className="task-due-date">
                      <strong>Fecha límite:</strong> {new Date(taskData.due_date).toLocaleDateString()}
                    </p>
                  )}
                  {taskData.class_name && (
                    <p className="task-class">
                      <strong>Clase:</strong> {taskData.class_name}
                    </p>
                  )}
                  <p className="task-status">
                    <strong>Estado:</strong> {taskData.completed ? 'Completada' : 'Pendiente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager; 