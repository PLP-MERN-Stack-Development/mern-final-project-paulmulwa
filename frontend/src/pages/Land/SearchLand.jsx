import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiHome, FiCalendar, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI, regionAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SearchLand = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [parcels, setParcels] = useState([]);
  const [allParcels, setAllParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counties, setCounties] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    county: '',
    zoning: '',
    approvalStatus: '',
    minSize: '',
    maxSize: ''
  });

  useEffect(() => {
    fetchAllParcels();
    fetchCounties();
  }, []);

  const fetchAllParcels = async () => {
    try {
      setLoading(true);
      const response = await parcelAPI.getAllParcels();
      setAllParcels(response.data.data);
      setParcels(response.data.data);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      toast.error('Failed to load parcels');
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setParcels(allParcels);
      return;
    }

    try {
      setLoading(true);
      const response = await parcelAPI.searchParcels(searchQuery);
      setParcels(response.data.data);
      
      if (response.data.count === 0) {
        toast.info('No parcels found matching your search');
      }
    } catch (error) {
      console.error('Error searching parcels:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...allParcels];

    if (filters.county) {
      filtered = filtered.filter(p => p.county === filters.county);
    }

    if (filters.zoning) {
      filtered = filtered.filter(p => p.zoning === filters.zoning);
    }

    if (filters.approvalStatus) {
      filtered = filtered.filter(p => p.approvalStatus === filters.approvalStatus);
    }

    if (filters.minSize) {
      filtered = filtered.filter(p => p.size.value >= parseFloat(filters.minSize));
    }

    if (filters.maxSize) {
      filtered = filtered.filter(p => p.size.value <= parseFloat(filters.maxSize));
    }

    setParcels(filtered);
  };

  const clearFilters = () => {
    setFilters({
      county: '',
      zoning: '',
      approvalStatus: '',
      minSize: '',
      maxSize: ''
    });
    setParcels(allParcels);
  };

  const getApprovalStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        icon: FiCheckCircle,
        text: 'Approved',
        color: 'bg-green-100 text-green-800'
      },
      pending_county_admin: {
        icon: FiClock,
        text: 'Pending County',
        color: 'bg-yellow-100 text-yellow-800'
      },
      pending_nlc_admin: {
        icon: FiClock,
        text: 'Pending NLC',
        color: 'bg-orange-100 text-orange-800'
      },
      rejected: {
        icon: FiXCircle,
        text: 'Rejected',
        color: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status] || statusConfig.pending_county_admin;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="mr-1" size={12} />
        {config.text}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Land Parcels</h1>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title number (e.g., NAI12345678), LR number, owner name, or county..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Title numbers start with first 3 letters of county (e.g., NAI12345678 for Nairobi)
              </p>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FiSearch size={20} />
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
              <select
                name="county"
                value={filters.county}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Counties</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zoning</label>
              <select
                name="zoning"
                value={filters.zoning}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
                <option value="mixed">Mixed Use</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
              <select
                name="approvalStatus"
                value={filters.approvalStatus}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending_county_admin">Pending County</option>
                <option value="pending_nlc_admin">Pending NLC</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Size (acres)</label>
              <input
                type="number"
                name="minSize"
                value={filters.minSize}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Size (acres)</label>
              <input
                type="number"
                name="maxSize"
                value={filters.maxSize}
                onChange={handleFilterChange}
                placeholder="Any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({parcels.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading parcels...</p>
            </div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No parcels found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcels.map((parcel) => (
                <div
                  key={parcel._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{parcel.titleNumber}</h3>
                      <p className="text-sm text-gray-600">{parcel.lrNumber}</p>
                    </div>
                    {getApprovalStatusBadge(parcel.approvalStatus)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="mr-2 text-green-600" size={16} />
                      {parcel.county}, {parcel.ward}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiHome className="mr-2 text-green-600" size={16} />
                      {parcel.size.value} {parcel.size.unit} • {parcel.zoning}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="mr-2 text-green-600" size={16} />
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Owner</p>
                    <p className="font-medium text-gray-900">{parcel.ownerName}</p>
                  </div>

                  {parcel.marketValue && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Market Value</p>
                      <p className="font-bold text-green-600">{formatCurrency(parcel.marketValue)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchLand;
