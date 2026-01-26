import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('kuntartib-theme') || 'light');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kuntartib-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!mobileMenu) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenu(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenu]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" aria-label="KunTartib Home">
            <span className="logo-icon">🗓️</span>
            <span className="logo-text">KunTartib</span>
          </Link>

          <nav className="nav-menu" aria-label="Asosiy navigatsiya">
            {/* Desktop nav links go here */}
          </nav>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Mavzuni o'zgartirish">
              <span aria-hidden>{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>

            <button className="notification-btn" aria-label="Bildirishnomalar" type="button">
              🔔
            </button>

            <div className="user-menu">
              <button className="user-menu-btn" aria-haspopup="true" aria-label="Profil menyusi">
                <span className="avatar-img small" aria-hidden>👤</span>
                <span className="user-name">Foydalanuvchi</span>
              </button>
            </div>

            <button className="hamburger" aria-label="Menyuni ochish" onClick={() => setMobileMenu(m => !m)} type="button">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`mobile-panel ${mobileMenu ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!mobileMenu}
          onClick={() => setMobileMenu(false)}
        >
          <div className="mobile-panel-inner" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-nav">
              {/* Mobile links */}
            </nav>
            <div className="mobile-actions">
              <button className="btn btn-primary" onClick={toggleTheme} type="button">{theme === 'light' ? 'Dark' : 'Light'}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-centered">
        <Outlet />
      </main>
    </div>
  );
}
