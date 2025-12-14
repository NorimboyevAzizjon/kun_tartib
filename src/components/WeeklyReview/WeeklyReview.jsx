import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  subWeeks
} from 'date-fns';
import { uz } from 'date-fns/locale';
import './WeeklyReview.css';

// MUI Icons
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const WeeklyReview = ({ tasks = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weekData, setWeekData] = useState(null);
  const [previousWeekData, setPreviousWeekData] = useState(null);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const prevWeekStart = startOfWeek(subWeeks(selectedWeek, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(selectedWeek, 1), { weekStartsOn: 1 });

  useEffect(() => {
    // Calculate current week data
    const currentWeekTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });

    const completed = currentWeekTasks.filter(t => t.completed);
    const incomplete = currentWeekTasks.filter(t => !t.completed);

    const dailyStats = weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTasks = currentWeekTasks.filter(t => t.date === dayStr);
      return {
        date: day,
        total: dayTasks.length,
        completed: dayTasks.filter(t => t.completed).length,
        incomplete: dayTasks.filter(t => !t.completed).length
      };
    });

    const categoryStats = {};
    currentWeekTasks.forEach(task => {
      if (!categoryStats[task.category]) {
        categoryStats[task.category] = { total: 0, completed: 0 };
      }
      categoryStats[task.category].total++;
      if (task.completed) {
        categoryStats[task.category].completed++;
      }
    });

    const priorityStats = {};
    currentWeekTasks.forEach(task => {
      if (!priorityStats[task.priority]) {
        priorityStats[task.priority] = { total: 0, completed: 0 };
      }
      priorityStats[task.priority].total++;
      if (task.completed) {
        priorityStats[task.priority].completed++;
      }
    });

    setWeekData({
      total: currentWeekTasks.length,
      completed: completed.length,
      incomplete: incomplete.length,
      completionRate: currentWeekTasks.length > 0 
        ? Math.round((completed.length / currentWeekTasks.length) * 100) 
        : 0,
      dailyStats,
      categoryStats,
      priorityStats,
      mostProductiveDay: dailyStats.reduce((max, day) => 
        day.completed > max.completed ? day : max, dailyStats[0]),
      tasks: currentWeekTasks
    });

    // Calculate previous week data for comparison
    const prevWeekTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: prevWeekStart, end: prevWeekEnd });
    });

    const prevCompleted = prevWeekTasks.filter(t => t.completed);
    setPreviousWeekData({
      total: prevWeekTasks.length,
      completed: prevCompleted.length,
      completionRate: prevWeekTasks.length > 0 
        ? Math.round((prevCompleted.length / prevWeekTasks.length) * 100) 
        : 0
    });
  }, [selectedWeek, tasks]);

  const goToPreviousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    if (nextWeek <= new Date()) {
      setSelectedWeek(nextWeek);
    }
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const getComparisonIcon = (current, previous) => {
    if (current > previous) return <TrendingUpIcon className="trend-up" />;
    if (current < previous) return <TrendingDownIcon className="trend-down" />;
    return null;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      work: '💼',
      study: '📚',
      home: '🏠',
      personal: '👤',
      health: '🏃'
    };
    return icons[category] || '📝';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      work: 'Ish',
      study: 'O\'qish',
      home: 'Uy',
      personal: 'Shaxsiy',
      health: 'Sog\'lom'
    };
    return labels[category] || category;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: '🔴 Yuqori',
      medium: '🟡 O\'rta',
      low: '🟢 Past'
    };
    return labels[priority] || priority;
  };

  const exportReport = () => {
    if (!weekData) return;

    const report = `
HAFTALIK HISOBOT
================

Davr: ${format(weekStart, 'dd MMMM', { locale: uz })} - ${format(weekEnd, 'dd MMMM yyyy', { locale: uz })}

UMUMIY STATISTIKA
-----------------
Jami vazifalar: ${weekData.total}
Bajarilgan: ${weekData.completed}
Bajarilmagan: ${weekData.incomplete}
Bajarilish darajasi: ${weekData.completionRate}%

KUNLIK STATISTIKA
-----------------
${weekData.dailyStats.map(day => 
  `${format(day.date, 'EEEE', { locale: uz })}: ${day.completed}/${day.total} bajarildi`
).join('\n')}

KATEGORIYALAR BO'YICHA
----------------------
${Object.entries(weekData.categoryStats).map(([cat, stats]) => 
  `${getCategoryLabel(cat)}: ${stats.completed}/${stats.total} bajarildi`
).join('\n')}

IMTIYOZ BO'YICHA
----------------
${Object.entries(weekData.priorityStats).map(([prio, stats]) => 
  `${prio === 'high' ? 'Yuqori' : prio === 'medium' ? 'O\'rta' : 'Past'}: ${stats.completed}/${stats.total} bajarildi`
).join('\n')}

${weekData.mostProductiveDay ? `
ENG SAMARALI KUN
----------------
${format(weekData.mostProductiveDay.date, 'EEEE, dd MMMM', { locale: uz })} - ${weekData.mostProductiveDay.completed} vazifa bajarildi
` : ''}

---
Kun Tartibi ilovasi bilan yaratildi
${format(new Date(), 'dd.MM.yyyy HH:mm')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haftalik-hisobot-${format(weekStart, 'yyyy-MM-dd')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!weekData) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  const isCurrentWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <div className="weekly-review">
      {/* Header */}
      <div className="review-header">
        <div className="header-info">
          <AssessmentOutlinedIcon className="header-icon" />
          <div>
            <h1>Haftalik Hisobot</h1>
            <p>Hafta davomidagi yutuqlaringizni ko'ring</p>
          </div>
        </div>
        <button className="export-btn" onClick={exportReport}>
          <DownloadIcon />
          Hisobotni yuklab olish
        </button>
      </div>

      {/* Week Selector */}
      <div className="week-selector">
        <button className="nav-btn" onClick={goToPreviousWeek}>
          <ChevronLeftIcon />
        </button>
        <div className="week-display">
          <CalendarTodayOutlinedIcon />
          <span>
            {format(weekStart, 'dd MMM', { locale: uz })} - {format(weekEnd, 'dd MMM yyyy', { locale: uz })}
          </span>
          {isCurrentWeek && <span className="current-badge">Joriy hafta</span>}
        </div>
        <button 
          className="nav-btn" 
          onClick={goToNextWeek}
          disabled={isCurrentWeek}
        >
          <ChevronRightIcon />
        </button>
        {!isCurrentWeek && (
          <button className="today-btn" onClick={goToCurrentWeek}>
            Bugun
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-value">{weekData.total}</span>
            <span className="card-label">Jami vazifalar</span>
          </div>
          {previousWeekData && (
            <div className="comparison">
              {getComparisonIcon(weekData.total, previousWeekData.total)}
              <span>{weekData.total - previousWeekData.total >= 0 ? '+' : ''}{weekData.total - previousWeekData.total}</span>
            </div>
          )}
        </div>

        <div className="summary-card completed">
          <div className="card-icon"><CheckCircleOutlineIcon /></div>
          <div className="card-content">
            <span className="card-value">{weekData.completed}</span>
            <span className="card-label">Bajarilgan</span>
          </div>
          {previousWeekData && (
            <div className="comparison">
              {getComparisonIcon(weekData.completed, previousWeekData.completed)}
              <span>{weekData.completed - previousWeekData.completed >= 0 ? '+' : ''}{weekData.completed - previousWeekData.completed}</span>
            </div>
          )}
        </div>

        <div className="summary-card incomplete">
          <div className="card-icon"><CancelOutlinedIcon /></div>
          <div className="card-content">
            <span className="card-value">{weekData.incomplete}</span>
            <span className="card-label">Bajarilmagan</span>
          </div>
        </div>

        <div className="summary-card rate">
          <div className="card-icon"><EmojiEventsOutlinedIcon /></div>
          <div className="card-content">
            <span className="card-value">{weekData.completionRate}%</span>
            <span className="card-label">Bajarilish darajasi</span>
          </div>
          {previousWeekData && (
            <div className="comparison">
              {getComparisonIcon(weekData.completionRate, previousWeekData.completionRate)}
              <span>{weekData.completionRate - previousWeekData.completionRate >= 0 ? '+' : ''}{weekData.completionRate - previousWeekData.completionRate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Chart */}
      <div className="chart-section">
        <h2>📅 Kunlik statistika</h2>
        <div className="daily-chart">
          {weekData.dailyStats.map((day, index) => (
            <div key={index} className="day-bar">
              <div className="bar-container">
                <div 
                  className="bar completed-bar"
                  style={{ 
                    height: `${day.total > 0 ? (day.completed / Math.max(...weekData.dailyStats.map(d => d.total))) * 100 : 0}%` 
                  }}
                  title={`${day.completed} bajarildi`}
                />
                <div 
                  className="bar incomplete-bar"
                  style={{ 
                    height: `${day.total > 0 ? (day.incomplete / Math.max(...weekData.dailyStats.map(d => d.total))) * 100 : 0}%` 
                  }}
                  title={`${day.incomplete} bajarilmadi`}
                />
              </div>
              <span className="day-label">{format(day.date, 'EEE', { locale: uz })}</span>
              <span className="day-count">{day.completed}/{day.total}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span><span className="legend-dot completed"></span> Bajarilgan</span>
          <span><span className="legend-dot incomplete"></span> Bajarilmagan</span>
        </div>
      </div>

      {/* Category Stats */}
      <div className="stats-row">
        <div className="stats-section">
          <h2>📂 Kategoriyalar bo'yicha</h2>
          <div className="category-stats">
            {Object.entries(weekData.categoryStats).length > 0 ? (
              Object.entries(weekData.categoryStats).map(([category, stats]) => (
                <div key={category} className="stat-item">
                  <div className="stat-info">
                    <span className="stat-icon">{getCategoryIcon(category)}</span>
                    <span className="stat-name">{getCategoryLabel(category)}</span>
                  </div>
                  <div className="stat-bar">
                    <div 
                      className="stat-fill"
                      style={{ 
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="stat-value">{stats.completed}/{stats.total}</span>
                </div>
              ))
            ) : (
              <p className="no-data">Ma'lumot yo'q</p>
            )}
          </div>
        </div>

        <div className="stats-section">
          <h2>⚡ Imtiyoz bo'yicha</h2>
          <div className="priority-stats">
            {Object.entries(weekData.priorityStats).length > 0 ? (
              Object.entries(weekData.priorityStats).map(([priority, stats]) => (
                <div key={priority} className="stat-item">
                  <div className="stat-info">
                    <span className="stat-name">{getPriorityLabel(priority)}</span>
                  </div>
                  <div className="stat-bar">
                    <div 
                      className={`stat-fill priority-${priority}`}
                      style={{ 
                        width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="stat-value">{stats.completed}/{stats.total}</span>
                </div>
              ))
            ) : (
              <p className="no-data">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Productive Day */}
      {weekData.mostProductiveDay && weekData.mostProductiveDay.completed > 0 && (
        <div className="highlight-section">
          <div className="highlight-card">
            <span className="highlight-icon">🏆</span>
            <div className="highlight-content">
              <h3>Eng samarali kun</h3>
              <p>{format(weekData.mostProductiveDay.date, 'EEEE, dd MMMM', { locale: uz })}</p>
              <span className="highlight-stat">{weekData.mostProductiveDay.completed} vazifa bajarildi</span>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="motivation-section">
        {weekData.completionRate >= 80 ? (
          <div className="motivation excellent">
            <span className="motivation-icon">🎉</span>
            <p>Ajoyib hafta! Siz {weekData.completionRate}% vazifalarni bajardingiz. Shu ruhda davom eting!</p>
          </div>
        ) : weekData.completionRate >= 50 ? (
          <div className="motivation good">
            <span className="motivation-icon">💪</span>
            <p>Yaxshi ish! {weekData.completionRate}% bajarilish - yomon emas. Keyingi hafta yana yaxshiroq bo'ladi!</p>
          </div>
        ) : weekData.total > 0 ? (
          <div className="motivation improve">
            <span className="motivation-icon">🌱</span>
            <p>Har bir qadam muhim! Keyingi hafta yanada ko'proq vazifalarni bajaring.</p>
          </div>
        ) : (
          <div className="motivation empty">
            <span className="motivation-icon">📝</span>
            <p>Bu hafta vazifalar yo'q. Yangi hafta uchun rejalashtiring!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReview;
