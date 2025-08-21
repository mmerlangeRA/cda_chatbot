import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import Sources from './Sources';
import { Chunk } from '../../common/interfaces';

interface MessageProps {
  type: 'query' | 'answer' | 'agent_thinking' | 'error';
  content: string;
  chunks?: Chunk[];
}

const Message: React.FC<MessageProps> = ({ type, content, chunks }) => {
  const getVariantAndClass = () => {
    switch (type) {
      case 'query':
        return { variant: 'primary', alignClass: 'text-end' };
      case 'answer':
        return { variant: 'light', alignClass: 'text-start' };
      case 'agent_thinking':
        return { variant: 'info', alignClass: 'text-start' };
      case 'error':
        return { variant: 'danger', alignClass: 'text-start' };
      default:
        return { variant: 'light', alignClass: 'text-start' };
    }
  };

  const { variant, alignClass } = getVariantAndClass();

  const renderContent = () => {
    if (type === 'query') {
      return <p className="mb-0">{content}</p>;
    }

    if (type === 'agent_thinking') {
      return (
        <div className="d-flex align-items-center">
          <Badge bg="info" className="me-2">Agent</Badge>
          <p className="mb-0 fst-italic">{content}</p>
        </div>
      );
    }

    if (type === 'error') {
      return (
        <div>
          <Badge bg="danger" className="me-2">Erreur</Badge>
          <p className="mb-0">{content}</p>
        </div>
      );
    }

    // Answer type
    return (
      <>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {content}
        </div>
        <Sources chunks={chunks} />
      </>
    );
  };

  return (
    <ListGroup.Item variant={variant} className={`my-2 ${alignClass}`}>
      {renderContent()}
    </ListGroup.Item>
  );
};

export default Message;
