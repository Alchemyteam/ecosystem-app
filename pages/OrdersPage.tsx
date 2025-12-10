import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      status: 'delivered',
      items: [
        {
          productId: '1234',
          productName: 'Steel Formwork System',
          quantity: 2,
          price: 299.99,
          subtotal: 599.98,
        },
        {
          productId: '5678',
          productName: 'Concrete Mixer',
          quantity: 1,
          price: 150.00,
          subtotal: 150.00,
        },
      ],
      total: 749.98,
      currency: 'USD',
      itemCount: 3,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
      estimatedDelivery: '2024-01-20T10:00:00Z',
      trackingNumber: 'TRK123456789',
      shippingAddress: {
        street: '123 Main Street',
        city: 'Singapore',
        postalCode: '123456',
        country: 'Singapore',
      },
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      status: 'shipped',
      items: [
        {
          productId: '9012',
          productName: 'Safety Helmet',
          quantity: 10,
          price: 25.50,
          subtotal: 255.00,
        },
      ],
      total: 255.00,
      currency: 'USD',
      itemCount: 10,
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-19T11:30:00Z',
      estimatedDelivery: '2024-01-25T10:00:00Z',
      trackingNumber: 'TRK987654321',
      shippingAddress: {
        street: '456 Orchard Road',
        city: 'Singapore',
        postalCode: '238876',
        country: 'Singapore',
      },
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      status: 'processing',
      items: [
        {
          productId: '3456',
          productName: 'Spray Paint',
          quantity: 20,
          price: 12.99,
          subtotal: 259.80,
        },
        {
          productId: '7890',
          productName: 'Construction Gloves',
          quantity: 5,
          price: 8.50,
          subtotal: 42.50,
        },
      ],
      total: 302.30,
      currency: 'USD',
      itemCount: 25,
      createdAt: '2024-01-20T14:20:00Z',
      updatedAt: '2024-01-20T14:20:00Z',
      estimatedDelivery: '2024-01-27T10:00:00Z',
      shippingAddress: {
        street: '789 Marina Bay',
        city: 'Singapore',
        postalCode: '018956',
        country: 'Singapore',
      },
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      status: 'pending',
      items: [
        {
          productId: '1111',
          productName: 'Steel Beam',
          quantity: 5,
          price: 89.99,
          subtotal: 449.95,
        },
      ],
      total: 449.95,
      currency: 'USD',
      itemCount: 5,
      createdAt: '2024-01-21T08:45:00Z',
      updatedAt: '2024-01-21T08:45:00Z',
      estimatedDelivery: '2024-01-28T10:00:00Z',
      shippingAddress: {
        street: '321 Jurong West',
        city: 'Singapore',
        postalCode: '648886',
        country: 'Singapore',
      },
    },
    {
      id: '5',
      orderNumber: 'ORD-2023-125',
      status: 'cancelled',
      items: [
        {
          productId: '2222',
          productName: 'Cement Bag',
          quantity: 50,
          price: 15.00,
          subtotal: 750.00,
        },
      ],
      total: 750.00,
      currency: 'USD',
      itemCount: 50,
      createdAt: '2023-12-10T10:00:00Z',
      updatedAt: '2023-12-12T15:30:00Z',
      shippingAddress: {
        street: '555 Tampines Avenue',
        city: 'Singapore',
        postalCode: '529649',
        country: 'Singapore',
      },
    },
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="text-green-600" size={18} />;
      case 'shipped':
        return <Truck className="text-blue-600" size={18} />;
      case 'processing':
        return <Clock className="text-yellow-600" size={18} />;
      case 'pending':
        return <Clock className="text-orange-600" size={18} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <Clock className="text-slate-600" size={18} />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Filter orders
  const filteredOrders = mockOrders.filter((order) => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch =
      searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const statusCounts = {
    all: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === 'pending').length,
    processing: mockOrders.filter((o) => o.status === 'processing').length,
    shipped: mockOrders.filter((o) => o.status === 'shipped').length,
    delivered: mockOrders.filter((o) => o.status === 'delivered').length,
    cancelled: mockOrders.filter((o) => o.status === 'cancelled').length,
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
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
              {expandedMenus.has('orders') && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    to="/buyer/orders"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
                  >
                    All Orders
                  </Link>
                  <Link
                    to="/buyer/tracking"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Shipment Tracking
                  </Link>
                  <a
                    href="#"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Pending Payment
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
              <span className="text-slate-900">Orders</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
                  <p className="text-sm text-slate-600">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by order number or product name..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : getStatusLabel(status)} ({statusCounts[status]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 p-6">
            {paginatedOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <FileText className="mx-auto text-slate-400 mb-4" size={64} />
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">No orders found</h2>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
                <Link
                  to="/buyer/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
                >
                  <Package size={18} />
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusLabel(order.status)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(order.createdAt)}
                          </span>
                          {order.trackingNumber && (
                            <span className="flex items-center gap-1">
                              <Truck size={14} />
                              {order.trackingNumber}
                            </span>
                          )}
                          {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Est. delivery: {formatDate(order.estimatedDelivery)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brand-600 mb-1">{formatPrice(order.total, order.currency)}</p>
                        <p className="text-sm text-slate-600">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-slate-200 pt-4 mb-4">
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Package className="text-slate-400" size={18} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{item.productName}</p>
                                <p className="text-slate-600">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-slate-900">{formatPrice(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="border-t border-slate-200 pt-4 mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Shipping Address</p>
                        <p className="text-sm text-slate-700">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500">
                        Last updated: {formatDateTime(order.updatedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/buyer/tracking/${order.id}`)}
                          className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          <Truck size={16} />
                          Track Shipment
                        </button>
                        <button
                          onClick={() => navigate(`/buyer/orders/${order.id}`)}
                          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-brand-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;

