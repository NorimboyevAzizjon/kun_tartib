import React, { useState, useEffect } from 'react';
import FocusMode from '../components/FocusMode/FocusMode';
import './FocusPage.css';

const FocusPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('kuntartib-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const handleComplete = (taskId) => {
    const updated = tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
    localStorage.setItem('kuntartib-tasks', JSON.stringify(updated));
  };

  return (
    <div className="focus-page">
      <FocusMode tasks={tasks} onComplete={handleComplete} />
    </div>
  );
};

export default FocusPage;
