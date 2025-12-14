import React, { useMemo } from 'react';
import { 
  format, 
  startOfDay, 
  subDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { uz } from 'date-fns/locale';
import './StreakCounter.css';

// MUI Icons
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

const StreakCounter = ({ tasks = [] }) => {
  const streakData = useMemo(() => {
    const today = startOfDay(new Date());
    const completedDates = new Set();
    
    // Barcha bajarilgan vazifalar sanalarini yig'ish
    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const date = format(startOfDay(parseISO(task.completedAt)), 'yyyy-MM-dd');
        completedDates.add(date);
      } else if (task.completed && task.date) {
        completedDates.add(task.date);
      }
    });

    // Joriy streak hisoblash
    let currentStreak = 0;
    let checkDate = today;
    
    // Bugun bajarilgan vazifa bor-yo'qligini tekshirish
    const todayKey = format(today, 'yyyy-MM-dd');
    if (completedDates.has(todayKey)) {
      currentStreak = 1;
      checkDate = subDays(today, 1);
    }
    
    // Ketma-ket kunlarni hisoblash
    while (true) {
      const dateKey = format(checkDate, 'yyyy-MM-dd');
      if (completedDates.has(dateKey)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // Eng uzun streak hisoblash
    let longestStreak = 0;
    let tempStreak = 0;
    let longestStreakStart = null;
    let longestStreakEnd = null;
    
    // Oxirgi 365 kunni tekshirish
    const yearAgo = subDays(today, 365);
    const allDays = eachDayOfInterval({ start: yearAgo, end: today });
    
    allDays.forEach((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      if (completedDates.has(dateKey)) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
          longestStreakEnd = day;
          longestStreakStart = subDays(day, tempStreak - 1);
        }
      } else {
        tempStreak = 0;
      }
    });

    // Haftalik aktivlik
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });
    
    const weeklyActivity = last7Days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.date === dateKey);
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      return {
        date: day,
        dayName: format(day, 'EEE', { locale: uz }),
        completed,
        total,
        hasActivity: completed > 0,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    // Oylik statistika
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today
    });
    
    const monthlyData = last30Days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        date: day,
        hasActivity: completedDates.has(dateKey)
      };
    });

    const activeDaysThisMonth = monthlyData.filter(d => d.hasActivity).length;
    const totalCompletedTasks = tasks.filter(t => t.completed).length;

    return {
      currentStreak,
      longestStreak,
      longestStreakStart,
      longestStreakEnd,
      weeklyActivity,
      monthlyData,
      activeDaysThisMonth,
      totalCompletedTasks,
      todayCompleted: completedDates.has(todayKey)
    };
  }, [tasks]);

  // Streak badge aniqlash
  const getStreakBadge = (streak) => {
    if (streak >= 100) return { icon: <DiamondIcon />, label: 'Diamond', color: '#00bcd4' };
    if (streak >= 50) return { icon: <MilitaryTechIcon />, label: 'Platinum', color: '#9c27b0' };
    if (streak >= 30) return { icon: <EmojiEventsIcon />, label: 'Gold', color: '#ffd700' };
    if (streak >= 14) return { icon: <StarIcon />, label: 'Silver', color: '#c0c0c0' };
    if (streak >= 7) return { icon: <WhatshotIcon />, label: 'Bronze', color: '#cd7f32' };
    return { icon: <LocalFireDepartmentIcon />, label: 'Starter', color: '#ff5722' };
  };

  const badge = getStreakBadge(streakData.currentStreak);

  return (
    <div className="streak-counter glass-effect">
      {/* Header */}
      <div className="streak-header">
        <div className="streak-icon-wrapper" style={{ background: `${badge.color}20` }}>
          <span className="streak-icon" style={{ color: badge.color }}>
            {badge.icon}
          </span>
        </div>
        <div className="streak-title">
          <h3>Produktivlik Streak</h3>
          <span className="streak-badge" style={{ background: badge.color }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Main Streak Display */}
      <div className="streak-main">
        <div className="current-streak">
          <div className="streak-flame" style={{ color: badge.color }}>
            <LocalFireDepartmentIcon style={{ fontSize: 64 }} />
            {streakData.currentStreak > 0 && (
              <span className="flame-number">{streakData.currentStreak}</span>
            )}
          </div>
          <div className="streak-info">
            <span className="streak-count">{streakData.currentStreak}</span>
            <span className="streak-label">kun ketma-ket</span>
          </div>
        </div>

        {!streakData.todayCompleted && (
          <div className="streak-warning">
            <span className="warning-icon">⚠️</span>
            <span>Bugun hali vazifa bajarmadingiz!</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="streak-stats">
        <div className="stat-card">
          <EmojiEventsIcon className="stat-icon gold" />
          <div className="stat-content">
            <span className="stat-value">{streakData.longestStreak}</span>
            <span className="stat-label">Eng uzun streak</span>
          </div>
        </div>
        
        <div className="stat-card">
          <CalendarMonthIcon className="stat-icon blue" />
          <div className="stat-content">
            <span className="stat-value">{streakData.activeDaysThisMonth}</span>
            <span className="stat-label">Faol kun (30 kun)</span>
          </div>
        </div>
        
        <div className="stat-card">
          <TrendingUpIcon className="stat-icon green" />
          <div className="stat-content">
            <span className="stat-value">{streakData.totalCompletedTasks}</span>
            <span className="stat-label">Jami bajarilgan</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="weekly-activity">
        <h4>Haftalik aktivlik</h4>
        <div className="activity-days">
          {streakData.weeklyActivity.map((day, index) => (
            <div 
              key={index} 
              className={`activity-day ${day.hasActivity ? 'active' : ''} ${isToday(day.date) ? 'today' : ''}`}
              title={`${format(day.date, 'dd MMM', { locale: uz })}: ${day.completed}/${day.total} vazifa`}
            >
              <span className="day-name">{day.dayName}</span>
              <div 
                className="day-indicator"
                style={{
                  background: day.hasActivity 
                    ? `linear-gradient(135deg, ${badge.color}, ${badge.color}99)`
                    : undefined,
                  opacity: day.hasActivity ? Math.max(0.4, day.percentage / 100) : undefined
                }}
              >
                {day.hasActivity && day.completed}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Heatmap */}
      <div className="monthly-heatmap">
        <h4>Oxirgi 30 kun</h4>
        <div className="heatmap-grid">
          {streakData.monthlyData.map((day, index) => (
            <div
              key={index}
              className={`heatmap-cell ${day.hasActivity ? 'active' : ''}`}
              title={format(day.date, 'dd MMMM', { locale: uz })}
              style={{
                background: day.hasActivity ? badge.color : undefined
              }}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Kam</span>
          <div className="legend-scale">
            <div className="legend-cell" style={{ opacity: 0.2 }} />
            <div className="legend-cell" style={{ opacity: 0.4 }} />
            <div className="legend-cell" style={{ opacity: 0.6 }} />
            <div className="legend-cell" style={{ opacity: 0.8 }} />
            <div className="legend-cell" style={{ opacity: 1, background: badge.color }} />
          </div>
          <span>Ko'p</span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="streak-motivation">
        {streakData.currentStreak === 0 ? (
          <p>🌱 Bugundan boshlang! Birinchi vazifangizni bajaring.</p>
        ) : streakData.currentStreak < 7 ? (
          <p>💪 Ajoyib boshlang'ich! 7 kunlik streak uchun {7 - streakData.currentStreak} kun qoldi.</p>
        ) : streakData.currentStreak < 14 ? (
          <p>🔥 Zo'r! 2 haftalik streak uchun {14 - streakData.currentStreak} kun qoldi.</p>
        ) : streakData.currentStreak < 30 ? (
          <p>⭐ Ajoyib! Oylik streak uchun {30 - streakData.currentStreak} kun qoldi.</p>
        ) : (
          <p>🏆 Siz legendasiz! {streakData.currentStreak} kunlik streak - bu ajoyib natija!</p>
        )}
      </div>
    </div>
  );
};

export default StreakCounter;
