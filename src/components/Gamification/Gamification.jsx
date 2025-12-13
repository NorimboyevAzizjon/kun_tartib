import React, { useState, useEffect } from 'react';
import './Gamification.css';

// MUI Icons
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const BADGES = [
  { id: 'first_task', name: 'Birinchi qadam', icon: '🎯', description: 'Birinchi vazifani bajaring', xp: 10, condition: (stats) => stats.totalCompleted >= 1 },
  { id: 'streak_3', name: 'Uch kunlik', icon: '🔥', description: '3 kun ketma-ket', xp: 50, condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', name: 'Haftalik yulduz', icon: '⭐', description: '7 kun ketma-ket', xp: 100, condition: (stats) => stats.streak >= 7 },
  { id: 'streak_30', name: 'Oylik ustoz', icon: '👑', description: '30 kun ketma-ket', xp: 500, condition: (stats) => stats.streak >= 30 },
  { id: 'tasks_10', name: '10 ta vazifa', icon: '📋', description: '10 ta vazifa bajaring', xp: 30, condition: (stats) => stats.totalCompleted >= 10 },
  { id: 'tasks_50', name: '50 ta vazifa', icon: '📚', description: '50 ta vazifa bajaring', xp: 100, condition: (stats) => stats.totalCompleted >= 50 },
  { id: 'tasks_100', name: 'Yuz bir', icon: '💯', description: '100 ta vazifa bajaring', xp: 250, condition: (stats) => stats.totalCompleted >= 100 },
  { id: 'pomodoro_10', name: 'Pomodoro master', icon: '🍅', description: '10 ta pomodoro', xp: 50, condition: (stats) => stats.totalPomodoros >= 10 },
  { id: 'pomodoro_50', name: 'Fokus ustasi', icon: '🧘', description: '50 ta pomodoro', xp: 150, condition: (stats) => stats.totalPomodoros >= 50 },
  { id: 'early_bird', name: 'Erta qush', icon: '🌅', description: 'Ertalab 6 da vazifa', xp: 25, condition: (stats) => stats.earlyBird },
  { id: 'night_owl', name: 'Tungi boyqush', icon: '🦉', description: 'Kechqurun 22 dan keyin', xp: 25, condition: (stats) => stats.nightOwl },
  { id: 'perfect_day', name: 'Mukammal kun', icon: '🌟', description: 'Barcha vazifalarni bajaring', xp: 75, condition: (stats) => stats.perfectDays >= 1 }
];

const LEVELS = [
  { level: 1, name: 'Boshlang\'ich', minXP: 0, icon: '🌱' },
  { level: 2, name: 'O\'rganuvchi', minXP: 100, icon: '📖' },
  { level: 3, name: 'Faol', minXP: 250, icon: '⚡' },
  { level: 4, name: 'Ishchan', minXP: 500, icon: '💪' },
  { level: 5, name: 'Tajribali', minXP: 1000, icon: '🎯' },
  { level: 6, name: 'Professional', minXP: 2000, icon: '🏆' },
  { level: 7, name: 'Master', minXP: 3500, icon: '👑' },
  { level: 8, name: 'Grandmaster', minXP: 5000, icon: '💎' },
  { level: 9, name: 'Legend', minXP: 7500, icon: '🌟' },
  { level: 10, name: 'Champion', minXP: 10000, icon: '🚀' }
];

const Gamification = ({ tasks = [] }) => {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gamification-stats');
    return saved ? JSON.parse(saved) : {
      totalCompleted: 0,
      streak: 0,
      lastActiveDate: null,
      totalPomodoros: 0,
      earlyBird: false,
      nightOwl: false,
      perfectDays: 0,
      earnedBadges: []
    };
  });

  const [xp, setXP] = useState(() => {
    return parseInt(localStorage.getItem('user-xp') || '0');
  });

  const [showBadgePopup, setShowBadgePopup] = useState(null);

  // Calculate stats from tasks
  useEffect(() => {
    const completedTasks = tasks.filter(t => t.completed);
    const today = new Date().toISOString().split('T')[0];
    const totalPomodoros = parseInt(localStorage.getItem('pomodoro-total') || '0');
    
    // Check streak
    const lastActive = stats.lastActiveDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = stats.streak;
    if (lastActive === today) {
      // Already active today
    } else if (lastActive === yesterdayStr) {
      // Continue streak
      newStreak = stats.streak + 1;
    } else if (lastActive !== today) {
      // Streak broken or first day
      newStreak = completedTasks.some(t => t.updatedAt?.split('T')[0] === today) ? 1 : 0;
    }

    // Check time-based badges
    const now = new Date();
    const hour = now.getHours();
    const earlyBird = hour < 7 && completedTasks.length > 0;
    const nightOwl = hour >= 22 && completedTasks.length > 0;

    // Check perfect day
    const todayTasks = tasks.filter(t => t.date === today);
    const todayCompleted = todayTasks.filter(t => t.completed);
    const perfectDay = todayTasks.length > 0 && todayTasks.length === todayCompleted.length;

    const newStats = {
      ...stats,
      totalCompleted: completedTasks.length,
      streak: newStreak,
      lastActiveDate: completedTasks.length > 0 ? today : stats.lastActiveDate,
      totalPomodoros,
      earlyBird: stats.earlyBird || earlyBird,
      nightOwl: stats.nightOwl || nightOwl,
      perfectDays: stats.perfectDays + (perfectDay ? 1 : 0)
    };

    // Check for new badges
    const newBadges = [...stats.earnedBadges];
    BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id) && badge.condition(newStats)) {
        newBadges.push(badge.id);
        setXP(prev => {
          const newXP = prev + badge.xp;
          localStorage.setItem('user-xp', newXP.toString());
          return newXP;
        });
        setShowBadgePopup(badge);
        setTimeout(() => setShowBadgePopup(null), 3000);
      }
    });

    newStats.earnedBadges = newBadges;
    setStats(newStats);
    localStorage.setItem('gamification-stats', JSON.stringify(newStats));
  }, [tasks]);

  // Get current level
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) return LEVELS[i];
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    const currentIndex = LEVELS.findIndex(l => l.level === getCurrentLevel().level);
    return LEVELS[currentIndex + 1] || null;
  };

  const getXPProgress = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    const progressXP = xp - current.minXP;
    const neededXP = next.minXP - current.minXP;
    return Math.round((progressXP / neededXP) * 100);
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="gamification-container">
      {/* Badge Popup */}
      {showBadgePopup && (
        <div className="badge-popup">
          <div className="popup-content">
            <span className="popup-icon">{showBadgePopup.icon}</span>
            <h3>Yangi yutuq!</h3>
            <p>{showBadgePopup.name}</p>
            <span className="popup-xp">+{showBadgePopup.xp} XP</span>
          </div>
        </div>
      )}

      {/* Level Card */}
      <div className="level-card">
        <div className="level-header">
          <div className="level-icon">{currentLevel.icon}</div>
          <div className="level-info">
            <span className="level-number">Daraja {currentLevel.level}</span>
            <span className="level-name">{currentLevel.name}</span>
          </div>
          <div className="xp-badge">
            <StarOutlinedIcon />
            {xp} XP
          </div>
        </div>
        
        <div className="level-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getXPProgress()}%` }}></div>
          </div>
          {nextLevel && (
            <div className="progress-labels">
              <span>{xp} XP</span>
              <span>{nextLevel.minXP} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Streak Card */}
      <div className="streak-card">
        <div className="streak-icon">
          <LocalFireDepartmentIcon className={stats.streak > 0 ? 'active' : ''} />
        </div>
        <div className="streak-info">
          <span className="streak-count">{stats.streak}</span>
          <span className="streak-label">kun ketma-ket</span>
        </div>
        <div className="streak-message">
          {stats.streak === 0 && "Bugun boshlang! 💪"}
          {stats.streak >= 1 && stats.streak < 3 && "Zo'r boshlang'ich! 🌟"}
          {stats.streak >= 3 && stats.streak < 7 && "Davom eting! 🔥"}
          {stats.streak >= 7 && stats.streak < 30 && "Ajoyib! 🏆"}
          {stats.streak >= 30 && "Legendar! 👑"}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <EmojiEventsOutlinedIcon className="stat-icon gold" />
          <span className="stat-value">{stats.totalCompleted}</span>
          <span className="stat-label">Bajarilgan</span>
        </div>
        <div className="stat-card">
          <TrendingUpIcon className="stat-icon green" />
          <span className="stat-value">{stats.perfectDays}</span>
          <span className="stat-label">Mukammal kun</span>
        </div>
        <div className="stat-card">
          <RocketLaunchIcon className="stat-icon blue" />
          <span className="stat-value">{stats.totalPomodoros}</span>
          <span className="stat-label">Pomodoro</span>
        </div>
        <div className="stat-card">
          <WorkspacePremiumIcon className="stat-icon purple" />
          <span className="stat-value">{stats.earnedBadges.length}</span>
          <span className="stat-label">Yutuqlar</span>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <h3>
          <MilitaryTechIcon />
          Yutuqlar
        </h3>
        <div className="badges-grid">
          {BADGES.map(badge => {
            const earned = stats.earnedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`badge-item ${earned ? 'earned' : 'locked'}`}
                title={badge.description}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-xp">+{badge.xp} XP</span>
                {!earned && <div className="badge-lock">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Levels Overview */}
      <div className="levels-section">
        <h3>
          <DiamondOutlinedIcon />
          Darajalar
        </h3>
        <div className="levels-list">
          {LEVELS.map(level => (
            <div 
              key={level.level}
              className={`level-item ${xp >= level.minXP ? 'unlocked' : 'locked'} ${currentLevel.level === level.level ? 'current' : ''}`}
            >
              <span className="level-icon-small">{level.icon}</span>
              <span className="level-name-small">{level.name}</span>
              <span className="level-xp-small">{level.minXP} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
