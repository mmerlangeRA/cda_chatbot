import axios from 'axios';

const ovhUrl = process.env.REACT_APP_OVH_URL;
const ovhModel = process.env.REACT_APP_OVH_MODEL;
const ovhKey=process.env.REACT_APP_OVH_KEY;

const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer "+ovhKey,
}

export const callOVH = async (messages: { role: string; content: string }[]): Promise<string> => {
  if (!ovhUrl) {
    throw new Error('OVH URL is not configured. Please check your .env file (REACT_APP_OVH_URL).');
  }
  if (!ovhModel) {
    throw new Error('OVH model is not configured. Please check your .env file (REACT_APP_OVH_MODEL).');
  }

  try {

    const response = await axios.post(ovhUrl, {
      model: ovhModel,
      messages: messages,
      stream: false,
    },{
        headers: headers
    });
    return response.data.message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error calling OVH API:', error.response?.data || error.message);
      throw new Error(`Failed to get response from OVH: ${error.response?.data?.error || error.message}`);
    } else {
      console.error('Unexpected error calling OVH API:', error);
      throw new Error('An unexpected error occurred while calling OVH.');
    }
  }
};
