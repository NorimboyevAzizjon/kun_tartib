import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths 
} from 'date-fns';
import { uz } from 'date-fns/locale';
import './Calendar.css';

// MUI Icons
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

const CalendarWidget = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days to display in the calendar grid
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      // More robust comparison using date-fns if task.date is an ISO string
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get day stats
  const getDayStats = (date) => {
    const dayTasks = getTasksForDate(date);
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  };

  // Get day color based on completion percentage
  const getDayColor = (date) => {
    const { percentage } = getDayStats(date);
    
    if (percentage === 0) return 'var(--day-empty, #1e293b)';
    if (percentage < 30) return 'var(--day-low, #7f1d1d)';
    if (percentage < 60) return 'var(--day-medium, #854d0e)';
    if (percentage < 90) return 'var(--day-high, #166534)';
    return 'var(--day-complete, #065f46)'; // 90%+ completed
  };

  // Weekday names in Uzbek
  const weekdays = ['Yak', 'Dush', 'Se', 'Chor', 'Pay', 'Jum', 'Shan'];

  return (
    <div className="calendar-widget glass-effect card-hover">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-btn prev btn-glow" onClick={prevMonth} aria-label="Oldingi oy">
          <span className="nav-icon" aria-hidden="true"><ArrowBackIosNewOutlinedIcon fontSize="small" /></span>
        </button>
        
        <div className="current-month">
          <h3 className="month-title">
            {format(currentDate, 'MMMM yyyy', { locale: uz })}
          </h3>
          <div className="month-stats">
            <span className="stat-item">
              <EventOutlinedIcon fontSize="small" /> {tasks.filter(t => isSameMonth(new Date(t.date), currentDate)).length} ta
            </span>
            <span className="stat-item">
              <CheckCircleOutlineIcon fontSize="small" /> {tasks.filter(t => t.completed && isSameMonth(new Date(t.date), currentDate)).length} ta
            </span>
          </div>
        </div>
        
        <button className="nav-btn next btn-glow" onClick={nextMonth} aria-label="Keyingi oy">
          <span className="nav-icon" aria-hidden="true"><ArrowForwardIosOutlinedIcon fontSize="small" /></span>
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
        {calendarDays.map((day) => {
          const dayStats = getDayStats(day);
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayTasks = getTasksForDate(day);

          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(day)}
              style={{ 
                backgroundColor: isCurrentMonth ? getDayColor(day) : 'transparent',
                cursor: 'pointer'
              }}
            >
              <div className="day-header">
                <span className="day-number">
                  {format(day, 'd')}
                </span>
                {isCurrentDay && (
                  <span className="today-badge">Bugun</span>
                )}
              </div>

              {dayTasks.length > 0 && isCurrentMonth && (
                <div className="day-tasks">
                  <div className="task-indicators">
                    {dayTasks.slice(0, 3).map(task => (
                      <span
                        key={task.id}
                        className={`task-indicator ${task.completed ? 'completed' : 'pending'}`}
                        title={`${task.title} - ${task.time}`}
                      >
                        {task.completed ? <CheckCircleOutlineIcon fontSize="inherit" /> : <HourglassBottomOutlinedIcon fontSize="inherit" />}
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

              {dayTasks.length === 0 && isCurrentMonth && (
                <div className="no-tasks">
                  <span className="empty-icon" aria-hidden="true"><NotesOutlinedIcon fontSize="small" /></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;