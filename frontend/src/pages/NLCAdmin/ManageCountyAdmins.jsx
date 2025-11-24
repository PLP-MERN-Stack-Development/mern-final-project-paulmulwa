import { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { userAPI, regionAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageCountyAdmins = () => {
  const [countyAdmins, setCountyAdmins] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
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
    fetchCountyAdmins();
    fetchCounties();
  }, []);

  const fetchCountyAdmins = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers({ role: 'county_admin' });
      setCountyAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching county admins:', error);
      toast.error('Failed to load county admins');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        // Update existing county admin
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await userAPI.updateUser(editingAdmin._id, updateData);
        toast.success('County Admin updated successfully');
      } else {
        // Create new county admin
        const createData = {
          ...formData,
          role: 'county_admin',
          isApproved: false
        };
        await userAPI.getAllUsers(); // Using existing endpoint with POST
        // Note: You might need to add a specific createCountyAdmin endpoint
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(createData)
        });
        
        if (!response.ok) throw new Error('Failed to create county admin');
        toast.success('County Admin created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchCountyAdmins();
    } catch (error) {
      console.error('Error saving county admin:', error);
      toast.error(error.response?.data?.message || 'Failed to save county admin');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phoneNumber: admin.phoneNumber || '',
      nationalId: admin.nationalId,
      kraPin: admin.kraPin || '',
      county: admin.county,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this county admin?')) {
      return;
    }

    try {
      await userAPI.deactivateUser(adminId);
      toast.success('County Admin deleted successfully');
      fetchCountyAdmins();
    } catch (error) {
      console.error('Error deleting county admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete county admin');
    }
  };

  const handleApprove = async (adminId, approved) => {
    try {
      await userAPI.approveCountyAdmin(adminId, approved);
      toast.success(`County Admin ${approved ? 'approved' : 'rejected'} successfully`);
      fetchCountyAdmins();
    } catch (error) {
      console.error('Error approving county admin:', error);
      toast.error('Failed to approve county admin');
    }
  };

  const resetForm = () => {
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
    setEditingAdmin(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage County Admins</h1>
            <p className="text-gray-600 mt-2">Create and manage county administrators</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiPlus size={20} />
            Add County Admin
          </button>
        </div>

        {/* County Admins List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading county admins...</p>
            </div>
          ) : countyAdmins.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No county admins found</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add County Admin" to create one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      County
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {countyAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="mr-2" size={14} />
                          {admin.phoneNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {admin.nationalId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="mr-2 text-green-600" size={14} />
                          {admin.county}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {admin.isApproved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheck className="mr-1" size={12} />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FiX className="mr-1" size={12} />
                            Pending
                          </span>
                        )}
                        {admin.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 items-center">
                          {!admin.isApproved && (
                            <>
                              <button
                                onClick={() => handleApprove(admin._id, true)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FiCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleApprove(admin._id, false)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(admin)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingAdmin ? 'Edit County Admin' : 'Create County Admin'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingAdmin}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 0712345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID *
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        required
                        disabled={!!editingAdmin}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN *
                      </label>
                      <input
                        type="text"
                        name="kraPin"
                        value={formData.kraPin}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., A000000000X"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <select
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select County</option>
                        {counties.map(county => (
                          <option key={county.code} value={county.name}>{county.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!editingAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingAdmin}
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingAdmin ? 'Update Admin' : 'Create Admin'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageCountyAdmins;
