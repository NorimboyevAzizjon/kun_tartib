// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// LocalStorage Mode (Backend ishlamaganda)
const USE_LOCAL_STORAGE = true; // Backend ulanganda false qiling

// LocalStorage keys
const STORAGE_KEYS = {
  TOKEN: 'kuntartib-token',
  USER: 'kuntartib-user',
  USERS: 'kuntartib-users',
  TASKS: 'kun-tartibi-tasks',
  GOALS: 'user-goals'
};

// Token olish
const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

// Headers yaratish
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` })
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API so'rovlar uchun wrapper (retry bilan)
const apiRequest = async (endpoint, options = {}, retries = MAX_RETRIES) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Rate limiting check
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 5;
      await sleep(retryAfter * 1000);
      return apiRequest(endpoint, options, retries);
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Xatolik yuz berdi');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Network error - retry
    if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
      if (retries > 0) {
        console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY);
        return apiRequest(endpoint, options, retries - 1);
      }
      throw new Error('Server bilan aloqa yo\'q. Internet ulanishini tekshiring.');
    }
    
    console.error('API Error:', error);
    throw error;
  }
};

// Simple hash function for local storage (not for production security)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
};

// =====================
// AUTH API (LocalStorage mode)
// =====================
export const authAPI = {
  // Ro'yxatdan o'tish
  register: async (userData) => {
    if (USE_LOCAL_STORAGE) {
      // LocalStorage mode
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      // Email tekshirish
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Email formati noto\'g\'ri');
      }

      // Password validation
      if (userData.password.length < 6) {
        throw new Error('Parol kamida 6 ta belgi bo\'lishi kerak');
      }
      
      const newUser = {
        _id: Date.now().toString(),
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        passwordHash: simpleHash(userData.password), // Hash parol
        avatar: '👤',
        createdAt: new Date().toISOString(),
        token: 'local_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      };
      
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.TOKEN, newUser.token);
      
      // Parolsiz user saqlash
      const safeUser = { ...newUser };
      delete safeUser.passwordHash;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      
      return { success: true, data: safeUser };
    }
    
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
    }
    return data;
  },

  // Kirish
  login: async (credentials) => {
    if (USE_LOCAL_STORAGE) {
      // LocalStorage mode
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const hashedPassword = simpleHash(credentials.password);
      const user = users.find(u => 
        u.email === credentials.email.toLowerCase().trim() && 
        u.passwordHash === hashedPassword
      );
      
      if (!user) {
        throw new Error('Email yoki parol noto\'g\'ri');
      }
      
      user.token = 'local_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      user.lastLogin = new Date().toISOString();
      
      // Update user in storage
      const updatedUsers = users.map(u => u._id === user._id ? user : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
      
      // Parolsiz user saqlash
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
      
      return { success: true, data: safeUser };
    }
    
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
    }
    return data;
  },

  // Chiqish
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Joriy foydalanuvchi
  getMe: () => {
    if (USE_LOCAL_STORAGE) {
      const user = authAPI.getCurrentUser();
      return { success: true, data: user };
    }
    return apiRequest('/auth/me');
  },

  // Profil yangilash
  updateProfile: async (profileData) => {
    if (USE_LOCAL_STORAGE) {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Foydalanuvchi topilmadi');
      
      const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Update in users list too
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const updatedUsers = users.map(u => u._id === user._id ? { ...u, ...profileData } : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      return { success: true, data: updatedUser };
    }
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Parolni o'zgartirish
  changePassword: async (currentPassword, newPassword) => {
    if (USE_LOCAL_STORAGE) {
      const user = authAPI.getCurrentUser();
      if (!user) throw new Error('Foydalanuvchi topilmadi');
      
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const fullUser = users.find(u => u._id === user._id);
      
      if (!fullUser || fullUser.passwordHash !== simpleHash(currentPassword)) {
        throw new Error('Joriy parol noto\'g\'ri');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Yangi parol kamida 6 ta belgi bo\'lishi kerak');
      }
      
      fullUser.passwordHash = simpleHash(newPassword);
      fullUser.updatedAt = new Date().toISOString();
      
      const updatedUsers = users.map(u => u._id === user._id ? fullUser : u);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      return { success: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' };
    }
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Auth holatini tekshirish
  isAuthenticated: () => !!getToken(),

  // Joriy foydalanuvchi ma'lumotlari
  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }
};

// =====================
// TASKS API
// =====================
export const tasksAPI = {
  // Barcha vazifalar
  getAll: async () => {
    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      return { success: true, count: tasks.length, data: tasks };
    }
    return apiRequest('/tasks');
  },

  // Bitta vazifa
  getOne: async (id) => {
    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Vazifa topilmadi');
      return { success: true, data: task };
    }
    return apiRequest(`/tasks/${id}`);
  },

  // Yangi vazifa
  create: async (taskData) => {
    // Validatsiya
    if (!taskData.title || !taskData.title.trim()) {
      throw new Error('Vazifa nomi kiritilishi shart');
    }
    if (!taskData.date) {
      throw new Error('Sana kiritilishi shart');
    }
    if (!taskData.time) {
      throw new Error('Vaqt kiritilishi shart');
    }

    // XSS prevention
    const sanitizedTask = {
      ...taskData,
      title: taskData.title.trim().replace(/<[^>]*>/g, ''),
      description: taskData.description ? taskData.description.trim().replace(/<[^>]*>/g, '') : ''
    };

    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const newTask = {
        ...sanitizedTask,
        id: taskData.id || Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, message: 'Vazifa qo\'shildi!', data: newTask };
    }
    
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(sanitizedTask)
    });
  },

  // Vazifani yangilash
  update: async (id, taskData) => {
    // XSS prevention
    const sanitizedTask = {
      ...taskData,
      title: taskData.title ? taskData.title.trim().replace(/<[^>]*>/g, '') : undefined,
      description: taskData.description ? taskData.description.trim().replace(/<[^>]*>/g, '') : undefined,
      updatedAt: new Date().toISOString()
    };

    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Vazifa topilmadi');
      
      tasks[index] = { ...tasks[index], ...sanitizedTask };
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, message: 'Vazifa yangilandi!', data: tasks[index] };
    }
    
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedTask)
    });
  },

  // Vazifani o'chirish
  delete: async (id) => {
    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const filteredTasks = tasks.filter(t => t.id !== id);
      if (filteredTasks.length === tasks.length) throw new Error('Vazifa topilmadi');
      
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
      return { success: true, message: 'Vazifa o\'chirildi!' };
    }
    
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Status o'zgartirish
  toggle: async (id) => {
    if (USE_LOCAL_STORAGE) {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Vazifa topilmadi');
      
      tasks[index].completed = !tasks[index].completed;
      tasks[index].updatedAt = new Date().toISOString();
      if (tasks[index].completed) {
        tasks[index].completedAt = new Date().toISOString();
      } else {
        delete tasks[index].completedAt;
      }
      
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return { success: true, data: tasks[index] };
    }
    
    return apiRequest(`/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  // Sync with backend (future use)
  sync: async () => {
    if (USE_LOCAL_STORAGE) {
      return { success: true, message: 'Local mode - sync not needed' };
    }
    // Backend sync logic here
    return apiRequest('/tasks/sync', { method: 'POST' });
  }
};

// =====================
// GOALS API
// =====================
export const goalsAPI = {
  // Barcha maqsadlar
  getAll: async () => {
    if (USE_LOCAL_STORAGE) {
      const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
      return { success: true, count: goals.length, data: goals };
    }
    return apiRequest('/goals');
  },

  // Yangi maqsad
  create: async (goalData) => {
    // Validatsiya
    if (!goalData.title || !goalData.title.trim()) {
      throw new Error('Maqsad nomi kiritilishi shart');
    }

    // XSS prevention
    const sanitizedGoal = {
      ...goalData,
      title: goalData.title.trim().replace(/<[^>]*>/g, ''),
      description: goalData.description ? goalData.description.trim().replace(/<[^>]*>/g, '') : ''
    };

    if (USE_LOCAL_STORAGE) {
      const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
      const newGoal = {
        ...sanitizedGoal,
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      goals.unshift(newGoal);
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return { success: true, message: 'Maqsad qo\'shildi!', data: newGoal };
    }
    
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(sanitizedGoal)
    });
  },

  // Maqsadni yangilash
  update: async (id, goalData) => {
    // XSS prevention
    const sanitizedGoal = {
      ...goalData,
      title: goalData.title ? goalData.title.trim().replace(/<[^>]*>/g, '') : undefined,
      description: goalData.description ? goalData.description.trim().replace(/<[^>]*>/g, '') : undefined,
      updatedAt: new Date().toISOString()
    };

    if (USE_LOCAL_STORAGE) {
      const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
      const index = goals.findIndex(g => g.id === id);
      if (index === -1) throw new Error('Maqsad topilmadi');
      
      goals[index] = { ...goals[index], ...sanitizedGoal };
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return { success: true, message: 'Maqsad yangilandi!', data: goals[index] };
    }
    
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sanitizedGoal)
    });
  },

  // Maqsadni o'chirish
  delete: async (id) => {
    if (USE_LOCAL_STORAGE) {
      const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
      const filteredGoals = goals.filter(g => g.id !== id);
      if (filteredGoals.length === goals.length) throw new Error('Maqsad topilmadi');
      
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filteredGoals));
      return { success: true, message: 'Maqsad o\'chirildi!' };
    }
    
    return apiRequest(`/goals/${id}`, {
      method: 'DELETE'
    });
  }
};

// =====================
// RECURRING TASKS API
// =====================
export const recurringAPI = {
  // Barcha takrorlanuvchi vazifalar
  getAll: async () => {
    if (USE_LOCAL_STORAGE) {
      const recurring = JSON.parse(localStorage.getItem('kuntartib-recurring') || '[]');
      return { success: true, count: recurring.length, data: recurring };
    }
    return apiRequest('/recurring');
  },

  // Yangi takrorlanuvchi vazifa
  create: async (recurringData) => {
    if (!recurringData.title || !recurringData.title.trim()) {
      throw new Error('Vazifa nomi kiritilishi shart');
    }

    if (USE_LOCAL_STORAGE) {
      const recurring = JSON.parse(localStorage.getItem('kuntartib-recurring') || '[]');
      const newRecurring = {
        ...recurringData,
        id: Date.now().toString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      recurring.unshift(newRecurring);
      localStorage.setItem('kuntartib-recurring', JSON.stringify(recurring));
      return { success: true, data: newRecurring };
    }
    
    return apiRequest('/recurring', {
      method: 'POST',
      body: JSON.stringify(recurringData)
    });
  },

  // Yangilash
  update: async (id, recurringData) => {
    if (USE_LOCAL_STORAGE) {
      const recurring = JSON.parse(localStorage.getItem('kuntartib-recurring') || '[]');
      const index = recurring.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Topilmadi');
      
      recurring[index] = { ...recurring[index], ...recurringData, updatedAt: new Date().toISOString() };
      localStorage.setItem('kuntartib-recurring', JSON.stringify(recurring));
      return { success: true, data: recurring[index] };
    }
    
    return apiRequest(`/recurring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recurringData)
    });
  },

  // O'chirish
  delete: async (id) => {
    if (USE_LOCAL_STORAGE) {
      const recurring = JSON.parse(localStorage.getItem('kuntartib-recurring') || '[]');
      const filtered = recurring.filter(r => r.id !== id);
      localStorage.setItem('kuntartib-recurring', JSON.stringify(filtered));
      return { success: true };
    }
    
    return apiRequest(`/recurring/${id}`, { method: 'DELETE' });
  }
};

export default {
  auth: authAPI,
  tasks: tasksAPI,
  goals: goalsAPI,
  recurring: recurringAPI
};
