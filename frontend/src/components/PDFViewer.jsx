import React, { useState, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import './PDFViewer.css';

const PDFViewer = ({ pdfUrl, title = 'PDF Document', onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (pdfUrl) {
      // If pdfUrl is a string URL, use it directly
      if (typeof pdfUrl === 'string') {
        setBlobUrl(pdfUrl);
        setLoading(false);
      } else if (pdfUrl instanceof Promise) {
        // If it's a promise (from API call), resolve it
        pdfUrl
          .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            setBlobUrl(url);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF document');
            setLoading(false);
          });
      }
    }

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [pdfUrl]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load PDF document');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-header">
        <h3 className="pdf-viewer-title">{title}</h3>
        <button 
          onClick={handleDownload} 
          className="pdf-download-btn"
          title="Download PDF"
        >
          <Download size={18} />
          <span>Download</span>
        </button>
      </div>

      {loading && (
        <div className="pdf-loading">
          <Loader2 size={32} className="spinner" />
          <p>Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="pdf-error">
          <p>{error}</p>
        </div>
      )}

      {blobUrl && !error && (
        <iframe
          src={blobUrl}
          className="pdf-viewer-iframe"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
        />
      )}
    </div>
  );
};

export default PDFViewer;
