import React, { useState, useEffect } from 'react';
import TaskTemplates from '../components/TaskTemplates/TaskTemplates';
import './TemplatesPage.css';

const TemplatesPage = () => {
  const handleUseTemplate = (task) => {
    // Get existing tasks
    const saved = localStorage.getItem('kuntartib-tasks');
    const tasks = saved ? JSON.parse(saved) : [];
    
    // Add new task from template
    tasks.push(task);
    localStorage.setItem('kuntartib-tasks', JSON.stringify(tasks));
    
    // Show notification
    alert('✅ Vazifa qo\'shildi: ' + task.title);
  };

  return (
    <div className="templates-page">
      <TaskTemplates onUseTemplate={handleUseTemplate} />
    </div>
  );
};

export default TemplatesPage;
