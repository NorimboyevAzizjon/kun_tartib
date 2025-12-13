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

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  
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
        setMessage('❌ Rasm hajmi 2MB dan oshmasin');
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

      setMessage('✅ Profil saqlandi!');
      
      // Sahifani yangilash
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage('❌ Xatolik: ' + error.message);
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
            <div className={`save-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
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

      {/* Bildirishnomalar */}
      <div className="settings-content">
        <Notifications 
          tasks={tasks} 
          onUpdateTask={handleUpdateTask}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
