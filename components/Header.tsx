import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION } from '../constants';
import { Menu, X, LogOut, User, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
            X
          </div>
          <span className={`font-bold text-lg tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            [X]
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/dashboard' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/buyer"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/buyer' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            Buyer
          </Link>
          <Link
            to="/buyer/sales-data-management"
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              location.pathname === '/buyer/sales-data-management' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            <Database size={16} />
            Data Management
          </Link>
          <Link
            to="/seller"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/seller' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            Seller
          </Link>
          <Link
            to="/pe"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/pe' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
          >
            PE
          </Link>
          
          {/* User Info */}
          <div className="flex items-center gap-3 ml-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs text-slate-500 max-w-[150px] truncate">
                  {user?.email}
                </span>
              </div>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg p-4 flex flex-col gap-4">
          <Link
            to="/"
            className={`text-base font-medium block ${
              location.pathname === '/' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`text-base font-medium block ${
              location.pathname === '/dashboard' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/buyer"
            className={`text-base font-medium block ${
              location.pathname === '/buyer' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Buyer
          </Link>
          <Link
            to="/buyer/sales-data-management"
            className={`text-base font-medium block flex items-center gap-2 ${
              location.pathname === '/buyer/sales-data-management' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Database size={18} />
            Data Management
          </Link>
          <Link
            to="/seller"
            className={`text-base font-medium block ${
              location.pathname === '/seller' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Seller
          </Link>
          <Link
            to="/pe"
            className={`text-base font-medium block ${
              location.pathname === '/pe' 
                ? 'text-brand-600' 
                : 'text-slate-600 hover:text-brand-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            PE
          </Link>
          
          {/* Mobile User Info */}
          <div className="border-t border-slate-200 pt-4 mt-2 flex flex-col gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-2 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-slate-900">
                  {user?.name || 'User'}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {user?.email}
                </span>
              </div>
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-base font-medium text-slate-600 hover:text-brand-600 px-2 py-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;