import React from 'react';
import './TaskSummary.css';

const TaskSummary = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const categories = {
    work: tasks.filter(t => t.category === 'work').length,
    study: tasks.filter(t => t.category === 'study').length,
    home: tasks.filter(t => t.category === 'home').length,
    personal: tasks.filter(t => t.category === 'personal').length,
    health: tasks.filter(t => t.category === 'health').length
  };

  return (
    <div className="task-summary">
      <h3>📊 Vazifalar Statistikasi</h3>
      
      <div className="summary-item">
        <div className="summary-label">Jami vazifalar:</div>
        <div className="summary-value">{total}</div>
      </div>
      
      <div className="summary-item">
        <div className="summary-label">Bajarilgan:</div>
        <div className="summary-value success">{completed}</div>
      </div>
      
      <div className="summary-item">
        <div className="summary-label">Kutayotgan:</div>
        <div className="summary-value warning">{pending}</div>
      </div>
      
      <div className="progress-container">
        <div className="progress-label">Umumiy progress:</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionRate}%` }}
          >
            {completionRate}%
          </div>
        </div>
      </div>
      
      <div className="categories-section">
        <h4>Kategoriyalar:</h4>
        {Object.entries(categories).map(([key, value]) => (
          <div key={key} className="category-item">
            <span className="category-name">{key}</span>
            <span className="category-count">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskSummary;