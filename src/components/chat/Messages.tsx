import React, { useRef, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Message from './Message';
import { Chunk } from '../../common/interfaces';

interface ChatMessage {
  type: 'query' | 'answer';
  content: string | object;
  chunks?: Chunk[];
}

interface MessagesProps {
  messages: ChatMessage[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages-container" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
      <ListGroup>
        {messages.map((msg, index) => (
          <Message key={index} type={msg.type} content={msg.content} chunks={msg.chunks} />
        ))}
      </ListGroup>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
