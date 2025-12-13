import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  subDays,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { uz } from 'date-fns/locale';
import WeeklyChart from '../components/Charts/WeeklyChart';
import TaskSummary from '../components/Statistics/TaskSummary';
import './DashboardPage.css';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  // Load tasks from localStorage
  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedTasks = localStorage.getItem('schedule-tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.error('Vazifalarni yuklashda xato:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    // Listen for storage changes from other tabs
    window.addEventListener('storage', loadTasks);
    
    // Load initial data every 30 seconds
    const interval = setInterval(loadTasks, 30000);
    
    return () => {
      window.removeEventListener('storage', loadTasks);
      clearInterval(interval);
    };
  }, []);

  // Calculate statistics based on time range
  const { stats, filteredTasks, weeklyData, monthlyData } = useMemo(() => {
    const now = new Date();
    let dateFilter = () => true;

    switch (timeRange) {
      case 'today':
        dateFilter = task => isSameDay(new Date(task.date), now);
        break;
      case 'week':
        const weekStart = startOfWeek(now, { locale: uz });
        const weekEnd = endOfWeek(now, { locale: uz });
        dateFilter = task => {
          const taskDate = new Date(task.date);
          return taskDate >= weekStart && taskDate <= weekEnd;
        };
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        dateFilter = task => {
          const taskDate = new Date(task.date);
          return taskDate >= monthStart && taskDate <= monthEnd;
        };
        break;
      default:
        break;
    }

    const filtered = tasks.filter(dateFilter);
    const total = filtered.length;
    const completed = filtered.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority counts
    const priorityCounts = {
      high: filtered.filter(t => t.priority === 'high').length,
      medium: filtered.filter(t => t.priority === 'medium').length,
      low: filtered.filter(t => t.priority === 'low').length
    };

    // Category counts
    const categoryCounts = {
      work: filtered.filter(t => t.category === 'work').length,
      study: filtered.filter(t => t.category === 'study').length,
      home: filtered.filter(t => t.category === 'home').length,
      personal: filtered.filter(t => t.category === 'personal').length,
      health: filtered.filter(t => t.category === 'health').length
    };

    // Weekly completion data
    const weekDays = eachDayOfInterval({
      start: startOfWeek(now, { locale: uz }),
      end: endOfWeek(now, { locale: uz })
    });

    const weeklyCompletion = weekDays.map(day => {
      const dayTasks = filtered.filter(task => 
        isSameDay(new Date(task.date), day)
      );
      const completedTasks = dayTasks.filter(t => t.completed).length;
      return {
        day: format(day, 'EEEEEE', { locale: uz }),
        count: dayTasks.length,
        completed: completedTasks,
        rate: dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0
      };
    });

    // Monthly trend
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, i);
      return {
        date: format(date, 'dd.MM'),
        tasks: filtered.filter(task => isSameDay(new Date(task.date), date)).length
      };
    }).reverse();

    return {
      stats: {
        total,
        completed,
        pending,
        completionRate,
        priorityCounts,
        categoryCounts,
        dailyAverage: timeRange === 'month' ? (total / 30).toFixed(1) : (total / 7).toFixed(1)
      },
      filteredTasks: filtered,
      weeklyData: weeklyCompletion,
      monthlyData: last30Days
    };
  }, [tasks, timeRange]);

  // Get performance grade
  const getPerformanceGrade = (rate) => {
    if (rate >= 90) return { grade: 'A+', color: '#10b981', label: 'Ajoyib' };
    if (rate >= 80) return { grade: 'A', color: '#34d399', label: 'Yaxshi' };
    if (rate >= 70) return { grade: 'B+', color: '#fbbf24', label: 'Qoniqarli' };
    if (rate >= 60) return { grade: 'B', color: '#f59e0b', label: 'O\'rtacha' };
    if (rate >= 50) return { grade: 'C', color: '#f97316', label: 'Yomon emas' };
    return { grade: 'D', color: '#ef4444', label: 'Yaxshilash kerak' };
  };

  const performance = getPerformanceGrade(stats.completionRate);

  // Export data function
  const handleExportData = () => {
    const data = {
      tasks,
      exportDate: new Date().toISOString(),
      stats: {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        completionRate: stats.completionRate
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kun-tartibi-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data function
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tasks && Array.isArray(data.tasks)) {
          localStorage.setItem('schedule-tasks', JSON.stringify(data.tasks));
          setTasks(data.tasks);
          alert('Ma\'lumotlar muvaffaqiyatli yuklandi!');
        } else {
          alert('Noto\'g\'ri format!');
        }
      } catch (error) {
        alert('Faylni o\'qishda xato!');
      }
    };
    reader.readAsText(file);
  };

  // Clear data function
  const handleClearData = () => {
    if (window.confirm('Barcha ma\'lumotlarni o\'chirishni tasdiqlaysizmi?')) {
      localStorage.removeItem('schedule-tasks');
      setTasks([]);
      alert('Barcha ma\'lumotlar o\'chirildi!');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page loading">
        <div className="loader">
          <div className="loader-icon">📊</div>
          <p>Statistikalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <header className="dashboard-header glass-effect">
        <div className="header-content fade-in">
          <Link to="/" className="header-icon-wrapper icon-link">
            <span className="header-icon">📊</span>
          </Link>
          <div className="header-text">
            <h1>Statistika Dashboard</h1>
            <p className="header-subtitle">
              Vazifalaringizning to'liq statistik tahlili
            </p>
          </div>
        </div>

        <div className="time-range-selector slide-in">
          <button 
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            <span className="btn-icon">📅</span>
            <span className="btn-text">Barchasi</span>
          </button>
          <button 
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            <span className="btn-icon">📆</span>
            <span className="btn-text">Oylik</span>
          </button>
          <button 
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">Haftalik</span>
          </button>
          <button 
            className={`range-btn ${timeRange === 'today' ? 'active' : ''}`}
            onClick={() => setTimeRange('today')}
          >
            <span className="btn-icon">☀️</span>
            <span className="btn-text">Bugungi</span>
          </button>
        </div>

        <div className="header-stats fade-in">
          <div className="stat-tag">
            <span className="tag-icon">🔄</span>
            <span className="tag-text">
              {timeRange === 'all' && 'Barcha vaqt'}
              {timeRange === 'month' && 'Oxirgi 30 kun'}
              {timeRange === 'week' && 'Hafta davomida'}
              {timeRange === 'today' && 'Bugun'}
            </span>
          </div>
          <div className="stat-tag performance-tag" style={{ '--perf-color': performance.color }}>
            <span className="tag-icon">🏆</span>
            <span className="tag-text">{performance.grade} - {performance.label}</span>
          </div>
        </div>
      </header>

      {/* Task Summary Widget */}
      <div className="summary-section">
        <TaskSummary tasks={filteredTasks} />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card full-width card-hover">
          <div className="chart-header">
            <h3 className="chart-title">
              <span className="chart-icon">📊</span>
              Haftalik Faollik
            </h3>
            <div className="chart-subtitle">
              {format(startOfWeek(new Date(), { locale: uz }), 'dd MMM', { locale: uz })} - 
              {format(endOfWeek(new Date(), { locale: uz }), 'dd MMM', { locale: uz })}
            </div>
          </div>
          <WeeklyChart tasks={filteredTasks} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;