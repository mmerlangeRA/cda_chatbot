import React, { useState } from 'react';
import { Spinner, Form } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';
import { useRetriever } from '../../contexts/RetrieverContext';
import { searchWithRetriever, chatWithMistral } from '../../services/rag';
import Query from './Query';
import Messages from './Messages';

interface ChatMessage {
  type: 'query' | 'answer';
  content: string | object;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [useMistral, setUseMistral] = useState<boolean>(false);
  const { setErrorMessage } = useAlert();
  const { selectedRetriever } = useRetriever();

  const handleQuerySubmit = async (query: string) => {
    setMessages(prevMessages => [...prevMessages, { type: 'query', content: query }]);
    setLoading(true);
    setErrorMessage('');

    try {
      let data: any;
      if (useMistral) {
        data = await chatWithMistral(query);
      } else {
        if (!selectedRetriever) {
          setErrorMessage('Please select a retriever first.');
          setLoading(false);
          return;
        }
        data = await searchWithRetriever(selectedRetriever.name, query);
      }
      setMessages(prevMessages => [...prevMessages, { type: 'answer', content: data }]);
    } catch (err) {
      console.error('Error during chat/search:', err);
      setErrorMessage('Failed to get a response. Please check the server URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-sidebar-content">
      <h2>Chat</h2>
      <Form.Check 
        type="switch"
        id="mistral-switch"
        label="Use Mistral (Ollama)"
        checked={useMistral}
        onChange={(e) => setUseMistral(e.target.checked)}
        className="mb-3"
      />
      <Messages messages={messages} />
      {loading && <Spinner animation="border" className="my-3" />}
      <Query onSubmit={handleQuerySubmit} loading={loading} />
    </div>
  );
};

export default Chat;
