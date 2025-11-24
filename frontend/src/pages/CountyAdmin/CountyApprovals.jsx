import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiMapPin, FiHome, FiUser, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI, transferAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const CountyApprovals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parcels');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (activeTab === 'parcels') {
      fetchPendingParcels();
    } else {
      fetchPendingTransfers();
    }
  }, [activeTab]);

  const fetchPendingParcels = async () => {
    try {
      setLoading(true);
      const response = await parcelAPI.getPendingParcels();
      setParcels(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending parcels:', error);
      toast.error('Failed to load pending parcels');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTransfers = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.getAllTransfers({ status: 'county_verification' });
      setTransfers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      toast.error('Failed to load pending transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (item, actionType) => {
    setSelectedItem(item);
    setAction(actionType);
    setShowModal(true);
    setRemarks('');
  };

  const submitApproval = async () => {
    if (!remarks.trim() && action === 'rejected') {
      toast.error('Please provide remarks for rejection');
      return;
    }

    try {
      if (activeTab === 'parcels') {
        await parcelAPI.countyAdminApproval(selectedItem._id, {
          status: action,
          remarks: remarks.trim()
        });
      } else {
        await transferAPI.countyVerifyTransfer(selectedItem._id, {
          verified: action === 'approved',
          remarks: remarks.trim()
        });
      }

      toast.success(`${activeTab === 'parcels' ? 'Parcel' : 'Transfer'} ${action} successfully`);
      setShowModal(false);
      setSelectedItem(null);
      setRemarks('');
      
      if (activeTab === 'parcels') {
        fetchPendingParcels();
      } else {
        fetchPendingTransfers();
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error(error.response?.data?.message || 'Failed to process approval');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">County Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve parcels and transfers in {user?.county}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('parcels')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'parcels'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Land Parcels ({parcels.length})
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'transfers'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transfers ({transfers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            ) : activeTab === 'parcels' ? (
              parcels.length === 0 ? (
                <div className="text-center py-12">
                  <FiCheck className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 text-lg">No parcels pending approval</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parcels.map((parcel) => (
                    <div
                      key={parcel._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{parcel.titleNumber}</h3>
                          <p className="text-sm text-gray-600">{parcel.lrNumber}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="mr-2 text-green-600" size={16} />
                          {parcel.county}, {parcel.ward}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiHome className="mr-2 text-green-600" size={16} />
                          {parcel.size.value} {parcel.size.unit} • {parcel.zoning}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUser className="mr-2 text-green-600" size={16} />
                          {parcel.ownerName}
                        </div>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => handleAction(parcel, 'approved')}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <FiCheck size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(parcel, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          <FiX size={16} />
                          Reject
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/parcels/${parcel._id}`)}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              transfers.length === 0 ? (
                <div className="text-center py-12">
                  <FiCheck className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 text-lg">No transfers pending verification</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{transfer.transferNumber}</h3>
                          <p className="text-sm text-gray-600">{transfer.parcel?.titleNumber}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">From (Seller)</p>
                          <p className="font-medium text-gray-900">{transfer.seller?.firstName} {transfer.seller?.lastName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">To (Buyer)</p>
                          <p className="font-medium text-gray-900">{transfer.buyer?.firstName} {transfer.buyer?.lastName}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(transfer, 'approved')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiCheck size={18} />
                          Verify
                        </button>
                        <button
                          onClick={() => handleAction(transfer, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FiX size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {action === 'approved' ? `Approve ${activeTab === 'parcels' ? 'Parcel' : 'Transfer'}` : `Reject ${activeTab === 'parcels' ? 'Parcel' : 'Transfer'}`}
              </h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                {activeTab === 'parcels' ? (
                  <>
                    <p className="text-sm text-gray-600">Title Number</p>
                    <p className="font-semibold text-gray-900">{selectedItem.titleNumber}</p>
                    <p className="text-sm text-gray-600 mt-2">Owner</p>
                    <p className="font-semibold text-gray-900">{selectedItem.ownerName}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Transfer Number</p>
                    <p className="font-semibold text-gray-900">{selectedItem.transferNumber}</p>
                    <p className="text-sm text-gray-600 mt-2">Parcel</p>
                    <p className="font-semibold text-gray-900">{selectedItem.parcel?.titleNumber}</p>
                  </>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks {action === 'rejected' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={`Enter remarks for ${action}...`}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={submitApproval}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    action === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {action === 'approved' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                    setRemarks('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CountyApprovals;
