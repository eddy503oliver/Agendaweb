// Configuración de la API para desarrollo y producción
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001/api'
  : 'https://tu-backend-url.com/api'; // 👈 Cambia esto por tu URL de producción

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
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Authentication API
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    console.log('Attempting to register user:', { username, email });
    console.log('API URL:', `${API_BASE_URL}/auth/register`);
    
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
