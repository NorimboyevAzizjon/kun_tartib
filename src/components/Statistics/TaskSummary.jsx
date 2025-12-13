import React, { useMemo } from 'react';
import { format, isToday, isThisWeek, startOfWeek, endOfWeek } from 'date-fns';
import { uz } from 'date-fns/locale';
import './TaskSummary.css';

const TaskSummary = ({ tasks = [] }) => {
  // Stats calculations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Today's tasks
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isToday(taskDate);
    });
    
    // This week's tasks
    const weekStart = startOfWeek(new Date(), { locale: uz });
    const weekEnd = endOfWeek(new Date(), { locale: uz });
    const weeklyTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      todayTasks,
      weeklyTasks,
      todayCompleted: todayTasks.filter(t => t.completed).length,
      weeklyCompleted: weeklyTasks.filter(t => t.completed).length
    };
  }, [tasks]);

  // Category statistics
  const categories = useMemo(() => [
    { 
      name: '💼 Ish', 
      value: 'work', 
      count: tasks.filter(t => t.category === 'work').length,
      color: '#6366f1',
      icon: '💼'
    },
    { 
      name: '📚 O\'qish', 
      value: 'study', 
      count: tasks.filter(t => t.category === 'study').length,
      color: '#10b981',
      icon: '📚'
    },
    { 
      name: '🏠 Uy', 
      value: 'home', 
      count: tasks.filter(t => t.category === 'home').length,
      color: '#f59e0b',
      icon: '🏠'
    },
    { 
      name: '👤 Shaxsiy', 
      value: 'personal', 
      count: tasks.filter(t => t.category === 'personal').length,
      color: '#8b5cf6',
      icon: '👤'
    },
    { 
      name: '🏃 Sog\'lom', 
      value: 'health', 
      count: tasks.filter(t => t.category === 'health').length,
      color: '#3b82f6',
      icon: '🏃'
    }
  ], [tasks]);

  // Priority statistics
  const priorities = useMemo(() => [
    { 
      name: '🔴 Yuqori', 
      value: 'high', 
      count: tasks.filter(t => t.priority === 'high').length,
      color: '#ef4444',
      icon: '🔴'
    },
    { 
      name: '🟡 O\'rta', 
      value: 'medium', 
      count: tasks.filter(t => t.priority === 'medium').length,
      color: '#f59e0b',
      icon: '🟡'
    },
    { 
      name: '🟢 Past', 
      value: 'low', 
      count: tasks.filter(t => t.priority === 'low').length,
      color: '#10b981',
      icon: '🟢'
    }
  ], [tasks]);

  // Get most active category
  const mostActiveCategory = categories.reduce((max, cat) => 
    cat.count > max.count ? cat : max, categories[0]);

  // Get weekly average
  const weeklyAverage = Math.round(stats.weeklyTasks.length / 7) || 0;

  return (
    <div className="task-summary glass-effect card-hover">
      <div className="summary-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <span className="header-icon">📊</span>
          </div>
          <div className="header-text">
            <h3>Vazifalar Tahlili</h3>
            <p className="header-subtitle">Real vaqt statistikasi</p>
          </div>
        </div>
        
        <div className="header-stats">
          <span className="stat-badge">
            <span className="badge-icon">🔄</span>
            Yangilanadi
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="summary-grid">
        <div className="summary-card total fade-in" style={{ '--card-color': '#6366f1' }}>
          <div className="summary-icon">
            <span className="icon-emoji">📋</span>
            <div className="icon-bg"></div>
          </div>
          <div className="summary-content">
            <div className="summary-title">Jami Vazifalar</div>
            <div className="summary-number">{stats.total}</div>
            <div className="summary-trend">
              <span className="trend-icon">📈</span>
              <span className="trend-text">
                Haftada {weeklyAverage} ta
              </span>
            </div>
          </div>
        </div>

        <div className="summary-card completed fade-in" style={{ '--card-color': '#10b981' }}>
          <div className="summary-icon">
            <span className="icon-emoji">✅</span>
            <div className="icon-bg"></div>
          </div>
          <div className="summary-content">
            <div className="summary-title">Bajarilgan</div>
            <div className="summary-number">{stats.completed}</div>
            <div className="summary-percentage">
              {stats.completionRate}<span className="percent-symbol">%</span>
            </div>
            <div className="summary-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card pending fade-in" style={{ '--card-color': '#f59e0b' }}>
          <div className="summary-icon">
            <span className="icon-emoji">⏳</span>
            <div className="icon-bg"></div>
          </div>
          <div className="summary-content">
            <div className="summary-title">Kutayotgan</div>
            <div className="summary-number">{stats.pending}</div>
            <div className="summary-subtext">
              {stats.pending > 0 ? 'Bajarilishi kerak' : 'Barchasi bajarildi!'}
            </div>
          </div>
        </div>

        <div className="summary-card today fade-in" style={{ '--card-color': '#3b82f6' }}>
          <div className="summary-icon">
            <span className="icon-emoji">📅</span>
            <div className="icon-bg"></div>
          </div>
          <div className="summary-content">
            <div className="summary-title">Bugungi</div>
            <div className="summary-number">
              {stats.todayCompleted}/{stats.todayTasks.length}
            </div>
            <div className="summary-percentage today-percentage">
              {stats.todayTasks.length > 0 
                ? `${Math.round((stats.todayCompleted / stats.todayTasks.length) * 100)}%`
                : '-'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="category-section">
        <div className="section-header">
          <h4 className="section-title">
            <span className="section-icon">🏷️</span>
            Kategoriyalar Bo'yicha
          </h4>
          <div className="section-stats">
            <span className="section-stat">
              Faol: <span className="stat-value">{mostActiveCategory.name}</span>
            </span>
          </div>
        </div>
        
        <div className="category-list">
          {categories.map((category) => {
            const percentage = stats.total > 0 
              ? Math.round((category.count / stats.total) * 100) 
              : 0;
            
            return (
              <div key={category.value} className="category-item">
                <div className="category-info">
                  <div className="category-label">
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-numbers">
                    <span className="category-count">{category.count}</span>
                    <span className="category-percentage">{percentage}%</span>
                  </div>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="priority-section">
        <div className="section-header">
          <h4 className="section-title">
            <span className="section-icon">🎯</span>
            Imtiyozlar Taqsimoti
          </h4>
        </div>
        
        <div className="priority-list">
          {priorities.map((priority) => {
            const percentage = stats.total > 0 
              ? Math.round((priority.count / stats.total) * 100) 
              : 0;
            
            return (
              <div 
                key={priority.value} 
                className="priority-item card-hover"
                style={{ '--priority-color': priority.color }}
              >
                <div className="priority-label">
                  <div className="priority-icon-wrapper">
                    <span className="priority-icon">{priority.icon}</span>
                  </div>
                  <div className="priority-text">
                    <div className="priority-name">{priority.name.split(' ')[1]}</div>
                    <div className="priority-sub">{percentage}% ulush</div>
                  </div>
                </div>
                <div className="priority-stats">
                  <div className="priority-count">{priority.count}</div>
                  <div 
                    className="priority-circle"
                    style={{ 
                      '--circle-size': `${Math.min(percentage * 3, 100)}px`
                    }}
                  >
                    <span className="circle-text">{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <div className="section-header">
          <h4 className="section-title">
            <span className="section-icon">💡</span>
            Statistik Tahlil
          </h4>
        </div>
        
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">
              <span className="insight-emoji">🎯</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Eng faol kategoriya</div>
              <div className="insight-value">{mostActiveCategory.name}</div>
              <div className="insight-sub">
                {mostActiveCategory.count} ta vazifa
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <span className="insight-emoji">⚡</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Bajarilish darajasi</div>
              <div className="insight-value">{stats.completionRate}%</div>
              <div className="insight-sub">
                {stats.completed}/{stats.total} bajarildi
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <span className="insight-emoji">📊</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">O'rtacha kunlik</div>
              <div className="insight-value">{weeklyAverage} ta</div>
              <div className="insight-sub">
                Hafta davomida
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <span className="insight-emoji">🏆</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Bugungi holat</div>
              <div className="insight-value">
                {stats.todayCompleted}/{stats.todayTasks.length}
              </div>
              <div className="insight-sub">
                {stats.todayTasks.length > 0 
                  ? `${Math.round((stats.todayCompleted / stats.todayTasks.length) * 100)}% bajarildi`
                  : 'Vazifa yo\'q'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="summary-footer">
        <div className="footer-content">
          <div className="footer-text">
            <span className="footer-icon">📈</span>
            Statistikalar har 1 daqiqada yangilanadi
          </div>
          <div className="footer-date">
            {format(new Date(), 'd MMMM yyyy, HH:mm', { locale: uz })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummary;