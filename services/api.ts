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

// Buyer types
export interface BuyerSellerSummary {
  id: string;
  name: string;
  verified?: boolean;
  rating?: number;
}

export interface BuyerProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  images?: string[];
  seller?: BuyerSellerSummary;
  certification?: {
    peCertified: boolean;
    certificateNumber?: string;
    certifiedBy?: string;
    certifiedDate?: string;
  };
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchProductsParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchProductsResponse {
  products: BuyerProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeaturedProductsResponse {
  products: BuyerProduct[];
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AddToCartResponse {
  message: string;
  cartItem: CartItem;
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

const buildQueryString = (params: Record<string, unknown>): string => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
};

export const buyerApi = {
  searchProducts: async (params: SearchProductsParams = {}): Promise<SearchProductsResponse> => {
    const query = buildQueryString(params);
    return apiRequest<SearchProductsResponse>(`/buyer/products/search${query}`);
  },
  getFeaturedProducts: async (limit = 3): Promise<FeaturedProductsResponse> => {
    const query = buildQueryString({ limit });
    return apiRequest<FeaturedProductsResponse>(`/buyer/products/featured${query}`);
  },
  addToCart: async ({ productId, quantity = 1 }: AddToCartRequest): Promise<AddToCartResponse> => {
    return apiRequest<AddToCartResponse>('/buyer/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

