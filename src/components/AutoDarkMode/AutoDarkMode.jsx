import { useEffect, useState } from 'react';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import './AutoDarkMode.css';

function AutoDarkMode() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'auto';
  });

  // System preference detection
  const getSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Time-based theme (6:00 - 18:00 light, else dark)
  const getTimeBasedTheme = () => {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  };

  // Apply theme
  const applyTheme = (themeMode) => {
    let actualTheme;
    
    if (themeMode === 'auto') {
      // Auto mode: use system preference
      actualTheme = getSystemPreference();
    } else if (themeMode === 'time') {
      // Time-based mode
      actualTheme = getTimeBasedTheme();
    } else {
      actualTheme = themeMode;
    }

    document.documentElement.setAttribute('data-theme', actualTheme);
    localStorage.setItem('theme', actualTheme);
    localStorage.setItem('themeMode', themeMode);
  };

  // Listen for system preference changes
  useEffect(() => {
    applyTheme(mode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Time-based mode: check every minute
  useEffect(() => {
    if (mode !== 'time') return;

    const interval = setInterval(() => {
      applyTheme('time');
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [mode]);

  const cycleMode = () => {
    const modes = ['light', 'dark', 'auto', 'time'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'light':
        return <LightModeIcon />;
      case 'dark':
        return <DarkModeIcon />;
      case 'auto':
      case 'time':
        return <AutoModeIcon />;
      default:
        return <AutoModeIcon />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'light':
        return "Yorug' rejim";
      case 'dark':
        return "Qorong'i rejim";
      case 'auto':
        return "Avtomatik (tizim)";
      case 'time':
        return "Vaqtga qarab";
      default:
        return "Avtomatik";
    }
  };

  return (
    <button 
      className={`auto-dark-mode-btn mode-${mode}`}
      onClick={cycleMode}
      title={getModeLabel()}
    >
      <span className="mode-icon">{getModeIcon()}</span>
      <span className="mode-label">{getModeLabel()}</span>
    </button>
  );
}

export default AutoDarkMode;
