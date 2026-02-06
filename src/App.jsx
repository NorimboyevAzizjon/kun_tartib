import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ PERFORMANCE: Lazy Loading - sahifalar faqat kerak bo'lganda yuklanadi
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const RecurringPage = lazy(() => import('./pages/RecurringPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const FocusPage = lazy(() => import('./pages/FocusPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const WeeklyReviewPage = lazy(() => import('./pages/WeeklyReviewPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const AIAnalyticsPage = lazy(() => import('./pages/AIAnalyticsPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const TagsPage = lazy(() => import('./pages/TagsPage'));
const SharedListsPage = lazy(() => import('./pages/SharedListsPage'));
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const HabitPage = lazy(() => import('./pages/HabitPage'));

// ✅ Loading Spinner komponenti
const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite">
    <div className="loader-spinner"></div>
    <p>Yuklanmoqda...</p>
  </div>
);
import './App.css';
import Toast from './components/Toast';
import AssistantAI from './components/AssistantAI';
import KeyboardShortcuts from './components/KeyboardShortcuts/KeyboardShortcuts';
import GlobalSearch from './components/GlobalSearch/GlobalSearch';
import DataManager from './components/DataManager/DataManager';
import { ReminderChecker } from './components/TaskReminders/TaskReminders';

// Toast Context for global notification
const ToastContext = React.createContext({ showToast: () => {} });


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
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Global Search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            {/* Search Button */}
            <button 
              className="search-btn" 
              onClick={() => setIsSearchOpen(true)}
              title="Qidirish (Ctrl+K)"
            >
              <span className="search-btn-text">Qidirish...</span>
              <span className="search-shortcut">Ctrl+K</span>
            </button>

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
            <NavLink to="/ai-analytics" icon={<PsychologyOutlinedIcon fontSize="small" />}>AI Tahlil</NavLink>
            <NavLink to="/advanced-stats" icon={<InsightsOutlinedIcon fontSize="small" />}>Statistika+</NavLink>
            <NavLink to="/shared-lists" icon={<GroupOutlinedIcon fontSize="small" />}>Shared Lists</NavLink>
            <NavLink to="/kanban" icon={<ViewKanbanOutlinedIcon fontSize="small" />}>Kanban</NavLink>
            <NavLink to="/habits" icon={<FitnessCenterOutlinedIcon fontSize="small" />}>Odatlar</NavLink>
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
            <NavLink to="/ai-analytics" icon={<PsychologyOutlinedIcon fontSize="small" />}>AI Tahlil</NavLink>
            <NavLink to="/advanced-stats" icon={<InsightsOutlinedIcon fontSize="small" />}>Statistika+</NavLink>
            <NavLink to="/shared-lists" icon={<GroupOutlinedIcon fontSize="small" />}>Shared Lists</NavLink>
            <NavLink to="/kanban" icon={<ViewKanbanOutlinedIcon fontSize="small" />}>Kanban</NavLink>
            <NavLink to="/habits" icon={<FitnessCenterOutlinedIcon fontSize="small" />}>Odatlar</NavLink>
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

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Data Manager Modal */}
      {isDataManagerOpen && <DataManager onClose={() => setIsDataManagerOpen(false)} />}
      
      {/* Task Reminders Checker */}
      <ReminderChecker />
    </div>
  );
};


function App() {
  // Show toast handler
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    window.dispatchEvent(new CustomEvent('kuntartib-toast', {
      detail: { message, type, duration }
    }));
  }, []);

  return (
    <AuthProvider>
      <ToastContext.Provider value={{ showToast }}>
        <Router>
          <MainLayout>
            {/* ✅ PERFORMANCE: Suspense bilan Lazy Loading */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
                <Route path="/focus" element={<ProtectedRoute><FocusPage /></ProtectedRoute>} />
                <Route path="/recurring" element={<ProtectedRoute><RecurringPage /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
                <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
                <Route path="/weekly-review" element={<ProtectedRoute><WeeklyReviewPage /></ProtectedRoute>} />
                <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
                <Route path="/ai-analytics" element={<ProtectedRoute><AIAnalyticsPage /></ProtectedRoute>} />
                <Route path="/advanced-stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                <Route path="/shared-lists" element={<ProtectedRoute><SharedListsPage /></ProtectedRoute>} />
                <Route path="/kanban" element={<ProtectedRoute><KanbanPage /></ProtectedRoute>} />
                <Route path="/habits" element={<ProtectedRoute><HabitPage /></ProtectedRoute>} />
                <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
                <Route path="/tags" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<LoginPage />} />
              </Routes>
            </Suspense>
            {/* AI Assistant floating widget */}
            <AssistantAI />
            {/* Global Keyboard Shortcuts */}
            <KeyboardShortcuts />
          </MainLayout>
        </Router>
      </ToastContext.Provider>
    </AuthProvider>
  );
}

export default App;
export { ToastContext };