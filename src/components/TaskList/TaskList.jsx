import React, { useEffect, useRef, useState } from 'react';
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
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subtaskInputs, setSubtaskInputs] = useState({});
  const [activeTimerId, setActiveTimerId] = useState(null);
  const timerRef = useRef(null);
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const handleTaskKeyDown = (e, task) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskClick(task);
    }
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

  const handleSubtaskInputChange = (taskId, value) => {
    setSubtaskInputs(prev => ({ ...prev, [taskId]: value }));
  };

  const handleAddSubtask = (e, task) => {
    e.stopPropagation();
    const input = (subtaskInputs[task.id] || '').trim();
    if (!input) return;
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const newSubtask = {
      id: `${task.id}_sub_${Date.now()}`,
      title: input,
      done: false
    };
    if (onEdit) {
      onEdit(task.id, { subtasks: [...subtasks, newSubtask] });
    }
    setSubtaskInputs(prev => ({ ...prev, [task.id]: '' }));
  };

  const handleToggleSubtask = (e, task, subtaskId) => {
    e.stopPropagation();
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const updated = subtasks.map(st =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );
    if (onEdit) {
      onEdit(task.id, { subtasks: updated });
    }
  };

  const handleRemoveSubtask = (e, task, subtaskId) => {
    e.stopPropagation();
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    const updated = subtasks.filter(st => st.id !== subtaskId);
    if (onEdit) {
      onEdit(task.id, { subtasks: updated });
    }
  };

  const handleToggleTimer = (e, task) => {
    e.stopPropagation();
    if (activeTimerId === task.id) {
      setActiveTimerId(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    setActiveTimerId(task.id);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (onEdit) {
        const latest = tasksRef.current.find(t => t.id === task.id);
        const current = latest?.timeSpent || 0;
        onEdit(task.id, { timeSpent: current + 1 });
      }
    }, 1000);
  };

  // Task completion percentage
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  // Today's tasks
  const todayTasks = tasks.filter(task => isToday(new Date(task.date)));

  const counts = {
    all: tasks.length,
    today: tasks.filter(t => isToday(new Date(t.date)) && !t.completed).length,
    urgent: tasks.filter(t => {
      const dt = new Date(`${t.date}T${t.time}`);
      return !t.completed && isUrgent(dt);
    }).length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

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
          <div className={`search-container ${searchQuery ? 'has-clear' : ''}`}>
            <input
              type="text"
              placeholder="Vazifa qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Qidiruvni tozalash"
                title="Qidiruvni tozalash"
              >
                <ClearOutlinedIcon fontSize="small" />
              </button>
            )}
            <span className="search-icon" aria-hidden="true"><SearchOutlinedIcon fontSize="small" /></span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="task-controls">
        <div className="filters" role="tablist" aria-label="Vazifa filtrlari">
          <button type="button" className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>
            Barchasi <span className="filter-count">{counts.all}</span>
          </button>
          <button type="button" className={`filter-btn ${filter === 'today' ? 'active' : ''}`} onClick={() => setFilter('today')} aria-pressed={filter === 'today'}>
            Bugun <span className="filter-count">{counts.today}</span>
          </button>
          <button type="button" className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`} onClick={() => setFilter('urgent')} aria-pressed={filter === 'urgent'}>
            Shoshilinch <span className="filter-count">{counts.urgent}</span>
          </button>
          <button type="button" className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')} aria-pressed={filter === 'pending'}>
            Kutilmoqda <span className="filter-count">{counts.pending}</span>
          </button>
          <button type="button" className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')} aria-pressed={filter === 'completed'}>
            Bajarilgan <span className="filter-count">{counts.completed}</span>
          </button>
        </div>

        <div className="sorting">
          <span className="sort-label">Saralash:</span>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Saralash turi">
            <option value="time">Vaqt bo'yicha</option>
            <option value="date">Sana bo'yicha</option>
            <option value="priority">Imtiyoz bo'yicha</option>
            <option value="category">Kategoriya bo'yicha</option>
            <option value="urgency">Dolzarblik bo'yicha</option>
          </select>
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
                onKeyDown={(e) => handleTaskKeyDown(e, task)}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
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
                    type="button"
                    aria-label={task.completed ? 'Bekor qilish' : 'Bajarildi deb belgilash'}
                  >
                    {task.completed && <span className="check-mark">✓</span>}
                  </button>

                  {/* Task Info */}
                  <div className="task-info">
                    <div className="task-title-row">
                      <h4 className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                        {task.title}
                      </h4>
                      {isUrgentTask && (
                        <span className="urgent-badge">
                          <WarningAmberOutlinedIcon fontSize="small" /> SHOSHILINCH
                        </span>
                      )}
                    </div>
                    
                    {/* Meta info */}
                    <div className="task-meta-row">
                      <span className="meta-item">
                        <span className="meta-icon" aria-hidden="true"><AccessTimeOutlinedIcon fontSize="small" /></span>
                        {task.time}
                      </span>
                      {typeof task.timeSpent === 'number' && task.timeSpent > 0 && (
                        <span className="meta-item time-spent">
                          <span className="meta-icon" aria-hidden="true">⏱️</span>
                          {Math.floor(task.timeSpent / 60)}m
                        </span>
                      )}
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
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    <button 
                      className={`action-btn timer-btn ${activeTimerId === task.id ? 'active' : ''}`}
                      onClick={(e) => handleToggleTimer(e, task)}
                      title={activeTimerId === task.id ? 'To\'xtatish' : 'Vaqtni boshlash'}
                      type="button"
                      aria-label={activeTimerId === task.id ? 'To\'xtatish' : 'Vaqtni boshlash'}
                    >
                      {activeTimerId === task.id ? '⏸️' : '⏱️'}
                    </button>
                    {onEdit && (
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => handleEdit(e, task.id, task)}
                        title="Tahrirlash"
                        type="button"
                        aria-label="Tahrirlash"
                      >
                        <EditOutlinedIcon fontSize="small" /> 
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => handleDelete(e, task.id)}
                      title="O'chirish"
                      type="button"
                      aria-label="O'chirish"
                    >
                      <DeleteOutlineIcon fontSize="small" /> 
                    </button>
                  </div>
                </div>

                {/* Description if exists */}
                {task.description && (
                  <div className="task-description">
                    <span className="desc-icon" aria-hidden="true"><DescriptionOutlinedIcon fontSize="small" /></span>
                    <span className="desc-text">{task.description}</span>
                  </div>
                )}

                {isSelected && (
                  <div className="task-subtasks">
                    <div className="subtasks-header">
                      <span>Checklist</span>
                      <span className="subtask-count">
                        {(task.subtasks || []).filter(s => s.done).length}/{(task.subtasks || []).length}
                      </span>
                    </div>
                    <div className="subtask-input">
                      <input
                        type="text"
                        placeholder="Subtask qo'shish..."
                        value={subtaskInputs[task.id] || ''}
                        onChange={(e) => handleSubtaskInputChange(task.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubtask(e, task);
                        }}
                      />
                      <button type="button" onClick={(e) => handleAddSubtask(e, task)}>Qo'shish</button>
                    </div>
                    <div className="subtask-list">
                      {(task.subtasks || []).map(subtask => (
                        <div key={subtask.id} className={`subtask-item ${subtask.done ? 'done' : ''}`}>
                          <label>
                            <input
                              type="checkbox"
                              checked={subtask.done}
                              onChange={(e) => handleToggleSubtask(e, task, subtask.id)}
                            />
                            <span>{subtask.title}</span>
                          </label>
                          <button type="button" onClick={(e) => handleRemoveSubtask(e, task, subtask.id)}>✕</button>
                        </div>
                      ))}
                      {(task.subtasks || []).length === 0 && (
                        <div className="subtask-empty">Subtask yo'q</div>
                      )}
                    </div>
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