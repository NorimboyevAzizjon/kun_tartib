import React, { useState, useMemo } from 'react';
import { 
  format, 
  parseISO, 
  isToday, 
  isTomorrow, 
  isPast, 
  addHours,
  differenceInHours
} from 'date-fns';
import { uz } from 'date-fns/locale';
import './TaskList.css';

const TaskList = ({ 
  tasks = [], 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  showDate = false,
  onTaskSelect 
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      if (filter === 'urgent') {
        const taskDateTime = new Date(`${task.date}T${task.time}`);
        return !task.completed && isUrgent(taskDateTime);
      }
      if (filter === 'today') {
        const taskDate = new Date(task.date);
        return isToday(taskDate);
      }
      return true;
    });

    return filtered;
  }, [tasks, filter, searchQuery]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}`);
      const bDate = new Date(`${b.date}T${b.time}`);
      
      switch (sortBy) {
        case 'time':
          return a.time.localeCompare(b.time);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'date':
          return aDate - bDate;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'urgency':
          return isUrgent(bDate) - isUrgent(aDate);
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);

  // Helper functions
  const isUrgent = (date) => {
    const now = new Date();
    const hoursDiff = differenceInHours(date, now);
    return !isPast(date) && hoursDiff < 4;
  };

  const getStatusIcon = (task) => {
    if (task.completed) return { icon: '✅', label: 'Bajarilgan' };
    
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const hoursDiff = differenceInHours(taskDateTime, new Date());
    
    if (isPast(taskDateTime)) return { icon: '⚠️', label: 'Muddati o\'tgan' };
    if (hoursDiff < 2) return { icon: '🔥', label: 'Shoshilinch (2 soat)' };
    if (hoursDiff < 4) return { icon: '⚡', label: 'Juda muhim' };
    if (isToday(taskDateTime)) return { icon: '📌', label: 'Bugun' };
    if (isTomorrow(taskDateTime)) return { icon: '⏳', label: 'Ertaga' };
    return { icon: '📅', label: 'Kelgusi' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#94a3b8';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      work: { icon: '💼', label: 'Ish' },
      study: { icon: '📚', label: 'O\'qish' },
      home: { icon: '🏠', label: 'Uy' },
      personal: { icon: '👤', label: 'Shaxsiy' },
      health: { icon: '🏃', label: 'Sog\'lom' }
    };
    return icons[category] || { icon: '📝', label: 'Boshqa' };
  };

  const formatDateDisplay = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Bugun';
      if (isTomorrow(date)) return 'Ertaga';
      return format(date, 'dd MMM', { locale: uz });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (task) => {
    return format(parseISO(`${task.date}T${task.time}`), 'd MMMM, HH:mm', { locale: uz });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(selectedTask?.id === task.id ? null : task);
    if (onTaskSelect) onTaskSelect(task);
  };

  const handleCompleteToggle = (e, taskId) => {
    e.stopPropagation();
    if (onToggleComplete) onToggleComplete(taskId);
  };

  const handleDelete = (e, taskId) => {
    e.stopPropagation();
    if (onDelete) onDelete(taskId);
  };

  const handleEdit = (e, taskId, task) => {
    e.stopPropagation();
    if (onEdit) onEdit(taskId, task);
  };

  // Task completion percentage
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  // Today's tasks
  const todayTasks = tasks.filter(task => isToday(new Date(task.date)));

  return (
    <div className="task-list-container glass-effect">
      {/* Header Section */}
      <div className="task-list-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <span className="header-icon">📋</span>
          </div>
          <div className="header-text">
            <h3>Vazifalar Ro'yxati</h3>
            <p className="header-subtitle">
              {tasks.length} ta vazifa • {completionRate}% bajarildi
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Vazifa qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => {
            const category = getCategoryIcon(task.category);
            const isSelected = selectedTask?.id === task.id;
            const isUrgentTask = isUrgent(new Date(`${task.date}T${task.time}`)) && !task.completed;

            return (
              <div 
                key={task.id} 
                className={`task-card card-hover ${task.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''} ${task.priority} ${isUrgentTask ? 'urgent' : ''}`}
                onClick={() => handleTaskClick(task)}
                style={{ 
                  '--priority-color': getPriorityColor(task.priority),
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                }}
              >
                {/* Main Content Row */}
                <div className="task-main-row">
                  {/* Checkbox */}
                  <button 
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={(e) => handleCompleteToggle(e, task.id)}
                    title={task.completed ? 'Bekor qilish' : 'Bajarildi deb belgilash'}
                  >
                    {task.completed && <span className="check-mark">✓</span>}
                  </button>

                  {/* Task Info */}
                  <div className="task-info">
                    <div className="task-title-row">
                      <h4 className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                        {task.title}
                      </h4>
                      {isUrgentTask && <span className="urgent-badge">⚠️ SHOSHILINCH</span>}
                    </div>
                    
                    {/* Meta info */}
                    <div className="task-meta-row">
                      <span className="meta-item">
                        <span className="meta-icon">⏰</span>
                        {task.time}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {formatDateDisplay(task.date)}
                      </span>
                      <span className="meta-item category">
                        <span className="meta-icon">{category.icon}</span>
                        {category.label}
                      </span>
                      <span 
                        className="priority-tag"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority === 'high' && 'Yuqori'}
                        {task.priority === 'medium' && 'O\'rta'}
                        {task.priority === 'low' && 'Past'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    {onEdit && (
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => handleEdit(e, task.id, task)}
                        title="Tahrirlash"
                      >
                        ✏️ Tahrirlash
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => handleDelete(e, task.id)}
                      title="O'chirish"
                    >
                      🗑️ O'chirish
                    </button>
                  </div>
                </div>

                {/* Description if exists */}
                {task.description && (
                  <div className="task-description">
                    <span className="desc-icon">📄</span>
                    <span className="desc-text">{task.description}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-tasks fade-in">
            <div className="empty-icon">📝</div>
            <div className="empty-content">
              <h3>Vazifalar topilmadi</h3>
              <p>
                {searchQuery 
                  ? `"${searchQuery}" so'zi bo'yicha vazifa topilmadi`
                  : filter === 'completed' 
                  ? 'Hozircha bajarilgan vazifa yo\'q'
                  : filter === 'pending'
                  ? 'Barcha vazifalar bajarilgan! 🎉'
                  : filter === 'urgent'
                  ? 'Shoshilinch vazifalar yo\'q'
                  : 'Hozircha vazifalar yo\'q'
                }
              </p>
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  🔍 Qidiruvni tozalash
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {sortedTasks.length > 0 && (
        <div className="task-summary-footer">
          <div className="summary-item">
            <span className="summary-label">Ko'rsatilmoqda:</span>
            <span className="summary-value">{sortedTasks.length} ta</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Bugungi:</span>
            <span className="summary-value">
              {todayTasks.filter(t => !t.completed).length} ta qoldi
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Umumiy progress:</span>
            <div className="progress-wrapper">
              <div className="summary-progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="summary-percentage">{completionRate}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;