import React, { useState, useEffect } from 'react';
import { countyAdminAPI, parcelAPI } from '../../services/api';
import Layout from '../../components/Layout';
import { FiFileText, FiDownload, FiEye, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CountyTitleDeeds = () => {
  const [titleDeeds, setTitleDeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTitleDeeds();
  }, []);

  const fetchTitleDeeds = async () => {
    try {
      setLoading(true);
      const response = await countyAdminAPI.getTitleDeeds();
      setTitleDeeds(response.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load title deeds');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (parcelId) => {
    try {
      const response = await parcelAPI.viewTitleDeedPDF(parcelId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to open PDF');
    }
  };

  const handleDownloadPDF = async (parcelId, titleNumber) => {
    try {
      const response = await parcelAPI.getTitleDeedPDF(parcelId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Title_Deed_${titleNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const filteredDeeds = titleDeeds.filter(deed =>
    deed.titleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deed.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deed.lrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FiFileText className="text-3xl text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">County Title Deeds</h1>
            <p className="text-gray-600">View and manage title deeds in your county</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title number, LR number, or owner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Title Deeds Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    LR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading title deeds...
                    </td>
                  </tr>
                ) : filteredDeeds.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No title deeds found
                    </td>
                  </tr>
                ) : (
                  filteredDeeds.map((deed) => (
                    <tr key={deed._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {deed.titleNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{deed.lrNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{deed.ownerName}</div>
                        <div className="text-xs text-gray-500">{deed.owner?.nationalId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{deed.county}</div>
                        <div className="text-xs text-gray-500">
                          {deed.subCounty} → {deed.constituency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {deed.size.value} {deed.size.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewPDF(deed._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FiEye /> View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(deed._id, deed.titleNumber)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <FiDownload /> Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CountyTitleDeeds;
