import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import BuyerSidebar from '../components/BuyerSidebar';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  Plus,
  Edit,
  Eye,
} from 'lucide-react';

interface PurchaseRequest {
  id: string;
  title: string;
  status: 'draft' | 'in_review' | 'ready_to_order';
  createdAt: string;
  updatedAt: string;
  target?: string;
  quantity?: string;
  deadline?: string;
}

interface OrderStatus {
  id: string;
  orderNumber: string;
  status: 'pending' | 'approved' | 'shipped' | 'completed';
  contractStatus?: string;
  lastUpdated: string;
}

interface Alert {
  id: string;
  type: 'missing_info' | 'pending_approval' | 'pending_confirmation';
  message: string;
  relatedId: string;
  priority: 'high' | 'medium' | 'low';
}

const PurchaseConsolePage: React.FC = () => {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 从 API 获取数据
    // 模拟数据
    setPurchaseRequests([
      {
        id: '1',
        title: 'Site Safety Equipment - Q2 2024',
        status: 'in_review',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        target: 'Site safety compliance',
        quantity: '~50 units',
        deadline: '2024-03-31',
      },
      {
        id: '2',
        title: 'Maintenance Chemicals',
        status: 'draft',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18',
        target: 'Equipment maintenance',
        quantity: 'TBD',
      },
      {
        id: '3',
        title: 'Filter Replacement',
        status: 'ready_to_order',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-22',
        target: 'Air filtration system',
        quantity: '100 units',
        deadline: '2024-02-15',
      },
    ]);

    setRecentOrders([
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        status: 'approved',
        contractStatus: 'Terms agreed',
        lastUpdated: '2024-01-20',
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        status: 'pending',
        contractStatus: 'Negotiating',
        lastUpdated: '2024-01-19',
      },
    ]);

    setAlerts([
      {
        id: '1',
        type: 'missing_info',
        message: 'PR-001 missing delivery address',
        relatedId: '1',
        priority: 'high',
      },
      {
        id: '2',
        type: 'pending_approval',
        message: 'PR-002 awaiting manager approval',
        relatedId: '2',
        priority: 'medium',
      },
      {
        id: '3',
        type: 'pending_confirmation',
        message: 'ORD-2024-002 contract terms need confirmation',
        relatedId: '2',
        priority: 'high',
      },
    ]);

    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      in_review: 'bg-yellow-100 text-yellow-700',
      ready_to_order: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missing_info':
        return <AlertCircle className="text-red-600" size={18} />;
      case 'pending_approval':
        return <Clock className="text-yellow-600" size={18} />;
      case 'pending_confirmation':
        return <Bell className="text-blue-600" size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="pt-20 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <BuyerSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">采购控制台</h1>
              <p className="text-slate-600">管理您的采购任务、请求和订单状态</p>
            </div>

            {/* Key Alerts */}
            {alerts.length > 0 && (
              <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">关键提醒</h2>
                  <span className="text-sm text-slate-500">{alerts.length} 项待处理</span>
                </div>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        alert.priority === 'high'
                          ? 'bg-red-50 border-red-200'
                          : alert.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {alert.type === 'missing_info' && '缺少信息'}
                          {alert.type === 'pending_approval' && '待审批'}
                          {alert.type === 'pending_confirmation' && '待确认'}
                        </p>
                      </div>
                      <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                        处理
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Requests Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">当前采购请求</h2>
                <Link
                  to="/buyer/purchase-requests/new"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  新建 PR
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Draft</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {purchaseRequests.filter((pr) => pr.status === 'draft').length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">草稿状态</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">In Review</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {purchaseRequests.filter((pr) => pr.status === 'in_review').length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">审核中</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Ready to Order</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {purchaseRequests.filter((pr) => pr.status === 'ready_to_order').length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">可下单</p>
                </div>
              </div>

              {/* PR List */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <div className="space-y-4">
                    {purchaseRequests.map((pr) => (
                      <div
                        key={pr.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{pr.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                pr.status
                              )}`}
                            >
                              {pr.status === 'draft' && 'Draft'}
                              {pr.status === 'in_review' && 'In Review'}
                              {pr.status === 'ready_to_order' && 'Ready to Order'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            {pr.target && <span>目标: {pr.target}</span>}
                            {pr.quantity && <span>数量: {pr.quantity}</span>}
                            {pr.deadline && <span>截止: {pr.deadline}</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            更新于: {new Date(pr.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders / Contract Status */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">最近订单/合同条款状态</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{order.orderNumber}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status === 'pending' && 'Pending'}
                              {order.status === 'approved' && 'Approved'}
                              {order.status === 'shipped' && 'Shipped'}
                              {order.status === 'completed' && 'Completed'}
                            </span>
                          </div>
                          {order.contractStatus && (
                            <p className="text-sm text-slate-600">合同状态: {order.contractStatus}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            最后更新: {new Date(order.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="px-4 py-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                          查看详情
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseConsolePage;

