import React, { useState } from 'react';
import { Chunk } from '../../common/interfaces';
import { usePdfViewer } from '../../contexts/PdfViewerContext';
import { getDocument } from '../../services/document';
import { Modal, Button } from 'react-bootstrap';

interface SourcesProps {
  chunks?: Chunk[];
}

const Sources: React.FC<SourcesProps> = ({ chunks }) => {
  const { setPdfUrl, setTargetPage } = usePdfViewer();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  if (!chunks || chunks.length === 0) {
    return null;
  }

  const handleSourceClick = async (chunk: Chunk) => {
    try {
      const document = await getDocument(chunk.document_id);
      let page = 1; // default to page 1
      if (chunk.metadata && chunk.metadata.page) {
        page = chunk.metadata.page;
      }
      
      setPdfUrl(document.url);
      console.log("setTargetPage",page)
      setTargetPage(page); // Set the target page for automatic navigation
      
      setModalTitle(`Source: ${document.name} (Page ${page}) (confiance: ${Math.round(chunk.confidence*100)}%)`);
      setModalContent(chunk.text);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching document for PDF viewer or displaying chunk:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="sources-container mt-2">
      <small className="text-muted">
        Sources: 
        {chunks.map((chunk, index) => (
          <a 
            key={index} 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleSourceClick(chunk); }}
            className="source-ref me-1"
          >
            [{index + 1}]
          </a>
        ))}
      </small>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{modalContent}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sources;
