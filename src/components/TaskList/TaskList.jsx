import React, { useState } from 'react';
import { format } from 'date-fns';
import './TaskList.css';

const TaskList = ({ tasks, onToggleComplete, onDelete }) => {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className="task-list">
      <div className="task-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          Barcha ({tasks.length})
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Kutayotgan ({tasks.filter(t => !t.completed).length})
        </button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
          Bajarilgan ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      <div className="tasks-container">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${task.priority}`}>
            <div className="task-checkbox">
              <input 
                type="checkbox" 
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
              />
            </div>
            
            <div className="task-content">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className="task-time">⏰ {task.time}</span>
                <span className="task-category">🏷️ {task.category}</span>
                <span className="task-date">📅 {format(new Date(task.date), 'dd.MM.yyyy')}</span>
              </div>
            </div>
            
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;