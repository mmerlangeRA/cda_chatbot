import React from 'react';
import { Alert } from 'react-bootstrap';

interface AlertSuccessProps {
  message: string;
  onClose: () => void;
}

const AlertSuccess: React.FC<AlertSuccessProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <Alert variant="success" onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default AlertSuccess;
