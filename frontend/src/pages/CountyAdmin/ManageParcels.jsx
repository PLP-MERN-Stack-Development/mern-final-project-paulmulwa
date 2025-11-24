import React, { useState, useEffect } from 'react';
import { countyAdminAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { 
  FiMap, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiX,
  FiSave
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ManageParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    titleNumber: '',
    lrNumber: '',
    owner: '',
    subCounty: '',
    constituency: '',
    ward: '',
    size: { value: '', unit: 'acres' },
    zoning: 'residential',
    landUse: '',
    description: ''
  });

  useEffect(() => {
    fetchParcels();
    fetchUsers();
  }, []);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const response = await countyAdminAPI.getParcels();
      setParcels(response.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await countyAdminAPI.getCountyUsers();
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedParcel(null);
    setFormData({
      titleNumber: '',
      lrNumber: '',
      owner: '',
      subCounty: '',
      constituency: '',
      ward: '',
      size: { value: '', unit: 'acres' },
      zoning: 'residential',
      landUse: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (parcel) => {
    setModalMode('edit');
    setSelectedParcel(parcel);
    setFormData({
      titleNumber: parcel.titleNumber,
      lrNumber: parcel.lrNumber,
      owner: parcel.owner?._id || '',
      subCounty: parcel.subCounty,
      constituency: parcel.constituency,
      ward: parcel.ward,
      size: parcel.size,
      zoning: parcel.zoning,
      landUse: parcel.landUse || '',
      description: parcel.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await countyAdminAPI.createParcel(formData);
        toast.success('Parcel created successfully');
      } else {
        await countyAdminAPI.updateParcel(selectedParcel._id, formData);
        toast.success('Parcel updated successfully');
      }
      
      setShowModal(false);
      fetchParcels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (parcelId) => {
    if (!window.confirm('Are you sure you want to delete this parcel?')) {
      return;
    }

    try {
      await countyAdminAPI.deleteParcel(parcelId);
      toast.success('Parcel deleted successfully');
      fetchParcels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete parcel');
    }
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = 
      parcel.titleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.lrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || parcel.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiMap className="text-3xl text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Parcels</h1>
              <p className="text-gray-600">Create, view, edit, and delete land parcels</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus />
            Create Parcel
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title number, LR number, or owner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_transfer">Pending Transfer</option>
              <option value="transferred">Transferred</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading parcels...
                    </td>
                  </tr>
                ) : filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No parcels found
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((parcel) => (
                    <tr key={parcel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {parcel.titleNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{parcel.lrNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parcel.ownerName}</div>
                        <div className="text-xs text-gray-500">{parcel.owner?.nationalId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{parcel.subCounty}</div>
                        <div className="text-xs text-gray-500">{parcel.ward}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {parcel.size.value} {parcel.size.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          parcel.status === 'active' ? 'bg-green-100 text-green-700' :
                          parcel.status === 'pending_transfer' ? 'bg-yellow-100 text-yellow-700' :
                          parcel.status === 'disputed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {parcel.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(parcel)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(parcel._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New Parcel' : 'Edit Parcel'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleNumber}
                      onChange={(e) => setFormData({...formData, titleNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LR Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lrNumber}
                      onChange={(e) => setFormData({...formData, lrNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner *
                    </label>
                    <select
                      required
                      value={formData.owner}
                      onChange={(e) => setFormData({...formData, owner: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Owner</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.nationalId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-County *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subCounty}
                      onChange={(e) => setFormData({...formData, subCounty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Constituency *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.constituency}
                      onChange={(e) => setFormData({...formData, constituency: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ward}
                      onChange={(e) => setFormData({...formData, ward: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.size.value}
                        onChange={(e) => setFormData({...formData, size: {...formData.size, value: e.target.value}})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={formData.size.unit}
                        onChange={(e) => setFormData({...formData, size: {...formData.size, unit: e.target.value}})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="square_meters">Sq Meters</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zoning *
                    </label>
                    <select
                      required
                      value={formData.zoning}
                      onChange={(e) => setFormData({...formData, zoning: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="agricultural">Agricultural</option>
                      <option value="industrial">Industrial</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Land Use
                    </label>
                    <input
                      type="text"
                      value={formData.landUse}
                      onChange={(e) => setFormData({...formData, landUse: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <FiSave />
                    {modalMode === 'create' ? 'Create Parcel' : 'Save Changes'}
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

export default ManageParcels;
