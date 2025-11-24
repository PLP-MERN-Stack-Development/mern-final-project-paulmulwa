import React from 'react';
import { FiX, FiArrowRight, FiArrowLeft, FiDownload } from 'react-icons/fi';
import './TransferHistoryModal.css';

const TransferHistoryModal = ({ isOpen, onClose, parcel, transferHistory, onDownloadPDF }) => {
  if (!isOpen) return null;

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Transfer History</h2>
            <p className="modal-subtitle">
              Parcel: {parcel?.titleNumber} | LR Number: {parcel?.lrNumber}
            </p>
          </div>
          <div className="modal-header-actions">
            <button
              onClick={onDownloadPDF}
              className="btn-download"
              title="Download Transfer History PDF"
            >
              <FiDownload size={18} />
              Download PDF
            </button>
            <button onClick={onClose} className="btn-close">
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {transferHistory.length === 0 ? (
            <div className="empty-state">
              <p>No transfer history available for this parcel</p>
            </div>
          ) : (
            <div className="transfer-list">
              {transferHistory.map((transfer, index) => (
                <div key={index} className="transfer-card">
                  <div className="transfer-header">
                    <div>
                      <h3 className="transfer-number">
                        Transfer #{transfer.transferNumber}
                      </h3>
                      <span className={`status-badge ${getTransferStatusColor(transfer.status)}`}>
                        {transfer.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {transfer.transferReference && (
                      <div className="transfer-ref">
                        Ref: {transfer.transferReference}
                      </div>
                    )}
                  </div>

                  <div className="transfer-owners">
                    {/* Previous Owner */}
                    <div className="owner-card previous-owner">
                      <h4 className="owner-title">
                        <FiArrowLeft size={16} />
                        Previous Owner
                      </h4>
                      <div className="owner-details">
                        <p className="owner-name">{transfer.previousOwner.name}</p>
                        {transfer.previousOwner.email && (
                          <p className="owner-info">Email: {transfer.previousOwner.email}</p>
                        )}
                        {transfer.previousOwner.nationalId && (
                          <p className="owner-info">National ID: {transfer.previousOwner.nationalId}</p>
                        )}
                        {transfer.previousOwner.phone && (
                          <p className="owner-info">Phone: {transfer.previousOwner.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* New Owner */}
                    <div className="owner-card new-owner">
                      <h4 className="owner-title">
                        <FiArrowRight size={16} />
                        New Owner
                      </h4>
                      <div className="owner-details">
                        <p className="owner-name">{transfer.newOwner.name}</p>
                        {transfer.newOwner.email && (
                          <p className="owner-info">Email: {transfer.newOwner.email}</p>
                        )}
                        {transfer.newOwner.nationalId && (
                          <p className="owner-info">National ID: {transfer.newOwner.nationalId}</p>
                        )}
                        {transfer.newOwner.phone && (
                          <p className="owner-info">Phone: {transfer.newOwner.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Dates */}
                  <div className="transfer-dates">
                    <div className="date-item">
                      <span className="date-label">Initiated:</span>
                      <span className="date-value">
                        {new Date(transfer.dateInitiated).toLocaleDateString()}
                      </span>
                    </div>
                    {transfer.dateCompleted && (
                      <div className="date-item">
                        <span className="date-label">Completed:</span>
                        <span className="date-value">
                          {new Date(transfer.dateCompleted).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remarks */}
                  {transfer.remarks && (
                    <div className="transfer-remarks">
                      <h5 className="remarks-title">Remarks</h5>
                      <p className="remarks-text">{transfer.remarks}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {transfer.timeline && transfer.timeline.length > 0 && (
                    <div className="transfer-timeline">
                      <h5 className="timeline-title">Timeline</h5>
                      <div className="timeline-list">
                        {transfer.timeline.map((event, eventIndex) => (
                          <div key={eventIndex} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <p className="timeline-action">{event.action}</p>
                              <p className="timeline-date">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferHistoryModal;
