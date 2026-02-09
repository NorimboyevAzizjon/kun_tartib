import React, { useState, useEffect, useRef, useCallback } from 'react';
import './UndoRedoToast.css';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CloseIcon from '@mui/icons-material/Close';

const UndoRedoToast = ({ action, onUndo, onClose, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const actionIdRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setProgress(100);
    
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearTimer();
        onClose?.();
      }
    }, 50);
  }, [duration, onClose, clearTimer]);

  // Start timer when action changes
  useEffect(() => {
    const currentId = action?.id || action?.data?.id || JSON.stringify(action);
    
    if (action && currentId !== actionIdRef.current) {
      actionIdRef.current = currentId;
      startTimer();
    } else if (!action) {
      actionIdRef.current = null;
      clearTimer();
    }

    return clearTimer;
  }, [action, startTimer, clearTimer]);

  const handleUndo = useCallback(() => {
    clearTimer();
    onUndo?.();
    onClose?.();
  }, [onUndo, onClose, clearTimer]);

  const handleClose = useCallback(() => {
    clearTimer();
    onClose?.();
  }, [onClose, clearTimer]);

  if (!action) return null;

  const getMessage = () => {
    switch (action.type) {
      case 'delete':
        return `"${action.data?.title || 'Element'}" o'chirildi`;
      case 'complete':
        return `"${action.data?.title || 'Vazifa'}" bajarildi`;
      case 'edit':
        return `"${action.data?.title || 'Element'}" tahrirlandi`;
      case 'add':
        return `"${action.data?.title || 'Element'}" qo'shildi`;
      default:
        return 'Amal bajarildi';
    }
  };

  return (
    <div className="undo-toast">
      <div className="undo-toast-content">
        <span className="undo-message">{getMessage()}</span>
        <button className="undo-btn" onClick={handleUndo}>
          <UndoIcon fontSize="small" />
          Bekor qilish
        </button>
        <button className="close-toast-btn" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>
      <div className="undo-progress" style={{ width: `${progress}%` }} />
    </div>
  );
};

// Undo/Redo kontrol panel
export const UndoRedoControls = ({ canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <div className="undo-redo-controls">
      <button 
        className={`ur-btn ${!canUndo ? 'disabled' : ''}`} 
        onClick={onUndo}
        disabled={!canUndo}
        title="Bekor qilish (Ctrl+Z)"
      >
        <UndoIcon fontSize="small" />
      </button>
      <button 
        className={`ur-btn ${!canRedo ? 'disabled' : ''}`} 
        onClick={onRedo}
        disabled={!canRedo}
        title="Qaytarish (Ctrl+Y)"
      >
        <RedoIcon fontSize="small" />
      </button>
    </div>
  );
};

export default UndoRedoToast;
