import { useEffect, useState } from 'react';
import { FiClock, FiArrowRight, FiArrowLeft, FiMapPin, FiUser, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { transferAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sent, received

  useEffect(() => {
    fetchTransferHistory();
  }, []);

  const fetchTransferHistory = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.getAllTransfers();
      // Filter for completed and rejected transfers where user was involved
      const history = response.data.data.filter(t => 
        (t.status === 'completed' || t.status === 'rejected' || t.status === 'cancelled')
      );
      setTransfers(history);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      toast.error('Failed to load transfer history');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransfers = () => {
    if (filter === 'all') return transfers;
    // Note: We'll need to compare with current user's ID
    // This is simplified - you'd get current user from auth context
    return transfers;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: FiCheck },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: FiX },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800', icon: FiX }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: FiClock };
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className} flex items-center gap-1`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transfer History</h1>
            <p className="text-gray-500 mt-1">
              Complete record of all your land transfers
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Transfers
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'sent' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiArrowRight className="inline mr-1" size={14} />
              Sent
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'received' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiArrowLeft className="inline mr-1" size={14} />
              Received
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {transfers.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <FiCheck className="text-green-700" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-900 mt-1">
                  {transfers.filter(t => t.status === 'rejected').length}
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <FiX className="text-red-700" size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total History</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {transfers.length}
                </p>
              </div>
              <div className="p-3 bg-gray-200 rounded-full">
                <FiClock className="text-gray-700" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Transfer List */}
        {getFilteredTransfers().length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiClock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Transfer History
              </h3>
              <p className="text-gray-500">
                Your completed and rejected transfers will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {getFilteredTransfers().map((transfer) => (
              <Card key={transfer._id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Transfer #{transfer.transferNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FiCalendar className="text-gray-400" size={14} />
                        <p className="text-sm text-gray-500">
                          {new Date(transfer.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(transfer.status)}
                  </div>

                  {/* Transfer Flow */}
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" size={16} />
                        <p className="font-medium text-gray-900">
                          {transfer.seller?.firstName} {transfer.seller?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <FiArrowRight className="text-primary-600" size={24} />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">To</p>
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" size={16} />
                        <p className="font-medium text-gray-900">
                          {transfer.buyerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Parcel Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FiMapPin className="text-primary-600" />
                        Parcel Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">Title Number:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {transfer.parcel?.titleNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-2 text-gray-900">
                            {transfer.parcel?.county}, {transfer.parcel?.ward}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <span className="ml-2 text-gray-900">
                            {transfer.parcel?.size?.value} {transfer.parcel?.size?.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Transfer Details</h4>
                      <div className="space-y-1 text-sm">
                        {transfer.agreedPrice && (
                          <div>
                            <span className="text-gray-500">Agreed Price:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatCurrency(transfer.agreedPrice)}
                            </span>
                          </div>
                        )}
                        {transfer.completedAt && (
                          <div>
                            <span className="text-gray-500">Completed:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(transfer.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {transfer.rejectionReason && (
                          <div>
                            <span className="text-gray-500">Rejection Reason:</span>
                            <p className="ml-2 text-red-700 italic">
                              {transfer.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recipient Review */}
                  {transfer.recipientReview && (
                    <div className={`border-l-4 p-3 rounded ${
                      transfer.recipientReview.status === 'accepted' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}>
                      <p className="text-sm font-medium">
                        {transfer.recipientReview.status === 'accepted' 
                          ? '✓ Accepted by recipient' 
                          : '✗ Rejected by recipient'}
                      </p>
                      {transfer.recipientReview.remarks && (
                        <p className="text-xs mt-1 text-gray-600">
                          "{transfer.recipientReview.remarks}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TransferHistory;
