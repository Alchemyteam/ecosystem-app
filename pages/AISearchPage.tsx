import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BuyerSidebar from '../components/BuyerSidebar';

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
  MessageSquare,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Search,
  Key,
  X,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tableData?: TableData;
  actionData?: ActionData;
  isErrorResponse?: boolean;
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
  const [showDebug, setShowDebug] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [userHiddenExamples, setUserHiddenExamples] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchMode, setSearchMode] = useState<'natural' | 'searchKey'>('natural');
  const [searchKeys, setSearchKeys] = useState<Record<string, string>>({
    Function: '',
    ItemType: '',
    Model: '',
    PerformA: '',
    PerformB: '',
    Material: '',
    Brand: '',
    Bundled: '',
    Origin: '',
    OtherSAK: '',
    UOM: '',
    TPXP1: '',
    TPXP2: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 搜索示例
  const searchExamples = [
    { category: 'By Category', examples: ['Site Safety Equipment', 'Safety Equipment', 'Filters', 'Maintenance Chemicals'] },
    { category: 'By Brand', examples: ['Brand AET', 'Air Liquide Brand', 'Show all products from AET'] },
    { category: 'Multiple Keywords', examples: ['19P+5 micron+99 percent efficiency'], description: 'Use + to connect multiple keywords for combined search' },
  ];


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
          content: 'Hi, I’m AURA. What would you like to know?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [product]);

  // 构建 Search Key 搜索查询
  const buildSearchKeyQuery = (): string => {
    const conditions: string[] = [];
    
    // 字段映射：前端字段名 -> 数据库字段名
    const fieldMapping: Record<string, string> = {
      Function: 'Function',
      ItemType: 'ItemType',
      Model: 'Model',
      PerformA: 'Performance',
      PerformB: 'Performance.1',
      Material: 'Material',
      Brand: 'Brand Code',
      Bundled: 'Bundled',
      Origin: 'Origin',
      OtherSAK: 'Other SAK',
      UOM: 'UOM',
      TPXP1: 'TXP1',
      TPXP2: 'TXP2',
    };

    Object.entries(searchKeys).forEach(([frontendField, value]) => {
      const stringValue = String(value || '');
      if (stringValue.trim()) {
        const dbField = fieldMapping[frontendField] || frontendField;
        conditions.push(`${dbField}="${stringValue.trim()}"`);
      }
    });

    if (conditions.length === 0) {
      return '';
    }

    return `Search products where ${conditions.join(' AND ')}`;
  };

  const handleSend = async (e?: React.FormEvent, messageText?: string) => {
    if (e) {
      e.preventDefault();
    }
    
    let messageToSend: string;
    
    if (searchMode === 'searchKey') {
      messageToSend = buildSearchKeyQuery();
      if (!messageToSend) {
        setError('Please enter at least one search key value');
        return;
      }
    } else {
      messageToSend = messageText || inputValue;
    }
    
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
    setUserHiddenExamples(false);

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

      // Check if this is an error response
      const isErrorResponse = 
        response.response?.toLowerCase().includes('sorry, i encountered an error') &&
        !response.tableData &&
        !response.actionData;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        tableData: response.tableData,
        actionData: response.actionData,
        isErrorResponse: isErrorResponse,
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
        <BuyerSidebar />

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
                  <h1 className="text-xl font-bold text-slate-900">AURA</h1>
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

                  {/* Error Response - Chatbox Redirect */}
                  {message.isErrorResponse && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-700">
                          Still can't find what you're looking for? Jump to chatbox
                        </p>
                        <button
                          onClick={() => navigate('/buyer/messages')}
                          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Go to Chatbox
                        </button>
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
            {/* Search Mode Toggle */}
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('natural');
                  setShowExamples(false);
                  setUserHiddenExamples(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchMode === 'natural'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Search size={16} />
                Natural Language
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('searchKey');
                  setShowExamples(false);
                  setUserHiddenExamples(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchMode === 'searchKey'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Key size={16} />
                Search by Search Key
              </button>
            </div>

            {/* Search Key Form */}
            {searchMode === 'searchKey' && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Search Keys</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeys({
                        Function: '',
                        ItemType: '',
                        Model: '',
                        PerformA: '',
                        PerformB: '',
                        Material: '',
                        Brand: '',
                        Bundled: '',
                        Origin: '',
                        OtherSAK: '',
                        UOM: '',
                        TPXP1: '',
                        TPXP2: '',
                      });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(searchKeys).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          setSearchKeys((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }));
                        }}
                        placeholder={`Enter ${key}`}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Examples */}
            {showExamples && searchMode === 'natural' && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Search Examples</h3>
                  <button
                    onClick={() => {
                      setShowExamples(false);
                      setUserHiddenExamples(true);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchExamples.map((category, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-xs font-medium text-slate-600">{category.category}</p>
                        {(category as any).description && (
                          <span className="text-xs text-slate-500">({(category as any).description})</span>
                        )}
                      </div>
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
            {searchMode === 'natural' ? (
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
                      if (messages.length <= 1 && !userHiddenExamples) {
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
                      onClick={() => {
                        setShowExamples(true);
                        setUserHiddenExamples(false);
                      }}
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
            ) : (
              <form onSubmit={handleSend} className="flex gap-3">
                <div className="flex-1" />
                <button
                  type="submit"
                  disabled={isLoading || Object.values(searchKeys).every((v) => !String(v || '').trim())}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Searching
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Search
                    </>
                  )}
                </button>
              </form>
            )}
            <div className="mt-2 text-xs text-slate-500">
              {searchMode === 'natural' ? (
                <>💡 Hint: Supports search by item code, name, category, brand, and combined conditions. Use + to connect multiple keywords (e.g., 19P+5 micron+99 percent efficiency)</>
              ) : (
                <>💡 Hint: Enter values in the search key fields above to filter products by specific attributes</>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AISearchPage;

