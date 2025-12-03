// API Service for communicating with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

// Auth API
export const authAPI = {
  register: async (nombre: string, email: string, password: string, apodo?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, apodo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetchWithAuth('/auth/me');

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  },
};

// User API
export const userAPI = {
  updateProfile: async (data: {
    nombre?: string;
    apodo?: string;
    preferencia_nombre?: 'nombre' | 'apodo' | 'ninguno';
    nombre_asistente?: string;
  }) => {
    const response = await fetchWithAuth('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }

    return response.json();
  },

  getStatistics: async () => {
    const response = await fetchWithAuth('/user/statistics');

    if (!response.ok) {
      throw new Error('Failed to get statistics');
    }

    return response.json();
  },

  deleteAccount: async () => {
    const response = await fetchWithAuth('/user/account', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Account deletion failed');
    }

    return response.json();
  },
};

// Session API
export const sessionAPI = {
  createSession: async (sessionData: {
    momento_dia: 'manana' | 'tarde' | 'noche';
    duracion_minutos: number;
    emocion_predominante: string;
    intensidad_promedio: number;
    evolucion: 'mejoro' | 'empeoro' | 'se_mantuvo';
    top_emociones: Array<{ emocion: string; porcentaje: number }>;
    ejercicios_realizados: string[];
    estado_emocional_final: string;
    calificacion_estrellas: number;
    conversacion: Array<{ role: 'user' | 'assistant'; text: string }>;
    tareas_asignadas?: Array<{
      titulo: string;
      descripcion: string;
      frecuencia: string;
      puntos: number;
    }>;
  }) => {
    const response = await fetchWithAuth('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Session creation failed');
    }

    return response.json();
  },

  getSessions: async () => {
    const response = await fetchWithAuth('/sessions');

    if (!response.ok) {
      throw new Error('Failed to get sessions');
    }

    return response.json();
  },

  getSessionById: async (sessionId: string) => {
    const response = await fetchWithAuth(`/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  deleteSession: async (sessionId: string) => {
    const response = await fetchWithAuth(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Session deletion failed');
    }

    return response.json();
  },

  getSessionStats: async () => {
    const response = await fetchWithAuth('/sessions/stats');

    if (!response.ok) {
      throw new Error('Failed to get session stats');
    }

    return response.json();
  },
};

// Task API
export const taskAPI = {
  createTask: async (taskData: {
    sesion_origen: string;
    titulo: string;
    descripcion: string;
    frecuencia: string;
    puntos: number;
    fecha_vencimiento: Date;
  }) => {
    const response = await fetchWithAuth('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Task creation failed');
    }

    return response.json();
  },

  getTasks: async (status?: 'pendiente' | 'completada') => {
    const url = status ? `/tasks?status=${status}` : '/tasks';
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error('Failed to get tasks');
    }

    return response.json();
  },

  getTaskById: async (taskId: string) => {
    const response = await fetchWithAuth(`/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error('Failed to get task');
    }

    return response.json();
  },

  completeTask: async (taskId: string) => {
    const response = await fetchWithAuth(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Task completion failed');
    }

    return response.json();
  },

  deleteTask: async (taskId: string) => {
    const response = await fetchWithAuth(`/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Task deletion failed');
    }

    return response.json();
  },

  getPendingCount: async () => {
    const response = await fetchWithAuth('/tasks/pending/count');

    if (!response.ok) {
      throw new Error('Failed to get pending count');
    }

    return response.json();
  },
};

// AI API
export const aiAPI = {
  sendMessage: async (message: string, conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) => {
    const response = await fetchWithAuth('/ai/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI message failed');
    }

    return response.json();
  },
};

export default {
  authAPI,
  userAPI,
  sessionAPI,
  taskAPI,
  aiAPI,
};
