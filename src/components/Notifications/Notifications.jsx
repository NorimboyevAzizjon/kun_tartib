import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = ({ tasks = [], onUpdateTask }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    beforeMinutes: 15, // Vazifadan necha daqiqa oldin eslatma
    sound: true,
    vibration: true
  });
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Brauzer bildirishnomalarini so'rash
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications-enabled', 'true');
        showNotification('Bildirishnomalar yoqildi! ✅', 'Endi vazifalar haqida eslatmalar olasiz.');
      }
    } else {
      alert('Brauzeringiz bildirishnomalarni qo\'llab-quvvatlamaydi');
    }
  };

  // Bildirishnoma ko'rsatish
  const showNotification = (title, body, icon = '📋') => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: notificationSettings.vibration ? [200, 100, 200] : [],
        tag: 'task-reminder'
      });

      if (notificationSettings.sound) {
        // Ovoz chiqarish
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleJ0rGoxmnaSRVz8AAAA=');
        audio.play().catch(() => {});
      }
    }
  };

  // Yaqinlashayotgan vazifalarni tekshirish
  useEffect(() => {
    const checkUpcomingTasks = () => {
      const now = new Date();
      const upcoming = tasks.filter(task => {
        if (task.completed) return false;
        
        const taskDateTime = new Date(`${task.date}T${task.time || '09:00'}`);
        const timeDiff = taskDateTime - now;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        return minutesDiff > 0 && minutesDiff <= notificationSettings.beforeMinutes;
      });

      setUpcomingTasks(upcoming);

      // Har bir yaqinlashayotgan vazifa uchun bildirishnoma
      upcoming.forEach(task => {
        const taskDateTime = new Date(`${task.date}T${task.time || '09:00'}`);
        const timeDiff = taskDateTime - now;
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesDiff === notificationSettings.beforeMinutes) {
          showNotification(
            `⏰ Vazifa yaqinlashmoqda!`,
            `"${task.title}" - ${minutesDiff} daqiqadan keyin`
          );
        }
      });
    };

    // Har daqiqada tekshirish
    const interval = setInterval(checkUpcomingTasks, 60000);
    checkUpcomingTasks();

    return () => clearInterval(interval);
  }, [tasks, notificationSettings, notificationsEnabled]);

  // LocalStorage dan sozlamalarni yuklash
  useEffect(() => {
    const enabled = localStorage.getItem('notifications-enabled') === 'true';
    const settings = localStorage.getItem('notification-settings');
    
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    
    if (settings) {
      setNotificationSettings(JSON.parse(settings));
    }
  }, []);

  // Sozlamalarni saqlash
  const saveSettings = (newSettings) => {
    setNotificationSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  return (
    <div className="notifications-container glass-effect">
      <div className="notifications-header">
        <h3>
          <span className="header-icon">🔔</span>
          Bildirishnomalar
        </h3>
        <p className="header-subtitle">Vazifalar haqida eslatmalar oling</p>
      </div>

      <div className="notifications-content">
        {/* Yoqish/O'chirish */}
        <div className="notification-toggle">
          <div className="toggle-info">
            <span className="toggle-icon">🔔</span>
            <div className="toggle-text">
              <span className="toggle-label">Bildirishnomalar</span>
              <span className="toggle-status">
                {notificationsEnabled ? 'Yoqilgan' : 'O\'chirilgan'}
              </span>
            </div>
          </div>
          <button 
            className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
            onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestPermission}
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
            onClick={() => showNotification('Test bildirishnoma 🔔', 'Bildirishnomalar ishlayapti!')}
          >
            <span className="btn-icon">🧪</span>
            Test bildirishnoma yuborish
          </button>
        )}
      </div>
    </div>
  );
};

export default Notifications;
