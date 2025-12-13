import React from 'react';

const ProgressChart = ({ tasks }) => {
  // Oddiy progress chart yaratamiz
  const days = ['D', 'S', 'Ch', 'P', 'J', 'Sh', 'Y'];
  const progress = [70, 80, 30, 100, 50, 90, 10];
  
  return (
    <div className="progress-chart">
      <h3>Kunlik Progress</h3>
      <div className="bars-container">
        {days.map((day, index) => (
          <div key={day} className="bar-item">
            <div className="bar-label">{day}</div>
            <div className="bar-wrapper">
              <div 
                className="bar-fill"
                style={{ height: `${progress[index]}%` }}
              >
                <span className="bar-percent">{progress[index]}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;