import React, { useState, useRef, useEffect } from 'react';
import './QuickAddWidget.css';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import SendIcon from '@mui/icons-material/Send';

const QuickAddWidget = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const inputRef = useRef(null);
  const widgetRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcut (Alt + N)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTitle('');
    setShowOptions(false);
    setPriority('medium');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      completed: false,
      priority,
      date,
      time,
      category: 'Umumiy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddTask?.(newTask);
    handleClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="quick-add-widget" ref={widgetRef}>
      {/* Floating Action Button */}
      <button
        className={`quick-add-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Yopish' : 'Tez vazifa qo\'shish'}
        title="Alt + N"
      >
        {isOpen ? <CloseIcon /> : <AddIcon />}
      </button>

      {/* Quick Add Panel */}
      {isOpen && (
        <div className="quick-add-panel">
          <form onSubmit={handleSubmit}>
            <div className="quick-add-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Yangi vazifa..."
                className="quick-add-input"
                autoComplete="off"
              />
              <button
                type="submit"
                className="quick-add-submit"
                disabled={!title.trim()}
              >
                <SendIcon />
              </button>
            </div>

            {/* Toggle Options */}
            <button
              type="button"
              className="quick-add-options-toggle"
              onClick={() => setShowOptions(!showOptions)}
            >
              {showOptions ? 'Kamroq' : 'Ko\'proq sozlamalar'}
            </button>

            {/* Extended Options */}
            {showOptions && (
              <div className="quick-add-options">
                {/* Priority */}
                <div className="quick-option">
                  <label>
                    <FlagIcon style={{ color: getPriorityColor(priority) }} />
                    Muhimlik
                  </label>
                  <div className="priority-buttons">
                    {['low', 'medium', 'high'].map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-btn ${priority === p ? 'active' : ''}`}
                        onClick={() => setPriority(p)}
                        style={{ '--priority-color': getPriorityColor(p) }}
                      >
                        {p === 'low' ? 'Past' : p === 'medium' ? "O'rta" : 'Yuqori'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="quick-option">
                  <label>
                    <CalendarTodayIcon />
                    Sana
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="quick-date-input"
                  />
                </div>

                {/* Time */}
                <div className="quick-option">
                  <label>
                    <AccessTimeIcon />
                    Vaqt
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="quick-time-input"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Keyboard hint */}
          <div className="quick-add-hint">
            <kbd>Enter</kbd> saqlash • <kbd>Esc</kbd> yopish
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddWidget;
