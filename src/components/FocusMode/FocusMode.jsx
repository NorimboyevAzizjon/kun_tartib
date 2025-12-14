import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './FocusMode.css';

// MUI Icons
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Ovoz yo\'q', icon: '🔇' },
  { id: 'rain', name: 'Yomg\'ir', icon: '🌧️' },
  { id: 'forest', name: 'O\'rmon', icon: '🌲' },
  { id: 'ocean', name: 'Okean', icon: '🌊' },
  { id: 'fire', name: 'Gulxan', icon: '🔥' },
  { id: 'cafe', name: 'Kafe', icon: '☕' }
];

const FocusMode = ({ tasks = [], onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedInSession, setCompletedInSession] = useState([]);

  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // Filter incomplete tasks
  const incompleteTasks = useMemo(
    () => tasks.filter(t => !t.completed && !completedInSession.includes(t.id)),
    [tasks, completedInSession]
  );
  const currentTask = incompleteTasks[currentTaskIndex] || null;

  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const exitFocusMode = useCallback(() => {
    setIsActive(false);
    setIsRunning(false);
    setIsFullscreen(false);
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const handleCompleteTask = useCallback(() => {
    if (!currentTask) return;
    
    setCompletedInSession(prev => [...prev, currentTask.id]);
    
    if (onComplete) {
      onComplete(currentTask.id);
    }
    
    // Add XP
    const currentXP = parseInt(localStorage.getItem('user-xp') || '0');
    localStorage.setItem('user-xp', (currentXP + 10).toString());
    
    playCompletionSound();
    
    // Move to next task or finish
    if (currentTaskIndex < incompleteTasks.length - 1) {
      // Don't increment index since array will shift
    } else {
      // All tasks completed
      setTimeout(() => {
        showNotification('🎉 Barcha vazifalar bajarildi!', 'Ajoyib ish!');
      }, 500);
    }
  }, [currentTask, currentTaskIndex, incompleteTasks.length, onComplete, playCompletionSound, showNotification]);

  const handleNextTask = useCallback(() => {
    if (currentTaskIndex < incompleteTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    }
  }, [currentTaskIndex, incompleteTasks.length]);

  // Timer
  useEffect(() => {
    if (isRunning && isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isActive]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isActive) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
      if (e.code === 'Enter') {
        e.preventDefault();
        handleCompleteTask();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextTask();
      }
      if (e.code === 'Escape') {
        exitFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, handleCompleteTask, handleNextTask, exitFocusMode]);

  const startFocusMode = () => {
    setIsActive(true);
    setIsRunning(true);
    setTimeElapsed(0);
    setCurrentTaskIndex(0);
    setCompletedInSession([]);
    
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      work: '💼',
      study: '📚',
      home: '🏠',
      personal: '👤',
      health: '🏃'
    };
    return icons[category] || '📝';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6366f1';
  };

  // Not Active State
  if (!isActive) {
    return (
      <div className="focus-mode-inactive">
        <div className="focus-intro">
          <CenterFocusStrongIcon className="focus-intro-icon" />
          <h2>Focus Mode</h2>
          <p>Diqqatingizni bir vazifaga qarating va samarali ishlang</p>
          
          <div className="focus-features">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>Bitta vazifaga e'tibor</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⏱️</span>
              <span>Vaqt hisobi</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔇</span>
              <span>Distraction-free</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⌨️</span>
              <span>Keyboard shortcuts</span>
            </div>
          </div>

          {incompleteTasks.length > 0 ? (
            <button className="start-focus-btn" onClick={startFocusMode}>
              <PlayArrowIcon />
              Boshlash ({incompleteTasks.length} vazifa)
            </button>
          ) : (
            <div className="no-tasks-message">
              <span>✅</span>
              <p>Barcha vazifalar bajarilgan!</p>
            </div>
          )}
        </div>

        <div className="shortcuts-info">
          <h4>⌨️ Klaviatura tugmalari:</h4>
          <div className="shortcuts-list">
            <span><kbd>Space</kbd> Play/Pause</span>
            <span><kbd>Enter</kbd> Bajarildi</span>
            <span><kbd>→</kbd> Keyingi</span>
            <span><kbd>Esc</kbd> Chiqish</span>
          </div>
        </div>
      </div>
    );
  }

  // Active Focus Mode
  return (
    <div 
      ref={containerRef}
      className={`focus-mode-active ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Header */}
      <div className="focus-header">
        <div className="focus-timer">
          <span className="timer-label">Ishlangan vaqt</span>
          <span className="timer-value">{formatTime(timeElapsed)}</span>
        </div>
        
        <div className="focus-controls">
          <button 
            className={`control-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </button>
          <button className="control-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </button>
          <button className="control-btn exit" onClick={exitFocusMode}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="focus-content">
        {currentTask ? (
          <>
            <div className="focus-task-card">
              <div className="task-category">
                <span className="category-icon">{getCategoryIcon(currentTask.category)}</span>
                <span className="category-name">{currentTask.category}</span>
              </div>
              
              <h1 className="task-title">{currentTask.title}</h1>
              
              <div className="task-meta">
                <span 
                  className="task-priority"
                  style={{ backgroundColor: getPriorityColor(currentTask.priority) }}
                >
                  {currentTask.priority === 'high' ? '🔴 Yuqori' : 
                   currentTask.priority === 'medium' ? '🟡 O\'rta' : '🟢 Past'}
                </span>
                {currentTask.time && (
                  <span className="task-time">⏰ {currentTask.time}</span>
                )}
              </div>
            </div>

            <div className="focus-actions">
              <button 
                className={`action-btn play ${isRunning ? 'running' : ''}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                {isRunning ? 'Pauza' : 'Davom'}
              </button>
              
              <button className="action-btn complete" onClick={handleCompleteTask}>
                <CheckCircleOutlineIcon />
                Bajarildi
              </button>
              
              <button className="action-btn skip" onClick={handleNextTask}>
                <SkipNextIcon />
                O'tkazib yuborish
              </button>
            </div>

            <div className="focus-progress">
              <span className="progress-text">
                {completedInSession.length} / {incompleteTasks.length + completedInSession.length} vazifa bajarildi
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(completedInSession.length / (incompleteTasks.length + completedInSession.length)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="all-done">
            <span className="done-icon">🎉</span>
            <h2>Ajoyib ish!</h2>
            <p>Barcha vazifalar bajarildi</p>
            <p className="done-stats">
              {completedInSession.length} ta vazifa • {formatTime(timeElapsed)} vaqt
            </p>
            <button className="exit-btn" onClick={exitFocusMode}>
              Yakunlash
            </button>
          </div>
        )}
      </div>

      {/* Ambient Sound Selector */}
      <div className="ambient-sounds">
        {AMBIENT_SOUNDS.map(sound => (
          <button
            key={sound.id}
            className={`sound-btn ${selectedSound === sound.id ? 'active' : ''}`}
            onClick={() => setSelectedSound(sound.id)}
            title={sound.name}
          >
            {sound.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FocusMode;
