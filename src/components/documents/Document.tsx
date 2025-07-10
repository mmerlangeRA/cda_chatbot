import React from 'react';
import { ListGroup, Form, Button } from 'react-bootstrap';
import { DocumentItem } from '../../common/interfaces';
import { addDocumentToRetriever, removeDocumentFromRetriever } from '../../services/rag';
import { useAlert } from '../../contexts/AlertContext';

interface DocumentProps {
  document: DocumentItem;
  isChecked: boolean;
  retrieverName: string | undefined;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

const Document: React.FC<DocumentProps> = ({ document, isChecked, retrieverName, onUpdate, onDelete }) => {
  const { setSuccessMessage, setErrorMessage } = useAlert();

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!retrieverName) {
      setErrorMessage("No retriever selected.");
      e.target.checked = false;
      return;
    }

    const { checked } = e.target;

    try {
      if (checked) {
        await addDocumentToRetriever(retrieverName, document.id);
        setSuccessMessage(`Document "${document.name}" added to retriever "${retrieverName}".`);
      } else {
        await removeDocumentFromRetriever(retrieverName, document.id);
        setSuccessMessage(`Document "${document.name}" removed from retriever "${retrieverName}".`);
      }
      onUpdate();
    } catch (err) {
      console.error("Error updating document in retriever:", err);
      setErrorMessage("Failed to update document in retriever.");
      onUpdate();
    }
  };

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <Form.Check
        type="checkbox"
        id={`doc-${document.id}`}
        label={document.name}
        checked={isChecked}
        onChange={handleCheckboxChange}
        disabled={!retrieverName}
        title={!retrieverName ? "Please select a retriever first" : ""}
      />
      <div>
        <small><a href={document.url} target="_blank" rel="noopener noreferrer" className="me-3">View</a></small>
        <Button variant="danger" size="sm" onClick={() => onDelete(document.id)}>Delete</Button>
      </div>
    </ListGroup.Item>
  );
};

export default Document;
