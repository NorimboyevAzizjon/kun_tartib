import React from 'react';
import './TaskSummary.css';

const TaskSummary = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Category statistics
  const categories = {
    '💼 Ish': tasks.filter(t => t.category === 'work').length,
    '📚 O\'qish': tasks.filter(t => t.category === 'study').length,
    '🏠 Uy': tasks.filter(t => t.category === 'home').length,
    '👤 Shaxsiy': tasks.filter(t => t.category === 'personal').length,
    '🏃 Sog\'lom': tasks.filter(t => t.category === 'health').length
  };

  // Priority statistics
  const priorities = {
    '🔴 Yuqori': tasks.filter(t => t.priority === 'high').length,
    '🟡 O\'rta': tasks.filter(t => t.priority === 'medium').length,
    '🟢 Past': tasks.filter(t => t.priority === 'low').length
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const todayCompleted = todayTasks.filter(t => t.completed).length;

  return (
    <div className="task-summary">
      <div className="summary-header">
        <h3>📈 Vazifalar Tahlili</h3>
        <div className="summary-subtitle">Real vaqt statistikasi</div>
      </div>

      <div className="summary-grid">
        <div className="summary-card total">
          <div className="summary-icon">📋</div>
          <div className="summary-content">
            <div className="summary-title">Jami Vazifalar</div>
            <div className="summary-number">{total}</div>
            <div className="summary-trend">
              <span className="trend-up">📈</span>
              <span>Haftada {Math.round(total / 7)} ta</span>
            </div>
          </div>
        </div>

        <div className="summary-card completed">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-title">Bajarilgan</div>
            <div className="summary-number">{completed}</div>
            <div className="summary-percentage">{completionRate}%</div>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-title">Kutayotgan</div>
            <div className="summary-number">{pending}</div>
            <div className="summary-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(completed / total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card today">
          <div className="summary-icon">📅</div>
          <div className="summary-content">
            <div className="summary-title">Bugungi</div>
            <div className="summary-number">
              {todayCompleted}/{todayTasks.length}
            </div>
            <div className="summary-subtext">
              {todayTasks.length > 0 
                ? `${Math.round((todayCompleted / todayTasks.length) * 100)}% bajarildi`
                : 'Vazifa yo\'q'
              }
            </div>
          </div>
        </div>
      </div>

      <div className="category-section">
        <h4>🏷️ Kategoriyalar Bo'yicha</h4>
        <div className="category-list">
          {Object.entries(categories).map(([name, count]) => (
            <div key={name} className="category-item">
              <div className="category-info">
                <span className="category-name">{name}</span>
                <span className="category-count">{count}</span>
              </div>
              <div className="category-bar">
                <div 
                  className="category-fill"
                  style={{ 
                    width: `${total > 0 ? (count / total) * 100 : 0}%`,
                    background: getCategoryColor(name)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="priority-section">
        <h4>🎯 Imtiyozlar Taqsimoti</h4>
        <div className="priority-list">
          {Object.entries(priorities).map(([name, count]) => (
            <div key={name} className="priority-item">
              <div className="priority-label">
                <span className="priority-icon">{name.split(' ')[0]}</span>
                <span className="priority-name">{name.split(' ')[1]}</span>
              </div>
              <div className="priority-stats">
                <div className="priority-count">{count}</div>
                <div className="priority-percentage">
                  {total > 0 ? Math.round((count / total) * 100) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="insights">
        <h4>💡 Statistik Tahlil</h4>
        <div className="insight-item">
          <div className="insight-icon">🎯</div>
          <div className="insight-text">
            <strong>Eng faol kategoriya:</strong> {
              Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
            }
          </div>
        </div>
        <div className="insight-item">
          <div className="insight-icon">⚡</div>
          <div className="insight-text">
            <strong>O'rtacha bajarilish:</strong> {completionRate}%
          </div>
        </div>
        <div className="insight-item">
          <div className="insight-icon">📊</div>
          <div className="insight-text">
            <strong>Kunlik o'rtacha:</strong> {Math.round(total / 30) || 0} ta
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category) => {
  const colors = {
    '💼 Ish': '#667eea',
    '📚 O\'qish': '#4CAF50',
    '🏠 Uy': '#FF9800',
    '👤 Shaxsiy': '#9C27B0',
    '🏃 Sog\'lom': '#2196F3'
  };
  return colors[category] || '#718096';
};

export default TaskSummary;