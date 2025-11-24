const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate Title Deed PDF for a land parcel
 * @param {Object} parcel - The parcel object with all details
 * @param {Object} owner - The owner user object
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateTitleDeedPDF = async (parcel, owner) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header - Government Seal Area
      doc.rect(50, 50, 495, 80).stroke();
      doc.fontSize(24).font('Helvetica-Bold')
        .text('REPUBLIC OF KENYA', 0, 70, { align: 'center' });
      doc.fontSize(18)
        .text('MINISTRY OF LANDS AND PHYSICAL PLANNING', 0, 100, { align: 'center' });
      doc.fontSize(14).font('Helvetica')
        .text('NATIONAL LAND COMMISSION', 0, 125, { align: 'center' });

      // Title
      doc.moveDown(3);
      doc.fontSize(22).font('Helvetica-Bold')
        .text('CERTIFICATE OF TITLE', { align: 'center', underline: true });
      
      doc.moveDown(1);
      doc.fontSize(16).font('Helvetica')
        .text('(Land Registration Act, 2012)', { align: 'center' });

      // Document Number Box
      doc.moveDown(2);
      doc.rect(50, doc.y, 495, 60).stroke();
      doc.fontSize(12).font('Helvetica-Bold')
        .text('Title Deed Number:', 70, doc.y + 15);
      doc.fontSize(14).font('Helvetica')
        .text(parcel.lrNumber, 250, doc.y - 15);
      
      doc.fontSize(12).font('Helvetica-Bold')
        .text('Title Number:', 70, doc.y + 5);
      doc.fontSize(14).font('Helvetica')
        .text(parcel.titleNumber, 250, doc.y - 15);

      // Parcel Information Section
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('PARCEL INFORMATION', { underline: true });
      
      doc.moveDown(0.5);
      const leftColumn = 70;
      const rightColumn = 320;
      let currentY = doc.y;

      // Left Column
      doc.fontSize(11).font('Helvetica-Bold')
        .text('Parcel ID:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(parcel._id.toString().slice(-12).toUpperCase(), leftColumn + 100, currentY);

      currentY += 25;
      doc.font('Helvetica-Bold')
        .text('Land Size:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(`${parcel.size.value} ${parcel.size.unit}`, leftColumn + 100, currentY);

      currentY += 25;
      doc.font('Helvetica-Bold')
        .text('Zoning:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.zoning.charAt(0).toUpperCase() + parcel.zoning.slice(1), leftColumn + 100, currentY);

      if (parcel.landUse) {
        currentY += 25;
        doc.font('Helvetica-Bold')
          .text('Land Use:', leftColumn, currentY);
        doc.font('Helvetica')
          .text(parcel.landUse, leftColumn + 100, currentY);
      }

      // Right Column
      currentY = doc.y;
      if (parcel.marketValue) {
        doc.font('Helvetica-Bold')
          .text('Market Value:', rightColumn, currentY);
        doc.font('Helvetica')
          .text(`KES ${parcel.marketValue.toLocaleString()}`, rightColumn + 100, currentY);
      }

      currentY += 25;
      doc.font('Helvetica-Bold')
        .text('Status:', rightColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.status.toUpperCase(), rightColumn + 100, currentY);

      // Location Details Section
      doc.moveDown(3);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('LOCATION DETAILS', { underline: true });
      
      doc.moveDown(0.5);
      currentY = doc.y;

      doc.fontSize(11).font('Helvetica-Bold')
        .text('County:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.county, leftColumn + 100, currentY);

      doc.font('Helvetica-Bold')
        .text('Sub-County:', rightColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.subCounty, rightColumn + 100, currentY);

      currentY += 25;
      doc.font('Helvetica-Bold')
        .text('Constituency:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.constituency, leftColumn + 100, currentY);

      doc.font('Helvetica-Bold')
        .text('Ward:', rightColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.ward, rightColumn + 100, currentY);

      // Coordinates if available
      if (parcel.coordinates && parcel.coordinates.latitude && parcel.coordinates.longitude) {
        currentY += 25;
        doc.font('Helvetica-Bold')
          .text('Coordinates:', leftColumn, currentY);
        doc.font('Helvetica')
          .text(`${parcel.coordinates.latitude}, ${parcel.coordinates.longitude}`, leftColumn + 100, currentY);
      }

      // Property Description
      if (parcel.description) {
        doc.moveDown(2);
        doc.fontSize(14).font('Helvetica-Bold')
          .text('PROPERTY DESCRIPTION', { underline: true });
        
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica')
          .text(parcel.description, {
            width: 495,
            align: 'justify'
          });
      }

      // Owner Information Section
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('REGISTERED OWNER', { underline: true });
      
      doc.moveDown(0.5);
      currentY = doc.y;

      // Get full owner name
      let ownerFullName = parcel.ownerName;
      if (!ownerFullName && owner) {
        ownerFullName = `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
      }
      if (!ownerFullName) {
        ownerFullName = 'Not Available';
      }

      doc.fontSize(11).font('Helvetica-Bold')
        .text('Full Name:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(ownerFullName, leftColumn + 100, currentY);

      if (parcel.ownerIdNumber || owner?.nationalId) {
        currentY += 25;
        doc.font('Helvetica-Bold')
          .text('National ID:', leftColumn, currentY);
        doc.font('Helvetica')
          .text(parcel.ownerIdNumber || owner?.nationalId, leftColumn + 100, currentY);
      }

      if (parcel.ownerKraPin || owner?.kraPin) {
        doc.font('Helvetica-Bold')
          .text('KRA PIN:', rightColumn, currentY);
        doc.font('Helvetica')
          .text(parcel.ownerKraPin || owner?.kraPin, rightColumn + 100, currentY);
      }

      // Date of Issue
      doc.moveDown(2);
      doc.fontSize(11).font('Helvetica-Bold')
        .text('Date of Issue:', leftColumn, doc.y);
      doc.font('Helvetica')
        .text(new Date(parcel.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }), leftColumn + 100, doc.y - 12);

      // Approval Status
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica-Bold')
        .text('APPROVAL STATUS', { underline: true });
      
      doc.moveDown(0.5);
      currentY = doc.y;

      // County Admin Approval
      doc.fontSize(11).font('Helvetica-Bold')
        .text('County Admin:', leftColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.countyAdminApproval?.status.toUpperCase() || 'PENDING', leftColumn + 120, currentY);

      // NLC Admin Approval
      doc.font('Helvetica-Bold')
        .text('NLC Admin:', rightColumn, currentY);
      doc.font('Helvetica')
        .text(parcel.nlcAdminApproval?.status.toUpperCase() || 'PENDING', rightColumn + 100, currentY);

      // Footer - Official Seal and Signature Area
      doc.moveDown(3);
      const footerY = 720;
      
      // Signature boxes
      doc.rect(70, footerY, 200, 60).stroke();
      doc.fontSize(10).font('Helvetica')
        .text('Authorized Officer', 80, footerY + 45);
      doc.text('National Land Commission', 80, footerY + 55);

      doc.rect(325, footerY, 200, 60).stroke();
      doc.text('Official Stamp/Seal', 335, footerY + 45);
      doc.text('Date:', 335, footerY + 55);

      // Verification Footer
      doc.fontSize(8).font('Helvetica')
        .text('This is an official document. Verify authenticity at www.ardhisasa.go.ke', 
          0, 800, { align: 'center' });
      doc.text(`Document Generated: ${new Date().toLocaleString()}`, 
          0, 810, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Transfer History Report PDF
 * @param {Object} parcel - The parcel object
 * @param {Array} transfers - Array of transfer records
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateTransferHistoryPDF = async (parcel, transfers) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
        .text('TRANSFER HISTORY REPORT', { align: 'center' });
      
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica')
        .text(`Title: ${parcel.titleNumber}`, { align: 'center' });
      doc.text(`Parcel ID: ${parcel._id.toString().slice(-12).toUpperCase()}`, { align: 'center' });

      doc.moveDown(2);
      
      // Transfers Table
      if (transfers.length === 0) {
        doc.fontSize(12).font('Helvetica')
          .text('No transfer records found for this parcel.', { align: 'center' });
      } else {
        transfers.forEach((transfer, index) => {
          doc.fontSize(14).font('Helvetica-Bold')
            .text(`Transfer #${index + 1}`, { underline: true });
          
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica-Bold')
            .text('Transfer Number: ');
          doc.font('Helvetica')
            .text(transfer.transferNumber, { continued: false });

          doc.font('Helvetica-Bold')
            .text('Previous Owner: ');
          doc.font('Helvetica')
            .text(`${transfer.seller?.firstName || 'N/A'} ${transfer.seller?.lastName || ''}`, { continued: false });

          doc.font('Helvetica-Bold')
            .text('New Owner: ');
          doc.font('Helvetica')
            .text(`${transfer.buyer?.firstName || 'N/A'} ${transfer.buyer?.lastName || ''}`, { continued: false });

          doc.font('Helvetica-Bold')
            .text('Date of Transfer: ');
          doc.font('Helvetica')
            .text(new Date(transfer.createdAt).toLocaleDateString(), { continued: false });

          doc.font('Helvetica-Bold')
            .text('Status: ');
          doc.font('Helvetica')
            .text(transfer.status.toUpperCase().replace(/_/g, ' '), { continued: false });

          if (transfer.remarks) {
            doc.font('Helvetica-Bold')
              .text('Notes: ');
            doc.font('Helvetica')
              .text(transfer.remarks, { continued: false });
          }

          doc.moveDown(2);
        });
      }

      // Footer
      doc.fontSize(8).font('Helvetica')
        .text(`Report Generated: ${new Date().toLocaleString()}`, 
          0, 800, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateTitleDeedPDF,
  generateTransferHistoryPDF
};
