import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import './AddTask.css';

const AddTask = ({ onAddTask }) => {
  const [task, setTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'work',
    priority: 'medium',
    description: '',
    reminder: false
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'work', label: '💼 Ish', color: '#667eea' },
    { value: 'study', label: '📚 O\'qish', color: '#4CAF50' },
    { value: 'home', label: '🏠 Uy', color: '#FF9800' },
    { value: 'personal', label: '👤 Shaxsiy', color: '#9C27B0' },
    { value: 'health', label: '🏃 Sog\'lom', color: '#2196F3' }
  ];

  const priorities = [
    { value: 'low', label: '🟢 Past', color: '#00C851' },
    { value: 'medium', label: '🟡 O\'rta', color: '#FF9800' },
    { value: 'high', label: '🔴 Yuqori', color: '#ff4444' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) {
      alert('Vazifa nomini kiriting!');
      return;
    }

    const newTask = {
      id: uuidv4(),
      ...task,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddTask(newTask);
    
    // Reset form
    setTask({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      category: 'work',
      priority: 'medium',
      description: '',
      reminder: false
    });
    
    setIsExpanded(false);
  };

  const handleQuickAdd = (type) => {
    const quickTasks = {
      meeting: 'Korxona yig\'ilishi',
      study: 'Dars tayyorlash',
      workout: 'Sport mashg\'uloti',
      shopping: 'Bozorlik qilish'
    };

    setTask({
      ...task,
      title: quickTasks[type],
      time: type === 'workout' ? '18:00' : '10:00'
    });
  };

  return (
    <div className={`add-task-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="add-task-header">
        <h3>
          <span className="header-icon">✨</span>
          Yangi Vazifa Qo'shish
        </h3>
        <button 
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '➖' : '➕'}
        </button>
      </div>

      {isExpanded && (
        <form className="add-task-form" onSubmit={handleSubmit}>
          {/* Quick Add Buttons */}
          <div className="quick-add-section">
            <h4>⚡ Tezkor qo'shish:</h4>
            <div className="quick-buttons">
              <button type="button" className="quick-btn meeting" onClick={() => handleQuickAdd('meeting')}>
                💼 Yig'ilish
              </button>
              <button type="button" className="quick-btn study" onClick={() => handleQuickAdd('study')}>
                📚 Dars
              </button>
              <button type="button" className="quick-btn workout" onClick={() => handleQuickAdd('workout')}>
                🏃 Sport
              </button>
              <button type="button" className="quick-btn shopping" onClick={() => handleQuickAdd('shopping')}>
                🛒 Bozor
              </button>
            </div>
          </div>

          {/* Task Title */}
          <div className="form-group">
            <label htmlFor="title">
              <span className="label-icon">📝</span>
              Vazifa nomi *
            </label>
            <input
              id="title"
              type="text"
              placeholder="Masalan: Dars tayyorlash..."
              value={task.title}
              onChange={(e) => setTask({...task, title: e.target.value})}
              className="task-input"
              required
              autoFocus
            />
          </div>

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">📅</span>
                Sana
              </label>
              <input
                type="date"
                value={task.date}
                onChange={(e) => setTask({...task, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="hint">
                Bugun: {format(new Date(), 'dd.MM.yyyy')}
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <span className="label-icon">⏰</span>
                Vaqt
              </label>
              <input
                type="time"
                value={task.time}
                onChange={(e) => setTask({...task, time: e.target.value})}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label>
              <span className="label-icon">🏷️</span>
              Kategoriya
            </label>
            <div className="category-selector">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${task.category === cat.value ? 'active' : ''}`}
                  onClick={() => setTask({...task, category: cat.value})}
                  style={{ 
                    borderColor: cat.color,
                    background: task.category === cat.value ? cat.color + '20' : 'white'
                  }}
                >
                  <span className="category-icon">{cat.label.split(' ')[0]}</span>
                  <span className="category-name">{cat.label.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="form-group">
            <label>
              <span className="label-icon">🎯</span>
              Imtiyoz
            </label>
            <div className="priority-selector">
              {priorities.map((prio) => (
                <button
                  key={prio.value}
                  type="button"
                  className={`priority-btn ${task.priority === prio.value ? 'active' : ''}`}
                  onClick={() => setTask({...task, priority: prio.value})}
                  style={{ 
                    borderColor: prio.color,
                    background: task.priority === prio.value ? prio.color + '20' : 'white',
                    color: task.priority === prio.value ? prio.color : '#718096'
                  }}
                >
                  {prio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              <span className="label-icon">📄</span>
              Qo'shimcha ma'lumot
            </label>
            <textarea
              id="description"
              placeholder="Vazifa haqida qo'shimcha ma'lumotlar..."
              value={task.description}
              onChange={(e) => setTask({...task, description: e.target.value})}
              rows="3"
            />
          </div>

          {/* Reminder Toggle */}
          <div className="form-group reminder-group">
            <label className="reminder-label">
              <input
                type="checkbox"
                checked={task.reminder}
                onChange={(e) => setTask({...task, reminder: e.target.checked})}
              />
              <span className="reminder-icon">🔔</span>
              <span className="reminder-text">Eslatma qo'shish</span>
            </label>
            {task.reminder && (
              <div className="reminder-options">
                <select 
                  value="10"
                  onChange={(e) => {}}
                  className="reminder-select"
                >
                  <option value="5">5 daqiqa oldin</option>
                  <option value="10">10 daqiqa oldin</option>
                  <option value="30">30 daqiqa oldin</option>
                  <option value="60">1 soat oldin</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsExpanded(false)}>
              Bekor qilish
            </button>
            <button type="submit" className="btn-submit">
              <span className="submit-icon">✅</span>
              Vazifa Qo'shish
            </button>
          </div>
        </form>
      )}

      {/* Quick Add Button (when collapsed) */}
      {!isExpanded && (
        <button 
          className="quick-add-btn"
          onClick={() => setIsExpanded(true)}
        >
          <span className="plus-icon">➕</span>
          Tezkor qo'shish
        </button>
      )}
    </div>
  );
};

export default AddTask;