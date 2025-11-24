import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiSend, FiFilter } from 'react-icons/fi';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import ParcelCard from '../../components/ParcelCard';
import { parcelAPI, transferAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';

const MyParcels = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, owned, transferred_out, transferred_in

  useEffect(() => {
    fetchMyParcels();
  }, []);

  const fetchMyParcels = async () => {
    try {
      setLoading(true);
      
      // Fetch user's owned parcels
      const parcelsResponse = await parcelAPI.getMyParcels();
      const myParcels = parcelsResponse.data.data || [];
      
      // Fetch all transfers involving the user
      const transfersResponse = await transferAPI.getAllTransfers();
      const allTransfers = transfersResponse.data.data || [];
      
      // Filter transfers where user is involved
      const userTransfers = allTransfers.filter(transfer => 
        (transfer.seller?._id === user._id || transfer.buyer?._id === user._id) &&
        transfer.status === 'accepted'
      );
      
      // Get parcel IDs from accepted transfers
      const transferredParcelIds = new Set();
      const transferredInParcelIds = new Set();
      const transferredOutParcelIds = new Set();
      
      userTransfers.forEach(transfer => {
        const parcelId = transfer.parcel?._id || transfer.parcel;
        transferredParcelIds.add(parcelId);
        
        if (transfer.buyer?._id === user._id) {
          transferredInParcelIds.add(parcelId);
        }
        if (transfer.seller?._id === user._id) {
          transferredOutParcelIds.add(parcelId);
        }
      });
      
      // Fetch details for transferred parcels
      const transferredParcelsPromises = Array.from(transferredParcelIds).map(async (parcelId) => {
        try {
          const response = await parcelAPI.getParcelById(parcelId);
          const parcel = response.data.data;
          
          // Mark parcel with transfer status
          return {
            ...parcel,
            currentUserId: user._id,
            isTransferredIn: transferredInParcelIds.has(parcelId),
            isTransferredOut: transferredOutParcelIds.has(parcelId)
          };
        } catch (error) {
          console.error(`Error fetching parcel ${parcelId}:`, error);
          return null;
        }
      });
      
      const transferredParcels = (await Promise.all(transferredParcelsPromises)).filter(p => p !== null);
      
      // Mark owned parcels
      const ownedParcels = myParcels.map(parcel => ({
        ...parcel,
        currentUserId: user._id,
        isOwned: true
      }));
      
      // Combine all parcels and remove duplicates
      const allParcelsMap = new Map();
      
      [...ownedParcels, ...transferredParcels].forEach(parcel => {
        allParcelsMap.set(parcel._id, parcel);
      });
      
      const combinedParcels = Array.from(allParcelsMap.values());
      
      setParcels(combinedParcels);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      toast.error('Failed to load your parcels');
    } finally {
      setLoading(false);
    }
  };


  const getFilteredParcels = () => {
    if (filter === 'all') return parcels;
    if (filter === 'owned') return parcels.filter(p => p.isOwned && !p.isTransferredOut);
    if (filter === 'transferred_out') return parcels.filter(p => p.isTransferredOut);
    if (filter === 'transferred_in') return parcels.filter(p => p.isTransferredIn);
    return parcels;
  };

  const filteredParcels = getFilteredParcels();
  
  const counts = {
    all: parcels.length,
    owned: parcels.filter(p => p.isOwned && !p.isTransferredOut).length,
    transferred_out: parcels.filter(p => p.isTransferredOut).length,
    transferred_in: parcels.filter(p => p.isTransferredIn).length
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Land Parcels</h1>
            <p className="text-gray-600 mt-1">
              View all parcels you own, transferred out, and received
            </p>
          </div>
          {parcels.length > 0 && (
            <Link
              to="/user/transfer"
              className="btn btn-primary flex items-center gap-2"
            >
              <FiSend size={18} />
              Initiate Transfer
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        {parcels.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 flex-wrap">
              <FiFilter className="text-gray-400" size={20} />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Parcels ({counts.all})
                </button>
                <button
                  onClick={() => setFilter('owned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'owned'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Owned ({counts.owned})
                </button>
                <button
                  onClick={() => setFilter('transferred_in')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'transferred_in'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Transferred In ({counts.transferred_in})
                </button>
                <button
                  onClick={() => setFilter('transferred_out')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'transferred_out'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Transferred Out ({counts.transferred_out})
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Parcels Grid */}
        {filteredParcels.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiMapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No Land Parcels Yet' : `No ${filter.replace('_', ' ')} Parcels`}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all'
                  ? "You don't have any land parcels at the moment. You can receive transfers from other users."
                  : `You don't have any ${filter.replace('_', ' ')} parcels.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcels.map((parcel) => (
              <ParcelCard key={parcel._id} parcel={parcel} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyParcels;
