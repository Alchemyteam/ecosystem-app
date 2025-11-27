import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Store, Plus, BarChart3, Package, DollarSign, Users } from 'lucide-react';

const SellerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Seller Portal</h1>
            <p className="text-slate-600">Manage your products, orders, and sales</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Add Product</h3>
                  <p className="text-sm text-slate-600">List new items</p>
                </div>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
                Create Listing
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Manage Inventory</h3>
                  <p className="text-sm text-slate-600">View all products</p>
                </div>
              </div>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Products
              </button>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Analytics</h3>
                  <p className="text-sm text-slate-600">Track performance</p>
                </div>
              </div>
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors">
                View Reports
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-green-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">$12,450</p>
              <p className="text-xs text-slate-500 mt-1">+12.5% from last month</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="text-blue-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Total Products</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">156</p>
              <p className="text-xs text-slate-500 mt-1">12 active listings</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Store className="text-purple-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Orders</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">89</p>
              <p className="text-xs text-slate-500 mt-1">8 pending</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-orange-600" size={20} />
                <h3 className="text-sm font-medium text-slate-600">Customers</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900">234</p>
              <p className="text-xs text-slate-500 mt-1">Active buyers</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
              <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[
                { id: '#1234', customer: 'John Doe', product: 'Product A', amount: '$299.99', status: 'Pending' },
                { id: '#1235', customer: 'Jane Smith', product: 'Product B', amount: '$149.99', status: 'Shipped' },
                { id: '#1236', customer: 'Bob Johnson', product: 'Product C', amount: '$499.99', status: 'Delivered' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <p className="text-sm text-slate-600">{order.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{order.product}</p>
                        <p className="text-sm text-slate-600">{order.amount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                    <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerPage;

