import React, { useState, useEffect } from 'react';
import { Class } from '../types';
import { classesAPI } from '../services/api';

interface ClassManagerProps {
  onClassClick: (classData: Class) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ onClassClick }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    professor: '',
    day: 'Lunes',
    startTime: '',
    endTime: '',
    classroom: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Load classes from API
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesAPI.getAll();
      setClasses(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las clases');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startTime || !formData.endTime) {
      setError('Nombre, hora de inicio y hora de fin son obligatorios');
      return;
    }

    try {
      if (editingId) {
        await classesAPI.update(editingId, {
          name: formData.name,
          professor: formData.professor,
          day: formData.day,
          start_time: formData.startTime,
          end_time: formData.endTime,
          classroom: formData.classroom
        });
      } else {
        await classesAPI.create({
          name: formData.name,
          professor: formData.professor,
          day: formData.day,
          start_time: formData.startTime,
          end_time: formData.endTime,
          classroom: formData.classroom
        });
      }

      setFormData({
        name: '',
        professor: '',
        day: 'Lunes',
        startTime: '',
        endTime: '',
        classroom: ''
      });
      setEditingId(null);
      await loadClasses();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la clase');
    }
  };

  const handleEdit = (classData: Class) => {
    setFormData({
      name: classData.name,
      professor: classData.professor || '',
      day: classData.day,
      startTime: classData.start_time,
      endTime: classData.end_time,
      classroom: classData.classroom || ''
    });
    setEditingId(classData.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
      return;
    }

    try {
      await classesAPI.delete(id);
      await loadClasses();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la clase');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      professor: '',
      day: 'Lunes',
      startTime: '',
      endTime: '',
      classroom: ''
    });
    setEditingId(null);
  };

  const handleClassClick = (classData: Class) => {
    onClassClick(classData);
  };

  if (loading) {
    return <div className="loading">Cargando clases...</div>;
  }

  return (
    <div className="class-manager">
      <div className="form-section">
        <h3>{editingId ? 'Editar Clase' : 'Agregar Nueva Clase'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre de la Clase *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ej: Matemáticas"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="professor">Profesor</label>
              <input
                type="text"
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData({...formData, professor: e.target.value})}
                placeholder="Ej: Dr. García"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="day">Día</label>
              <select
                id="day"
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime">Hora de Inicio *</label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">Hora de Fin *</label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="classroom">Aula</label>
            <input
              type="text"
              id="classroom"
              value={formData.classroom}
              onChange={(e) => setFormData({...formData, classroom: e.target.value})}
              placeholder="Ej: Aula 101"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Actualizar' : 'Agregar'} Clase
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="classes-section">
        <h3>Horarios de Clase</h3>
        
        {classes.length === 0 ? (
          <p className="no-data">No hay clases registradas. ¡Agrega tu primera clase!</p>
        ) : (
          <div className="classes-grid">
            {classes.map((classData) => (
              <div key={classData.id} className="class-card clickable-class" onClick={() => handleClassClick(classData)}>
                <div className="class-header">
                  <h4>{classData.name}</h4>
                  <div className="class-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(classData);
                      }}
                      className="btn-icon"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(classData.id);
                      }}
                      className="btn-icon delete"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="class-details">
                  {classData.professor && (
                    <p><strong>Profesor:</strong> {classData.professor}</p>
                  )}
                  <p><strong>Día:</strong> {classData.day}</p>
                  <p><strong>Horario:</strong> {classData.start_time} - {classData.end_time}</p>
                  {classData.classroom && (
                    <p><strong>Aula:</strong> {classData.classroom}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManager; 