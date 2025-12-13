import React, { useState } from 'react';
import WeeklyChart from '../components/Charts/WeeklyChart';
import CategoryChart from '../components/Charts/CategoryChart';
import ProgressChart from '../components/Charts/ProgressChart';
import './DashboardPage.css';

const DashboardPage = () => {
  // LocalStorage dan vazifalarni olish
  const [tasks] = useState(() => {
    const savedTasks = localStorage.getItem('schedule-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const priorityCounts = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
    
    return { total, completed, completionRate, priorityCounts };
  };

  const stats = calculateStats();

  return (
    <div className="dashboard-page">
      <h1>📊 Statistika Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card large">
          <h3>Umumiy Holat</h3>
          <div className="progress-circle">
            <div className="circle" style={{
              background: `conic-gradient(#4CAF50 ${stats.completionRate * 3.6}deg, #eee 0deg)`
            }}>
              <span>{stats.completionRate}%</span>
            </div>
            <p>Bajarilganlik darajasi</p>
          </div>
          <div className="stat-details">
            <p>✅ Bajarilgan: {stats.completed}</p>
            <p>📋 Jami: {stats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Imtiyozlar</h3>
          <div className="priority-stats">
            <div className="priority-item high">
              <span>🔴 Yuqori</span>
              <span>{stats.priorityCounts.high}</span>
            </div>
            <div className="priority-item medium">
              <span>🟡 O'rta</span>
              <span>{stats.priorityCounts.medium}</span>
            </div>
            <div className="priority-item low">
              <span>🟢 Past</span>
              <span>{stats.priorityCounts.low}</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Faol Kunlar</h3>
          <ul className="active-days">
            <li>Dushanba: {tasks.filter(t => new Date(t.date).getDay() === 1).length} ta</li>
            <li>Seshanba: {tasks.filter(t => new Date(t.date).getDay() === 2).length} ta</li>
            <li>Chorshanba: {tasks.filter(t => new Date(t.date).getDay() === 3).length} ta</li>
            <li>Payshanba: {tasks.filter(t => new Date(t.date).getDay() === 4).length} ta</li>
            <li>Juma: {tasks.filter(t => new Date(t.date).getDay() === 5).length} ta</li>
            <li>Shanba: {tasks.filter(t => new Date(t.date).getDay() === 6).length} ta</li>
            <li>Yakshanba: {tasks.filter(t => new Date(t.date).getDay() === 0).length} ta</li>
          </ul>
        </div>
      </div>
      
      <div className="charts-section">
        <div className="chart-card">
          <WeeklyChart tasks={tasks} />
        </div>
        
        <div className="chart-card">
          <CategoryChart tasks={tasks} />
        </div>
        
        <div className="chart-card">
          <ProgressChart tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;