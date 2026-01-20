import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, CartItemWithProduct } from '../services/api';
import {
  validateSession,
  returnCartWithRetry,
  getSessionToken,
  setSessionToken,
  getSessionTokenFromURL,
  convertCartItemsToPunchout,
} from '../services/punchoutApi';
import type { PunchoutCartItem } from '../types/punchout';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

const PunchoutReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [sessionToken, setSessionTokenState] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [punchoutItems, setPunchoutItems] = useState<PunchoutCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  // Initialize: Get sessionToken and validate session
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Get sessionToken from URL
        let token = getSessionTokenFromURL();
        
        if (token) {
          setSessionToken(token);
          setSessionTokenState(token);
        } else {
          // Get from localStorage
          token = getSessionToken();
          if (token) {
            setSessionTokenState(token);
          } else {
            setError('Session token not found. Please restart the purchase flow.');
            setLoading(false);
            return;
          }
        }

        if (!token) {
          setError('Session token not found. Please restart the purchase flow.');
          setLoading(false);
          return;
        }

        // 2. Validate session
        const validationResult = await validateSession(token);
        if (!validationResult.valid) {
          setError(validationResult.error || 'Session expired. Please restart the purchase flow.');
          setSessionValid(false);
          setLoading(false);
          return;
        }

        setSessionValid(true);

        // 3. Load cart data
        await loadCartItems();
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Periodically check session status (every 5 minutes)
  useEffect(() => {
    if (!sessionToken) return;

    const interval = setInterval(async () => {
      const token = getSessionToken();
      if (token) {
        const validationResult = await validateSession(token);
        if (!validationResult.valid) {
          setError('Your session has expired. Please restart the purchase flow.');
          setSessionValid(false);
        } else {
          setSessionValid(true);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessionToken]);

  // Load cart data
  const loadCartItems = async () => {
    try {
      const cartData = await buyerApi.getCart();
      setCartItems(cartData.items);

      // Convert to Punchout format
      const convertedItems = convertCartItemsToPunchout(cartData.items);
      setPunchoutItems(convertedItems);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    }
  };

  // Return cart to buyer system
  const handleReturnCart = async () => {
    if (!sessionToken) {
      setError('Session token not found');
      return;
    }

    if (punchoutItems.length === 0) {
      setError('Cart is empty. Please add at least one item.');
      return;
    }

    setReturning(true);
    setError(null);

    try {
      const response = await returnCartWithRetry(
        sessionToken,
        punchoutItems
      );

      if (response.success) {
        setSuccess(true);
        // Close window or redirect after 3 seconds
        setTimeout(() => {
          // Try to close window (if opened via window.open)
          if (window.opener) {
            window.close();
          } else {
            // Otherwise redirect to home
            navigate('/');
          }
        }, 3000);
      } else {
        // Business failure
        let errorMessage = response.message || 'Failed to return cart';
        
        if (response.remainingAttempts && response.remainingAttempts > 0) {
          errorMessage = `${errorMessage} (Remaining attempts: ${response.remainingAttempts})`;
        } else {
          errorMessage = `${errorMessage}. Please restart the purchase flow.`;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Return cart failed:', err);
      setError(err instanceof Error ? err.message : 'Network error, please try again later');
    } finally {
      setReturning(false);
    }
  };

  // Revalidate session
  const handleRevalidate = async () => {
    if (!sessionToken) return;

    setLoading(true);
    setError(null);

    try {
      const validationResult = await validateSession(sessionToken);
      if (validationResult.valid) {
        setSessionValid(true);
        setError(null);
      } else {
        setSessionValid(false);
        setError(validationResult.error || 'Session expired');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-600" size={48} />
            <p className="text-slate-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Return to Buyer System
            </h1>
            <p className="text-slate-600">
              Return cart data to the buyer system
            </p>
          </div>

          {/* Session status indicator */}
          {sessionValid !== null && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 flex items-center gap-2 ${
                sessionValid
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {sessionValid ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Session valid</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  <span>Session expired or invalid</span>
                  <button
                    onClick={handleRevalidate}
                    className="ml-auto flex items-center gap-1 px-3 py-1 text-sm border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Revalidate
                  </button>
                </>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>Cart successfully returned to buyer system. Window will close in 3 seconds...</span>
            </div>
          )}

          {/* Cart items list */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} className="text-brand-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Cart Items
              </h2>
              <span className="text-sm text-slate-600">
                ({cartItems.length} items)
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600">Cart is empty. Please add at least one item.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="text-slate-400" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Product ID: {item.product.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="font-semibold text-slate-900">
                        {formatPrice(item.subtotal)}
                      </p>
                      {item.product.price && (
                        <p className="text-xs text-slate-500">
                          Unit Price: {formatPrice(item.product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturnCart}
              disabled={returning || success || cartItems.length === 0 || sessionValid === false}
              className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {returning ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Return to Buyer System
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/buyer/products')}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PunchoutReturnPage;

