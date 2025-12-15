import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, addMinutes } from 'date-fns';
import { uz } from 'date-fns/locale';
import './AddTask.css';

// MUI Icons
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';

const AddTask = ({ onAddTask }) => {
  const [task, setTask] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    category: 'work',
    priority: 'medium',
    description: '',
    reminder: false,
    reminderTime: 10
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'work', label: 'Ish', icon: <WorkOutlineIcon fontSize="small" />, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
    { value: 'study', label: 'O\'qish', icon: <SchoolOutlinedIcon fontSize="small" />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'home', label: 'Uy', icon: <HomeOutlinedIcon fontSize="small" />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { value: 'personal', label: 'Shaxsiy', icon: <PersonOutlinedIcon fontSize="small" />, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
    { value: 'health', label: 'Sog\'lom', icon: <FitnessCenterOutlinedIcon fontSize="small" />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' }
  ];

  const priorities = [
    { value: 'low', label: 'Past', icon: <ArrowDownwardOutlinedIcon fontSize="small" />, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { value: 'medium', label: 'O\'rta', icon: <RemoveOutlinedIcon fontSize="small" />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    { value: 'high', label: 'Yuqori', icon: <ArrowUpwardOutlinedIcon fontSize="small" />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
  ];

  const reminderOptions = [
    { value: 5, label: '5 daqiqa oldin' },
    { value: 10, label: '10 daqiqa oldin' },
    { value: 30, label: '30 daqiqa oldin' },
    { value: 60, label: '1 soat oldin' },
    { value: 1440, label: '1 kun oldin' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!task.title.trim()) newErrors.title = 'Vazifa nomini kiriting';
    if (task.title.length > 100) newErrors.title = 'Nom 100 belgidan oshmasligi kerak';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dateTime = new Date(`${task.date}T${task.time}`);
    const reminderDateTime = task.reminder 
      ? addMinutes(dateTime, -task.reminderTime)
      : null;

    const newTask = {
      id: `task_${uuidv4()}`,
      title: task.title.trim(),
      date: task.date,
      time: task.time,
      category: task.category,
      priority: task.priority,
      description: task.description.trim(),
      reminder: task.reminder,
      reminderTime: task.reminder ? task.reminderTime : null,
      reminderDateTime: reminderDateTime,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddTask(newTask);
    
    // Reset form with animation
    setTimeout(() => {
      setTask({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: 'work',
        priority: 'medium',
        description: '',
        reminder: false,
        reminderTime: 10
      });
      setErrors({});
    }, 300);
  };

  const _handleQuickAdd = (type) => {
    const quickTasks = {
      meeting: { title: 'Korxona yig\'ilishi', category: 'work', priority: 'high' },
      study: { title: 'Dars tayyorlash', category: 'study', priority: 'medium' },
      workout: { title: 'Sport mashg\'uloti', category: 'health', priority: 'low' },
      shopping: { title: 'Bozorlik qilish', category: 'home', priority: 'low' }
    };

    const selected = quickTasks[type];
    const nextHour = format(addMinutes(new Date(), 60), 'HH:mm');

    setTask({
      ...task,
      title: selected.title,
      category: selected.category,
      priority: selected.priority,
      time: type === 'workout' ? '18:00' : nextHour
    });
  };

  // Eslatma yoqilganda bildirishnoma ruxsatini so'rash
  const handleReminderToggle = async (checked) => {
    if (checked) {
      // Brauzer bildirishnomalarini tekshirish
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setTask({ ...task, reminder: true });
            localStorage.setItem('notifications-enabled', 'true');
          } else {
            alert('Eslatmalar ishlashi uchun bildirishnomalariga ruxsat bering!');
            setTask({ ...task, reminder: false });
          }
        } else if (Notification.permission === 'granted') {
          setTask({ ...task, reminder: true });
        } else {
          alert('Bildirishnomalar bloklangan. Brauzer sozlamalaridan yoqing.');
          setTask({ ...task, reminder: false });
        }
      } else {
        alert('Brauzeringiz bildirishnomalarni qo\'llab-quvvatlamaydi');
        setTask({ ...task, reminder: false });
      }
    } else {
      setTask({ ...task, reminder: false });
    }
  };

  const handleCategorySelect = (category) => {
    setTask({ ...task, category });
  };

  const handlePrioritySelect = (priority) => {
    setTask({ ...task, priority });
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.value === task.category);
  };

  const getCurrentPriority = () => {
    return priorities.find(prio => prio.value === task.priority);
  };

  return (
    <div className="add-task-container glass-effect expanded">
      <div className="add-task-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
                <span className="header-icon" aria-hidden="true"><AutoAwesomeOutlinedIcon /></span>
          </div>
          <div className="header-text">
            <h3>Yangi Vazifa Qo'shish</h3>
            <p className="header-subtitle">Kunningizni rejalashtiring</p>
            {getCurrentCategory() && (
              <div className="selected-category-header">
                <span className="category-icon">{getCurrentCategory().icon}</span>
                <span className="category-label" style={{color: getCurrentCategory().color}}>
                  {getCurrentCategory().label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

        <form className="add-task-form" onSubmit={handleSubmit}>
          {/* Task Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <TitleOutlinedIcon className="label-icon-svg" />
              Vazifa nomi
              <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Masalan: React dasturini yakunlash..."
              value={task.title}
              onChange={(e) => {
                setTask({...task, title: e.target.value});
                if (errors.title) setErrors({...errors, title: ''});
              }}
              className={`task-input ${errors.title ? 'error' : ''}`}
              maxLength={100}
              autoFocus
            />
            {errors.title && (
              <div className="error-message">{errors.title}</div>
            )}
            <div className="char-count">
              {task.title.length}/100
            </div>
          </div>

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <CalendarTodayOutlinedIcon className="label-icon-svg" />
                Sana
              </label>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={task.date}
                  onChange={(e) => setTask({...task, date: e.target.value})}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="date-input"
                />
                <div className="date-hint">
                  Bugun: {format(new Date(), 'dd MMMM, yyyy', { locale: uz })}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <AccessTimeOutlinedIcon className="label-icon-svg" />
                Vaqt
              </label>
              <input
                type="time"
                value={task.time}
                onChange={(e) => setTask({...task, time: e.target.value})}
                className="time-input"
                step="300" // 5 minute intervals
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label className="form-label">
              <CategoryOutlinedIcon className="label-icon-svg" />
              Kategoriya
            </label>
            <div className="category-selector">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${task.category === cat.value ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.value)}
                  style={{ 
                    '--category-color': cat.color,
                    '--category-bg': cat.bgColor
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
            {getCurrentCategory() && (
              <div className="current-selection">
                Tanlangan: <span style={{ color: getCurrentCategory().color }}>
                  {getCurrentCategory().label}
                </span>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label className="form-label">
              <PriorityHighOutlinedIcon className="label-icon-svg" />
              Imtiyoz
            </label>
            <div className="priority-selector">
              {priorities.map((prio) => (
                <button
                  key={prio.value}
                  type="button"
                  className={`priority-btn ${task.priority === prio.value ? 'active' : ''}`}
                  onClick={() => handlePrioritySelect(prio.value)}
                  style={{ 
                    '--priority-color': prio.color,
                    '--priority-bg': prio.bgColor
                  }}
                >
                  <span className="priority-icon">{prio.icon}</span>
                  <span className="priority-label">{prio.label}</span>
                </button>
              ))}
            </div>
            {getCurrentPriority() && (
              <div className="current-selection">
                Darajasi: <span style={{ color: getCurrentPriority().color }}>
                  {getCurrentPriority().label}
                </span>
              </div>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="form-group reminder-section">
            <div className="reminder-header">
              <label className="reminder-label">
                <input
                  type="checkbox"
                  checked={task.reminder}
                  onChange={(e) => handleReminderToggle(e.target.checked)}
                  className="reminder-checkbox"
                />
                <span className="reminder-icon" aria-hidden="true"><NotificationsActiveOutlinedIcon fontSize="small" /></span>
                <span className="reminder-text">Eslatma qo'shish</span>
              </label>
            </div>
            
            {task.reminder && (
              <div className="reminder-options slide-down">
                <label className="reminder-option-label">
                  <span className="option-icon" aria-hidden="true"><TimerOutlinedIcon fontSize="small" /></span>
                  Eslatma vaqti:
                </label>
                <div className="reminder-buttons">
                  {reminderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`reminder-option-btn ${task.reminderTime === option.value ? 'active' : ''}`}
                      onClick={() => setTask({...task, reminderTime: option.value})}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => {
                setTask({
                  title: '',
                  date: format(new Date(), 'yyyy-MM-dd'),
                  time: format(new Date(), 'HH:mm'),
                  category: 'work',
                  priority: 'medium',
                  description: '',
                  reminder: false,
                  reminderTime: 10
                });
              }}
            >
              <span className="btn-icon" aria-hidden="true"><CloseIcon fontSize="small" /></span>
              Bekor qilish
            </button>
            <button 
              type="submit" 
              className="btn-submit btn-glow"
              disabled={!task.title.trim()}
            >
              <span className="btn-icon" aria-hidden="true"><CheckCircleOutlineIcon fontSize="small" /></span>
              {task.title.trim() ? 'Vazifa Qo\'shish' : 'Nom kiriting'}
            </button>
          </div>
        </form>

      {/* Success Notification (would be triggered on successful add) */}
      <div className="success-notification hidden">
        <span className="notification-icon" aria-hidden="true"><CelebrationOutlinedIcon fontSize="small" /></span>
        Vazifa muvaffaqiyatli qo'shildi!
      </div>
    </div>
  );
};

export default AddTask;