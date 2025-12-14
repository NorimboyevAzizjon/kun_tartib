import React, { useState } from 'react';
import { 
  format, 
  parseISO, 
  isToday, 
  isTomorrow, 
  isPast,
  differenceInHours
} from 'date-fns';
import { uz } from 'date-fns/locale';
import './TaskList.css';

// MUI Icons
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

const TaskList = ({ 
  tasks = [], 
  onToggleComplete, 
  onDelete, 
  onEdit,
  onTaskSelect 
}) => {
  const [filter] = useState('all');
  const [sortBy] = useState('time');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function
  const isUrgent = (date) => {
    const now = new Date();
    const hoursDiff = differenceInHours(date, now);
    return !isPast(date) && hoursDiff < 4;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
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

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time}`);
    const bDate = new Date(`${b.date}T${b.time}`);
    
    switch (sortBy) {
      case 'time':
        return a.time.localeCompare(b.time);
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
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

  // Other helper functions
  const _getStatusIcon = (task) => {
    if (task.completed) return { icon: <CheckCircleOutlineIcon fontSize="small" />, label: 'Bajarilgan' };
    
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const hoursDiff = differenceInHours(taskDateTime, new Date());
    
    if (isPast(taskDateTime)) return { icon: <WarningAmberOutlinedIcon fontSize="small" />, label: 'Muddati o\'tgan' };
    if (hoursDiff < 2) return { icon: <LocalFireDepartmentOutlinedIcon fontSize="small" />, label: 'Shoshilinch (2 soat)' };
    if (hoursDiff < 4) return { icon: <BoltOutlinedIcon fontSize="small" />, label: 'Juda muhim' };
    if (isToday(taskDateTime)) return { icon: <TodayOutlinedIcon fontSize="small" />, label: 'Bugun' };
    if (isTomorrow(taskDateTime)) return { icon: <HourglassBottomOutlinedIcon fontSize="small" />, label: 'Ertaga' };
    return { icon: <DateRangeOutlinedIcon fontSize="small" />, label: 'Kelgusi' };
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
      work: { icon: <WorkOutlineIcon fontSize="small" />, label: 'Ish' },
      study: { icon: <SchoolOutlinedIcon fontSize="small" />, label: 'O\'qish' },
      home: { icon: <HomeOutlinedIcon fontSize="small" />, label: 'Uy' },
      personal: { icon: <PersonOutlinedIcon fontSize="small" />, label: 'Shaxsiy' },
      health: { icon: <FitnessCenterOutlinedIcon fontSize="small" />, label: 'Sog\'lom' }
    };
    return icons[category] || { icon: <NotesOutlinedIcon fontSize="small" />, label: 'Boshqa' };
  };

  const formatDateDisplay = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Bugun';
      if (isTomorrow(date)) return 'Ertaga';
      return format(date, 'dd MMM', { locale: uz });
    } catch {
      return dateString;
    }
  };

  const _formatDateTime = (task) => {
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
            <span className="header-icon" aria-hidden="true"><AssignmentOutlinedIcon /></span>
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
            <span className="search-icon" aria-hidden="true"><SearchOutlinedIcon fontSize="small" /></span>
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
                    {/* Kategoriya va task nomi bir qatorda */}
                    <div className="tasklist-header-row">
                      <span className="tasklist-category-label">
                        {category.icon} {category.label}
                      </span>
                    </div>
                    <div className="task-meta-row">
                      <span className="meta-item task-title-badge">{task.title}</span>
                      <span className="meta-item">
                        <span className="meta-icon" aria-hidden="true"><AccessTimeOutlinedIcon fontSize="small" /></span>
                        {task.time}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon" aria-hidden="true"><EventOutlinedIcon fontSize="small" /></span>
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
                    <div className="task-actions">
                      {onEdit && (
                        <button 
                          className="action-btn edit-btn"
                          onClick={(e) => handleEdit(e, task.id, task)}
                          title="Tahrirlash"
                        >
                          <EditOutlinedIcon fontSize="small" /> 
                        </button>
                      )}
                      <button 
                        className="action-btn delete-btn"
                        onClick={(e) => handleDelete(e, task.id)}
                        title="O'chirish"
                      >
                        <DeleteOutlineIcon fontSize="small" /> 
                      </button>
                    </div>
                  </div>

                  {/* Actions removed: duplicate */}
                </div>

                {/* Description if exists */}
                {task.description && (
                  <div className="task-description">
                    <span className="desc-icon" aria-hidden="true"><DescriptionOutlinedIcon fontSize="small" /></span>
                    <span className="desc-text">{task.description}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-tasks fade-in">
            <div className="empty-icon" aria-hidden="true"><NotesOutlinedIcon /></div>
            <div className="empty-content">
              <h3>Vazifalar topilmadi</h3>
              <p>
                {searchQuery 
                  ? `"${searchQuery}" so'zi bo'yicha vazifa topilmadi`
                  : filter === 'completed' 
                  ? 'Hozircha bajarilgan vazifa yo\'q'
                  : filter === 'pending'
                  ? 'Barcha vazifalar bajarilgan!'
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
                  <ClearOutlinedIcon fontSize="small" /> Qidiruvni tozalash
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