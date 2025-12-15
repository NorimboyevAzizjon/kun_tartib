import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import RecurringPage from './pages/RecurringPage';
import GoalsPage from './pages/GoalsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// Yangi sahifalar
import PomodoroPage from './pages/PomodoroPage';
import FocusPage from './pages/FocusPage';
import TemplatesPage from './pages/TemplatesPage';
import WeeklyReviewPage from './pages/WeeklyReviewPage';
import NotesPage from './pages/NotesPage';
import GamificationPage from './pages/GamificationPage';
// Yangi qo'shilgan sahifalar
import StatsPage from './pages/StatsPage';
import ArchivePage from './pages/ArchivePage';
import TagsPage from './pages/TagsPage';
import './App.css';
import './assets/theme.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// MUI Icons
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
// Yangi ikonkalar
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

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

// User Menu Komponenti
const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  // Avatar ko'rsatish
  const renderAvatar = (size = 'small') => {
    if (user.avatarImage) {
      return <img src={user.avatarImage} alt="Avatar" className={`avatar-img ${size}`} />;
    }
    if (user.avatar) {
      return <span className={`user-avatar-emoji ${size}`}>{user.avatar}</span>;
    }
    return <PersonOutlineIcon className={`avatar-icon ${size}`} />;
  };

  return (
    <div className="user-menu">
      <button 
        className="user-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="user-avatar">{renderAvatar('small')}</span>
        <span className="user-name">{user.name}</span>
      </button>
      
      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-avatar">{renderAvatar('large')}</span>
            <div className="dropdown-info">
              <span className="dropdown-name">{user.name}</span>
              <span className="dropdown-email">{user.email}</span>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <SettingsOutlinedIcon fontSize="small" /> Sozlamalar
          </Link>
          <button className="dropdown-item logout" onClick={handleLogout}>
            <LogoutOutlinedIcon fontSize="small" /> Chiqish
          </button>
        </div>
      )}
    </div>
  );
};

// Main Layout
const MainLayout = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('kuntartib-theme');
    return saved || 'light';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isAuthenticated } = useAuth();

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Unread notifications count
  useEffect(() => {
    const checkUnread = () => {
      const history = localStorage.getItem('notification-history');
      if (history) {
        try {
          const notifications = JSON.parse(history);
          const unread = notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        } catch {
          // Invalid JSON
        }
      }
    };
    
    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    window.addEventListener('storage', checkUnread);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkUnread);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('kuntartib-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isAuthenticated) {
    return children;
  }
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <EventNoteIcon className="logo-icon-svg" />
            <span className="logo-text">KunTartib</span>
          </Link>

          <div className="nav-menu">
            <NavLink to="/" icon={<AssignmentOutlinedIcon fontSize="small" />}>Vazifalar</NavLink>
            <NavLink to="/dashboard" icon={<BarChartOutlinedIcon fontSize="small" />}>Statistika</NavLink>
            <NavLink to="/calendar" icon={<CalendarMonthOutlinedIcon fontSize="small" />}>Kalendar</NavLink>
            <NavLink to="/pomodoro" icon={<TimerOutlinedIcon fontSize="small" />}>Pomodoro</NavLink>
            <NavLink to="/goals" icon={<FlagOutlinedIcon fontSize="small" />}>Maqsadlar</NavLink>
          </div>

          <div className="nav-actions">
            <Link to="/notifications" className="notification-btn" title="Bildirishnomalar">
              <NotificationsOutlinedIcon />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
            
            <button className="theme-toggle" onClick={toggleTheme} title="Mavzuni o'zgartirish">
              {theme === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </button>
            
            <UserMenu />
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Ikkinchi qator - qo'shimcha sahifalar */}
        <div className="nav-secondary">
          <div className="nav-secondary-container">
            <NavLink to="/focus" icon={<CenterFocusStrongOutlinedIcon fontSize="small" />}>Focus Mode</NavLink>
            <NavLink to="/recurring" icon={<RepeatOutlinedIcon fontSize="small" />}>Takroriy</NavLink>
            <NavLink to="/templates" icon={<BookmarkBorderOutlinedIcon fontSize="small" />}>Shablonlar</NavLink>
            <NavLink to="/weekly-review" icon={<AssessmentOutlinedIcon fontSize="small" />}>Haftalik</NavLink>
            <NavLink to="/notes" icon={<StickyNote2OutlinedIcon fontSize="small" />}>Eslatmalar</NavLink>
            <NavLink to="/achievements" icon={<EmojiEventsOutlinedIcon fontSize="small" />}>Yutuqlar</NavLink>
            <NavLink to="/advanced-stats" icon={<InsightsOutlinedIcon fontSize="small" />}>Tahlil</NavLink>
            <NavLink to="/archive" icon={<ArchiveOutlinedIcon fontSize="small" />}>Arxiv</NavLink>
            <NavLink to="/tags" icon={<LocalOfferOutlinedIcon fontSize="small" />}>Teglar</NavLink>
            <NavLink to="/settings" icon={<SettingsOutlinedIcon fontSize="small" />}>Sozlamalar</NavLink>
          </div>
        </div>

                    {isMobileMenuOpen && (
                      <div className="mobile-menu">
                        <NavLink to="/" icon={<AssignmentOutlinedIcon fontSize="small" />}>Vazifalar</NavLink>
                        <NavLink to="/dashboard" icon={<BarChartOutlinedIcon fontSize="small" />}>Statistika</NavLink>
                        <NavLink to="/calendar" icon={<CalendarMonthOutlinedIcon fontSize="small" />}>Kalendar</NavLink>
                        <NavLink to="/pomodoro" icon={<TimerOutlinedIcon fontSize="small" />}>Pomodoro</NavLink>
                        <NavLink to="/focus" icon={<CenterFocusStrongOutlinedIcon fontSize="small" />}>Focus Mode</NavLink>
                        <NavLink to="/recurring" icon={<RepeatOutlinedIcon fontSize="small" />}>Takroriy</NavLink>
                        <NavLink to="/goals" icon={<FlagOutlinedIcon fontSize="small" />}>Maqsadlar</NavLink>
                        <NavLink to="/templates" icon={<BookmarkBorderOutlinedIcon fontSize="small" />}>Shablonlar</NavLink>
                        <NavLink to="/weekly-review" icon={<AssessmentOutlinedIcon fontSize="small" />}>Haftalik</NavLink>
                        <NavLink to="/notes" icon={<StickyNote2OutlinedIcon fontSize="small" />}>Eslatmalar</NavLink>
                        <NavLink to="/achievements" icon={<EmojiEventsOutlinedIcon fontSize="small" />}>Yutuqlar</NavLink>
                        <NavLink to="/advanced-stats" icon={<InsightsOutlinedIcon fontSize="small" />}>Tahlil</NavLink>
                        <NavLink to="/archive" icon={<ArchiveOutlinedIcon fontSize="small" />}>Arxiv</NavLink>
                        <NavLink to="/tags" icon={<LocalOfferOutlinedIcon fontSize="small" />}>Teglar</NavLink>
                        <NavLink to="/notifications" icon={<NotificationsOutlinedIcon fontSize="small" />}>Bildirishnomalar</NavLink>
                        <NavLink to="/settings" icon={<SettingsOutlinedIcon fontSize="small" />}>Sozlamalar</NavLink>
                      </div>
                    )}
                  </nav>

                  <main className="main-content">
                    {children}
                  </main>

                  <footer className="footer">
                    <div className="footer-content">
                      <div className="footer-left">
                        <span className="copyright-symbol">©</span>
                        <span className="year-badge">2025</span>
                        <span className="brand-name">KunTartib</span>
                        <span className="footer-divider">|</span>
                        <span className="footer-tagline">Vaqtingizni boshqaring</span>
                      </div>
                      <div className="footer-right">
                        <span className="footer-date">
                          {currentTime.toLocaleDateString('uz-UZ', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="footer-divider">|</span>
                        <span className="footer-time">
                          {currentTime.toLocaleTimeString('uz-UZ', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </footer>
                </div>
              );
            } />
            <Route path="/advanced-stats" element={
              <ProtectedRoute><StatsPage /></ProtectedRoute>
            } />
            <Route path="/archive" element={
              <ProtectedRoute><ArchivePage /></ProtectedRoute>
            } />
            <Route path="/tags" element={
              <ProtectedRoute><TagsPage /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;