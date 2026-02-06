import React, { useState, useEffect } from 'react';
import { useNotificationPermission, useTaskReminders } from '../../hooks/useReminders';
import './TaskReminders.css';

// MUI Icons
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';

// Desktop notification ko'rsatish
const showNotification = (reminder) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification('⏰ Eslatma - KunTartib', {
    body: reminder.taskTitle,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: reminder.id,
    requireInteraction: true
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

// Reminder Manager Component
const TaskReminders = ({ task, onAddReminder }) => {
  const { permission, requestPermission } = useNotificationPermission();
  const { addReminder, removeReminder, toggleReminder, getTaskReminders } = useTaskReminders();
  const [showForm, setShowForm] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [repeatType, setRepeatType] = useState('once');

  const taskReminders = task ? getTaskReminders(task.id) : [];

  const handleAddReminder = () => {
    if (!reminderDate || !reminderTime) return;

    const dateTime = new Date(`${reminderDate}T${reminderTime}`);
    if (dateTime <= new Date()) {
      alert('Eslatma vaqti kelajakda bo\'lishi kerak!');
      return;
    }

    addReminder(task.id, task.title, dateTime, repeatType);
    setShowForm(false);
    setReminderDate('');
    setReminderTime('');
    setRepeatType('once');
    onAddReminder?.();
  };

  // Notification ruxsati so'rash
  if (permission === 'default') {
    return (
      <div className="reminder-permission">
        <NotificationsOffIcon />
        <p>Eslatmalar uchun ruxsat kerak</p>
        <button onClick={requestPermission} className="permission-btn">
          Ruxsat berish
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="reminder-denied">
        <WarningIcon />
        <p>Bildirishnomalar bloklangan. Brauzer sozlamalaridan ruxsat bering.</p>
      </div>
    );
  }

  return (
    <div className="task-reminders">
      <div className="reminders-header">
        <NotificationsActiveIcon />
        <span>Eslatmalar</span>
        <button className="add-reminder-btn" onClick={() => setShowForm(!showForm)}>
          <AddAlarmIcon fontSize="small" />
        </button>
      </div>

      {showForm && (
        <div className="reminder-form">
          <div className="form-row">
            <input
              type="date"
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
            />
          </div>
          <div className="form-row">
            <select value={repeatType} onChange={e => setRepeatType(e.target.value)}>
              <option value="once">Bir marta</option>
              <option value="daily">Har kuni</option>
              <option value="weekly">Har hafta</option>
            </select>
            <button className="save-btn" onClick={handleAddReminder}>
              Saqlash
            </button>
          </div>
        </div>
      )}

      <div className="reminders-list">
        {taskReminders.length === 0 ? (
          <p className="no-reminders">Eslatma yo'q</p>
        ) : (
          taskReminders.map(reminder => (
            <div key={reminder.id} className={`reminder-item ${!reminder.active ? 'inactive' : ''}`}>
              <AccessTimeIcon fontSize="small" />
              <div className="reminder-info">
                <span className="reminder-time">
                  {new Date(reminder.reminderTime).toLocaleString('uz-UZ')}
                </span>
                <span className="reminder-repeat">
                  {reminder.repeatType === 'once' ? 'Bir marta' : 
                   reminder.repeatType === 'daily' ? 'Har kuni' : 'Har hafta'}
                </span>
              </div>
              <button onClick={() => toggleReminder(reminder.id)}>
                {reminder.active ? <CheckCircleIcon color="success" /> : <NotificationsOffIcon />}
              </button>
              <button onClick={() => removeReminder(reminder.id)}>
                <DeleteOutlineIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Auto-reminder checker (fon uchun)
export const ReminderChecker = () => {
  useEffect(() => {
    const checkReminders = () => {
      try {
        const reminders = JSON.parse(localStorage.getItem('kun-tartibi-reminders') || '[]');
        const now = new Date().getTime();

        reminders.forEach(reminder => {
          if (!reminder.active) return;

          const reminderTime = new Date(reminder.reminderTime).getTime();
          const diff = reminderTime - now;

          // 1 daqiqa ichida bo'lsa
          if (diff > 0 && diff < 60000) {
            setTimeout(() => {
              showNotification(reminder);
            }, diff);
          }
        });
      } catch {
        // localStorage error
      }
    };

    // Har daqiqada tekshirish
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default TaskReminders;
