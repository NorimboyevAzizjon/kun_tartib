import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameWeek, isSameMonth } from 'date-fns';
import { uz } from 'date-fns/locale';
import './Goals.css';

const Goals = ({ tasks = [] }) => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('user-goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'weekly', // weekly, monthly
    targetCount: 5, // Nechta vazifa bajarish kerak
    category: 'all', // all yoki muayyan kategoriya
    startDate: format(new Date(), 'yyyy-MM-dd'),
    reward: '' // Mukofot
  });

  const goalTypes = [
    { value: 'weekly', label: 'Haftalik', icon: '📅' },
    { value: 'monthly', label: 'Oylik', icon: '🗓️' }
  ];

  const categories = [
    { value: 'all', label: 'Barcha', icon: '📋' },
    { value: 'work', label: 'Ish', icon: '💼' },
    { value: 'study', label: 'O\'qish', icon: '📚' },
    { value: 'home', label: 'Uy', icon: '🏠' },
    { value: 'personal', label: 'Shaxsiy', icon: '👤' },
    { value: 'health', label: 'Salomatlik', icon: '🏃' }
  ];

  // Maqsad progressini hisoblash
  const calculateProgress = (goal) => {
    const now = new Date();
    let filteredTasks = [];

    // Vaqt oralig'iga qarab filter
    if (goal.type === 'weekly') {
      filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return isSameWeek(taskDate, now, { locale: uz }) && task.completed;
      });
    } else if (goal.type === 'monthly') {
      filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return isSameMonth(taskDate, now) && task.completed;
      });
    }

    // Kategoriyaga qarab filter
    if (goal.category !== 'all') {
      filteredTasks = filteredTasks.filter(t => t.category === goal.category);
    }

    const completed = filteredTasks.length;
    const percentage = Math.min(Math.round((completed / goal.targetCount) * 100), 100);
    const isCompleted = completed >= goal.targetCount;

    return { completed, percentage, isCompleted };
  };

  // LocalStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('user-goals', JSON.stringify(goals));
  }, [goals]);

  // Yangi maqsad qo'shish
  const handleAddGoal = (e) => {
    e.preventDefault();
    
    if (!newGoal.title.trim()) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      createdAt: new Date().toISOString()
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      type: 'weekly',
      targetCount: 5,
      category: 'all',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      reward: ''
    });
    setIsFormOpen(false);
  };

  // Maqsadni o'chirish
  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // Vaqt oralig'ini ko'rsatish
  const getTimeRange = (type) => {
    const now = new Date();
    if (type === 'weekly') {
      const start = startOfWeek(now, { locale: uz });
      const end = endOfWeek(now, { locale: uz });
      return `${format(start, 'd MMM', { locale: uz })} - ${format(end, 'd MMM', { locale: uz })}`;
    } else {
      return format(now, 'MMMM yyyy', { locale: uz });
    }
  };

  return (
    <div className="goals-container glass-effect">
      <div className="goals-header">
        <h3>
          <span className="header-icon">🎯</span>
          Maqsadlar
        </h3>
        <p className="header-subtitle">Haftalik va oylik maqsadlaringizni belgilang</p>
      </div>

      <div className="goals-content">
        {/* Mavjud maqsadlar */}
        {goals.length > 0 && (
          <div className="goals-list">
            {goals.map(goal => {
              const progress = calculateProgress(goal);
              return (
                <div key={goal.id} className={`goal-card ${progress.isCompleted ? 'completed' : ''}`}>
                  <div className="goal-header">
                    <div className="goal-type-badge">
                      {goalTypes.find(t => t.value === goal.type)?.icon}
                      {goalTypes.find(t => t.value === goal.type)?.label}
                    </div>
                    <button 
                      className="goal-delete-btn"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="goal-title">{goal.title}</div>
                  
                  {goal.description && (
                    <div className="goal-description">{goal.description}</div>
                  )}

                  <div className="goal-meta">
                    <span className="goal-category">
                      {categories.find(c => c.value === goal.category)?.icon}
                      {categories.find(c => c.value === goal.category)?.label}
                    </span>
                    <span className="goal-time-range">
                      📅 {getTimeRange(goal.type)}
                    </span>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-header">
                      <span className="progress-text">
                        {progress.completed} / {goal.targetCount} vazifa
                      </span>
                      <span className="progress-percentage">{progress.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${progress.isCompleted ? 'completed' : ''}`}
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {progress.isCompleted && goal.reward && (
                    <div className="goal-reward">
                      <span className="reward-icon">🏆</span>
                      <span className="reward-text">{goal.reward}</span>
                    </div>
                  )}

                  {progress.isCompleted && (
                    <div className="goal-completed-badge">
                      <span>✅</span> Maqsadga erishildi!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Yangi qo'shish tugmasi */}
        {!isFormOpen && (
          <button 
            className="add-goal-btn"
            onClick={() => setIsFormOpen(true)}
          >
            <span className="btn-icon">➕</span>
            Yangi maqsad qo'shish
          </button>
        )}

        {/* Forma */}
        {isFormOpen && (
          <form className="goal-form" onSubmit={handleAddGoal}>
            <div className="form-group">
              <label>Maqsad nomi</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Masalan: 10 ta vazifa bajarish"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Tavsif (ixtiyoriy)</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Maqsad haqida qo'shimcha ma'lumot..."
                className="form-textarea"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maqsad turi</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="form-select"
                >
                  {goalTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Kategoriya</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Maqsad soni (nechta vazifa bajarish kerak)</label>
              <div className="target-count-selector">
                {[3, 5, 7, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    type="button"
                    className={`count-btn ${newGoal.targetCount === num ? 'active' : ''}`}
                    onClick={() => setNewGoal({ ...newGoal, targetCount: num })}
                  >
                    {num}
                  </button>
                ))}
                <input
                  type="number"
                  value={newGoal.targetCount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetCount: Number(e.target.value) })}
                  className="count-input"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mukofot (ixtiyoriy)</label>
              <input
                type="text"
                value={newGoal.reward}
                onChange={(e) => setNewGoal({ ...newGoal, reward: e.target.value })}
                placeholder="Masalan: Kino ko'rish, Dam olish..."
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsFormOpen(false)}>
                Bekor qilish
              </button>
              <button type="submit" className="btn-submit">
                <span className="btn-icon">🎯</span>
                Maqsad qo'shish
              </button>
            </div>
          </form>
        )}

        {/* Bo'sh holat */}
        {goals.length === 0 && !isFormOpen && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Hali maqsadlar yo'q</p>
            <span className="empty-hint">O'zingizga maqsad qo'ying va unga erishing!</span>
          </div>
        )}

        {/* Maslahatlar */}
        <div className="goals-tips">
          <h4>💡 Maslahatlar</h4>
          <ul>
            <li>Kichik va aniq maqsadlar qo'ying</li>
            <li>Haftalik maqsadlar bilan boshlang</li>
            <li>O'zingizga mukofot belgilang</li>
            <li>Progressingizni kuzatib boring</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Goals;
