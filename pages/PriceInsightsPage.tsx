import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import {
  Home,
  Package,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  User,
  HelpCircle,
  FileText,
  Heart,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';

interface PriceData {
  date: string;
  price: number;
  volume: number;
}

interface ProductPriceInsight {
  id: string;
  name: string;
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  data: PriceData[];
}

const PriceInsightsPage: React.FC = () => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for price insights
  const mockPriceInsights: ProductPriceInsight[] = [
    {
      id: '1',
      name: 'Steel Formwork System',
      currentPrice: 299.99,
      averagePrice: 285.50,
      minPrice: 250.00,
      maxPrice: 320.00,
      priceChange: 14.49,
      priceChangePercent: 5.08,
      trend: 'up',
      data: [
        { date: '2024-01', price: 250.00, volume: 45 },
        { date: '2024-02', price: 265.00, volume: 52 },
        { date: '2024-03', price: 280.00, volume: 48 },
        { date: '2024-04', price: 275.00, volume: 55 },
        { date: '2024-05', price: 290.00, volume: 60 },
        { date: '2024-06', price: 299.99, volume: 58 },
      ],
    },
    {
      id: '2',
      name: 'Concrete Mixer',
      currentPrice: 150.00,
      averagePrice: 155.20,
      minPrice: 140.00,
      maxPrice: 170.00,
      priceChange: -5.20,
      priceChangePercent: -3.35,
      trend: 'down',
      data: [
        { date: '2024-01', price: 165.00, volume: 30 },
        { date: '2024-02', price: 160.00, volume: 35 },
        { date: '2024-03', price: 155.00, volume: 40 },
        { date: '2024-04', price: 150.00, volume: 38 },
        { date: '2024-05', price: 145.00, volume: 42 },
        { date: '2024-06', price: 150.00, volume: 45 },
      ],
    },
    {
      id: '3',
      name: 'Safety Helmet',
      currentPrice: 25.50,
      averagePrice: 25.30,
      minPrice: 22.00,
      maxPrice: 28.00,
      priceChange: 0.20,
      priceChangePercent: 0.79,
      trend: 'stable',
      data: [
        { date: '2024-01', price: 24.00, volume: 120 },
        { date: '2024-02', price: 25.00, volume: 115 },
        { date: '2024-03', price: 25.50, volume: 130 },
        { date: '2024-04', price: 25.20, volume: 125 },
        { date: '2024-05', price: 25.40, volume: 140 },
        { date: '2024-06', price: 25.50, volume: 135 },
      ],
    },
    {
      id: '4',
      name: 'Spray Paint',
      currentPrice: 12.99,
      averagePrice: 13.50,
      minPrice: 10.00,
      maxPrice: 15.00,
      priceChange: -0.51,
      priceChangePercent: -3.78,
      trend: 'down',
      data: [
        { date: '2024-01', price: 14.00, volume: 200 },
        { date: '2024-02', price: 13.50, volume: 210 },
        { date: '2024-03', price: 13.00, volume: 195 },
        { date: '2024-04', price: 12.50, volume: 205 },
        { date: '2024-05', price: 12.80, volume: 220 },
        { date: '2024-06', price: 12.99, volume: 215 },
      ],
    },
  ];

  const overallStats = {
    totalProducts: 156,
    averagePriceChange: 2.5,
    productsUp: 89,
    productsDown: 52,
    productsStable: 15,
    marketTrend: 'up' as const,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'down':
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-slate-400" size={20} />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', value: number) => {
    if (trend === 'up' || value > 0) return 'text-green-600';
    if (trend === 'down' || value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  // Simple chart rendering (using divs as bars)
  const renderSimpleChart = (data: PriceData[]) => {
    const maxPrice = Math.max(...data.map((d) => d.price));
    const minPrice = Math.min(...data.map((d) => d.price));
    const range = maxPrice - minPrice || 1;

    return (
      <div className="flex items-end gap-1 h-16">
        {data.map((point, idx) => {
          const height = ((point.price - minPrice) / range) * 100;
          return (
            <div
              key={idx}
              className="flex-1 bg-brand-600 rounded-t hover:bg-brand-700 transition-colors"
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${point.date}: ${formatPrice(point.price)}`}
            />
          );
        })}
      </div>
    );
  };

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
                  <Link
                    to="/buyer/price-insights"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
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
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
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
              <span className="text-slate-900">Price Insights</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Price Insights</h1>
                  <p className="text-sm text-slate-600">Market trends and price analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                >
                  <option value="1M">Last Month</option>
                  <option value="3M">Last 3 Months</option>
                  <option value="6M">Last 6 Months</option>
                  <option value="1Y">Last Year</option>
                  <option value="ALL">All Time</option>
                </select>
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Total Products</span>
                  <Package className="text-slate-400" size={18} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{overallStats.totalProducts}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Avg. Price Change</span>
                  <DollarSign className="text-slate-400" size={18} />
                </div>
                <p className={`text-2xl font-bold ${getTrendColor('up', overallStats.averagePriceChange)}`}>
                  {formatPercent(overallStats.averagePriceChange)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Products Up</span>
                  <TrendingUp className="text-green-600" size={18} />
                </div>
                <p className="text-2xl font-bold text-green-600">{overallStats.productsUp}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Products Down</span>
                  <TrendingDown className="text-red-600" size={18} />
                </div>
                <p className="text-2xl font-bold text-red-600">{overallStats.productsDown}</p>
              </div>
            </div>

            {/* Price Insights Cards */}
            <div className="space-y-4">
              {mockPriceInsights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{insight.name}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Current Price: </span>
                          <span className="font-semibold text-slate-900">{formatPrice(insight.currentPrice)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Average: </span>
                          <span className="font-semibold text-slate-700">{formatPrice(insight.averagePrice)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Range: </span>
                          <span className="font-semibold text-slate-700">
                            {formatPrice(insight.minPrice)} - {formatPrice(insight.maxPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(insight.trend)}
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTrendColor(insight.trend, insight.priceChange)}`}>
                          {formatPercent(insight.priceChangePercent)}
                        </p>
                        <p className={`text-sm ${getTrendColor(insight.trend, insight.priceChange)}`}>
                          {formatPrice(Math.abs(insight.priceChange))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Chart */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">Price Trend ({selectedTimeRange})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Min: {formatPrice(insight.minPrice)}</span>
                        <span className="text-xs text-slate-500">Max: {formatPrice(insight.maxPrice)}</span>
                      </div>
                    </div>
                    {renderSimpleChart(insight.data)}
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      {insight.data.map((point, idx) => (
                        <span key={idx}>{point.date.split('-')[1]}</span>
                      ))}
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Price Volatility</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {((insight.maxPrice - insight.minPrice) / insight.averagePrice * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Avg. Volume</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {Math.round(insight.data.reduce((sum, d) => sum + d.volume, 0) / insight.data.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Price vs Average</p>
                      <p className={`text-sm font-semibold ${getTrendColor(insight.trend, insight.currentPrice - insight.averagePrice)}`}>
                        {formatPercent(((insight.currentPrice - insight.averagePrice) / insight.averagePrice) * 100)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Summary */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Market Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Price Distribution</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Increasing</span>
                      <div className="flex-1 mx-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${(overallStats.productsUp / overallStats.totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{overallStats.productsUp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Decreasing</span>
                      <div className="flex-1 mx-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${(overallStats.productsDown / overallStats.totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{overallStats.productsDown}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Stable</span>
                      <div className="flex-1 mx-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${(overallStats.productsStable / overallStats.totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{overallStats.productsStable}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Market Trend</p>
                  <div className="flex items-center gap-3">
                    {getTrendIcon(overallStats.marketTrend)}
                    <div>
                      <p className="text-lg font-bold text-green-600">Bullish</p>
                      <p className="text-sm text-slate-600">Market is trending upward</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Recommendations</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <ArrowUp className="text-green-600 mt-0.5" size={16} />
                      <p className="text-sm text-slate-700">Consider purchasing products with stable or decreasing prices</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowDown className="text-red-600 mt-0.5" size={16} />
                      <p className="text-sm text-slate-700">Monitor products with increasing prices for better timing</p>
                    </div>
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

export default PriceInsightsPage;

