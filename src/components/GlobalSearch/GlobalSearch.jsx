import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalSearch.css';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Qidiruv natijalari
  const searchItems = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const allResults = [];

    // Vazifalarni qidirish
    try {
      const tasks = JSON.parse(localStorage.getItem('kun-tartibi-tasks') || '[]');
      tasks.forEach(task => {
        if (task.title?.toLowerCase().includes(searchQuery) ||
            task.description?.toLowerCase().includes(searchQuery) ||
            task.category?.toLowerCase().includes(searchQuery)) {
          allResults.push({
            type: 'task',
            id: task.id,
            title: task.title,
            subtitle: task.completed ? 'Bajarilgan' : task.date || 'Sana belgilanmagan',
            icon: task.completed ? <CheckCircleOutlineIcon /> : <AssignmentOutlinedIcon />,
            data: task
          });
        }
      });
    } catch {
      // localStorage error
    }

    // Maqsadlarni qidirish
    try {
      const goals = JSON.parse(localStorage.getItem('kun-tartibi-goals') || '[]');
      goals.forEach(goal => {
        if (goal.title?.toLowerCase().includes(searchQuery) ||
            goal.description?.toLowerCase().includes(searchQuery)) {
          allResults.push({
            type: 'goal',
            id: goal.id,
            title: goal.title,
            subtitle: `${goal.progress || 0}% bajarilgan`,
            icon: <FlagOutlinedIcon />,
            data: goal
          });
        }
      });
    } catch {
      // localStorage error
    }

    // Eslatmalarni qidirish
    try {
      const notes = JSON.parse(localStorage.getItem('kun-tartibi-notes') || '[]');
      notes.forEach(note => {
        if (note.title?.toLowerCase().includes(searchQuery) ||
            note.content?.toLowerCase().includes(searchQuery)) {
          allResults.push({
            type: 'note',
            id: note.id,
            title: note.title || 'Nomsiz eslatma',
            subtitle: note.content?.substring(0, 50) + '...',
            icon: <StickyNote2OutlinedIcon />,
            data: note
          });
        }
      });
    } catch {
      // localStorage error
    }

    // Sahifalarni qidirish
    const pages = [
      { path: '/', title: 'Bosh sahifa', keywords: ['home', 'asosiy', 'vazifa'] },
      { path: '/dashboard', title: 'Dashboard', keywords: ['statistika', 'hisobot'] },
      { path: '/calendar', title: 'Kalendar', keywords: ['sana', 'oy', 'hafta'] },
      { path: '/pomodoro', title: 'Pomodoro', keywords: ['taymer', 'vaqt', 'fokus'] },
      { path: '/focus', title: 'Focus Mode', keywords: ['diqqat', 'konsentratsiya'] },
      { path: '/goals', title: 'Maqsadlar', keywords: ['target', 'reja'] },
      { path: '/notes', title: 'Eslatmalar', keywords: ['note', 'yozuv'] },
      { path: '/kanban', title: 'Kanban Board', keywords: ['doska', 'ustun'] },
      { path: '/habits', title: 'Odatlar', keywords: ['habit', 'kunlik'] },
      { path: '/achievements', title: 'Yutuqlar', keywords: ['medal', 'ball'] },
      { path: '/settings', title: 'Sozlamalar', keywords: ['setting', 'config'] },
    ];

    pages.forEach(page => {
      if (page.title.toLowerCase().includes(searchQuery) ||
          page.keywords.some(k => k.includes(searchQuery))) {
        allResults.push({
          type: 'page',
          id: page.path,
          title: page.title,
          subtitle: 'Sahifaga o\'tish',
          icon: <CalendarMonthOutlinedIcon />,
          path: page.path
        });
      }
    });

    // Filtrlash
    let filtered = allResults;
    if (activeTab !== 'all') {
      filtered = allResults.filter(r => r.type === activeTab);
    }

    setResults(filtered.slice(0, 20));
    setSelectedIndex(0);
  }, [query, activeTab]);

  useEffect(() => {
    searchItems();
  }, [searchItems]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Klaviatura boshqaruvi
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item) => {
    if (item.type === 'page') {
      navigate(item.path);
    } else if (item.type === 'task') {
      navigate('/');
    } else if (item.type === 'goal') {
      navigate('/goals');
    } else if (item.type === 'note') {
      navigate('/notes');
    }
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <SearchIcon className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Vazifa, maqsad yoki sahifa qidiring..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          <div className="search-shortcut">
            <KeyboardIcon fontSize="small" />
            <span>ESC</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="search-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Barchasi
          </button>
          <button 
            className={`tab ${activeTab === 'task' ? 'active' : ''}`}
            onClick={() => setActiveTab('task')}
          >
            Vazifalar
          </button>
          <button 
            className={`tab ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => setActiveTab('goal')}
          >
            Maqsadlar
          </button>
          <button 
            className={`tab ${activeTab === 'note' ? 'active' : ''}`}
            onClick={() => setActiveTab('note')}
          >
            Eslatmalar
          </button>
          <button 
            className={`tab ${activeTab === 'page' ? 'active' : ''}`}
            onClick={() => setActiveTab('page')}
          >
            Sahifalar
          </button>
        </div>

        <div className="search-results">
          {query && results.length === 0 ? (
            <div className="no-results">
              <SearchIcon />
              <p>"{query}" bo'yicha natija topilmadi</p>
            </div>
          ) : !query ? (
            <div className="search-hints">
              <h4>Tez qidirish</h4>
              <div className="hint-items">
                <div className="hint-item" onClick={() => setQuery('bugun')}>
                  <AssignmentOutlinedIcon />
                  <span>Bugungi vazifalar</span>
                </div>
                <div className="hint-item" onClick={() => setQuery('bajarilgan')}>
                  <CheckCircleOutlineIcon />
                  <span>Bajarilgan vazifalar</span>
                </div>
                <div className="hint-item" onClick={() => { navigate('/goals'); onClose(); }}>
                  <FlagOutlinedIcon />
                  <span>Maqsadlarim</span>
                </div>
              </div>
            </div>
          ) : (
            results.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-icon">{item.icon}</div>
                <div className="result-content">
                  <span className="result-title">{item.title}</span>
                  <span className="result-subtitle">{item.subtitle}</span>
                </div>
                <span className={`result-type ${item.type}`}>
                  {item.type === 'task' ? 'Vazifa' : 
                   item.type === 'goal' ? 'Maqsad' : 
                   item.type === 'note' ? 'Eslatma' : 'Sahifa'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="search-footer">
          <div className="footer-hint">
            <span><KeyboardIcon fontSize="small" /> ↑↓</span> navigatsiya
          </div>
          <div className="footer-hint">
            <span><KeyboardIcon fontSize="small" /> Enter</span> tanlash
          </div>
          <div className="footer-hint">
            <span><KeyboardIcon fontSize="small" /> Esc</span> yopish
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
