import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import './Calendar.css';

const CalendarWidget = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Format date to YYYY-MM-DD
  const formatDate = (date) => format(date, 'yyyy-MM-dd');

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = formatDate(date);
    return tasks.filter(task => task.date === dateStr);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get day stats
  const getDayStats = (date) => {
    const dayTasks = getTasksForDate(date);
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  // Get day color based on completion
  const getDayColor = (date) => {
    const { percentage } = getDayStats(date);
    
    if (percentage === 0) return '#f0f0f0';
    if (percentage < 30) return '#ffcdd2';
    if (percentage < 60) return '#fff3e0';
    if (percentage < 90) return '#e8f5e9';
    return '#c8e6c9'; // 90%+ completed
  };

  // Weekday names
  const weekdays = ['Yak', 'Dush', 'Se', 'Chor', 'Pay', 'Jum', 'Shan'];

  return (
    <div className="calendar-widget">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-btn prev" onClick={prevMonth}>
          ◀️
        </button>
        
        <div className="current-month">
          <h3>
            {format(currentDate, 'MMMM yyyy', { locale: uz })}
          </h3>
          <div className="month-stats">
            <span className="stat-item">
              📅 {tasks.filter(t => isSameMonth(new Date(t.date), currentDate)).length} ta
            </span>
            <span className="stat-item">
              ✅ {tasks.filter(t => t.completed && isSameMonth(new Date(t.date), currentDate)).length} ta
            </span>
          </div>
        </div>
        
        <button className="nav-btn next" onClick={nextMonth}>
          ▶️
        </button>
      </div>

      {/* Weekday Header */}
      <div className="weekdays">
        {weekdays.map(day => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {monthDays.map((day) => {
          const dayStats = getDayStats(day);
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const dayTasks = getTasksForDate(day);

          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(day)}
              style={{ backgroundColor: getDayColor(day) }}
            >
              <div className="day-header">
                <span className="day-number">
                  {format(day, 'd')}
                </span>
                {isCurrentDay && (
                  <span className="today-badge">Bugun</span>
                )}
              </div>

              {dayTasks.length > 0 && (
                <div className="day-tasks">
                  <div className="task-indicators">
                    {dayTasks.slice(0, 3).map(task => (
                      <span
                        key={task.id}
                        className={`task-indicator ${task.completed ? 'completed' : 'pending'}`}
                        title={`${task.title} - ${task.time}`}
                      >
                        {task.completed ? '✅' : '⏳'}
                      </span>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="more-tasks">
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {dayStats.total > 0 && (
                    <div className="day-stats">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${dayStats.percentage}%` }}
                        ></div>
                      </div>
                      <span className="percentage">
                        {dayStats.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {dayTasks.length === 0 && (
                <div className="no-tasks">
                  <span className="empty-icon">📝</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      <div className="selected-day-details">
        <h4>
          📅 {format(selectedDate, 'd MMMM, yyyy', { locale: uz })}
          {isToday(selectedDate) && ' (Bugun)'}
        </h4>
        
        {getTasksForDate(selectedDate).length > 0 ? (
          <div className="day-tasks-list">
            {getTasksForDate(selectedDate).map(task => (
              <div key={task.id} className="task-item">
                <div className="task-time">{task.time}</div>
                <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </div>
                <div className="task-category">
                  {task.category === 'work' && '💼'}
                  {task.category === 'study' && '📚'}
                  {task.category === 'home' && '🏠'}
                  {task.category === 'personal' && '👤'}
                  {task.category === 'health' && '🏃'}
                </div>
                <div className={`task-status ${task.completed ? 'done' : 'pending'}`}>
                  {task.completed ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tasks-message">
            <div className="empty-calendar">📅</div>
            <p>Bu kunda vazifalar yo'q</p>
            <button className="add-task-btn">
              ➕ Vazifa qo'shish
            </button>
          </div>
        )}

        <div className="day-summary">
          <div className="summary-item">
            <div className="summary-label">Jami vazifalar:</div>
            <div className="summary-value">{getTasksForDate(selectedDate).length}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Bajarilgan:</div>
            <div className="summary-value">
              {getTasksForDate(selectedDate).filter(t => t.completed).length}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Progress:</div>
            <div className="summary-value">
              {getDayStats(selectedDate).percentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;