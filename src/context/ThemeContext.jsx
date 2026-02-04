import React, { createContext, useContext, useState, useEffect } from 'react';

// Default themes
const defaultThemes = {
  light: {
    id: 'light',
    name: 'Yorug\'',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  dark: {
    id: 'dark',
    name: 'Qorong\'i',
    colors: {
      primary: '#818cf8',
      secondary: '#a78bfa',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Okean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626'
    }
  },
  forest: {
    id: 'forest',
    name: 'O\'rmon',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#bbf7d0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Quyosh botishi',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#fed7aa',
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626'
    }
  },
  purple: {
    id: 'purple',
    name: 'Binafsha',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#7e22ce',
      border: '#e9d5ff',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  }
};

// Theme Context
const ThemeContext = createContext();

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('kuntartib-theme');
    return saved || 'light';
  });
  
  const [customThemes, setCustomThemes] = useState(() => {
    const saved = localStorage.getItem('kuntartib-custom-themes');
    return saved ? JSON.parse(saved) : {};
  });

  // All available themes
  const allThemes = { ...defaultThemes, ...customThemes };

  // Apply theme to document
  useEffect(() => {
    const theme = allThemes[currentTheme] || defaultThemes.light;
    
    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', 
      currentTheme === 'light' ? 'light' : 
      currentTheme === 'dark' ? 'dark' : 'light'
    );
    
    // Apply CSS custom properties
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Save to localStorage
    localStorage.setItem('kuntartib-theme', currentTheme);
  }, [currentTheme, allThemes]);

  // Save custom themes
  useEffect(() => {
    localStorage.setItem('kuntartib-custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  // Change theme
  const setTheme = (themeId) => {
    if (allThemes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  // Create custom theme
  const createTheme = (theme) => {
    const id = `custom-${Date.now()}`;
    const newTheme = {
      id,
      name: theme.name || 'Yangi mavzu',
      colors: { ...defaultThemes.light.colors, ...theme.colors }
    };
    setCustomThemes(prev => ({ ...prev, [id]: newTheme }));
    return id;
  };

  // Update custom theme
  const updateTheme = (themeId, updates) => {
    if (customThemes[themeId]) {
      setCustomThemes(prev => ({
        ...prev,
        [themeId]: { ...prev[themeId], ...updates }
      }));
    }
  };

  // Delete custom theme
  const deleteTheme = (themeId) => {
    if (customThemes[themeId]) {
      const { [themeId]: removed, ...rest } = customThemes;
      setCustomThemes(rest);
      if (currentTheme === themeId) {
        setCurrentTheme('light');
      }
    }
  };

  // Get current theme object
  const theme = allThemes[currentTheme] || defaultThemes.light;

  // Check if dark mode
  const isDark = currentTheme === 'dark';

  // Toggle between light and dark
  const toggleDarkMode = () => {
    setCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme,
      themes: allThemes,
      defaultThemes,
      customThemes,
      isDark,
      setTheme,
      toggleDarkMode,
      createTheme,
      updateTheme,
      deleteTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
