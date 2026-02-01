import './Toast.css';

// Simple Toast component without hooks
const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  if (!message) return null;
  
  // Auto close using setTimeout (not in useEffect to avoid hook issues)
  if (onClose && typeof window !== 'undefined') {
    setTimeout(() => {
      onClose();
    }, duration);
  }

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
