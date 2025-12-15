import React from 'react';

const TaskButton = ({ icon, label, className = '', ...props }) => (
  <button className={`task-btn ${className}`} {...props}>
    {icon && <span className="task-btn-icon">{icon}</span>}
    {label && <span className="task-btn-label">{label}</span>}
  </button>
);

export default TaskButton;
