import { useState, useCallback, useEffect } from 'react';

// Notification permission hook
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  return { permission, requestPermission };
};

// Reminder scheduler hook
export const useTaskReminders = () => {
  const [reminders, setReminders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kun-tartibi-reminders') || '[]');
    } catch {
      return [];
    }
  });

  // Reminders ni saqlash
  useEffect(() => {
    localStorage.setItem('kun-tartibi-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Eslatma qo'shish
  const addReminder = useCallback((taskId, taskTitle, reminderTime, repeatType = 'once') => {
    const newReminder = {
      id: `reminder_${Date.now()}`,
      taskId,
      taskTitle,
      reminderTime: new Date(reminderTime).toISOString(),
      repeatType,
      active: true,
      createdAt: new Date().toISOString()
    };

    setReminders(prev => [...prev, newReminder]);
    return newReminder;
  }, []);

  // Eslatmani o'chirish
  const removeReminder = useCallback((reminderId) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  }, []);

  // Eslatmani to'xtatish/faollashtirish
  const toggleReminder = useCallback((reminderId) => {
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, active: !r.active } : r
    ));
  }, []);

  // Task uchun eslatmalarni olish
  const getTaskReminders = useCallback((taskId) => {
    return reminders.filter(r => r.taskId === taskId);
  }, [reminders]);

  return { 
    reminders, 
    addReminder, 
    removeReminder, 
    toggleReminder, 
    getTaskReminders 
  };
};
