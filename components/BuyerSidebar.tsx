import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ShoppingCart,
  Heart,
  FileText,
  User as UserIcon,
  HelpCircle,
  ClipboardList,
  Plus,
} from 'lucide-react';

const BuyerSidebar: React.FC = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['products', 'orders', 'favorites', 'account'])
  );

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

  // 判断当前路径是否激活
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 判断路径是否匹配（支持动态路由）
  const isPathMatch = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto">
      <nav className="p-4 space-y-1">
        {/* Home */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive('/')
              ? 'bg-brand-50 text-brand-600'
              : 'text-slate-700 hover:bg-slate-100 hover:text-brand-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </Link>

        {/* Tier 1: Procurement Console - Hidden */}
        {/* <div>
          <button
            onClick={() => toggleMenu('procurement')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5" />
              <span className="font-medium">采购控制台</span>
            </div>
            {expandedMenus.has('procurement') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedMenus.has('procurement') && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/buyer/purchase-console"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/purchase-console')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/buyer/purchase-requests"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isPathMatch('/buyer/purchase-requests') && !isActive('/buyer/purchase-requests/new')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                My PRs
              </Link>
            </div>
          )}
        </div> */}

        {/* Tier 1: Create Purchase Request - Hidden */}
        {/* <div>
          <button
            onClick={() => toggleMenu('purchase-requests')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Purchase Requests</span>
            </div>
            {expandedMenus.has('purchase-requests') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {expandedMenus.has('purchase-requests') && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/buyer/purchase-requests/new"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/purchase-requests/new')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus size={14} />
                  Create PR
                </div>
              </Link>
              <Link
                to="/buyer/purchase-requests"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isPathMatch('/buyer/purchase-requests') && !isActive('/buyer/purchase-requests/new')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                All PRs
              </Link>
            </div>
          )}
        </div> */}

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
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/products')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                All Products
              </Link>
              <Link
                to="/buyer/ai-search"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/ai-search')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                AI Search
              </Link>
              <Link
                to="/buyer/price-insights"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/price-insights')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
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
          {expandedMenus.has('orders') && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/buyer/orders"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/orders')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                All Orders
              </Link>
              <Link
                to="/buyer/tracking"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/buyer/tracking')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                }`}
              >
                Shipment Tracking
              </Link>
            </div>
          )}
        </div>

        {/* Cart */}
        <Link
          to="/buyer/cart"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive('/buyer/cart')
              ? 'bg-brand-50 text-brand-600'
              : 'text-slate-700 hover:bg-slate-100 hover:text-brand-600'
          }`}
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
        <Link
          to="/buyer/messages"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive('/buyer/messages')
              ? 'bg-brand-50 text-brand-600'
              : 'text-slate-700 hover:bg-slate-100 hover:text-brand-600'
          }`}
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
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Account</span>
            </div>
            {expandedMenus.has('account') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
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
  );
};

export default BuyerSidebar;

