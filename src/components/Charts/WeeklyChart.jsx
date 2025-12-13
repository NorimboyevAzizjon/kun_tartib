import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyChart = ({ tasks, timeRange = 'week' }) => {
  const days = ['Yak', 'Dush', 'Se', 'Chor', 'Pay', 'Jum', 'Shan'];
  
  const calculateWeeklyStats = () => {
    const stats = {
      total: Array(7).fill(0),
      completed: Array(7).fill(0),
      pending: Array(7).fill(0)
    };
    
    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      const dayOfWeek = taskDate.getDay(); // 0 = Yakshanba
      
      stats.total[dayOfWeek]++;
      if (task.completed) stats.completed[dayOfWeek]++;
      else stats.pending[dayOfWeek]++;
    });
    
    return stats;
  };

  const stats = calculateWeeklyStats();
  const percentages = stats.total.map((total, i) => 
    total > 0 ? Math.round((stats.completed[i] / total) * 100) : 0
  );

  const barData = {
    labels: days,
    datasets: [
      {
        label: 'Bajarilgan',
        data: stats.completed,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Kutayotgan',
        data: stats.pending,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ],
  };

  const lineData = {
    labels: days,
    datasets: [
      {
        label: 'Bajarilish foizi (%)',
        data: percentages,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(102, 126, 234)',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: '📊 Haftalik Vazifalar',
        font: { size: 16, weight: 'bold' },
        color: '#2d3748',
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const day = days[context.dataIndex];
            const completed = stats.completed[context.dataIndex];
            const total = stats.total[context.dataIndex];
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return `${day}: ${completed}/${total} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          font: { size: 11 },
          callback: (value) => value + ' ta'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: '📈 Haftalik Progress',
        font: { size: 16, weight: 'bold' },
        color: '#2d3748',
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.parsed.y}% bajarildi`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          font: { size: 11 },
          callback: (value) => value + '%'
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="weekly-chart">
      <div className="chart-tabs">
        <div className="chart-tab active">
          <h4>Vazifalar soni</h4>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="chart-tab">
          <h4>Progress foizi</h4>
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <div className="summary-label">Eng faol kun:</div>
          <div className="summary-value">
            {days[stats.total.indexOf(Math.max(...stats.total))] || '-'}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Haftalik o'rtacha:</div>
          <div className="summary-value">
            {Math.round(stats.total.reduce((a, b) => a + b, 0) / 7)} ta/kun
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Umumiy progress:</div>
          <div className="summary-value">
            {Math.round(percentages.reduce((a, b) => a + b, 0) / 7)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;