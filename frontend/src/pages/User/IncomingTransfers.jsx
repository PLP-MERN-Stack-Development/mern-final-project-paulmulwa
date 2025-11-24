import { useEffect, useState } from 'react';
import { FiDownload, FiCheck, FiX, FiMapPin, FiUser, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { transferAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import Swal from 'sweetalert2';

const IncomingTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchIncomingTransfers();
  }, []);

  const fetchIncomingTransfers = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.getAllTransfers();
      // Filter for incoming transfers (where current user is the buyer and status is pending)
      const incoming = response.data.data.filter(t => 
        t.buyer && t.status === 'pending_recipient_review'
      );
      setTransfers(incoming);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to load incoming transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTransfer = async (transferId, parcelTitle) => {
    const result = await Swal.fire({
      title: 'Accept Land Transfer?',
      html: `
        <div style="text-align: left;">
          <p><strong>Parcel:</strong> ${parcelTitle}</p>
          <p style="margin-top: 10px;">Upon acceptance:</p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>You will become the legal owner of this parcel</li>
            <li>The parcel will appear in your "My Parcels"</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Accept Transfer',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setProcessingId(transferId);
      await transferAPI.acceptTransfer(transferId, 'Accepted by recipient');
      
      await Swal.fire({
        title: 'Transfer Accepted!',
        html: `
          <div style="text-align: center;">
            <p>🎉 Congratulations!</p>
            <p style="margin-top: 10px;">You are now the owner of <strong>${parcelTitle}</strong></p>
            <p style="margin-top: 10px; color: #6b7280;">Check "My Parcels" to view your property</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'View My Parcels'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/user/parcels';
        }
      });
      
      fetchIncomingTransfers();
    } catch (error) {
      console.error('Error accepting transfer:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to accept transfer. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTransfer = async () => {
    if (!rejectionReason.trim()) {
      Swal.fire({
        title: 'Reason Required',
        text: 'Please provide a reason for rejection',
        icon: 'warning',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    try {
      setProcessingId(selectedTransfer._id);
      await transferAPI.rejectTransfer(selectedTransfer._id, rejectionReason);
      
      await Swal.fire({
        title: 'Transfer Rejected',
        text: 'The sender has been notified of your decision',
        icon: 'info',
        confirmButtonColor: '#3b82f6'
      });
      
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedTransfer(null);
      fetchIncomingTransfers();
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to reject transfer. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (transfer) => {
    setSelectedTransfer(transfer);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_recipient_review: { label: 'Pending Your Review', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Transfers</h1>
          <p className="text-gray-500 mt-2">Review and respond to land transfers sent to you</p>
        </div>

        {transfers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiDownload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Pending Incoming Transfers
              </h3>
              <p className="text-gray-500 mb-4">
                You don't have any pending land transfers awaiting your review.
              </p>
              <p className="text-sm text-gray-400">
                When someone sends you a land transfer, it will appear here for you to accept or reject.
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
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                        <div>
                          <span className="text-gray-500">Market Value:</span>
                          <span className="ml-2 text-gray-900">
                            {formatCurrency(transfer.parcel?.marketValue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FiUser className="text-primary-600" />
                        From (Current Owner)
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {transfer.seller?.firstName} {transfer.seller?.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2 text-gray-900">
                            {transfer.seller?.email}
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

                  {/* Encumbrances & Disputes */}
                  {(transfer.parcel?.encumbrances?.length > 0 || transfer.parcel?.hasDisputes) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notice</h4>
                      {transfer.parcel?.hasDisputes && (
                        <p className="text-sm text-yellow-800 mb-2">
                          This property has active disputes. Please review carefully.
                        </p>
                      )}
                      {transfer.parcel?.encumbrances?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-yellow-900 mb-1">Encumbrances:</p>
                          <ul className="list-disc list-inside text-sm text-yellow-800">
                            {transfer.parcel.encumbrances.map((enc, idx) => (
                              <li key={idx}>{enc.type}: {enc.description}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transfer Status Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Transfer Information</h4>
                    <p className="text-sm text-blue-800">
                      {transfer.status === 'pending_recipient_review' && 'Please review the transfer details carefully. Once you accept, ownership will be immediately transferred to you.'}
                    </p>
                  </div>

                  {/* Action Buttons for Pending Review */}
                  {transfer.status === 'pending_recipient_review' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleAcceptTransfer(transfer._id, transfer.parcel?.titleNumber || 'this parcel')}
                        disabled={processingId === transfer._id}
                        className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        {processingId === transfer._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiCheck size={18} />
                            Accept Transfer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openRejectModal(transfer)}
                        disabled={processingId === transfer._id}
                        className="btn btn-outline border-red-300 text-red-600 hover:bg-red-50 flex-1 flex items-center justify-center gap-2"
                      >
                        <FiX size={18} />
                        Reject Transfer
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Transfer
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this transfer. The sender will be notified.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter your reason for rejection..."
                className="input w-full h-32 resize-none"
                autoFocus
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedTransfer(null);
                  }}
                  disabled={processingId}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectTransfer}
                  disabled={processingId || !rejectionReason.trim()}
                  className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  {processingId ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncomingTransfers;
