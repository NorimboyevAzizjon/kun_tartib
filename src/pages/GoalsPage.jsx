import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Goals from '../components/Goals/Goals';
import './GoalsPage.css';

// MUI Icons
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const GoalsPage = () => {
  const [tasks] = useState(() => {
    const saved = localStorage.getItem('kun-tartibi-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Statistika
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
      : 0
  };

  return (
    <div className="goals-page">
      {/* Header */}
      <div className="goals-page-header">
        <h1>
          <Link to="/" className="header-icon icon-link"><FlagOutlinedIcon className="header-icon-svg" /></Link>
          Maqsadlar
        </h1>
        <p>Haftalik va oylik maqsadlaringizni belgilang va kuzating</p>
      </div>

      {/* Stats */}
      <div className="goals-stats">
        <div className="stat-card">
          <span className="stat-icon"><AssignmentOutlinedIcon /></span>
          <div className="stat-info">
            <span className="stat-value">{stats.totalTasks}</span>
            <span className="stat-label">Jami vazifalar</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><CheckCircleOutlineIcon /></span>
          <div className="stat-info">
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Bajarilgan</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><TrendingUpOutlinedIcon /></span>
          <div className="stat-info">
            <span className="stat-value">{stats.completionRate}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="goals-page-content">
        <Goals tasks={tasks} />
      </div>

      {/* Motivation */}
      <div className="motivation-section">
        <h3><FitnessCenterOutlinedIcon /> Motivatsiya</h3>
        <div className="motivation-cards">
          <div className="motivation-card">
            <span className="quote-icon"><FormatQuoteIcon /></span>
            <p>Kichik qadamlar katta muvaffaqiyatlarga olib boradi.</p>
          </div>
          <div className="motivation-card">
            <span className="quote-icon"><FormatQuoteIcon /></span>
            <p>Har bir bajarilgan vazifa - maqsadga bir qadam yaqin.</p>
          </div>
          <div className="motivation-card">
            <span className="quote-icon"><FormatQuoteIcon /></span>
            <p>Bugun qilingan ish - ertangi muvaffaqiyat.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
