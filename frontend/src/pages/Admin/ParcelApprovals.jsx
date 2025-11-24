import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiHome, FiUser, FiCheck, FiX, FiClock, FiFileText } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ParcelApprovals = () => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [remarks, setRemarks] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role || '');
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

  const handleApprovalAction = (parcel, action) => {
    setSelectedParcel(parcel);
    setActionType(action);
    setRemarks('');
    setShowModal(true);
  };

  const submitApproval = async () => {
    if (!selectedParcel) return;

    try {
      const data = {
        status: actionType,
        remarks
      };

      if (userRole === 'county_admin') {
        await parcelAPI.countyAdminApproval(selectedParcel._id, data);
      } else {
        await parcelAPI.nlcAdminApproval(selectedParcel._id, data);
      }

      toast.success(`Parcel ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`);
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

  const getApprovalLevel = () => {
    return userRole === 'county_admin' ? 'County Admin' : 'NLC Admin';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Parcel Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve land parcel registrations as {getApprovalLevel()}
          </p>
        </div>

        {/* Pending Parcels */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading pending parcels...</p>
            </div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-12">
              <FiCheck className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No pending parcels for approval</p>
              <p className="text-gray-500 text-sm mt-2">All parcels have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {parcels.map((parcel) => (
                <div key={parcel._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{parcel.titleNumber}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <FiClock className="mr-1" size={12} />
                          Pending Review
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">LR Number</p>
                          <p className="font-medium text-gray-900">{parcel.lrNumber}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Owner</p>
                          <div className="flex items-center">
                            <FiUser className="mr-2 text-green-600" size={16} />
                            <p className="font-medium text-gray-900">{parcel.ownerName}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Location</p>
                          <div className="flex items-center">
                            <FiMapPin className="mr-2 text-green-600" size={16} />
                            <p className="font-medium text-gray-900">{parcel.county}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Sub-County / Ward</p>
                          <p className="font-medium text-gray-900">{parcel.subCounty} / {parcel.ward}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Size</p>
                          <div className="flex items-center">
                            <FiHome className="mr-2 text-green-600" size={16} />
                            <p className="font-medium text-gray-900">
                              {parcel.size.value} {parcel.size.unit}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Zoning</p>
                          <p className="font-medium text-gray-900 capitalize">{parcel.zoning}</p>
                        </div>
                      </div>

                      {parcel.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Description</p>
                          <p className="text-gray-900">{parcel.description}</p>
                        </div>
                      )}

                      {parcel.marketValue && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Market Value</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(parcel.marketValue)}
                          </p>
                        </div>
                      )}

                      {/* County Admin Approval Status for NLC */}
                      {userRole !== 'county_admin' && parcel.countyAdminApproval?.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center text-green-800">
                            <FiCheck className="mr-2" size={16} />
                            <span className="font-medium">County Admin Approved</span>
                          </div>
                          {parcel.countyAdminApproval.remarks && (
                            <p className="text-sm text-green-700 mt-1">
                              Remarks: {parcel.countyAdminApproval.remarks}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/land/${parcel._id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <FiFileText size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApprovalAction(parcel, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FiCheck size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalAction(parcel, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <FiX size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showModal && selectedParcel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {actionType === 'approved' ? 'Approve Parcel' : 'Reject Parcel'}
                </h2>

                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Title Number:</strong> {selectedParcel.titleNumber}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Owner:</strong> {selectedParcel.ownerName}
                  </p>
                  <p className="text-gray-700">
                    <strong>Location:</strong> {selectedParcel.county}, {selectedParcel.ward}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {actionType === 'rejected' && '*'}
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required={actionType === 'rejected'}
                    rows={4}
                    placeholder={`Add remarks for ${actionType === 'approved' ? 'approval' : 'rejection'}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={submitApproval}
                    disabled={actionType === 'rejected' && !remarks.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                      actionType === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParcelApprovals;
