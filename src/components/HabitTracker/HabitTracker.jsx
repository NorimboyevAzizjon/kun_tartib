import React, { useState, useEffect } from 'react';
import './HabitTracker.css';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Habit icons
const habitIcons = [
  { icon: '💪', name: 'Sport' },
  { icon: '📚', name: 'Kitob' },
  { icon: '🧘', name: 'Meditatsiya' },
  { icon: '💧', name: 'Suv' },
  { icon: '🏃', name: 'Yugurish' },
  { icon: '🥗', name: 'Sog\'lom ovqat' },
  { icon: '😴', name: 'Uxlash' },
  { icon: '📝', name: 'Yozish' },
  { icon: '🎯', name: 'Maqsad' },
  { icon: '🎨', name: 'Ijod' },
  { icon: '🌅', name: 'Erta turish' },
  { icon: '🚭', name: 'Chekmaslik' }
];

// Get last 7 days
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
      dayNum: date.getDate(),
      isToday: i === 0
    });
  }
  return days;
};

const HabitTracker = () => {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('kuntartib-habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [completions, setCompletions] = useState(() => {
    const saved = localStorage.getItem('kuntartib-habit-completions');
    return saved ? JSON.parse(saved) : {};
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '💪', color: '#667eea' });
  
  const days = getLast7Days();

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kuntartib-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('kuntartib-habit-completions', JSON.stringify(completions));
  }, [completions]);

  // Add new habit
  const handleAddHabit = () => {
    if (newHabit.name.trim()) {
      const habit = {
        id: `habit-${Date.now()}`,
        name: newHabit.name.trim(),
        icon: newHabit.icon,
        color: newHabit.color,
        createdAt: new Date().toISOString()
      };
      setHabits([...habits, habit]);
      setNewHabit({ name: '', icon: '💪', color: '#667eea' });
      setShowAddForm(false);
    }
  };

  // Edit habit
  const handleSaveEdit = () => {
    if (editingHabit.name.trim()) {
      setHabits(habits.map(h => 
        h.id === editingHabit.id ? editingHabit : h
      ));
      setEditingHabit(null);
    }
  };

  // Delete habit
  const handleDeleteHabit = (habitId) => {
    if (confirm('Bu odatni o\'chirmoqchimisiz?')) {
      setHabits(habits.filter(h => h.id !== habitId));
    }
  };

  // Toggle completion
  const toggleCompletion = (habitId, date) => {
    const key = `${habitId}-${date}`;
    setCompletions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if completed
  const isCompleted = (habitId, date) => {
    return completions[`${habitId}-${date}`] || false;
  };

  // Calculate streak
  const getStreak = (habitId) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (isCompleted(habitId, dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  // Get stats
  const getTotalStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCompleted = habits.filter(h => isCompleted(h.id, todayStr)).length;
    const bestStreak = Math.max(...habits.map(h => getStreak(h.id)), 0);
    
    return { todayCompleted, bestStreak };
  };

  const stats = getTotalStats();

  return (
    <div className="habit-tracker">
      {/* Stats Header */}
      <div className="habit-stats">
        <div className="stat-card">
          <CheckCircleIcon className="stat-icon green" />
          <div className="stat-info">
            <span className="stat-value">{stats.todayCompleted}/{habits.length}</span>
            <span className="stat-label">Bugun bajarildi</span>
          </div>
        </div>
        <div className="stat-card">
          <LocalFireDepartmentIcon className="stat-icon orange" />
          <div className="stat-info">
            <span className="stat-value">{stats.bestStreak}</span>
            <span className="stat-label">Eng uzun streak</span>
          </div>
        </div>
        <div className="stat-card">
          <EmojiEventsIcon className="stat-icon purple" />
          <div className="stat-info">
            <span className="stat-value">{habits.length}</span>
            <span className="stat-label">Jami odatlar</span>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="habits-container">
        {/* Header with days */}
        <div className="habits-header">
          <div className="habit-name-col">Odat</div>
          <div className="days-cols">
            {days.map(day => (
              <div 
                key={day.date} 
                className={`day-col ${day.isToday ? 'today' : ''}`}
              >
                <span className="day-name">{day.dayName}</span>
                <span className="day-num">{day.dayNum}</span>
              </div>
            ))}
          </div>
          <div className="streak-col">Streak</div>
        </div>

        {/* Habits rows */}
        {habits.length === 0 ? (
          <div className="no-habits">
            <p>Hali odatlar yo'q</p>
            <button className="btn-add-first" onClick={() => setShowAddForm(true)}>
              <AddIcon /> Birinchi odatni qo'shing
            </button>
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} className="habit-row">
              <div className="habit-info">
                <span className="habit-icon" style={{ backgroundColor: habit.color + '20' }}>
                  {habit.icon}
                </span>
                <span className="habit-name">{habit.name}</span>
                <div className="habit-actions">
                  <button onClick={() => setEditingHabit(habit)}>
                    <EditIcon fontSize="small" />
                  </button>
                  <button onClick={() => handleDeleteHabit(habit.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              </div>
              
              <div className="habit-days">
                {days.map(day => (
                  <button
                    key={day.date}
                    className={`day-check ${isCompleted(habit.id, day.date) ? 'completed' : ''}`}
                    onClick={() => toggleCompletion(habit.id, day.date)}
                    style={{ 
                      backgroundColor: isCompleted(habit.id, day.date) ? habit.color : 'transparent',
                      borderColor: habit.color
                    }}
                  >
                    {isCompleted(habit.id, day.date) ? (
                      <CheckCircleIcon fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon fontSize="small" />
                    )}
                  </button>
                ))}
              </div>

              <div className="habit-streak">
                <LocalFireDepartmentIcon 
                  className={getStreak(habit.id) > 0 ? 'active' : ''} 
                  fontSize="small" 
                />
                <span>{getStreak(habit.id)}</span>
              </div>
            </div>
          ))
        )}

        {/* Add habit button */}
        {!showAddForm && habits.length > 0 && (
          <button className="add-habit-btn" onClick={() => setShowAddForm(true)}>
            <AddIcon /> Yangi odat qo'shish
          </button>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || editingHabit) && (
        <div className="habit-modal-overlay" onClick={() => {
          setShowAddForm(false);
          setEditingHabit(null);
        }}>
          <div className="habit-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingHabit ? 'Odatni tahrirlash' : 'Yangi odat'}</h3>
            
            <div className="modal-form">
              <label>
                Odat nomi
                <input
                  type="text"
                  value={editingHabit ? editingHabit.name : newHabit.name}
                  onChange={(e) => editingHabit 
                    ? setEditingHabit({...editingHabit, name: e.target.value})
                    : setNewHabit({...newHabit, name: e.target.value})
                  }
                  placeholder="Masalan: Kitob o'qish"
                  autoFocus
                />
              </label>

              <label>
                Ikonka tanlang
                <div className="icon-grid">
                  {habitIcons.map(item => (
                    <button
                      key={item.icon}
                      className={`icon-btn ${(editingHabit ? editingHabit.icon : newHabit.icon) === item.icon ? 'selected' : ''}`}
                      onClick={() => editingHabit
                        ? setEditingHabit({...editingHabit, icon: item.icon})
                        : setNewHabit({...newHabit, icon: item.icon})
                      }
                      title={item.name}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Rang tanlang
                <div className="color-grid">
                  {['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                    <button
                      key={color}
                      className={`color-btn ${(editingHabit ? editingHabit.color : newHabit.color) === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => editingHabit
                        ? setEditingHabit({...editingHabit, color})
                        : setNewHabit({...newHabit, color})
                      }
                    />
                  ))}
                </div>
              </label>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-save" 
                onClick={editingHabit ? handleSaveEdit : handleAddHabit}
              >
                {editingHabit ? 'Saqlash' : 'Qo\'shish'}
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingHabit(null);
                }}
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
