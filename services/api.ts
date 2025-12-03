// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Import types
import type { SalesDataQueryParams } from '../types/salesData';

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
  historicalLowPrice?: number;
  lastTransactionPrice?: number;
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

// Chat types
export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
}

export interface ChatTableData {
  title: string;
  headers: string[];
  rows: Record<string, unknown>[];
  description?: string;
}

export interface ChatActionData {
  actionType: string;
  parameters: Record<string, unknown>;
  message: string;
}

export interface ChatMessageResponse {
  response: string;
  conversationId: string;
  tableData?: ChatTableData;
  actionData?: ChatActionData;
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

export interface GetAllProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  keyword?: string;
  // 交易相关
  minDate?: string;
  maxDate?: string;
  txNo?: string;
  minQty?: number;
  maxQty?: number;
  minPrice?: number;
  maxPrice?: number;
  minValue?: number;
  maxValue?: number;
  // 买家相关
  buyerCode?: string;
  buyerName?: string;
  // 产品相关
  itemCode?: string;
  itemName?: string;
  productHierarchy3?: string;
  itemType?: string;
  model?: string;
  material?: string;
  uom?: string;
  // 品牌和性能
  brandCode?: string;
  performance?: string;
  performance1?: string;
  // 成本和功能
  minUnitCost?: number;
  maxUnitCost?: number;
  function?: string;
  // 行业相关
  sector?: string;
  subSector?: string;
  // 其他
  source?: string;
}

export const buyerApi = {
  searchProducts: async (params: SearchProductsParams = {}): Promise<SearchProductsResponse> => {
    const query = buildQueryString(params as Record<string, unknown>);
    return apiRequest<SearchProductsResponse>(`/buyer/products/search${query}`);
  },
  getAllProducts: async (params: GetAllProductsParams = {}): Promise<SalesDataResponse> => {
    // 使用新的 getSalesData API 函数
    const { getSalesData } = await import('./salesDataApi');
    const token = getToken();
    if (!token) {
      throw new Error('未授权：请先登录');
    }
    
    // 转换参数格式
    // 确保 sort 参数只使用支持的值
    let sortValue: 'newest' | 'price_asc' | 'price_desc' | undefined = undefined;
    if (params.sort) {
      const validSorts: ('newest' | 'price_asc' | 'price_desc')[] = ['newest', 'price_asc', 'price_desc'];
      if (validSorts.includes(params.sort as any)) {
        sortValue = params.sort as 'newest' | 'price_asc' | 'price_desc';
      } else {
        // 如果是不支持的 sort 值，默认使用 'newest'
        console.warn(`不支持的 sort 值: ${params.sort}，使用默认值 'newest'`);
        sortValue = 'newest';
      }
    }
    
    // 只传递 API 文档中定义的参数，过滤掉任何其他参数
    const queryParams: SalesDataQueryParams = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (sortValue !== undefined) queryParams.sort = sortValue;
    if (params.category !== undefined && params.category !== 'all') {
      queryParams.category = params.category;
    }
    if (params.keyword !== undefined && params.keyword.trim() !== '') {
      queryParams.keyword = params.keyword.trim();
    }
    // 添加筛选参数（这些参数需要后端支持）- 根据 sales_data 表格结构
    // 交易相关
    if (params.minDate !== undefined) queryParams.minDate = params.minDate;
    if (params.maxDate !== undefined) queryParams.maxDate = params.maxDate;
    if (params.txNo !== undefined && params.txNo.trim() !== '') queryParams.txNo = params.txNo.trim();
    if (params.minQty !== undefined) queryParams.minQty = params.minQty;
    if (params.maxQty !== undefined) queryParams.maxQty = params.maxQty;
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
    if (params.minValue !== undefined) queryParams.minValue = params.minValue;
    if (params.maxValue !== undefined) queryParams.maxValue = params.maxValue;
    // 买家相关
    if (params.buyerCode !== undefined && params.buyerCode.trim() !== '') queryParams.buyerCode = params.buyerCode.trim();
    if (params.buyerName !== undefined && params.buyerName.trim() !== '') queryParams.buyerName = params.buyerName.trim();
    // 产品相关
    if (params.itemCode !== undefined && params.itemCode.trim() !== '') queryParams.itemCode = params.itemCode.trim();
    if (params.itemName !== undefined && params.itemName.trim() !== '') queryParams.itemName = params.itemName.trim();
    if (params.productHierarchy3 !== undefined && params.productHierarchy3.trim() !== '') queryParams.productHierarchy3 = params.productHierarchy3.trim();
    if (params.itemType !== undefined && params.itemType.trim() !== '') queryParams.itemType = params.itemType.trim();
    if (params.model !== undefined && params.model.trim() !== '') queryParams.model = params.model.trim();
    if (params.material !== undefined && params.material.trim() !== '') queryParams.material = params.material.trim();
    if (params.uom !== undefined && params.uom.trim() !== '') queryParams.uom = params.uom.trim();
    // 品牌和性能
    if (params.brandCode !== undefined && params.brandCode.trim() !== '') queryParams.brandCode = params.brandCode.trim();
    if (params.performance !== undefined && params.performance.trim() !== '') queryParams.performance = params.performance.trim();
    if (params.performance1 !== undefined && params.performance1.trim() !== '') queryParams.performance1 = params.performance1.trim();
    // 成本和功能
    if (params.minUnitCost !== undefined) queryParams.minUnitCost = params.minUnitCost;
    if (params.maxUnitCost !== undefined) queryParams.maxUnitCost = params.maxUnitCost;
    if (params.function !== undefined && params.function.trim() !== '') queryParams.function = params.function.trim();
    // 行业相关
    if (params.sector !== undefined && params.sector.trim() !== '') queryParams.sector = params.sector.trim();
    if (params.subSector !== undefined && params.subSector.trim() !== '') queryParams.subSector = params.subSector.trim();
    // 其他
    if (params.source !== undefined && params.source.trim() !== '') queryParams.source = params.source.trim();
    
    try {
      const response = await getSalesData(queryParams, token);
      return response;
    } catch (error) {
      console.error('=== API Error ===');
      console.error('Error fetching sales data:', error);
      throw error;
    }
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

// Chat API functions
// 注意：为了向后兼容，保留此 API
// 新的实现请使用 services/chatApi.ts 中的 sendChatMessage
export const chatApi = {
  sendMessage: async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
    // 使用新的 chatApi 实现
    const { sendChatMessage } = await import('./chatApi');
    const token = getToken();
    if (!token) {
      throw new Error('未授权：请先登录');
    }
    const response = await sendChatMessage(request.message, token, request.conversationId);
    // 转换响应格式以保持兼容性
    return {
      response: response.response,
      conversationId: response.conversationId,
      tableData: response.tableData,
      actionData: response.actionData,
    };
  },
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    return apiRequest<{ status: string; service: string }>('/chat/health');
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

