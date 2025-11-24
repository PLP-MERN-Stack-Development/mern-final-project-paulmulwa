import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiMapPin, 
  FiMaximize2, 
  FiUser, 
  FiClock, 
  FiFileText, 
  FiDownload, 
  FiExternalLink,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiArrowRight,
  FiArrowLeft,
  FiList
} from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import PDFViewer from '../../components/PDFViewer';
import TransferHistoryModal from '../../components/TransferHistoryModal';
import { parcelAPI, transferAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ParcelDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [parcel, setParcel] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [detailedTransferHistory, setDetailedTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, documents, history
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchParcelDetails();
    }
  }, [id]);

  const fetchParcelDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch parcel details
      const parcelResponse = await parcelAPI.getParcelById(id);
      const parcelData = parcelResponse.data.data;
      
      // Fetch transfer history for this parcel
      const transfersResponse = await transferAPI.getAllTransfers();
      const allTransfers = transfersResponse.data.data || [];
      
      // Filter transfers for this parcel
      const parcelTransfers = allTransfers.filter(
        transfer => (transfer.parcel?._id || transfer.parcel) === id
      );
      
      // Fetch detailed transfer history from new endpoint
      try {
        const detailedHistoryResponse = await parcelAPI.getTransferHistory(id);
        setDetailedTransferHistory(detailedHistoryResponse.data.data || []);
      } catch (error) {
        console.log('Detailed transfer history not available:', error);
      }
      
      setParcel(parcelData);
      setTransfers(parcelTransfers);
    } catch (error) {
      console.error('Error fetching parcel details:', error);
      toast.error('Failed to load parcel details');
    } finally {
      setLoading(false);
    }
  };

  const getOwnershipStatus = () => {
    if (!parcel) return null;
    
    const lastTransfer = parcel.transferHistory?.[parcel.transferHistory.length - 1];
    const currentOwner = parcel.owner?._id || parcel.owner;
    const isCurrentOwner = currentOwner === user._id;
    
    if (lastTransfer) {
      const transferFrom = lastTransfer.from?._id || lastTransfer.from;
      const transferTo = lastTransfer.to?._id || lastTransfer.to;
      
      if (transferFrom === user._id) {
        return {
          status: 'Transferred Out',
          description: `You transferred this parcel to ${parcel.ownerName || 'another user'} on ${new Date(lastTransfer.date).toLocaleDateString()}`,
          color: 'orange',
          icon: FiArrowRight
        };
      }
      
      if (transferTo === user._id) {
        return {
          status: 'Transferred In (Accepted)',
          description: `You received this parcel via transfer on ${new Date(lastTransfer.date).toLocaleDateString()}`,
          color: 'blue',
          icon: FiArrowLeft
        };
      }
    }
    
    if (isCurrentOwner) {
      return {
        status: 'Owned',
        description: 'You are the current owner of this parcel',
        color: 'green',
        icon: FiCheckCircle
      };
    }
    
    return {
      status: 'View Only',
      description: 'You are viewing this parcel',
      color: 'gray',
      icon: FiFileText
    };
  };

  const getApprovalStatusBadge = (status) => {
    const configs = {
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      pending_county_admin: { label: 'Pending County Approval', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      pending_nlc_admin: { label: 'Pending NLC Approval', color: 'bg-orange-100 text-orange-800', icon: FiClock },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: FiAlertCircle }
    };
    return configs[status] || configs.pending_county_admin;
  };

  const getTransferStatusColor = (status) => {
    const colors = {
      pending_recipient_review: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      county_verification: 'bg-blue-100 text-blue-800',
      nlc_review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadTitleDeed = async () => {
    try {
      toast.info('Preparing title deed for download...');
      const response = await parcelAPI.getTitleDeedPDF(parcel._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Title_Deed_${parcel.titleNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Title deed downloaded successfully');
    } catch (error) {
      console.error('Error downloading title deed:', error);
      toast.error(error.response?.data?.message || 'Failed to download title deed');
    }
  };

  const handleViewTitleDeed = async () => {
    try {
      toast.info('Loading title deed...');
      const response = await parcelAPI.viewTitleDeedPDF(parcel._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast.success('Title deed opened in new tab');
    } catch (error) {
      console.error('Error viewing title deed:', error);
      toast.error(error.response?.data?.message || 'Failed to view title deed');
    }
  };

  const handleDownloadTransferHistory = async () => {
    try {
      const response = await parcelAPI.getTransferHistoryPDF(parcel._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transfer_History_${parcel.titleNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Transfer history downloaded successfully');
    } catch (error) {
      console.error('Error downloading transfer history:', error);
      toast.error('Failed to download transfer history');
    }
  };

  const handleViewTransferDetails = () => {
    setShowTransferModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (!parcel) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Parcel Not Found</h3>
            <p className="text-gray-500 mb-6">The parcel you're looking for doesn't exist.</p>
            <Link to="/user/my-parcels" className="btn btn-primary">
              Back to My Parcels
            </Link>
          </div>
        </Card>
      </Layout>
    );
  }

  const ownershipStatus = getOwnershipStatus();
  const approvalStatus = getApprovalStatusBadge(parcel.approvalStatus);
  const StatusIcon = ownershipStatus?.icon || FiFileText;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                to="/user/my-parcels" 
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{parcel.titleNumber}</h1>
            <p className="text-gray-600 mt-1">Parcel ID: {parcel._id.slice(-8).toUpperCase()}</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleViewTransferDetails}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiList size={18} />
              Transfer Details
            </button>
            
            {ownershipStatus?.status === 'Owned' && (
              <Link
                to={`/user/transfer?parcelId=${parcel._id}`}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiSend size={18} />
                Transfer This Parcel
              </Link>
            )}
          </div>
        </div>

        {/* Ownership Status Banner */}
        <Card className={`border-l-4 border-${ownershipStatus?.color}-500`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${ownershipStatus?.color}-100`}>
              <StatusIcon className={`text-${ownershipStatus?.color}-600`} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{ownershipStatus?.status}</h3>
              <p className="text-gray-600 mt-1">{ownershipStatus?.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${approvalStatus.color} flex items-center gap-1`}>
              <approvalStatus.icon size={14} />
              {approvalStatus.label}
            </span>
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'documents'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Title Deed & Documents
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transaction History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parcel Information */}
            <Card title="Parcel Information">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title Deed ID</label>
                  <p className="text-gray-900 font-medium mt-1">{parcel.lrNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Land Size</label>
                  <p className="text-gray-900 font-medium mt-1 flex items-center gap-2">
                    <FiMaximize2 size={16} />
                    {parcel.size?.value} {parcel.size?.unit === 'square_meters' ? 'Square Meters' : parcel.size?.unit}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Zoning</label>
                  <p className="text-gray-900 font-medium mt-1 capitalize">
                    {parcel.zoning}
                  </p>
                </div>

                {parcel.landUse && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Land Use</label>
                    <p className="text-gray-900 font-medium mt-1">{parcel.landUse}</p>
                  </div>
                )}

                {parcel.marketValue && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Market Value</label>
                    <p className="text-gray-900 font-medium mt-1">
                      KES {parcel.marketValue.toLocaleString()}
                    </p>
                  </div>
                )}

                {parcel.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-700 mt-1">{parcel.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Location Details */}
            <Card title="Location Details">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-primary-600 mt-1" size={20} />
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">County</label>
                        <p className="text-gray-900 font-medium mt-1">{parcel.county}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Sub-County</label>
                        <p className="text-gray-900 font-medium mt-1">{parcel.subCounty}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Constituency</label>
                        <p className="text-gray-900 font-medium mt-1">{parcel.constituency}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">Ward</label>
                        <p className="text-gray-900 font-medium mt-1">{parcel.ward}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {parcel.coordinates?.latitude && parcel.coordinates?.longitude && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Coordinates</label>
                    <p className="text-gray-900 mt-1">
                      {parcel.coordinates.latitude}, {parcel.coordinates.longitude}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${parcel.coordinates.latitude},${parcel.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-2"
                    >
                      View on Google Maps <FiExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Owner Information */}
            <Card title="Current Owner Information">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiUser className="text-gray-400 mt-1" size={20} />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-500">Owner Name</label>
                    <p className="text-gray-900 font-medium mt-1">{parcel.ownerName}</p>
                    
                    {parcel.ownerIdNumber && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-500">National ID</label>
                        <p className="text-gray-900 mt-1">{parcel.ownerIdNumber}</p>
                      </div>
                    )}
                    
                    {parcel.ownerKraPin && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-500">KRA PIN</label>
                        <p className="text-gray-900 mt-1">{parcel.ownerKraPin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Approval Status */}
            <Card title="Approval Status">
              <div className="space-y-4">
                {/* County Admin Approval */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    parcel.countyAdminApproval?.status === 'approved' 
                      ? 'bg-green-100' 
                      : parcel.countyAdminApproval?.status === 'rejected'
                      ? 'bg-red-100'
                      : 'bg-yellow-100'
                  }`}>
                    {parcel.countyAdminApproval?.status === 'approved' ? (
                      <FiCheckCircle className="text-green-600" size={20} />
                    ) : (
                      <FiClock className="text-yellow-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">County Admin</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {parcel.countyAdminApproval?.status || 'pending'}
                    </p>
                    {parcel.countyAdminApproval?.approvedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(parcel.countyAdminApproval.approvedAt).toLocaleString()}
                      </p>
                    )}
                    {parcel.countyAdminApproval?.remarks && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{parcel.countyAdminApproval.remarks}"
                      </p>
                    )}
                  </div>
                </div>

                {/* NLC Admin Approval */}
                <div className="flex items-start gap-3 pt-4 border-t">
                  <div className={`p-2 rounded-lg ${
                    parcel.nlcAdminApproval?.status === 'approved' 
                      ? 'bg-green-100' 
                      : parcel.nlcAdminApproval?.status === 'rejected'
                      ? 'bg-red-100'
                      : 'bg-yellow-100'
                  }`}>
                    {parcel.nlcAdminApproval?.status === 'approved' ? (
                      <FiCheckCircle className="text-green-600" size={20} />
                    ) : (
                      <FiClock className="text-yellow-600" size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">NLC Admin</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {parcel.nlcAdminApproval?.status || 'pending'}
                    </p>
                    {parcel.nlcAdminApproval?.approvedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(parcel.nlcAdminApproval.approvedAt).toLocaleString()}
                      </p>
                    )}
                    {parcel.nlcAdminApproval?.remarks && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{parcel.nlcAdminApproval.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <Card title="Title Deed Document">
              <div className="space-y-4">
                {/* PDF Actions */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                  <FiFileText size={64} className="mx-auto text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Official Title Deed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    View or download the official title deed document for this parcel
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button 
                      onClick={handleViewTitleDeed}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <FiExternalLink size={18} />
                      View in New Tab
                    </button>
                    <button 
                      onClick={handleDownloadTitleDeed}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <FiDownload size={18} />
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Document Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property Description</label>
                      <p className="text-gray-900 mt-1">{parcel.description || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Land Registration Number</label>
                      <p className="text-gray-900 mt-1">{parcel.lrNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Issue</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Owner's Name</label>
                      <p className="text-gray-900 mt-1">{parcel.ownerName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {parcel.documents && parcel.documents.length > 0 && (
              <Card title="Additional Documents">
                <div className="space-y-2">
                  {parcel.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-gray-400" size={20} />
                        <span className="text-gray-900">Document {index + 1}</span>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <FiDownload size={16} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Download Transfer History PDF Button */}
            <div className="flex justify-end">
              <a
                href={parcelAPI.getTransferHistoryPDF(parcel._id)}
                download={`Transfer_History_${parcel.titleNumber}.pdf`}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FiDownload size={18} />
                Download Transfer History PDF
              </a>
            </div>

            {/* Detailed Transfer History */}
            {detailedTransferHistory.length > 0 && (
              <Card title="Detailed Transfer History">
                <div className="space-y-6">
                  {detailedTransferHistory.map((transfer, index) => (
                    <div key={index} className="border-l-4 border-primary-600 pl-4 py-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            Transfer #{transfer.transferNumber}
                          </h4>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold mt-2 ${getTransferStatusColor(transfer.status)}`}>
                            {transfer.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {transfer.transferReference && (
                          <div className="text-sm text-gray-500">
                            Ref: {transfer.transferReference}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Previous Owner */}
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                            <FiArrowLeft size={16} />
                            Previous Owner
                          </h5>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">
                              <span className="font-medium">Name:</span> {transfer.previousOwner.name}
                            </p>
                            {transfer.previousOwner.email && (
                              <p className="text-gray-700">
                                <span className="font-medium">Email:</span> {transfer.previousOwner.email}
                              </p>
                            )}
                            {transfer.previousOwner.nationalId && (
                              <p className="text-gray-700">
                                <span className="font-medium">National ID:</span> {transfer.previousOwner.nationalId}
                              </p>
                            )}
                            {transfer.previousOwner.phone && (
                              <p className="text-gray-700">
                                <span className="font-medium">Phone:</span> {transfer.previousOwner.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* New Owner */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                            <FiArrowRight size={16} />
                            New Owner
                          </h5>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">
                              <span className="font-medium">Name:</span> {transfer.newOwner.name}
                            </p>
                            {transfer.newOwner.email && (
                              <p className="text-gray-700">
                                <span className="font-medium">Email:</span> {transfer.newOwner.email}
                              </p>
                            )}
                            {transfer.newOwner.nationalId && (
                              <p className="text-gray-700">
                                <span className="font-medium">National ID:</span> {transfer.newOwner.nationalId}
                              </p>
                            )}
                            {transfer.newOwner.phone && (
                              <p className="text-gray-700">
                                <span className="font-medium">Phone:</span> {transfer.newOwner.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Transfer Dates */}
                      <div className="flex flex-wrap gap-4 mb-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Initiated:</span>{' '}
                          <span className="text-gray-900">
                            {new Date(transfer.dateInitiated).toLocaleDateString()}
                          </span>
                        </div>
                        {transfer.dateCompleted && (
                          <div>
                            <span className="font-medium text-gray-700">Completed:</span>{' '}
                            <span className="text-gray-900">
                              {new Date(transfer.dateCompleted).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Remarks */}
                      {transfer.remarks && (
                        <div className="bg-gray-50 p-3 rounded-lg mt-3">
                          <h5 className="font-semibold text-gray-900 text-sm mb-1">Remarks</h5>
                          <p className="text-gray-700 text-sm italic">{transfer.remarks}</p>
                        </div>
                      )}

                      {/* Timeline */}
                      {transfer.timeline && transfer.timeline.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-gray-900 text-sm mb-2">Timeline</h5>
                          <div className="space-y-2">
                            {transfer.timeline.map((event, eventIndex) => (
                              <div key={eventIndex} className="flex gap-2 text-sm">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                  {eventIndex < transfer.timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                                  )}
                                </div>
                                <div className="flex-1 pb-3">
                                  <p className="text-gray-900">{event.action}</p>
                                  <p className="text-gray-500 text-xs">
                                    {new Date(event.date).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Transfer Timeline */}
            {parcel.transferHistory && parcel.transferHistory.length > 0 && (
              <Card title="Ownership Timeline">
                <div className="space-y-4">
                  {parcel.transferHistory.map((transfer, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                        {index < parcel.transferHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <FiArrowRight className="text-primary-600" />
                          <h4 className="font-semibold text-gray-900">
                            Transfer #{index + 1}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">From:</span> {transfer.from?.firstName || 'N/A'} → 
                          <span className="font-medium"> To:</span> {transfer.to?.firstName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transfer.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Transfer Records */}
            <Card title="Transfer Records">
              {transfers.length === 0 ? (
                <div className="text-center py-8">
                  <FiClock size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No transfer records found for this parcel</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Transfer #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          From
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          To
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
                      {transfers.map((transfer) => (
                        <tr key={transfer._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transfer.transferNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {transfer.seller?.firstName} {transfer.seller?.lastName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {transfer.buyer?.firstName} {transfer.buyer?.lastName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getTransferStatusColor(transfer.status)}`}>
                              {transfer.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
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
          </div>
        )}
      </div>

      {/* Transfer History Modal */}
      <TransferHistoryModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        parcel={parcel}
        transferHistory={detailedTransferHistory}
        onDownloadPDF={handleDownloadTransferHistory}
      />
    </Layout>
  );
};

export default ParcelDetails;
