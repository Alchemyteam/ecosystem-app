import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Search, Heart, Package, TrendingUp } from 'lucide-react';

const BuyerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Buyer Portal</h1>
            <p className="text-slate-600">Browse and purchase products from verified sellers</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Search Products</h3>
                  <p className="text-sm text-slate-600">Find what you need</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                Browse Catalog
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">My Orders</h3>
                  <p className="text-sm text-slate-600">Track your purchases</p>
                </div>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Orders
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                  <Heart className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Wishlist</h3>
                  <p className="text-sm text-slate-600">Save for later</p>
                </div>
              </div>
              <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Wishlist
              </button>
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
              <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="w-full h-48 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="text-slate-400" size={48} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Product {item}</h3>
                  <p className="text-sm text-slate-600 mb-4">Product description goes here</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">$99.99</span>
                    <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Total Orders</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-600 mt-1">This month</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">5</p>
              <p className="text-sm text-slate-600 mt-1">In progress</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-brand-600" size={24} />
                <h3 className="text-lg font-semibold text-slate-900">Wishlist Items</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-600 mt-1">Saved items</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyerPage;

