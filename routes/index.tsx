import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import BuyerPage from '../pages/BuyerPage';
import ProductsListPage from '../pages/ProductsListPage';
import AISearchPage from '../pages/AISearchPage';
import ChatboxPage from '../pages/ChatboxPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import PriceInsightsPage from '../pages/PriceInsightsPage';
import OrdersPage from '../pages/OrdersPage';
import TrackingPage from '../pages/TrackingPage';
import SellerPage from '../pages/SellerPage';
import PEPage from '../pages/PEPage';
import SalesDataManagementPage from '../pages/SalesDataManagementPage';
import PurchaseConsolePage from '../pages/PurchaseConsolePage';
import PurchaseRequestPage from '../pages/PurchaseRequestPage';
import PunchoutReturnPage from '../pages/PunchoutReturnPage';
import PunchoutShoppingPage from '../pages/PunchoutShoppingPage';
import BuyerLayout from '../layouts/BuyerLayout';
import AuthCallbackRoute from './AuthCallbackRoute';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to home if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            {/* OAuth Callback Route */}
            <Route
              path="/auth/bc/callback"
              element={<AuthCallbackRoute />}
            />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer"
        element={
          <ProtectedRoute>
            <BuyerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/products"
        element={
          <ProtectedRoute>
            <ProductsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/ai-search"
        element={
          <ProtectedRoute>
            <AISearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/messages"
        element={
          <ProtectedRoute>
            <ChatboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/products/:productId"
        element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/price-insights"
        element={
          <ProtectedRoute>
            <PriceInsightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/tracking"
        element={
          <ProtectedRoute>
            <TrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/tracking/:orderId"
        element={
          <ProtectedRoute>
            <TrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/sales-data-management"
        element={
          <ProtectedRoute>
            <SalesDataManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/purchase-console"
        element={
          <ProtectedRoute>
            <PurchaseConsolePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/purchase-requests"
        element={
          <ProtectedRoute>
            <PurchaseRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/purchase-requests/new"
        element={
          <ProtectedRoute>
            <PurchaseRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/purchase-requests/:id"
        element={
          <ProtectedRoute>
            <PurchaseRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute>
            <SellerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pe"
        element={
          <ProtectedRoute>
            <PEPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/punchout/shopping"
        element={
          <ProtectedRoute>
            <PunchoutShoppingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/punchout/return"
        element={
          <ProtectedRoute>
            <PunchoutReturnPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

