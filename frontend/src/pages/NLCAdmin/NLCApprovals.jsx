import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiMapPin, FiHome, FiUser, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI } from '../../services/api';
import { toast } from 'react-toastify';

const NLCApprovals = () => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingParcels();
  }, []);

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

  const handleAction = (parcel, actionType) => {
    setSelectedParcel(parcel);
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
      await parcelAPI.nlcAdminApproval(selectedParcel._id, {
        status: action,
        remarks: remarks.trim()
      });

      toast.success(`Parcel ${action} successfully`);
      setShowModal(false);
      setSelectedParcel(null);
      setRemarks('');
      fetchPendingParcels();
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
          <h1 className="text-3xl font-bold text-gray-900">NLC Parcel Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve land parcels from County Admins</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading parcels...</p>
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiCheck className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No parcels pending NLC approval</p>
            <p className="text-gray-500 text-sm mt-2">All parcels have been processed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcels.map((parcel) => (
              <div
                key={parcel._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{parcel.titleNumber}</h3>
                    <p className="text-sm text-gray-600">{parcel.lrNumber}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Pending NLC
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
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-2 text-green-600" size={16} />
                    {new Date(parcel.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {parcel.marketValue && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Market Value</p>
                    <p className="font-bold text-green-600">{formatCurrency(parcel.marketValue)}</p>
                  </div>
                )}

                {parcel.countyAdminApproval?.status === 'approved' && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">County Admin Approved</p>
                    {parcel.countyAdminApproval.remarks && (
                      <p className="text-sm text-gray-600 italic">"{parcel.countyAdminApproval.remarks}"</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(parcel, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiCheck size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(parcel, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiX size={18} />
                    Reject
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/parcels/${parcel._id}`)}
                  className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {showModal && selectedParcel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {action === 'approved' ? 'Approve Parcel' : 'Reject Parcel'}
              </h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Title Number</p>
                <p className="font-semibold text-gray-900">{selectedParcel.titleNumber}</p>
                <p className="text-sm text-gray-600 mt-2">Owner</p>
                <p className="font-semibold text-gray-900">{selectedParcel.ownerName}</p>
                <p className="text-sm text-gray-600 mt-2">Location</p>
                <p className="font-semibold text-gray-900">{selectedParcel.county}, {selectedParcel.ward}</p>
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
                    setSelectedParcel(null);
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

export default NLCApprovals;
