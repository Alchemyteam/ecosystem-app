import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ShoppingCart,
  Search,
  Heart,
  Package,
  TrendingUp,
  Loader2,
  Filter,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { buyerApi, BuyerProduct } from '../services/api';

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Formwork Systems', value: 'formwork' },
  { label: 'Scaffolding', value: 'scaffolding' },
  { label: 'Support Systems', value: 'support' },
  { label: 'Accessories', value: 'accessories' },
];

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price?: number;
  currency?: string;
}

const BuyerPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchResults, setSearchResults] = useState<BuyerProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<BuyerProduct[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const totalOrderCount = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.quantity, 0),
    [orderItems]
  );

  const priceRangeSummary = useMemo(() => {
    if (!minPrice && !maxPrice) return 'Any price';
    if (minPrice && maxPrice) return `$${minPrice} - $${maxPrice}`;
    if (minPrice) return `From $${minPrice}`;
    return `Up to $${maxPrice}`;
  }, [minPrice, maxPrice]);

  const performSearch = async (overrideParams: Partial<Record<string, string | number>> = {}) => {
    setIsSearching(true);
    setSearchError('');
    try {
      const params = {
        keyword: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        limit: 6,
        ...overrideParams,
      };
      const response = await buyerApi.searchProducts(params);
      setSearchResults(response.products);
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to search products. Please try again.';
      setSearchError(message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setIsFeaturedLoading(true);
    try {
      const response = await buyerApi.getFeaturedProducts();
      setFeaturedProducts(response.products);
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    performSearch();
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await buyerApi.addToCart({ productId, quantity: 1 });
      setOrderItems((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        const product =
          searchResults.find((p) => p.id === productId) || featuredProducts.find((p) => p.id === productId);
        if (!product) return prev;
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            currency: product.currency,
          },
        ];
      });
      setNotification({ type: 'success', message: 'Product added to My Orders' });
    } catch (error) {
      const message = (error as { message?: string })?.message || 'Failed to add to cart.';
      setNotification({ type: 'error', message });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
    performSearch({ limit: 6 });
  }, []);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  }, [isSearchModalOpen]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Buyer Portal</h1>
              <p className="text-slate-600">Browse certified products and manage your purchase journey</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => performSearch()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors"
              >
                <Search size={16} />
                Refresh Search
              </button>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Filter size={16} />
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Notifications */}
          {notification && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${
                notification.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {notification.message}
            </div>
          )}

          {/* Search Modal */}
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                onClick={() => setIsSearchModalOpen(false)}
              />
              <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <SlidersHorizontal size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">Search Products</h2>
                        <p className="text-sm text-slate-500">
                          Filter by category, price range, and keywords to find the right products
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSearchModalOpen(false)}
                      className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-xs font-semibold text-slate-500 block mb-2">Keyword</label>
                          <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search by product name, material, or seller"
                              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-2">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                          >
                            {CATEGORY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 block mb-2">Price Range</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={0}
                              placeholder="Min"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value)}
                              className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                            <input
                              type="number"
                              min={0}
                              placeholder="Max"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value)}
                              className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Current filter: {priceRangeSummary}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Quick filters:</span>
                          {['PE Certified', 'Ready to Ship', 'Highest Rating', 'Newly Added'].map((filter) => (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => {
                                setSearchTerm(filter);
                                performSearch({ keyword: filter });
                              }}
                              className="px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
                            >
                              {filter}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Clear Filters
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-colors flex items-center gap-2"
                          >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Search
                          </button>
                        </div>
                      </div>
                    </form>

                    {searchError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                        <AlertCircle size={16} />
                        {searchError}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Search results</p>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {isSearching ? 'Searching products...' : `${searchResults.length} products found`}
                          </h3>
                        </div>
                      </div>
                      {isSearching ? (
                        <div className="flex justify-center py-10">
                          <Loader2 size={32} className="animate-spin text-brand-600" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                          No products found. Try adjusting your filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {searchResults.map((product) => (
                            <div
                              key={product.id}
                              className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded-xl"
                                    />
                                  ) : (
                                    <Package className="text-slate-400" size={32} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-medium text-brand-600">
                                      {product.category ? product.category : 'Certified Product'}
                                    </p>
                                    {product.certification?.peCertified && (
                                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        PE CERTIFIED
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-lg font-semibold text-slate-900">{product.name}</h4>
                                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-2xl font-bold text-slate-900">
                                        {product.price != null
                                          ? `${product.currency || 'USD'} ${product.price.toFixed(2)}`
                                          : 'Contact for price'}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Stock: {product.stock ?? 'N/A'} · Rating: {product.rating ?? 'New'}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleAddToCart(product.id)}
                                      className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
                                    >
                                      <ShoppingCart size={16} />
                                      Add to Cart
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Modal */}
          {isOrdersModalOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsOrdersModalOpen(false)}
              />
              <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">My Orders</h2>
                      <p className="text-sm text-slate-500">Recently added items</p>
                    </div>
                    <button
                      onClick={() => setIsOrdersModalOpen(false)}
                      className="w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    {orderItems.length === 0 ? (
                      <div className="text-center text-slate-500 py-10 border border-dashed border-slate-200 rounded-2xl">
                        No orders yet. Add products to see them here.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {orderItems.map((item) => (
                            <div
                              key={item.productId}
                              className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm text-slate-500">#{item.productId.slice(-6).toUpperCase()}</p>
                                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                                <p className="text-sm text-slate-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">
                                  {item.price != null
                                    ? `${item.currency || 'USD'} ${(item.price * item.quantity).toFixed(2)}`
                                    : 'Contact for price'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <div className="text-sm text-slate-500">Items: {orderItems.length}</div>
                          <div className="text-right">
                            <p className="text-xs uppercase text-slate-500">Estimated Total</p>
                            <p className="text-2xl font-bold text-slate-900">
                              {orderItems
                                .filter((item) => item.price != null)
                                .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
                                .toFixed(2)}{' '}
                              {orderItems.find((item) => item.currency)?.currency || 'USD'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setOrderItems([]);
                        setIsOrdersModalOpen(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Clear
                    </button>
                    <button className="px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-colors">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Search Products</h3>
                  <p className="text-sm text-slate-600">Find what you need</p>
                </div>
              </div>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Open Search
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full border border-white/70 bg-white/80 text-green-700 px-3 py-1 text-xs font-semibold shadow-sm">
                <ShoppingCart size={14} />
                <span>{totalOrderCount}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">My Orders</h3>
                  <p className="text-sm text-slate-600">Track your purchases</p>
                </div>
              </div>
              <button
                onClick={() => setIsOrdersModalOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                View Orders
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Wishlist</h3>
                  <p className="text-sm text-slate-600">Save for later</p>
                </div>
              </div>
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Wishlist
              </button>
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <button
                onClick={() => fetchFeaturedProducts()}
                className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-2"
              >
                Refresh
                {isFeaturedLoading && <Loader2 size={14} className="animate-spin" />}
              </button>
            </div>
            {isFeaturedLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-brand-600" />
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                No featured products available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="text-slate-400" size={40} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-600 mb-2">
                      <span>{product.category || 'Featured'}</span>
                      {product.certification?.peCertified && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                          PE CERTIFIED
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">
                        {product.price != null
                          ? `${product.currency || 'USD'} ${product.price.toFixed(2)}`
                          : 'Contact for price'}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Total Orders</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-600 mt-1">This month</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">5</p>
              <p className="text-sm text-slate-600 mt-1">In progress</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Wishlist Items</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-600 mt-1">Saved items</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerPage;
