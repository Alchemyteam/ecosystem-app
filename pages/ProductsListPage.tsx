import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { buyerApi, getToken } from '../services/api';
import { SalesData } from '../types/salesData';
// 可选：使用新的 useSalesData Hook
// import { useSalesData } from '../hooks/useSalesData';
// import { SalesDataQueryParams } from '../types/salesData';
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
  X,
  SlidersHorizontal,
  Calendar,
  Building2,
  Tag,
  Eye,
} from 'lucide-react';

const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SalesData[]>([]);
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([
    { label: 'All Categories', value: 'all' },
  ]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // 筛选状态 - 根据 sales_data 表格结构
  const [filters, setFilters] = useState({
    // 交易相关
    minDate: '',           // TXDate 最早日期
    maxDate: '',           // TXDate 最晚日期
    txNo: '',              // TXNo 交易编号
    minQty: '',            // TXQty 最小数量
    maxQty: '',            // TXQty 最大数量
    minPrice: '',          // TXP1 最低价格
    maxPrice: '',          // TXP1 最高价格
    minValue: '',          // Value 最小总价值
    maxValue: '',          // Value 最大总价值
    // 买家相关
    buyerCode: '',         // BuyerCode 买家代码
    buyerName: '',         // BuyerName 买家名称
    // 产品相关
    itemCode: '',          // ItemCode 产品代码
    itemName: '',          // ItemName 产品名称（也可用 keyword）
    productHierarchy3: '', // Product Hierarchy 3 产品分类层级3
    itemType: '',          // ItemType 产品类型
    model: '',             // Model 型号
    material: '',          // Material 材料
    uom: '',               // UOM 单位
    // 品牌和性能
    brandCode: '',         // Brand Code 品牌代码
    performance: '',       // Performance 性能
    performance1: '',      // Performance.1 性能1
    // 成本和功能
    minUnitCost: '',       // Unit Cost 最小单位成本
    maxUnitCost: '',       // Unit Cost 最大单位成本
    function: '',          // Function 功能
    // 行业相关
    sector: '',            // Sector 行业
    subSector: '',         // SubSector 子行业
    // 其他
    source: '',            // Source 来源
  });

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

  const handleAskAI = (product: SalesData) => {
    // Convert SalesData to BuyerProduct format for AI Search
    const buyerProduct = {
      id: product.TXNo || '',
      name: product.ItemName || '',
      description: `${product.ItemType || ''} ${product.Model || ''} ${product.Material || ''}`.trim(),
      price: product.TXP1 || 0,
      currency: 'USD',
      category: product['Product Hierarchy 3'] || product.Sector || '',
    };
    navigate('/buyer/ai-search', { state: { product: buyerProduct } });
  };

  const handleAddToCart = async (product: SalesData) => {
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
      const apiError = error as { message?: string } | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as { message?: string })?.message || 'Failed to add product to cart.';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 从数据中提取 Product Hierarchy 3 的不重复值
  const extractCategoryOptions = (data: SalesData[]) => {
    const hierarchySet = new Set<string>();
    data.forEach((product) => {
      if (product['Product Hierarchy 3'] && product['Product Hierarchy 3'].trim() !== '') {
        hierarchySet.add(product['Product Hierarchy 3'].trim());
      }
    });
    const hierarchies = Array.from(hierarchySet).sort();
    return [
      { label: 'All Categories', value: 'all' },
      ...hierarchies.map((hierarchy) => ({
        label: hierarchy,
        value: hierarchy,
      })),
    ];
  };

  const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating: Highest', value: 'rating_desc' },
  ];

  // 从后端获取分类选项
  const fetchCategoryOptions = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('No token available for fetching categories');
        return;
      }
      
      // 从后端 API 获取分类列表
      const { getCategoryOptions } = await import('../services/salesDataApi');
      const categories = await getCategoryOptions(token);
      
      // 格式化分类选项
      const formattedCategories = [
        { label: 'All Categories', value: 'all' },
        ...categories.map((category) => ({
          label: category,
          value: category,
        })),
      ];
      
      setCategoryOptions(formattedCategories);
    } catch (err) {
      console.error('Failed to fetch category options from backend:', err);
      // 如果后端接口不存在或失败，回退到从当前数据提取分类
      try {
        const response = await buyerApi.getAllProducts({ page: 1, limit: 100, sort: 'newest' });
        const allData = response.data || [];
        const categories = extractCategoryOptions(allData);
        setCategoryOptions(categories);
      } catch (fallbackErr) {
        console.error('Fallback category extraction also failed:', fallbackErr);
      }
    }
  };

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

      // 如果有搜索词，添加到参数中
      if (searchTerm && searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }

      // 添加筛选参数 - 根据 sales_data 表格结构
      // 交易相关
      if (filters.minDate && filters.minDate.trim() !== '') params.minDate = filters.minDate;
      if (filters.maxDate && filters.maxDate.trim() !== '') params.maxDate = filters.maxDate;
      if (filters.txNo && filters.txNo.trim() !== '') params.txNo = filters.txNo.trim();
      if (filters.minQty && filters.minQty.trim() !== '') {
        const minQty = parseFloat(filters.minQty);
        if (!isNaN(minQty)) params.minQty = minQty;
      }
      if (filters.maxQty && filters.maxQty.trim() !== '') {
        const maxQty = parseFloat(filters.maxQty);
        if (!isNaN(maxQty)) params.maxQty = maxQty;
      }
      if (filters.minPrice && filters.minPrice.trim() !== '') {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice)) params.minPrice = minPrice;
      }
      if (filters.maxPrice && filters.maxPrice.trim() !== '') {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) params.maxPrice = maxPrice;
      }
      if (filters.minValue && filters.minValue.trim() !== '') {
        const minValue = parseFloat(filters.minValue);
        if (!isNaN(minValue)) params.minValue = minValue;
      }
      if (filters.maxValue && filters.maxValue.trim() !== '') {
        const maxValue = parseFloat(filters.maxValue);
        if (!isNaN(maxValue)) params.maxValue = maxValue;
      }
      // 买家相关
      if (filters.buyerCode && filters.buyerCode.trim() !== '') params.buyerCode = filters.buyerCode.trim();
      if (filters.buyerName && filters.buyerName.trim() !== '') params.buyerName = filters.buyerName.trim();
      // 产品相关
      if (filters.itemCode && filters.itemCode.trim() !== '') params.itemCode = filters.itemCode.trim();
      if (filters.itemName && filters.itemName.trim() !== '') params.itemName = filters.itemName.trim();
      if (filters.productHierarchy3 && filters.productHierarchy3.trim() !== '') params.productHierarchy3 = filters.productHierarchy3.trim();
      if (filters.itemType && filters.itemType.trim() !== '') params.itemType = filters.itemType.trim();
      if (filters.model && filters.model.trim() !== '') params.model = filters.model.trim();
      if (filters.material && filters.material.trim() !== '') params.material = filters.material.trim();
      if (filters.uom && filters.uom.trim() !== '') params.uom = filters.uom.trim();
      // 品牌和性能
      if (filters.brandCode && filters.brandCode.trim() !== '') params.brandCode = filters.brandCode.trim();
      if (filters.performance && filters.performance.trim() !== '') params.performance = filters.performance.trim();
      if (filters.performance1 && filters.performance1.trim() !== '') params.performance1 = filters.performance1.trim();
      // 成本和功能
      if (filters.minUnitCost && filters.minUnitCost.trim() !== '') {
        const minUnitCost = parseFloat(filters.minUnitCost);
        if (!isNaN(minUnitCost)) params.minUnitCost = minUnitCost;
      }
      if (filters.maxUnitCost && filters.maxUnitCost.trim() !== '') {
        const maxUnitCost = parseFloat(filters.maxUnitCost);
        if (!isNaN(maxUnitCost)) params.maxUnitCost = maxUnitCost;
      }
      if (filters.function && filters.function.trim() !== '') params.function = filters.function.trim();
      // 行业相关
      if (filters.sector && filters.sector.trim() !== '') params.sector = filters.sector.trim();
      if (filters.subSector && filters.subSector.trim() !== '') params.subSector = filters.subSector.trim();
      // 其他
      if (filters.source && filters.source.trim() !== '') params.source = filters.source.trim();

      console.log('=== Filter Parameters ===');
      console.log('Filters state:', filters);
      console.log('API params (before getAllProducts):', JSON.stringify(params, null, 2));

      // 使用 sales_data API 获取数据
      const response = await buyerApi.getAllProducts(params);
      
      console.log('=== After API Call ===');
      console.log('Response received:', response);
      // getAllProducts 现在返回 SalesDataResponse，包含 data 字段
      console.log('=== API Response (sales_data) ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', response.data?.length);
      console.log('First item:', response.data?.[0]);
      console.log('First item ItemName:', response.data?.[0]?.ItemName);
      console.log('Pagination:', response.pagination);

      const productsData = response.data || [];
      console.log('Products received from API:', productsData);
      console.log('Products count:', productsData.length);

      // 检查重复的 TXNo（这是正常的，因为同一个交易可能包含多个产品项）
      // 使用 TXNo + index 作为唯一标识符
      const txNoCounts: Record<string, number> = {};
      productsData.forEach((product: SalesData, idx: number) => {
        const txNo = product.TXNo || `unknown-${idx}`;
        txNoCounts[txNo] = (txNoCounts[txNo] || 0) + 1;
      });
      // 只在开发模式下记录重复信息（不显示警告，因为这是正常的业务逻辑）
      if (process.env.NODE_ENV === 'development') {
        const duplicates = Object.entries(txNoCounts).filter(([, count]) => count > 1);
        if (duplicates.length > 0) {
          console.log('销售数据统计：', {
            total: productsData.length,
            uniqueTXNo: Object.keys(txNoCounts).length,
            duplicates: duplicates.length,
            duplicateDetails: duplicates.map(([txNo, count]) => `${txNo}: ${count}项`)
          });
        }
      }

      setProducts(productsData);
      
      // 分类选项已从后端获取，不需要从当前数据提取
      
      // 使用后端返回的分页信息
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      const apiError = err as { message?: string; errors?: Record<string, string[]> };
      let errorMessage = apiError.message || 'Failed to load products. Please try again.';

      // 处理新的错误消息格式
      if (errorMessage.includes('未授权') || errorMessage.includes('401') || errorMessage.includes('token')) {
        errorMessage = '未授权：token 无效或已过期，请重新登录';
      } else if (errorMessage.includes('500') || errorMessage.includes('服务器错误') || errorMessage.includes('数据库连接失败')) {
        errorMessage = '服务器错误：数据库连接失败，请稍后重试';
      } else if (errorMessage.includes('请先登录')) {
        errorMessage = '请先登录';
      }

      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, category, searchTerm]);

  useEffect(() => {
    console.log('viewMode:', viewMode, 'isSidebarOpen:', isSidebarOpen);
  }, [viewMode, isSidebarOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 重置到第一页并执行搜索
    setCurrentPage(1);
    fetchProducts();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    console.log('=== Apply Filters Clicked ===');
    console.log('Current filters state:', filters);
    setCurrentPage(1);
    // 直接调用 fetchProducts，它会访问最新的 filters 状态
    fetchProducts();
  };

  const handleClearFilters = () => {
    setFilters({
      minDate: '',
      maxDate: '',
      txNo: '',
      minQty: '',
      maxQty: '',
      minPrice: '',
      maxPrice: '',
      minValue: '',
      maxValue: '',
      buyerCode: '',
      buyerName: '',
      itemCode: '',
      itemName: '',
      productHierarchy3: '',
      itemType: '',
      model: '',
      material: '',
      uom: '',
      brandCode: '',
      performance: '',
      performance1: '',
      minUnitCost: '',
      maxUnitCost: '',
      function: '',
      sector: '',
      subSector: '',
      source: '',
    });
    setCurrentPage(1);
    // 延迟执行，确保状态更新后再获取数据
    setTimeout(() => {
      fetchProducts();
    }, 0);
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
        <aside
          className={`bg-white border-r border-slate-200 h-[calc(100vh-5rem)] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'
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
                  <Link
                    to="/buyer/ai-search"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    AI Search
                  </Link>
                  <Link
                    to="/buyer/price-insights"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Price Insights
                  </Link>
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
                  <Link
                    to="/buyer/orders"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    All Orders
                  </Link>
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
        <div className="flex-1 bg-white relative min-w-0 h-full overflow-hidden flex">
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
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto min-w-0">
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
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">All Products</h1>
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
                    placeholder="Search ItemName、ItemCode、ItemType..."
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
                  {categoryOptions.map((option) => (
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
                <button
                  type="button"
                  onClick={() => navigate('/buyer/ai-search', { state: { initialSearchTerm: searchTerm } })}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                  title="使用 AI Search 进行智能搜索"
                >
                  <Sparkles size={18} />
                  AI Search
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
                    <p className="text-base font-medium text-slate-900 mb-2">No products found</p>
                    <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
                  </div>
                ) : viewMode === 'card' ? (
                  <>
                    {/* Card View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {products.map((product, index) => {
                        // 使用 TXNo + index 作为唯一 key（因为 TXNo 可能重复）
                        const uniqueKey = `${product.TXNo || 'unknown'}-${index}`;
                        return (
                          <div
                            key={uniqueKey}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                          >
                            {/* Product Image */}
                            <div className="relative h-48 bg-slate-100">
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-slate-400" size={48} />
                              </div>
                              {product['Product Hierarchy 3'] && (
                                <div className="absolute top-3 left-3">
                                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-slate-700 backdrop-blur-sm">
                                    {product['Product Hierarchy 3']}
                                  </span>
                                </div>
                              )}
                              {product.Sector && (
                                <div className="absolute top-3 right-3">
                                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-slate-700 backdrop-blur-sm">
                                    {product.Sector}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5">
                              <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2">{product.ItemName || 'N/A'}</h3>
                              <div className="text-sm text-slate-600 mb-2">
                                <p className="line-clamp-1">Code: {product.ItemCode || 'N/A'}</p>
                                {product.Model && <p className="line-clamp-1">Model: {product.Model}</p>}
                                {product.Material && <p className="line-clamp-1">Material: {product.Material}</p>}
                              </div>

                              {/* Buyer Info */}
                              {product.BuyerName && (
                                <div className="flex items-center gap-2 mb-4">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">{product.BuyerName}</span>
                                  {product.BuyerCode && (
                                    <span className="text-xs text-slate-500">({product.BuyerCode})</span>
                                  )}
                                </div>
                              )}

                              {/* Price Section */}
                              <div className="mb-4 space-y-2">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl font-bold text-slate-900">
                                    {product.TXP1 ? formatPrice(product.TXP1, 'USD') : 'N/A'}
                                  </span>
                                  {product.UOM && (
                                    <span className="text-sm text-slate-500">/ {product.UOM}</span>
                                  )}
                                </div>

                                {/* Unit Cost */}
                                {product['Unit Cost'] !== null && product['Unit Cost'] !== undefined && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                    <span className="text-slate-600">Unit Cost:</span>
                                    <span className="font-semibold text-blue-600">
                                      {formatPrice(product['Unit Cost'], 'USD')}
                                    </span>
                                  </div>
                                )}

                                {/* Quantity */}
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-slate-600">Quantity:</span>
                                  <span className="font-semibold text-slate-900">{product.TXQty || 'N/A'}</span>
                                </div>

                                {/* Value */}
                                {product.Value !== null && product.Value !== undefined && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-600">Total Value:</span>
                                    <span className="font-semibold text-green-600">
                                      {formatPrice(product.Value, 'USD')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Additional Info */}
                              <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
                                <div className="flex flex-col gap-2 text-sm">
                                  {product.ItemType && (
                                    <span className="text-slate-600">Type: <span className="font-medium">{product.ItemType}</span></span>
                                  )}
                                  {product['Brand Code'] && (
                                    <span className="text-slate-600">Brand: <span className="font-medium">{product['Brand Code']}</span></span>
                                  )}
                                  {product.TXDate && (
                                    <span className="text-slate-600">Date: <span className="font-medium">{formatDate(product.TXDate)}</span></span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAskAI(product)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                                  >
                                    <Sparkles size={18} />
                                    Ask AI
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                                  >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    // 只使用 id（数据库主键）
                                    // 使用更严格的检查，确保 id 不为 null/undefined/空字符串
                                    // 注意：id 可以是 0，所以不能使用简单的 || 运算符
                                    console.log('View Details clicked, product data:', { 
                                      id: product.id, 
                                      idType: typeof product.id,
                                      hasId: 'id' in product,
                                      fullProduct: product 
                                    });
                                    
                                    if (product.id !== null && product.id !== undefined && product.id !== '') {
                                      const productId = String(product.id);
                                      console.log('Navigating to product detail with ID:', productId);
                                      navigate(`/buyer/products/${productId}`);
                                    } else {
                                      console.warn('Cannot navigate: product.id is invalid', { 
                                        id: product.id, 
                                        idType: typeof product.id 
                                      });
                                    }
                                  }}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!product.id || product.id === null || product.id === undefined || product.id === ''}
                                  title={!product.id || product.id === null || product.id === undefined || product.id === '' ? '产品ID不存在' : '查看产品详情'}
                                >
                                  <Eye size={18} />
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                                Item Code
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Buyer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Unit Cost
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Value
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {products.map((product, index) => {
                              // 使用 TXNo + index 作为唯一 key（因为 TXNo 可能重复）
                              const uniqueKey = `${product.TXNo || 'unknown'}-${index}`;
                              return (
                                <tr key={uniqueKey} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Package className="text-slate-400" size={20} />
                                      </div>
                                      <div>
                                        <div className="font-medium text-slate-900">{product.ItemName || 'N/A'}</div>
                                        {product.Model && (
                                          <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                                            {product.Model} {product.Material && `- ${product.Material}`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">{product.ItemCode || 'N/A'}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">
                                      {product['Product Hierarchy 3'] || product.Sector || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {product.BuyerName ? (
                                      <div>
                                        <div className="text-sm font-medium text-slate-900">{product.BuyerName}</div>
                                        {product.BuyerCode && (
                                          <span className="text-xs text-slate-500">{product.BuyerCode}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">
                                      {product.TXP1 ? formatPrice(product.TXP1, 'USD') : 'N/A'}
                                      {product.UOM && <span className="text-sm font-normal text-slate-500"> / {product.UOM}</span>}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-slate-900">{product.TXQty || 'N/A'}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {product['Unit Cost'] !== null && product['Unit Cost'] !== undefined ? (
                                      <span className="text-sm font-semibold text-blue-600">
                                        {formatPrice(product['Unit Cost'], 'USD')}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-slate-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {product.Value !== null && product.Value !== undefined ? (
                                      <div className="flex items-center gap-1 text-sm">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-semibold text-green-600">
                                          {formatPrice(product.Value, 'USD')}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">
                                      {product.TXDate ? formatDate(product.TXDate) : 'N/A'}
                                    </span>
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
                                        onClick={() => handleAddToCart(product)}
                                        className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors flex items-center gap-1"
                                      >
                                        <ShoppingCart size={14} />
                                        Add
                                      </button>
                                      <button
                                        onClick={() => {
                                          // 只使用 id（数据库主键）
                                          // 使用更严格的检查，确保 id 不为 null/undefined/空字符串
                                          // 注意：id 可以是 0，所以不能使用简单的 || 运算符
                                          console.log('View Details clicked, product data:', { 
                                            id: product.id, 
                                            idType: typeof product.id,
                                            hasId: 'id' in product,
                                            fullProduct: product 
                                          });
                                          
                                          if (product.id !== null && product.id !== undefined && product.id !== '') {
                                            const productId = String(product.id);
                                            console.log('Navigating to product detail with ID:', productId);
                                            navigate(`/buyer/products/${productId}`);
                                          } else {
                                            console.warn('Cannot navigate: product.id is invalid', { 
                                              id: product.id, 
                                              idType: typeof product.id 
                                            });
                                          }
                                        }}
                                        className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={!product.id || product.id === null || product.id === undefined || product.id === '' ? '产品ID不存在' : '查看产品详情'}
                                        disabled={!product.id || product.id === null || product.id === undefined || product.id === ''}
                                      >
                                        <Eye size={14} />
                                        Details
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
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

          {/* Filter Sidebar */}
          <div className={`w-80 bg-slate-50 border-l border-slate-200 h-full overflow-y-auto transition-all duration-300 ${isFilterOpen ? '' : 'hidden'}`}>
            <div className="p-4 sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="text-slate-600" size={20} />
                  <h2 className="text-base font-semibold text-slate-900">Filters</h2>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Hide filters"
                >
                  <X size={18} />
                </button>
              </div>
              <button
                onClick={handleClearFilters}
                className="w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Date Range - TXDate */}
              <div lang="en-US">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Date Range (TXDate)
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    lang="en-US"
                    value={filters.minDate}
                    onChange={(e) => handleFilterChange('minDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <input
                    type="date"
                    lang="en-US"
                    value={filters.maxDate}
                    onChange={(e) => handleFilterChange('maxDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Transaction Number - TXNo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Transaction No (TXNo)
                </label>
                <input
                  type="text"
                  placeholder="Transaction number..."
                  value={filters.txNo}
                  onChange={(e) => handleFilterChange('txNo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Quantity Range - TXQty */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity Range (TXQty)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Quantity"
                    value={filters.minQty}
                    onChange={(e) => handleFilterChange('minQty', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Quantity"
                    value={filters.maxQty}
                    onChange={(e) => handleFilterChange('maxQty', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Price Range - TXP1 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Price Range (TXP1)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Value Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <DollarSign size={16} />
                  Value Range
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Value"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Value"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Buyer Code - BuyerCode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Buyer Code
                </label>
                <input
                  type="text"
                  placeholder="Buyer code..."
                  value={filters.buyerCode}
                  onChange={(e) => handleFilterChange('buyerCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Buyer Name - BuyerName */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Buyer Name
                </label>
                <input
                  type="text"
                  placeholder="Buyer name..."
                  value={filters.buyerName}
                  onChange={(e) => handleFilterChange('buyerName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Item Code - ItemCode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Code</label>
                <input
                  type="text"
                  placeholder="Item code..."
                  value={filters.itemCode}
                  onChange={(e) => handleFilterChange('itemCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Item Name - ItemName */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="Item name..."
                  value={filters.itemName}
                  onChange={(e) => handleFilterChange('itemName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Product Hierarchy 3 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Hierarchy 3</label>
                <input
                  type="text"
                  placeholder="Product hierarchy..."
                  value={filters.productHierarchy3}
                  onChange={(e) => handleFilterChange('productHierarchy3', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Item Type - ItemType */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Package size={16} />
                  Item Type
                </label>
                <input
                  type="text"
                  placeholder="Item type..."
                  value={filters.itemType}
                  onChange={(e) => handleFilterChange('itemType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                <input
                  type="text"
                  placeholder="Model..."
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  Material
                </label>
                <input
                  type="text"
                  placeholder="Material..."
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* UOM */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">UOM (Unit of Measure)</label>
                <input
                  type="text"
                  placeholder="Unit of measure..."
                  value={filters.uom}
                  onChange={(e) => handleFilterChange('uom', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Brand Code */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Code</label>
                <input
                  type="text"
                  placeholder="Brand code..."
                  value={filters.brandCode}
                  onChange={(e) => handleFilterChange('brandCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Performance */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Performance</label>
                <input
                  type="text"
                  placeholder="Performance..."
                  value={filters.performance}
                  onChange={(e) => handleFilterChange('performance', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Performance.1 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Performance.1</label>
                <input
                  type="text"
                  placeholder="Performance.1..."
                  value={filters.performance1}
                  onChange={(e) => handleFilterChange('performance1', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Unit Cost Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Cost Range</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Unit Cost"
                    value={filters.minUnitCost}
                    onChange={(e) => handleFilterChange('minUnitCost', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Unit Cost"
                    value={filters.maxUnitCost}
                    onChange={(e) => handleFilterChange('maxUnitCost', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Function */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Function</label>
                <input
                  type="text"
                  placeholder="Function..."
                  value={filters.function}
                  onChange={(e) => handleFilterChange('function', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sector</label>
                <input
                  type="text"
                  placeholder="Sector..."
                  value={filters.sector}
                  onChange={(e) => handleFilterChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Sub Sector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sub Sector</label>
                <input
                  type="text"
                  placeholder="Sub sector..."
                  value={filters.subSector}
                  onChange={(e) => handleFilterChange('subSector', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
                <input
                  type="text"
                  placeholder="Source..."
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Filter size={18} />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Filter Toggle Button (when filter is hidden) */}
          {!isFilterOpen && (
            <button
              onClick={() => setIsFilterOpen(true)}
              className="absolute right-4 top-8 z-10 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Show filters"
            >
              <SlidersHorizontal size={20} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsListPage;

