import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

import { BuyerProduct, ApiError, buyerApi } from '../services/api';
import { TableData, ActionData } from '../types/chat';
import { sendChatMessage } from '../services/chatApi';
import { getToken } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tableData?: TableData;
  actionData?: ActionData;
}

const AISearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product as BuyerProduct | undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [showDebug, setShowDebug] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 搜索示例
  const searchExamples = [
    { category: 'By Item Code', examples: ['TI00040', 'Find item code TI00040', 'What is the price range of TI00040'] },
    { category: 'By Item Name', examples: ['Spray Paint', 'LEAKAGE CURRENT CLAMP METER', 'Safety Helmet'] },
    { category: 'By Category', examples: ['Site Safety Equipment', 'Safety Equipment', 'Filters', 'Maintenance Chemicals'] },
    { category: 'By Brand', examples: ['Brand AET', 'Air Liquide Brand', 'Show all products from AET'] },
    { category: 'Combined Search', examples: ['Site Safety Equipment + Air Liquide + Last Year', 'Filters + AET + Price 100-500'] },
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

  const handleAddToCart = async (productId: string) => {
    // 验证 productId
    if (!productId || productId.trim() === '') {
      setNotification({ type: 'error', message: 'Product ID is missing. Cannot add to cart.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      await buyerApi.addToCart({ productId: productId.trim(), quantity: 1 });
      setNotification({ type: 'success', message: 'Product added to cart successfully!' });
    } catch (error) {
      const apiError = error as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to add product to cart.';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with product context if available
    if (product) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I can help you find information about **${product.name}**. You can ask me about:\n\n- Historical prices\n- Product comparisons\n- Supplier information\n- Or any other related questions`,
          timestamp: new Date(),
        },
      ]);
      setInputValue(`What is the historical price of ${product.name}?`);
    } else {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I am your AI Material Search Assistant. I can help you with:\n\n🔍 **Search Materials** - By code, name, category, brand, etc.\n📊 **View Historical Data** - Price trends, transaction records\n💡 **Smart Recommendations** - Find suitable products based on your needs\n\nTry entering an item code (e.g., TI00040) or name (e.g., Safety Shoes) to start searching!',
          timestamp: new Date(),
        },
      ]);
    }
  }, [product]);

  const handleSend = async (e?: React.FormEvent, messageText?: string) => {
    if (e) {
      e.preventDefault();
    }
    const messageToSend = messageText || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);
    setShowExamples(false);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      const response = await sendChatMessage(messageToSend, token, conversationId);

      // Debug: Log the response to see what we're getting
      console.log('AI Response:', response);
      console.log('Table Data:', response.tableData);
      console.log('Action Data:', response.actionData);

      // Store last response for debugging
      setLastResponse(response);

      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        tableData: response.tableData,
        actionData: response.actionData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const apiError = err as ApiError | Error;
      const errorMessage = apiError instanceof Error ? apiError.message : (apiError as ApiError).message || 'Failed to send message, please try again later';
      setError(errorMessage);

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    handleSend(undefined, example);
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
        <aside className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto">
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
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
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
                  <ChevronRight className="w-4 h-4" />
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link to="/buyer" className="hover:text-brand-600">
                Buyer Portal
              </Link>
              <span>/</span>
              <Link to="/buyer/products" className="hover:text-brand-600">
                Products
              </Link>
              <span>/</span>
              <span className="text-slate-900">AI Search</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">AI Material Search</h1>
                  <p className="text-sm text-slate-600">Smart search for material info, historical prices, transaction records, etc.</p>
                </div>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium transition-colors"
                >
                  {showDebug ? 'Hide Debug' : 'Show Debug'}
                </button>
              )}
            </div>
            {product && (
              <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Current Product Context:</p>
                <p className="font-medium text-slate-900">{product.name}</p>
              </div>
            )}
            {showDebug && lastResponse && (
              <div className="mt-4 p-4 bg-slate-100 border border-slate-300 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">Debug Info - Last Response:</p>
                <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-auto max-h-60">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
                <div className="mt-2 text-xs text-slate-600">
                  <p>Has tableData: {lastResponse.tableData ? 'Yes' : 'No'}</p>
                  <p>Has actionData: {lastResponse.actionData ? 'Yes' : 'No'}</p>
                  {lastResponse.tableData && (
                    <p>Table rows: {lastResponse.tableData.rows?.length || 0}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={18} />
                  </div>
                )}
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Table Data Display */}
                  {message.tableData && (
                    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-900">{message.tableData.title}</h4>
                        {message.tableData.description && (
                          <p className="text-xs text-slate-600 mt-1">{message.tableData.description}</p>
                        )}
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 sticky top-0 z-10">
                            <tr>
                              {message.tableData.headers.map((header, idx) => (
                                <th key={idx} className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">
                                  {header}
                                </th>
                              ))}
                              <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">
                                Details
                              </th>
                              <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {message.tableData.rows.map((row, rowIdx) => {
                              // 提取产品ID：只使用 id（数据库主键）
                              const getProductId = (row: Record<string, any>): string | null => {
                                // 只使用 id 字段（数据库主键）
                                // 支持多种字段名变体：id, ID, Id
                                const idFields = ['id', 'ID', 'Id'];
                                for (const field of idFields) {
                                  const value = row[field];
                                  // 严格检查：id 不为 null/undefined/空字符串，包括数字 0
                                  if (value !== null && value !== undefined && value !== '') {
                                    // id 可以是数字或字符串，都接受（包括纯数字）
                                    return String(value).trim();
                                  }
                                }
                                
                                // 如果没有找到 id 字段，返回 null
                                return null;
                              };
                              
                              const productId = getProductId(row);
                              
                              return (
                                <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                  {message.tableData!.headers.map((header, colIdx) => (
                                    <td key={colIdx} className="px-4 py-2 text-slate-700">
                                      {String(row[header] ?? '')}
                                    </td>
                                  ))}
                                  <td className="px-4 py-2">
                                    {productId ? (
                                      <button
                                        onClick={() => {
                                          console.log('View Details clicked, navigating to product:', productId, 'from row:', row);
                                          navigate(`/buyer/products/${productId}`);
                                        }}
                                        className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                                        title={`View details for product ID: ${productId}`}
                                      >
                                        View Details
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400" title="Product ID not found in this row">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {productId ? (
                                      <button
                                        onClick={() => handleAddToCart(productId)}
                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
                                        title={`Add product ${productId} to cart`}
                                      >
                                        <ShoppingCart size={14} />
                                        Add to Cart
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400" title="Product ID not found in this row">-</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Data Display */}
                  {message.actionData && (
                    <div className="mt-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="text-brand-600 flex-shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-900">{message.actionData.message}</p>
                          <p className="text-xs text-brand-700 mt-1">
                            Action: {message.actionData.actionType}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-brand-100' : 'text-slate-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-slate-600" size={18} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={18} />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <Loader2 className="animate-spin text-brand-600" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 z-10 shadow-lg">
            {/* Search Examples */}
            {showExamples && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Search Examples</h3>
                  <button
                    onClick={() => setShowExamples(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchExamples.map((category, idx) => (
                    <div key={idx}>
                      <p className="text-xs font-medium text-slate-600 mb-1.5">{category.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {category.examples.map((example, exampleIdx) => (
                          <button
                            key={exampleIdx}
                            onClick={() => handleExampleClick(example)}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors text-left"
                            disabled={isLoading}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  onFocus={() => {
                    if (messages.length <= 1) {
                      setShowExamples(true);
                    }
                  }}
                  placeholder="Enter search query, e.g., TI00040 or Safety Shoes or Site Safety Equipment + Air Liquide + Last Year"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  disabled={isLoading}
                />
                {!showExamples && (
                  <button
                    type="button"
                    onClick={() => setShowExamples(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    View Examples
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Searching
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send
                  </>
                )}
              </button>
            </form>
            <div className="mt-2 text-xs text-slate-500">
              💡 Hint: Supports search by item code, name, category, brand, and combined conditions
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AISearchPage;

