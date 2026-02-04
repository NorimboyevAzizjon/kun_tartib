import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './KanbanBoard.css';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';

// Default columns
const defaultColumns = [
  { id: 'todo', title: 'Qilish kerak', color: '#6366f1' },
  { id: 'inprogress', title: 'Jarayonda', color: '#f59e0b' },
  { id: 'review', title: 'Tekshirish', color: '#8b5cf6' },
  { id: 'done', title: 'Bajarildi', color: '#10b981' }
];

// Sortable Card Component
const SortableCard = ({ card, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="card-drag-handle" {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" />
      </div>
      
      <div className="card-content">
        <h4 className="card-title">{card.title}</h4>
        {card.description && (
          <p className="card-description">{card.description}</p>
        )}
        
        <div className="card-meta">
          {card.priority && (
            <span className="card-priority" style={{ color: priorityColors[card.priority] }}>
              <FlagIcon fontSize="small" />
              {card.priority === 'high' ? 'Yuqori' : card.priority === 'medium' ? "O'rta" : 'Past'}
            </span>
          )}
          {card.dueDate && (
            <span className="card-due">
              <AccessTimeIcon fontSize="small" />
              {new Date(card.dueDate).toLocaleDateString('uz-UZ')}
            </span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button className="card-btn edit" onClick={() => onEdit(card)}>
          <EditIcon fontSize="small" />
        </button>
        <button className="card-btn delete" onClick={() => onDelete(card.id)}>
          <DeleteOutlineIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({ column, cards, onAddCard, onEditCard, onDeleteCard }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, { title: newCardTitle.trim() });
      setNewCardTitle('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="kanban-column">
      <div className="column-header" style={{ borderTopColor: column.color }}>
        <h3 className="column-title">
          {column.title}
          <span className="column-count">{cards.length}</span>
        </h3>
      </div>

      <div className="column-content">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {showAddForm ? (
          <div className="add-card-form">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Vazifa nomi..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCard();
                if (e.key === 'Escape') setShowAddForm(false);
              }}
            />
            <div className="form-actions">
              <button className="btn-add" onClick={handleAddCard}>Qo'shish</button>
              <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Bekor</button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={() => setShowAddForm(true)}>
            <AddIcon fontSize="small" />
            Vazifa qo'shish
          </button>
        )}
      </div>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard = () => {
  const [columns] = useState(defaultColumns);
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('kuntartib-kanban');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCard, setActiveCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kuntartib-kanban', JSON.stringify(cards));
  }, [cards]);

  // Add new card
  const handleAddCard = (columnId, cardData) => {
    const newCard = {
      id: `card-${Date.now()}`,
      columnId,
      title: cardData.title,
      description: '',
      priority: 'medium',
      dueDate: null,
      createdAt: new Date().toISOString()
    };
    setCards([...cards, newCard]);
  };

  // Edit card
  const handleEditCard = (card) => {
    setEditingCard(card);
  };

  // Save edited card
  const handleSaveCard = (updatedCard) => {
    setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
    setEditingCard(null);
  };

  // Delete card
  const handleDeleteCard = (cardId) => {
    if (confirm('Bu vazifani o\'chirmoqchimisiz?')) {
      setCards(cards.filter(c => c.id !== cardId));
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const card = cards.find(c => c.id === event.active.id);
    setActiveCard(card);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Find target column
    let targetColumnId = null;
    
    // Check if dropped on a column
    const targetColumn = columns.find(col => col.id === over.id);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
    } else {
      // Check if dropped on a card
      const targetCard = cards.find(c => c.id === over.id);
      if (targetCard) {
        targetColumnId = targetCard.columnId;
      }
    }

    if (targetColumnId && activeCard.columnId !== targetColumnId) {
      setCards(cards.map(c => 
        c.id === active.id ? { ...c, columnId: targetColumnId } : c
      ));
    }
  };

  // Get cards for a column
  const getColumnCards = (columnId) => {
    return cards.filter(c => c.columnId === columnId);
  };

  return (
    <div className="kanban-board">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-columns">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getColumnCards(column.id)}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="kanban-card dragging-overlay">
              <div className="card-content">
                <h4 className="card-title">{activeCard.title}</h4>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Modal */}
      {editingCard && (
        <div className="kanban-modal-overlay" onClick={() => setEditingCard(null)}>
          <div className="kanban-modal" onClick={e => e.stopPropagation()}>
            <h3>Vazifani tahrirlash</h3>
            <div className="modal-form">
              <label>
                Nomi
                <input
                  type="text"
                  value={editingCard.title}
                  onChange={(e) => setEditingCard({...editingCard, title: e.target.value})}
                />
              </label>
              <label>
                Tavsif
                <textarea
                  value={editingCard.description || ''}
                  onChange={(e) => setEditingCard({...editingCard, description: e.target.value})}
                  rows={3}
                />
              </label>
              <label>
                Muhimlik
                <select
                  value={editingCard.priority || 'medium'}
                  onChange={(e) => setEditingCard({...editingCard, priority: e.target.value})}
                >
                  <option value="low">Past</option>
                  <option value="medium">O'rta</option>
                  <option value="high">Yuqori</option>
                </select>
              </label>
              <label>
                Muddat
                <input
                  type="date"
                  value={editingCard.dueDate || ''}
                  onChange={(e) => setEditingCard({...editingCard, dueDate: e.target.value})}
                />
              </label>
              <label>
                Ustun
                <select
                  value={editingCard.columnId}
                  onChange={(e) => setEditingCard({...editingCard, columnId: e.target.value})}
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={() => handleSaveCard(editingCard)}>
                Saqlash
              </button>
              <button className="btn-cancel" onClick={() => setEditingCard(null)}>
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
