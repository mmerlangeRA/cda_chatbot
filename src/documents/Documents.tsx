import React, { useState, useEffect } from 'react';
import { Button, Spinner, ListGroup, Alert, Form } from 'react-bootstrap';

interface DocumentItem {
  id: number;
  name: string;
  url: string;
}

const Documents: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocuments, setFetchingDocuments] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string>('');

  const documentServerUrl = process.env.REACT_APP_DOCUMENT_SERVER_URL;

  const fetchDocuments = async () => {
    if (!documentServerUrl) {
      setDocumentError('Document server URL is not configured. Please check your .env file.');
      return;
    }
    setFetchingDocuments(true);
    setDocumentError('');
    try {
      const response = await fetch(`${documentServerUrl}/api/documents/detailed/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DocumentItem[] = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocumentError('Failed to fetch documents. Please check the server URL.');
    } finally {
      setFetchingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadMessage('');
      setUploadError('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    if (!documentServerUrl) {
      setUploadError('Document server URL is not configured. Please check your .env file.');
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setUploadError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${documentServerUrl}/api/documents/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadMessage(result.message || 'File uploaded successfully!');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file. Please check the server URL and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!documentServerUrl) {
      setDocumentError('Document server URL is not configured. Please check your .env file.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`${documentServerUrl}/api/documents/${id}/delete/`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setUploadMessage('Document deleted successfully!');
        fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        setDocumentError('Failed to delete document. Please check the server URL.');
      }
    }
  };

  return (
    <div>
      <h2>Documents</h2>
      
      {/* Document List */}
      {fetchingDocuments && <Spinner animation="border" size="sm" />}
      {documentError && <Alert variant="danger">{documentError}</Alert>}
      {!fetchingDocuments && documents.length === 0 && !documentError && <p>No documents found.</p>}
      {!fetchingDocuments && documents.length > 0 && (
        <ListGroup className="mb-4">
          {documents.map((doc) => (
            <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1">{doc.name}</p>
                <small><a href={doc.url} target="_blank" rel="noopener noreferrer">View</a></small>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDeleteDocument(doc.id)}>Delete</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Upload Section */}
      <hr className="my-4" />
      <h3>Upload Document</h3>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select a document to upload</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>
      <Button variant="success" onClick={handleUpload} disabled={uploading || !selectedFile}>
        {uploading ? <Spinner animation="border" size="sm" /> : 'Upload Document'}
      </Button>
      {uploadMessage && <Alert variant="success" className="mt-3">{uploadMessage}</Alert>}
      {uploadError && <Alert variant="danger" className="mt-3">{uploadError}</Alert>}
    </div>
  );
};

export default Documents;
