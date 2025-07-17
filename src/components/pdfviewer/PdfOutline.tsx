import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { usePdfViewer } from '../../contexts/PdfViewerContext';

interface OutlineItem {
  title: string;
  dest: any;
  items?: OutlineItem[];
}

interface PdfOutlineProps {
  pdfUrl: string;
}

const PdfOutline: React.FC<PdfOutlineProps> = ({ pdfUrl }) => {
  const { setCurrentPage, setTargetPage, showOutline } = usePdfViewer();
  const [outline, setOutline] = useState<OutlineItem[] | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadOutline = async () => {
      try {
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const outlineData = await pdf.getOutline();
        setOutline(outlineData);
      } catch (error) {
        console.error('Error loading PDF outline:', error);
        setOutline(null);
      }
    };

    if (pdfUrl && showOutline) {
      loadOutline();
    }
  }, [pdfUrl, showOutline]);

  const handleOutlineClick = async (dest: any) => {
    try {
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const destArray = await pdf.getDestination(dest);
      
      if (destArray) {
        const pageRef = destArray[0];
        const pageIndex = await pdf.getPageIndex(pageRef);
        const pageNumber = pageIndex + 1;
        
        setCurrentPage(pageNumber);
        setTargetPage(pageNumber);
      }
    } catch (error) {
      console.error('Error navigating to outline destination:', error);
    }
  };

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
  };

  const renderOutlineItem = (item: OutlineItem, level: number = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems.has(item.title);
    const paddingLeft = level * 16 + 8;

    return (
      <div key={item.title}>
        <div
          className="outline-item d-flex align-items-center py-1"
          style={{
            paddingLeft: `${paddingLeft}px`,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.title);
            }
            if (item.dest) {
              handleOutlineClick(item.dest);
            }
          }}
        >
          {hasChildren && (
            <span className="me-1" style={{ width: '12px' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span className="me-1" style={{ width: '12px' }}></span>}
          <span className="text-truncate" title={item.title}>
            {item.title}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {item.items!.map((childItem, index) => 
              renderOutlineItem(childItem, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!showOutline) {
    return null;
  }

  return (
    <div
      className="pdf-outline"
      style={{
        width: '250px',
        height: '100%',
        overflowY: 'auto',
        borderRight: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}
    >
      <div className="p-2">
        <h6 className="mb-3">Outline</h6>
        {outline ? (
          outline.length > 0 ? (
            <div>
              {outline.map((item, index) => renderOutlineItem(item))}
            </div>
          ) : (
            <p className="text-muted small">No outline available</p>
          )
        ) : (
          <p className="text-muted small">Loading outline...</p>
        )}
      </div>
    </div>
  );
};

export default PdfOutline;
