import React, { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import './TaskTemplates.css';

// MUI Icons
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const DEFAULT_TEMPLATES = [
  {
    id: 'template_1',
    name: 'Ertalabki mashq',
    icon: '🏃',
    category: 'health',
    priority: 'medium',
    time: '07:00',
    duration: 30,
    subtasks: [
      { id: 'st1', title: 'Isitish mashqlari', completed: false },
      { id: 'st2', title: 'Asosiy mashq', completed: false },
      { id: 'st3', title: 'Cho\'zilish', completed: false }
    ]
  },
  {
    id: 'template_2',
    name: 'Haftalik hisobot',
    icon: '📊',
    category: 'work',
    priority: 'high',
    time: '10:00',
    duration: 60,
    subtasks: [
      { id: 'st1', title: 'Ma\'lumotlarni yig\'ish', completed: false },
      { id: 'st2', title: 'Tahlil qilish', completed: false },
      { id: 'st3', title: 'Hisobotni yozish', completed: false },
      { id: 'st4', title: 'Rahbariyatga yuborish', completed: false }
    ]
  },
  {
    id: 'template_3',
    name: 'O\'qish sessiyasi',
    icon: '📚',
    category: 'study',
    priority: 'medium',
    time: '19:00',
    duration: 45,
    subtasks: [
      { id: 'st1', title: 'Materiallarni tayyorlash', completed: false },
      { id: 'st2', title: 'Asosiy o\'qish', completed: false },
      { id: 'st3', title: 'Qaydlar yozish', completed: false }
    ]
  },
  {
    id: 'template_4',
    name: 'Uy tozalash',
    icon: '🧹',
    category: 'home',
    priority: 'low',
    time: '11:00',
    duration: 60,
    subtasks: [
      { id: 'st1', title: 'Chang artish', completed: false },
      { id: 'st2', title: 'Polni supurish', completed: false },
      { id: 'st3', title: 'Narsalarni joylashtirish', completed: false }
    ]
  },
  {
    id: 'template_5',
    name: 'Kunlik rejalashtirish',
    icon: '📋',
    category: 'personal',
    priority: 'high',
    time: '08:00',
    duration: 15,
    subtasks: [
      { id: 'st1', title: 'Kechagi natijalarni ko\'rish', completed: false },
      { id: 'st2', title: 'Bugungi vazifalarni belgilash', completed: false },
      { id: 'st3', title: 'Ustuvorliklarni aniqlash', completed: false }
    ]
  }
];

const CATEGORY_CONFIG = {
  work: { icon: '💼', label: 'Ish', color: '#6366f1' },
  study: { icon: '📚', label: 'O\'qish', color: '#10b981' },
  home: { icon: '🏠', label: 'Uy', color: '#f59e0b' },
  personal: { icon: '👤', label: 'Shaxsiy', color: '#8b5cf6' },
  health: { icon: '🏃', label: 'Sog\'lom', color: '#3b82f6' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Past', color: '#10b981' },
  medium: { label: 'O\'rta', color: '#f59e0b' },
  high: { label: 'Yuqori', color: '#ef4444' }
};

const TaskTemplates = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    icon: '📝',
    category: 'work',
    priority: 'medium',
    time: '09:00',
    duration: 30,
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState('');

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('task-templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    } else {
      // Initialize with defaults
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem('task-templates', JSON.stringify(DEFAULT_TEMPLATES));
    }
  }, []);

  // Save to localStorage
  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('task-templates', JSON.stringify(newTemplates));
  };

  const useTemplate = (template) => {
    const task = {
      id: `task_${uuidv4()}`,
      title: template.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: template.time,
      category: template.category,
      priority: template.priority,
      description: '',
      reminder: false,
      reminderTime: null,
      reminderDateTime: null,
      completed: false,
      subtasks: template.subtasks.map(st => ({
        ...st,
        id: `subtask_${uuidv4()}`,
        completed: false
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onUseTemplate) {
      onUseTemplate(task);
    }
  };

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setNewTemplate({ ...template });
    setShowCreateModal(true);
  };

  const saveTemplate = () => {
    if (!newTemplate.name.trim()) return;

    if (editingTemplate) {
      // Update existing
      const updated = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...newTemplate, id: editingTemplate.id }
          : t
      );
      saveTemplates(updated);
    } else {
      // Create new
      const template = {
        ...newTemplate,
        id: `template_${uuidv4()}`
      };
      saveTemplates([...templates, template]);
    }

    closeModal();
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      icon: '📝',
      category: 'work',
      priority: 'medium',
      time: '09:00',
      duration: 30,
      subtasks: []
    });
    setNewSubtask('');
  };

  const addSubtaskToTemplate = () => {
    if (!newSubtask.trim()) return;
    
    setNewTemplate({
      ...newTemplate,
      subtasks: [
        ...newTemplate.subtasks,
        { id: `st_${Date.now()}`, title: newSubtask.trim(), completed: false }
      ]
    });
    setNewSubtask('');
  };

  const removeSubtaskFromTemplate = (id) => {
    setNewTemplate({
      ...newTemplate,
      subtasks: newTemplate.subtasks.filter(st => st.id !== id)
    });
  };

  const EMOJI_LIST = ['📝', '📋', '📊', '📈', '💼', '💻', '📱', '🎯', '⭐', '🔥', 
                      '💡', '📚', '✍️', '🎨', '🎬', '🎵', '🏃', '🧘', '🏋️', '🚴',
                      '🏠', '🧹', '🛒', '👨‍👩‍👧', '💰', '📞', '✈️', '🚗', '🌱', '☕'];

  return (
    <div className="task-templates">
      {/* Header */}
      <div className="templates-header">
        <div className="header-left">
          <BookmarkOutlinedIcon className="header-icon" />
          <div>
            <h2>Vazifa Shablonlari</h2>
            <p>Tez-tez ishlatiladigan vazifalarni bir marta yaratib, qayta ishlating</p>
          </div>
        </div>
        <button 
          className="create-template-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon />
          Yangi shablon
        </button>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-icon">{template.icon}</div>
            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <div className="template-meta">
                <span 
                  className="template-category"
                  style={{ color: CATEGORY_CONFIG[template.category].color }}
                >
                  {CATEGORY_CONFIG[template.category].icon} {CATEGORY_CONFIG[template.category].label}
                </span>
                <span className="template-time">⏰ {template.time}</span>
              </div>
              {template.subtasks.length > 0 && (
                <span className="template-subtasks">
                  📋 {template.subtasks.length} qism vazifa
                </span>
              )}
            </div>
            <div className="template-actions">
              <button 
                className="use-template-btn"
                onClick={() => useTemplate(template)}
                title="Ishlatish"
              >
                <ContentCopyIcon />
                Ishlatish
              </button>
              <div className="template-more-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => openEditModal(template)}
                  title="Tahrirlash"
                >
                  <EditOutlinedIcon />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => deleteTemplate(template.id)}
                  title="O'chirish"
                >
                  <DeleteOutlineIcon />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {templates.length === 0 && (
          <div className="empty-templates">
            <span className="empty-icon">📑</span>
            <h3>Shablonlar yo'q</h3>
            <p>Birinchi shablonni yarating</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTemplate ? 'Shablonni tahrirlash' : 'Yangi shablon yaratish'}</h3>
              <button className="close-modal" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              {/* Icon Selector */}
              <div className="form-group">
                <label>Ikonka</label>
                <div className="emoji-selector">
                  {EMOJI_LIST.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`emoji-btn ${newTemplate.icon === emoji ? 'active' : ''}`}
                      onClick={() => setNewTemplate({ ...newTemplate, icon: emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label>Shablon nomi</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Masalan: Ertalabki mashq"
                  maxLength={50}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Kategoriya</label>
                <div className="category-buttons">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      className={`category-btn ${newTemplate.category === key ? 'active' : ''}`}
                      onClick={() => setNewTemplate({ ...newTemplate, category: key })}
                      style={{ '--cat-color': config.color }}
                    >
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="form-group">
                <label>Imtiyoz</label>
                <div className="priority-buttons">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      className={`priority-btn ${newTemplate.priority === key ? 'active' : ''}`}
                      onClick={() => setNewTemplate({ ...newTemplate, priority: key })}
                      style={{ '--prio-color': config.color }}
                    >
                      {key === 'high' ? '🔴' : key === 'medium' ? '🟡' : '🟢'} {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="form-group">
                <label>Standart vaqt</label>
                <input
                  type="time"
                  value={newTemplate.time}
                  onChange={e => setNewTemplate({ ...newTemplate, time: e.target.value })}
                />
              </div>

              {/* Subtasks */}
              <div className="form-group">
                <label>Qism vazifalar ({newTemplate.subtasks.length})</label>
                <div className="subtasks-list">
                  {newTemplate.subtasks.map(st => (
                    <div key={st.id} className="subtask-item">
                      <span>{st.title}</span>
                      <button 
                        type="button"
                        onClick={() => removeSubtaskFromTemplate(st.id)}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-subtask">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtaskToTemplate())}
                    placeholder="Qism vazifa qo'shish..."
                  />
                  <button 
                    type="button" 
                    onClick={addSubtaskToTemplate}
                    disabled={!newSubtask.trim()}
                  >
                    <AddIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Bekor qilish
              </button>
              <button 
                className="save-btn" 
                onClick={saveTemplate}
                disabled={!newTemplate.name.trim()}
              >
                <SaveOutlinedIcon />
                {editingTemplate ? 'Saqlash' : 'Yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTemplates;
