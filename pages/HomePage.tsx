import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth, UserRole } from '../contexts/AuthContext';
import {
  User,
  CheckCircle2,
  Clock,
  FileText,
  ShoppingCart,
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  Bell,
  Star,
  Bookmark,
  ArrowRight,
  FileCheck,
  AlertCircle,
  Truck,
  DollarSign,
  Percent,
  FileUp,
  MessageSquare,
  Settings,
  Plus,
  Eye,
  Heart,
} from 'lucide-react';

interface TodoItem {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'file' | 'quote' | 'project';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

interface WorkflowStatus {
  label: string;
  value: number;
  total: number;
  color: string;
}

interface Metric {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link: string;
}

interface PinnedItem {
  id: string;
  title: string;
  type: 'order' | 'project' | 'document';
  icon: React.ReactNode;
  link: string;
}

const HomePage: React.FC = () => {
  const { user, currentRole, setCurrentRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentRole(role);
  };

  // Role-based todos
  const getTodos = (role: UserRole): TodoItem[] => {
    switch (role) {
      case 'Buyer':
        return [
          {
            id: '1',
            title: 'Pending Order Confirmations',
            count: 3,
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            id: '2',
            title: 'Pending Quote Confirmations',
            count: 2,
            icon: <FileText className="w-5 h-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          },
          {
            id: '3',
            title: 'Files to Upload',
            count: 1,
            icon: <FileUp className="w-5 h-5" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
          },
        ];
      case 'Seller':
        return [
          {
            id: '1',
            title: 'New RFQs to Quote',
            count: 5,
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
          },
          {
            id: '2',
            title: 'Pending Order Confirmations',
            count: 2,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            id: '3',
            title: 'Orders to Ship',
            count: 4,
            icon: <Truck className="w-5 h-5" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
          },
        ];
      case 'PE':
        return [
          {
            id: '1',
            title: 'Spec Files to Review',
            count: 7,
            icon: <FileCheck className="w-5 h-5" />,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
          },
          {
            id: '2',
            title: 'Technical Issues to Handle',
            count: 3,
            icon: <AlertCircle className="w-5 h-5" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
          },
          {
            id: '3',
            title: 'Production Changes to Approve',
            count: 2,
            icon: <Settings className="w-5 h-5" />,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50',
          },
        ];
    }
  };

  // Recent activities
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: 'Order #ORD-2024-001 updated',
      description: 'Status changed to "In Production"',
      time: '2 minutes ago',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: '2',
      type: 'file',
      title: 'Technical specification uploaded',
      description: 'File: spec_v2.1.pdf by John Doe',
      time: '15 minutes ago',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: '3',
      type: 'quote',
      title: 'New quote received',
      description: 'RFQ #RFQ-2024-045 from ABC Corp',
      time: '1 hour ago',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: '4',
      type: 'project',
      title: 'Project milestone reached',
      description: 'Phase 2 completed for Project X',
      time: '3 hours ago',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  // Workflow status
  const getWorkflowStatus = (role: UserRole): WorkflowStatus[] => {
    switch (role) {
      case 'Buyer':
        return [
          { label: 'Pending', value: 2, total: 10, color: 'bg-yellow-500' },
          { label: 'Confirmed', value: 5, total: 10, color: 'bg-blue-500' },
          { label: 'In Transit', value: 2, total: 10, color: 'bg-purple-500' },
          { label: 'Delivered', value: 1, total: 10, color: 'bg-green-500' },
        ];
      case 'Seller':
        return [
          { label: 'Not Started', value: 3, total: 12, color: 'bg-gray-400' },
          { label: 'In Production', value: 6, total: 12, color: 'bg-blue-500' },
          { label: 'Ready to Ship', value: 2, total: 12, color: 'bg-amber-500' },
          { label: 'Shipped', value: 1, total: 12, color: 'bg-green-500' },
        ];
      case 'PE':
        return [
          { label: 'Pending Review', value: 4, total: 15, color: 'bg-yellow-500' },
          { label: 'In Progress', value: 8, total: 15, color: 'bg-blue-500' },
          { label: 'Approved', value: 3, total: 15, color: 'bg-green-500' },
        ];
    }
  };

  // Metrics/KPI
  const getMetrics = (role: UserRole): Metric[] => {
    switch (role) {
      case 'Buyer':
        return [
          {
            label: 'Monthly Purchase Amount',
            value: '$125,430',
            change: '+12.5%',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-600',
          },
          {
            label: 'Top Supplier Rating',
            value: '4.8/5.0',
            change: '+0.2',
            icon: <Star className="w-5 h-5" />,
            color: 'text-yellow-600',
          },
        ];
      case 'Seller':
        return [
          {
            label: 'Sales Revenue',
            value: '$342,890',
            change: '+18.3%',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-green-600',
          },
          {
            label: 'RFQ Conversion Rate',
            value: '68%',
            change: '+5%',
            icon: <Percent className="w-5 h-5" />,
            color: 'text-blue-600',
          },
        ];
      case 'PE':
        return [
          {
            label: 'Weekly File Processing',
            value: '47 files',
            change: '+8',
            icon: <FileText className="w-5 h-5" />,
            color: 'text-indigo-600',
          },
          {
            label: 'Project Health Score',
            value: '92/100',
            change: '+3',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'text-green-600',
          },
        ];
    }
  };

  // Quick actions
  const getQuickActions = (role: UserRole): QuickAction[] => {
    switch (role) {
      case 'Buyer':
        return [
          {
            id: '1',
            title: 'Enter Buyer Portal',
            icon: <Plus className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 hover:bg-blue-100',
            link: '/buyer',
          },
          {
            id: '2',
            title: 'Create RFQ',
            icon: <FileText className="w-5 h-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 hover:bg-green-100',
            link: '/buyer',
          },
        ];
      case 'Seller':
        return [
          {
            id: '1',
            title: 'Submit Quote',
            icon: <MessageSquare className="w-5 h-5" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 hover:bg-purple-100',
            link: '/seller',
          },
          {
            id: '2',
            title: 'Update Order Status',
            icon: <Settings className="w-5 h-5" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 hover:bg-amber-100',
            link: '/seller',
          },
        ];
      case 'PE':
        return [
          {
            id: '1',
            title: 'Upload Technical File',
            icon: <FileUp className="w-5 h-5" />,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 hover:bg-indigo-100',
            link: '/pe',
          },
          {
            id: '2',
            title: 'Submit Review',
            icon: <FileCheck className="w-5 h-5" />,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50 hover:bg-teal-100',
            link: '/pe',
          },
        ];
    }
  };

  // Pinned items
  const pinnedItems: PinnedItem[] = [
    {
      id: '1',
      title: 'Order #ORD-2024-001',
      type: 'order',
      icon: <ShoppingCart className="w-4 h-4" />,
      link: '/orders/ORD-2024-001',
    },
    {
      id: '2',
      title: 'Project Alpha',
      type: 'project',
      icon: <Package className="w-4 h-4" />,
      link: '/projects/alpha',
    },
    {
      id: '3',
      title: 'Specification Template',
      type: 'document',
      icon: <FileText className="w-4 h-4" />,
      link: '/documents/spec-template',
    },
  ];

  const todos = getTodos(selectedRole);
  const workflowStatus = getWorkflowStatus(selectedRole);
  const metrics = getMetrics(selectedRole);
  const quickActions = getQuickActions(selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans text-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* User Identity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {user?.name || user?.email || 'User'}!
                </h1>
                <p className="text-slate-600 mt-1">Here's what's happening with your account today</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Current Role:</span>
              <div className="flex gap-2">
                {(['Buyer', 'Seller', 'PE'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      selectedRole === role
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My To-dos Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600" />
                  My To-dos
                </h2>
                <span className="text-sm text-slate-500">Based on {selectedRole} role</span>
              </div>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`${todo.bgColor} border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={todo.color}>{todo.icon}</div>
                      <span className="font-medium text-slate-900">{todo.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${todo.color}`}>{todo.count}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-600" />
                  Recent Activities & System Updates
                </h2>
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                        {activity.icon}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-2">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Status Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                Workflow Status Overview
              </h2>
              <div className="space-y-4">
                {workflowStatus.map((status) => (
                  <div key={status.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{status.label}</span>
                      <span className="text-sm text-slate-500">
                        {status.value}/{status.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${status.color} h-full rounded-full transition-all`}
                        style={{ width: `${(status.value / status.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Metrics/KPI Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                Key Metrics
              </h2>
              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${metric.color} flex items-center gap-2`}>
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-3">
                      <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                      {metric.change && (
                        <span className="text-sm font-medium text-green-600">{metric.change}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-brand-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <a
                    key={action.id}
                    href={action.link}
                    className={`${action.bgColor} ${action.color} border border-slate-200 rounded-xl p-4 flex items-center justify-between group cursor-pointer transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon}
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>

            {/* Pinned Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-600" />
                Pinned Items
              </h2>
              <div className="space-y-3">
                {pinnedItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:bg-slate-50 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
