import React, { useState } from 'react';
import Pomodoro from '../components/Pomodoro/Pomodoro';
import './PomodoroPage.css';

const PomodoroPage = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kuntartib-tasks');
    if (!saved) return [];
    const allTasks = JSON.parse(saved);
    return allTasks.filter(t => !t.completed);
  });

  const handleComplete = (taskId) => {
    const saved = localStorage.getItem('kuntartib-tasks');
    if (saved) {
      const allTasks = JSON.parse(saved);
      const updated = allTasks.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      );
      localStorage.setItem('kuntartib-tasks', JSON.stringify(updated));
      setTasks(updated.filter(t => !t.completed));
    }
  };

  return (
    <div className="pomodoro-page">
      <Pomodoro tasks={tasks} onComplete={handleComplete} />
    </div>
  );
};

export default PomodoroPage;
