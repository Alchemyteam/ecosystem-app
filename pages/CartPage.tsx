import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, CartItemWithProduct, ApiError } from '../services/api';
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
  Sparkles,
  Package,
  Plus,
  Minus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

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
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to load cart';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(cartItemId));
      await buyerApi.updateCartItem(cartItemId, newQuantity);
      await fetchCart();
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to update quantity';
      alert(errorMessage);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(cartItemId));
      await buyerApi.removeFromCart(cartItemId);
      await fetchCart();
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to remove item';
      alert(errorMessage);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-600" size={48} />
            <p className="text-slate-600">Loading cart...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
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
              <span className="text-slate-900">Cart</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Shopping Cart</h1>
                  <p className="text-sm text-slate-600">
                    {itemCount === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount > 1 ? 's' : ''} in your cart`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 p-6">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <ShoppingCart className="mx-auto text-slate-400 mb-4" size={64} />
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-600 mb-6">Add some products to get started!</p>
                <Link
                  to="/buyer/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                >
                  <Package size={18} />
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="text-slate-400" size={32} />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                  {item.product.name}
                                </h3>
                                <p className="text-sm text-slate-600">Product ID: {item.product.id}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Remove item"
                                disabled={updatingItems.has(item.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-600">Quantity:</span>
                                <div className="flex items-center gap-2 border border-slate-300 rounded-lg">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={updatingItems.has(item.id) || item.quantity <= 1}
                                    className="p-1.5 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="px-3 py-1 text-sm font-medium text-slate-900 min-w-[3rem] text-center">
                                    {updatingItems.has(item.id) ? (
                                      <Loader2 className="animate-spin text-brand-600 mx-auto" size={16} />
                                    ) : (
                                      item.quantity
                                    )}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    disabled={updatingItems.has(item.id)}
                                    className="p-1.5 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">
                                  {formatPrice(item.subtotal)}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {formatPrice(item.product.price)} each
                                </p>
                              </div>
                            </div>

                            {/* View Details Button */}
                            <div className="mt-4">
                              <button
                                onClick={() => navigate(`/buyer/products/${item.product.id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Items ({itemCount})</span>
                          <span className="text-slate-900 font-medium">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Shipping</span>
                          <span className="text-slate-900 font-medium">Calculated at checkout</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <div className="flex justify-between">
                            <span className="text-base font-semibold text-slate-900">Total</span>
                            <span className="text-xl font-bold text-brand-600">{formatPrice(total)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => navigate('/buyer/checkout')}
                      >
                        <CheckCircle2 size={18} />
                        Proceed to Checkout
                      </button>

                      <Link
                        to="/buyer/products"
                        className="block mt-3 text-center text-sm text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;

