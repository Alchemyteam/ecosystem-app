import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, getToken } from '../services/api';
import { SalesData } from '../types/salesData';
import {
  validateSession,
  getSessionToken,
  getSessionTokenFromURL,
  setSessionToken,
} from '../services/punchoutApi';
import {
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Building2,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react';

const PunchoutShoppingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [punchoutSessionToken, setPunchoutSessionToken] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Initialize: Get sessionToken and validate session
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get sessionToken from URL
        let token = getSessionTokenFromURL();
        
        if (token) {
          setSessionToken(token);
          setPunchoutSessionToken(token);
        } else {
          // Get from localStorage
          token = getSessionToken();
          if (token) {
            setPunchoutSessionToken(token);
          } else {
            setError('Session token not found. Please restart the purchase flow.');
            setIsLoading(false);
            return;
          }
        }

        if (!token) {
          setError('Session token not found. Please restart the purchase flow.');
          setIsLoading(false);
          return;
        }

        // Validate session
        const validationResult = await validateSession(token);
        if (!validationResult.valid) {
          setError(validationResult.error || 'Session expired. Please restart the purchase flow.');
          setSessionValid(false);
          setIsLoading(false);
          return;
        }

        setSessionValid(true);
        
        // Load cart item count
        await loadCartItemCount();
        
        // Load product list
        await fetchProducts();
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Periodically check session status (every 5 minutes)
  useEffect(() => {
    if (!punchoutSessionToken) return;

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
  }, [punchoutSessionToken]);

  // Reload products when search, category, sort, or page changes
  useEffect(() => {
    if (sessionValid) {
      fetchProducts();
    }
  }, [currentPage, sortBy, category, searchTerm, sessionValid]);

  // Load cart item count
  const loadCartItemCount = async () => {
    try {
      const cartData = await buyerApi.getCart();
      setCartItemCount(cartData.itemCount);
    } catch (err) {
      console.error('Failed to load cart count:', err);
    }
  };

  // Fetch product list
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: limit,
        sort: sortBy,
      };

      if (category !== 'all') {
        params.category = category;
      }

      if (searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }

      const response = await buyerApi.getAllProducts(params);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Add to cart
  const handleAddToCart = async (product: SalesData) => {
    try {
      // Use product ID (database primary key, recommended)
      // If id doesn't exist, use TXNo as fallback
      let productId: string = '';
      
      if (product.id !== null && product.id !== undefined && product.id !== '') {
        productId = String(product.id);
      } else if (product.TXNo) {
        productId = product.TXNo;
      }
      
      if (!productId) {
        setNotification({ type: 'error', message: 'Product ID not found. Cannot add to cart.' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      await buyerApi.addToCart({ productId, quantity: 1 });
      
      setNotification({ type: 'success', message: 'Added to cart' });
      setTimeout(() => setNotification(null), 3000);
      
      // Update cart count
      await loadCartItemCount();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      setNotification({ 
        type: 'error', 
        message: errorMessage
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Navigate to checkout page
  const handleGoToCheckout = () => {
    if (punchoutSessionToken) {
      navigate(`/buyer/checkout?sessionToken=${punchoutSessionToken}`);
    } else {
      navigate('/buyer/checkout');
    }
  };

  if (isLoading && !products.length) {
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

      <main className="pt-20">
        {/* Top banner - Punchout mode indicator */}
        <div className="bg-brand-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={20} />
              <span className="font-medium">Punchout Purchase Mode</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to={`/buyer/cart`}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ShoppingCart size={18} />
                <span>Cart ({cartItemCount})</span>
              </Link>
              <button
                onClick={handleGoToCheckout}
                className="flex items-center gap-2 px-4 py-2 bg-white text-brand-600 hover:bg-white/90 rounded-lg font-medium transition-colors"
              >
                Return to ERP System
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Session status indicator */}
        {sessionValid === false && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-700">
              <AlertCircle size={18} />
              <span>Session expired. Please restart the purchase flow.</span>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title and search */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Products</h1>
            <p className="text-slate-600 mb-4">Select products you need and add them to cart</p>
            
            {/* Search bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Product list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Package className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product, index) => {
                  const productKey = product.id ? String(product.id) : (product.TXNo || `product-${index}`);
                  return (
                  <div
                    key={productKey}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Product image placeholder */}
                    <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                      <Package className="text-slate-400" size={48} />
                    </div>

                    {/* Product info */}
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {product.ItemName || 'Unnamed Product'}
                    </h3>
                    
                    <div className="space-y-1 mb-4 text-sm text-slate-600">
                      {product.ItemCode && (
                        <p>Product Code: {product.ItemCode}</p>
                      )}
                      {product.ItemType && (
                        <p>Type: {product.ItemType}</p>
                      )}
                      {product.Model && (
                        <p>Model: {product.Model}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xl font-bold text-brand-600">
                        {formatPrice(product.TXP1)}
                      </p>
                      {product.UOM && (
                        <p className="text-xs text-slate-500">Unit: {product.UOM}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {(product.id || product.TXNo) && (
                        <button
                          onClick={() => {
                            const productId = product.id ? String(product.id) : (product.TXNo || '');
                            navigate(`/buyer/products/${productId}`);
                          }}
                          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-2 text-slate-600">
                    Page {currentPage} of {totalPages} (Total {total} products)
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PunchoutShoppingPage;

