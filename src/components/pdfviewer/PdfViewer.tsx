import React from 'react';

interface PdfViewerProps {
  pdfUrl: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  if (!pdfUrl) {
    return (
      <div className="pdf-viewer-placeholder">
        <p>Select a source to view the PDF.</p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container" style={{ width: '100%', height: '100%' }}>
      <iframe src={pdfUrl} width="100%" height="100%" title="PDF Viewer" />
    </div>
  );
};

export default PdfViewer;
