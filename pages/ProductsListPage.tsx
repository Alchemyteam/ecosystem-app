import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { buyerApi, BuyerProduct } from '../services/api';
import {
  Package,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Search,
  Filter,
  TrendingDown,
  DollarSign,
  Star,
  CheckCircle2,
  Home,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  MessageSquare,
  User,
  HelpCircle,
  FileText,
  Heart,
  Sparkles,
  LayoutGrid,
  Table,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<BuyerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const handleAskAI = (product: BuyerProduct) => {
    // Navigate to AI Search page with product context
    navigate('/buyer/ai-search', { state: { product } });
  };

  const CATEGORY_OPTIONS = [
    { label: 'All Categories', value: 'all' },
    { label: 'Formwork Systems', value: 'formwork' },
    { label: 'Scaffolding', value: 'scaffolding' },
    { label: 'Support Systems', value: 'support' },
    { label: 'Accessories', value: 'accessories' },
  ];

  const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: Highest', value: 'rating_desc' },
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: any = {
        page: currentPage,
        limit,
        sort: sortBy,
      };
      if (category !== 'all') {
        params.category = category;
      }
      if (searchTerm) {
        // If search term exists, use search endpoint instead
        const searchResponse = await buyerApi.searchProducts({
          keyword: searchTerm,
          category: category !== 'all' ? category : undefined,
          page: currentPage,
          limit,
        });
        setProducts(searchResponse.products);
        setTotalPages(searchResponse.pagination?.totalPages || 1);
        setTotal(searchResponse.pagination?.total || 0);
      } else {
        const response = await buyerApi.getAllProducts(params);
        setProducts(response.products);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Failed to load products. Please try again.';
      setError(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, category]);

  useEffect(() => {
    console.log('viewMode:', viewMode, 'isSidebarOpen:', isSidebarOpen);
  }, [viewMode, isSidebarOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const formatPrice = (price: number, currency?: string) => {
    // Validate currency code - must be 3 uppercase letters (ISO 4217 format)
    const validCurrency = currency && /^[A-Z]{3}$/.test(currency.toUpperCase())
      ? currency.toUpperCase()
      : 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(price);
    } catch (error) {
      // Fallback to USD if currency is still invalid
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="pt-20 flex">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] sticky top-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'
            } ${isSidebarOpen ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <nav className={`p-4 space-y-1 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Toggle Button */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Hide sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
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
                  <ChevronRightIcon className="w-4 h-4" />
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
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Search
                  </a>
                  <Link
                    to="/buyer/ai-search"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    AI Search
                  </Link>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Price Insights
                  </a>
                </div>
              )}
            </div>

            {/* Orders */}
            <div>
              <button
                onClick={() => toggleMenu('orders')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                </div>
                {expandedMenus.has('orders') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('orders') && (
                <div className="ml-8 mt-1 space-y-1">
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    All Orders
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Pending Payment
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    To Be Shipped
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Shipped
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Completed
                  </a>
                </div>
              )}
            </div>

            {/* Cart */}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
            </a>

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
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('favorites') && (
                <div className="ml-8 mt-1 space-y-1">
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Products
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Stores / Sellers
                  </a>
                </div>
              )}
            </div>

            {/* Messages */}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </a>

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
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('account') && (
                <div className="ml-8 mt-1 space-y-1">
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Profile
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Address
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Company Info
                  </a>
                </div>
              )}
            </div>

            {/* Support */}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Support</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 bg-white relative min-w-0">
          {/* Sidebar Toggle Button (when sidebar is hidden) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-4 top-8 z-10 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Show sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Link to="/buyer" className="hover:text-brand-600">
                  Buyer Portal
                </Link>
                <span>/</span>
                <span className="text-slate-900">All Products</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">All Products</h1>
                  <p className="text-slate-600">Browse and manage all available products</p>
                </div>
                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'card'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <LayoutGrid size={18} />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'table'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Table size={18} />
                    Table
                  </button>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Search
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-brand-600" size={32} />
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Package className="mx-auto mb-4 text-slate-400" size={48} />
                    <p className="text-lg font-medium text-slate-900 mb-2">No products found</p>
                    <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
                  </div>
                ) : viewMode === 'card' ? (
                  <>
                    {/* Card View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                          {/* Product Image */}
                          <div className="relative h-48 bg-slate-100">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-slate-400" size={48} />
                              </div>
                            )}
                            {product.certification?.peCertified && (
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                                  <CheckCircle2 size={12} />
                                  PE Certified
                                </span>
                              </div>
                            )}
                            {product.category && (
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-slate-700 backdrop-blur-sm">
                                  {product.category}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-5">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
                            {product.description && (
                              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.description}</p>
                            )}

                            {/* Seller Info */}
                            {product.seller && (
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-slate-600">{product.seller.name}</span>
                                {product.seller.verified && (
                                  <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                                )}
                              </div>
                            )}

                            {/* Price Section */}
                            <div className="mb-4 space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                              </div>

                              {/* Historical Low Price */}
                              {product.historicalLowPrice !== undefined && (
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingDown className="w-4 h-4 text-blue-600" />
                                  <span className="text-slate-600">Historical Low:</span>
                                  <span className="font-semibold text-blue-600">
                                    {formatPrice(product.historicalLowPrice, product.currency)}
                                  </span>
                                </div>
                              )}

                              {/* Last Transaction Price */}
                              {product.lastTransactionPrice !== undefined && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-slate-600">Last Transaction:</span>
                                  <span className="font-semibold text-green-600">
                                    {formatPrice(product.lastTransactionPrice, product.currency)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-sm">
                                {product.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium text-slate-900">{product.rating.toFixed(1)}</span>
                                    {product.reviewsCount !== undefined && (
                                      <span className="text-slate-500">({product.reviewsCount})</span>
                                    )}
                                  </div>
                                )}
                                {product.stock !== undefined && (
                                  <span
                                    className={`font-medium ${product.stock > 0
                                      ? product.stock < 10
                                        ? 'text-amber-600'
                                        : 'text-green-600'
                                      : 'text-red-600'
                                      }`}
                                  >
                                    Stock: {product.stock}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAskAI(product)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                              >
                                <Sparkles size={18} />
                                Ask AI
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Add to cart functionality
                                  console.log('Add to cart:', product.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                              >
                                <ShoppingCart size={18} />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Table View */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Seller
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Historical Low
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Last Transaction
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Rating
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {products.map((product) => (
                              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Package className="text-slate-400" size={20} />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-slate-900">{product.name}</div>
                                      {product.description && (
                                        <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                                          {product.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-slate-600">{product.category || 'N/A'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  {product.seller ? (
                                    <div>
                                      <div className="text-sm font-medium text-slate-900">{product.seller.name}</div>
                                      {product.seller.verified && (
                                        <span className="text-xs text-emerald-600 font-medium">Verified</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-900">
                                    {formatPrice(product.price, product.currency)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {product.historicalLowPrice !== undefined ? (
                                    <div className="flex items-center gap-1 text-sm">
                                      <TrendingDown className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold text-blue-600">
                                        {formatPrice(product.historicalLowPrice, product.currency)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {product.lastTransactionPrice !== undefined ? (
                                    <div className="flex items-center gap-1 text-sm">
                                      <DollarSign className="w-4 h-4 text-green-600" />
                                      <span className="font-semibold text-green-600">
                                        {formatPrice(product.lastTransactionPrice, product.currency)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`text-sm font-medium ${product.stock && product.stock > 0
                                      ? product.stock < 10
                                        ? 'text-amber-600'
                                        : 'text-green-600'
                                      : 'text-red-600'
                                      }`}
                                  >
                                    {product.stock ?? 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {product.rating ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm font-medium text-slate-900">{product.rating.toFixed(1)}</span>
                                      {product.reviewsCount !== undefined && (
                                        <span className="text-xs text-slate-500">({product.reviewsCount})</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleAskAI(product)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                                      title="Ask AI"
                                    >
                                      <Sparkles size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        // TODO: Add to cart functionality
                                        console.log('Add to cart:', product.id);
                                      }}
                                      className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors flex items-center gap-1"
                                    >
                                      <ShoppingCart size={14} />
                                      Add
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {products.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{' '}
                      {Math.min(currentPage * limit, total)} of {total} products
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsListPage;

