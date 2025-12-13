import React, { useState, useEffect } from 'react';
import './QuickNotes.css';

// MUI Icons
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';

const COLORS = [
  { name: 'default', bg: 'var(--card-bg)', border: 'var(--border-color)' },
  { name: 'yellow', bg: '#fef3c7', border: '#f59e0b' },
  { name: 'green', bg: '#d1fae5', border: '#10b981' },
  { name: 'blue', bg: '#dbeafe', border: '#3b82f6' },
  { name: 'purple', bg: '#ede9fe', border: '#8b5cf6' },
  { name: 'pink', bg: '#fce7f3', border: '#ec4899' },
  { name: 'red', bg: '#fee2e2', border: '#ef4444' }
];

const QuickNotes = () => {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('quick-notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('default');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('quick-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote.trim(),
      color: selectedColor,
      pinned: false,
      createdAt: new Date().toISOString()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setSelectedColor('default');
    
    // Add XP
    const currentXP = parseInt(localStorage.getItem('user-xp') || '0');
    localStorage.setItem('user-xp', (currentXP + 2).toString());
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const togglePin = (id) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  };

  const updateNote = (id, content) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const getColorStyle = (colorName) => {
    const color = COLORS.find(c => c.name === colorName) || COLORS[0];
    return {
      backgroundColor: color.bg,
      borderColor: color.border
    };
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => note.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const pinnedCount = notes.filter(n => n.pinned).length;

  return (
    <div className="quick-notes-container">
      <div className="notes-header">
        <h2>
          <NoteAddOutlinedIcon className="header-icon-svg" />
          Tezkor eslatmalar
        </h2>
        <span className="notes-count">{notes.length} ta eslatma</span>
      </div>

      {/* Search */}
      <div className="notes-search">
        <SearchOutlinedIcon />
        <input
          type="text"
          placeholder="Eslatmalarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* New Note Input */}
      <div className="new-note-form" style={getColorStyle(selectedColor)}>
        <textarea
          placeholder="Yangi eslatma yozing..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              addNote();
            }
          }}
        />
        <div className="note-form-actions">
          <div className="color-picker-wrapper">
            <button 
              className="color-picker-btn"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <ColorLensOutlinedIcon />
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    className={`color-option ${selectedColor === color.name ? 'active' : ''}`}
                    style={{ backgroundColor: color.bg, borderColor: color.border }}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button 
            className="add-note-btn"
            onClick={addNote}
            disabled={!newNote.trim()}
          >
            Qo'shish
          </button>
        </div>
        <span className="note-hint">Ctrl + Enter - tezkor qo'shish</span>
      </div>

      {/* Pinned Notes */}
      {pinnedCount > 0 && (
        <div className="notes-section">
          <h3>
            <PushPinIcon />
            Qadoqlangan ({pinnedCount})
          </h3>
          <div className="notes-grid">
            {filteredNotes.filter(n => n.pinned).map(note => (
              <NoteCard 
                key={note.id}
                note={note}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onUpdate={updateNote}
                getColorStyle={getColorStyle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      <div className="notes-section">
        {pinnedCount > 0 && <h3>Boshqalar</h3>}
        {filteredNotes.filter(n => !n.pinned).length === 0 ? (
          <div className="empty-notes">
            <span className="empty-icon">📝</span>
            <p>Hozircha eslatmalar yo'q</p>
            <span>Yuqoridagi formadan yangi eslatma qo'shing</span>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.filter(n => !n.pinned).map(note => (
              <NoteCard 
                key={note.id}
                note={note}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onUpdate={updateNote}
                getColorStyle={getColorStyle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ note, onDelete, onTogglePin, onUpdate, getColorStyle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(note.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`note-card ${note.pinned ? 'pinned' : ''}`}
      style={getColorStyle(note.color)}
    >
      <div className="note-actions">
        <button 
          className={`pin-btn ${note.pinned ? 'active' : ''}`}
          onClick={() => onTogglePin(note.id)}
        >
          {note.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
        </button>
        <button 
          className="delete-btn"
          onClick={() => onDelete(note.id)}
        >
          <DeleteOutlineIcon />
        </button>
      </div>

      {isEditing ? (
        <textarea
          className="note-edit-input"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
        />
      ) : (
        <div 
          className="note-content"
          onClick={() => setIsEditing(true)}
        >
          {note.content}
        </div>
      )}

      <div className="note-footer">
        <span className="note-date">{formatDate(note.createdAt)}</span>
      </div>
    </div>
  );
};

export default QuickNotes;
