import React, { useState, useEffect } from 'react';
import { Task, Class } from '../types';
import { tasksAPI } from '../services/api';
import { Plus, Edit, Trash2, X, CheckCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  classes: Class[];
  selectedClass?: Class | null;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, classes, selectedClass }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load tasks from API
  useEffect(() => {
    loadTasks();
  }, [selectedClass]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll(selectedClass?.id);
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    classId: selectedClass?.id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingTask) {
        // Editar tarea existente
        const updatedTask = await tasksAPI.update(editingTask.id, {
          ...formData,
          completed: editingTask.completed
        });
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
        setEditingTask(null);
      } else {
        // Agregar nueva tarea
        const newTask = await tasksAPI.create(formData);
        setTasks([...tasks, newTask]);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      classId: task.classId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        setLoading(true);
        await tasksAPI.delete(id);
        setTasks(tasks.filter(task => task.id !== id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const result = await tasksAPI.toggleComplete(id);
      setTasks(tasks.map(task => 
        task.id === id 
          ? { ...task, completed: result.completed }
          : task
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      classId: selectedClass?.id || ''
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    resetForm();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Media';
    }
  };

  const getClassById = (classId: string) => {
    return classes.find(cls => cls.id === classId);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Primero las no completadas
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Luego por prioridad
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    // Finalmente por fecha
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        className="add-button"
        onClick={() => setShowForm(true)}
        disabled={loading}
      >
        <Plus size={20} />
        {editingTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}
      </button>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título de la Tarea</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Ej: Ensayo de Literatura"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Describe los detalles de la tarea..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Entrega</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                required
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

                     {classes.length > 0 && !selectedClass && (
             <div className="form-group">
               <label>Clase Relacionada (Opcional)</label>
               <select
                 value={formData.classId}
                 onChange={(e) => setFormData({...formData, classId: e.target.value})}
               >
                 <option value="">Sin clase específica</option>
                 {classes.map(cls => (
                   <option key={cls.id} value={cls.id}>{cls.name}</option>
                 ))}
               </select>
             </div>
           )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (editingTask ? 'Actualizar Tarea' : 'Agregar Tarea')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelForm} disabled={loading}>
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No hay tareas registradas</h3>
          <p>Agrega tu primera tarea para comenzar a organizar tu trabajo</p>
        </div>
      ) : (
        <div className="items-grid">
          {sortedTasks.map(task => {
            const relatedClass = task.classId ? getClassById(task.classId) : null;
            const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
            
            return (
              <div 
                key={task.id} 
                className={`item-card priority-${task.priority}`}
                style={{ 
                  opacity: task.completed ? 0.7 : 1,
                  borderColor: isOverdue ? '#dc3545' : undefined
                }}
              >
                <div className="item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <button 
                      className="action-btn"
                      onClick={() => toggleComplete(task.id)}
                      title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {task.completed ? <CheckCircle size={20} color="#28a745" /> : <Circle size={20} />}
                    </button>
                    <div>
                      <div 
                        className="item-title"
                        style={{ 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#666' : '#333'
                        }}
                      >
                        {task.title}
                      </div>
                      {relatedClass && (
                        <div className="item-subtitle" style={{ color: relatedClass.color }}>
                          📚 {relatedClass.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="action-btn"
                      onClick={() => handleEdit(task)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleDelete(task.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                    {task.description}
                  </div>
                )}
                
                <div className="item-details">
                  <div className="detail-row">
                    <span className="detail-label">Fecha de entrega:</span>
                    <span 
                      className="detail-value"
                      style={{ 
                        color: isOverdue ? '#dc3545' : task.completed ? '#666' : '#333',
                        fontWeight: isOverdue ? 'bold' : 'normal'
                      }}
                    >
                      {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: es })}
                      {isOverdue && ' ⚠️ Vencida'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Prioridad:</span>
                    <span 
                      className="detail-value"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskManager; 