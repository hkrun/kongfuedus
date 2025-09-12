"use client";

import { useState, useEffect } from "react";

interface Purchase {
  id: string;
  type: 'course' | 'subscription';
  title: string;
  category: string;
  instructor: string;
  amount: number;
  currency: string;
  status: string;
  purchaseDate: string;
  expiresAt?: string;
  stripeSessionId: string;
  cancelAtPeriodEnd?: boolean;
}

interface PurchaseHistoryResponse {
  purchases: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PurchaseHistory() {
  const [data, setData] = useState<PurchaseHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'course' | 'subscription'>('all');

  useEffect(() => {
    fetchPurchaseHistory();
  }, [currentPage, filter]);

  const fetchPurchaseHistory = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/user/purchase-history?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('获取购买记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    const price = (amount / 100).toFixed(2);
    return `¥${price}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '有效';
      case 'canceled':
        return '已取消';
      case 'expired':
        return '已过期';
      case 'refunded':
        return '已退款';
      default:
        return status;
    }
  };

  const filteredPurchases = data?.purchases.filter(purchase => {
    if (filter === 'all') return true;
    return purchase.type === filter;
  }) || [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.purchases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">购买记录</h3>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 mb-4">暂无购买记录</p>
          <p className="text-sm text-gray-400">
            您购买课程或订阅后，记录将显示在这里
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">购买记录</h3>
        <div className="text-sm text-gray-500">
          共 {data.pagination.total} 条记录
        </div>
      </div>

      {/* 筛选器 */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {[
            { value: 'all', label: '全部' },
            { value: 'course', label: '课程' },
            { value: 'subscription', label: '订阅' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                filter === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 购买记录列表 */}
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">{purchase.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                    {getStatusText(purchase.status)}
                  </span>
                  {purchase.type === 'subscription' && purchase.cancelAtPeriodEnd && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      即将到期
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {purchase.instructor} • {purchase.category}
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    购买时间: {formatDate(purchase.purchaseDate)}
                  </div>
                  {purchase.expiresAt && (
                    <div className="flex items-center">
                      <span className="mr-1">⏰</span>
                      到期时间: {formatDate(purchase.expiresAt)}
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    金额: {formatAmount(purchase.amount, purchase.currency)}
                  </div>
                </div>
              </div>

              <div className="ml-4 text-right">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {formatAmount(purchase.amount, purchase.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {purchase.type === 'course' ? '课程购买' : '平台订阅'}
                </div>
              </div>
            </div>

            {/* 订单详情 */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>订单ID: {purchase.stripeSessionId}</span>
                <span>交易ID: {purchase.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示第 {(currentPage - 1) * data.pagination.limit + 1} - {Math.min(currentPage * data.pagination.limit, data.pagination.total)} 条，
            共 {data.pagination.total} 条
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {currentPage} / {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
              disabled={currentPage === data.pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
