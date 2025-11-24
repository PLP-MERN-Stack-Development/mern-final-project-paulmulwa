import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { countyAdminAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { 
  FiHome, 
  FiMap, 
  FiFileText, 
  FiRefreshCw, 
  FiClock, 
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp
} from 'react-icons/fi';

const CountyAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await countyAdminAPI.getDashboard();
      setOverview(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  const { county, statistics, recentActivity } = overview;

  const statCards = [
    {
      title: 'Total Parcels',
      value: statistics.totalParcels,
      icon: FiMap,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Parcels',
      value: statistics.activeParcels,
      icon: FiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Pending Transfers',
      value: statistics.pendingTransfers,
      icon: FiClock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'Completed Transfers',
      value: statistics.completedTransfers,
      icon: FiTrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Flagged Parcels',
      value: statistics.flaggedParcels,
      icon: FiAlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconBg: 'bg-red-100'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Parcels',
      description: 'View, create, edit or delete parcels',
      icon: FiMap,
      color: 'blue',
      path: '/county-admin/parcels'
    },
    {
      title: 'Title Deeds',
      description: 'View and manage title deeds',
      icon: FiFileText,
      color: 'green',
      path: '/county-admin/title-deeds'
    },
    {
      title: 'Transfer Requests',
      description: 'Manage transfer requests',
      icon: FiRefreshCw,
      color: 'purple',
      path: '/county-admin/transfers'
    },
    {
      title: 'Fraud Review',
      description: 'Review flagged parcels',
      icon: FiAlertTriangle,
      color: 'red',
      path: '/county-admin/fraud-review'
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FiHome className="text-3xl text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">County Admin Dashboard</h1>
              <p className="text-gray-600">{county}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor} mb-1`}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <stat.icon className={`text-2xl ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-left group"
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`text-2xl text-${action.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transfer Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((transfer) => (
                  <div key={transfer._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiRefreshCw className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transfer.parcel?.titleNumber || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transfer.seller?.firstName} {transfer.seller?.lastName} → {transfer.buyer?.firstName} {transfer.buyer?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {transfer.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CountyAdminDashboard;
