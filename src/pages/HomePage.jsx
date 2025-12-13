import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList/TaskList';
import AddTask from '../components/AddTask/AddTask';
import TaskSummary from '../components/Statistics/TaskSummary';
import './HomePage.css';

const HomePage = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('schedule-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // LocalStorage ga saqlash
  useEffect(() => {
    localStorage.setItem('schedule-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === today);

  return (
    <div className="home-page">
      <div className="header">
        <h1>📅 Kun Tartibi</h1>
        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Jami Vazifa</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tasks.filter(t => t.completed).length}</span>
            <span className="stat-label">Bajarilgan</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{todayTasks.length}</span>
            <span className="stat-label">Bugungi</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <AddTask onAddTask={handleAddTask} />
          <TaskSummary tasks={tasks} />
        </div>
        
        <div className="right-panel">
          <div className="today-section">
            <h2>Bugungi Vazifalar ({todayTasks.length})</h2>
            {todayTasks.length > 0 ? (
              <TaskList 
                tasks={todayTasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            ) : (
              <p className="empty-state">Bugun hech qanday vazifa yo'q. Yangi vazifa qo'shing!</p>
            )}
          </div>
          
          <div className="all-tasks-section">
            <h2>Barcha Vazifalar</h2>
            <TaskList 
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;