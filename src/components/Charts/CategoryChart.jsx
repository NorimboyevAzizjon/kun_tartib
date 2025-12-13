import React, { useMemo } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  Title
} from 'chart.js';
import './CategoryChart.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, Title);

const CategoryChart = ({ tasks = [] }) => {
  const sectionIds = {
    summary: 'category-summary',
    charts: 'category-charts',
    details: 'category-details',
    insights: 'category-insights'
  };

  // Kategoriyalar statistikasini hisoblaymiz
  const { categoryStats, filteredCategories, insights } = useMemo(() => {
    const categories = {
      '💼 Ish': { 
        color: '#6366f1', 
        count: 0,
        completed: 0,
        icon: '💼',
        label: 'Ish'
      },
      '📚 O\'qish': { 
        color: '#10b981', 
        count: 0,
        completed: 0,
        icon: '📚',
        label: "O'qish"
      },
      '🏠 Uy': { 
        color: '#f59e0b', 
        count: 0,
        completed: 0,
        icon: '🏠',
        label: 'Uy'
      },
      '👤 Shaxsiy': { 
        color: '#8b5cf6', 
        count: 0,
        completed: 0,
        icon: '👤',
        label: 'Shaxsiy'
      },
      '🏃 Sog\'lom': { 
        color: '#3b82f6', 
        count: 0,
        completed: 0,
        icon: '🏃',
        label: 'Sog\'lom'
      }
    };

    // Har bir vazifani kategoriyalarga qo'shamiz
    tasks.forEach(task => {
      const categoryKey = {
        work: '💼 Ish',
        study: "📚 O'qish",
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
    const filtered = Object.entries(categories)
      .filter(([_, data]) => data.count > 0)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Statistik ma'lumotlar
    const totalTasks = Object.values(filtered).reduce((sum, cat) => sum + cat.count, 0);
    const mostActiveCategory = Object.entries(filtered)
      .sort((a, b) => b[1].count - a[1].count)[0];
    
    const highestCompletion = Object.entries(filtered)
      .filter(([_, cat]) => cat.count > 0)
      .sort((a, b) => {
        const rateA = Math.round((a[1].completed / a[1].count) * 100);
        const rateB = Math.round((b[1].completed / b[1].count) * 100);
        return rateB - rateA;
      })[0];

    const averagePerCategory = Object.keys(filtered).length > 0 
      ? Math.round(totalTasks / Object.keys(filtered).length)
      : 0;

    return {
      categoryStats: categories,
      filteredCategories: filtered,
      insights: {
        totalTasks,
        mostActiveCategory,
        highestCompletion,
        averagePerCategory,
        totalCategories: Object.keys(filtered).length
      }
    };
  }, [tasks]);

  // Pie chart uchun data
  const pieChartData = {
    labels: Object.keys(filteredCategories),
    datasets: [
      {
        data: Object.values(filteredCategories).map(c => c.count),
        backgroundColor: Object.values(filteredCategories).map(c => c.color),
        borderColor: Object.values(filteredCategories).map(c => `${c.color}CC`),
        borderWidth: 2,
        hoverBackgroundColor: Object.values(filteredCategories).map(c => `${c.color}DD`),
        hoverBorderColor: Object.values(filteredCategories).map(c => c.color),
        hoverBorderWidth: 3,
        borderRadius: 8,
        spacing: 4
      },
    ],
  };

  // Doughnut chart uchun data
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
        borderColor: Object.values(filteredCategories).map(c => `${c.color}CC`),
        borderWidth: 2,
        hoverBackgroundColor: Object.values(filteredCategories).map(c => `${c.color}DD`),
      }
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          color: 'var(--text-secondary)',
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                const categoryData = filteredCategories[label];
                
                return {
                  text: `${label.split(' ')[1]}: ${value} ta (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: !chart.getDataVisibility(i),
                  index: i,
                  fontColor: 'var(--text-secondary)'
                };
              });
            }
            return [];
          }
        },
        onClick: (e, legendItem, legend) => {
          const index = legendItem.index;
          const chart = legend.chart;
          const ci = chart;
          
          if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
          } else {
            ci.show(index);
            legendItem.hidden = false;
          }
          
          chart.update();
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-secondary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-light)',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 14,
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
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
              `${label.split(' ')[1]}: ${value} ta vazifa`,
              `Umumiy taqsimot: ${percentage}%`,
              `Bajarilgan: ${categoryData.completed}/${categoryData.count} ta`,
              `Bajarilish darajasi: ${completionRate}%`
            ];
          },
          labelColor: (context) => {
            return {
              borderColor: context.dataset.backgroundColor[context.dataIndex],
              backgroundColor: context.dataset.backgroundColor[context.dataIndex],
              borderWidth: 2,
              borderRadius: 4
            };
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart'
    },
    onHover: (event, chartElement) => {
      if (chartElement.length) {
        event.native.target.style.cursor = 'pointer';
      } else {
        event.native.target.style.cursor = 'default';
      }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '45%',
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          ...chartOptions.plugins.tooltip.callbacks,
          label: (context) => {
            const label = context.label || '';
            const categoryData = filteredCategories[label];
            
            if (context.datasetIndex === 0) {
              return `Jami vazifalar: ${context.parsed} ta`;
            } else {
              const completionRate = categoryData.count > 0 
                ? Math.round((categoryData.completed / categoryData.count) * 100)
                : 0;
              return `Bajarilgan: ${context.parsed} ta (${completionRate}%)`;
            }
          }
        }
      }
    }
  };

  return (
    <div className="category-chart-container glass-effect card-hover">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <a className="icon-link" href={`#${sectionIds.charts}`} aria-label="Diagrammalarga o'tish">
              <span className="header-icon">📊</span>
            </a>
          </div>
          <div className="header-text">
            <h3 className="chart-title">Kategoriyalar Bo'yicha Taqsimot</h3>
            <p className="chart-subtitle">
              Vazifalaringizning kategoriyalar bo'yicha statistik tahlili
            </p>
          </div>
        </div>
        
        <div id={sectionIds.summary} className="chart-summary slide-in">
          <div className="summary-item">
            <a className="icon-link" href={`#${sectionIds.details}`} aria-label="Kategoriyalar tafsilotlariga o'tish">
              <div className="summary-icon">🏷️</div>
            </a>
            <div className="summary-content">
              <div className="summary-label">Kategoriyalar</div>
              <div className="summary-value">{insights.totalCategories}</div>
            </div>
          </div>
          
          <div className="summary-item">
            <a className="icon-link" href={`#${sectionIds.details}`} aria-label="Kategoriyalar tafsilotlariga o'tish">
              <div className="summary-icon">📋</div>
            </a>
            <div className="summary-content">
              <div className="summary-label">Jami vazifalar</div>
              <div className="summary-value">{insights.totalTasks}</div>
            </div>
          </div>
          
          <div className="summary-item">
            <a className="icon-link" href={`#${sectionIds.insights}`} aria-label="Statistik tahlillarga o'tish">
              <div className="summary-icon">📊</div>
            </a>
            <div className="summary-content">
              <div className="summary-label">O'rtacha</div>
              <div className="summary-value">{insights.averagePerCategory} ta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div id={sectionIds.charts} className="charts-grid">
        <div className="chart-wrapper card-hover">
          <div className="chart-header-small">
            <h4 className="chart-subtitle">
              <a className="icon-link" href={`#${sectionIds.charts}`} aria-label="Diagrammalar bo'limi">
                <span className="subtitle-icon">🥧</span>
              </a>
              Vazifalar Taqsimoti
            </h4>
            <div className="chart-info">
              Har bir kategoriyadagi vazifalar soni
            </div>
          </div>
          <div className="chart-container">
            <Pie data={pieChartData} options={chartOptions} />
          </div>
          <div className="chart-footer">
            <span className="footer-icon">📌</span>
            <span className="footer-text">
              {insights.mostActiveCategory 
                ? `Eng faol: ${insights.mostActiveCategory[0].split(' ')[1]}`
                : 'Vazifalar yo\'q'
              }
            </span>
          </div>
        </div>

        <div className="chart-wrapper card-hover">
          <div className="chart-header-small">
            <h4 className="chart-subtitle">
              <a className="icon-link" href={`#${sectionIds.charts}`} aria-label="Diagrammalar bo'limi">
                <span className="subtitle-icon">🍩</span>
              </a>
              Bajarilish Darajasi
            </h4>
            <div className="chart-info">
              Tashqi halqa: jami, ichki halqa: bajarilgan
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="chart-footer">
            <span className="footer-icon">🎯</span>
            <span className="footer-text">
              {insights.highestCompletion 
                ? `Yuqori daraja: ${insights.highestCompletion[0].split(' ')[1]}`
                : 'Ma\'lumot yo\'q'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Category Details */}
      {Object.keys(filteredCategories).length > 0 && (
        <div id={sectionIds.details} className="category-details">
          <div className="details-header">
            <h4 className="details-title">
              <a className="icon-link" href={`#${sectionIds.details}`} aria-label="Kategoriyalar tafsilotlari">
                <span className="details-icon">📈</span>
              </a>
              Kategoriyalar Tafsilotlari
            </h4>
            <div className="details-subtitle">
              Har bir kategoriya uchun batafsil statistikalar
            </div>
          </div>
          
          <div className="category-stats-grid">
            {Object.entries(filteredCategories).map(([name, data]) => {
              const percentage = Math.round((data.count / insights.totalTasks) * 100);
              const completionRate = data.count > 0 
                ? Math.round((data.completed / data.count) * 100)
                : 0;
              const pendingCount = data.count - data.completed;
              
              return (
                <div key={name} className="category-stat-card card-hover">
                  <div className="category-card-header">
                    <div 
                      className="category-icon-wrapper"
                      style={{ '--category-color': data.color }}
                    >
                      <span className="category-icon">{data.icon}</span>
                    </div>
                    <div className="category-info">
                      <h5 className="category-name">{data.label}</h5>
                      <div className="category-meta">
                        <span className="meta-item">
                          <span className="meta-icon">📋</span>
                          {data.count} ta vazifa
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">🎯</span>
                          {percentage}% ulush
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="category-numbers">
                    <div className="number-item completed">
                      <div className="number-label">Bajarilgan</div>
                      <div className="number-value">{data.completed}</div>
                      <div className="number-percentage">{completionRate}%</div>
                    </div>
                    
                    <div className="number-item pending">
                      <div className="number-label">Kutayotgan</div>
                      <div className="number-value">{pendingCount}</div>
                      <div className="number-percentage">{100 - completionRate}%</div>
                    </div>
                    
                    <div className="number-item total">
                      <div className="number-label">Jami</div>
                      <div className="number-value">{data.count}</div>
                      <div className="number-percentage">{percentage}%</div>
                    </div>
                  </div>
                  
                  <div className="category-progress">
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Umumiy taqsimot</span>
                        <span className="progress-percentage">{percentage}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: data.color
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Bajarilish darajasi</span>
                        <span className="progress-percentage">{completionRate}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${completionRate}%`,
                            backgroundColor: data.color,
                            opacity: 0.7
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div id={sectionIds.insights} className="insights-section">
        <div className="insights-header">
          <h4 className="insights-title">
            <a className="icon-link" href={`#${sectionIds.insights}`} aria-label="Statistik tahlillar">
              <span className="insights-icon">💡</span>
            </a>
            Statistik Tahlillar
          </h4>
          <p className="insights-subtitle">
            Kategoriyalar bo'yicha muhim statistikalar
          </p>
        </div>
        
        <div className="insights-grid">
          {insights.mostActiveCategory && (
            <div className="insight-card card-hover">
              <div className="insight-icon" style={{ '--insight-color': '#6366f1' }}>
                <span className="icon-emoji">🔥</span>
              </div>
              <div className="insight-content">
                <div className="insight-title">Eng faol kategoriya</div>
                <div className="insight-value">
                  {insights.mostActiveCategory[1].label}
                </div>
                <div className="insight-sub">
                  {insights.mostActiveCategory[1].count} ta vazifa
                </div>
              </div>
            </div>
          )}
          
          {insights.highestCompletion && (
            <div className="insight-card card-hover">
              <div className="insight-icon" style={{ '--insight-color': '#10b981' }}>
                <span className="icon-emoji">✅</span>
              </div>
              <div className="insight-content">
                <div className="insight-title">Yuqori bajarilish</div>
                <div className="insight-value">
                  {Math.round((insights.highestCompletion[1].completed / insights.highestCompletion[1].count) * 100)}%
                </div>
                <div className="insight-sub">
                  {insights.highestCompletion[1].label} kategoriyasida
                </div>
              </div>
            </div>
          )}
          
          <div className="insight-card card-hover">
            <div className="insight-icon" style={{ '--insight-color': '#8b5cf6' }}>
              <span className="icon-emoji">📊</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">O'rtacha son</div>
              <div className="insight-value">{insights.averagePerCategory} ta</div>
              <div className="insight-sub">
                Har bir kategoriyaga
              </div>
            </div>
          </div>
          
          <div className="insight-card card-hover">
            <div className="insight-icon" style={{ '--insight-color': '#f59e0b' }}>
              <span className="icon-emoji">⚖️</span>
            </div>
            <div className="insight-content">
              <div className="insight-title">Muvozanat</div>
              <div className="insight-value">
                {Object.values(filteredCategories).filter(cat => cat.count > 0).length > 0 
                  ? 'Muvozanatli' 
                  : 'Bir tomonlama'
                }
              </div>
              <div className="insight-sub">
                {Object.values(filteredCategories).filter(cat => cat.count > 0).length} ta kategoriya faol
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="chart-footer-section">
        <div className="footer-content">
          <div className="footer-text">
            <span className="footer-icon">📊</span>
            Statistikalar real vaqtda yangilanadi
          </div>
          <div className="footer-stats">
            <span className="footer-stat">
              <span className="stat-icon">🏷️</span>
              {insights.totalCategories} kategoriya
            </span>
            <span className="footer-stat">
              <span className="stat-icon">📋</span>
              {insights.totalTasks} ta vazifa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;