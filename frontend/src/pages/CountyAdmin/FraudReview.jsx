import React, { useState, useEffect } from 'react';
import { countyAdminAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const FraudReview = () => {
  const [flaggedParcels, setFlaggedParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchFlaggedParcels();
  }, []);

  const fetchFlaggedParcels = async () => {
    try {
      setLoading(true);
      const response = await countyAdminAPI.getFraudulentParcels();
      setFlaggedParcels(response.data.data);
    } catch (err) {
      toast.error('Failed to load flagged parcels');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlag = async () => {
    if (!resolution.trim()) {
      toast.error('Please provide resolution details');
      return;
    }

    try {
      await countyAdminAPI.removeFraudFlag(selectedParcel._id, {
        resolution
      });
      toast.success('Fraud flag removed successfully');
      setShowResolveModal(false);
      setResolution('');
      fetchFlaggedParcels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove flag');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FiAlertTriangle className="text-3xl text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fraud Review</h1>
            <p className="text-gray-600">Review and manage flagged parcels</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flagged By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
                ) : flaggedParcels.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No flagged parcels</td></tr>
                ) : (
                  flaggedParcels.map((parcel) => (
                    <tr key={parcel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{parcel.titleNumber}</td>
                      <td className="px-6 py-4">{parcel.ownerName}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{parcel.fraudReason}</div>
                      </td>
                      <td className="px-6 py-4">
                        {parcel.flaggedBy?.firstName} {parcel.flaggedBy?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(parcel.flaggedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedParcel(parcel);
                            setShowResolveModal(true);
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolve Modal */}
        {showResolveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Resolve Fraud Flag</h3>
              <p className="text-sm text-gray-600 mb-4">
                Parcel: {selectedParcel?.titleNumber}
              </p>
              <textarea
                rows="4"
                placeholder="Resolution details..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveFlag}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Remove Flag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FraudReview;
