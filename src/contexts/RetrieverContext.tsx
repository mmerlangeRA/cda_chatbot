import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DocumentItem, Retriever } from '../common/interfaces';

interface RetrieverContextType {
  retrievers: Retriever[];
  setRetrievers: (retrievers: Retriever[]) => void;
  selectedRetriever: Retriever | null;
  setSelectedRetriever: (retriever: Retriever | null) => void;
  documents: DocumentItem[];
  setDocuments: (documents: DocumentItem[]) => void;
}

const RetrieverContext = createContext<RetrieverContextType | undefined>(undefined);

export const useRetriever = () => {
  const context = useContext(RetrieverContext);
  if (!context) {
    throw new Error('useRetriever must be used within a RetrieverProvider');
  }
  return context;
};

interface RetrieverProviderProps {
  children: ReactNode;
}

export const RetrieverProvider: React.FC<RetrieverProviderProps> = ({ children }) => {
  const [retrievers, setRetrievers] = useState<Retriever[]>([]);
  const [selectedRetriever, setSelectedRetriever] = useState<Retriever | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  return (
    <RetrieverContext.Provider value={{ retrievers, setRetrievers, selectedRetriever, setSelectedRetriever, documents, setDocuments }}>
      {children}
    </RetrieverContext.Provider>
  );
};
