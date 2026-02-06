import React, { useState, useRef } from 'react';
import './DataManager.css';

// MUI Icons
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const DataManager = ({ onClose }) => {
  const [status, setStatus] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const fileInputRef = useRef(null);

  // LocalStorage kalitlari
  const storageKeys = [
    { key: 'kun-tartibi-tasks', label: 'Vazifalar' },
    { key: 'kun-tartibi-goals', label: 'Maqsadlar' },
    { key: 'kun-tartibi-notes', label: 'Eslatmalar' },
    { key: 'kun-tartibi-habits', label: 'Odatlar' },
    { key: 'kun-tartibi-tags', label: 'Teglar' },
    { key: 'kun-tartibi-templates', label: 'Shablonlar' },
    { key: 'kun-tartibi-pomodoro', label: 'Pomodoro' },
    { key: 'notification-history', label: 'Bildirishnomalar' },
    { key: 'kuntartib-theme', label: 'Mavzu' },
  ];

  // JSON Export
  const exportJSON = () => {
    try {
      const data = {};
      storageKeys.forEach(({ key }) => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kuntartib-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'JSON fayl muvaffaqiyatli yuklandi!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Eksport qilishda xatolik: ' + error.message });
    }
  };

  // CSV Export (faqat vazifalar)
  const exportCSV = () => {
    try {
      const tasks = JSON.parse(localStorage.getItem('kun-tartibi-tasks') || '[]');
      
      if (tasks.length === 0) {
        setStatus({ type: 'warning', message: 'Eksport qilish uchun vazifa yo\'q' });
        return;
      }

      const headers = ['ID', 'Sarlavha', 'Tavsif', 'Sana', 'Vaqt', 'Kategoriya', 'Muhimlik', 'Bajarilgan', 'Yaratilgan'];
      const rows = tasks.map(task => [
        task.id || '',
        `"${(task.title || '').replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.date || '',
        task.time || '',
        task.category || '',
        task.priority || '',
        task.completed ? 'Ha' : 'Yo\'q',
        task.createdAt || ''
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kuntartib-tasks-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'CSV fayl muvaffaqiyatli yuklandi!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'CSV eksport xatolik: ' + error.message });
    }
  };

  // Import JSON
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Preview yaratish
        const preview = Object.entries(data).map(([key, value]) => {
          const label = storageKeys.find(k => k.key === key)?.label || key;
          const count = Array.isArray(value) ? value.length : 1;
          return { key, label, count };
        });

        setImportPreview({ data, preview });
        setStatus({ type: 'info', message: 'Faylni ko\'rib chiqing va import qilish tugmasini bosing' });
      } catch (error) {
        setStatus({ type: 'error', message: 'Fayl formati noto\'g\'ri. JSON fayl yuklang.' });
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = (merge = false) => {
    if (!importPreview) return;

    try {
      Object.entries(importPreview.data).forEach(([key, value]) => {
        if (merge && Array.isArray(value)) {
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const merged = [...existing];
          value.forEach(item => {
            if (!merged.some(e => e.id === item.id)) {
              merged.push(item);
            }
          });
          localStorage.setItem(key, JSON.stringify(merged));
        } else {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      setStatus({ type: 'success', message: 'Ma\'lumotlar muvaffaqiyatli import qilindi! Sahifani yangilang.' });
      setImportPreview(null);
      
      // Sahifani yangilash
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Import xatolik: ' + error.message });
    }
  };

  // Storage statistikasi
  const getStorageStats = () => {
    let totalSize = 0;
    const stats = [];

    storageKeys.forEach(({ key, label }) => {
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        totalSize += size;
        const count = (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.length : 1;
          } catch {
            return 1;
          }
        })();
        stats.push({ key, label, size, count });
      }
    });

    return { stats, totalSize };
  };

  const { stats, totalSize } = getStorageStats();

  // Ma'lumotlarni tozalash
  const clearAllData = () => {
    if (window.confirm('Barcha ma\'lumotlar o\'chiriladi! Davom etasizmi?')) {
      storageKeys.forEach(({ key }) => localStorage.removeItem(key));
      setStatus({ type: 'success', message: 'Barcha ma\'lumotlar tozalandi!' });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="data-manager-overlay" onClick={onClose}>
      <div className="data-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="dm-header">
          <StorageOutlinedIcon />
          <h2>Ma'lumotlarni Boshqarish</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {status && (
          <div className={`dm-status ${status.type}`}>
            {status.type === 'success' && <CheckCircleOutlineIcon />}
            {status.type === 'error' && <WarningAmberIcon />}
            {status.type === 'warning' && <WarningAmberIcon />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="dm-content">
          {/* Export Section */}
          <div className="dm-section">
            <h3><FileDownloadOutlinedIcon /> Eksport qilish</h3>
            <p>Ma'lumotlaringizni zaxira nusxasini yarating</p>
            <div className="dm-buttons">
              <button className="dm-btn primary" onClick={exportJSON}>
                <ArticleOutlinedIcon />
                JSON eksport
              </button>
              <button className="dm-btn secondary" onClick={exportCSV}>
                <TableChartOutlinedIcon />
                CSV eksport (vazifalar)
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="dm-section">
            <h3><FileUploadOutlinedIcon /> Import qilish</h3>
            <p>Zaxira nusxadan ma'lumotlarni tiklash</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button className="dm-btn primary" onClick={() => fileInputRef.current?.click()}>
              <FileUploadOutlinedIcon />
              JSON fayl tanlash
            </button>

            {importPreview && (
              <div className="import-preview">
                <h4>Import qilinadigan ma'lumotlar:</h4>
                <ul>
                  {importPreview.preview.map(item => (
                    <li key={item.key}>
                      {item.label}: <strong>{item.count}</strong> ta
                    </li>
                  ))}
                </ul>
                <div className="import-actions">
                  <button className="dm-btn warning" onClick={() => confirmImport(false)}>
                    Almashtirish
                  </button>
                  <button className="dm-btn success" onClick={() => confirmImport(true)}>
                    Birlashtirish
                  </button>
                  <button className="dm-btn secondary" onClick={() => setImportPreview(null)}>
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Storage Stats */}
          <div className="dm-section">
            <h3><StorageOutlinedIcon /> Saqlash statistikasi</h3>
            <div className="storage-stats">
              {stats.map(item => (
                <div key={item.key} className="stat-item">
                  <span className="stat-label">{item.label}</span>
                  <span className="stat-count">{item.count} ta</span>
                  <span className="stat-size">{formatSize(item.size)}</span>
                </div>
              ))}
              <div className="stat-total">
                <span>Jami:</span>
                <span>{formatSize(totalSize)}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="dm-section danger">
            <h3><DeleteOutlineIcon /> Xavfli zona</h3>
            <p>Bu amal qaytarib bo'lmaydi!</p>
            <button className="dm-btn danger" onClick={clearAllData}>
              <DeleteOutlineIcon />
              Barcha ma'lumotlarni o'chirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
