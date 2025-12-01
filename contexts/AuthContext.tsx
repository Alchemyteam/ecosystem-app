import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, ApiError } from '../services/api';

export type UserRole = 'Buyer' | 'Seller' | 'PE';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setCurrentRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('Buyer');

  // Load role from localStorage or use default
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && ['Buyer', 'Seller', 'PE'].includes(savedRole)) {
      setCurrentRoleState(savedRole);
    }
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem('userRole', role);
  };

  // Load user info on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (token) {
        try {
          // Verify token and get user info
          const isValid = await authApi.verifyToken();
          if (isValid) {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            authApi.logout();
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register({ email, password, name });
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const apiError = error as ApiError;
      
      // Handle validation errors
      if (apiError.errors) {
        const firstError = Object.values(apiError.errors)[0]?.[0];
        return {
          success: false,
          error: firstError || apiError.message || 'Registration failed. Please try again.',
        };
      }
      
      return {
        success: false,
        error: apiError.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    authApi.logout();
    // Navigate will be handled by the route protection
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setCurrentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

