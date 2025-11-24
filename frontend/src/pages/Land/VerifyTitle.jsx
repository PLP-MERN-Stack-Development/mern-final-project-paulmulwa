import { useState } from 'react';
import { FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle, FiMapPin, FiCalendar, FiUser, FiFileText, FiInfo, FiHome } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI } from '../../services/api';
import { toast } from 'react-toastify';

const VerifyTitle = () => {
  const [titleNumber, setTitleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!titleNumber.trim()) {
      toast.error('Please enter a title number');
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);
      setShowDetails(false);

      const response = await parcelAPI.getParcelByTitleNumber(titleNumber.trim());
      const parcel = response.data.data;

      // Determine verification status
      let status = 'authentic';
      let statusMessage = 'Title Deed is Authentic';
      let statusDescription = 'This land parcel exists in the official registry and has been verified.';

      if (parcel.approvalStatus === 'rejected') {
        status = 'invalid';
        statusMessage = 'Invalid or Rejected Title';
        statusDescription = 'This title deed has been rejected or is not valid in the land registry.';
      } else if (parcel.approvalStatus !== 'approved') {
        status = 'suspicious';
        statusMessage = 'Pending Verification';
        statusDescription = 'This title deed exists but is awaiting official approval from authorities.';
      } else if (parcel.hasDisputes || parcel.encumbrances?.length > 0) {
        status = 'suspicious';
        statusMessage = 'Caution: Has Encumbrances';
        statusDescription = 'This title deed is authentic but has active encumbrances, disputes, or restrictions.';
      }

      setVerificationResult({
        status,
        statusMessage,
        statusDescription,
        parcel
      });
      setShowDetails(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setVerificationResult({
          status: 'invalid',
          statusMessage: 'Title Number Not Found',
          statusDescription: 'This title number does not exist in the official land registry. It may be fake or incorrectly entered.',
          parcel: null
        });
      } else {
        console.error('Error verifying title:', error);
        toast.error('Failed to verify title. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'authentic':
        return <FiCheckCircle className="text-green-600" size={64} />;
      case 'invalid':
        return <FiXCircle className="text-red-600" size={64} />;
      case 'suspicious':
        return <FiAlertTriangle className="text-yellow-600" size={64} />;
      default:
        return <FiInfo className="text-gray-600" size={64} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'authentic':
        return 'bg-green-50 border-green-200';
      case 'invalid':
        return 'bg-red-50 border-red-200';
      case 'suspicious':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Land Title Deed</h1>
          <p className="text-gray-600">
            Enter a title number to verify the authenticity and legitimacy of a land parcel
          </p>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How Verification Works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Enter the exact Title Number from the land title deed</li>
                <li>System checks against official government land registry</li>
                <li>Receive instant verification of authenticity and ownership details</li>
                <li>View any encumbrances, disputes, or pending transfers</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                💡 Example: NAI12345678, MOM12345610, KIS12345615
              </p>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={titleNumber}
                  onChange={(e) => setTitleNumber(e.target.value.toUpperCase())}
                  placeholder="Enter title number (e.g., NAI12345678)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                  disabled={loading}
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !titleNumber.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <FiSearch size={20} />
                  Verify Title Deed
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`border-2 rounded-lg p-6 ${getStatusColor(verificationResult.status)}`}>
            {/* Status Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {getStatusIcon(verificationResult.status)}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {verificationResult.statusMessage}
              </h2>
              <p className="text-gray-700">
                {verificationResult.statusDescription}
              </p>
            </div>

            {/* Parcel Details */}
            {verificationResult.parcel && showDetails && (
              <div className="space-y-6">
                <hr className="border-gray-300" />

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFileText className="text-green-600" />
                    Title Deed Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Title Number</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {verificationResult.parcel.titleNumber}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">LR Number</p>
                      <p className="font-semibold text-gray-900">
                        {verificationResult.parcel.lrNumber}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Approval Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        verificationResult.parcel.approvalStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : verificationResult.parcel.approvalStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {verificationResult.parcel.approvalStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Registration Date</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <FiCalendar size={16} />
                        {new Date(verificationResult.parcel.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Registered Owner Details
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Owner Name</p>
                        <p className="font-semibold text-gray-900">
                          {verificationResult.parcel.ownerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">National ID Number</p>
                        <p className="font-semibold text-gray-900">
                          {verificationResult.parcel.ownerIdNumber || 'Not Available'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">KRA PIN</p>
                        <p className="font-semibold text-gray-900">
                          {verificationResult.parcel.ownerKraPin || 'Not Available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMapPin className="text-purple-600" />
                    Location & Boundaries
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">County</p>
                        <p className="font-semibold text-gray-900">{verificationResult.parcel.county}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sub-County</p>
                        <p className="font-semibold text-gray-900">{verificationResult.parcel.subCounty || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Constituency</p>
                        <p className="font-semibold text-gray-900">{verificationResult.parcel.constituency || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ward</p>
                        <p className="font-semibold text-gray-900">{verificationResult.parcel.ward}</p>
                      </div>
                      {verificationResult.parcel.gpsCoordinates && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">GPS Coordinates</p>
                            <p className="font-semibold text-gray-900 text-sm">
                              {verificationResult.parcel.gpsCoordinates.latitude}, {verificationResult.parcel.gpsCoordinates.longitude}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiHome className="text-orange-600" />
                    Property Details
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Parcel Size</p>
                        <p className="font-semibold text-gray-900">
                          {verificationResult.parcel.size.value} {verificationResult.parcel.size.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Land Use / Zoning</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {verificationResult.parcel.zoning}
                        </p>
                      </div>
                      {verificationResult.parcel.marketValue && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Estimated Market Value</p>
                          <p className="font-semibold text-green-600 text-lg">
                            {formatCurrency(verificationResult.parcel.marketValue)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Encumbrances & Restrictions */}
                {(verificationResult.parcel.encumbrances?.length > 0 || verificationResult.parcel.hasDisputes) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiAlertTriangle className="text-red-600" />
                      Encumbrances & Restrictions
                    </h3>
                    <div className="bg-white rounded-lg p-4">
                      {verificationResult.parcel.hasDisputes && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                          <p className="text-red-800 font-medium">⚠️ This property has active disputes</p>
                        </div>
                      )}
                      {verificationResult.parcel.encumbrances?.map((enc, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                          <p className="text-yellow-900 font-medium">{enc.type}: {enc.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ownership History */}
                {verificationResult.parcel.ownershipHistory?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership History</h3>
                    <div className="bg-white rounded-lg p-4">
                      <div className="space-y-3">
                        {verificationResult.parcel.ownershipHistory.map((history, index) => (
                          <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                            <p className="font-semibold text-gray-900">{history.ownerName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(history.fromDate).toLocaleDateString()} - {history.toDate ? new Date(history.toDate).toLocaleDateString() : 'Present'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifyTitle;
