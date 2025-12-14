import React, { useState, useRef, useEffect } from 'react';
import './Subtasks.css';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const Subtasks = ({ 
  subtasks = [], 
  onChange, 
  readOnly = false,
  maxSubtasks = 10 
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const idCounterRef = useRef(subtasks.length);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    idCounterRef.current = Math.max(idCounterRef.current, subtasks.length);
  }, [subtasks.length]);

  const createSubtaskId = () => `subtask_${idCounterRef.current++}`;

  const addSubtask = () => {
    if (!newSubtask.trim() || subtasks.length >= maxSubtasks) return;

    const newItem = {
      id: createSubtaskId(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: null
    };

    onChange([...subtasks, newItem]);
    setNewSubtask('');
    inputRef.current?.focus();
  };

  const toggleSubtask = (id) => {
    if (readOnly) return;
    
    const updated = subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    onChange(updated);
  };

  const deleteSubtask = (id) => {
    if (readOnly) return;
    onChange(subtasks.filter(st => st.id !== id));
  };

  const startEditing = (subtask) => {
    if (readOnly) return;
    setEditingId(subtask.id);
    setEditValue(subtask.title);
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }

    const updated = subtasks.map(st =>
      st.id === editingId ? { ...st, title: editValue.trim() } : st
    );
    onChange(updated);
    setEditingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, subtask) => {
    setDraggedItem(subtask);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSubtask) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetSubtask.id) return;

    const newList = [...subtasks];
    const draggedIndex = newList.findIndex(st => st.id === draggedItem.id);
    const targetIndex = newList.findIndex(st => st.id === targetSubtask.id);

    newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, draggedItem);

    onChange(newList);
    setDraggedItem(null);
  };

  // Calculate progress
  const completedCount = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="subtasks-container">
      {/* Header with Progress */}
      {subtasks.length > 0 && (
        <div className="subtasks-header">
          <div className="subtasks-info">
            <span className="subtasks-count">
              📋 {completedCount}/{subtasks.length} bajarildi
            </span>
            <span className="subtasks-progress-text">{progress}%</span>
          </div>
          <div className="subtasks-progress-bar">
            <div 
              className="subtasks-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="subtasks-list">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={`subtask-item ${subtask.completed ? 'completed' : ''} ${draggedItem?.id === subtask.id ? 'dragged' : ''}`}
            draggable={!readOnly && !editingId}
            onDragStart={(e) => handleDragStart(e, subtask)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, subtask)}
          >
            {!readOnly && (
              <span className="drag-handle" title="Ko'chirish">
                <DragIndicatorIcon />
              </span>
            )}

            <button
              className="subtask-checkbox"
              onClick={() => toggleSubtask(subtask.id)}
              disabled={readOnly}
            >
              {subtask.completed ? (
                <CheckCircleOutlineIcon className="checked" />
              ) : (
                <RadioButtonUncheckedIcon className="unchecked" />
              )}
            </button>

            {editingId === subtask.id ? (
              <input
                ref={editInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleEditKeyDown}
                className="subtask-edit-input"
                maxLength={100}
              />
            ) : (
              <span 
                className="subtask-title"
                onDoubleClick={() => startEditing(subtask)}
              >
                {subtask.title}
              </span>
            )}

            {!readOnly && editingId !== subtask.id && (
              <div className="subtask-actions">
                <button
                  className="subtask-action-btn edit"
                  onClick={() => startEditing(subtask)}
                  title="Tahrirlash"
                >
                  <EditOutlinedIcon />
                </button>
                <button
                  className="subtask-action-btn delete"
                  onClick={() => deleteSubtask(subtask.id)}
                  title="O'chirish"
                >
                  <DeleteOutlineIcon />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Subtask */}
      {!readOnly && subtasks.length < maxSubtasks && (
        <div className="add-subtask">
          <input
            ref={inputRef}
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Yangi qism vazifa..."
            className="add-subtask-input"
            maxLength={100}
          />
          <button
            className="add-subtask-btn"
            onClick={addSubtask}
            disabled={!newSubtask.trim()}
            title="Qo'shish"
          >
            <AddIcon />
          </button>
        </div>
      )}

      {/* Max limit reached */}
      {!readOnly && subtasks.length >= maxSubtasks && (
        <div className="max-subtasks-message">
          ℹ️ Maksimal {maxSubtasks} ta qism vazifa qo'shish mumkin
        </div>
      )}

      {/* Empty state */}
      {subtasks.length === 0 && !readOnly && (
        <div className="empty-subtasks">
          <span className="empty-icon">📝</span>
          <p>Qism vazifalar yo'q</p>
          <span className="empty-hint">Yuqoridan qo'shishni boshlang</span>
        </div>
      )}
    </div>
  );
};

export default Subtasks;
