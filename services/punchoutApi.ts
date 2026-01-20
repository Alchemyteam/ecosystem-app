// Punchout API Service
import type {
  PunchoutCartItem,
  PunchoutReturnRequest,
  PunchoutReturnResponse,
  ValidateResponse,
} from '../types/punchout';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Session Token storage key
const PUNCHOUT_SESSION_TOKEN_KEY = 'punchoutSessionToken';

/**
 * Get Session Token
 */
export const getSessionToken = (): string | null => {
  return localStorage.getItem(PUNCHOUT_SESSION_TOKEN_KEY);
};

/**
 * Set Session Token
 */
export const setSessionToken = (token: string): void => {
  localStorage.setItem(PUNCHOUT_SESSION_TOKEN_KEY, token);
};

/**
 * Remove Session Token
 */
export const removeSessionToken = (): void => {
  localStorage.removeItem(PUNCHOUT_SESSION_TOKEN_KEY);
};

/**
 * Get Session Token from URL parameters
 */
export const getSessionTokenFromURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('sessionToken');
};

/**
 * Validate if session is valid
 */
export const validateSession = async (sessionToken: string): Promise<ValidateResponse> => {
  try {
    console.log('Validating session token:', sessionToken ? `${sessionToken.substring(0, 10)}...` : 'null');
    
    const url = `${API_BASE_URL}/punchout/validate?sessionToken=${encodeURIComponent(sessionToken)}`;
    console.log('Validation URL:', url);
    
    const response = await fetch(url);

    console.log('Validation response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('Validation error response:', errorData);
      } catch (parseError) {
        const text = await response.text();
        console.error('Validation error (non-JSON):', text);
        errorMessage = text || errorMessage;
      }
      
      return {
        valid: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    console.log('Validation response data:', data);
    return data;
  } catch (error) {
    console.error('Session validation failed:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Session validation failed',
    };
  }
};

/**
 * Return cart to buyer system
 */
export const returnCart = async (
  sessionToken: string,
  items: PunchoutCartItem[],
  buyerOrderNumber?: string,
  notes?: string
): Promise<PunchoutReturnResponse> => {
  if (!sessionToken) {
    throw new Error('Session token is required');
  }

  if (!items || items.length === 0) {
    throw new Error('Cart items are required');
  }

  // Validate items format
  for (const item of items) {
    if (!item.productId) {
      throw new Error('Product ID is required for all items');
    }
    if (!item.quantity || item.quantity < 1) {
      throw new Error('Quantity must be at least 1 for all items');
    }
  }

  const requestBody: PunchoutReturnRequest = {
    sessionToken,
    items,
    ...(buyerOrderNumber && { buyerOrderNumber }),
    ...(notes && { notes }),
  };

  // Debug: Print request data
  console.log('=== Sending Punchout Return Request ===');
  console.log('URL:', `${API_BASE_URL}/punchout/return`);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  console.log('Items:', JSON.stringify(requestBody.items, null, 2));
  console.log('======================================');

  try {
    const response = await fetch(`${API_BASE_URL}/punchout/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check HTTP status code
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Detailed log output
        console.error('=== Punchout Return Error ===');
        console.error('Status:', response.status, response.statusText);
        console.error('Error Response:', JSON.stringify(errorData, null, 2));
        console.error('Request Body:', JSON.stringify(requestBody, null, 2));
        console.error('Request Items:', JSON.stringify(requestBody.items, null, 2));
        console.error('===========================');
      } catch (parseError) {
        const text = await response.text();
        console.error('=== Punchout Return Error (Non-JSON) ===');
        console.error('Status:', response.status, response.statusText);
        console.error('Response Body:', text);
        console.error('Request Body:', JSON.stringify(requestBody, null, 2));
        console.error('========================================');
        errorMessage = text || errorMessage;
      }
      
      // Return error response format
      return {
        orderId: null,
        orderNumber: null,
        status: null,
        success: false,
        message: errorMessage,
        remainingAttempts: 0,
      };
    }

    const data = await response.json();

    // Even if HTTP status is 200, need to check business status
    return data;
  } catch (error) {
    console.error('Return cart failed:', error);
    // If network error or other error, also return error response format
    if (error instanceof Error) {
      return {
        orderId: null,
        orderNumber: null,
        status: null,
        success: false,
        message: error.message,
        remainingAttempts: 0,
      };
    }
    throw error;
  }
};

/**
 * Return cart with retry mechanism
 */
export const returnCartWithRetry = async (
  sessionToken: string,
  items: PunchoutCartItem[],
  buyerOrderNumber?: string,
  notes?: string,
  maxRetries: number = 3
): Promise<PunchoutReturnResponse> => {
  let lastError: Error | null = null;
  let remainingAttempts = maxRetries;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await returnCart(sessionToken, items, buyerOrderNumber, notes);

      if (response.success) {
        return response;
      }

      // Business failure, check remaining retry attempts
      remainingAttempts = response.remainingAttempts ?? 0;

      if (remainingAttempts <= 0) {
        throw new Error('Retry attempts exceeded');
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retry
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to return cart after retries');
};

/**
 * Convert cart data to Punchout format
 */
export const convertCartItemsToPunchout = (
  cartItems: Array<{
    product: {
      id: string;
      name?: string;
      price?: number;
    };
    quantity: number;
  }>
): PunchoutCartItem[] => {
  return cartItems.map((item) => {
    // Ensure data types are correct
    const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity), 10);
    const unitPrice = item.product.price !== undefined && item.product.price !== null 
      ? (typeof item.product.price === 'number' ? item.product.price : parseFloat(String(item.product.price)))
      : undefined;

    // Validate required fields
    if (!item.product.id) {
      console.warn('Cart item missing product ID:', item);
    }
    if (!quantity || quantity < 1) {
      console.warn('Cart item has invalid quantity:', item);
    }

    return {
      productId: String(item.product.id), // Ensure it's a string
      productName: item.product.name || undefined,
      quantity: quantity,
      unitPrice: unitPrice,
      unitOfMeasure: 'EA', // Default unit
    };
  });
};

