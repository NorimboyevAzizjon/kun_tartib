import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Notifications from '../components/Notifications/Notifications';
import RecurringTasks from '../components/RecurringTasks/RecurringTasks';
import Goals from '../components/Goals/Goals';
import './SettingsPage.css';

const SettingsPage = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('schedule-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('notifications');

  // Takroriy vazifa qo'shish
  const handleAddRecurringTask = (task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    localStorage.setItem('schedule-tasks', JSON.stringify(newTasks));
  };

  // Vazifani yangilash
  const handleUpdateTask = (taskId, updates) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    setTasks(newTasks);
    localStorage.setItem('schedule-tasks', JSON.stringify(newTasks));
  };

  const tabs = [
    { id: 'notifications', label: 'Bildirishnomalar', icon: '🔔' },
    { id: 'recurring', label: 'Takroriy vazifalar', icon: '🔁' },
    { id: 'goals', label: 'Maqsadlar', icon: '🎯' }
  ];

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <h1>
          <Link to="/" className="header-icon icon-link">⚙️</Link>
          Sozlamalar
        </h1>
        <p>Ilovangizni moslashtiring va yangi imkoniyatlardan foydalaning</p>
      </div>

      {/* Navigation Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="settings-content">
        {activeTab === 'notifications' && (
          <Notifications 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringTasks 
            tasks={tasks}
            onAddRecurringTask={handleAddRecurringTask}
          />
        )}

        {activeTab === 'goals' && (
          <Goals tasks={tasks} />
        )}
      </div>

      {/* Quick Stats */}
      <div className="settings-stats glass-effect">
        <div className="stat-item">
          <span className="stat-icon">📋</span>
          <div className="stat-info">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Jami vazifalar</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{tasks.filter(t => t.completed).length}</span>
            <span className="stat-label">Bajarilgan</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🔁</span>
          <div className="stat-info">
            <span className="stat-value">
              {JSON.parse(localStorage.getItem('recurring-tasks') || '[]').length}
            </span>
            <span className="stat-label">Takroriy</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <span className="stat-value">
              {JSON.parse(localStorage.getItem('user-goals') || '[]').length}
            </span>
            <span className="stat-label">Maqsadlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
