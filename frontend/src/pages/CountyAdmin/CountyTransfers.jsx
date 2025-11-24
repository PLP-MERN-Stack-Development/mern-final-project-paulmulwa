import React, { useState, useEffect } from 'react';
import { countyAdminAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { FiRefreshCw, FiStopCircle, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CountyTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [flagAsFraud, setFlagAsFraud] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await countyAdminAPI.getTransfers();
      setTransfers(response.data.data);
    } catch (err) {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTransfer = async () => {
    if (!stopReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await countyAdminAPI.stopTransfer(selectedTransfer._id, {
        reason: stopReason,
        isFraudulent: flagAsFraudulent,
      });
      toast.success('Transfer stopped successfully');
      setShowStopModal(false);
      setStopReason('');
      setFlagAsFraud(false);
      fetchTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to stop transfer');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="text-3xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Requests</h1>
            <p className="text-gray-600">Manage land transfer requests in your county</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
                ) : transfers.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No transfers found</td></tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{transfer.parcel?.titleNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{transfer.seller?.firstName} {transfer.seller?.lastName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{transfer.buyer?.firstName} {transfer.buyer?.lastName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer);
                            setShowStopModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <FiStopCircle /> Stop
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stop Transfer Modal */}
        {showStopModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Stop Transfer</h3>
              <textarea
                rows="4"
                placeholder="Reason for stopping this transfer..."
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={flagAsFraud}
                  onChange={(e) => setFlagAsFraud(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Flag this parcel as fraudulent</span>
              </label>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowStopModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStopTransfer}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Stop Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CountyTransfers;
