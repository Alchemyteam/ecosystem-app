import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Welcome to your dashboard</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">1,234</h3>
              <p className="text-sm text-slate-600">Total Revenue</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">+12.5%</h3>
              <p className="text-sm text-slate-600">Growth Rate</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">567</h3>
              <p className="text-sm text-slate-600">Active Users</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="text-orange-600" size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">89</h3>
              <p className="text-sm text-slate-600">Orders</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">New order received</p>
                  <p className="text-sm text-slate-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                  B
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">User registration completed</p>
                  <p className="text-sm text-slate-600">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                  C
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">System update completed</p>
                  <p className="text-sm text-slate-600">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;

