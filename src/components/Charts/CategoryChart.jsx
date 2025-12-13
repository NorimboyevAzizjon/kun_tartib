import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ tasks }) => {
  // Kategoriyalar statistikasini hisoblaymiz
  const categories = {
    '💼 Ish': { color: '#FF6384', count: 0 },
    '📚 O\'qish': { color: '#36A2EB', count: 0 },
    '🏠 Uy': { color: '#FFCE56', count: 0 },
    '👤 Shaxsiy': { color: '#4BC0C0', count: 0 },
    '🏃 Sog\'lom': { color: '#9966FF', count: 0 }
  };

  tasks.forEach(task => {
    const categoryKey = {
      work: '💼 Ish',
      study: '📚 O\'qish',
      home: '🏠 Uy',
      personal: '👤 Shaxsiy',
      health: '🏃 Sog\'lom'
    }[task.category];
    
    if (categoryKey && categories[categoryKey]) {
      categories[categoryKey].count++;
    }
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories).map(c => c.count),
        backgroundColor: Object.values(categories).map(c => c.color),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="category-chart">
      <h3>Kategoriyalar Bo'yicha Taqsimot</h3>
      <div style={{ height: '300px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default CategoryChart;