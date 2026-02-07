import React, { useState, useEffect, useRef } from 'react';
import './UndoRedoToast.css';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CloseIcon from '@mui/icons-material/Close';

const UndoRedoToast = ({ action, onUndo, onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(!!action);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (!action) {
      // Use timeout to avoid synchronous setState warning
      const timeout = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(timeout);
    }

    setVisible(true);
    setProgress(100);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setVisible(false);
        onClose?.();
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [action, duration, onClose]);

  const handleUndo = () => {
    onUndo?.();
    setVisible(false);
    onClose?.();
  };

  if (!visible || !action) return null;

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
        <button className="close-toast-btn" onClick={() => { setVisible(false); onClose?.(); }}>
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
