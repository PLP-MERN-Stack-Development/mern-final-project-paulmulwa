import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiMapPin, FiUser, FiHash, FiCreditCard, FiDollarSign, FiAlertCircle, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { parcelAPI, transferAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

const TransferLand = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedParcelId = searchParams.get('parcelId');

  const [loading, setLoading] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(true);
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    parcelId: preselectedParcelId || '',
    buyerName: '',
    buyerNationalId: '',
    buyerKraPin: '',
    agreedPrice: ''
  });

  useEffect(() => {
    fetchMyParcels();
  }, []);

  // Debounced search for user by National ID
  useEffect(() => {
    if (formData.buyerNationalId && formData.buyerNationalId.length >= 7) {
      const timeoutId = setTimeout(() => {
        searchUserByNationalId(formData.buyerNationalId);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else if (formData.buyerNationalId.length < 7) {
      setFoundUser(null);
      setUserNotFound(false);
    }
  }, [formData.buyerNationalId]);

  const fetchMyParcels = async () => {
    try {
      setLoadingParcels(true);
      const response = await parcelAPI.getMyParcels();
      const approvedParcels = response.data.data.filter(
        p => p.approvalStatus === 'approved' && p.status !== 'pending_transfer'
      );
      setParcels(approvedParcels);
      
      if (preselectedParcelId && !formData.parcelId) {
        setFormData(prev => ({ ...prev, parcelId: preselectedParcelId }));
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
      toast.error('Failed to load your parcels');
    } finally {
      setLoadingParcels(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset user search state when National ID is cleared
    if (name === 'buyerNationalId' && !value) {
      setFoundUser(null);
      setUserNotFound(false);
    }
  };

  const searchUserByNationalId = async (nationalId) => {
    if (!nationalId || nationalId.length < 7) {
      setFoundUser(null);
      setUserNotFound(false);
      return;
    }

    try {
      setSearchingUser(true);
      setUserNotFound(false);
      
      const response = await userAPI.getUserByNationalId(nationalId);
      const user = response.data.data;
      
      setFoundUser(user);
      // Auto-fill the form fields
      setFormData(prev => ({
        ...prev,
        buyerName: `${user.firstName} ${user.lastName}`,
        buyerKraPin: user.kraPin
      }));
      
      toast.success(`Found user: ${user.firstName} ${user.lastName}`);
    } catch (error) {
      setFoundUser(null);
      setUserNotFound(true);
      setFormData(prev => ({
        ...prev,
        buyerName: '',
        buyerKraPin: ''
      }));
      
      if (error.response?.status === 404) {
        toast.warning('User not found. Please ensure the recipient is registered.');
      } else {
        console.error('Error searching user:', error);
      }
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.parcelId) {
      toast.error('Please select a parcel to transfer');
      return;
    }

    if (!formData.buyerNationalId.trim()) {
      toast.error('Please enter recipient National ID');
      return;
    }

    if (!foundUser) {
      toast.error('Please enter a valid National ID. The recipient must be registered in the system.');
      return;
    }

    if (!formData.buyerName.trim() || !formData.buyerKraPin.trim()) {
      toast.error('Recipient information is incomplete. Please verify the National ID.');
      return;
    }

    try {
      setLoading(true);
      await transferAPI.initiateTransfer({
        parcelId: formData.parcelId,
        buyerName: formData.buyerName.trim(),
        buyerNationalId: formData.buyerNationalId.trim(),
        buyerKraPin: formData.buyerKraPin.trim().toUpperCase(),
        agreedPrice: formData.agreedPrice ? parseFloat(formData.agreedPrice) : undefined
      });

      toast.success('Transfer initiated successfully! Awaiting County Admin verification.');
      navigate('/user/transfers/outgoing');
    } catch (error) {
      console.error('Error initiating transfer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate transfer';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedParcel = parcels.find(p => p._id === formData.parcelId);

  if (loadingParcels) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (parcels.length === 0) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <FiMapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Parcels Available for Transfer
            </h3>
            <p className="text-gray-500 mb-6">
              You don't have any approved parcels that can be transferred at the moment.
            </p>
            <button
              onClick={() => navigate('/user/parcels')}
              className="btn btn-primary"
            >
              View My Parcels
            </button>
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FiSend size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Transfer Land Ownership</h1>
              <p className="text-primary-100 mt-1">
                Initiate a secure land transfer by providing recipient details
              </p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex gap-3">
            <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How Land Transfer Works</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Select the land parcel you wish to transfer</li>
                <li><strong>Enter recipient's National ID first</strong> - their name and KRA PIN will be auto-populated from the system</li>
                <li>County Admin will verify all documents and details</li>
                <li>NLC Admin will conduct final review and approval</li>
                <li>Upon approval, ownership will be automatically transferred</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2 font-semibold">
                ⚠️ Important: Recipients must be registered users in the system. Manual entry of names and KRA PINs is not allowed for security purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transfer Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Parcel Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Select Land Parcel</h3>
                  </div>
                  <select
                    name="parcelId"
                    value={formData.parcelId}
                    onChange={handleChange}
                    required
                    className="input w-full text-base"
                  >
                    <option value="">-- Choose a parcel to transfer --</option>
                    {parcels.map(parcel => (
                      <option key={parcel._id} value={parcel._id}>
                        {parcel.titleNumber} • {parcel.county} • {parcel.size.value} {parcel.size.unit}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Only approved parcels without pending transfers are shown
                  </p>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Step 2: Recipient Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recipient Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Recipient Name */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FiUser className="text-primary-600" />
                        Recipient Full Name *
                        {foundUser && (
                          <span className="ml-auto text-xs text-green-600 font-normal flex items-center gap-1">
                            <FiCheckCircle size={12} />
                            Auto-filled
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        placeholder={foundUser ? formData.buyerName : "Will be auto-populated after entering National ID"}
                        required
                        className={`input w-full ${foundUser ? 'bg-green-50 border-green-300' : 'bg-gray-100 cursor-not-allowed'}`}
                        readOnly
                        disabled={!foundUser}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {foundUser 
                          ? '✓ Name automatically populated from system records' 
                          : '⚠ Enter National ID first to auto-populate this field'}
                      </p>
                    </div>

                    {/* National ID */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FiHash className="text-primary-600" />
                        National ID Number *
                      </label>
                      <input
                        type="text"
                        name="buyerNationalId"
                        value={formData.buyerNationalId}
                        onChange={handleChange}
                        placeholder="e.g., 12345678"
                        required
                        className="input w-full font-mono"
                        disabled={searchingUser}
                      />
                      
                      {/* Searching indicator */}
                      {searchingUser && (
                        <div className="flex items-center gap-2 mt-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <p className="text-sm">Searching for user...</p>
                        </div>
                      )}
                      
                      {/* User found confirmation */}
                      {foundUser && !searchingUser && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FiCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-900">
                                User Found!
                              </p>
                              <p className="text-xs text-green-700 mt-1">
                                {foundUser.firstName} {foundUser.lastName}
                              </p>
                              <p className="text-xs text-green-600 mt-0.5">
                                {foundUser.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* User not found warning */}
                      {userNotFound && !searchingUser && formData.buyerNationalId.length >= 7 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <FiXCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-900">
                                User Not Found
                              </p>
                              <p className="text-xs text-red-700 mt-1">
                                No user registered with this National ID. Please ensure the recipient is registered in the system.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!foundUser && !userNotFound && !searchingUser && (
                        <div className="flex items-start gap-2 mt-2">
                          <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                          <p className="text-xs text-amber-700">
                            The recipient must be registered in the system with this ID
                          </p>
                        </div>
                      )}
                    </div>

                    {/* KRA PIN */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FiCreditCard className="text-primary-600" />
                        KRA PIN Number *
                        {foundUser && (
                          <span className="ml-auto text-xs text-green-600 font-normal flex items-center gap-1">
                            <FiCheckCircle size={12} />
                            Auto-filled
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="buyerKraPin"
                        value={formData.buyerKraPin}
                        placeholder={foundUser ? formData.buyerKraPin : "Will be auto-populated after entering National ID"}
                        required
                        className={`input w-full uppercase font-mono ${foundUser ? 'bg-green-50 border-green-300' : 'bg-gray-100 cursor-not-allowed'}`}
                        maxLength="11"
                        readOnly
                        disabled={!foundUser}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {foundUser 
                          ? '✓ KRA PIN automatically populated from system records' 
                          : '⚠ Enter National ID first to auto-populate this field'}
                      </p>
                      <div className="flex items-start gap-2 mt-2">
                        <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                        <p className="text-xs text-amber-700">
                          Must match the KRA PIN registered with the National ID
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Step 3: Optional Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Details (Optional)</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FiDollarSign className="text-primary-600" />
                      Agreed Transaction Price
                    </label>
                    <input
                      type="number"
                      name="agreedPrice"
                      value={formData.agreedPrice}
                      onChange={handleChange}
                      placeholder="e.g., 5000000"
                      min="0"
                      step="1000"
                      className="input w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the agreed sale price in KES (optional)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/user/parcels')}
                    className="btn btn-outline flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-3 ${!foundUser && !loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading || !foundUser}
                    title={!foundUser ? 'Please enter a valid National ID to continue' : ''}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Transfer...
                      </>
                    ) : (
                      <>
                        <FiSend size={20} />
                        {foundUser ? 'Initiate Land Transfer' : 'Enter Recipient National ID First'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Selected Parcel Preview */}
          <div className="lg:col-span-1">
            {selectedParcel ? (
              <Card>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-primary-900 mb-1">Selected Parcel</h3>
                  <p className="text-sm text-primary-700">Review details before transfer</p>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">Title Number</p>
                    <p className="font-bold text-gray-900 text-lg">{selectedParcel.titleNumber}</p>
                  </div>
                  
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">LR Number</p>
                    <p className="font-semibold text-gray-900">{selectedParcel.lrNumber}</p>
                  </div>
                  
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedParcel.county}</p>
                    <p className="text-gray-600 text-xs">{selectedParcel.constituency}</p>
                    <p className="text-gray-600 text-xs">{selectedParcel.ward} Ward</p>
                  </div>
                  
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-gray-500 text-xs mb-1">Land Size</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedParcel.size.value} {selectedParcel.size.unit}
                    </p>
                  </div>
                  
                  {selectedParcel.zoning && (
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-gray-500 text-xs mb-1">Zoning</p>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {selectedParcel.zoning}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Estimated Market Value</p>
                    <p className="font-bold text-green-600 text-xl">
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 0
                      }).format(selectedParcel.marketValue)}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <FiMapPin size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    Select a parcel to view details
                  </p>
                </div>
              </Card>
            )}

            {/* Security Notice */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm mb-1">Security Notice</h4>
                  <p className="text-xs text-amber-800">
                    Ensure all recipient details are accurate. This transfer will be verified by county and NLC admins before completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransferLand;
