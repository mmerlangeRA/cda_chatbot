import React from 'react';
import { ListGroup } from 'react-bootstrap';

interface MessageProps {
  type: 'query' | 'answer';
  content: string | object;
}

const Message: React.FC<MessageProps> = ({ type, content }) => {
  const isQuery = type === 'query';
  const variant = isQuery ? 'primary' : 'light';
  const alignClass = isQuery ? 'text-end' : 'text-start';

  return (
    <ListGroup.Item variant={variant} className={`my-2 ${alignClass}`}>
      {isQuery ? (
        <p className="mb-0">{content as string}</p>
      ) : (
        typeof content === 'string' ? (
          <p className="mb-0">{content}</p>
        ) : (
          <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(content, null, 2)}
          </pre>
        )
      )}
    </ListGroup.Item>
  );
};

export default Message;
