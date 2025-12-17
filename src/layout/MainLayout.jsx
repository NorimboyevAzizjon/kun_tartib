import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('kuntartib-theme') || 'light');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kuntartib-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="app">
      <nav className="main-navbar sticky-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button className="hamburger" aria-label="Menyuni ochish" onClick={() => setMobileMenu(m => !m)}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
            <span className="logo-text">KunTartib</span>
          </div>
          <div className="navbar-center">
            {/* Navigatsiya linklari (desktop) */}
            {/* <NavLink ... /> */}
          </div>
          <div className="navbar-right">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Mavzuni o'zgartirish">
              <span className="theme-icon" aria-hidden="true" style={{transition:'all .2s'}}>
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            </button>
            {/* UserMenu yoki profil tugmasi joylashadi */}
          </div>
        </div>
        {/* Mobil menyu */}
        {mobileMenu && (
          <div className="mobile-menu">
            {/* Mobil navigatsiya linklari */}
            {/* <NavLink ... /> */}
          </div>
        )}
      </nav>
      <main className="main-centered">
        <Outlet />
      </main>
    </div>
  );
}
