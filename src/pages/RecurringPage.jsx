import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RecurringTasks from '../components/RecurringTasks/RecurringTasks';
import './RecurringPage.css';

// MUI Icons
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';

const RecurringPage = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kun-tartibi-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Takroriy vazifa qo'shish
  const handleAddRecurringTask = (task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    localStorage.setItem('kun-tartibi-tasks', JSON.stringify(newTasks));
  };

  return (
    <div className="recurring-page">
      {/* Header */}
      <div className="recurring-page-header">
        <h1>
          <Link to="/" className="header-icon icon-link"><RepeatOutlinedIcon className="header-icon-svg" /></Link>
          Takroriy Vazifalar
        </h1>
        <p>Muntazam bajariladigan vazifalarni avtomatik yarating</p>
      </div>

      {/* Content */}
      <div className="recurring-page-content">
        <RecurringTasks 
          tasks={tasks}
          onAddRecurringTask={handleAddRecurringTask}
        />

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon"><TodayOutlinedIcon /></div>
            <div className="info-content">
              <h4>Har kuni</h4>
              <p>Ertalabki mashq, kitob o'qish kabi kundalik vazifalar</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><DateRangeOutlinedIcon /></div>
            <div className="info-content">
              <h4>Har hafta</h4>
              <p>Haftalik yig'ilishlar, sport mashg'ulotlari</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><CalendarMonthOutlinedIcon /></div>
            <div className="info-content">
              <h4>Har oy</h4>
              <p>Oylik hisobotlar, to'lovlar</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><EventRepeatOutlinedIcon /></div>
            <div className="info-content">
              <h4>Har yil</h4>
              <p>Yillik rejalar, bayramlar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringPage;
