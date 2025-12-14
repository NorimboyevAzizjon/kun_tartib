import React, { useState, useEffect } from 'react';
import './Notifications.css';

// MUI Icons
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Ovoz chiqarish funksiyasi
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
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

const Notifications = ({ tasks = [] }) => {
  // LocalStorage dan boshlang'ich qiymatlarni olish
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true';
    return enabled && 'Notification' in window && Notification.permission === 'granted';
  });
  
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const settings = localStorage.getItem('notification-settings');
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch {
        // Invalid JSON
      }
    }
    return { beforeMinutes: 15, sound: true, vibration: true };
  });
  
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  
  const [notificationHistory, setNotificationHistory] = useState(() => {
    const history = localStorage.getItem('notification-history');
    if (history) {
      try {
        return JSON.parse(history);
      } catch {
        // Invalid JSON
      }
    }
    return [];
  });
  
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());

  // Brauzer bildirishnomalarini so'rash
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications-enabled', 'true');
        showNotification('Bildirishnomalar yoqildi!', 'Endi vazifalar haqida eslatmalar olasiz.');
      }
    } else {
      alert('Brauzeringiz bildirishnomalarni qo\'llab-quvvatlamaydi');
    }
  };

  // Bildirishnoma ko'rsatish
  const showNotification = (title, body, taskId = null) => {
    // Tarixga qo'shish
    const newNotification = {
      id: Date.now(),
      title,
      body,
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('uz-UZ'),
      read: false
    };
    
    setNotificationHistory(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Max 50 ta
      localStorage.setItem('notification-history', JSON.stringify(updated));
      return updated;
    });

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: notificationSettings.vibration ? [200, 100, 200] : [],
        tag: taskId || 'task-reminder',
        requireInteraction: true
      });
    }

    // Ovoz
    if (notificationSettings.sound) {
      playNotificationSound();
    }
  };

  // Yaqinlashayotgan vazifalarni tekshirish
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkUpcomingTasks = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const upcoming = tasks.filter(task => {
        if (task.completed) return false;
        if (!task.time) return false;
        
        const taskDate = task.date || todayStr;
        const taskDateTime = new Date(`${taskDate}T${task.time}`);
        const timeDiff = taskDateTime - now;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        return minutesDiff > 0 && minutesDiff <= 60; // 1 soat ichida
      });

      setUpcomingTasks(upcoming);

      // Eslatma yuborish
      upcoming.forEach(task => {
        const taskDate = task.date || todayStr;
        const taskDateTime = new Date(`${taskDate}T${task.time}`);
        const timeDiff = taskDateTime - now;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        const taskKey = `${task.id}-${taskDate}`;
        
        // Agar hali eslatilmagan bo'lsa va vaqti kelgan bo'lsa
        if (minutesDiff <= notificationSettings.beforeMinutes && !notifiedTasks.has(taskKey)) {
          // Inline notification
          const newNotification = {
            id: Date.now(),
            title: `⏰ Vazifa yaqinlashmoqda!`,
            body: `"${task.title}" - ${minutesDiff} daqiqadan keyin (${task.time})`,
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('uz-UZ'),
            read: false
          };
          
          setNotificationHistory(prev => {
            const updated = [newNotification, ...prev].slice(0, 50);
            localStorage.setItem('notification-history', JSON.stringify(updated));
            return updated;
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.body,
              icon: '/favicon.ico',
              tag: task.id,
              requireInteraction: true
            });
          }

          if (notificationSettings.sound) {
            playNotificationSound();
          }
          
          setNotifiedTasks(prev => {
            const newSet = new Set(prev);
            newSet.add(taskKey);
            return newSet;
          });
        }
      });
    };

    // Har 30 sekundda tekshirish
    checkUpcomingTasks();
    const interval = setInterval(checkUpcomingTasks, 30000);

    return () => clearInterval(interval);
  }, [tasks, notificationSettings, notificationsEnabled, notifiedTasks]);

  // Tarixni tozalash
  const clearHistory = () => {
    setNotificationHistory([]);
    localStorage.removeItem('notification-history');
  };

  // Bildirishnomani o'qilgan deb belgilash
  const markAsRead = (id) => {
    setNotificationHistory(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('notification-history', JSON.stringify(updated));
      return updated;
    });
  };

  // Sozlamalarni saqlash
  const saveSettings = (newSettings) => {
    setNotificationSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  return (
    <div className="notifications-container glass-effect">
      <div className="notifications-header">
        <h3>
          <span className="header-icon" aria-hidden="true"><NotificationsOutlinedIcon /></span>
          Bildirishnomalar
        </h3>
        <p className="header-subtitle">Vazifalar haqida eslatmalar oling</p>
      </div>

      <div className="notifications-content">
        {/* Yoqish/O'chirish */}
        <div className="notification-toggle">
          <div className="toggle-info">
            <span className="toggle-icon" aria-hidden="true"><NotificationsOutlinedIcon /></span>
            <div className="toggle-text">
              <span className="toggle-label">Bildirishnomalar</span>
              <span className="toggle-status">
                {notificationsEnabled ? 'Yoqilgan' : 'O\'chirilgan'}
              </span>
            </div>
          </div>
          <button 
            className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
            onClick={() => {
              if (notificationsEnabled) {
                setNotificationsEnabled(false);
                localStorage.setItem('notifications-enabled', 'false');
              } else {
                requestPermission();
              }
            }}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>

        {/* Sozlamalar */}
        {notificationsEnabled && (
          <div className="notification-settings">
            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-icon">⏱️</span>
                Eslatma vaqti
              </label>
              <select 
                value={notificationSettings.beforeMinutes}
                onChange={(e) => saveSettings({
                  ...notificationSettings,
                  beforeMinutes: Number(e.target.value)
                })}
                className="setting-select"
              >
                <option value={5}>5 daqiqa oldin</option>
                <option value={10}>10 daqiqa oldin</option>
                <option value={15}>15 daqiqa oldin</option>
                <option value={30}>30 daqiqa oldin</option>
                <option value={60}>1 soat oldin</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-icon">🔊</span>
                Ovoz
              </label>
              <button 
                className={`mini-toggle ${notificationSettings.sound ? 'active' : ''}`}
                onClick={() => saveSettings({
                  ...notificationSettings,
                  sound: !notificationSettings.sound
                })}
              >
                {notificationSettings.sound ? 'Yoqiq' : 'O\'chiq'}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-icon">📳</span>
                Tebranish
              </label>
              <button 
                className={`mini-toggle ${notificationSettings.vibration ? 'active' : ''}`}
                onClick={() => saveSettings({
                  ...notificationSettings,
                  vibration: !notificationSettings.vibration
                })}
              >
                {notificationSettings.vibration ? 'Yoqiq' : 'O\'chiq'}
              </button>
            </div>
          </div>
        )}

        {/* Yaqinlashayotgan vazifalar */}
        {upcomingTasks.length > 0 && (
          <div className="upcoming-tasks">
            <h4>
              <span className="section-icon">⏰</span>
              Yaqinlashayotgan vazifalar
            </h4>
            <div className="upcoming-list">
              {upcomingTasks.map(task => (
                <div key={task.id} className="upcoming-item">
                  <div className="upcoming-icon">📋</div>
                  <div className="upcoming-info">
                    <span className="upcoming-title">{task.title}</span>
                    <span className="upcoming-time">{task.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test bildirishnoma */}
        {notificationsEnabled && (
          <button 
            className="test-notification-btn"
            onClick={() => showNotification('Test bildirishnoma', 'Bildirishnomalar ishlayapti!')}
          >
            <span className="btn-icon" aria-hidden="true"><ScienceOutlinedIcon fontSize="small" /></span>
            Test bildirishnoma yuborish
          </button>
        )}

        {/* Bildirishnomalar tarixi */}
        <div className="notification-history">
          <div className="history-header">
            <h4>
              <span className="section-icon" aria-hidden="true"><HistoryOutlinedIcon fontSize="small" /></span>
              Bildirishnomalar tarixi
            </h4>
            {notificationHistory.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>
                Tozalash
              </button>
            )}
          </div>
          
          {notificationHistory.length === 0 ? (
            <div className="empty-history">
              <span className="empty-icon" aria-hidden="true"><NotificationsOffOutlinedIcon /></span>
              <p>Hozircha bildirishnomalar yo'q</p>
            </div>
          ) : (
            <div className="history-list">
              {notificationHistory.map(notification => (
                <div 
                  key={notification.id} 
                  className={`history-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="history-icon" aria-hidden="true"><NotificationsOutlinedIcon fontSize="small" /></div>
                  <div className="history-content">
                    <span className="history-title">{notification.title}</span>
                    <span className="history-body">{notification.body}</span>
                    <span className="history-time">{notification.time} • {notification.date}</span>
                  </div>
                  {!notification.read && <span className="unread-dot"></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
