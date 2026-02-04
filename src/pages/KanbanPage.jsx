import React from 'react';
import KanbanBoard from '../components/KanbanBoard/KanbanBoard';
import './KanbanPage.css';

// MUI Icons
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

const KanbanPage = () => {
  return (
    <div className="kanban-page">
      <div className="page-header">
        <div className="header-content">
          <ViewKanbanIcon className="header-icon" />
          <div>
            <h1>Kanban Board</h1>
            <p>Vazifalarni Trello uslubida boshqaring</p>
          </div>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
};

export default KanbanPage;
