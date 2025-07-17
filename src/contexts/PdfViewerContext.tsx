import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PdfViewerContextType {
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  targetPage: number | null;
  setTargetPage: (page: number | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  numPages: number | null;
  setNumPages: (numPages: number | null) => void;
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  scale: number;
  setScale: (scale: number) => void;
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
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showOutline, setShowOutline] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);

  return (
    <PdfViewerContext.Provider value={{ 
      pdfUrl, 
      setPdfUrl,
      targetPage,
      setTargetPage,
      currentPage,
      setCurrentPage,
      numPages,
      setNumPages,
      showOutline,
      setShowOutline,
      scale,
      setScale
    }}>
      {children}
    </PdfViewerContext.Provider>
  );
};
