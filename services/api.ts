// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
const removeToken = (): void => {
  localStorage.removeItem('token');
};

// API request wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'An error occurred',
        errors: data.errors,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error && 'message' in error) {
      throw error;
    }
    throw {
      message: 'Network error. Please check your connection.',
    } as ApiError;
  }
}

// Auth API functions
export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store token
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    return await apiRequest<AuthResponse['user']>('/auth/me');
  },

  // Logout
  logout: (): void => {
    removeToken();
  },

  // Verify token
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiRequest<{ valid: boolean }>('/auth/verify');
      return true;
    } catch {
      return false;
    }
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

