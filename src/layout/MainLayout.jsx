import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// ...ikonka va nav importlari, UserMenu, NavLink importlari kerak bo'lsa shu yerda import qiling...

  // Dark/Light mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kuntartib-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kuntartib-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app">
      <nav className="main-navbar">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Mavzuni o'zgartirish">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
