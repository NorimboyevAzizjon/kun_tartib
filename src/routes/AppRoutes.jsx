import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import CalendarPage from '../pages/CalendarPage';
import PomodoroPage from '../pages/PomodoroPage';
import FocusPage from '../pages/FocusPage';
import RecurringPage from '../pages/RecurringPage';
import GoalsPage from '../pages/GoalsPage';
import TemplatesPage from '../pages/TemplatesPage';
import WeeklyReviewPage from '../pages/WeeklyReviewPage';
import NotesPage from '../pages/NotesPage';
import GamificationPage from '../pages/GamificationPage';
import StatsPage from '../pages/StatsPage';
import AIAnalyticsPage from '../pages/AIAnalyticsPage';
import ArchivePage from '../pages/ArchivePage';
import TagsPage from '../pages/TagsPage';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';
import SharedListsPage from '../pages/SharedListsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<MainLayout />}>
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
        <Route path="/advanced-stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
        <Route path="/ai-analytics" element={<ProtectedRoute><AIAnalyticsPage /></ProtectedRoute>} />
        <Route path="/shared-lists" element={<ProtectedRoute><SharedListsPage /></ProtectedRoute>} />
        <Route path="/archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
        <Route path="/tags" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
