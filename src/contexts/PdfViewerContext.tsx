import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PdfViewerContextType {
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
}

const PdfViewerContext = createContext<PdfViewerContextType | undefined>(undefined);

export const usePdfViewer = () => {
  const context = useContext(PdfViewerContext);
  if (!context) {
    throw new Error('usePdfViewer must be used within a PdfViewerProvider');
  }
  return context;
};

interface PdfViewerProviderProps {
  children: ReactNode;
}

export const PdfViewerProvider: React.FC<PdfViewerProviderProps> = ({ children }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  return (
    <PdfViewerContext.Provider value={{ pdfUrl, setPdfUrl }}>
      {children}
    </PdfViewerContext.Provider>
  );
};
