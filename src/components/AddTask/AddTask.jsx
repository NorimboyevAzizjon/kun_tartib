import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './AddTask.css';

const AddTask = ({ onAddTask }) => {
  const [task, setTask] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'work',
    priority: 'medium',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title.trim()) return;
    
    onAddTask({
      id: uuidv4(),
      ...task,
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    setTask({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      category: 'work',
      priority: 'medium',
      description: ''
    });
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <h3>➕ Yangi Vazifa Qo'shish</h3>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Vazifa nomi..."
          value={task.title}
          onChange={(e) => setTask({...task, title: e.target.value})}
          className="task-input"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Sana</label>
          <input
            type="date"
            value={task.date}
            onChange={(e) => setTask({...task, date: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Vaqt</label>
          <input
            type="time"
            value={task.time}
            onChange={(e) => setTask({...task, time: e.target.value})}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Kategoriya</label>
          <select 
            value={task.category} 
            onChange={(e) => setTask({...task, category: e.target.value})}
          >
            <option value="work">💼 Ish</option>
            <option value="study">📚 O'qish</option>
            <option value="home">🏠 Uy</option>
            <option value="personal">👤 Shaxsiy</option>
            <option value="health">🏃 Sog'lom</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Imtiyoz</label>
          <select 
            value={task.priority} 
            onChange={(e) => setTask({...task, priority: e.target.value})}
          >
            <option value="low">🟢 Past</option>
            <option value="medium">🟡 O'rta</option>
            <option value="high">🔴 Yuqori</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label>Qo'shimcha ma'lumot</label>
        <textarea
          placeholder="Tavsif..."
          value={task.description}
          onChange={(e) => setTask({...task, description: e.target.value})}
          rows="3"
        />
      </div>
      
      <button type="submit" className="submit-btn">
        ➕ Vazifa Qo'shish
      </button>
    </form>
  );
};

export default AddTask;