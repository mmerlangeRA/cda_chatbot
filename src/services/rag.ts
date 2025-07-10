
import { Chunk, DocumentItem, Retriever } from '../common/interfaces';
import api from './server_api';
import { callOllama } from './ollama';


export const fetchRetrievers = async (): Promise<{ retrievers: Retriever[], count: number }> => {
    const response = await api.get('/rag/retrievers/');
    return response.data;
};

export const getDocumentsFromRetriever = async (retriverName: string): Promise<{
    success?: boolean,
    count?: number,
    documents?: DocumentItem[],
    retriever_name?: string,
    error?: string

}> => {
    const response = await api.get(`/rag/${retriverName}/documents/`);
    return response.data;
};

export const addDocumentToRetriever = async (retriverName: string, documentId: number): Promise<{
    success?: boolean,
    message?: string,
    document_id: number,
    retriever_name?: string,
    error?: string

}> => {
    const payload = {
        "document_id": documentId
    }
    const response = await api.post(`/rag/${retriverName}/documents/add/`, payload);
    return response.data;
};

export const removeDocumentFromRetriever = async (retriverName: string, documentId: number): Promise<{
    success?: boolean,
    message?: string,
    document_id: number,
    retriever_name?: string,
    error?: string

}> => {

    const response = await api.delete(`/rag/${retriverName}/documents/${documentId}/`);
    return response.data;
};

export const searchWithRetriever = async (retriverName: string, query: string): Promise<{
    query?: string,
    chunks?: Chunk[],
    total_chunks: number,
    retriever_name?: string,
    error?: string

}> => {
    const payload = {
        "query": query,
        "nb_max_chunks":5
    }
    const response = await api.post(`/rag/${retriverName}/search/`, payload);
    return response.data;
};

export const chatWithMistral = async (query: string): Promise<string> => {
    try {
        const response = await callOllama(query);
        return response;
    } catch (error: any) {
        throw new Error(error.message);
    }
};