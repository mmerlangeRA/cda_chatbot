import React, { useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import { usePdfViewer } from '../../contexts/PdfViewerContext';

interface PdfThumbnailsProps {
  pdfUrl: string;
}

const PdfThumbnails: React.FC<PdfThumbnailsProps> = ({ pdfUrl }) => {
  const {
    currentPage,
    setCurrentPage,
    numPages,
    setTargetPage
  } = usePdfViewer();

  const thumbnailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setTargetPage(pageNumber);
  };

  // Auto-scroll to current page thumbnail
  useEffect(() => {
    if (currentPage && thumbnailRefs.current[currentPage] && containerRef.current) {
      const thumbnail = thumbnailRefs.current[currentPage];
      const container = containerRef.current;
      
      if (thumbnail) {
        const thumbnailTop = thumbnail.offsetTop;
        const thumbnailHeight = thumbnail.offsetHeight;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.offsetHeight;

        // Check if thumbnail is not fully visible
        if (thumbnailTop < containerScrollTop || 
            thumbnailTop + thumbnailHeight > containerScrollTop + containerHeight) {
          // Scroll to center the thumbnail
          container.scrollTop = thumbnailTop - (containerHeight / 2) + (thumbnailHeight / 2);
        }
      }
    }
  }, [currentPage]);

  if (!numPages) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="pdf-thumbnails"
      style={{
        width: '200px',
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}
    >
      <div className="p-2">
        <h6 className="mb-3">Pages</h6>
        <Document file={pdfUrl}>
          {Array.from(new Array(numPages), (el, index) => (
            <div
              key={`thumbnail_${index + 1}`}
              ref={(el) => { thumbnailRefs.current[index + 1] = el; }}
              className={`thumbnail-container mb-2 ${
                currentPage === index + 1 ? 'border border-primary' : 'border'
              }`}
              style={{
                cursor: 'pointer',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: 'white'
              }}
              onClick={() => handleThumbnailClick(index + 1)}
            >
              <div className="text-center p-1">
                <small className="text-muted">{index + 1}</small>
              </div>
              <Page
                pageNumber={index + 1}
                width={160}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfThumbnails;
