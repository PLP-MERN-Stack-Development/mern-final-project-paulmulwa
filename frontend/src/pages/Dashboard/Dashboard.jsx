import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiSend, FiCheckCircle, FiUsers, FiAlertCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { parcelAPI, transferAPI, userAPI } from '../../services/api';
import Loading from '../../components/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransfers, setRecentTransfers] = useState([]);

  useEffect(() => {
    // Redirect county admins to their dedicated dashboard
    if (user?.role === 'county_admin') {
      navigate('/county-admin/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (user.role === 'user') {
        const [parcelsRes, transfersRes] = await Promise.all([
          parcelAPI.getMyParcels(),
          transferAPI.getAllTransfers()
        ]);

        const allTransfers = transfersRes.data.data;
        const incomingTransfers = allTransfers.filter(t => 
          t.buyer && t.status === 'pending_recipient_review'
        );

        setStats({
          parcels: parcelsRes.data.count,
          transfers: transfersRes.data.count,
          incomingTransfers: incomingTransfers.length,
        });
        setRecentTransfers(transfersRes.data.data.slice(0, 5));
      } else if (user.role === 'county_admin') {
        const transfersRes = await transferAPI.getAllTransfers({ 
          status: 'county_verification' 
        });
        setStats({
          pending: transfersRes.data.data.filter(t => t.status === 'county_verification').length,
          approved: transfersRes.data.data.filter(t => t.status === 'county_approved').length,
          rejected: transfersRes.data.data.filter(t => t.status === 'county_rejected').length,
        });
        setRecentTransfers(transfersRes.data.data.slice(0, 5));
      } else if (user.role === 'nlc_admin' || user.role === 'super_admin') {
        const [transfersRes, usersRes, parcelsRes] = await Promise.all([
          transferAPI.getAllTransfers(),
          userAPI.getPendingAdmins(),
          parcelAPI.getAllParcels()
        ]);
        setStats({
          pendingTransfers: transfersRes.data.data.filter(t => t.status === 'nlc_review').length,
          pendingAdmins: usersRes.data.count,
          totalTransfers: transfersRes.data.count,
          totalParcels: parcelsRes.data.count,
          pendingParcels: parcelsRes.data.data.filter(p => p.approvalStatus !== 'approved').length,
        });
        setRecentTransfers(transfersRes.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      county_approved: 'bg-blue-100 text-blue-800',
      nlc_review: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user.role === 'user' ? (
            <>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">My Parcels</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.parcels}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FiPackage size={24} className="text-primary-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Transfers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.transfers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiSend size={24} className="text-blue-600" />
                  </div>
                </div>
              </Card>

              <Link to="/user/transfers/incoming">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Incoming Transfers</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.incomingTransfers}</p>
                      {stats.incomingTransfers > 0 && (
                        <p className="text-xs text-yellow-600 mt-1">Click to review</p>
                      )}
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FiAlertCircle size={24} className="text-yellow-600" />
                    </div>
                  </div>
                </Card>
              </Link>
            </>
          ) : user.role === 'county_admin' ? (
            <>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Verification</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FiAlertCircle size={24} className="text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Approved</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiCheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.rejected}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FiAlertCircle size={24} className="text-red-600" />
                  </div>
                </div>
              </Card>
            </>
          ) : user.role === 'nlc_admin' || user.role === 'super_admin' ? (
            <>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Land Parcels</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalParcels}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiPackage size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Parcel Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingParcels}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FiAlertCircle size={24} className="text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Admin Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingAdmins}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiUsers size={24} className="text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Transfer Approvals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingTransfers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiCheckCircle size={24} className="text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Transfers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTransfers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiSend size={24} className="text-blue-600" />
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </div>

        {/* Recent Transfers */}
        <Card title="Recent Transfers">
          {recentTransfers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transfers yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transfer #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Parcel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransfers.map((transfer) => (
                    <tr key={transfer._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfer.transferNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {transfer.parcel?.titleNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Link
                          to={`/transfers/${transfer._id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/search"
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <FiPackage size={24} className="text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Search Land</h3>
              <p className="text-sm text-gray-600 mt-1">
                Search for land parcels by location
              </p>
            </Link>

            <Link
              to="/verify"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiCheckCircle size={24} className="text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Verify Title</h3>
              <p className="text-sm text-gray-600 mt-1">
                Verify land title deed authenticity
              </p>
            </Link>

            {user.role === 'user' && stats.parcels > 0 && (
              <Link
                to="/user/transfer"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FiSend size={24} className="text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Transfer Land</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Transfer your land to another user
                </p>
              </Link>
            )}

            {(user.role === 'nlc_admin' || user.role === 'super_admin') && (
              <>
                <Link
                  to="/nlc/pending-admins"
                  className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <FiUsers size={24} className="text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">Pending Admins</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Approve or reject county admin requests
                  </p>
                </Link>

                <Link
                  to="/nlc/approvals"
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FiCheckCircle size={24} className="text-purple-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">Approve Parcels</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review and approve land parcels
                  </p>
                </Link>

                <Link
                  to="/nlc/manage-county-admins"
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <FiUsers size={24} className="text-orange-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">Manage Admins</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create and manage county administrators
                  </p>
                </Link>

                <Link
                  to="/nlc/all-title-deeds"
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <FiPackage size={24} className="text-green-600 mb-2" />
                  <h3 className="font-semibold text-gray-900">All Title Deeds</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View and filter all land title deeds
                  </p>
                </Link>
              </>
            )}

            {user.role === 'super_admin' && (
              <Link
                to="/super-admin/manage-nlc"
                className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FiUsers size={24} className="text-red-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Manage NLC Admins</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage NLC administrators
                </p>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
