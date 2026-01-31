import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token yaroqliligini tekshirish
  const checkTokenValidity = useCallback(() => {
    const token = localStorage.getItem('kuntartib-token');
    if (!token) return false;
    
    // Local token uchun oddiy tekshirish
    if (token.startsWith('local_token_')) {
      const tokenTime = parseInt(token.split('_')[2]);
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (now - tokenTime > thirtyDays) {
        // Token muddati tugagan
        authAPI.logout();
        return false;
      }
    }
    
    return true;
  }, []);

  // Sahifa yuklanganda tekshirish
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (!checkTokenValidity()) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const savedUser = authAPI.getCurrentUser();
        if (savedUser && authAPI.isAuthenticated()) {
          setUser(savedUser);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [checkTokenValidity]);

  // Token yangilash (har 1 soatda)
  useEffect(() => {
    if (!user) return;
    
    const refreshInterval = setInterval(() => {
      if (!checkTokenValidity()) {
        setUser(null);
        setError('Sessiya muddati tugadi. Qayta kiring.');
      }
    }, 60 * 60 * 1000); // 1 soat
    
    return () => clearInterval(refreshInterval);
  }, [user, checkTokenValidity]);

  // Ro'yxatdan o'tish
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.register(userData);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.message || 'Ro\'yxatdan o\'tishda xatolik';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kirish
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login(credentials);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.message || 'Kirishda xatolik';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Chiqish
  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setError(null);
  }, []);

  // Profilni yangilash
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(profileData);
      setUser(prev => ({ ...prev, ...response.data }));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.message || 'Profilni yangilashda xatolik';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Parolni o'zgartirish
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return { success: true, message: response.message };
    } catch (err) {
      const errorMessage = err.message || 'Parolni o\'zgartirishda xatolik';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Xatoni tozalash
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
