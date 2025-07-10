import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { Documents } from './components/documents';
import { AlertProvider, useAlert } from './contexts/AlertContext';
import AlertSuccess from './components/messages/AlertSuccess';
import AlertError from './components/messages/AlertError';
import { RetrieverProvider, useRetriever } from './contexts/RetrieverContext';
import { fetchRetrievers, getDocumentsFromRetriever } from './services/rag';
import { Retriever } from './common/interfaces';
import './App.css';

import { Chat } from './components/chat';
import { PdfViewer } from './components/pdfviewer';
import { PdfViewerProvider, usePdfViewer } from './contexts/PdfViewerContext';

const AppContent: React.FC = () => {
  const { successMessage, errorMessage, setSuccessMessage, setErrorMessage } = useAlert();
  const { retrievers, setRetrievers, selectedRetriever, setSelectedRetriever, setDocuments } = useRetriever();
  const { pdfUrl, setPdfUrl } = usePdfViewer();
  
  // Sidebar state management
  const [leftSidebarVisible, setLeftSidebarVisible] = useState<boolean>(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState<boolean>(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(350);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);

  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);

  // Load sidebar preferences from localStorage
  useEffect(() => {
    const savedLeftVisible = localStorage.getItem('leftSidebarVisible');
    const savedRightVisible = localStorage.getItem('rightSidebarVisible');
    const savedLeftWidth = localStorage.getItem('leftSidebarWidth');
    const savedRightWidth = localStorage.getItem('rightSidebarWidth');

    if (savedLeftVisible !== null) setLeftSidebarVisible(JSON.parse(savedLeftVisible));
    if (savedRightVisible !== null) setRightSidebarVisible(JSON.parse(savedRightVisible));
    if (savedLeftWidth) setLeftSidebarWidth(parseInt(savedLeftWidth));
    if (savedRightWidth) setRightSidebarWidth(parseInt(savedRightWidth));
  }, []);

  // Save sidebar preferences to localStorage
  useEffect(() => {
    localStorage.setItem('leftSidebarVisible', JSON.stringify(leftSidebarVisible));
    localStorage.setItem('rightSidebarVisible', JSON.stringify(rightSidebarVisible));
    localStorage.setItem('leftSidebarWidth', leftSidebarWidth.toString());
    localStorage.setItem('rightSidebarWidth', rightSidebarWidth.toString());
  }, [leftSidebarVisible, rightSidebarVisible, leftSidebarWidth, rightSidebarWidth]);

  // Toggle functions
  const toggleLeftSidebar = () => setLeftSidebarVisible(!leftSidebarVisible);
  const toggleRightSidebar = () => setRightSidebarVisible(!rightSidebarVisible);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setLeftSidebarVisible(prev => !prev);
            break;
          case '2':
            e.preventDefault();
            setRightSidebarVisible(prev => !prev);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag functionality with useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragSide) return;

    const containerRect = document.querySelector('.app-layout')?.getBoundingClientRect();
    if (!containerRect) return;

    if (dragSide === 'left') {
      const newWidth = Math.max(200, Math.min(500, e.clientX - containerRect.left));
      setLeftSidebarWidth(newWidth);
    } else if (dragSide === 'right') {
      const newWidth = Math.max(200, Math.min(500, containerRect.right - e.clientX));
      setRightSidebarWidth(newWidth);
    }
  }, [isDragging, dragSide]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragSide(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragSide(side);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const loadRetrievers = async () => {
      try {
        const { retrievers } = await fetchRetrievers();
        setRetrievers(retrievers);
        if (retrievers.length > 0) {
          setSelectedRetriever(retrievers[0]);
        }
      } catch (error) {
        setErrorMessage('Failed to fetch retrievers.');
      }
    };

    loadRetrievers();
  }, []);

  useEffect(() => {
    if (selectedRetriever) {
      const loadDocuments = async () => {
        try {
          const { documents } = await getDocumentsFromRetriever(selectedRetriever.name);
          setDocuments(documents || []);
        } catch (error) {
          setErrorMessage(`Failed to fetch documents for ${selectedRetriever.name}.`);
        }
      };

      loadDocuments();
    }
  }, [selectedRetriever, setDocuments, setErrorMessage]);


  return (
    <div className="App">
      {/* Topbar with logo and toggle buttons */}
      <div className="topbar">
        <div className="topbar-left">
          <button 
            className="sidebar-toggle-btn"
            onClick={toggleLeftSidebar}
            title="Toggle Documents Sidebar (Ctrl+1)"
          >
            📁
          </button>
          <img 
            src="/logo-chantiers-atlantique.svg" 
            alt="Chantiers de l'Atlantique" 
            className="topbar-logo"
          />
          <Form.Group controlId="formRetriever" className="ms-3">
            <Form.Select onChange={(e) => setSelectedRetriever(retrievers.find(r => r.name === e.target.value) || null)} value={selectedRetriever?.name || ''}>
              {retrievers.map(retriever => (
                <option key={retriever.name} value={retriever.name}>{retriever.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="topbar-right">
          <button 
            className="sidebar-toggle-btn"
            onClick={toggleRightSidebar}
            title="Toggle Answers Sidebar (Ctrl+2)"
          >
            💬
          </button>
        </div>
      </div>
      
      {/* Main layout */}
      <div 
        className={`app-layout ${isDragging ? 'dragging' : ''}`}
        style={{
          '--left-sidebar-width': leftSidebarVisible ? `${leftSidebarWidth}px` : '0px',
          '--right-sidebar-width': rightSidebarVisible ? `${rightSidebarWidth}px` : '0px',
        } as React.CSSProperties}
      >
        {/* Left Sidebar */}
        <div 
          className={`left-sidebar ${leftSidebarVisible ? 'visible' : 'hidden'}`}
          style={{ width: leftSidebarVisible ? leftSidebarWidth : 0 }}
        >
          <Documents />
        </div>

        {/* Left Resize Handle */}
        {leftSidebarVisible && (
          <div 
            className="resize-handle left-resize"
            onMouseDown={handleMouseDown('left')}
            ref={leftResizeRef}
          />
        )}

        {/* Main Content */}
        <div className="main-content">
          <header className="App-header">
            <AlertSuccess message={successMessage} onClose={() => setSuccessMessage('')} />
            <AlertError message={errorMessage} onClose={() => setErrorMessage('')} />
          </header>
          <PdfViewer pdfUrl={pdfUrl} />
        </div>

        {/* Right Resize Handle */}
        {rightSidebarVisible && (
          <div 
            className="resize-handle right-resize"
            onMouseDown={handleMouseDown('right')}
            ref={rightResizeRef}
          />
        )}

        {/* Right Sidebar */}
        <div 
          className={`right-sidebar ${rightSidebarVisible ? 'visible' : 'hidden'}`}
          style={{ width: rightSidebarVisible ? rightSidebarWidth : 0 }}
        >
          <Chat />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <RetrieverProvider>
    <AlertProvider>
      <PdfViewerProvider>
        <AppContent />
      </PdfViewerProvider>
    </AlertProvider>
  </RetrieverProvider>
);

export default App;
