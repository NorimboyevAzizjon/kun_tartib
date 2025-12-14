import { useState } from 'react';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, parseISO, isValid } from 'date-fns';
import { uz } from 'date-fns/locale';
import './TaskArchive.css';

const TaskArchive = ({ archivedTasks = [], onRestore, onDeletePermanent, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('archivedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Kategoriyalar ro'yxati
  const categories = ['all', ...new Set(archivedTasks.map(t => t.category).filter(Boolean))];
  
  // Prioritetlar
  const priorities = [
    { value: 'all', label: 'Barchasi' },
    { value: 'yuqori', label: 'Yuqori' },
    { value: 'o\'rta', label: 'O\'rta' },
    { value: 'past', label: 'Past' }
  ];

  // Filtrlash va saralash
  const filteredTasks = archivedTasks
    .filter(task => {
      const matchesSearch = task.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'archivedDate':
          comparison = new Date(a.archivedAt || 0) - new Date(b.archivedAt || 0);
          break;
        case 'createdDate':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case 'priority': {
          const priorityOrder = { yuqori: 3, "o'rta": 2, past: 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        }
        case 'name':
          comparison = (a.text || '').localeCompare(b.text || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Tanlangan vazifalarni tiklash
  const handleRestoreSelected = () => {
    selectedTasks.forEach(taskId => {
      const task = archivedTasks.find(t => t.id === taskId);
      if (task && onRestore) {
        onRestore(task);
      }
    });
    setSelectedTasks([]);
  };

  // Tanlangan vazifalarni o'chirish
  const handleDeleteSelected = () => {
    selectedTasks.forEach(taskId => {
      if (onDeletePermanent) {
        onDeletePermanent(taskId);
      }
    });
    setSelectedTasks([]);
    setShowDeleteConfirm(null);
  };

  // Vazifani tanlash
  const toggleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Barcha vazifalarni tanlash
  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  // Sanani formatlash
  const formatDate = (dateString) => {
    if (!dateString) return 'Noma\'lum';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return 'Noma\'lum';
      return format(date, 'd MMMM yyyy, HH:mm', { locale: uz });
    } catch {
      return 'Noma\'lum';
    }
  };

  // Prioritet rangi
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'yuqori': return '#ef4444';
      case "o'rta": return '#f59e0b';
      case 'past': return '#22c55e';
      default: return '#6b7280';
    }
  };

  // Statistika
  const stats = {
    total: archivedTasks.length,
    completed: archivedTasks.filter(t => t.completed).length,
    highPriority: archivedTasks.filter(t => t.priority === 'yuqori').length
  };

  return (
    <div className="task-archive">
      <div className="archive-header">
        <div className="archive-title">
          <ArchiveIcon />
          <h2>Vazifalar Arxivi</h2>
          <span className="archive-count">{archivedTasks.length} ta vazifa</span>
        </div>

        {archivedTasks.length > 0 && (
          <button 
            className="clear-all-btn"
            onClick={() => setShowClearAllConfirm(true)}
          >
            <DeleteSweepIcon />
            Barchasini o'chirish
          </button>
        )}
      </div>

      {/* Statistika */}
      <div className="archive-stats">
        <div className="stat-item">
          <ArchiveIcon />
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Jami arxivlangan</span>
          </div>
        </div>
        <div className="stat-item">
          <CheckCircleIcon />
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Bajarilgan</span>
          </div>
        </div>
        <div className="stat-item">
          <PriorityHighIcon />
          <div className="stat-info">
            <span className="stat-value">{stats.highPriority}</span>
            <span className="stat-label">Yuqori prioritet</span>
          </div>
        </div>
      </div>

      {/* Qidiruv va filterlar */}
      <div className="archive-controls">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Vazifalarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FilterListIcon />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Barcha kategoriyalar</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <PriorityHighIcon />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <SortIcon />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="archivedDate">Arxivlangan sana</option>
            <option value="createdDate">Yaratilgan sana</option>
            <option value="priority">Prioritet</option>
            <option value="name">Nom</option>
          </select>
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'O\'sish tartibida' : 'Kamayish tartibida'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Tanlangan vazifalar uchun amallar */}
      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedTasks.length} ta vazifa tanlangan</span>
          <div className="bulk-buttons">
            <button className="bulk-restore-btn" onClick={handleRestoreSelected}>
              <RestoreIcon />
              Tiklash
            </button>
            <button 
              className="bulk-delete-btn" 
              onClick={() => setShowDeleteConfirm('bulk')}
            >
              <DeleteForeverIcon />
              O'chirish
            </button>
          </div>
        </div>
      )}

      {/* Vazifalar ro'yxati */}
      {archivedTasks.length === 0 ? (
        <div className="archive-empty">
          <ArchiveIcon className="empty-icon" />
          <h3>Arxiv bo'sh</h3>
          <p>Arxivlangan vazifalar bu yerda ko'rinadi</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="archive-empty">
          <SearchIcon className="empty-icon" />
          <h3>Vazifa topilmadi</h3>
          <p>Qidiruv shartlarini o'zgartiring</p>
        </div>
      ) : (
        <div className="archive-list">
          <div className="list-header">
            <label className="select-all">
              <input
                type="checkbox"
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Barchasini tanlash</span>
            </label>
            <span className="results-count">{filteredTasks.length} ta natija</span>
          </div>

          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`archive-item ${selectedTasks.includes(task.id) ? 'selected' : ''}`}
            >
              <div className="item-checkbox">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleSelectTask(task.id)}
                />
              </div>

              <div className="item-content">
                <div className="item-header">
                  <h4 className={task.completed ? 'completed' : ''}>
                    {task.completed && <CheckCircleIcon className="completed-icon" />}
                    {task.text}
                  </h4>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority || 'past'}
                  </span>
                </div>

                {task.description && (
                  <p className="item-description">{task.description}</p>
                )}

                <div className="item-meta">
                  {task.category && (
                    <span className="meta-item">
                      <CategoryIcon />
                      {task.category}
                    </span>
                  )}
                  <span className="meta-item">
                    <CalendarTodayIcon />
                    Yaratilgan: {formatDate(task.createdAt)}
                  </span>
                  <span className="meta-item">
                    <AccessTimeIcon />
                    Arxivlangan: {formatDate(task.archivedAt)}
                  </span>
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="item-tags">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button 
                  className="restore-btn"
                  onClick={() => onRestore && onRestore(task)}
                  title="Tiklash"
                >
                  <RestoreIcon />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => setShowDeleteConfirm(task.id)}
                  title="Butunlay o'chirish"
                >
                  <DeleteForeverIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* O'chirish tasdiqlash modali */}
      {showDeleteConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <WarningIcon className="warning-icon" />
            <h3>O'chirishni tasdiqlang</h3>
            <p>
              {showDeleteConfirm === 'bulk' 
                ? `${selectedTasks.length} ta vazifani butunlay o'chirmoqchimisiz?`
                : 'Bu vazifani butunlay o\'chirmoqchimisiz?'
              }
            </p>
            <p className="warning-text">Bu amalni qaytarib bo'lmaydi!</p>
            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Bekor qilish
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => {
                  if (showDeleteConfirm === 'bulk') {
                    handleDeleteSelected();
                  } else {
                    onDeletePermanent && onDeletePermanent(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }
                }}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barchasini o'chirish tasdiqlash modali */}
      {showClearAllConfirm && (
        <div className="confirm-modal-overlay" onClick={() => setShowClearAllConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <WarningIcon className="warning-icon" />
            <h3>Barchasini o'chirish</h3>
            <p>Arxivdagi barcha {archivedTasks.length} ta vazifani o'chirmoqchimisiz?</p>
            <p className="warning-text">Bu amalni qaytarib bo'lmaydi!</p>
            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowClearAllConfirm(false)}
              >
                Bekor qilish
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => {
                  onClearAll && onClearAll();
                  setShowClearAllConfirm(false);
                }}
              >
                Barchasini o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskArchive;
