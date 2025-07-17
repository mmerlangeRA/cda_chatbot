import React, { useState } from 'react';
import { Button, ButtonGroup, Form, InputGroup } from 'react-bootstrap';
import { usePdfViewer } from '../../contexts/PdfViewerContext';

const PdfControls: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    numPages,
    scale,
    setScale,
    showOutline,
    setShowOutline,
    setTargetPage
  } = usePdfViewer();

  const [pageInput, setPageInput] = useState<string>('');

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setTargetPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setTargetPage(newPage);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum && numPages && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      setTargetPage(pageNum);
      setPageInput('');
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  if (!numPages) {
    return null;
  }

  return (
    <div className="pdf-controls d-flex justify-content-between align-items-center p-2 border-bottom">
      <div className="d-flex align-items-center">
        <ButtonGroup className="me-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            ←
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
          >
            →
          </Button>
        </ButtonGroup>

        <Form onSubmit={handlePageInputSubmit} className="me-3">
          <InputGroup size="sm" style={{ width: '120px' }}>
            <Form.Control
              type="text"
              placeholder={`${currentPage}`}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
            />
            <InputGroup.Text>/ {numPages}</InputGroup.Text>
          </InputGroup>
        </Form>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowOutline(!showOutline)}
          className="me-3"
        >
          {showOutline ? 'Hide' : 'Show'} Outline
        </Button>
      </div>

      <div className="d-flex align-items-center">
        <ButtonGroup size="sm">
          <Button
            variant="outline-secondary"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            -
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleResetZoom}
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
          >
            +
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default PdfControls;
