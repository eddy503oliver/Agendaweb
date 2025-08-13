// Configuración de la API para desarrollo y producción
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001/api'
  : 'https://agendaweb-production.up.railway.app/api'; // 👈 URL real de Railway

console.log('🌐 Configuración de API:');
console.log('   - isDevelopment:', isDevelopment);
console.log('   - API_BASE_URL:', API_BASE_URL);
console.log('   - window.location.hostname:', window.location.hostname);

// Types for API responses
interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

interface Class {
  id: number;
  name: string;
  professor?: string;
  day: string;
  start_time: string;
  end_time: string;
  classroom?: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  class_id?: number;
  class_name?: string;
  completed: boolean;
  created_at: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token en localStorage:', token ? token.substring(0, 50) + '...' : 'NO HAY TOKEN');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
  
  console.log('📋 Headers generados:', headers);
  return headers;
};

// Authentication API
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    console.log('Attempting to register user:', { username, email });
    console.log('API URL:', `${API_BASE_URL}/auth/register`);
    console.log('Full URL:', `${API_BASE_URL}/auth/register`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('isDevelopment:', isDevelopment);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el login');
    }

    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al cambiar la contraseña');
    }

    return data;
  },
};

// Classes API
export const classesAPI = {
  getAll: async (): Promise<Class[]> => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener las clases');
    }

    return data;
  },

  create: async (classData: Omit<Class, 'id' | 'created_at'>): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la clase');
    }

    return data;
  },

  update: async (id: number, classData: Partial<Class>): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar la clase');
    }

    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar la clase');
    }

    return data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (classId?: number): Promise<Task[]> => {
    const url = classId 
      ? `${API_BASE_URL}/tasks?classId=${classId}`
      : `${API_BASE_URL}/tasks`;
      
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener las tareas');
    }

    return data;
  },

  create: async (taskData: Omit<Task, 'id' | 'created_at' | 'completed'>): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la tarea');
    }

    return data;
  },

  update: async (id: number, taskData: Partial<Task>): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar la tarea');
    }

    return data;
  },

  toggleComplete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al cambiar el estado de la tarea');
    }

    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar la tarea');
    }

    return data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usuarios');
    }

    return data;
  },

  getStats: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas');
    }

    return data;
  },

  updateUserRole: async (userId: number, role: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar rol');
    }

    return data;
  },
};

// Generic API helper
export const api = {
  get: async (endpoint: string): Promise<any> => {
    console.log('🌐 Llamando GET a:', `${API_BASE_URL}${endpoint}`);
    
    const headers = getAuthHeaders();
    console.log('📤 Headers enviados:', headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: headers,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers);
    
    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (!response.ok) {
      console.error('❌ Error en la petición:', response.status, data);
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  },

  post: async (endpoint: string, body: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  },

  put: async (endpoint: string, body: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  },

  delete: async (endpoint: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  },
};
