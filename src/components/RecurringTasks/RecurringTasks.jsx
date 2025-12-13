import React, { useState, useEffect } from 'react';
import { format, addDays, addMonths, addYears } from 'date-fns';
import './RecurringTasks.css';

const RecurringTasks = ({ onAddRecurringTask, tasks = [] }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState(() => {
    const saved = localStorage.getItem('recurring-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    time: '09:00',
    recurrence: 'daily', // daily, weekly, monthly, yearly
    daysOfWeek: [], // Hafta kunlari uchun (weekly)
    dayOfMonth: 1, // Oy kuni (monthly)
    endDate: '', // Tugash sanasi (ixtiyoriy)
    isActive: true
  });

  const recurrenceOptions = [
    { value: 'daily', label: 'Har kuni', icon: '📅' },
    { value: 'weekly', label: 'Har hafta', icon: '📆' },
    { value: 'monthly', label: 'Har oy', icon: '🗓️' },
    { value: 'yearly', label: 'Har yil', icon: '📊' }
  ];

  const weekDays = [
    { value: 0, label: 'Yak' },
    { value: 1, label: 'Dush' },
    { value: 2, label: 'Sesh' },
    { value: 3, label: 'Chor' },
    { value: 4, label: 'Pay' },
    { value: 5, label: 'Jum' },
    { value: 6, label: 'Shan' }
  ];

  const categories = [
    { value: 'work', label: 'Ish', icon: '💼' },
    { value: 'study', label: 'O\'qish', icon: '📚' },
    { value: 'home', label: 'Uy', icon: '🏠' },
    { value: 'personal', label: 'Shaxsiy', icon: '👤' },
    { value: 'health', label: 'Salomatlik', icon: '🏃' }
  ];

  // LocalStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('recurring-tasks', JSON.stringify(recurringTasks));
  }, [recurringTasks]);

  // Takroriy vazifalarni generatsiya qilish (kelajakda ishlatiladi)
  const _generateRecurringTasks = () => {
    const today = new Date();
    
    recurringTasks.forEach(task => {
      if (!task.isActive) return;
      
      const endDate = task.endDate ? new Date(task.endDate) : addMonths(today, 3);
      let currentDate = new Date();
      
      while (currentDate <= endDate) {
        let shouldAdd = false;
        
        switch (task.recurrence) {
          case 'daily':
            shouldAdd = true;
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            if (task.daysOfWeek.includes(currentDate.getDay())) {
              shouldAdd = true;
            }
            currentDate = addDays(currentDate, 1);
            break;
          case 'monthly':
            if (currentDate.getDate() === task.dayOfMonth) {
              shouldAdd = true;
            }
            currentDate = addDays(currentDate, 1);
            break;
          case 'yearly':
            // Har yil shu sanada
            shouldAdd = true;
            currentDate = addYears(currentDate, 1);
            break;
        }
        
        if (shouldAdd && currentDate >= today) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const existingTask = tasks.find(t => 
            t.recurringId === task.id && t.date === dateStr
          );
          
          if (!existingTask && onAddRecurringTask) {
            onAddRecurringTask({
              id: Date.now() + Math.random(),
              title: task.title,
              category: task.category,
              priority: task.priority,
              time: task.time,
              date: dateStr,
              completed: false,
              recurringId: task.id
            });
          }
        }
      }
    });
  };

  // Yangi takroriy vazifa qo'shish
  const handleAddRecurring = (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;

    const recurringTask = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString()
    };

    setRecurringTasks([...recurringTasks, recurringTask]);
    setNewTask({
      title: '',
      category: 'work',
      priority: 'medium',
      time: '09:00',
      recurrence: 'daily',
      daysOfWeek: [],
      dayOfMonth: 1,
      endDate: '',
      isActive: true
    });
    setIsFormOpen(false);
  };

  // Takroriy vazifani o'chirish
  const handleDelete = (id) => {
    setRecurringTasks(recurringTasks.filter(t => t.id !== id));
  };

  // Takroriy vazifani to'xtatish/davom ettirish
  const handleToggleActive = (id) => {
    setRecurringTasks(recurringTasks.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  // Hafta kunini tanlash
  const toggleDayOfWeek = (day) => {
    if (newTask.daysOfWeek.includes(day)) {
      setNewTask({
        ...newTask,
        daysOfWeek: newTask.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setNewTask({
        ...newTask,
        daysOfWeek: [...newTask.daysOfWeek, day]
      });
    }
  };

  return (
    <div className="recurring-tasks-container glass-effect">
      <div className="recurring-header">
        <h3>
          <span className="header-icon">🔁</span>
          Takroriy Vazifalar
        </h3>
        <p className="header-subtitle">Muntazam vazifalarni avtomatik yarating</p>
      </div>

      <div className="recurring-content">
        {/* Mavjud takroriy vazifalar */}
        {recurringTasks.length > 0 && (
          <div className="recurring-list">
            {recurringTasks.map(task => (
              <div key={task.id} className={`recurring-item ${!task.isActive ? 'inactive' : ''}`}>
                <div className="recurring-info">
                  <div className="recurring-title">
                    <span className="recurring-category-icon">
                      {categories.find(c => c.value === task.category)?.icon}
                    </span>
                    {task.title}
                  </div>
                  <div className="recurring-schedule">
                    <span className="schedule-icon">
                      {recurrenceOptions.find(r => r.value === task.recurrence)?.icon}
                    </span>
                    <span className="schedule-text">
                      {recurrenceOptions.find(r => r.value === task.recurrence)?.label}
                      {task.recurrence === 'weekly' && task.daysOfWeek.length > 0 && (
                        <span className="schedule-days">
                          ({task.daysOfWeek.map(d => weekDays[d].label).join(', ')})
                        </span>
                      )}
                      {task.recurrence === 'monthly' && (
                        <span className="schedule-days">
                          (Har oyning {task.dayOfMonth}-kuni)
                        </span>
                      )}
                    </span>
                    <span className="schedule-time">⏰ {task.time}</span>
                  </div>
                </div>
                <div className="recurring-actions">
                  <button 
                    className={`action-btn toggle ${task.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(task.id)}
                    title={task.isActive ? 'To\'xtatish' : 'Davom ettirish'}
                  >
                    {task.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDelete(task.id)}
                    title="O'chirish"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yangi qo'shish tugmasi */}
        {!isFormOpen && (
          <button 
            className="add-recurring-btn"
            onClick={() => setIsFormOpen(true)}
          >
            <span className="btn-icon">➕</span>
            Takroriy vazifa qo'shish
          </button>
        )}

        {/* Forma */}
        {isFormOpen && (
          <form className="recurring-form" onSubmit={handleAddRecurring}>
            <div className="form-group">
              <label>Vazifa nomi</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Masalan: Ertalabki mashq"
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kategoriya</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="form-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Muhimlik</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="low">🟢 Past</option>
                  <option value="medium">🟡 O'rta</option>
                  <option value="high">🔴 Yuqori</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vaqt</label>
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Takrorlanish</label>
                <select
                  value={newTask.recurrence}
                  onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value })}
                  className="form-select"
                >
                  {recurrenceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Haftalik - kunlarni tanlash */}
            {newTask.recurrence === 'weekly' && (
              <div className="form-group">
                <label>Hafta kunlari</label>
                <div className="weekdays-selector">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      className={`weekday-btn ${newTask.daysOfWeek.includes(day.value) ? 'active' : ''}`}
                      onClick={() => toggleDayOfWeek(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Oylik - kunni tanlash */}
            {newTask.recurrence === 'monthly' && (
              <div className="form-group">
                <label>Oy kuni</label>
                <select
                  value={newTask.dayOfMonth}
                  onChange={(e) => setNewTask({ ...newTask, dayOfMonth: Number(e.target.value) })}
                  className="form-select"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Tugash sanasi (ixtiyoriy)</label>
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsFormOpen(false)}>
                Bekor qilish
              </button>
              <button type="submit" className="btn-submit">
                <span className="btn-icon">✅</span>
                Qo'shish
              </button>
            </div>
          </form>
        )}

        {/* Bo'sh holat */}
        {recurringTasks.length === 0 && !isFormOpen && (
          <div className="empty-state">
            <div className="empty-icon">🔁</div>
            <p>Hali takroriy vazifalar yo'q</p>
            <span className="empty-hint">Muntazam bajaradigan vazifalaringizni qo'shing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringTasks;
