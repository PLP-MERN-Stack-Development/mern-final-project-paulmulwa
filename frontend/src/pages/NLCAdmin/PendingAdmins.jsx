import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { userAPI, regionAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PendingAdmins = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('');
  const [counties, setCounties] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  
  // Create county admin form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    kraPin: '',
    county: '',
    password: ''
  });

  useEffect(() => {
    fetchPendingAdmins();
    fetchCounties();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getPendingAdmins();
      setPendingAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      toast.error('Failed to load pending admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounties = async () => {
    try {
      const response = await regionAPI.getCountiesList();
      setCounties(response.data.data || []);
    } catch (error) {
      console.error('Error fetching counties:', error);
    }
  };

  const handleApproveClick = (admin) => {
    setSelectedAdmin(admin);
    setActionType('approve');
    setRemarks('');
    setShowModal(true);
  };

  const handleRejectClick = (admin) => {
    setSelectedAdmin(admin);
    setActionType('reject');
    setRemarks('');
    setShowModal(true);
  };

  const handleApproval = async () => {
    if (!selectedAdmin) return;

    try {
      const approved = actionType === 'approve';
      await userAPI.approveCountyAdmin(selectedAdmin._id, approved);
      
      toast.success(`County admin ${approved ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedAdmin(null);
      setRemarks('');
      fetchPendingAdmins();
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || 
        !formData.nationalId || !formData.kraPin || !formData.county || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/county-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...formData,
          role: 'county_admin',
          isApproved: true, // NLC creates already approved
          isActive: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create county admin');
      }

      toast.success('County admin created successfully');
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        nationalId: '',
        kraPin: '',
        county: '',
        password: ''
      });
      fetchPendingAdmins();
    } catch (error) {
      console.error('Error creating county admin:', error);
      toast.error(error.message || 'Failed to create county admin');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pending County Admins</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiPlus size={20} />
            Create County Admin
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : pendingAdmins.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No pending county admin approvals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAdmins.map((admin) => (
              <div key={admin._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="text-gray-400" size={16} />
                    <span>{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="text-gray-400" size={16} />
                    <span>{admin.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin className="text-gray-400" size={16} />
                    <span className="font-medium">{admin.county}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCreditCard className="text-gray-400" size={16} />
                    <span>ID: {admin.nationalId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCreditCard className="text-gray-400" size={16} />
                    <span>KRA: {admin.kraPin}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveClick(admin)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiCheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(admin)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiXCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval/Rejection Modal */}
        {showModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve' : 'Reject'} County Admin
              </h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Admin Details:</p>
                <p className="font-semibold text-gray-900">
                  {selectedAdmin.firstName} {selectedAdmin.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedAdmin.email}</p>
                <p className="text-sm text-gray-600">County: {selectedAdmin.county}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any remarks or notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAdmin(null);
                    setRemarks('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create County Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create County Admin</h2>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleCreateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleCreateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleCreateFormChange}
                      required
                      placeholder="+254..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="county"
                      value={formData.county}
                      onChange={handleCreateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select County</option>
                      {counties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleCreateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KRA PIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="kraPin"
                      value={formData.kraPin}
                      onChange={handleCreateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleCreateFormChange}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phoneNumber: '',
                        nationalId: '',
                        kraPin: '',
                        county: '',
                        password: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create County Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PendingAdmins;
