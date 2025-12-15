// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// LocalStorage Mode (Backend ishlamaganda)
const USE_LOCAL_STORAGE = false; // Backend ulanganda false qiling

// Token olish
const getToken = () => localStorage.getItem('kuntartib-token');

// Headers yaratish
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` })
});

// API so'rovlar uchun wrapper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Xatolik yuz berdi');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// =====================
// AUTH API (LocalStorage mode)
// =====================
export const authAPI = {
  // Ro'yxatdan o'tish
  register: async (userData) => {
    if (USE_LOCAL_STORAGE) {
      // LocalStorage mode
      const users = JSON.parse(localStorage.getItem('kuntartib-users') || '[]');
      
      // Email tekshirish
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
      
      const newUser = {
        _id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // Real loyihada hash qilinadi
        avatar: '👤',
        token: 'local_token_' + Date.now()
      };
      
      users.push(newUser);
      localStorage.setItem('kuntartib-users', JSON.stringify(users));
      localStorage.setItem('kuntartib-token', newUser.token);
      localStorage.setItem('kuntartib-user', JSON.stringify(newUser));
      
      return { success: true, data: newUser };
    }
    
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.data.token) {
      localStorage.setItem('kuntartib-token', data.data.token);
      localStorage.setItem('kuntartib-user', JSON.stringify(data.data));
    }
    return data;
  },

  // Kirish
  login: async (credentials) => {
    if (USE_LOCAL_STORAGE) {
      // LocalStorage mode
      const users = JSON.parse(localStorage.getItem('kuntartib-users') || '[]');
      const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (!user) {
        throw new Error('Email yoki parol noto\'g\'ri');
      }
      
      user.token = 'local_token_' + Date.now();
      localStorage.setItem('kuntartib-token', user.token);
      localStorage.setItem('kuntartib-user', JSON.stringify(user));
      
      return { success: true, data: user };
    }
    
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.data.token) {
      localStorage.setItem('kuntartib-token', data.data.token);
      localStorage.setItem('kuntartib-user', JSON.stringify(data.data));
    }
    return data;
  },

  // Chiqish
  logout: () => {
    localStorage.removeItem('kuntartib-token');
    localStorage.removeItem('kuntartib-user');
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
  updateProfile: (profileData) => {
    if (USE_LOCAL_STORAGE) {
      const user = authAPI.getCurrentUser();
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('kuntartib-user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    }
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Auth holatini tekshirish
  isAuthenticated: () => !!getToken(),

  // Joriy foydalanuvchi ma'lumotlari
  getCurrentUser: () => {
    const user = localStorage.getItem('kuntartib-user');
    return user ? JSON.parse(user) : null;
  }
};

// =====================
// TASKS API
// =====================
export const tasksAPI = {
  // Barcha vazifalar
  getAll: () => apiRequest('/tasks'),

  // Bitta vazifa
  getOne: (id) => apiRequest(`/tasks/${id}`),

  // Yangi vazifa
  create: (taskData) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),

  // Vazifani yangilash
  update: (id, taskData) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  }),

  // Vazifani o'chirish
  delete: (id) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  }),

  // Status o'zgartirish
  toggle: (id) => apiRequest(`/tasks/${id}/toggle`, {
    method: 'PATCH'
  })
};

// =====================
// GOALS API
// =====================
export const goalsAPI = {
  // Barcha maqsadlar
  getAll: () => apiRequest('/goals'),

  // Yangi maqsad
  create: (goalData) => apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(goalData)
  }),

  // Maqsadni yangilash
  update: (id, goalData) => apiRequest(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(goalData)
  }),

  // Maqsadni o'chirish
  delete: (id) => apiRequest(`/goals/${id}`, {
    method: 'DELETE'
  })
};

export default {
  auth: authAPI,
  tasks: tasksAPI,
  goals: goalsAPI
};
