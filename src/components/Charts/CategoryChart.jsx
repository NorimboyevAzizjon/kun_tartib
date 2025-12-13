import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ tasks }) => {
  // Kategoriyalar statistikasini hisoblaymiz
  const categories = {
    '💼 Ish': { 
      color: '#667eea', 
      count: 0,
      completed: 0,
      icon: '💼'
    },
    '📚 O\'qish': { 
      color: '#4CAF50', 
      count: 0,
      completed: 0,
      icon: '📚'
    },
    '🏠 Uy': { 
      color: '#FF9800', 
      count: 0,
      completed: 0,
      icon: '🏠'
    },
    '👤 Shaxsiy': { 
      color: '#9C27B0', 
      count: 0,
      completed: 0,
      icon: '👤'
    },
    '🏃 Sog\'lom': { 
      color: '#2196F3', 
      count: 0,
      completed: 0,
      icon: '🏃'
    }
  };

  // Har bir vazifani kategoriyalarga qo'shamiz
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
      if (task.completed) {
        categories[categoryKey].completed++;
      }
    }
  });

  // Faqat vazifasi bor kategoriyalarni olamiz
  const filteredCategories = Object.entries(categories)
    .filter(([_, data]) => data.count > 0)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const data = {
    labels: Object.keys(filteredCategories),
    datasets: [
      {
        data: Object.values(filteredCategories).map(c => c.count),
        backgroundColor: Object.values(filteredCategories).map(c => c.color),
        borderColor: Object.values(filteredCategories).map(c => c.color + 'CC'),
        borderWidth: 2,
        hoverBackgroundColor: Object.values(filteredCategories).map(c => c.color + 'DD'),
        hoverBorderColor: Object.values(filteredCategories).map(c => c.color),
        hoverBorderWidth: 3,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(filteredCategories),
    datasets: [
      {
        data: Object.values(filteredCategories).map(c => c.count),
        backgroundColor: Object.values(filteredCategories).map(c => `${c.color}40`),
        borderColor: Object.values(filteredCategories).map(c => c.color),
        borderWidth: 2,
        hoverBackgroundColor: Object.values(filteredCategories).map(c => `${c.color}60`),
      },
      {
        data: Object.values(filteredCategories).map(c => c.completed),
        backgroundColor: Object.values(filteredCategories).map(c => c.color),
        borderColor: Object.values(filteredCategories).map(c => c.color + 'CC'),
        borderWidth: 2,
        hoverBackgroundColor: Object.values(filteredCategories).map(c => c.color + 'DD'),
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Segoe UI', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const percentage = Math.round((value / dataset.data.reduce((a, b) => a + b, 0)) * 100);
                
                return {
                  text: `${label}: ${value} ta (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            const categoryData = filteredCategories[label];
            const completionRate = categoryData.count > 0 
              ? Math.round((categoryData.completed / categoryData.count) * 100)
              : 0;
            
            return [
              `${label}: ${value} ta`,
              `Umumiy: ${percentage}%`,
              `Bajarilgan: ${categoryData.completed}/${categoryData.count} ta`,
              `Bajarilish darajasi: ${completionRate}%`
            ];
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  const doughnutOptions = {
    ...options,
    cutout: '40%',
    plugins: {
      ...options.plugins,
      tooltip: {
        ...options.plugins.tooltip,
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `Jami: ${context.parsed} ta`;
            } else {
              return `Bajarilgan: ${context.parsed} ta`;
            }
          }
        }
      }
    }
  };

  // Statistik ma'lumotlar
  const totalTasks = Object.values(filteredCategories).reduce((sum, cat) => sum + cat.count, 0);
  const mostActiveCategory = Object.entries(filteredCategories)
    .sort((a, b) => b[1].count - a[1].count)[0];
  const highestCompletion = Object.entries(filteredCategories)
    .filter(([_, cat]) => cat.count > 0)
    .sort((a, b) => {
      const rateA = Math.round((a[1].completed / a[1].count) * 100);
      const rateB = Math.round((b[1].completed / b[1].count) * 100);
      return rateB - rateA;
    })[0];

  return (
    <div className="category-chart-container">
      <div className="chart-header">
        <h3>
          <span className="chart-icon">📊</span>
          Kategoriyalar Bo'yicha Taqsimot
        </h3>
        <div className="chart-summary">
          <span className="summary-item">
            <span className="summary-label">Jami kategoriyalar:</span>
            <span className="summary-value">{Object.keys(filteredCategories).length}</span>
          </span>
          <span className="summary-item">
            <span className="summary-label">Jami vazifalar:</span>
            <span className="summary-value">{totalTasks}</span>
          </span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-wrapper">
          <div className="chart-title">
            <span className="title-icon">🥧</span>
            Vazifalar soni
          </div>
          <div className="chart-container">
            <Pie data={data} options={options} />
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-title">
            <span className="title-icon">🍩</span>
            Bajarilganlik darajasi
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="category-stats">
        <h4>
          <span className="stats-icon">📈</span>
          Kategoriyalar Statistikasi
        </h4>
        
        <div className="stats-grid">
          {Object.entries(filteredCategories).map(([name, data]) => {
            const percentage = Math.round((data.count / totalTasks) * 100);
            const completionRate = Math.round((data.completed / data.count) * 100);
            
            return (
              <div key={name} className="category-stat-item">
                <div className="category-header">
                  <span className="category-icon">{data.icon}</span>
                  <span className="category-name">{name.split(' ')[1]}</span>
                </div>
                
                <div className="category-numbers">
                  <div className="number-item">
                    <span className="number-label">Jami</span>
                    <span className="number-value">{data.count}</span>
                  </div>
                  <div className="number-item">
                    <span className="number-label">Bajarilgan</span>
                    <span className="number-value success">{data.completed}</span>
                  </div>
                  <div className="number-item">
                    <span className="number-label">Foiz</span>
                    <span className="number-value">{percentage}%</span>
                  </div>
                </div>
                
                <div className="progress-section">
                  <div className="progress-info">
                    <span>Umumiy taqsimot</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill total"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: data.color
                      }}
                    ></div>
                  </div>
                  
                  <div className="progress-info">
                    <span>Bajarilish darajasi</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill completion"
                      style={{ 
                        width: `${completionRate}%`,
                        backgroundColor: data.color + '80'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="insights">
        <h4>
          <span className="insight-icon">💡</span>
          Statistik Tahlillar
        </h4>
        
        <div className="insight-items">
          {mostActiveCategory && (
            <div className="insight-item">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <div className="insight-title">Eng faol kategoriya</div>
                <div className="insight-value">
                  {mostActiveCategory[0]} ({mostActiveCategory[1].count} ta vazifa)
                </div>
              </div>
            </div>
          )}
          
          {highestCompletion && (
            <div className="insight-item">
              <div className="insight-icon">✅</div>
              <div className="insight-content">
                <div className="insight-title">Eng yuqori bajarilish darajasi</div>
                <div className="insight-value">
                  {highestCompletion[0]} (
                  {Math.round((highestCompletion[1].completed / highestCompletion[1].count) * 100)}%
                  bajarilgan)
                </div>
              </div>
            </div>
          )}
          
          <div className="insight-item">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <div className="insight-title">O'rtacha kategoriya soni</div>
              <div className="insight-value">
                {Object.keys(filteredCategories).length > 0 
                  ? Math.round(totalTasks / Object.keys(filteredCategories).length)
                  : 0} ta vazifa/kategoriya
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;