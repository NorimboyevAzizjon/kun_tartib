import React, { useState } from 'react';
import WeeklyReview from '../components/WeeklyReview/WeeklyReview';
import './WeeklyReviewPage.css';

const WeeklyReviewPage = () => {
  const [tasks] = useState(() => {
    const saved = localStorage.getItem('kuntartib-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div className="weekly-review-page">
      <WeeklyReview tasks={tasks} />
    </div>
  );
};

export default WeeklyReviewPage;
