import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import './WeeklyChart.css';

const ProgressChart = ({ tasks = [] }) => {
  // Haftalik progress statistikasini hisoblash
  const { weeklyProgress, stats } = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale: uz });
    const weekEnd = endOfWeek(new Date(), { locale: uz });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Har bir kun uchun progress
    const dailyProgress = weekDays.map(day => {
      const dayTasks = tasks.filter(task => 
        isSameDay(new Date(task.date), day)
      );
      
      const total = dayTasks.length;
      const completed = dayTasks.filter(t => t.completed).length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        day: format(day, 'EEEEEE', { locale: uz }),
        fullDay: format(day, 'EEE', { locale: uz }),
        date: format(day, 'dd.MM'),
        total,
        completed,
        pending,
        completionRate,
        efficiency
      };
    });

    // Statistikalar
    const totalTasks = dailyProgress.reduce((sum, day) => sum + day.total, 0);
    const totalCompleted = dailyProgress.reduce((sum, day) => sum + day.completed, 0);
    const averageCompletion = Math.round(
      dailyProgress.reduce((sum, day) => sum + day.completionRate, 0) / 7
    ) || 0;
    
    const mostProductiveDay = dailyProgress.reduce((max, day) => 
      day.completionRate > max.completionRate ? day : max, 
      { completionRate: 0 }
    );
    
    const busiestDay = dailyProgress.reduce((max, day) => 
      day.total > max.total ? day : max, dailyProgress[0]
    );

    return {
      weeklyProgress: dailyProgress,
      stats: {
        totalTasks,
        totalCompleted,
        averageCompletion,
        mostProductiveDay,
        busiestDay,
        overallEfficiency: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
      }
    };
  }, [tasks]);

  // Progress ranglarini aniqlash
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 70) return '#34d399';
    if (percentage >= 50) return '#fbbf24';
    if (percentage >= 30) return '#f59e0b';
    if (percentage > 0) return '#f97316';
    return '#94a3b8';
  };

  // Efficiency darajasini aniqlash
  const getEfficiencyLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Ajoyib', icon: '🏆', color: '#10b981' };
    if (percentage >= 70) return { level: 'Yaxshi', icon: '✨', color: '#34d399' };
    if (percentage >= 50) return { level: 'Qoniqarli', icon: '👍', color: '#fbbf24' };
    if (percentage >= 30) return { level: 'O\'rtacha', icon: '📊', color: '#f59e0b' };
    return { level: 'Yaxshilash kerak', icon: '📈', color: '#f97316' };
  };

  const overallEfficiency = getEfficiencyLevel(stats.overallEfficiency);

  return (
    <div className="progress-chart-container glass-effect card-hover">
      {/* Header Section */}
      <div className="chart-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <span className="header-icon">📈</span>
          </div>
          <div className="header-text">
            <h3 className="chart-title">Progress Monitoring</h3>
            <p className="chart-subtitle">
              Vazifalaringizning bajarilish darajasini kuzating
            </p>
          </div>
        </div>
        
        <div className="overall-efficiency">
          <div 
            className="efficiency-badge-large"
            style={{ '--efficiency-color': overallEfficiency.color }}
          >
            <span className="badge-icon">{overallEfficiency.icon}</span>
            <span className="badge-grade">
              {stats.overallEfficiency}%
            </span>
            <span className="badge-label">{overallEfficiency.level}</span>
          </div>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="progress-bars-section">
        <div className="section-header">
          <h4 className="section-title">
            <span className="section-icon">📅</span>
            Haftalik Progress
          </h4>
          <p className="section-subtitle">
            Hafta davomida bajarilish darajasi
          </p>
        </div>
        
        <div className="bars-container">
          {weeklyProgress.map((day, index) => {
            const progressColor = getProgressColor(day.completionRate);
            const efficiency = getEfficiencyLevel(day.completionRate);
            
            return (
              <div key={index} className="bar-card card-hover">
                <div className="bar-header">
                  <div className="day-info">
                    <div className="day-name">{day.fullDay}</div>
                    <div className="day-date">{day.date}</div>
                  </div>
                  <div 
                    className="day-efficiency"
                    style={{ '--day-color': efficiency.color }}
                  >
                    <span className="efficiency-icon">{efficiency.icon}</span>
                    <span className="efficiency-value">{day.completionRate}%</span>
                  </div>
                </div>
                
                <div className="bar-wrapper">
                  <div className="bar-background"></div>
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${day.completionRate}%`,
                      backgroundColor: progressColor
                    }}
                  >
                    <span className="bar-percent">{day.completionRate}%</span>
                  </div>
                </div>
                
                <div className="bar-footer">
                  <div className="day-stats">
                    <div className="stat-item">
                      <span className="stat-icon">📋</span>
                      <span className="stat-label">{day.total} ta</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">✅</span>
                      <span className="stat-label success">{day.completed} ta</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">⏳</span>
                      <span className="stat-label warning">{day.pending} ta</span>
                    </div>
                  </div>
                  
                  <div className="efficiency-tag">
                    <span className="tag-text">{efficiency.level}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="summary-header">
          <h4 className="summary-title">
            <span className="summary-icon">📊</span>
            Statistik Xulosa
          </h4>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card total-tasks card-hover">
            <div className="summary-icon">
              <span className="icon-emoji">📋</span>
            </div>
            <div className="summary-content">
              <div className="summary-label">Jami Vazifalar</div>
              <div className="summary-value">{stats.totalTasks}</div>
              <div className="summary-sub">Hafta davomida</div>
            </div>
          </div>
          
          <div className="summary-card completed-tasks card-hover">
            <div className="summary-icon">
              <span className="icon-emoji">✅</span>
            </div>
            <div className="summary-content">
              <div className="summary-label">Bajarilgan</div>
              <div className="summary-value">{stats.totalCompleted}</div>
              <div className="summary-sub">
                {stats.totalTasks > 0 
                  ? `${Math.round((stats.totalCompleted / stats.totalTasks) * 100)}% ulush`
                  : '0%'
                }
              </div>
            </div>
          </div>
          
          <div className="summary-card average-progress card-hover">
            <div className="summary-icon">
              <span className="icon-emoji">📈</span>
            </div>
            <div className="summary-content">
              <div className="summary-label">O'rtacha Progress</div>
              <div className="summary-value">{stats.averageCompletion}%</div>
              <div className="summary-sub">Kunlik o'rtacha</div>
            </div>
          </div>
          
          <div className="summary-card most-productive card-hover">
            <div className="summary-icon">
              <span className="icon-emoji">🔥</span>
            </div>
            <div className="summary-content">
              <div className="summary-label">Eng Samarali Kun</div>
              <div className="summary-value">
                {stats.mostProductiveDay?.fullDay || '-'}
              </div>
              <div className="summary-sub">
                {stats.mostProductiveDay?.completionRate || 0}% bajarilish
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <div className="insights-header">
          <h4 className="insights-title">
            <span className="insights-icon">💡</span>
            Tahlil va Tavsiyalar
          </h4>
        </div>
        
        <div className="insights-grid">
          <div className="insight-card performance card-hover">
            <div className="insight-icon">
              <span className="icon-emoji">🏆</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Umumiy Samaradorlik</div>
              <div className="insight-value">{stats.overallEfficiency}%</div>
              <div className="insight-sub">
                {stats.overallEfficiency >= 80 
                  ? 'Ajoyib natija!'
                  : stats.overallEfficiency >= 60 
                  ? 'Yaxshi natija'
                  : 'Yaxshilash uchun imkoniyat bor'
                }
              </div>
            </div>
          </div>
          
          <div className="insight-card trend card-hover">
            <div className="insight-icon">
              <span className="icon-emoji">📊</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Progress Trendi</div>
              <div className="insight-value">
                {weeklyProgress[weeklyProgress.length - 1]?.completionRate || 0}%
              </div>
              <div className="insight-sub">
                {weeklyProgress[weeklyProgress.length - 1]?.completionRate > 
                 weeklyProgress[0]?.completionRate 
                  ? "Progress o'smoqda 📈"    // "" ichiga oldik
                  : "Progress pasaymoqda 📉"   // "" ichiga oldik
                }
              </div>
            </div>
          </div>
          
          <div className="insight-card recommendation card-hover">
            <div className="insight-icon">
              <span className="icon-emoji">🎯</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Tavsiya</div>
              <div className="insight-value">
                {stats.totalCompleted < stats.totalTasks / 2 
                  ? 'Kuchaytirish kerak'
                  : 'Yaxshi ishlanyapti'
                }
              </div>
              <div className="insight-sub">
                {stats.totalCompleted < stats.totalTasks / 2 
                  ? 'Bajarilgan vazifalarni oshiring'
                  : 'Joriy tempda davom eting'
                }
              </div>
            </div>
          </div>
          
          <div className="insight-card prediction card-hover">
            <div className="insight-icon">
              <span className="icon-emoji">🔮</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Bashorat</div>
              <div className="insight-value">
                {Math.round(stats.overallEfficiency * 1.1)}%
              </div>
              <div className="insight-sub">
                Keyingi hafta uchun prognoz
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;