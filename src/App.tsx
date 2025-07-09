import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Button, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { Documents } from './documents';
import './App.css';

interface AnswerItem {
  id: string;
  text: string;
  url: string;
}

const App: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Sidebar state management
  const [leftSidebarVisible, setLeftSidebarVisible] = useState<boolean>(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState<boolean>(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(350);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);

  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);

  const chatbotServerUrl = process.env.REACT_APP_CHATBOT_SERVER_URL;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!chatbotServerUrl) {
      setError('Chatbot server URL is not configured. Please check your .env file.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer([]);

    try {
      const response = await fetch(chatbotServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnswerItem[] = await response.json();
      setAnswer(data);
    } catch (err) {
      console.error('Error fetching answer:', err);
      setError('Failed to fetch answer. Please check the server URL and try again.');
    } finally {
      setLoading(false);
    }
  };


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
            <h1>CDA Chatbot</h1>
            <Form onSubmit={handleSubmit} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Ask'}
              </Button>
            </Form>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </header>
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
          <h2>Answers</h2>
          {loading && <Spinner animation="border" />}
          {!loading && answer.length === 0 && !error && <p>No answers yet. Ask a question!</p>}
          {!loading && answer.length > 0 && (
            <ListGroup>
              {answer.map((item) => (
                <ListGroup.Item key={item.id}>
                  <h5>{item.text}</h5>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
