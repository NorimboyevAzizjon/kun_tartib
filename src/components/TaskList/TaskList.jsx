import React, { useState } from 'react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import './TaskList.css';

const TaskList = ({ tasks, onToggleComplete, onDelete, onEdit, showDate = false }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'time') {
      return a.time.localeCompare(b.time);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'date') {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });

  // Get task status icon
  const getStatusIcon = (task) => {
    if (task.completed) return '✅';
    
    const now = new Date();
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const hoursDiff = (taskDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 0) return '⚠️'; // Overdue
    if (hoursDiff < 2) return '🔥'; // Urgent (within 2 hours)
    if (isToday(taskDateTime)) return '⚡'; // Today
    if (isTomorrow(taskDateTime)) return '⏳'; // Tomorrow
    return '📌'; // Future
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff4444',
      medium: '#ffbb33',
      low: '#00C851'
    };
    return colors[priority] || '#718096';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      work: '💼',
      study: '📚',
      home: '🏠',
      personal: '👤',
      health: '🏃'
    };
    return icons[category] || '📝';
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Bugun';
    if (isTomorrow(date)) return 'Ertaga';
    return format(date, 'dd.MM.yyyy');
  };

  return (
    <div className="task-list-container">
      {/* Filters and Sorting */}
      <div className="task-controls">
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📋 Barchasi ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Kutayotgan ({tasks.filter(t => !t.completed).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            ✅ Bajarilgan ({tasks.filter(t => t.completed).length})
          </button>
        </div>

        <div className="sorting">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="time">⏰ Vaqt bo'yicha</option>
            <option value="priority">🎯 Imtiyoz bo'yicha</option>
            <option value="date">📅 Sana bo'yicha</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="tasks-grid">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div 
              key={task.id} 
              className={`task-card ${task.completed ? 'completed' : ''} ${task.priority}`}
              style={{ borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}
            >
              {/* Status Section */}
              <div className="task-status">
                <button 
                  className="complete-btn"
                  onClick={() => onToggleComplete(task.id)}
                  title={task.completed ? 'Bekor qilish' : 'Bajarildi deb belgilash'}
                >
                  {task.completed ? '✅' : '⭕'}
                </button>
                <span className="status-icon">
                  {getStatusIcon(task)}
                </span>
              </div>

              {/* Task Content */}
              <div className="task-content">
                <div className="task-header">
                  <h4 className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <div className="task-description">
                      {task.description}
                    </div>
                  )}
                </div>

                {/* Task Meta */}
                <div className="task-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏰</span>
                    <span className="meta-text">{task.time}</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">{getCategoryIcon(task.category)}</span>
                    <span className="meta-text">
                      {task.category === 'work' && 'Ish'}
                      {task.category === 'study' && 'O\'qish'}
                      {task.category === 'home' && 'Uy'}
                      {task.category === 'personal' && 'Shaxsiy'}
                      {task.category === 'health' && 'Sog\'lom'}
                    </span>
                  </div>

                  {showDate && (
                    <div className="meta-item">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">{formatDateDisplay(task.date)}</span>
                    </div>
                  )}

                  <div className="meta-item">
                    <span 
                      className="priority-badge"
                      style={{ 
                        background: getPriorityColor(task.priority),
                        color: task.priority === 'high' ? 'white' : '#333'
                      }}
                    >
                      {task.priority === 'high' && '🔴 Yuqori'}
                      {task.priority === 'medium' && '🟡 O\'rta'}
                      {task.priority === 'low' && '🟢 Past'}
                    </span>
                  </div>
                </div>

                {/* Created Time */}
                <div className="task-footer">
                  <span className="created-time">
                    📝 {format(parseISO(task.createdAt || new Date().toISOString()), 'HH:mm')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="task-actions">
                {onEdit && (
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => onEdit(task.id, task)}
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>
                )}
                <button 
                  className="action-btn delete-btn"
                  onClick={() => onDelete(task.id)}
                  title="O'chirish"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-tasks">
            <div className="empty-icon">📝</div>
            <h3>Vazifalar topilmadi</h3>
            <p>
              {filter === 'completed' 
                ? 'Hozircha bajarilgan vazifa yo\'q'
                : filter === 'pending'
                ? 'Barcha vazifalar bajarilgan'
                : 'Hozircha vazifalar yo\'q'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {sortedTasks.length > 0 && (
        <div className="task-summary-footer">
          <div className="summary-item">
            <span className="summary-label">Ko'rsatilmoqda:</span>
            <span className="summary-value">{sortedTasks.length} ta</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Bugungi vazifalar:</span>
            <span className="summary-value">
              {tasks.filter(t => isToday(parseISO(t.date))).length} ta
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Progress:</span>
            <span className="summary-value">
              {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) || 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;