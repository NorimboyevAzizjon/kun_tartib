import React, { useState, useEffect, useRef } from 'react';
import './Pomodoro.css';

// MUI Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CoffeeIcon from '@mui/icons-material/Coffee';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

const Pomodoro = () => {
  // Timer settings (in minutes)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoro-settings');
    return saved ? JSON.parse(saved) : {
      workTime: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsBeforeLongBreak: 4
    };
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(() => {
    const saved = localStorage.getItem('pomodoro-total');
    return saved ? parseInt(saved) : 0;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Save total pomodoros
  useEffect(() => {
    localStorage.setItem('pomodoro-total', totalPomodoros.toString());
  }, [totalPomodoros]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playSound();
    
    if (mode === 'work') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      setTotalPomodoros(prev => prev + 1);
      
      // Add XP for completing pomodoro
      const currentXP = parseInt(localStorage.getItem('user-xp') || '0');
      localStorage.setItem('user-xp', (currentXP + 25).toString());
      
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreak * 60);
        showNotification('🎉 Uzoq tanaffus!', `${settings.longBreak} daqiqa dam oling`);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
        showNotification('☕ Qisqa tanaffus!', `${settings.shortBreak} daqiqa dam oling`);
      }
    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
      showNotification('💪 Ishga qaytish vaqti!', `${settings.workTime} daqiqa ishlang`);
    }
  };

  const playSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Melodiya
      const notes = [523.25, 659.25, 783.99, 1046.50];
      let time = audioContext.currentTime;
      
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, time + i * 0.15);
      });
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch {
      // Audio not supported
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode === 'work' ? 'workTime' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'] * 60);
  };

  const skipSession = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('shortBreak');
      setTimeLeft(settings.shortBreak * 60);
    } else {
      setMode('work');
      setTimeLeft(settings.workTime * 60);
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    const times = {
      work: settings.workTime,
      shortBreak: settings.shortBreak,
      longBreak: settings.longBreak
    };
    setTimeLeft(times[newMode] * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = () => {
    const totalTime = settings[mode === 'work' ? 'workTime' : mode === 'shortBreak' ? 'shortBreak' : 'longBreak'] * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return '#ef4444';
      case 'shortBreak': return '#10b981';
      case 'longBreak': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <h2>
          <TimerOutlinedIcon className="header-icon-svg" />
          Pomodoro Timer
        </h2>
        <div className="header-actions">
          <button 
            className={`sound-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </button>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            <SettingsOutlinedIcon />
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="mode-tabs">
        <button 
          className={`mode-tab ${mode === 'work' ? 'active' : ''}`}
          onClick={() => switchMode('work')}
        >
          <WorkOutlineIcon />
          Ishlash
        </button>
        <button 
          className={`mode-tab ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => switchMode('shortBreak')}
        >
          <CoffeeIcon />
          Qisqa tanaffus
        </button>
        <button 
          className={`mode-tab ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => switchMode('longBreak')}
        >
          <CoffeeIcon />
          Uzoq tanaffus
        </button>
      </div>

      {/* Timer Display */}
      <div className="timer-display" style={{ '--mode-color': getModeColor() }}>
        <div className="timer-circle">
          <svg className="progress-ring" viewBox="0 0 200 200">
            <circle
              className="progress-ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="progress-ring-fill"
              cx="100"
              cy="100"
              r="90"
              style={{
                strokeDasharray: `${2 * Math.PI * 90}`,
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress() / 100)}`,
                stroke: getModeColor()
              }}
            />
          </svg>
          <div className="timer-text">
            <span className="time">{formatTime(timeLeft)}</span>
            <span className="mode-label">
              {mode === 'work' ? '💪 Ishlash' : mode === 'shortBreak' ? '☕ Dam olish' : '🌴 Uzoq dam'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button className="control-btn reset" onClick={resetTimer}>
          <RestartAltIcon />
        </button>
        <button 
          className={`control-btn main ${isRunning ? 'pause' : 'play'}`}
          onClick={toggleTimer}
          style={{ backgroundColor: getModeColor() }}
        >
          {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
        <button className="control-btn skip" onClick={skipSession}>
          <SkipNextIcon />
        </button>
      </div>

      {/* Stats */}
      <div className="pomodoro-stats">
        <div className="stat-item">
          <span className="stat-value">{sessionsCompleted}</span>
          <span className="stat-label">Bugungi sessiyalar</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalPomodoros}</span>
          <span className="stat-label">Jami pomodoro</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Math.floor(totalPomodoros * settings.workTime / 60)}s</span>
          <span className="stat-label">Ishlangan vaqt</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h3>⚙️ Timer Sozlamalari</h3>
            
            <div className="setting-group">
              <label>Ishlash vaqti (daqiqa)</label>
              <input
                type="number"
                value={settings.workTime}
                onChange={(e) => setSettings({...settings, workTime: parseInt(e.target.value) || 25})}
                min="1"
                max="60"
              />
            </div>
            
            <div className="setting-group">
              <label>Qisqa tanaffus (daqiqa)</label>
              <input
                type="number"
                value={settings.shortBreak}
                onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})}
                min="1"
                max="30"
              />
            </div>
            
            <div className="setting-group">
              <label>Uzoq tanaffus (daqiqa)</label>
              <input
                type="number"
                value={settings.longBreak}
                onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})}
                min="1"
                max="60"
              />
            </div>
            
            <div className="setting-group">
              <label>Uzoq tanaffusgacha sessiyalar</label>
              <input
                type="number"
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) => setSettings({...settings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4})}
                min="1"
                max="10"
              />
            </div>
            
            <button className="close-settings" onClick={() => setShowSettings(false)}>
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
