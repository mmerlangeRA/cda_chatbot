import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import './App.css';

interface AnswerItem {
  id: string;
  text: string;
  url: string;
}

interface DocumentItem {
  id: number;
  name: string;
  url: string;
}

const App: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [fetchingDocuments, setFetchingDocuments] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string>('');

  const chatbotServerUrl = process.env.REACT_APP_CHATBOT_SERVER_URL;
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
  }, [documentServerUrl]); // Re-fetch documents if documentServerUrl changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!chatbotServerUrl) {
      setError('Chatbot server URL is not configured. Please check your .env file.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer([]);

    try {
      const response = await fetch(chatbotServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnswerItem[] = await response.json();
      setAnswer(data);
    } catch (err) {
      console.error('Error fetching answer:', err);
      setError('Failed to fetch answer. Please check the server URL and try again.');
    } finally {
      setLoading(false);
    }
  };

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
      setSelectedFile(null); // Clear selected file after successful upload
      fetchDocuments(); // Refresh document list after upload
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
        fetchDocuments(); // Refresh document list after deletion
      } catch (err) {
        console.error('Error deleting document:', err);
        setDocumentError('Failed to delete document. Please check the server URL.');
      }
    }
  };

  return (
    <div className="App">
      {/* Topbar with logo */}
      <div className="topbar">
        <img 
          src="/logo-chantiers-atlantique.svg" 
          alt="Chantiers de l'Atlantique" 
          className="topbar-logo"
        />
      </div>
      
      <Container fluid className="app-content">
      <Row>
        <Col md={2} className="left-sidebar bg-light p-3">
          <h2>Documents</h2>
          {fetchingDocuments && <Spinner animation="border" size="sm" />}
          {documentError && <Alert variant="danger">{documentError}</Alert>}
          {!fetchingDocuments && documents.length === 0 && !documentError && <p>No documents found.</p>}
          {!fetchingDocuments && documents.length > 0 && (
            <ListGroup>
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
        </Col>
        <Col md={7} className="main-content">
          <header className="App-header">
            <h1>CDA Chatbot</h1>
            <Form onSubmit={handleSubmit} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Ask'}
              </Button>
            </Form>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            <hr className="my-4" />

            <h2>Upload Document</h2>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select a document to upload</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Button variant="success" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? <Spinner animation="border" size="sm" /> : 'Upload Document'}
            </Button>
            {uploadMessage && <Alert variant="success" className="mt-3">{uploadMessage}</Alert>}
            {uploadError && <Alert variant="danger" className="mt-3">{uploadError}</Alert>}
          </header>
        </Col>
        <Col md={3} className="right-sidebar bg-light p-3">
          <h2>Answers</h2>
          {loading && <Spinner animation="border" />}
          {!loading && answer.length === 0 && !error && <p>No answers yet. Ask a question!</p>}
          {!loading && answer.length > 0 && (
            <ListGroup>
              {answer.map((item) => (
                <ListGroup.Item key={item.id}>
                  <h5>{item.text}</h5>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
    </div>
  );
};

export default App;
