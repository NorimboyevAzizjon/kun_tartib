import { useEffect, useCallback } from 'react';

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Bu brauzer bildirishnomalarni qo\'llab-quvvatlamaydi');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Send notification
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  const defaultOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    ...options
  };

  try {
    const notification = new Notification(title, defaultOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) {
        options.onClick();
      }
    };

    // Auto close after 5 seconds
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    return notification;
  } catch (error) {
    console.error('Bildirishnoma yuborishda xato:', error);
    return null;
  }
};

// Task reminder notification
export const sendTaskReminder = (task) => {
  return sendNotification(`Vazifa eslatmasi: ${task.title}`, {
    body: task.description || 'Bu vazifani bajarish vaqti keldi!',
    tag: `task-${task.id}`,
    data: { taskId: task.id },
    actions: [
      { action: 'complete', title: 'Bajarildi ✓' },
      { action: 'snooze', title: "5 daqiqadan so'ng" }
    ]
  });
};

// Pomodoro notifications
export const sendPomodoroNotification = (type) => {
  const messages = {
    'work-end': {
      title: '🍅 Ish vaqti tugadi!',
      body: "Dam olish vaqti keldi. 5 daqiqa dam oling."
    },
    'break-end': {
      title: '⚡ Dam olish tugadi!',
      body: 'Yana ishlashni boshlash vaqti!'
    },
    'long-break-end': {
      title: '🎉 Uzoq dam olish tugadi!',
      body: 'Yangi tsiklni boshlashga tayyormisiz?'
    }
  };

  const message = messages[type] || { title: 'Pomodoro', body: 'Bildirishnoma' };
  
  return sendNotification(message.title, {
    body: message.body,
    tag: 'pomodoro',
    requireInteraction: true
  });
};

// Achievement notification
export const sendAchievementNotification = (achievement) => {
  return sendNotification('🏆 Yangi yutuq!', {
    body: `Siz "${achievement.name}" yutuqini qo'lga kiritdingiz!`,
    tag: `achievement-${achievement.id}`,
    icon: achievement.icon || '/favicon.ico'
  });
};

// Daily summary notification
export const sendDailySummary = (stats) => {
  return sendNotification('📊 Kunlik hisobot', {
    body: `Bugun: ${stats.completed} vazifa bajarildi, ${stats.points} ball to'plandi`,
    tag: 'daily-summary'
  });
};

// Hook for notification management
export function useDesktopNotifications() {
  const checkPermission = useCallback(() => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }, []);

  const requestPermission = useCallback(async () => {
    return await requestNotificationPermission();
  }, []);

  const notify = useCallback((title, options) => {
    return sendNotification(title, options);
  }, []);

  // Set up task reminders
  const scheduleTaskReminder = useCallback((task, reminderTime) => {
    if (!task.dueDate || !reminderTime) return null;

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const reminderDate = new Date(dueDate.getTime() - reminderTime * 60 * 1000);

    if (reminderDate <= now) return null;

    const timeout = reminderDate.getTime() - now.getTime();
    
    return setTimeout(() => {
      sendTaskReminder(task);
    }, timeout);
  }, []);

  // Request permission on mount (optional)
  useEffect(() => {
    // Uncomment to auto-request on mount:
    // requestNotificationPermission();
  }, []);

  return {
    permission: checkPermission(),
    requestPermission,
    notify,
    scheduleTaskReminder,
    sendTaskReminder,
    sendPomodoroNotification,
    sendAchievementNotification,
    sendDailySummary
  };
}

export default useDesktopNotifications;
