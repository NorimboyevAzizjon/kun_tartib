import React from 'react';
import HabitTracker from '../components/HabitTracker/HabitTracker';
import './HabitPage.css';

// MUI Icons
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const HabitPage = () => {
  return (
    <div className="habit-page">
      <div className="page-header">
        <div className="header-content">
          <TrackChangesIcon className="header-icon" />
          <div>
            <h1>Habit Tracker</h1>
            <p>Kundalik odatlaringizni kuzating va rivojlaning</p>
          </div>
        </div>
      </div>

      <HabitTracker />
    </div>
  );
};

export default HabitPage;
