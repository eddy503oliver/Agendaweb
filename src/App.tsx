import React, { useState, useEffect } from 'react';
import { Class, Task, TabType } from './types';
import { User } from './services/api';
import ClassManager from './components/ClassManager';
import TaskManager from './components/TaskManager';
import Login from './components/Login';
import { Plus, BookOpen, CheckSquare, ArrowLeft, LogOut, User as UserIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User, token: string) => {
    setUser(user);
    setToken(token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setClasses([]);
    setTasks([]);
    setSelectedClass(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
    setActiveTab('tasks');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setActiveTab('classes');
  };

  const filteredTasks = selectedClass 
    ? tasks.filter(task => task.classId === selectedClass.id)
    : tasks;

  // Show login if not authenticated
  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>📚 Agenda Universitaria</h1>
            <p>Gestiona tus horarios de clase y tareas de manera eficiente</p>
          </div>
          <div className="user-info">
            <div className="user-details">
              <UserIcon size={20} />
              <span>{user.username}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="class-filter-banner">
          <button 
            className="back-button"
            onClick={handleBackToClasses}
          >
            <ArrowLeft size={16} />
            Volver a Horarios
          </button>
          <div className="selected-class-info">
            <span style={{ color: selectedClass.color }}>📚</span>
            <span className="selected-class-name">{selectedClass.name}</span>
            <span className="selected-class-professor">- {selectedClass.professor}</span>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('classes');
            setSelectedClass(null);
          }}
        >
          <BookOpen size={20} />
          Horarios de Clase
        </button>
        <button
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={20} />
          {selectedClass ? `Tareas de ${selectedClass.name}` : 'Tareas'}
        </button>
      </div>

      <div className="content">
        {activeTab === 'classes' ? (
          <ClassManager 
            classes={classes} 
            setClasses={setClasses}
            onClassClick={handleClassClick}
          />
        ) : (
          <TaskManager 
            tasks={filteredTasks} 
            setTasks={setTasks} 
            classes={classes}
            selectedClass={selectedClass}
          />
        )}
      </div>
    </div>
  );
}

export default App; 