import { useState } from 'react';
import AdvancedStats from '../components/AdvancedStats/AdvancedStats';
import StreakCounter from '../components/StreakCounter/StreakCounter';
import BarChartIcon from '@mui/icons-material/BarChart';
import './StatsPage.css';

const StatsPage = () => {
  const [tasks] = useState(() => {
    // LocalStorage dan ma'lumotlarni yuklash
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [completionHistory] = useState(() => {
    const saved = localStorage.getItem('completionHistory');
    return saved ? JSON.parse(saved) : [];
  });

  return (
    <div className="stats-page">
      <div className="stats-page-header">
        <BarChartIcon />
        <h1>Kengaytirilgan Statistika</h1>
      </div>

      <div className="stats-page-content">
        <div className="streak-section">
          <StreakCounter 
            tasks={tasks} 
            completionHistory={completionHistory} 
          />
        </div>

        <div className="advanced-stats-section">
          <AdvancedStats tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
