import { useState, useEffect, useRef } from 'react';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { format, parseISO, isValid, differenceInSeconds } from 'date-fns';
import { uz } from 'date-fns/locale';
import './TimeTracking.css';

const TimeTracking = ({ 
  taskId,
  taskName,
  timeEntries = [], 
  onAddTimeEntry, 
  onUpdateTimeEntry,
  onDeleteTimeEntry,
  totalEstimatedTime = 0 // daqiqalarda
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // sekundlarda
  const [startTime, setStartTime] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editMinutes, setEditMinutes] = useState('');
  const intervalRef = useRef(null);

  // Jami sarflangan vaqt
  const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  // Timer effekti
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = differenceInSeconds(now, new Date(startTime));
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startTime]);

  // Timerni boshlash
  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date().toISOString());
  };

  // Timerni to'xtatish (pauza)
  const handlePause = () => {
    setIsRunning(false);
  };

  // Timerni davom ettirish
  const handleResume = () => {
    // Yangi start vaqtini hisoblash (oldingi elapsed vaqtni hisobga olgan holda)
    const newStartTime = new Date(Date.now() - elapsedTime * 1000);
    setStartTime(newStartTime.toISOString());
    setIsRunning(true);
  };

  // Timerni to'xtatish va saqlash
  const handleStop = () => {
    if (elapsedTime > 0) {
      const entry = {
        id: Date.now().toString(),
        taskId,
        startTime: startTime,
        endTime: new Date().toISOString(),
        duration: elapsedTime, // sekundlarda
        date: format(new Date(), 'yyyy-MM-dd')
      };
      onAddTimeEntry && onAddTimeEntry(entry);
    }
    
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  // Timerni qayta boshlash
  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  // Vaqtni formatlash (sekunddan)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Vaqtni soat/daqiqa formatida ko'rsatish
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0 && mins > 0) {
      return `${hrs} soat ${mins} daqiqa`;
    } else if (hrs > 0) {
      return `${hrs} soat`;
    } else if (mins > 0) {
      return `${mins} daqiqa`;
    } else {
      return `${seconds} soniya`;
    }
  };

  // Sanani formatlash
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return '';
      return format(date, 'd MMMM yyyy, HH:mm', { locale: uz });
    } catch {
      return '';
    }
  };

  // Progress foizini hisoblash
  const progressPercent = totalEstimatedTime > 0 
    ? Math.min(100, Math.round((totalTimeSpent / 60 / totalEstimatedTime) * 100))
    : 0;

  // Entry tahrirlash
  const handleEditEntry = () => {
    if (editingEntry && editMinutes) {
      const newDuration = parseInt(editMinutes) * 60; // sekundga o'zgartirish
      onUpdateTimeEntry && onUpdateTimeEntry(editingEntry.id, { 
        ...editingEntry, 
        duration: newDuration 
      });
      setEditingEntry(null);
      setEditMinutes('');
    }
  };

  // Bugungi entries
  const todayEntries = timeEntries.filter(entry => 
    entry.date === format(new Date(), 'yyyy-MM-dd')
  );
  const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  return (
    <div className="time-tracking">
      <div className="tracking-header">
        <TimerIcon />
        <h3>Vaqt hisobi</h3>
      </div>

      {/* Timer */}
      <div className={`timer-display ${isRunning ? 'running' : ''}`}>
        <div className="timer-time">{formatTime(elapsedTime)}</div>
        {taskName && <div className="timer-task">{taskName}</div>}
        
        <div className="timer-controls">
          {!isRunning && elapsedTime === 0 && (
            <button className="control-btn start" onClick={handleStart}>
              <PlayArrowIcon />
              Boshlash
            </button>
          )}
          
          {isRunning && (
            <button className="control-btn pause" onClick={handlePause}>
              <PauseIcon />
              Pauza
            </button>
          )}
          
          {!isRunning && elapsedTime > 0 && (
            <button className="control-btn resume" onClick={handleResume}>
              <PlayArrowIcon />
              Davom
            </button>
          )}
          
          {(isRunning || elapsedTime > 0) && (
            <>
              <button className="control-btn stop" onClick={handleStop}>
                <StopIcon />
                To'xtatish
              </button>
              <button className="control-btn reset" onClick={handleReset}>
                <RestartAltIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistika */}
      <div className="time-stats">
        <div className="stat-card">
          <AccessTimeIcon />
          <div className="stat-info">
            <span className="stat-value">{formatDuration(todayTime)}</span>
            <span className="stat-label">Bugun</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUpIcon />
          <div className="stat-info">
            <span className="stat-value">{formatDuration(totalTimeSpent)}</span>
            <span className="stat-label">Jami</span>
          </div>
        </div>
        {totalEstimatedTime > 0 && (
          <div className="stat-card">
            <CalendarTodayIcon />
            <div className="stat-info">
              <span className="stat-value">{progressPercent}%</span>
              <span className="stat-label">Bajarildi</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalEstimatedTime > 0 && (
        <div className="time-progress">
          <div className="progress-header">
            <span>Bajarilish darajasi</span>
            <span>{formatDuration(totalTimeSpent)} / {totalEstimatedTime} daqiqa</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${progressPercent}%`,
                background: progressPercent >= 100 
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              }}
            />
          </div>
        </div>
      )}

      {/* Tarix */}
      <div className="time-history">
        <button 
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          <HistoryIcon />
          Tarix ({timeEntries.length})
          <span className={`arrow ${showHistory ? 'open' : ''}`}>▼</span>
        </button>

        {showHistory && (
          <div className="history-list">
            {timeEntries.length === 0 ? (
              <div className="no-history">
                <HistoryIcon className="empty-icon" />
                <p>Hali yozuvlar yo'q</p>
              </div>
            ) : (
              [...timeEntries].reverse().map(entry => (
                <div key={entry.id} className="history-item">
                  <div className="history-date">
                    <CalendarTodayIcon />
                    {formatDate(entry.startTime)}
                  </div>
                  
                  {editingEntry?.id === entry.id ? (
                    <div className="edit-duration">
                      <input
                        type="number"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        placeholder="Daqiqa"
                        min="1"
                        autoFocus
                      />
                      <span>daqiqa</span>
                      <button 
                        className="save-edit-btn"
                        onClick={handleEditEntry}
                        disabled={!editMinutes}
                      >
                        <CheckIcon />
                      </button>
                      <button 
                        className="cancel-edit-btn"
                        onClick={() => {
                          setEditingEntry(null);
                          setEditMinutes('');
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ) : (
                    <div className="history-duration">
                      <TimerIcon />
                      {formatDuration(entry.duration)}
                    </div>
                  )}

                  <div className="history-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setEditingEntry(entry);
                        setEditMinutes(Math.floor(entry.duration / 60).toString());
                      }}
                      title="Tahrirlash"
                    >
                      <EditIcon />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => onDeleteTimeEntry && onDeleteTimeEntry(entry.id)}
                      title="O'chirish"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Manual vaqt qo'shish */}
      <ManualTimeEntry onAdd={onAddTimeEntry} taskId={taskId} />
    </div>
  );
};

// Manual vaqt qo'shish komponenti
const ManualTimeEntry = ({ onAdd, taskId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleAdd = () => {
    const totalSeconds = (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60);
    if (totalSeconds > 0) {
      const entry = {
        id: Date.now().toString(),
        taskId,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: totalSeconds,
        date: format(new Date(), 'yyyy-MM-dd'),
        manual: true
      };
      onAdd && onAdd(entry);
      setHours('');
      setMinutes('');
      setIsOpen(false);
    }
  };

  return (
    <div className="manual-entry">
      {!isOpen ? (
        <button className="add-manual-btn" onClick={() => setIsOpen(true)}>
          <AccessTimeIcon />
          Qo'lda vaqt qo'shish
        </button>
      ) : (
        <div className="manual-form">
          <h4>Qo'lda vaqt qo'shish</h4>
          <div className="time-inputs">
            <div className="input-group">
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                min="0"
                max="23"
              />
              <span>soat</span>
            </div>
            <div className="input-group">
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                min="0"
                max="59"
              />
              <span>daqiqa</span>
            </div>
          </div>
          <div className="manual-actions">
            <button className="cancel-btn" onClick={() => setIsOpen(false)}>
              Bekor qilish
            </button>
            <button 
              className="add-btn"
              onClick={handleAdd}
              disabled={!hours && !minutes}
            >
              Qo'shish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;
