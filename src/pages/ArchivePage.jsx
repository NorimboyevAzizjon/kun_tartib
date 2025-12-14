import { useState } from 'react';
import TaskArchive from '../components/TaskArchive/TaskArchive';
import ArchiveIcon from '@mui/icons-material/Archive';
import './ArchivePage.css';

const ArchivePage = () => {
  const [archivedTasks, setArchivedTasks] = useState(() => {
    // LocalStorage dan arxivlangan vazifalarni yuklash
    const saved = localStorage.getItem('archivedTasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Vazifani tiklash
  const handleRestore = (task) => {
    // Arxivdan olib tashlash
    const updatedArchive = archivedTasks.filter(t => t.id !== task.id);
    setArchivedTasks(updatedArchive);
    localStorage.setItem('archivedTasks', JSON.stringify(updatedArchive));

    // Asosiy vazifalar ro'yxatiga qo'shish
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const { archivedAt: _, ...restoredTask } = task;
    void _; // unused variable warning oldini olish
    tasks.push(restoredTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  // Vazifani butunlay o'chirish
  const handleDeletePermanent = (taskId) => {
    const updatedArchive = archivedTasks.filter(t => t.id !== taskId);
    setArchivedTasks(updatedArchive);
    localStorage.setItem('archivedTasks', JSON.stringify(updatedArchive));
  };

  // Barchasini o'chirish
  const handleClearAll = () => {
    setArchivedTasks([]);
    localStorage.setItem('archivedTasks', JSON.stringify([]));
  };

  return (
    <div className="archive-page">
      <div className="archive-page-header">
        <ArchiveIcon />
        <h1>Vazifalar Arxivi</h1>
      </div>

      <div className="archive-page-content">
        <TaskArchive
          archivedTasks={archivedTasks}
          onRestore={handleRestore}
          onDeletePermanent={handleDeletePermanent}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
};

export default ArchivePage;
