import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ClassManager from './components/ClassManager';
import TaskManager from './components/TaskManager';
import AdminPanel from './components/AdminPanel';
import ChangePassword from './components/ChangePassword';
import { api } from './services/api';
import './index.css';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'classes' | 'tasks' | 'admin'>('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleLogin(token);
    }
  }, []);

  const handleLogin = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      const userData = await api.get('/auth/me');
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión');
      localStorage.removeItem('token');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('dashboard');
    setError(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">📚 Agenda Universitaria</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('classes')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'classes'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📚 Clases
                </button>
                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'tasks'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Tareas
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'admin'
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                    }`}
                  >
                    👑 Panel Admin
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-bold border border-red-300">
                      👑 ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  title="Cambiar contraseña"
                >
                  🔐
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Banner */}
      {user.role === 'admin' && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="font-bold text-lg">Modo Administrador</h3>
                <p className="text-red-100 text-sm">Tienes acceso completo al sistema</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">Usuario: {user.username}</p>
              <p className="text-xs text-red-200">ID: {user.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {currentView === 'dashboard' && <Dashboard userRole={user.role} />}
        {currentView === 'classes' && <ClassManager />}
        {currentView === 'tasks' && <TaskManager />}
        {currentView === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}

export default App; 