import React, { useState, useEffect } from 'react';
import { Class } from '../types';
import { classesAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface ClassManagerProps {
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  onClassClick?: (cls: Class) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, setClasses, onClassClick }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load classes from API
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesAPI.getAll();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    day: 'Lunes',
    startTime: '',
    endTime: '',
    classroom: '',
    color: '#667eea'
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingClass) {
        // Editar clase existente
        const updatedClass = await classesAPI.update(editingClass.id, formData);
        setClasses(classes.map(cls => 
          cls.id === editingClass.id ? updatedClass : cls
        ));
        setEditingClass(null);
      } else {
        // Agregar nueva clase
        const newClass = await classesAPI.create(formData);
        setClasses([...classes, newClass]);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      professor: cls.professor,
      day: cls.day,
      startTime: cls.startTime,
      endTime: cls.endTime,
      classroom: cls.classroom,
      color: cls.color
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      try {
        setLoading(true);
        await classesAPI.delete(id);
        setClasses(classes.filter(cls => cls.id !== id));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      professor: '',
      day: 'Lunes',
      startTime: '',
      endTime: '',
      classroom: '',
      color: '#667eea'
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingClass(null);
    resetForm();
  };

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
        {editingClass ? 'Editar Clase' : 'Agregar Nueva Clase'}
      </button>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre de la Clase</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ej: Matemáticas Avanzadas"
              />
            </div>
            <div className="form-group">
              <label>Profesor</label>
              <input
                type="text"
                value={formData.professor}
                onChange={(e) => setFormData({...formData, professor: e.target.value})}
                required
                placeholder="Nombre del profesor"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Día</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Aula</label>
              <input
                type="text"
                value={formData.classroom}
                onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                required
                placeholder="Ej: Aula 101"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hora de Inicio</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora de Fin</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #333' : '2px solid #ddd',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (editingClass ? 'Actualizar Clase' : 'Agregar Clase')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelForm} disabled={loading}>
              <X size={16} />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 ? (
        <div className="empty-state">
          <h3>No hay clases registradas</h3>
          <p>Agrega tu primera clase para comenzar a organizar tu horario</p>
        </div>
      ) : (
        <div className="items-grid">
          {classes.map(cls => (
            <div 
              key={cls.id} 
              className="item-card clickable-class"
              style={{ borderLeftColor: cls.color, borderLeftWidth: '4px' }}
              onClick={() => onClassClick && onClassClick(cls)}
            >
              <div className="item-header">
                <div>
                  <div className="item-title">{cls.name}</div>
                  <div className="item-subtitle">{cls.professor}</div>
                </div>
                <div className="item-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleEdit(cls)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleDelete(cls.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">Día:</span>
                  <span className="detail-value">{cls.day}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Horario:</span>
                  <span className="detail-value">{cls.startTime} - {cls.endTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Aula:</span>
                  <span className="detail-value">{cls.classroom}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassManager; 