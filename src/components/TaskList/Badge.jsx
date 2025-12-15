import React from 'react';
import './Badge.css';

const Badge = ({ icon, label, className = '', style = {}, children }) => (
  <span className={`badge ${className}`} style={style}>
    {icon && <span className="badge-icon">{icon}</span>}
    {label && <span className="badge-label">{label}</span>}
    {children}
  </span>
);

export default Badge;
