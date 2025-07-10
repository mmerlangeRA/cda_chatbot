import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

interface QueryProps {
  onSubmit: (query: string) => void;
  loading: boolean;
}

const Query: React.FC<QueryProps> = ({ onSubmit, loading }) => {
  const [question, setQuestion] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit(question);
    setQuestion(''); // Clear the input after submission
  };

  return (
    <div className="ask-question-form">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Ask a Question</Form.Label>
          <Form.Control
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            disabled={loading}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading} className="w-100">
          {loading ? <Spinner animation="border" size="sm" /> : 'Ask'}
        </Button>
      </Form>
    </div>
  );
};

export default Query;
