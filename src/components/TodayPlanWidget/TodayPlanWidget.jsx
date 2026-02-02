import React from 'react';
import { isToday } from 'date-fns';
import './TodayPlanWidget.css';

// MUI Icons
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const TodayPlanWidget = ({ tasks = [] }) => {
  const todayTasks = tasks
    .filter(task => isToday(new Date(task.date)))
    .sort((a, b) => a.time.localeCompare(b.time));

  const completed = todayTasks.filter(t => t.completed).length;
  const total = todayTasks.length;
  const remaining = total - completed;

  const nextTask = todayTasks.find(t => !t.completed);

  return (
    <div className="today-plan-widget">
      <div className="widget-header">
        <div className="title">
          <TodayOutlinedIcon />
          <h3>Bugungi reja</h3>
        </div>
        <div className="stats">
          <span className="stat">{completed}/{total} bajarildi</span>
          <span className="stat">{remaining} qoldi</span>
        </div>
      </div>

      {nextTask ? (
        <div className="next-task">
          <span className="label">Keyingi vazifa</span>
          <div className="task-row">
            <AccessTimeOutlinedIcon fontSize="small" />
            <span className="time">{nextTask.time}</span>
            <span className="title">{nextTask.title}</span>
          </div>
        </div>
      ) : (
        <div className="next-task empty">
          <CheckCircleOutlineIcon />
          <span>Bugungi vazifalar yakunlandi</span>
        </div>
      )}

      <div className="task-list">
        {todayTasks.length > 0 ? (
          todayTasks.slice(0, 6).map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <span className="time">{task.time}</span>
              <span className="title">{task.title}</span>
            </div>
          ))
        ) : (
          <div className="empty">Bugun uchun vazifa yo'q</div>
        )}
      </div>
    </div>
  );
};

export default TodayPlanWidget;
