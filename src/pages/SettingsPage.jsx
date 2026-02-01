import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, sendNotification } from '../components/DesktopNotifications/DesktopNotifications';
import './SettingsPage.css';

// MUI Icons
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PaletteIcon from '@mui/icons-material/Palette';
import TimerIcon from '@mui/icons-material/Timer';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import TranslateIcon from '@mui/icons-material/Translate';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '👤'
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarImage || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Theme settings
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#6366f1');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');

  // Language
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'uz');

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: true,
      taskReminder: true,
      dailyDigest: false
    };
  });

  // Pomodoro settings
  const [pomodoroSettings, setPomodoroSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreak: false
    };
  });

  // General settings
  const [generalSettings, setGeneralSettings] = useState(() => {
    const saved = localStorage.getItem('generalSettings');
    return saved ? JSON.parse(saved) : {
      startOfWeek: 'monday',
      timeFormat: '24h',
      showCompletedTasks: true,
      confirmDelete: true
    };
  });

  // Active tab
  const [activeTab, setActiveTab] = useState('profile');

  // Color options
  const colorOptions = [
    { color: '#6366f1', name: 'Indigo' },
    { color: '#8b5cf6', name: 'Binafsha' },
    { color: '#ec4899', name: "Pushti" },
    { color: '#ef4444', name: "Qizil" },
    { color: '#f97316', name: "To'q sariq" },
    { color: '#22c55e', name: "Yashil" },
    { color: '#3b82f6', name: "Ko'k" },
    { color: '#64748b', name: "Kulrang" },
    { color: '#14b8a6', name: "Teal" },
    { color: '#f59e0b', name: "Sariq" }
  ];

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Kichik', size: '14px' },
    { value: 'medium', label: "O'rta", size: '16px' },
    { value: 'large', label: 'Katta', size: '18px' }
  ];

  // Language options
  const languageOptions = [
    { value: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];

  // Apply theme and color on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    const fontSizeValue = fontSizeOptions.find(f => f.value === fontSize)?.size || '16px';
    document.documentElement.style.setProperty('--base-font-size', fontSizeValue);
  }, []);

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Color change
  const handleColorChange = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary-color', color);
  };

  // Font size change
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    const fontSizeValue = fontSizeOptions.find(f => f.value === size)?.size || '16px';
    document.documentElement.style.setProperty('--base-font-size', fontSizeValue);
  };

  // Language change
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setMessage({ type: 'success', text: 'Til o\'zgartirildi!' });
  };

  // Notification settings
  const handleNotificationChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  // Pomodoro settings
  const handlePomodoroChange = (key, value) => {
    const newSettings = { ...pomodoroSettings, [key]: value };
    setPomodoroSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
  };

  // General settings
  const handleGeneralChange = (key, value) => {
    const newSettings = { ...generalSettings, [key]: value };
    setGeneralSettings(newSettings);
    localStorage.setItem('generalSettings', JSON.stringify(newSettings));
  };

  // Export data
  const handleExportData = () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('kun-tartibi-tasks') || '[]'),
      archivedTasks: JSON.parse(localStorage.getItem('archivedTasks') || '[]'),
      tags: JSON.parse(localStorage.getItem('tags') || '[]'),
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      notes: JSON.parse(localStorage.getItem('quickNotes') || '[]'),
      templates: JSON.parse(localStorage.getItem('taskTemplates') || '[]'),
      settings: { 
        theme, 
        primaryColor, 
        fontSize,
        language,
        notificationSettings, 
        pomodoroSettings,
        generalSettings
      },
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kuntartib-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: "Ma'lumotlar muvaffaqiyatli eksport qilindi!" });
  };

  // Import data
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.tasks) localStorage.setItem('kun-tartibi-tasks', JSON.stringify(data.tasks));
        if (data.archivedTasks) localStorage.setItem('archivedTasks', JSON.stringify(data.archivedTasks));
        if (data.tags) localStorage.setItem('tags', JSON.stringify(data.tags));
        if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
        if (data.notes) localStorage.setItem('quickNotes', JSON.stringify(data.notes));
        if (data.templates) localStorage.setItem('taskTemplates', JSON.stringify(data.templates));
        
        if (data.settings) {
          if (data.settings.theme) handleThemeChange(data.settings.theme);
          if (data.settings.primaryColor) handleColorChange(data.settings.primaryColor);
          if (data.settings.fontSize) handleFontSizeChange(data.settings.fontSize);
          if (data.settings.language) handleLanguageChange(data.settings.language);
          if (data.settings.notificationSettings) {
            setNotificationSettings(data.settings.notificationSettings);
            localStorage.setItem('notificationSettings', JSON.stringify(data.settings.notificationSettings));
          }
          if (data.settings.pomodoroSettings) {
            setPomodoroSettings(data.settings.pomodoroSettings);
            localStorage.setItem('pomodoroSettings', JSON.stringify(data.settings.pomodoroSettings));
          }
          if (data.settings.generalSettings) {
            setGeneralSettings(data.settings.generalSettings);
            localStorage.setItem('generalSettings', JSON.stringify(data.settings.generalSettings));
          }
        }
        
        setMessage({ type: 'success', text: "Ma'lumotlar muvaffaqiyatli import qilindi!" });
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setMessage({ type: 'error', text: "Faylni o'qishda xatolik! Fayl formati noto'g'ri." });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear all data
  const handleClearAllData = () => {
    const keysToRemove = [
      'kun-tartibi-tasks', 'archivedTasks', 'tags', 'goals', 
      'quickNotes', 'completionHistory', 'taskTemplates',
      'pomodoroSessions', 'weeklyStats'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setShowClearConfirm(false);
    setMessage({ type: 'success', text: "Barcha ma'lumotlar o'chirildi!" });
    setTimeout(() => window.location.reload(), 1500);
  };

  // Image selection
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Rasm hajmi 2MB dan oshmasin!' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Avatar emojis
  const avatarEmojis = ['👤', '👨', '👩', '👦', '👧', '🧑', '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🦸', '🦸‍♂️', '🦸‍♀️', '🧙', '🧙‍♂️', '🤴', '👸', '🧑‍🎨', '👨‍🚀'];

  // Save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    // Validation
    if (!profileData.name.trim()) {
      setMessage({ type: 'error', text: 'Ism bo\'sh bo\'lmasin!' });
      setSaving(false);
      return;
    }

    if (profileData.name.trim().length < 2) {
      setMessage({ type: 'error', text: 'Ism kamida 2 ta harfdan iborat bo\'lsin!' });
      setSaving(false);
      return;
    }

    try {
      const updatedData = {
        ...profileData,
        name: profileData.name.trim(),
        avatarImage: avatarPreview
      };

      // Save to localStorage
      const currentUser = JSON.parse(localStorage.getItem('kuntartib-user') || '{}');
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('kuntartib-user', JSON.stringify(newUser));

      // Update users list
      const users = JSON.parse(localStorage.getItem('kuntartib-users') || '[]');
      const updatedUsers = users.map(u => 
        u.email === currentUser.email ? { ...u, ...updatedData } : u
      );
      localStorage.setItem('kuntartib-users', JSON.stringify(updatedUsers));

      if (updateProfile) {
        await updateProfile(updatedData);
      }

      setMessage({ type: 'success', text: 'Profil muvaffaqiyatli saqlandi!' });
    } catch (error) {
      console.error('Profil saqlash xatoligi:', error);
      setMessage({ 
        type: 'error', 
        text: 'Profil saqlanishda xatolik yuz berdi.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Barcha maydonlarni to\'ldiring!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Yangi parol kamida 6 ta belgidan iborat bo\'lsin!' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Parollar mos kelmayapti!' });
      return;
    }

    // Check current password
    const currentUser = JSON.parse(localStorage.getItem('kuntartib-user') || '{}');
    const users = JSON.parse(localStorage.getItem('kuntartib-users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1 || users[userIndex].password !== currentPassword) {
      setMessage({ type: 'error', text: 'Joriy parol noto\'g\'ri!' });
      return;
    }

    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem('kuntartib-users', JSON.stringify(users));

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
    setMessage({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi!' });
  };

  // Logout
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    localStorage.removeItem('kuntartib-user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Keyboard shortcuts info
  const shortcuts = [
    { keys: ['Ctrl', 'N'], action: 'Yangi vazifa' },
    { keys: ['Ctrl', 'S'], action: 'Saqlash' },
    { keys: ['Ctrl', 'F'], action: 'Qidirish' },
    { keys: ['Ctrl', 'D'], action: 'Mavzuni almashtirish' },
    { keys: ['Esc'], action: 'Modalni yopish' },
    { keys: ['Enter'], action: 'Tasdiqlash' }
  ];

  // Tab items
  const tabs = [
    { id: 'profile', label: 'Profil', icon: <PersonOutlineIcon /> },
    { id: 'appearance', label: 'Ko\'rinish', icon: <PaletteIcon /> },
    { id: 'notifications', label: 'Bildirishnomalar', icon: <NotificationsIcon /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <TimerIcon /> },
    { id: 'general', label: 'Umumiy', icon: <SettingsOutlinedIcon /> },
    { id: 'data', label: 'Ma\'lumotlar', icon: <BackupIcon /> },
    { id: 'shortcuts', label: 'Tugmalar', icon: <KeyboardIcon /> },
    { id: 'about', label: 'Haqida', icon: <InfoIcon /> }
  ];

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <h1>
          <Link to="/" className="header-icon icon-link">
            <SettingsOutlinedIcon className="header-icon-svg" />
          </Link>
          Sozlamalar
        </h1>
        <p>Ilovangizni o'zingizga moslang</p>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`settings-toast ${message.type}`}>
          {message.type === 'success' ? (
            <CheckCircleOutlineIcon />
          ) : (
            <ErrorOutlineIcon />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <h3 className="section-title">
              <PersonOutlineIcon /> Profil ma'lumotlari
            </h3>

            <div className="profile-settings">
              {/* Avatar */}
              <div className="avatar-section">
                <div className="avatar-preview" onClick={handleImageClick}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="avatar-image" />
                  ) : (
                    <span className="avatar-emoji">{profileData.avatar}</span>
                  )}
                  <div className="avatar-overlay">
                    <CameraAltOutlinedIcon />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="avatar-hint">Rasmni o'zgartirish uchun bosing (max 2MB)</p>
              </div>

              {/* Emoji selector */}
              <div className="emoji-selector">
                <label>Yoki emoji tanlang:</label>
                <div className="emoji-grid">
                  {avatarEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className={`emoji-btn ${profileData.avatar === emoji && !avatarPreview ? 'active' : ''}`}
                      onClick={() => {
                        setProfileData({ ...profileData, avatar: emoji });
                        setAvatarPreview(null);
                      }}
                      title={`Emoji ${index + 1}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label>
                  <EditOutlinedIcon fontSize="small" /> Ismingiz
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Ismingizni kiriting"
                  maxLength={50}
                />
              </div>

              {/* Email (readonly) */}
              <div className="form-group">
                <label>
                  <EmailOutlinedIcon fontSize="small" /> Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="readonly-input"
                />
                <small className="input-hint">Email o'zgartirib bo'lmaydi</small>
              </div>

              {/* Save button */}
              <button 
                className="save-profile-btn"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <><HourglassEmptyIcon fontSize="small" /> Saqlanmoqda...</>
                ) : (
                  <><SaveOutlinedIcon fontSize="small" /> Profilni saqlash</>
                )}
              </button>

              {/* Password Section */}
              <div className="password-section">
                <button 
                  className="toggle-password-btn"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  <LockOutlinedIcon />
                  <span>Parolni o'zgartirish</span>
                  <span className={`arrow ${showPasswordSection ? 'open' : ''}`}>▼</span>
                </button>

                {showPasswordSection && (
                  <div className="password-form">
                    <div className="form-group">
                      <label>Joriy parol</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Joriy parolni kiriting"
                        />
                        <button 
                          type="button"
                          className="toggle-visibility"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Yangi parol</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Yangi parolni kiriting (min 6 ta belgi)"
                        />
                        <button 
                          type="button"
                          className="toggle-visibility"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Parolni tasdiqlash</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Yangi parolni qayta kiriting"
                        />
                        <button 
                          type="button"
                          className="toggle-visibility"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                      </div>
                    </div>

                    <button className="change-password-btn" onClick={handleChangePassword}>
                      <LockOutlinedIcon fontSize="small" />
                      Parolni o'zgartirish
                    </button>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                <LogoutIcon />
                <span>Hisobdan chiqish</span>
              </button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="settings-section">
            <h3 className="section-title">
              <PaletteIcon /> Ko'rinish sozlamalari
            </h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  {theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                  Tungi rejim
                </span>
                <span className="setting-desc">Qorong'u mavzuni yoqish/o'chirish</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <PaletteIcon />
                  Asosiy rang
                </span>
                <span className="setting-desc">Ilova uchun asosiy rang sxemasi</span>
              </div>
              <div className="color-picker">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.color}
                    className={`color-option ${primaryColor === opt.color ? 'active' : ''}`}
                    style={{ backgroundColor: opt.color }}
                    onClick={() => handleColorChange(opt.color)}
                    title={opt.name}
                  />
                ))}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <FormatSizeIcon />
                  Shrift hajmi
                </span>
                <span className="setting-desc">Matn hajmini sozlash</span>
              </div>
              <div className="font-size-picker">
                {fontSizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`font-size-option ${fontSize === opt.value ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <TranslateIcon />
                  Til
                </span>
                <span className="setting-desc">Ilova tilini tanlang</span>
              </div>
              <div className="language-picker">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`language-option ${language === opt.value ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(opt.value)}
                  >
                    <span className="flag">{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3 className="section-title">
              <NotificationsIcon /> Bildirishnoma sozlamalari
            </h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <NotificationsIcon />
                  Bildirishnomalar
                </span>
                <span className="setting-desc">Barcha push bildirishnomalarni yoqish</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={() => handleNotificationChange('enabled', !notificationSettings.enabled)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  {notificationSettings.sound ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  Ovozli signal
                </span>
                <span className="setting-desc">Bildirishnoma kelganda ovoz chiqarish</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.sound}
                  onChange={() => handleNotificationChange('sound', !notificationSettings.sound)}
                  disabled={!notificationSettings.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <CalendarTodayIcon />
                  Vazifa eslatmasi
                </span>
                <span className="setting-desc">Muddat yaqinlashganda eslatish</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.taskReminder}
                  onChange={() => handleNotificationChange('taskReminder', !notificationSettings.taskReminder)}
                  disabled={!notificationSettings.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <EmailOutlinedIcon />
                  Kunlik xulosa
                </span>
                <span className="setting-desc">Har kuni vazifalar haqida xulosa</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.dailyDigest}
                  onChange={() => handleNotificationChange('dailyDigest', !notificationSettings.dailyDigest)}
                  disabled={!notificationSettings.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Desktop Notifications Permission */}
            <div className="setting-item desktop-notification-item">
              <div className="setting-info">
                <span className="setting-label">
                  <NotificationsIcon />
                  Brauzer bildirishnomalari
                </span>
                <span className="setting-desc">
                  {typeof window !== 'undefined' && 'Notification' in window
                    ? Notification.permission === 'granted'
                      ? '✓ Ruxsat berilgan'
                      : Notification.permission === 'denied'
                        ? '✗ Ruxsat rad etilgan'
                        : 'Ruxsat so\'rash kerak'
                    : 'Bu brauzer qo\'llab-quvvatlamaydi'}
                </span>
              </div>
              <button 
                className="permission-btn"
                onClick={async () => {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    sendNotification('KunTartib', {
                      body: 'Bildirishnomalar muvaffaqiyatli yoqildi! 🎉'
                    });
                    setMessage({ type: 'success', text: 'Brauzer bildirishnomalari yoqildi!' });
                  } else {
                    setMessage({ type: 'error', text: 'Bildirishnomalar rad etildi yoki qo\'llab-quvvatlanmaydi' });
                  }
                }}
                disabled={typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'}
              >
                {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' 
                  ? 'Yoqilgan ✓' 
                  : 'Ruxsat so\'rash'}
              </button>
            </div>
          </div>
        )}

        {/* Pomodoro Tab */}
        {activeTab === 'pomodoro' && (
          <div className="settings-section">
            <h3 className="section-title">
              <TimerIcon /> Pomodoro sozlamalari
            </h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">⏱️ Ish vaqti</span>
                <span className="setting-desc">Har bir pomodoro sessiyasi davomiyligi</span>
              </div>
              <div className="number-input">
                <button onClick={() => handlePomodoroChange('workDuration', Math.max(5, pomodoroSettings.workDuration - 5))}>−</button>
                <span>{pomodoroSettings.workDuration} daqiqa</span>
                <button onClick={() => handlePomodoroChange('workDuration', Math.min(60, pomodoroSettings.workDuration + 5))}>+</button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">☕ Qisqa tanaffus</span>
                <span className="setting-desc">Pomodorolalar orasidagi dam olish</span>
              </div>
              <div className="number-input">
                <button onClick={() => handlePomodoroChange('shortBreak', Math.max(1, pomodoroSettings.shortBreak - 1))}>−</button>
                <span>{pomodoroSettings.shortBreak} daqiqa</span>
                <button onClick={() => handlePomodoroChange('shortBreak', Math.min(15, pomodoroSettings.shortBreak + 1))}>+</button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">🛋️ Uzun tanaffus</span>
                <span className="setting-desc">4 pomodorodan keyin uzun dam olish</span>
              </div>
              <div className="number-input">
                <button onClick={() => handlePomodoroChange('longBreak', Math.max(5, pomodoroSettings.longBreak - 5))}>−</button>
                <span>{pomodoroSettings.longBreak} daqiqa</span>
                <button onClick={() => handlePomodoroChange('longBreak', Math.min(30, pomodoroSettings.longBreak + 5))}>+</button>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">🔄 Avtomatik tanaffus</span>
                <span className="setting-desc">Ish tugagach tanaffusni avtomatik boshlash</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={pomodoroSettings.autoStartBreak}
                  onChange={() => handlePomodoroChange('autoStartBreak', !pomodoroSettings.autoStartBreak)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="pomodoro-preview">
              <h4>Joriy sessiya rejasi:</h4>
              <div className="session-preview">
                <div className="session-item work">
                  <span>🍅</span>
                  <span>{pomodoroSettings.workDuration} min</span>
                </div>
                <span className="arrow">→</span>
                <div className="session-item break">
                  <span>☕</span>
                  <span>{pomodoroSettings.shortBreak} min</span>
                </div>
                <span className="arrow">→</span>
                <div className="session-item work">
                  <span>🍅</span>
                  <span>{pomodoroSettings.workDuration} min</span>
                </div>
                <span className="arrow">→</span>
                <div className="session-item long-break">
                  <span>🛋️</span>
                  <span>{pomodoroSettings.longBreak} min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3 className="section-title">
              <SettingsOutlinedIcon /> Umumiy sozlamalar
            </h3>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <CalendarTodayIcon />
                  Hafta boshlanishi
                </span>
                <span className="setting-desc">Kalendarda hafta qaysi kundan boshlansin</span>
              </div>
              <select 
                className="select-input"
                value={generalSettings.startOfWeek}
                onChange={(e) => handleGeneralChange('startOfWeek', e.target.value)}
              >
                <option value="monday">Dushanba</option>
                <option value="sunday">Yakshanba</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <AccessTimeIcon />
                  Vaqt formati
                </span>
                <span className="setting-desc">Vaqt ko'rsatish formati</span>
              </div>
              <select 
                className="select-input"
                value={generalSettings.timeFormat}
                onChange={(e) => handleGeneralChange('timeFormat', e.target.value)}
              >
                <option value="24h">24 soatlik (14:30)</option>
                <option value="12h">12 soatlik (2:30 PM)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <CheckCircleOutlineIcon />
                  Bajarilgan vazifalar
                </span>
                <span className="setting-desc">Bajarilgan vazifalarni ko'rsatish</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={generalSettings.showCompletedTasks}
                  onChange={() => handleGeneralChange('showCompletedTasks', !generalSettings.showCompletedTasks)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">
                  <WarningIcon />
                  O'chirishni tasdiqlash
                </span>
                <span className="setting-desc">Vazifani o'chirishdan oldin so'rash</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={generalSettings.confirmDelete}
                  onChange={() => handleGeneralChange('confirmDelete', !generalSettings.confirmDelete)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="settings-section">
            <h3 className="section-title">
              <BackupIcon /> Ma'lumotlarni boshqarish
            </h3>

            <div className="data-actions">
              <button className="data-btn export-btn" onClick={handleExportData}>
                <DownloadIcon />
                <span>Eksport qilish</span>
                <small>Barcha ma'lumotlarni JSON fayl sifatida yuklab olish</small>
              </button>

              <button className="data-btn import-btn" onClick={() => backupInputRef.current?.click()}>
                <UploadIcon />
                <span>Import qilish</span>
                <small>Zaxira nusxadan ma'lumotlarni tiklash</small>
              </button>
              <input
                type="file"
                ref={backupInputRef}
                onChange={handleImportData}
                accept=".json"
                style={{ display: 'none' }}
              />

              <button className="data-btn danger-btn" onClick={() => setShowClearConfirm(true)}>
                <DeleteSweepIcon />
                <span>Tozalash</span>
                <small>Barcha ma'lumotlarni butunlay o'chirish</small>
              </button>
            </div>

            <div className="storage-info">
              <SecurityIcon />
              <div>
                <p><strong>Xavfsizlik haqida:</strong></p>
                <p>Barcha ma'lumotlaringiz faqat brauzeringizda saqlanadi. Hech qanday ma'lumot serverga yuborilmaydi.</p>
              </div>
            </div>

            <div className="data-stats">
              <h4>Saqlangan ma'lumotlar:</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{JSON.parse(localStorage.getItem('kun-tartibi-tasks') || '[]').length}</span>
                  <span className="stat-label">Vazifalar</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{JSON.parse(localStorage.getItem('archivedTasks') || '[]').length}</span>
                  <span className="stat-label">Arxiv</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{JSON.parse(localStorage.getItem('goals') || '[]').length}</span>
                  <span className="stat-label">Maqsadlar</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{JSON.parse(localStorage.getItem('quickNotes') || '[]').length}</span>
                  <span className="stat-label">Eslatmalar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <div className="settings-section">
            <h3 className="section-title">
              <KeyboardIcon /> Klaviatura tugmalari
            </h3>

            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <div className="shortcut-keys">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <kbd>{key}</kbd>
                        {i < shortcut.keys.length - 1 && <span>+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="shortcut-action">{shortcut.action}</span>
                </div>
              ))}
            </div>

            <div className="shortcuts-tip">
              <InfoIcon />
              <p>Klaviatura tugmalaridan foydalanib tezroq ishlang!</p>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="settings-section">
            <h3 className="section-title">
              <InfoIcon /> Ilova haqida
            </h3>

            <div className="app-info">
              <div className="app-logo">📋</div>
              <h4>Kun Tartibi</h4>
              <p className="app-version">Versiya 2.1.0</p>
              <p className="app-desc">
                Vazifalaringizni oson boshqaring, maqsadlaringizga erishing va kunlik 
                hayotingizni tartibga soling. Kun Tartibi - sizning ishonchli yordamchingiz!
              </p>
              
              <div className="app-features">
                <span>✓ Vazifalar</span>
                <span>✓ Maqsadlar</span>
                <span>✓ Pomodoro</span>
                <span>✓ Statistika</span>
                <span>✓ Kalendar</span>
                <span>✓ Eslatmalar</span>
                <span>✓ Shablonlar</span>
                <span>✓ Focus Mode</span>
              </div>

              <div className="app-credits">
                <p>💜 O'zbekiston uchun muhabbat bilan yaratildi</p>
                <p>© 2024-2026 Kun Tartibi. Barcha huquqlar himoyalangan.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <WarningIcon className="warning-icon" />
            <h3>Barcha ma'lumotlarni o'chirish</h3>
            <p>Vazifalar, maqsadlar, teglar va boshqa barcha ma'lumotlar butunlay o'chiriladi.</p>
            <p className="warning-text">⚠️ Bu amalni qaytarib bo'lmaydi!</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowClearConfirm(false)}>
                Bekor qilish
              </button>
              <button className="confirm-delete-btn" onClick={handleClearAllData}>
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <LogoutIcon className="logout-icon" />
            <h3>Hisobdan chiqish</h3>
            <p>Haqiqatan ham hisobingizdan chiqmoqchimisiz?</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Bekor qilish
              </button>
              <button className="confirm-logout-btn" onClick={handleLogout}>
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
