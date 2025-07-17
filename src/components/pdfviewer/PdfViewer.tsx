import React, { useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePdfViewer } from '../../contexts/PdfViewerContext';
import PdfControls from './PdfControls';
import PdfThumbnails from './PdfThumbnails';
import PdfOutline from './PdfOutline';

// Set up PDF.js worker using local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PdfViewerProps {
  pdfUrl: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const {
    currentPage,
    setCurrentPage,
    numPages,
    setNumPages,
    targetPage,
    setTargetPage,
    scale,
    showOutline
  } = usePdfViewer();

  const pageRef = useRef<HTMLDivElement>(null);

  // Handle target page scrolling
  useEffect(() => {
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
      setTargetPage(null); // Clear target after navigation
    }
  }, [targetPage, currentPage, setCurrentPage, setTargetPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setNumPages(null);
  };

  if (!pdfUrl) {
    return (
      <div className="pdf-viewer-placeholder d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
        <div className="text-center">
          <p className="text-muted">Select a source to view the PDF.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PdfControls />
      
      <div className="pdf-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showOutline && (
          <PdfOutline pdfUrl={pdfUrl} />
        )}
        
        <PdfThumbnails pdfUrl={pdfUrl} />
        
        <div 
          className="pdf-main-view"
          style={{ 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: '#525659',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px'
          }}
        >
          <div ref={pageRef}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="text-white">Loading PDF...</div>
                </div>
              }
              error={
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="text-white">Error loading PDF. Please try again.</div>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                loading={
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '600px', backgroundColor: 'white' }}>
                    <div>Loading page...</div>
                  </div>
                }
                error={
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '600px', backgroundColor: 'white' }}>
                    <div>Error loading page.</div>
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
