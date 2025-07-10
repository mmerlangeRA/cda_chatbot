import axios from 'axios';

const ollamaUrl = process.env.REACT_APP_OLLAMA_URL;
const ollamaModel = process.env.REACT_APP_OLLAMA_MODEL;

export const callOllama = async (prompt: string): Promise<string> => {
  if (!ollamaUrl) {
    throw new Error('Ollama URL is not configured. Please check your .env file (REACT_APP_OLLAMA_URL).');
  }
  if (!ollamaModel) {
    throw new Error('Ollama model is not configured. Please check your .env file (REACT_APP_OLLAMA_MODEL).');
  }

  try {
    const baseUrl = ollamaUrl.endsWith('/') ? ollamaUrl.slice(0, -1) : ollamaUrl;
    const response = await axios.post(`${baseUrl}/api/generate`, {
      model: ollamaModel,
      prompt: prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error calling Ollama API:', error.response?.data || error.message);
      throw new Error(`Failed to get response from Ollama: ${error.response?.data?.error || error.message}`);
    } else {
      console.error('Unexpected error calling Ollama API:', error);
      throw new Error('An unexpected error occurred while calling Ollama.');
    }
  }
};
