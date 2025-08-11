import React, { useState, useEffect } from 'react';
import { Class, Task } from '../types';
import { classesAPI, tasksAPI } from '../services/api';

interface DashboardProps {
  selectedClass: Class | null;
}

type TaskFilter = 'all' | 'pending' | 'completed' | 'overdue' | null;

const Dashboard: React.FC<DashboardProps> = ({ selectedClass }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>(null);

  // Load data from API
  useEffect(() => {
    loadDashboardData();
  }, [selectedClass]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [classesData, tasksData] = await Promise.all([
        classesAPI.getAll(),
        tasksAPI.getAll(selectedClass?.id)
      ]);
      setClasses(classesData);
      setTasks(tasksData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length,
    overdue: tasks.filter(task => {
      if (task.completed || !task.due_date) return false;
      return new Date(task.due_date) < new Date();
    }).length
  };

  // Get tasks by status
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const overdueTasks = tasks.filter(task => {
    if (task.completed || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  });

  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = tasks.filter(task => {
    if (task.completed || !task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= nextWeek;
  });

  // Handle filter clicks
  const handleFilterClick = (filter: TaskFilter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  // Get filtered tasks based on active filter
  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'all':
        return tasks;
      case 'pending':
        return pendingTasks;
      case 'completed':
        return completedTasks;
      case 'overdue':
        return overdueTasks;
      default:
        return [];
    }
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <p>Resumen de tu agenda universitaria</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{classes.length}</h3>
            <p>Materias</p>
          </div>
        </div>
        
        <div 
          className={`stat-card clickable ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{taskStats.total}</h3>
            <p>Total Tareas</p>
          </div>
        </div>
        
        <div 
          className={`stat-card pending clickable ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => handleFilterClick('pending')}
        >
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{taskStats.pending}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        
        <div 
          className={`stat-card completed clickable ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => handleFilterClick('completed')}
        >
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{taskStats.completed}</h3>
            <p>Completadas</p>
          </div>
        </div>
        
        <div 
          className={`stat-card overdue clickable ${activeFilter === 'overdue' ? 'active' : ''}`}
          onClick={() => handleFilterClick('overdue')}
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{taskStats.overdue}</h3>
            <p>Vencidas</p>
          </div>
        </div>
      </div>

      {/* Filtered Tasks Section */}
      {activeFilter && (
        <div className="dashboard-section">
          <div className="filtered-tasks-header">
            <h3>
              {activeFilter === 'all' && '📝 Todas las Tareas'}
              {activeFilter === 'pending' && '⏳ Tareas Pendientes'}
              {activeFilter === 'completed' && '✅ Tareas Completadas'}
              {activeFilter === 'overdue' && '⚠️ Tareas Vencidas'}
            </h3>
            <button 
              className="clear-filter-btn"
              onClick={() => setActiveFilter(null)}
            >
              ✕ Limpiar Filtro
            </button>
          </div>
          
          {filteredTasks.length === 0 ? (
            <p className="no-data">
              {activeFilter === 'all' && 'No tienes tareas registradas'}
              {activeFilter === 'pending' && 'No tienes tareas pendientes'}
              {activeFilter === 'completed' && 'No tienes tareas completadas'}
              {activeFilter === 'overdue' && 'No tienes tareas vencidas'}
            </p>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <div key={task.id} className={`task-item ${activeFilter}`}>
                  <div className="task-info">
                    <h5>{task.title}</h5>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    {task.class_name && <span className="task-class">📚 {task.class_name}</span>}
                    {task.due_date && (
                      <span className={`task-due-date ${activeFilter === 'overdue' ? 'overdue' : ''}`}>
                        {activeFilter === 'overdue' ? 'Vencida: ' : 'Vence: '}
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {activeFilter === 'completed' && (
                      <span className="task-completed-date">
                        Completada: {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="dashboard-content">
        {/* Classes Section */}
        <div className="dashboard-section">
          <h3>📚 Mis Materias ({classes.length})</h3>
          {classes.length === 0 ? (
            <p className="no-data">No tienes materias registradas</p>
          ) : (
            <div className="classes-overview">
              {classes.map((classData) => {
                const classTasks = tasks.filter(task => task.class_id === classData.id);
                const pendingClassTasks = classTasks.filter(task => !task.completed);
                
                return (
                  <div key={classData.id} className="class-overview-card">
                    <div className="class-overview-header">
                      <h4>{classData.name}</h4>
                      <span className="task-count">
                        {pendingClassTasks.length} pendiente{pendingClassTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="class-overview-details">
                      <p><strong>Profesor:</strong> {classData.professor || 'No especificado'}</p>
                      <p><strong>Día:</strong> {classData.day}</p>
                      <p><strong>Horario:</strong> {classData.start_time} - {classData.end_time}</p>
                      {classData.classroom && (
                        <p><strong>Aula:</strong> {classData.classroom}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Overview - Only show when no filter is active */}
        {!activeFilter && (
          <div className="dashboard-section">
            <h3>📋 Resumen de Tareas</h3>
            
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className="task-category overdue">
                <h4>⚠️ Tareas Vencidas ({overdueTasks.length})</h4>
                <div className="task-list">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="task-item overdue">
                      <div className="task-info">
                        <h5>{task.title}</h5>
                        {task.class_name && <span className="task-class">📚 {task.class_name}</span>}
                        <span className="task-due-date overdue">
                          Vencida: {new Date(task.due_date!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div className="task-category upcoming">
                <h4>📅 Próximas Tareas ({upcomingTasks.length})</h4>
                <div className="task-list">
                  {upcomingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="task-item upcoming">
                      <div className="task-info">
                        <h5>{task.title}</h5>
                        {task.class_name && <span className="task-class">📚 {task.class_name}</span>}
                        <span className="task-due-date">
                          Vence: {new Date(task.due_date!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="task-category completed">
                <h4>✅ Tareas Completadas Recientes ({completedTasks.length})</h4>
                <div className="task-list">
                  {completedTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="task-item completed">
                      <div className="task-info">
                        <h5>{task.title}</h5>
                        {task.class_name && <span className="task-class">📚 {task.class_name}</span>}
                        <span className="task-completed-date">
                          Completada: {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <p className="no-data">No tienes tareas registradas</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
