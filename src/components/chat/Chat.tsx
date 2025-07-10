import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';
import { useRetriever } from '../../contexts/RetrieverContext';
import { searchWithRetriever } from '../../services/rag';
import Query from './Query';
import Messages from './Messages';

interface ChatMessage {
  type: 'query' | 'answer';
  content: string | object;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { setErrorMessage } = useAlert();
  const { selectedRetriever } = useRetriever();

  const handleQuerySubmit = async (query: string) => {
    if (!selectedRetriever) {
      setErrorMessage('Please select a retriever first.');
      return;
    }

    setMessages(prevMessages => [...prevMessages, { type: 'query', content: query }]);
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await searchWithRetriever(selectedRetriever.name, query);
      setMessages(prevMessages => [...prevMessages, { type: 'answer', content: data }]);
    } catch (err) {
      console.error('Error searching with retriever:', err);
      setErrorMessage('Failed to search with retriever. Please check the server URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-sidebar-content">
      <h2>Chat</h2>
      <Messages messages={messages} />
      {loading && <Spinner animation="border" className="my-3" />}
      <Query onSubmit={handleQuerySubmit} loading={loading} />
    </div>
  );
};

export default Chat;
