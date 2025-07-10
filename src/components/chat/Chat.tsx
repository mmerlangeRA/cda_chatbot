import React, { useState } from 'react';
import { Spinner, Form } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';
import { useRetriever } from '../../contexts/RetrieverContext';
import { searchWithRetriever, chatWithMistral } from '../../services/rag';
import Query from './Query';
import Messages from './Messages';
import { Chunk } from '../../common/interfaces';

interface ChatMessage {
  type: 'query' | 'answer';
  content: string | object;
  chunks?: Chunk[];
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
      let answerContent: string | object;
      let answerChunks: Chunk[] | undefined;

      if (useMistral) {
        if (!selectedRetriever) {
          setErrorMessage('Please select a retriever first to use Mistral with RAG.');
          setLoading(false);
          return;
        }
        // First, search with the retriever
        const retrieverResponse = await searchWithRetriever(selectedRetriever.name, query);
        answerChunks = retrieverResponse.chunks || [];
        
        let context = "";
        if (answerChunks.length > 0) {
          context = "Use the following information to answer the question:\n\n" +
                    answerChunks.map(chunk => chunk.text).join("\n\n") +
                    "\n\n";
        }

        const ollamaMessages = messages.map(msg => ({
          role: msg.type === 'query' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        }));
        
        // Add the context and the current query to the messages for Ollama
        ollamaMessages.push({ role: 'user', content: context + query });
        
        answerContent = await chatWithMistral(ollamaMessages);
      } else {
        if (!selectedRetriever) {
          setErrorMessage('Please select a retriever first.');
          setLoading(false);
          return;
        }
        const retrieverResponse = await searchWithRetriever(selectedRetriever.name, query);
        answerContent = "Que chunks";
        answerChunks = retrieverResponse.chunks || [];
      }
      setMessages(prevMessages => [...prevMessages, { type: 'answer', content: answerContent, chunks: answerChunks }]);
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
