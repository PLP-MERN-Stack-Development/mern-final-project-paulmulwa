import { useEffect, useState } from 'react';
import { FiUpload, FiMapPin, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { transferAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

const OutgoingTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutgoingTransfers();
  }, []);

  const fetchOutgoingTransfers = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.getAllTransfers();
      // Filter for outgoing transfers (where current user is the seller)
      // Exclude completed/rejected/cancelled as they appear in Transfer History
      const outgoing = response.data.data.filter(t => 
        t.seller && t.status === 'pending_recipient_review'
      );
      setTransfers(outgoing);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to load outgoing transfers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_recipient_review: { label: 'Pending Recipient Review', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', className: 'bg-green-600 text-white' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getProgressSteps = (status) => {
    const steps = [
      { key: 'pending_recipient_review', label: 'Sent to Recipient', icon: FiClock },
      { key: 'accepted', label: 'Accepted by Recipient', icon: FiCheckCircle },
      { key: 'completed', label: 'Ownership Transferred', icon: FiCheckCircle }
    ];

    const statusOrder = {
      pending_recipient_review: 0,
      accepted: 1,
      completed: 2
    };

    const currentStep = statusOrder[status] || 0;

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentStep,
      active: idx === currentStep
    }));
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outgoing Transfers</h1>
          <p className="text-gray-500 mt-2">Track land transfers you've sent to recipients awaiting their review</p>
        </div>

        {transfers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Pending Outgoing Transfers
              </h3>
              <p className="text-gray-500 mb-4">
                You don't have any pending transfers awaiting recipient review.
              </p>
              <p className="text-sm text-gray-400">
                Completed, rejected, or cancelled transfers appear in Transfer History.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <Card key={transfer._id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Transfer #{transfer.transferNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Initiated on {new Date(transfer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(transfer.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parcel Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FiMapPin className="text-primary-600" />
                        Land Parcel
                      </h4>
                      <div className="space-y-2 text-sm">
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

                    {/* Recipient Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FiUser className="text-primary-600" />
                        To (Recipient)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {transfer.buyerName || `${transfer.buyer?.firstName} ${transfer.buyer?.lastName}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">National ID:</span>
                          <span className="ml-2 text-gray-900">
                            {transfer.buyerNationalId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">KRA PIN:</span>
                          <span className="ml-2 text-gray-900">
                            {transfer.buyerKraPin}
                          </span>
                        </div>
                        {transfer.agreedPrice && (
                          <div>
                            <span className="text-gray-500">Agreed Price:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              {formatCurrency(transfer.agreedPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  {!['cancelled', 'rejected'].includes(transfer.status) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Transfer Progress</h4>
                      <div className="flex items-center justify-between">
                        {getProgressSteps(transfer.status).map((step, idx, arr) => (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                step.completed 
                                  ? 'bg-green-500 text-white' 
                                  : step.active 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-400'
                              }`}>
                                <step.icon size={20} />
                              </div>
                              <span className={`text-xs mt-2 text-center ${
                                step.completed || step.active ? 'text-gray-900 font-medium' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`flex-1 h-1 mx-2 ${
                                step.completed ? 'bg-green-500' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection Notice */}
                  {transfer.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Transfer Rejected by Recipient</h4>
                      <p className="text-sm text-red-800">
                        {transfer.recipientReview?.remarks || transfer.rejectionReason || 'The recipient has rejected this transfer.'}
                      </p>
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

export default OutgoingTransfers;
