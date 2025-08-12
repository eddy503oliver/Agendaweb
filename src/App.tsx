import { useState, useEffect } from 'react';
import Login from './components/Login';
import ClassManager from './components/ClassManager';
import TaskManager from './components/TaskManager';
import Dashboard from './components/Dashboard';
import { Class } from './types';
import './index.css';

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classes' | 'tasks'>('dashboard');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    try {
      console.log('App loading...');
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('Saved token:', savedToken ? 'exists' : 'none');
      console.log('Saved user:', savedUser ? 'exists' : 'none');
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error in App useEffect:', error);
      setError('Error loading application');
    }
  }, []);

  const handleLogin = (userData: User, userToken: string) => {
    try {
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error in handleLogin:', error);
      setError('Error during login');
    }
  };

  const handleLogout = () => {
    try {
      setUser(null);
      setToken(null);
      setSelectedClass(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error in handleLogout:', error);
      setError('Error during logout');
    }
  };

  const handleClassClick = (classData: Class) => {
    setSelectedClass(classData);
    setActiveTab('tasks');
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setActiveTab('classes');
  };

  // Show error if there's one
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error en la aplicación</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recargar página</button>
      </div>
    );
  }

  // If user is not authenticated, show login
  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>📚 Agenda Universitaria</h1>
          <div className="user-info">
            <div className="user-details">
              <span>👤 {user.username}</span>
              <small>{user.email}</small>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {selectedClass && (
        <div className="class-filter-banner">
          <button onClick={handleBackToClasses} className="back-button">
            ← Volver a Clases
          </button>
          <div className="selected-class-info">
            <div className="selected-class-name">{selectedClass.name}</div>
            <div className="selected-class-professor">
              {selectedClass.professor && `Prof. ${selectedClass.professor}`}
            </div>
          </div>
        </div>
      )}

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          📅 Horarios de Clase
        </button>
        <button
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✅ Tareas
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard selectedClass={selectedClass} />
        )}
        {activeTab === 'classes' && (
          <ClassManager onClassClick={handleClassClick} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager selectedClass={selectedClass} />
        )}
      </main>
    </div>
  );
}

export default App; 