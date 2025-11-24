import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiHome, FiCalendar, FiCheckCircle, FiClock, FiXCircle, FiFilter, FiDownload } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { parcelAPI, regionAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AllTitleDeeds = () => {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [allParcels, setAllParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Location data
  const [counties, setCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    county: '',
    subCounty: '',
    constituency: '',
    ward: '',
    zoning: '',
    approvalStatus: '',
    minSize: '',
    maxSize: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllParcels();
    fetchCounties();
  }, []);

  useEffect(() => {
    if (filters.county) {
      fetchConstituencies(filters.county);
    } else {
      setConstituencies([]);
      setWards([]);
    }
  }, [filters.county]);

  useEffect(() => {
    if (filters.county && filters.constituency) {
      fetchWards(filters.county, filters.constituency);
    } else {
      setWards([]);
    }
  }, [filters.constituency]);

  const fetchAllParcels = async () => {
    try {
      setLoading(true);
      const response = await parcelAPI.getAllParcels();
      setAllParcels(response.data.data || []);
      setParcels(response.data.data || []);
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

  const fetchConstituencies = async (county) => {
    try {
      const response = await regionAPI.getConstituenciesByCounty(county);
      setConstituencies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching constituencies:', error);
    }
  };

  const fetchWards = async (county, constituency) => {
    try {
      const response = await regionAPI.getWardsByConstituency(county, constituency);
      setWards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
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
      setParcels(response.data.data || []);
      
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

    if (filters.subCounty) {
      filtered = filtered.filter(p => p.subCounty === filters.subCounty);
    }

    if (filters.constituency) {
      filtered = filtered.filter(p => p.constituency === filters.constituency);
    }

    if (filters.ward) {
      filtered = filtered.filter(p => p.ward === filters.ward);
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
    toast.success(`Found ${filtered.length} parcels`);
  };

  const clearFilters = () => {
    setFilters({
      county: '',
      subCounty: '',
      constituency: '',
      ward: '',
      zoning: '',
      approvalStatus: '',
      minSize: '',
      maxSize: ''
    });
    setParcels(allParcels);
    setConstituencies([]);
    setWards([]);
  };

  const exportToCSV = () => {
    const headers = ['Title Number', 'LR Number', 'Owner', 'County', 'Sub-County', 'Constituency', 'Ward', 'Size', 'Zoning', 'Status', 'Market Value'];
    const csvData = parcels.map(p => [
      p.titleNumber,
      p.lrNumber,
      p.ownerName,
      p.county,
      p.subCounty,
      p.constituency,
      p.ward,
      `${p.size.value} ${p.size.unit}`,
      p.zoning,
      p.approvalStatus,
      p.marketValue || 'N/A'
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `title-deeds-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data exported successfully');
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

  const getStats = () => {
    return {
      total: parcels.length,
      approved: parcels.filter(p => p.approvalStatus === 'approved').length,
      pendingCounty: parcels.filter(p => p.approvalStatus === 'pending_county_admin').length,
      pendingNLC: parcels.filter(p => p.approvalStatus === 'pending_nlc_admin').length,
      rejected: parcels.filter(p => p.approvalStatus === 'rejected').length
    };
  };

  const stats = getStats();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Title Deeds</h1>
            <p className="text-gray-600 mt-2">View and filter all land parcels across Kenya</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload size={20} />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">Total Parcels</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-green-600">Approved</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-yellow-600">Pending County</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pendingCounty}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-orange-600">Pending NLC</p>
            <p className="text-2xl font-bold text-orange-700">{stats.pendingNLC}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>

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
                  placeholder="Search by title number, LR number, owner name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FiSearch size={20} />
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiFilter size={20} />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    <option key={county.code} value={county.name}>{county.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                <select
                  name="constituency"
                  value={filters.constituency}
                  onChange={handleFilterChange}
                  disabled={!filters.county}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                >
                  <option value="">All Constituencies</option>
                  {constituencies.map(constituency => (
                    <option key={constituency} value={constituency}>{constituency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                <select
                  name="ward"
                  value={filters.ward}
                  onChange={handleFilterChange}
                  disabled={!filters.constituency}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                >
                  <option value="">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub-County</label>
                <input
                  type="text"
                  name="subCounty"
                  value={filters.subCounty}
                  onChange={handleFilterChange}
                  placeholder="Enter sub-county"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
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
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Parcels ({parcels.length})
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
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size & Type
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
                  {parcels.map((parcel) => (
                    <tr key={parcel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{parcel.titleNumber}</div>
                          <div className="text-sm text-gray-500">{parcel.lrNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{parcel.county}</div>
                        <div className="text-xs text-gray-500">{parcel.constituency}, {parcel.ward}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parcel.ownerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parcel.size.value} {parcel.size.unit}</div>
                        <div className="text-xs text-gray-500 capitalize">{parcel.zoning}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApprovalStatusBadge(parcel.approvalStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/parcels/${parcel._id}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllTitleDeeds;
