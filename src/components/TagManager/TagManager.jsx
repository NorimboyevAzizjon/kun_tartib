import { useState } from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import './TagManager.css';

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#64748b', '#374151'
];

const TagManager = ({ tags = [], onAddTag, onEditTag, onDeleteTag, onFilterByTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Teglarni filtrlash
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yangi teg qo'shish
  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: selectedColor,
        createdAt: new Date().toISOString(),
        taskCount: 0
      };
      onAddTag && onAddTag(newTag);
      setNewTagName('');
      setSelectedColor(DEFAULT_COLORS[0]);
      setIsAdding(false);
    }
  };

  // Tegni tahrirlash
  const handleEditTag = () => {
    if (editingTag && newTagName.trim()) {
      onEditTag && onEditTag(editingTag.id, {
        ...editingTag,
        name: newTagName.trim(),
        color: selectedColor
      });
      setEditingTag(null);
      setNewTagName('');
      setSelectedColor(DEFAULT_COLORS[0]);
    }
  };

  // Tahrirlash rejimini boshlash
  const startEditing = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setSelectedColor(tag.color);
    setIsAdding(false);
  };

  // Tahrirlashni bekor qilish
  const cancelEditing = () => {
    setEditingTag(null);
    setNewTagName('');
    setSelectedColor(DEFAULT_COLORS[0]);
    setIsAdding(false);
    setShowColorPicker(false);
  };

  // Filter bo'yicha tanlash
  const handleFilterClick = (tag) => {
    if (activeFilter === tag.id) {
      setActiveFilter(null);
      onFilterByTag && onFilterByTag(null);
    } else {
      setActiveFilter(tag.id);
      onFilterByTag && onFilterByTag(tag);
    }
  };

  // Statistikani hisoblash
  const totalTasks = tags.reduce((sum, tag) => sum + (tag.taskCount || 0), 0);

  return (
    <div className="tag-manager">
      <div className="tag-header">
        <div className="tag-title">
          <LocalOfferIcon />
          <h2>Teglar</h2>
          <span className="tag-count">{tags.length} ta teg</span>
        </div>
        
        {!isAdding && !editingTag && (
          <button 
            className="add-tag-btn"
            onClick={() => setIsAdding(true)}
          >
            <AddIcon />
            Yangi teg
          </button>
        )}
      </div>

      {/* Statistika */}
      <div className="tag-stats">
        <div className="stat-card">
          <LocalOfferIcon />
          <div className="stat-info">
            <span className="stat-value">{tags.length}</span>
            <span className="stat-label">Jami teglar</span>
          </div>
        </div>
        <div className="stat-card">
          <FilterAltIcon />
          <div className="stat-info">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Teglangan vazifalar</span>
          </div>
        </div>
      </div>

      {/* Qidiruv */}
      <div className="tag-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Teglarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Yangi teg qo'shish / tahrirlash */}
      {(isAdding || editingTag) && (
        <div className="tag-form">
          <div className="form-header">
            <h3>{editingTag ? 'Tegni tahrirlash' : 'Yangi teg qo\'shish'}</h3>
          </div>
          
          <div className="form-content">
            <div className="input-group">
              <label>Teg nomi</label>
              <input
                type="text"
                placeholder="Teg nomini kiriting..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (editingTag ? handleEditTag() : handleAddTag())}
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>Rang</label>
              <div className="color-selector">
                <button 
                  className="selected-color"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <ColorLensIcon />
                </button>
                
                {showColorPicker && (
                  <div className="color-picker">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        className={`color-option ${selectedColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="tag-preview">
              <span>Ko'rinishi:</span>
              <span 
                className="preview-tag"
                style={{ backgroundColor: selectedColor }}
              >
                {newTagName || 'Teg nomi'}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button className="cancel-btn" onClick={cancelEditing}>
              <CloseIcon />
              Bekor qilish
            </button>
            <button 
              className="save-btn"
              onClick={editingTag ? handleEditTag : handleAddTag}
              disabled={!newTagName.trim()}
            >
              <CheckIcon />
              {editingTag ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </div>
      )}

      {/* Teglar ro'yxati */}
      {tags.length === 0 ? (
        <div className="empty-tags">
          <LocalOfferIcon className="empty-icon" />
          <h3>Teglar yo'q</h3>
          <p>Vazifalarni tashkil qilish uchun teglar qo'shing</p>
          <button 
            className="add-first-tag-btn"
            onClick={() => setIsAdding(true)}
          >
            <AddIcon />
            Birinchi tegni qo'shish
          </button>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="empty-tags">
          <SearchIcon className="empty-icon" />
          <h3>Teg topilmadi</h3>
          <p>"{searchTerm}" bo'yicha natija yo'q</p>
        </div>
      ) : (
        <div className="tags-grid">
          {filteredTags.map(tag => (
            <div 
              key={tag.id}
              className={`tag-card ${activeFilter === tag.id ? 'active' : ''}`}
            >
              <div 
                className="tag-color-bar"
                style={{ backgroundColor: tag.color }}
              />
              
              <div className="tag-content" onClick={() => handleFilterClick(tag)}>
                <div className="tag-name-row">
                  <span 
                    className="tag-badge"
                    style={{ backgroundColor: tag.color }}
                  >
                    <LocalOfferIcon />
                    {tag.name}
                  </span>
                  {activeFilter === tag.id && (
                    <span className="filter-active">
                      <FilterAltIcon />
                    </span>
                  )}
                </div>
                <span className="tag-task-count">
                  {tag.taskCount || 0} ta vazifa
                </span>
              </div>

              <div className="tag-actions">
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(tag);
                  }}
                  title="Tahrirlash"
                >
                  <EditIcon />
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTag && onDeleteTag(tag.id);
                  }}
                  title="O'chirish"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tezkor teglar - ko'p ishlatiladigan */}
      {tags.length > 0 && (
        <div className="quick-tags">
          <h4>Tezkor teglar</h4>
          <div className="quick-tags-list">
            {tags
              .sort((a, b) => (b.taskCount || 0) - (a.taskCount || 0))
              .slice(0, 5)
              .map(tag => (
                <button
                  key={tag.id}
                  className={`quick-tag ${activeFilter === tag.id ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: activeFilter === tag.id ? tag.color : 'transparent',
                    borderColor: tag.color,
                    color: activeFilter === tag.id ? 'white' : tag.color
                  }}
                  onClick={() => handleFilterClick(tag)}
                >
                  {tag.name}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

// Vazifaga teg qo'shish komponenti
export const TagSelector = ({ 
  availableTags = [], 
  selectedTags = [], 
  onTagSelect, 
  onTagRemove,
  maxTags = 5 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(st => st.id === tag.id)
  );

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span 
            key={tag.id}
            className="selected-tag"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button onClick={() => onTagRemove && onTagRemove(tag.id)}>
              <CloseIcon />
            </button>
          </span>
        ))}
        
        {selectedTags.length < maxTags && (
          <button 
            className="add-tag-trigger"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AddIcon />
            Teg qo'shish
          </button>
        )}
      </div>

      {isOpen && (
        <div className="tag-dropdown">
          <div className="dropdown-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Teg qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="dropdown-list">
            {filteredTags.length === 0 ? (
              <div className="no-tags">Teg topilmadi</div>
            ) : (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  className="dropdown-tag"
                  onClick={() => {
                    onTagSelect && onTagSelect(tag);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span 
                    className="tag-dot"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
