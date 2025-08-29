import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';
import { useRetriever } from '../../contexts/RetrieverContext';
import { chatWithAgent, AgentResponse } from '../../services/langchain';
import Query from './Query';
import Messages from './Messages';
import { Chunk, AgentStep } from '../../common/interfaces';

interface ChatMessage {
  type: 'query' | 'answer' | 'agent_thinking' | 'error';
  content: string;
  chunks?: Chunk[];
  agentSteps?: AgentStep[];
  timestamp?: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { setErrorMessage } = useAlert();
  const { selectedRetriever } = useRetriever();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      type: "answer",
      content: `Bonjour ! Je suis votre assistant pour la recherche dans la base documentaire.

Pour rechercher un document, j'ai besoin de connaître :
- **cabine** (numéro de cabine)
- **ligne** (identifiant de ligne, ex: "L1", "L2", etc.)
- **poste** (identifiant de poste, ex: "p0100", "p0200", etc.)

Vous pouvez me poser une question et je vous demanderai ces informations si nécessaire.

Exemple : "Trouve-moi les procédures de sécurité pour la cabine 4741, ligne L1, poste p0100"`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);
  
  const handleQuerySubmit = async (query: string) => {
    if (!selectedRetriever) {
      setErrorMessage('Veuillez sélectionner un retriever avant de commencer.');
      return;
    }

    // Add user query to messages
    const userMessage: ChatMessage = {
      type: 'query',
      content: query,
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setLoading(true);
    setErrorMessage('');

    try {
      // Show thinking message
      const thinkingMessage: ChatMessage = {
        type: 'agent_thinking',
        content: 'L\'agent analyse votre demande...',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, thinkingMessage]);

      // Call the LangChain agent with session ID
      const agentResponse: AgentResponse = await chatWithAgent(
        query, 
        selectedRetriever.name,
        "http://localhost:11434",
        sessionId
      );

      // Remove thinking message and add agent response
      setMessages(prevMessages => {
        const withoutThinking = prevMessages.filter(msg => msg.type !== 'agent_thinking');
        
        const agentMessage: ChatMessage = {
          type: 'answer',
          content: agentResponse.output,
          chunks: agentResponse.chunks, // Pass chunks for Sources component
          agentSteps: agentResponse.intermediateSteps,
          timestamp: new Date()
        };
        
        return [...withoutThinking, agentMessage];
      });

    } catch (err) {
      console.error('Error during agent chat:', err);
      
      // Remove thinking message and add error message
      setMessages(prevMessages => {
        const withoutThinking = prevMessages.filter(msg => msg.type !== 'agent_thinking');
        
        const errorMessage: ChatMessage = {
          type: 'error',
          content: `Erreur lors de la communication avec l'agent: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
          timestamp: new Date()
        };
        
        return [...withoutThinking, errorMessage];
      });
      
      setErrorMessage('Échec de la communication avec l\'agent. Vérifiez que Ollama est en cours d\'exécution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-sidebar-content">
      <h2>Chat avec Agent </h2>
      <div className="mb-3">
        <small className="text-muted">
          {selectedRetriever ? 
            `Retriever actif: ${selectedRetriever.name}` : 
            'Aucun retriever sélectionné'
          }
        </small>
      </div>
      <Messages messages={messages} />
      {loading && (
        <div className="d-flex align-items-center my-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>L'agent traite votre demande...</span>
        </div>
      )}
      <Query onSubmit={handleQuerySubmit} loading={loading} />
    </div>
  );
};

export default Chat;
