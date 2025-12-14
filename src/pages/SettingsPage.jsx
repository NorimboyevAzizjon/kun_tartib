import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from '../components/Notifications/Notifications';
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
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kun-tartibi-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '👤'
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarImage || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Mavzu sozlamalari
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || '#6366f1');

  // Rang variantlari
  const colorOptions = [
    { color: '#6366f1', name: 'Indigo' },
    { color: '#8b5cf6', name: 'Binafsha' },
    { color: '#ec4899', name: "Pushti" },
    { color: '#ef4444', name: "Qizil" },
    { color: '#f97316', name: "To'q sariq" },
    { color: '#22c55e', name: "Yashil" },
    { color: '#3b82f6', name: "Ko'k" },
    { color: '#64748b', name: "Kulrang" }
  ];

  // Rangni o'zgartirish
  const handleColorChange = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--primary-color', color);
  };

  // Bildirishnoma sozlamalari
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: true,
      taskReminder: true,
      dailyDigest: false
    };
  });

  // Pomodoro sozlamalari
  const [pomodoroSettings, setPomodoroSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    return saved ? JSON.parse(saved) : {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreak: false
    };
  });

  // Mavzuni o'zgartirish
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };



  // Bildirishnoma sozlamalarini saqlash
  const handleNotificationChange = (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  // Pomodoro sozlamalarini saqlash
  const handlePomodoroChange = (key, value) => {
    const newSettings = { ...pomodoroSettings, [key]: value };
    setPomodoroSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
  };

  // Ma'lumotlarni eksport qilish
  const handleExportData = () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      archivedTasks: JSON.parse(localStorage.getItem('archivedTasks') || '[]'),
      tags: JSON.parse(localStorage.getItem('tags') || '[]'),
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      notes: JSON.parse(localStorage.getItem('quickNotes') || '[]'),
      settings: { theme, primaryColor, notificationSettings, pomodoroSettings },
      exportDate: new Date().toISOString()
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
    setMessage({ type: 'success', text: "Ma'lumotlar eksport qilindi!" });
  };

  // Ma'lumotlarni import qilish
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
        if (data.archivedTasks) localStorage.setItem('archivedTasks', JSON.stringify(data.archivedTasks));
        if (data.tags) localStorage.setItem('tags', JSON.stringify(data.tags));
        if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
        if (data.notes) localStorage.setItem('quickNotes', JSON.stringify(data.notes));
        if (data.settings) {
          if (data.settings.theme) handleThemeChange(data.settings.theme);
          if (data.settings.primaryColor) handleColorChange(data.settings.primaryColor);
        }
        setMessage({ type: 'success', text: "Ma'lumotlar import qilindi!" });
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setMessage({ type: 'error', text: "Faylni o'qishda xatolik!" });
      }
    };
    reader.readAsText(file);
  };

  // Barcha ma'lumotlarni o'chirish
  const handleClearAllData = () => {
    localStorage.removeItem('tasks');
    localStorage.removeItem('archivedTasks');
    localStorage.removeItem('tags');
    localStorage.removeItem('goals');
    localStorage.removeItem('quickNotes');
    localStorage.removeItem('completionHistory');
    setShowClearConfirm(false);
    setMessage({ type: 'success', text: "Barcha ma'lumotlar o'chirildi!" });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleUpdateTask = (taskId, updates) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    setTasks(newTasks);
    localStorage.setItem('kun-tartibi-tasks', JSON.stringify(newTasks));
  };

  // Rasm tanlash
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Rasm yuklash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Rasm hajmi 2MB dan oshmasin' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Emoji tanlash
  const avatarEmojis = ['👤', '👨', '👩', '👦', '👧', '🧑', '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🦸', '🦸‍♂️', '🦸‍♀️', '🧙', '🧙‍♂️'];

  // Profilni saqlash
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      const updatedData = {
        ...profileData,
        avatarImage: avatarPreview
      };

      // LocalStorage'ga saqlash
      const currentUser = JSON.parse(localStorage.getItem('kuntartib-user') || '{}');
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('kuntartib-user', JSON.stringify(newUser));

      // Users ro'yxatini yangilash
      const users = JSON.parse(localStorage.getItem('kuntartib-users') || '[]');
      const updatedUsers = users.map(u => 
        u.email === currentUser.email ? { ...u, ...updatedData } : u
      );
      localStorage.setItem('kuntartib-users', JSON.stringify(updatedUsers));

      if (updateProfile) {
        await updateProfile(updatedData);
      }

      setMessage({ type: 'success', text: 'Profil saqlandi!' });
      
      // Sahifani yangilash
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Xatolik: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <h1>
          <Link to="/" className="header-icon icon-link"><SettingsOutlinedIcon className="header-icon-svg" /></Link>
          Sozlamalar
        </h1>
        <p>Ilovangizni moslashtiring</p>
      </div>

      {/* Profil sozlamalari */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <PersonOutlineIcon /> Profil
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
            <p className="avatar-hint">Rasmni o'zgartirish uchun bosing</p>
          </div>

          {/* Emoji tanlash */}
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
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Ism */}
          <div className="form-group">
            <label>
              <EditOutlinedIcon fontSize="small" /> Ismingiz
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Ismingizni kiriting"
            />
          </div>

          {/* Saqlash tugmasi */}
          {message && (
            <div className={`save-message ${message.type}`}>
              {message.type === 'success' ? <CheckCircleOutlineIcon fontSize="small" /> : <ErrorOutlineIcon fontSize="small" />}
              {message.text}
            </div>
          )}

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
        </div>
      </div>

      {/* Mavzu sozlamalari */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <PaletteIcon /> Ko'rinish
        </h3>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">
              {theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
              Tungi rejim
            </span>
            <span className="setting-desc">Qorong'u mavzuni yoqish</span>
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
            <span className="setting-desc">Ilova uchun asosiy rang</span>
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
      </div>

      {/* Bildirishnoma sozlamalari */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <NotificationsIcon /> Bildirishnomalar
        </h3>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">
              <NotificationsIcon />
              Bildirishnomalar
            </span>
            <span className="setting-desc">Push bildirishnomalar</span>
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
            <span className="setting-desc">Bildirishnoma ovozi</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notificationSettings.sound}
              onChange={() => handleNotificationChange('sound', !notificationSettings.sound)}
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
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Pomodoro sozlamalari */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <TimerIcon /> Pomodoro
        </h3>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Ish vaqti</span>
            <span className="setting-desc">Har bir pomodoro davomiyligi</span>
          </div>
          <div className="number-input">
            <button onClick={() => handlePomodoroChange('workDuration', Math.max(5, pomodoroSettings.workDuration - 5))}>-</button>
            <span>{pomodoroSettings.workDuration} daqiqa</span>
            <button onClick={() => handlePomodoroChange('workDuration', Math.min(60, pomodoroSettings.workDuration + 5))}>+</button>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Qisqa tanaffus</span>
            <span className="setting-desc">Pomodorolalar orasida</span>
          </div>
          <div className="number-input">
            <button onClick={() => handlePomodoroChange('shortBreak', Math.max(1, pomodoroSettings.shortBreak - 1))}>-</button>
            <span>{pomodoroSettings.shortBreak} daqiqa</span>
            <button onClick={() => handlePomodoroChange('shortBreak', Math.min(15, pomodoroSettings.shortBreak + 1))}>+</button>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Uzun tanaffus</span>
            <span className="setting-desc">4 pomodorodan keyin</span>
          </div>
          <div className="number-input">
            <button onClick={() => handlePomodoroChange('longBreak', Math.max(5, pomodoroSettings.longBreak - 5))}>-</button>
            <span>{pomodoroSettings.longBreak} daqiqa</span>
            <button onClick={() => handlePomodoroChange('longBreak', Math.min(30, pomodoroSettings.longBreak + 5))}>+</button>
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Avtomatik tanaffus</span>
            <span className="setting-desc">Ish tugagach avtomatik boshlash</span>
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
      </div>

      {/* Ma'lumotlar boshqaruvi */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <BackupIcon /> Ma'lumotlar
        </h3>

        <div className="data-actions">
          <button className="data-btn export-btn" onClick={handleExportData}>
            <DownloadIcon />
            <span>Eksport qilish</span>
            <small>Barcha ma'lumotlarni yuklab olish</small>
          </button>

          <button className="data-btn import-btn" onClick={() => backupInputRef.current?.click()}>
            <UploadIcon />
            <span>Import qilish</span>
            <small>Zaxira nusxadan tiklash</small>
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
            <small>Barcha ma'lumotlarni o'chirish</small>
          </button>
        </div>

        <div className="storage-info">
          <SecurityIcon />
          <p>Barcha ma'lumotlaringiz brauzeringizda saqlanadi va serverga yuborilmaydi.</p>
        </div>
      </div>

      {/* Ilova haqida */}
      <div className="settings-section glass-effect">
        <h3 className="section-title">
          <InfoIcon /> Ilova haqida
        </h3>

        <div className="app-info">
          <div className="app-logo">📋</div>
          <h4>Kun Tartibi</h4>
          <p className="app-version">Versiya 2.0.0</p>
          <p className="app-desc">
            Vazifalaringizni boshqaring, maqsadlaringizga erishing va kunlik 
            hayotingizni tartibga soling.
          </p>
          <div className="app-features">
            <span>✓ Vazifalar</span>
            <span>✓ Maqsadlar</span>
            <span>✓ Pomodoro</span>
            <span>✓ Statistika</span>
            <span>✓ Kalendar</span>
            <span>✓ Eslatmalar</span>
          </div>
        </div>
      </div>

      {/* Bildirishnomalar komponenti */}
      <div className="settings-content">
        <Notifications 
          tasks={tasks} 
          onUpdateTask={handleUpdateTask}
        />
      </div>

      {/* O'chirish tasdiqlash modali */}
      {showClearConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <WarningIcon className="warning-icon" />
            <h3>Barcha ma'lumotlarni o'chirish</h3>
            <p>Vazifalar, maqsadlar, teglar va boshqa barcha ma'lumotlar o'chiriladi.</p>
            <p className="warning-text">Bu amalni qaytarib bo'lmaydi!</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowClearConfirm(false)}>
                Bekor qilish
              </button>
              <button className="confirm-delete-btn" onClick={handleClearAllData}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
