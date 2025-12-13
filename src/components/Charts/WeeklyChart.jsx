import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyChart = ({ tasks }) => {
  // Haftalik statistika hisoblash
  const days = ['Dush', 'Seш', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
  
  const calculateWeeklyStats = () => {
    const stats = days.map(() => ({ total: 0, completed: 0 }));
    
    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      const dayOfWeek = taskDate.getDay(); // 0 = Yak, 1 = Dush...
      
      if (dayOfWeek >= 1 && dayOfWeek <= 7) {
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        stats[index].total++;
        if (task.completed) stats[index].completed++;
      }
    });
    
    return stats.map(stat => 
      stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
    );
  };

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Bajarilgan foiz (%)',
        data: calculateWeeklyStats(),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Haftalik Faollik Statistikasi',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Foiz (%)'
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar options={options} data={data} />
    </div>
  );
};

export default WeeklyChart;