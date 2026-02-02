import React, { useEffect, useMemo, useState } from 'react';
import './SharedListsPage.css';

// MUI Icons
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

const STORAGE_KEY = 'shared-lists';

const SharedListsPage = () => {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kun-tartibi-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [newList, setNewList] = useState({ name: '', members: '' });
  const [selectedListId, setSelectedListId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    const onStorage = () => {
      const savedTasks = localStorage.getItem('kun-tartibi-tasks');
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const selectedList = useMemo(
    () => lists.find(l => l.id === selectedListId) || null,
    [lists, selectedListId]
  );

  const selectedTasks = useMemo(
    () => tasks.filter(t => t.sharedListId === selectedListId),
    [tasks, selectedListId]
  );

  const handleCreateList = (e) => {
    e.preventDefault();
    const name = newList.name.trim();
    if (!name) return;
    const members = newList.members
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    const list = {
      id: `list_${Date.now()}`,
      name,
      members,
      createdAt: new Date().toISOString()
    };

    setLists(prev => [list, ...prev]);
    setNewList({ name: '', members: '' });
  };

  const handleDeleteList = (id) => {
    if (!window.confirm('Ushbu shared listni o‘chirishni xohlaysizmi?')) return;
    setLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(null);
  };

  const handleCopyInvite = (list) => {
    const text = `KunTartib shared list: ${list.name}\nA'zolar: ${list.members.join(', ')}`;
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="shared-lists-page">
      <header className="shared-header">
        <h1><GroupOutlinedIcon /> Team / Shared Lists</h1>
        <p>Jamoa bilan umumiy ro‘yxatlarni boshqaring</p>
      </header>

      <div className="shared-layout">
        <div className="shared-left">
          <div className="create-card">
            <h3><AddCircleOutlineIcon /> Yangi shared list</h3>
            <form onSubmit={handleCreateList}>
              <input
                type="text"
                placeholder="List nomi (masalan: Marketing jamoa)"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="A'zolar email (vergul bilan)"
                value={newList.members}
                onChange={(e) => setNewList({ ...newList, members: e.target.value })}
              />
              <button type="submit">List yaratish</button>
            </form>
          </div>

          <div className="lists-card">
            <h3><GroupOutlinedIcon /> Mening listlarim</h3>
            {lists.length === 0 ? (
              <div className="empty">Hozircha shared list yo‘q</div>
            ) : (
              <div className="list-grid">
                {lists.map(list => (
                  <div key={list.id} className={`list-item ${selectedListId === list.id ? 'active' : ''}`}>
                    <div className="list-info" onClick={() => setSelectedListId(list.id)}>
                      <div className="list-title">{list.name}</div>
                      <div className="list-meta">{list.members.length} a'zo</div>
                    </div>
                    <div className="list-actions">
                      <button type="button" onClick={() => handleCopyInvite(list)} title="Invite nusxalash">
                        <ContentCopyIcon fontSize="small" />
                      </button>
                      <button type="button" onClick={() => handleDeleteList(list.id)} title="O‘chirish">
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shared-right">
          <div className="details-card">
            <h3><AssignmentOutlinedIcon /> List vazifalari</h3>
            {!selectedList ? (
              <div className="empty">Listni tanlang</div>
            ) : (
              <>
                <div className="list-summary">
                  <div><strong>{selectedList.name}</strong></div>
                  <div className="members">A'zolar: {selectedList.members.join(', ') || '—'}</div>
                </div>
                {selectedTasks.length === 0 ? (
                  <div className="empty">Bu listda vazifa yo‘q</div>
                ) : (
                  <div className="task-preview">
                    {selectedTasks.map(task => (
                      <div key={task.id} className={`task-row ${task.completed ? 'done' : ''}`}>
                        <span className="time">{task.time}</span>
                        <span className="title">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedListsPage;
