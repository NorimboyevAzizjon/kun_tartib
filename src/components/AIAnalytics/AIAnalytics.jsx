import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, differenceInMinutes, getHours, getDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import './AIAnalytics.css';

// MUI Icons
import InsightsIcon from '@mui/icons-material/Insights';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CategoryIcon from '@mui/icons-material/Category';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RefreshIcon from '@mui/icons-material/Refresh';

const AIAnalytics = () => {
  const [tasks, setTasks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Vazifalarni yuklash
  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedTasks = localStorage.getItem('kun-tartibi-tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Vazifalarni yuklashda xato:', error);
      }
      
      // Tahlil animatsiyasi
      setTimeout(() => setIsAnalyzing(false), 1500);
    };
    
    loadTasks();
  }, []);

  // Tahlil natijalari
  const analytics = useMemo(() => {
    if (tasks.length === 0) return null;

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    // Vaqt bo'yicha tahlil
    const hourlyStats = {};
    const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const categoryStats = {};
    const priorityStats = { high: 0, medium: 0, low: 0 };
    
    completedTasks.forEach(task => {
      // Soatlik statistika
      if (task.time) {
        const hour = parseInt(task.time.split(':')[0]);
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      }
      
      // Hafta kuni statistikasi
      if (task.completedAt || task.updatedAt) {
        const completedDate = new Date(task.completedAt || task.updatedAt);
        const day = getDay(completedDate);
        dayStats[day]++;
      }
      
      // Kategoriya statistikasi
      const cat = task.category || 'personal';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      
      // Muhimlik statistikasi
      const priority = task.priority || 'medium';
      priorityStats[priority]++;
    });

    // Eng samarali soatni topish
    let bestHour = null;
    let maxCompleted = 0;
    Object.entries(hourlyStats).forEach(([hour, count]) => {
      if (count > maxCompleted) {
        maxCompleted = count;
        bestHour = parseInt(hour);
      }
    });

    // Eng samarali kunni topish
    const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    let bestDay = null;
    let maxDayCompleted = 0;
    Object.entries(dayStats).forEach(([day, count]) => {
      if (count > maxDayCompleted) {
        maxDayCompleted = count;
        bestDay = parseInt(day);
      }
    });

    // Eng ko'p ishlangan kategoriya
    let topCategory = null;
    let maxCatCount = 0;
    Object.entries(categoryStats).forEach(([cat, count]) => {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCategory = cat;
      }
    });

    // Unumdorlik foizi
    const productivityRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;

    // Haftalik trend
    const thisWeekStart = startOfWeek(new Date(), { locale: uz });
    const thisWeekEnd = endOfWeek(new Date(), { locale: uz });
    const thisWeekTasks = completedTasks.filter(t => {
      const date = new Date(t.completedAt || t.updatedAt || t.createdAt);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });

    // O'tgan hafta
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekEnd);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    const lastWeekTasks = completedTasks.filter(t => {
      const date = new Date(t.completedAt || t.updatedAt || t.createdAt);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    const weeklyTrend = thisWeekTasks.length - lastWeekTasks.length;
    const trendPercentage = lastWeekTasks.length > 0 
      ? Math.round(((thisWeekTasks.length - lastWeekTasks.length) / lastWeekTasks.length) * 100)
      : 0;

    // O'rtacha kunlik vazifalar
    const uniqueDays = new Set(completedTasks.map(t => {
      const date = new Date(t.completedAt || t.updatedAt || t.createdAt);
      return format(date, 'yyyy-MM-dd');
    }));
    const avgDailyTasks = uniqueDays.size > 0 
      ? Math.round(completedTasks.length / uniqueDays.size * 10) / 10
      : 0;

    return {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      productivityRate,
      bestHour,
      bestDay: bestDay !== null ? dayNames[bestDay] : null,
      topCategory,
      categoryStats,
      priorityStats,
      hourlyStats,
      dayStats,
      weeklyTrend,
      trendPercentage,
      thisWeekCompleted: thisWeekTasks.length,
      lastWeekCompleted: lastWeekTasks.length,
      avgDailyTasks,
      dayNames
    };
  }, [tasks]);

  // AI Tavsiyalar
  const recommendations = useMemo(() => {
    if (!analytics) return [];

    const tips = [];

    // Vaqt bo'yicha tavsiya
    if (analytics.bestHour !== null) {
      const timeRange = analytics.bestHour < 12 ? 'ertalab' : analytics.bestHour < 17 ? 'tushdan keyin' : 'kechqurun';
      tips.push({
        icon: <AccessTimeIcon />,
        title: 'Eng Samarali Vaqtingiz',
        text: `Siz ${analytics.bestHour}:00 - ${analytics.bestHour + 1}:00 oralig'ida (${timeRange}) eng ko'p vazifa bajaryapsiz. Bu vaqtda muhim ishlarni rejalashtiring.`,
        type: 'time',
        priority: 'high'
      });
    }

    // Kun bo'yicha tavsiya
    if (analytics.bestDay) {
      tips.push({
        icon: <ScheduleIcon />,
        title: 'Eng Samarali Kuningiz',
        text: `${analytics.bestDay} kuni siz eng ko'p vazifa bajaryapsiz. Bu kunga muhim loyihalarni rejalashtiring.`,
        type: 'day',
        priority: 'high'
      });
    }

    // Unumdorlik tavsiyasi
    if (analytics.productivityRate < 50) {
      tips.push({
        icon: <TrendingUpIcon />,
        title: 'Unumdorlikni Oshiring',
        text: 'Vazifalarni kichikroq qismlarga bo\'ling. Pomodoro texnikasidan foydalaning - 25 daqiqa ishlang, 5 daqiqa dam oling.',
        type: 'productivity',
        priority: 'warning'
      });
    } else if (analytics.productivityRate >= 80) {
      tips.push({
        icon: <EmojiEventsIcon />,
        title: 'Ajoyib Natija!',
        text: `Sizning unumdorligingiz ${analytics.productivityRate}%! Shu ritmda davom eting. O'zingizni mukofotlang!`,
        type: 'achievement',
        priority: 'success'
      });
    }

    // Haftalik trend
    if (analytics.weeklyTrend > 0) {
      tips.push({
        icon: <TrendingUpIcon />,
        title: 'Yaxshi Trend!',
        text: `Bu hafta o'tgan haftaga nisbatan ${analytics.weeklyTrend} ta ko'proq vazifa bajardingiz (+${analytics.trendPercentage}%). Davom eting!`,
        type: 'trend',
        priority: 'success'
      });
    } else if (analytics.weeklyTrend < 0) {
      tips.push({
        icon: <TrendingDownIcon />,
        title: 'Diqqat!',
        text: `Bu hafta o'tgan haftaga nisbatan ${Math.abs(analytics.weeklyTrend)} ta kam vazifa bajardingiz. Sabab nima? Rejani ko'rib chiqing.`,
        type: 'trend',
        priority: 'warning'
      });
    }

    // Kategoriya tavsiyasi
    const categoryNames = {
      work: 'Ish',
      study: "O'qish",
      home: 'Uy ishlari',
      personal: 'Shaxsiy',
      health: "Sog'liq"
    };
    
    if (analytics.topCategory) {
      tips.push({
        icon: <CategoryIcon />,
        title: 'Asosiy Yo\'nalishingiz',
        text: `Siz eng ko'p "${categoryNames[analytics.topCategory] || analytics.topCategory}" kategoriyasida vazifa bajaryapsiz. Balansni saqlash uchun boshqa sohalarga ham e'tibor bering.`,
        type: 'category',
        priority: 'info'
      });
    }

    // Muhimlik bo'yicha tavsiya
    if (analytics.priorityStats.high > analytics.priorityStats.low * 2) {
      tips.push({
        icon: <LocalFireDepartmentIcon />,
        title: 'Stress Darajasi',
        text: 'Juda ko\'p yuqori muhimlikdagi vazifalaringiz bor. Ba\'zilarini delegatsiya qiling yoki keyinroqqa qo\'ying.',
        type: 'priority',
        priority: 'warning'
      });
    }

    // Kunlik o'rtacha
    if (analytics.avgDailyTasks < 3) {
      tips.push({
        icon: <SpeedIcon />,
        title: 'Kunlik Maqsad',
        text: 'Kuniga kamida 3-5 ta vazifa bajarishga harakat qiling. Kichik g\'alabalar katta natijalarga olib keladi.',
        type: 'daily',
        priority: 'info'
      });
    } else if (analytics.avgDailyTasks > 10) {
      tips.push({
        icon: <PsychologyIcon />,
        title: 'Dam Olishni Unutmang',
        text: `Kuniga o'rtacha ${analytics.avgDailyTasks} ta vazifa - bu juda ko'p! Sifatga e'tibor bering, sog'lig'ingizni saqlang.`,
        type: 'health',
        priority: 'warning'
      });
    }

    // Umumiy tavsiyalar
    tips.push({
      icon: <LightbulbIcon />,
      title: 'Pro Maslahat',
      text: 'Har kuni ertalab 3 ta eng muhim vazifani belgilang (MIT - Most Important Tasks). Ularni birinchi bajaring.',
      type: 'tip',
      priority: 'info'
    });

    return tips;
  }, [analytics]);

  // Refresh function
  const handleRefresh = () => {
    setIsAnalyzing(true);
    const savedTasks = localStorage.getItem('kun-tartibi-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  if (isAnalyzing) {
    return (
      <div className="ai-analytics-loading">
        <div className="loading-content">
          <PsychologyIcon className="brain-icon" />
          <div className="loading-text">
            <h3>AI Tahlil qilmoqda...</h3>
            <p>Vazifalaringiz tahlil qilinmoqda</p>
          </div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || tasks.length === 0) {
    return (
      <div className="ai-analytics-empty">
        <InsightsIcon className="empty-icon" />
        <h3>Ma'lumotlar yetarli emas</h3>
        <p>Tahlil uchun kamida bir nechta vazifa bajaring</p>
      </div>
    );
  }

  const categoryNames = {
    work: 'Ish',
    study: "O'qish",
    home: 'Uy',
    personal: 'Shaxsiy',
    health: "Sog'liq"
  };

  const categoryColors = {
    work: '#6366f1',
    study: '#10b981',
    home: '#f59e0b',
    personal: '#8b5cf6',
    health: '#3b82f6'
  };

  return (
    <div className="ai-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-title">
          <PsychologyIcon className="header-icon" />
          <div>
            <h2>AI Tahlil va Tavsiyalar</h2>
            <p>Shaxsiy unumdorlik tahlili</p>
          </div>
        </div>
        <button className="refresh-btn" onClick={handleRefresh}>
          <RefreshIcon /> Yangilash
        </button>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <AutoGraphIcon /> Umumiy
        </button>
        <button 
          className={`tab-btn ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          <AccessTimeIcon /> Vaqt Tahlili
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          <TipsAndUpdatesIcon /> Tavsiyalar
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card productivity">
              <div className="stat-icon"><SpeedIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{analytics.productivityRate}%</span>
                <span className="stat-label">Unumdorlik</span>
              </div>
              <div className="stat-bar">
                <div 
                  className="bar-fill" 
                  style={{ width: `${analytics.productivityRate}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card completed">
              <div className="stat-icon"><EmojiEventsIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{analytics.completed}</span>
                <span className="stat-label">Bajarilgan</span>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon"><ScheduleIcon /></div>
              <div className="stat-info">
                <span className="stat-value">{analytics.pending}</span>
                <span className="stat-label">Kutilmoqda</span>
              </div>
            </div>

            <div className="stat-card trend">
              <div className="stat-icon">
                {analytics.weeklyTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </div>
              <div className="stat-info">
                <span className={`stat-value ${analytics.weeklyTrend >= 0 ? 'positive' : 'negative'}`}>
                  {analytics.weeklyTrend >= 0 ? '+' : ''}{analytics.weeklyTrend}
                </span>
                <span className="stat-label">Haftalik trend</span>
              </div>
            </div>
          </div>

          {/* Best Performance */}
          <div className="best-performance">
            <h3><WorkspacePremiumIcon /> Eng Yaxshi Ko'rsatkichlar</h3>
            <div className="performance-cards">
              {analytics.bestHour !== null && (
                <div className="perf-card">
                  <AccessTimeIcon />
                  <div>
                    <span className="perf-value">{analytics.bestHour}:00</span>
                    <span className="perf-label">Eng samarali soat</span>
                  </div>
                </div>
              )}
              {analytics.bestDay && (
                <div className="perf-card">
                  <ScheduleIcon />
                  <div>
                    <span className="perf-value">{analytics.bestDay}</span>
                    <span className="perf-label">Eng samarali kun</span>
                  </div>
                </div>
              )}
              <div className="perf-card">
                <AutoGraphIcon />
                <div>
                  <span className="perf-value">{analytics.avgDailyTasks}</span>
                  <span className="perf-label">O'rtacha kunlik</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="category-distribution">
            <h3><CategoryIcon /> Kategoriya bo'yicha</h3>
            <div className="category-bars">
              {Object.entries(analytics.categoryStats).map(([cat, count]) => (
                <div key={cat} className="category-item">
                  <div className="cat-header">
                    <span className="cat-name">{categoryNames[cat] || cat}</span>
                    <span className="cat-count">{count} ta</span>
                  </div>
                  <div className="cat-bar">
                    <div 
                      className="cat-fill"
                      style={{ 
                        width: `${(count / analytics.completed) * 100}%`,
                        backgroundColor: categoryColors[cat] || '#6366f1'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Analysis Tab */}
      {activeTab === 'time' && (
        <div className="analytics-content">
          {/* Hourly Chart */}
          <div className="time-chart">
            <h3><AccessTimeIcon /> Soatlik Faollik</h3>
            <div className="hourly-chart">
              {Array.from({ length: 24 }, (_, i) => {
                const count = analytics.hourlyStats[i] || 0;
                const maxCount = Math.max(...Object.values(analytics.hourlyStats), 1);
                const height = (count / maxCount) * 100;
                const isBestHour = i === analytics.bestHour;
                
                return (
                  <div key={i} className={`hour-bar ${isBestHour ? 'best' : ''}`}>
                    <div 
                      className="bar-fill" 
                      style={{ height: `${height}%` }}
                      title={`${i}:00 - ${count} ta vazifa`}
                    >
                      {count > 0 && <span className="bar-value">{count}</span>}
                    </div>
                    <span className="hour-label">{i}</span>
                  </div>
                );
              })}
            </div>
            <p className="chart-note">
              💡 {analytics.bestHour !== null 
                ? `Eng samarali vaqtingiz: ${analytics.bestHour}:00 - ${analytics.bestHour + 1}:00`
                : 'Hali yetarli ma\'lumot yo\'q'}
            </p>
          </div>

          {/* Weekly Chart */}
          <div className="time-chart">
            <h3><ScheduleIcon /> Haftalik Faollik</h3>
            <div className="weekly-chart">
              {analytics.dayNames.map((day, i) => {
                const count = analytics.dayStats[i] || 0;
                const maxCount = Math.max(...Object.values(analytics.dayStats), 1);
                const height = (count / maxCount) * 100;
                const isBestDay = day === analytics.bestDay;
                
                return (
                  <div key={i} className={`day-bar ${isBestDay ? 'best' : ''}`}>
                    <div 
                      className="bar-fill" 
                      style={{ height: `${height}%` }}
                    >
                      {count > 0 && <span className="bar-value">{count}</span>}
                    </div>
                    <span className="day-label">{day.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
            <p className="chart-note">
              💡 {analytics.bestDay 
                ? `Eng samarali kuningiz: ${analytics.bestDay}`
                : 'Hali yetarli ma\'lumot yo\'q'}
            </p>
          </div>

          {/* Week Comparison */}
          <div className="week-comparison">
            <h3><TrendingUpIcon /> Hafta Solishtiruvi</h3>
            <div className="comparison-cards">
              <div className="comp-card this-week">
                <span className="comp-label">Bu hafta</span>
                <span className="comp-value">{analytics.thisWeekCompleted}</span>
                <span className="comp-unit">vazifa</span>
              </div>
              <div className="comp-vs">VS</div>
              <div className="comp-card last-week">
                <span className="comp-label">O'tgan hafta</span>
                <span className="comp-value">{analytics.lastWeekCompleted}</span>
                <span className="comp-unit">vazifa</span>
              </div>
            </div>
            <div className={`trend-badge ${analytics.weeklyTrend >= 0 ? 'positive' : 'negative'}`}>
              {analytics.weeklyTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {analytics.weeklyTrend >= 0 ? '+' : ''}{analytics.trendPercentage}% o'zgarish
            </div>
          </div>
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="analytics-content">
          <div className="recommendations">
            <h3><TipsAndUpdatesIcon /> Shaxsiy Tavsiyalar</h3>
            <div className="tips-list">
              {recommendations.map((tip, index) => (
                <div key={index} className={`tip-card ${tip.priority}`}>
                  <div className="tip-icon">{tip.icon}</div>
                  <div className="tip-content">
                    <h4>{tip.title}</h4>
                    <p>{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;
