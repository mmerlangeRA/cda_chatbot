import React from 'react';
import { Alert } from 'react-bootstrap';

interface AlertErrorProps {
  message: string;
  onClose: () => void;
}

const AlertError: React.FC<AlertErrorProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Alert variant="danger" onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default AlertError;
