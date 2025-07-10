import React, { useState, useEffect, useCallback } from 'react';
import { Button, Spinner, ListGroup, Form } from 'react-bootstrap';
import { fetchDocuments, uploadDocument, deleteDocument } from '../../services/document';
import { getDocumentsFromRetriever } from '../../services/rag';
import { useAlert } from '../../contexts/AlertContext';
import { useRetriever } from '../../contexts/RetrieverContext';
import { DocumentItem } from '../../common/interfaces';
import Document from './Document';

const Documents: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  const { setSuccessMessage, setErrorMessage } = useAlert();
  const { 
    documents: retrieverDocs, 
    selectedRetriever, 
    setDocuments: setRetrieverDocs 
  } = useRetriever();

  const loadAllDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const data = await fetchDocuments();
      setAllDocuments(data);
    } catch (err) {
      console.error("Error fetching all documents:", err);
      setErrorMessage("Failed to fetch the list of all documents.");
    } finally {
      setLoadingDocs(false);
    }
  }, [setErrorMessage]);

  const refreshRetrieverDocuments = useCallback(async () => {
    if (selectedRetriever) {
      try {
        const { documents } = await getDocumentsFromRetriever(selectedRetriever.name);
        setRetrieverDocs(documents || []);
      } catch (err) {
        console.error("Error refreshing retriever documents:", err);
        setErrorMessage(`Failed to refresh documents for ${selectedRetriever.name}.`);
      }
    }
  }, [selectedRetriever, setRetrieverDocs, setErrorMessage]);

  useEffect(() => {
    loadAllDocuments();
  }, [loadAllDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    setUploading(true);
    try {
      const result = await uploadDocument(selectedFile);
      setSuccessMessage(result.message || 'File uploaded successfully!');
      setSelectedFile(null);
      await loadAllDocuments(); // Refresh the list of all documents
    } catch (err) {
      console.error('Error uploading file:', err);
      setErrorMessage('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      setSuccessMessage('Document deleted successfully!');
      await loadAllDocuments(); // Refresh the list of all documents
      await refreshRetrieverDocuments(); // Also refresh the retriever docs
    } catch (err) {
      console.error('Error deleting document:', err);
      setErrorMessage('Failed to delete document.');
    }
  };

  return (
    <div>
      <h2>Documents</h2>
      
      {loadingDocs ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <ListGroup className="mb-4">
          {allDocuments.map((doc) => (
            <Document
              key={doc.id}
              document={doc}
              isChecked={retrieverDocs.some(retrieverDoc => retrieverDoc.id === doc.id)}
              retrieverName={selectedRetriever?.name}
              onUpdate={refreshRetrieverDocuments}
              onDelete={handleDelete}
            />
          ))}
        </ListGroup>
      )}
      {allDocuments.length === 0 && !loadingDocs && <p>No documents found.</p>}

      <hr className="my-4" />
      <h3>Upload Document</h3>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select a document to upload</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>
      <Button variant="success" onClick={handleUpload} disabled={uploading || !selectedFile}>
        {uploading ? <Spinner animation="border" size="sm" /> : 'Upload Document'}
      </Button>
    </div>
  );
};

export default Documents;
