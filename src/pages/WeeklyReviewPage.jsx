import React, { useState, useEffect } from 'react';
import WeeklyReview from '../components/WeeklyReview/WeeklyReview';
import './WeeklyReviewPage.css';

const WeeklyReviewPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('kuntartib-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="weekly-review-page">
      <WeeklyReview tasks={tasks} />
    </div>
  );
};

export default WeeklyReviewPage;
