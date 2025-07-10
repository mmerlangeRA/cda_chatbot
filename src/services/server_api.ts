import axios from "axios";

const documentServerUrl = process.env.REACT_APP_DOCUMENT_SERVER_URL || '';
const apiUrl =  (documentServerUrl.endsWith('/') ? documentServerUrl.slice(0, -1) : documentServerUrl) + '/api'

const api = axios.create({
  baseURL:apiUrl,
  headers: {
    "Content-Type": "application/json",
  }
});

export default api;