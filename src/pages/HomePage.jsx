import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { uz } from 'date-fns/locale';
import TaskList from '../components/TaskList/TaskList';
import AddTask from '../components/AddTask/AddTask';
import TodayPlanWidget from '../components/TodayPlanWidget/TodayPlanWidget';
import './HomePage.css';

// MUI Icons
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const HomePage = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem('kun-tartibi-tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Vazifalarni yuklashda xato:', error);
      return [];
    }
  });

  const [activeView, setActiveView] = useState('today');

  // Stats hisoblash
  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isToday(taskDate);
    });
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      today: todayTasks.length,
      pending,
      completionRate
    };
  }, [tasks]);

  // LocalStorage ga avtomatik saqlash
  useEffect(() => {
    try {
      localStorage.setItem('kun-tartibi-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Vazifalarni saqlashda xato:', error);
    }
  }, [tasks]);

  // Vazifa qo'shish
  const handleAddTask = (newTask) => {
    setTasks(prevTasks => {
      const updatedTasks = [newTask, ...prevTasks];
      
      // Success notification
      showNotification('✅ Vazifa muvaffaqiyatli qo\'shildi!');
      
      // Eslatma rejalashtirish
      if (newTask.reminder && newTask.reminderDateTime) {
        scheduleReminder(newTask);
      }
      
      return updatedTasks;
    });
  };

  // Eslatma rejalashtirish
  const scheduleReminder = (task) => {
    const reminderTime = new Date(task.reminderDateTime);
    const now = new Date();
    const timeUntilReminder = reminderTime - now;

    if (timeUntilReminder > 0) {
      // Eslatmani localStorage'ga saqlash
      const scheduledReminders = JSON.parse(localStorage.getItem('scheduled-reminders') || '[]');
      scheduledReminders.push({
        taskId: task.id,
        taskTitle: task.title,
        reminderTime: task.reminderDateTime,
        taskTime: `${task.date}T${task.time}`
      });
      localStorage.setItem('scheduled-reminders', JSON.stringify(scheduledReminders));

      // Timeout qo'yish (agar brauzer ochiq bo'lsa)
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`⏰ Eslatma: ${task.title}`, {
            body: `Vazifa ${task.reminderTime} daqiqadan keyin boshlanadi!`,
            icon: '/favicon.svg',
            requireInteraction: true,
            tag: task.id
          });
          
          // Ovoz chiqarish
          playReminderSound();
        }
      }, timeUntilReminder);
    }
  };

  // Eslatma ovozi
  const playReminderSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Melodiya
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  };

  // Sahifa yuklanganda eslatmalarni tekshirish
  useEffect(() => {
    const checkScheduledReminders = () => {
      const scheduledReminders = JSON.parse(localStorage.getItem('scheduled-reminders') || '[]');
      const now = new Date();
      
      scheduledReminders.forEach(reminder => {
        const reminderTime = new Date(reminder.reminderTime);
        const timeUntilReminder = reminderTime - now;
        
        if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) {
          // 24 soat ichidagi eslatmalarni rejalashtirish
          setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`⏰ Eslatma: ${reminder.taskTitle}`, {
                body: `Vazifa tez orada boshlanadi!`,
                icon: '/favicon.svg',
                requireInteraction: true,
                tag: reminder.taskId
              });
              playReminderSound();
            }
          }, timeUntilReminder);
        }
      });
      
      // O'tgan eslatmalarni tozalash
      const activeReminders = scheduledReminders.filter(r => new Date(r.reminderTime) > now);
      localStorage.setItem('scheduled-reminders', JSON.stringify(activeReminders));
    };
    
    checkScheduledReminders();
  }, []);

  // Vazifa statusini o'zgartirish
  const handleToggleComplete = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { 
            ...task, 
            completed: !task.completed,
            updatedAt: new Date().toISOString()
          };
          
          // Notification
          showNotification(
            updatedTask.completed 
              ? '✅ Vazifa bajarildi deb belgilandi!' 
              : '↩️ Vazifa qayta ochildi!'
          );
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  // Vazifani o'chirish
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Bu vazifani o\'chirishni tasdiqlaysizmi?')) {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task.id !== taskId);
        
        // Notification
        showNotification('🗑️ Vazifa o\'chirildi!');
        
        return updatedTasks;
      });
    }
  };

  // Vazifani tahrirlash
  const handleEditTask = (taskId, updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const mergedTask = {
            ...task,
            ...updatedTask,
            updatedAt: new Date().toISOString()
          };
          
          // Notification
          showNotification('✏️ Vazifa muvaffaqiyatli tahrirlandi!');
          
          return mergedTask;
        }
        return task;
      })
    );
  };

  // Notification ko'rsatish
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification fade-in';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📢</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Bugungi vazifalar
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return isToday(taskDate);
  });

  // Haftalik vazifalar
  const weekStart = startOfWeek(new Date(), { locale: uz });
  const weekEnd = endOfWeek(new Date(), { locale: uz });
  const weeklyTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  // Shoshilinch vazifalar (4 soat ichida)
  const urgentTasks = tasks.filter(task => {
    if (task.completed) return false;
    
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const now = new Date();
    const hoursDiff = (taskDateTime - now) / (1000 * 60 * 60);
    
    return hoursDiff > 0 && hoursDiff < 4;
  });

  // Filtrlangan vazifalarni olish
  const getFilteredTasks = () => {
    switch (activeView) {
      case 'today':
        return todayTasks;
      case 'week':
        return weeklyTasks;
      case 'urgent':
        return urgentTasks;
      case 'pending':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  };

  // Tashqari chiqishlar soni
  const overdueTasks = tasks.filter(task => {
    if (task.completed) return false;
    
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const now = new Date();
    return taskDateTime < now;
  });

  return (
    <div className="home-page">
      {/* Header Section */}
      <header className="page-header glass-effect">
        <div className="header-content fade-in">
          <Link to="/calendar" className="header-icon-wrapper icon-link">
            <CalendarMonthOutlinedIcon className="header-icon-svg" />
          </Link>
          <div className="header-text">
            <h1 className="page-title">Kun Tartibi</h1>
            <p className="page-subtitle">
              Vazifalaringizni rejalashtiring, boshqaring va kuzating
            </p>
            <div className="current-date">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: uz })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="header-stats slide-in">
          <Link to="/dashboard" className="stat-card total icon-link">
            <div className="stat-icon"><AssignmentOutlinedIcon /></div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Jami Vazifa</div>
            </div>
          </Link>
          
          <Link to="/dashboard" className="stat-card completed icon-link">
            <div className="stat-icon"><CheckCircleOutlineIcon /></div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Bajarilgan</div>
            </div>
          </Link>
          
          <Link to="/calendar" className="stat-card today icon-link">
            <div className="stat-icon"><WbSunnyOutlinedIcon /></div>
            <div className="stat-content">
              <div className="stat-number">{stats.today}</div>
              <div className="stat-label">Bugungi</div>
            </div>
          </Link>
          
          <Link to="/dashboard" className="stat-card pending icon-link">
            <div className="stat-icon"><HourglassEmptyIcon /></div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Kutayotgan</div>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Add Task Widget */}
          <section className="section-widget card-hover">
            <AddTask onAddTask={handleAddTask} />
          </section>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <TodayPlanWidget tasks={tasks} />
          {/* View Selector */}
          <div className="view-selector glass-effect">
            <div className="selector-header">
              <h3 className="selector-title">
                <span className="title-icon"><AssignmentOutlinedIcon fontSize="small" /></span>
                Vazifalar Ko'rinishi
              </h3>
              <div className="selector-actions">
                <button 
                  className="refresh-btn btn-glow"
                  onClick={() => window.location.reload()}
                  title="Yangilash"
                >
                  <RefreshIcon fontSize="small" />
                </button>
              </div>
            </div>
            
            <div className="view-tabs">
              <button 
                className={`view-tab ${activeView === 'today' ? 'active' : ''}`}
                onClick={() => setActiveView('today')}
              >
                <span className="tab-icon"><WbSunnyOutlinedIcon fontSize="small" /></span>
                <span className="tab-text">Bugungi</span>
                <span className="tab-badge">{todayTasks.length}</span>
              </button>
              
              <button 
                className={`view-tab ${activeView === 'week' ? 'active' : ''}`}
                onClick={() => setActiveView('week')}
              >
                <span className="tab-icon"><DateRangeOutlinedIcon fontSize="small" /></span>
                <span className="tab-text">Haftalik</span>
                <span className="tab-badge">{weeklyTasks.length}</span>
              </button>
              
              <button 
                className={`view-tab ${activeView === 'urgent' ? 'active' : ''}`}
                onClick={() => setActiveView('urgent')}
              >
                <span className="tab-icon"><LocalFireDepartmentOutlinedIcon fontSize="small" /></span>
                <span className="tab-text">Shoshilinch</span>
                <span className="tab-badge">{urgentTasks.length}</span>
              </button>
              
              <button 
                className={`view-tab ${activeView === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveView('pending')}
              >
                <span className="tab-icon"><HourglassEmptyIcon fontSize="small" /></span>
                <span className="tab-text">Kutayotgan</span>
                <span className="tab-badge">{stats.pending}</span>
              </button>
              
              <button 
                className={`view-tab ${activeView === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveView('completed')}
              >
                <span className="tab-icon"><CheckCircleOutlineIcon fontSize="small" /></span>
                <span className="tab-text">Bajarilgan</span>
                <span className="tab-badge">{stats.completed}</span>
              </button>
              
              <button 
                className={`view-tab ${activeView === 'all' ? 'active' : ''}`}
                onClick={() => setActiveView('all')}
              >
                <span className="tab-icon"><BarChartOutlinedIcon fontSize="small" /></span>
                <span className="tab-text">Barchasi</span>
                <span className="tab-badge">{stats.total}</span>
              </button>
            </div>
            
            <div className="view-info">
              {activeView === 'today' && (
                <div className="info-message">
                  <span className="info-icon"><PushPinOutlinedIcon fontSize="small" /></span>
                  Bugungi {todayTasks.length} ta vazifa
                </div>
              )}
              {activeView === 'urgent' && urgentTasks.length > 0 && (
                <div className="urgent-warning">
                  <span className="warning-icon"><WarningAmberIcon fontSize="small" /></span>
                  {urgentTasks.length} ta vazifa 4 soat ichida bajarilishi kerak!
                </div>
              )}
              {overdueTasks.length > 0 && (
                <div className="overdue-warning">
                  <span className="warning-icon"><AccessTimeIcon fontSize="small" /></span>
                  {overdueTasks.length} ta vazifa muddati o'tgan!
                </div>
              )}
            </div>
          </div>

          {/* Task List Section */}
          <div className="tasks-section">
            <TaskList 
              tasks={getFilteredTasks()}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              showDate={activeView !== 'today'}
            />
          </div>


        </div>
      </div>
    </div>
  );
};

export default HomePage;