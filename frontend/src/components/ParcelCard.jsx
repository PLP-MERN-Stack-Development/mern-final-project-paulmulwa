import { Link } from 'react-router-dom';
import { FiMapPin, FiMaximize2, FiUser, FiClock } from 'react-icons/fi';
import Card from './Card';

const ParcelCard = ({ parcel }) => {
  const getOwnershipStatus = () => {
    // Check if parcel was transferred out
    const lastTransfer = parcel.transferHistory?.[parcel.transferHistory.length - 1];
    
    if (lastTransfer && lastTransfer.from?.toString() === parcel.currentUserId) {
      return {
        label: 'Transferred Out',
        className: 'bg-orange-100 text-orange-800',
        icon: '→'
      };
    }
    
    // Check if parcel was transferred in (received)
    if (lastTransfer && lastTransfer.to?.toString() === parcel.currentUserId) {
      return {
        label: 'Transferred In',
        className: 'bg-blue-100 text-blue-800',
        icon: '←'
      };
    }
    
    // Default owned status
    return {
      label: 'Owned',
      className: 'bg-green-100 text-green-800',
      icon: '✓'
    };
  };

  const getApprovalStatus = () => {
    const statusConfig = {
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      pending_county_admin: { label: 'Pending County', className: 'bg-yellow-100 text-yellow-800' },
      pending_nlc_admin: { label: 'Pending NLC', className: 'bg-orange-100 text-orange-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' }
    };
    return statusConfig[parcel.approvalStatus] || { label: parcel.approvalStatus, className: 'bg-gray-100 text-gray-800' };
  };

  const ownershipStatus = getOwnershipStatus();
  const approvalStatus = getApprovalStatus();

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <Link to={`/parcels/${parcel._id}`} className="block">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {parcel.titleNumber}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Parcel ID: {parcel._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">
                Title Deed ID: {parcel.lrNumber}
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${ownershipStatus.className}`}>
              <span>{ownershipStatus.icon}</span>
              {ownershipStatus.label}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${approvalStatus.className}`}>
              {approvalStatus.label}
            </span>
          </div>

          {/* Land Details */}
          <div className="space-y-2">
            {/* Size */}
            <div className="flex items-center gap-2 text-sm">
              <FiMaximize2 className="text-gray-400 flex-shrink-0" size={16} />
              <span className="text-gray-900 font-medium">
                {parcel.size?.value} {parcel.size?.unit === 'square_meters' ? 'sq. meters' : parcel.size?.unit}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-sm">
              <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{parcel.county}</p>
                <p className="text-gray-600">{parcel.subCounty}</p>
                <p className="text-gray-500 text-xs">{parcel.constituency}, {parcel.ward}</p>
              </div>
            </div>

            {/* Owner (if transferred) */}
            {parcel.ownerName && (
              <div className="flex items-center gap-2 text-sm">
                <FiUser className="text-gray-400 flex-shrink-0" size={16} />
                <span className="text-gray-600">
                  {ownershipStatus.label === 'Transferred Out' ? 'New Owner: ' : 'Owner: '}
                  <span className="font-medium text-gray-900">{parcel.ownerName}</span>
                </span>
              </div>
            )}

            {/* Last Transfer Date */}
            {parcel.transferHistory && parcel.transferHistory.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <FiClock className="text-gray-400 flex-shrink-0" size={16} />
                <span className="text-gray-600">
                  Last Transfer: {new Date(parcel.transferHistory[parcel.transferHistory.length - 1].date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full btn btn-sm btn-outline group-hover:btn-primary transition-all">
              View Parcel Details
            </button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ParcelCard;
