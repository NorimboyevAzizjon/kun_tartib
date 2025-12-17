import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>{message}</div>
  );
}
