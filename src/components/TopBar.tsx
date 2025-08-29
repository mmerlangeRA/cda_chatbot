import React from 'react';
import { Form } from 'react-bootstrap';
import { Retriever } from '../common/interfaces';
import { WorkstationFields } from '../services/localStorage';

interface TopBarProps {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  retrievers: Retriever[];
  selectedRetriever: Retriever | null;
  setSelectedRetriever: (retriever: Retriever | null) => void;
  workstationFields: WorkstationFields;
  onWorkstationFieldChange: (field: keyof WorkstationFields, value: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  leftSidebarVisible,
  rightSidebarVisible,
  toggleLeftSidebar,
  toggleRightSidebar,
  retrievers,
  selectedRetriever,
  setSelectedRetriever,
  workstationFields,
  onWorkstationFieldChange
}) => {
  return (
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
          <Form.Select 
            onChange={(e) => setSelectedRetriever(retrievers.find(r => r.name === e.target.value) || null)} 
            value={selectedRetriever?.name || ''}
          >
            {retrievers.map(retriever => (
              <option key={retriever.name} value={retriever.name}>{retriever.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      
      {/* Workstation Fields */}
      <div className="topbar-center d-flex align-items-center">
        <span className="me-2 small text-muted">Poste de travail:</span>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="text"
            size="sm"
            placeholder="Cabine"
            value={workstationFields.cabine}
            onChange={(e) => onWorkstationFieldChange('cabine', e.target.value)}
            style={{ width: '70px' }}
            title="Cabine"
          />
          <span className="text-muted">-</span>
          <Form.Control
            type="text"
            size="sm"
            placeholder="Ligne"
            value={workstationFields.ligne}
            onChange={(e) => onWorkstationFieldChange('ligne', e.target.value)}
            style={{ width: '70px' }}
            title="Ligne"
          />
          <span className="text-muted">-</span>
          <Form.Control
            type="text"
            size="sm"
            placeholder="Poste"
            value={workstationFields.poste}
            onChange={(e) => onWorkstationFieldChange('poste', e.target.value)}
            style={{ width: '70px' }}
            title="Poste"
          />
        </div>
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
  );
};

export default TopBar;
