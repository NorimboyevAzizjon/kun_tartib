import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Notifications from '../components/Notifications/Notifications';
import './SettingsPage.css';

const NotificationsPage = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kuntartib-tasks') || localStorage.getItem('kun-tartibi-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Vazifani yangilash
  const handleUpdateTask = (taskId, updates) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    setTasks(newTasks);
    localStorage.setItem('kuntartib-tasks', JSON.stringify(newTasks));
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
        <h1>
          <Link to="/" className="header-icon icon-link">🔔</Link>
          Bildirishnomalar
        </h1>
        <p>Vazifalar haqida eslatmalar oling va boshqaring</p>
      </div>

      {/* Content */}
      <div className="settings-content">
        <Notifications 
          tasks={tasks} 
          onUpdateTask={handleUpdateTask}
        />
      </div>
    </div>
  );
};

export default NotificationsPage;
