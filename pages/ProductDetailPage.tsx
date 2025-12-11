import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, ApiError, BuyerProduct } from '../services/api';
import { SalesData } from '../types/salesData';
import { getToken } from '../services/api';
import {
  Package,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Home,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  User,
  HelpCircle,
  FileText,
  Sparkles,
  Tag,
  Building2,
  Calendar,
  DollarSign,
  TrendingDown,
  Eye,
} from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID does not exist');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 调用 API 获取产品详情
        // 后端应该返回包含所有 SalesData 字段的数据
        const productData = await buyerApi.getProductById(productId);
        
        // 将 BuyerProduct 格式转换为 SalesData 格式
        // 后端应该返回完整的产品信息，包括所有 sales_data 表的字段
        const salesData: SalesData = {
          id: productData.id,
          ItemName: productData.name,
          ItemCode: productData.id, // 如果后端返回了 ItemCode，使用它；否则使用 id
          description: productData.description || null,
          TXP1: productData.price,
          TXDate: productData.createdAt || null,
          TXNo: null,
          TXQty: null,
          BuyerCode: productData.seller?.id || null,
          BuyerName: productData.seller?.name || null,
          'Product Hierarchy 3': productData.category || null,
          Function: null,
          ItemType: null,
          Model: null,
          Performance: null,
          'Performance.1': null,
          Material: null,
          UOM: null,
          'Brand Code': null,
          'Unit Cost': null,
          Sector: null,
          SubSector: null,
          Value: null,
          Rationale: null,
          www: null,
          Source: null,
          // 如果后端返回了完整的 SalesData，直接使用
          ...(productData as any),
        };
        
        setProduct(salesData);
      } catch (err) {
        const apiError = err as ApiError | Error;
        const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to fetch product details';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US');
    } catch {
      return date;
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      setNotification({ type: 'error', message: 'Product information is not available.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // 使用 id（数据库主键）作为 productId
    if (product.id === null || product.id === undefined || product.id === '') {
      setNotification({ type: 'error', message: 'Product ID is missing. Cannot add to cart.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const productId = String(product.id);
      await buyerApi.addToCart({ productId, quantity: 1 });
      setNotification({ type: 'success', message: 'Product added to cart successfully!' });
    } catch (error) {
      const apiError = error as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to add product to cart.';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-brand-600" size={48} />
            <p className="text-slate-600">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-slate-900">Loading Failed</h2>
            </div>
            <p className="text-slate-600 mb-4">{error || 'Product not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Back
            </button>
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
              <Link to="/buyer/products" className="hover:text-brand-600">
                Products
              </Link>
              <span>/</span>
              <span className="text-slate-900">Product Details</span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors mb-2"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          </div>

          {/* Product Content */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-8">
                  {/* Product Image Section */}
                  <div className="mb-8">
                    <div className="relative w-full h-96 bg-slate-100 rounded-xl overflow-hidden mb-6">
                      <img
                        src="/img/COLOURBOX26670563.webp"
                        alt={product.ItemName || 'Product image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Header */}
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {product.ItemName || 'Unknown Product'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      {product.ItemCode && (
                        <p>Item Code: {product.ItemCode}</p>
                      )}
                      {product.id && (
                        <p className="text-xs text-slate-500">ID: {product.id}</p>
                      )}
                    </div>
                  </div>

                  {/* Product Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Basic Information
                      </h2>
                      
                      <div className="space-y-3">
                        {product.ItemCode && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Item Code:</span>
                            <span className="text-sm text-slate-900">{product.ItemCode}</span>
                          </div>
                        )}
                        
                        {product.TXNo && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Transaction Number:</span>
                            <span className="text-sm text-slate-900">{product.TXNo}</span>
                          </div>
                        )}
                        
                        {product.ItemType && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Item Type:</span>
                            <span className="text-sm text-slate-900">{product.ItemType}</span>
                          </div>
                        )}
                        
                        {product.Model && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Model:</span>
                            <span className="text-sm text-slate-900">{product.Model}</span>
                          </div>
                        )}
                        
                        {product.Material && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Material:</span>
                            <span className="text-sm text-slate-900">{product.Material}</span>
                          </div>
                        )}
                        
                        {product.UOM && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Unit:</span>
                            <span className="text-sm text-slate-900">{product.UOM}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category & Classification */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Category & Classification
                      </h2>
                      
                      <div className="space-y-3">
                        {product['Product Hierarchy 3'] && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Product Category:</span>
                            <span className="text-sm text-slate-900">{product['Product Hierarchy 3']}</span>
                          </div>
                        )}
                        
                        {product.Sector && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Sector:</span>
                            <span className="text-sm text-slate-900">{product.Sector}</span>
                          </div>
                        )}
                        
                        {product.SubSector && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Sub Sector:</span>
                            <span className="text-sm text-slate-900">{product.SubSector}</span>
                          </div>
                        )}
                        
                        {product.Function && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Function:</span>
                            <span className="text-sm text-slate-900">{product.Function}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Transaction */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Price & Transaction
                      </h2>
                      
                      <div className="space-y-3">
                        {product.TXP1 !== null && product.TXP1 !== undefined && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Price:</span>
                            <span className="text-lg font-bold text-brand-600">{formatPrice(product.TXP1)}</span>
                          </div>
                        )}
                        
                        {product['Unit Cost'] !== null && product['Unit Cost'] !== undefined && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Unit Cost:</span>
                            <span className="text-sm text-slate-900">{formatPrice(product['Unit Cost'])}</span>
                          </div>
                        )}
                        
                        {product.TXQty !== null && product.TXQty !== undefined && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Quantity:</span>
                            <span className="text-sm text-slate-900">{product.TXQty}</span>
                          </div>
                        )}
                        
                        {product.Value !== null && product.Value !== undefined && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Total Value:</span>
                            <span className="text-sm font-semibold text-green-600">{formatPrice(product.Value)}</span>
                          </div>
                        )}
                        
                        {product.TXDate && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Transaction Date:</span>
                            <span className="text-sm text-slate-900">{formatDate(product.TXDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Brand & Performance */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Brand & Performance
                      </h2>
                      
                      <div className="space-y-3">
                        {product['Brand Code'] && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Brand Code:</span>
                            <span className="text-sm text-slate-900">{product['Brand Code']}</span>
                          </div>
                        )}
                        
                        {product.Performance && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Performance:</span>
                            <span className="text-sm text-slate-900">{product.Performance}</span>
                          </div>
                        )}
                        
                        {product['Performance.1'] && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Performance 1:</span>
                            <span className="text-sm text-slate-900">{product['Performance.1']}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buyer Information */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Buyer Information
                      </h2>
                      
                      <div className="space-y-3">
                        {product.BuyerCode && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Buyer Code:</span>
                            <span className="text-sm text-slate-900">{product.BuyerCode}</span>
                          </div>
                        )}
                        
                        {product.BuyerName && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Buyer Name:</span>
                            <span className="text-sm text-slate-900">{product.BuyerName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        Additional Information
                      </h2>
                      
                      <div className="space-y-3">
                        {product.Rationale && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Rationale:</span>
                            <span className="text-sm text-slate-900">{product.Rationale}</span>
                          </div>
                        )}
                        
                        {product.www && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Website:</span>
                            <a 
                              href={product.www} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-brand-600 hover:underline"
                            >
                              {product.www}
                            </a>
                          </div>
                        )}
                        
                        {product.Source && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm font-medium text-slate-600 w-32 flex-shrink-0">Source:</span>
                            <span className="text-sm text-slate-900">{product.Source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
                    <button
                      onClick={() => navigate('/buyer/products')}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={18} />
                      Back to Product List
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/buyer/ai-search`, { state: { product } })}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Sparkles size={18} />
                      Ask AI
                    </button>
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

export default ProductDetailPage;

