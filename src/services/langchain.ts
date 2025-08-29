import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { searchPagesWithRetriever } from './rag';
import { Chunk } from '../common/interfaces';
import { workstationService } from './localStorage';

// Interface for conversation memory
interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Interface for agent response
export interface AgentResponse {
  output: string;
  chunks?: Chunk[];
  intermediateSteps?: Array<{
    action: any;
    observation: string;
  }>;
}

// Local memory storage for conversations
class ConversationMemory {
  private conversations: Map<string, ConversationMessage[]> = new Map();
  private readonly maxMessages = 20; // Keep last 20 messages per session

  getConversation(sessionId: string): ConversationMessage[] {
    return this.conversations.get(sessionId) || [];
  }

  addMessage(sessionId: string, message: ConversationMessage): void {
    const conversation = this.getConversation(sessionId);
    conversation.push(message);
    
    // Keep only the last maxMessages
    if (conversation.length > this.maxMessages) {
      conversation.splice(0, conversation.length - this.maxMessages);
    }
    
    this.conversations.set(sessionId, conversation);
  }

  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  // Extract parameters from conversation history
  extractParametersFromHistory(sessionId: string): { cabine?: number; ligne?: string; poste?: string } {
    const conversation = this.getConversation(sessionId);
    const params: { cabine?: number; ligne?: string; poste?: string } = {};
    
    // Look through recent messages for parameter mentions
    for (const message of conversation.slice(-10)) { // Check last 10 messages
      const content = message.content.toLowerCase();
      
      // Extract cabine
      const cabineMatch = content.match(/cabine[:\s]*(\d+)/);
      if (cabineMatch && !params.cabine) {
        params.cabine = parseInt(cabineMatch[1]);
      }
      
      // Extract ligne
      const ligneMatch = content.match(/ligne[:\s]*([a-z]\d+)/i);
      if (ligneMatch && !params.ligne) {
        params.ligne = ligneMatch[1].toUpperCase();
      }
      
      // Extract poste
      const posteMatch = content.match(/poste[:\s]*([a-z]\d+)/i);
      if (posteMatch && !params.poste) {
        params.poste = posteMatch[1].toLowerCase();
      }
    }
    
    return params;
  }
}

// Global memory instance
const conversationMemory = new ConversationMemory();

// Simple agent implementation using direct LLM calls with memory
export const chatWithAgent = async (
  message: string, 
  retrieverName: string, 
  ollamaBaseUrl: string = "http://localhost:11434",
  sessionId: string = "default"
): Promise<AgentResponse> => {
  try {
    // Add user message to memory
    conversationMemory.addMessage(sessionId, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Initialize Ollama LLM
    const llm = new ChatOllama({
      baseUrl: ollamaBaseUrl,
      model: "mistral",
      temperature: 0.1,
    });

    // Get workstation fields from localStorage
    const workstationFields = workstationService.getWorkstationFields();
    
    // System prompt for the agent with workstation context
    const systemPrompt = `Tu es un assistant spécialisé dans la recherche d’informations au sein d’une base documentaire.

Langue : Réponds toujours en français, même si les documents ou la question sont dans une autre langue.

Style : Fournis des réponses précises, claires et synthétiques. Si nécessaire, propose aussi un résumé concis.

Exactitude : Base-toi uniquement sur le contenu disponible dans la base documentaire. Si une information ne figure pas dans les documents, indique-le explicitement au lieu d’inventer.

Complétude : Si la question de l’utilisateur est ambiguë, trop générale ou manque de contexte, demande systématiquement les précisions nécessaires avant de répondre.

Transparence : Lorsque cela est utile, cite ou référence brièvement les passages de documents qui appuient ta réponse.
Réponds avec "SEARCH:" suivi d'un JSON avec le paramètre query qui résume la requête de l'utilisateur.
Exemple: SEARCH:{"query": "procédures de sécurité"}

`;

    // Get conversation history for context
    const conversation = conversationMemory.getConversation(sessionId);
    const recentMessages = conversation.slice(-6); // Last 6 messages for context

    // Build messages array with history
    const messages = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];
    const cabine = parseInt(workstationFields.cabine)
    const ligne = workstationFields.ligne
    const poste = workstationFields.poste
    // Call the LLM to analyze the user's message with context
    const response = await llm.invoke(messages);

    const responseText = response.content as string;
    console.log("responseText",responseText)
    // Check if the response indicates we should search
    if (responseText.trim().startsWith("SEARCH:")) {
      const jsonPart = responseText.substring(8).trim();
      console.log("step by step")
      try {
        console.log(jsonPart)
        const searchParams = JSON.parse(jsonPart);
        const { query} = searchParams;

        console.log(searchParams)
        // Validate parameters
        if (!query || !cabine || !ligne || !poste) {
          return {
            output: "Erreur: Paramètres manquants pour la recherche. Je dois avoir la requête, la cabine, la ligne et le poste."
          };
        }
        console.log("calling !")

        // Perform the search
        const searchResult = await searchPagesWithRetriever(retrieverName, query, cabine, ligne, poste);
        console.log(searchResult)
        if (searchResult.error) {
          return {
            output: `Erreur lors de la recherche: ${searchResult.error}`
          };
        }
        
        if (!searchResult.pages || searchResult.pages.length === 0) {
          return {
            output: `Aucun document trouvé pour la requête "${query}" avec cabine: ${cabine}, ligne: ${ligne}, poste: ${poste}`
          };
        }

        // Format the results
        const formattedResults = searchResult.pages.map((chunk: Chunk, index: number) => 
          `**Document ${index + 1}:**\n${chunk.text}\n*(Confiance: ${chunk.confidence})*`
        ).join('\n\n---\n\n');
        
        const finalResponse = `J'ai trouvé ${searchResult.pages.length} document(s) pertinent(s) pour votre recherche.`;

        // Add assistant response to memory
        conversationMemory.addMessage(sessionId, {
          role: 'assistant',
          content: finalResponse,
          timestamp: new Date()
        });

        return {
          output: finalResponse,
          chunks: searchResult.pages, // Include raw chunks for Sources component
          intermediateSteps: [{
            action: { tool: "search_documents", input: searchParams },
            observation: `Found ${searchResult.pages.length} documents`
          }]
        };

      } catch (parseError) {
        console.error("Error parsing JSON from LLM response:", parseError);

        return {
          output: "Erreur lors de l'analyse des paramètres de recherche. Veuillez reformuler votre demande."
        };
      }
    } else {
      // Add assistant response to memory
      conversationMemory.addMessage(sessionId, {
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      });

      // Return the LLM's response asking for missing parameters
      return {
        output: responseText
      };
    }

  } catch (error) {
    throw new Error(`Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
