import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CalendarWidget from '../components/Calendar/CalendarWidget';
import TaskList from '../components/TaskList/TaskList';
import './CalendarPage.css';

// MUI Icons
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

const CalendarPage = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('kun-tartibi-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [_filter, _setFilter] = useState('all'); // all, completed, pending

  // Filter tasks by selected date - using _filter with _
  const _filteredTasks = tasks.filter(task => {
    if (task.date !== selectedDate) return false;
    if (_filter === 'completed') return task.completed;
    if (_filter === 'pending') return !task.completed;
    return true;
  });

  const _handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const _handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const _handleEditTask = (taskId, updatedTask) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    ));
  };

  const _handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('kun-tartibi-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Get date statistics
  const getDateStats = () => {
    const selectedTasks = tasks.filter(task => task.date === selectedDate);
    const total = selectedTasks.length;
    const completed = selectedTasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, completionRate };
  };

  const stats = getDateStats();

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="calendar-page-header">
        <h1>
          <Link to="/" className="header-icon icon-link"><CalendarMonthOutlinedIcon className="header-icon-svg" /></Link>
          Kalendar Rejasi
        </h1>
        <p>Kunlik vazifalaringizni kalendar orqali boshqaring</p>
        
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <DateRangeOutlinedIcon fontSize="small" /> Oylik
          </button>
          <button 
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <EventNoteOutlinedIcon fontSize="small" /> Haftalik
          </button>
          <button 
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            <TodayOutlinedIcon fontSize="small" /> Kunlik
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Left Panel - Calendar */}
        <div className="left-panel">
          <div className="calendar-container">
            <CalendarWidget 
              tasks={tasks} 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
            
            <div className="calendar-stats">
              <div className="stat-card">
                <div className="stat-icon"><TodayOutlinedIcon /></div>
                <div className="stat-content">
                  <div className="stat-label">Tanlangan sana</div>
                  <div className="stat-value">
                    {new Date(selectedDate).toLocaleDateString('uz-UZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><AssignmentOutlinedIcon /></div>
                <div className="stat-content">
                  <div className="stat-label">Vazifalar soni</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-subtext">
                    {stats.completed} ta bajarilgan
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><TrendingUpOutlinedIcon /></div>
                <div className="stat-content">
                  <div className="stat-label">Progress</div>
                  <div className="stat-value">{stats.completionRate}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="monthly-overview">
        <h3>
          <span className="overview-icon"><InsightsOutlinedIcon /></span>
          Oylik Umumiy Ko'rinish
        </h3>
        
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon">📅</div>
            <div className="overview-content">
              <div className="overview-label">Oydagi kunlar</div>
              <div className="overview-value">
                {new Date().getDate()}/{new Date(selectedDate).getDate() === new Date().getDate() ? 'Bugun' : 'Tanlangan'}
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">📋</div>
            <div className="overview-content">
              <div className="overview-label">Oylik vazifalar</div>
              <div className="overview-value">
                {tasks.filter(t => {
                  const taskDate = new Date(t.date);
                  const selectedDateObj = new Date(selectedDate);
                  return taskDate.getMonth() === selectedDateObj.getMonth() &&
                         taskDate.getFullYear() === selectedDateObj.getFullYear();
                }).length} ta
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">✅</div>
            <div className="overview-content">
              <div className="overview-label">Oylik progress</div>
              <div className="overview-value">
                {(() => {
                  const monthlyTasks = tasks.filter(t => {
                    const taskDate = new Date(t.date);
                    const selectedDateObj = new Date(selectedDate);
                    return taskDate.getMonth() === selectedDateObj.getMonth() &&
                           taskDate.getFullYear() === selectedDateObj.getFullYear();
                  });
                  const completed = monthlyTasks.filter(t => t.completed).length;
                  const total = monthlyTasks.length;
                  return total > 0 ? Math.round((completed / total) * 100) : 0;
                })()}%
              </div>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="overview-icon">🔥</div>
            <div className="overview-content">
              <div className="overview-label">Eng faol kun</div>
              <div className="overview-value">
                {(() => {
                  const monthlyTasks = tasks.filter(t => {
                    const taskDate = new Date(t.date);
                    const selectedDateObj = new Date(selectedDate);
                    return taskDate.getMonth() === selectedDateObj.getMonth() &&
                           taskDate.getFullYear() === selectedDateObj.getFullYear();
                  });
                  
                  if (monthlyTasks.length === 0) return '-';
                  
                  const dayCounts = {};
                  monthlyTasks.forEach(task => {
                    const day = new Date(task.date).getDate();
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                  });
                  
                  const mostActiveDay = Object.entries(dayCounts)
                    .sort((a, b) => b[1] - a[1])[0];
                  
                  return mostActiveDay ? `${mostActiveDay[0]}-kun (${mostActiveDay[1]} ta)` : '-';
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;