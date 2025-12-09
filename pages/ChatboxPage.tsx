import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getToken } from '../services/api';
import { sendChatMessage } from '../services/chatApi';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Home,
  Package,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Heart,
  FileText,
  User as UserIcon,
  HelpCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'support';
  content: string;
  timestamp: Date;
}

const ChatboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! 👋 Welcome to our customer service chat. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      // For now, use the same chat API, but this can be changed to a dedicated support chat API later
      const response = await sendChatMessage(inputValue, token, conversationId);

      // Update conversation ID
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || 'Thank you for your message. Our support team will get back to you soon.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message, please try again later';
      setError(errorMessage);

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, encountered an error: ${errorMessage}. Please try again or contact support.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
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
                </div>
              )}
            </div>

            {/* Messages */}
            <Link
              to="/buyer/messages"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
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
              <span className="text-slate-900">Customer Service</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Customer Service Chat</h1>
                  <p className="text-sm text-slate-600">Get help from our support team</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/buyer/ai-search')}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to AI Search
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role !== 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'support' 
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  }`}>
                    {message.role === 'support' ? (
                      <UserIcon className="text-white" size={18} />
                    ) : (
                      <Bot className="text-white" size={18} />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending
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
              💡 Tip: Our support team is here to help with any questions about products, orders, or account issues.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatboxPage;

