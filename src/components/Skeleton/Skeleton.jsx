import React from 'react';
import './Skeleton.css';

// Basic skeleton shapes
export const SkeletonLine = ({ width = '100%', height = 16 }) => (
  <div className="skeleton-line" style={{ width, height }} />
);

export const SkeletonCircle = ({ size = 40 }) => (
  <div className="skeleton-circle" style={{ width: size, height: size }} />
);

export const SkeletonRect = ({ width = '100%', height = 100, borderRadius = 8 }) => (
  <div className="skeleton-rect" style={{ width, height, borderRadius }} />
);

// Task card skeleton
export const SkeletonTaskCard = () => (
  <div className="skeleton-task-card">
    <div className="skeleton-task-left">
      <SkeletonCircle size={20} />
    </div>
    <div className="skeleton-task-content">
      <SkeletonLine width="70%" height={16} />
      <SkeletonLine width="40%" height={12} />
    </div>
    <div className="skeleton-task-right">
      <SkeletonLine width={60} height={24} />
    </div>
  </div>
);

// Task list skeleton
export const SkeletonTaskList = ({ count = 5 }) => (
  <div className="skeleton-task-list">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonTaskCard key={i} />
    ))}
  </div>
);

// Stat card skeleton
export const SkeletonStatCard = () => (
  <div className="skeleton-stat-card">
    <SkeletonCircle size={48} />
    <div className="skeleton-stat-content">
      <SkeletonLine width={60} height={24} />
      <SkeletonLine width={80} height={12} />
    </div>
  </div>
);

// Stats row skeleton
export const SkeletonStats = ({ count = 4 }) => (
  <div className="skeleton-stats-row">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);

// Calendar skeleton
export const SkeletonCalendar = () => (
  <div className="skeleton-calendar">
    <div className="skeleton-calendar-header">
      <SkeletonLine width={120} height={20} />
      <div className="skeleton-calendar-nav">
        <SkeletonCircle size={32} />
        <SkeletonCircle size={32} />
      </div>
    </div>
    <div className="skeleton-calendar-grid">
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonCircle key={i} size={36} />
      ))}
    </div>
  </div>
);

// Chart skeleton
export const SkeletonChart = ({ height = 200 }) => (
  <div className="skeleton-chart" style={{ height }}>
    <div className="skeleton-chart-bars">
      {Array.from({ length: 7 }).map((_, i) => (
        <div 
          key={i} 
          className="skeleton-bar"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

// Page skeleton
export const SkeletonPage = () => (
  <div className="skeleton-page">
    <div className="skeleton-page-header">
      <SkeletonLine width={200} height={28} />
      <SkeletonLine width={300} height={16} />
    </div>
    <SkeletonStats count={4} />
    <SkeletonTaskList count={5} />
  </div>
);

// Kanban column skeleton
export const SkeletonKanbanColumn = () => (
  <div className="skeleton-kanban-column">
    <SkeletonLine width="60%" height={20} />
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonRect key={i} height={80} borderRadius={8} />
    ))}
  </div>
);

// Avatar skeleton
export const SkeletonAvatar = ({ size = 40 }) => (
  <SkeletonCircle size={size} />
);

// Text block skeleton
export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-text">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine 
        key={i} 
        width={i === lines - 1 ? '60%' : '100%'} 
        height={14} 
      />
    ))}
  </div>
);

const Skeleton = {
  Line: SkeletonLine,
  Circle: SkeletonCircle,
  Rect: SkeletonRect,
  TaskCard: SkeletonTaskCard,
  TaskList: SkeletonTaskList,
  StatCard: SkeletonStatCard,
  Stats: SkeletonStats,
  Calendar: SkeletonCalendar,
  Chart: SkeletonChart,
  Page: SkeletonPage,
  KanbanColumn: SkeletonKanbanColumn,
  Avatar: SkeletonAvatar,
  Text: SkeletonText
};

export default Skeleton;
