import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

// Navigation Link Komponenti
const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      {children}
    </Link>
  );
};

function App() {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme ni o'rnatish
  useEffect(() => {
    const savedTheme = localStorage.getItem('kuntartib-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('kuntartib-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <Router>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-container">
            {/* Logo */}
            <Link to="/" className="nav-logo">
              <span className="logo-icon">📅</span>
              <span className="logo-text">KunTartib</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="nav-menu">
              <NavLink to="/" icon="📋">Vazifalar</NavLink>
              <NavLink to="/dashboard" icon="📊">Statistika</NavLink>
              <NavLink to="/calendar" icon="📅">Kalendar</NavLink>
              <NavLink to="/settings" icon="⚙️">Sozlamalar</NavLink>
            </div>

            {/* Right Actions */}
            <div className="nav-actions">
              <button className="theme-toggle" onClick={toggleTheme} title="Mavzuni o'zgartirish">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu">
              <NavLink to="/" icon="📋">Vazifalar</NavLink>
              <NavLink to="/dashboard" icon="📊">Statistika</NavLink>
              <NavLink to="/calendar" icon="📅">Kalendar</NavLink>
              <NavLink to="/settings" icon="⚙️">Sozlamalar</NavLink>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2024 KunTartib | Vaqtingizni boshqaring</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;