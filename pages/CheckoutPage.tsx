import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, CartItemWithProduct, ApiError, CreateOrderRequest, ShippingAddress } from '../services/api';
import {
  ShoppingCart,
  Home,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  User,
  HelpCircle,
  FileText,
  Heart,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  MapPin,
  ArrowLeft,
} from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));

  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartData = await buyerApi.getCart();
      setCartItems(cartData.items);
      setTotal(cartData.total);
      setItemCount(cartData.itemCount);

      // If cart is empty, redirect to cart page
      if (cartData.items.length === 0) {
        navigate('/buyer/cart');
      }
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to load cart';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.street.trim()) {
      setNotification({ type: 'error', message: 'Please enter your street address' });
      setTimeout(() => setNotification(null), 3000);
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setNotification({ type: 'error', message: 'Please enter your city' });
      setTimeout(() => setNotification(null), 3000);
      return false;
    }
    if (!shippingAddress.postalCode.trim()) {
      setNotification({ type: 'error', message: 'Please enter your postal code' });
      setTimeout(() => setNotification(null), 3000);
      return false;
    }
    if (!shippingAddress.country.trim()) {
      setNotification({ type: 'error', message: 'Please enter your country' });
      setTimeout(() => setNotification(null), 3000);
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setNotification({ type: 'error', message: 'Your cart is empty' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const orderData: CreateOrderRequest = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      const response = await buyerApi.createOrder(orderData);
      
      setNotification({ type: 'success', message: 'Order placed successfully!' });
      
      // Redirect to order confirmation page or orders list after 2 seconds
      setTimeout(() => {
        navigate(`/buyer/orders/${response.order.id}`);
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to place order';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Calculate shipping (simplified - can be enhanced with actual shipping calculation)
  const shipping = total > 100 ? 0 : 10; // Free shipping over $100
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-600" size={48} />
            <p className="text-slate-600">Loading checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
      <main className="pt-20 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {/* Home */}
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            {/* Products */}
            <div>
              <button
                onClick={() => toggleMenu('products')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Products</span>
                </div>
                {expandedMenus.has('products') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('products') && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    to="/buyer/products"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    All Products
                  </Link>
                  <Link
                    to="/buyer/ai-search"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    AI Search
                  </Link>
                </div>
              )}
            </div>

            {/* Orders */}
            <Link
              to="/buyer/orders"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Orders</span>
            </Link>

            {/* Cart */}
            <Link
              to="/buyer/cart"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {itemCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-brand-600 text-white text-xs font-semibold rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <div>
              <button
                onClick={() => toggleMenu('favorites')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Favorites</span>
                </div>
                {expandedMenus.has('favorites') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Messages */}
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>

            {/* Account */}
            <div>
              <button
                onClick={() => toggleMenu('account')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Account</span>
                </div>
                {expandedMenus.has('account') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Support */}
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Support</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link to="/buyer" className="hover:text-brand-600">
                Buyer Portal
              </Link>
              <span>/</span>
              <Link to="/buyer/cart" className="hover:text-brand-600">
                Cart
              </Link>
              <span>/</span>
              <span className="text-slate-900">Checkout</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
                  <p className="text-sm text-slate-600">Complete your order</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Content */}
          <div className="flex-1 p-6">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="text-brand-600" size={20} />
                      <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                            placeholder="Singapore"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                            placeholder="123456"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                          placeholder="Singapore"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="text-brand-600" size={20} />
                      <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={paymentMethod === 'credit_card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">Credit Card</span>
                          <p className="text-sm text-slate-600">Pay with credit or debit card</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">Bank Transfer</span>
                          <p className="text-sm text-slate-600">Direct bank transfer</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-600"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-slate-900">PayPal</span>
                          <p className="text-sm text-slate-600">Pay with your PayPal account</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
                    
                    {/* Order Items */}
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="text-slate-400" size={24} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="text-slate-900 font-medium">{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Shipping</span>
                        <span className="text-slate-900 font-medium">
                          {shipping === 0 ? 'Free' : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax</span>
                        <span className="text-slate-900 font-medium">{formatPrice(tax)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-base font-semibold text-slate-900">Total</span>
                          <span className="text-xl font-bold text-brand-600">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || cartItems.length === 0}
                      className="w-full mt-6 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Place Order
                        </>
                      )}
                    </button>

                    <Link
                      to="/buyer/cart"
                      className="block mt-3 text-center text-sm text-brand-600 hover:text-brand-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <ArrowLeft size={14} />
                      Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;

