import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Sources from './Sources';
import { Chunk } from '../../common/interfaces';

interface MessageProps {
  type: 'query' | 'answer';
  content: string | object;
  chunks?: Chunk[];
}

const Message: React.FC<MessageProps> = ({ type, content, chunks }) => {
  const isQuery = type === 'query';
  const variant = isQuery ? 'primary' : 'light';
  const alignClass = isQuery ? 'text-end' : 'text-start';

  return (
    <ListGroup.Item variant={variant} className={`my-2 ${alignClass}`}>
      {isQuery ? (
        <p className="mb-0">{content as string}</p>
      ) : (
        <>
          {typeof content === 'string' ? (
            <p className="mb-0">{content}</p>
          ) : (
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(content, null, 2)}
            </pre>
          )}
          {type === 'answer' && <Sources chunks={chunks} />}
        </>
      )}
    </ListGroup.Item>
  );
};

export default Message;
