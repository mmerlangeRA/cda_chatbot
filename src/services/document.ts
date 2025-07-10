
import { DocumentItem } from '../common/interfaces';
import api from './server_api';


export const fetchDocuments = async (): Promise<DocumentItem[]> => {
  const response = await api.get('/documents/detailed/');
  return response.data;
};

export const uploadDocument = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/documents/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}/delete/`);
};
