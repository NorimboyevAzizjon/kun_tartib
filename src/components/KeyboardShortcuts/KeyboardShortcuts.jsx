import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './KeyboardShortcuts.css';

// MUI Icons
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CloseIcon from '@mui/icons-material/Close';

const shortcuts = [
  { keys: ['Ctrl', 'K'], action: 'Qidiruv', path: null },
  { keys: ['Ctrl', 'N'], action: 'Yangi vazifa', path: '/' },
  { keys: ['Ctrl', 'D'], action: 'Dashboard', path: '/dashboard' },
  { keys: ['Ctrl', 'P'], action: 'Pomodoro', path: '/pomodoro' },
  { keys: ['Ctrl', 'G'], action: 'Maqsadlar', path: '/goals' },
  { keys: ['Ctrl', 'S'], action: 'Sozlamalar', path: '/settings' },
  { keys: ['Ctrl', 'H'], action: 'Bosh sahifa', path: '/' },
  { keys: ['Ctrl', '/'], action: "Yordam (bu oyna)", path: null },
  { keys: ['Esc'], action: 'Yopish', path: null },
];

const KeyboardShortcuts = () => {
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + / - Help modal
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Esc - Close modal
      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      // Don't trigger shortcuts when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl + K - Search (emit event)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-search'));
        return;
      }

      // Ctrl + N - New task (go to home and focus on add task)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
          const input = document.querySelector('.add-task-input input');
          if (input) input.focus();
        }, 100);
        return;
      }

      // Ctrl + D - Dashboard
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
        return;
      }

      // Ctrl + P - Pomodoro
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        navigate('/pomodoro');
        return;
      }

      // Ctrl + G - Goals
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        navigate('/goals');
        return;
      }

      // Ctrl + S - Settings (prevent browser save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        navigate('/settings');
        return;
      }

      // Ctrl + H - Home
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        navigate('/');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!showHelp) return null;

  return (
    <div className="shortcuts-overlay" onClick={() => setShowHelp(false)}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title">
            <KeyboardIcon />
            <h2>Klaviatura Buyruqlari</h2>
          </div>
          <button className="shortcuts-close" onClick={() => setShowHelp(false)}>
            <CloseIcon />
          </button>
        </div>
        
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

        <div className="shortcuts-footer">
          <p>💡 Istalgan vaqtda <kbd>Ctrl</kbd> + <kbd>/</kbd> bosib bu oynani ochishingiz mumkin</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
