import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import './ProgressChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeeklyChart = ({ tasks = [] }) => {
  // Haftalik ma'lumotlarni hisoblash
  const { chartData, summaryStats } = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale: uz });
    const weekEnd = endOfWeek(new Date(), { locale: uz });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    // Har bir kun uchun statistikalar
    const dailyStats = weekDays.map(day => {
      const dayTasks = tasks.filter(task => 
        isSameDay(new Date(task.date), day)
      );
      
      const completed = dayTasks.filter(t => t.completed).length;
      const total = dayTasks.length;
      const pending = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        day: format(day, 'EEE', { locale: uz }),
        fullDay: format(day, 'EEEE', { locale: uz }),
        total,
        completed,
        pending,
        completionRate
      };
    });

    // Eng faol kun
    const mostActiveDay = dailyStats.reduce((max, day) => 
      day.total > max.total ? day : max, dailyStats[0]
    );

    // Eng yuqori progress
    const highestProgressDay = dailyStats.reduce((max, day) => 
      day.total > 0 && day.completionRate > max.completionRate ? day : max, 
      { completionRate: 0 }
    );

    // Haftalik o'rtacha
    const totalTasks = dailyStats.reduce((sum, day) => sum + day.total, 0);
    const averagePerDay = Math.round(totalTasks / 7) || 0;
    const averageCompletion = Math.round(
      dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / 7
    ) || 0;

    return {
      chartData: {
        days: dailyStats.map(d => d.day),
        fullDays: dailyStats.map(d => d.fullDay),
        totals: dailyStats.map(d => d.total),
        completed: dailyStats.map(d => d.completed),
        pending: dailyStats.map(d => d.pending),
        completionRates: dailyStats.map(d => d.completionRate),
        dailyStats
      },
      summaryStats: {
        totalTasks,
        averagePerDay,
        averageCompletion,
        mostActiveDay,
        highestProgressDay
      }
    };
  }, [tasks]);

  // Bar chart (vazifalar soni)
  const barChartData = {
    labels: chartData.days,
    datasets: [
      {
        label: 'Bajarilgan',
        data: chartData.completed,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Kutayotgan',
        data: chartData.pending,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ],
  };

  // Line chart (progress foizi)
  const lineChartData = {
    labels: chartData.days,
    datasets: [
      {
        label: 'Bajarilish foizi',
        data: chartData.completionRates,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgb(99, 102, 241)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
        pointHoverBorderWidth: 3
      }
    ],
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { 
            size: 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          color: 'var(--text-secondary)',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              hidden: !chart.isDatasetVisible(i),
              index: i
            }));
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
          title: (context) => {
            return chartData.fullDays[context[0].dataIndex];
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const dayIndex = context.dataIndex;
            const dayData = chartData.dailyStats[dayIndex];
            
            if (context.datasetIndex === 0) { // Bajarilgan
              return [
                `${label}: ${value} ta`,
                `Jami vazifalar: ${dayData.total} ta`,
                `Bajarilish darajasi: ${dayData.completionRate}%`
              ];
            } else { // Kutayotgan
              return [
                `${label}: ${value} ta`,
                `Jami vazifalar: ${dayData.total} ta`,
                `Qolgan vazifalar: ${value} ta`
              ];
            }
          },
          labelColor: (context) => {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.backgroundColor,
              borderWidth: 2,
              borderRadius: 4
            };
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          display: false,
          drawBorder: false
        },
        ticks: { 
          font: { 
            size: 12,
            family: "'Inter', sans-serif",
            weight: '600'
          },
          color: 'var(--text-secondary)'
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: { 
          font: { 
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: 'var(--text-secondary)',
          callback: (value) => value + ' ta'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  const lineChartOptions = {
    ...barChartOptions,
    scales: {
      ...barChartOptions.scales,
      y: {
        beginAtZero: true,
        max: 100,
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: { 
          font: { 
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: 'var(--text-secondary)',
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      ...barChartOptions.plugins,
      tooltip: {
        ...barChartOptions.plugins.tooltip,
        callbacks: {
          ...barChartOptions.plugins.tooltip.callbacks,
          label: (context) => {
            const value = context.parsed.y;
            const dayIndex = context.dataIndex;
            const dayData = chartData.dailyStats[dayIndex];
            
            return [
              `Bajarilish foizi: ${value}%`,
              `Bajarilgan: ${dayData.completed}/${dayData.total} ta`,
              `Kutayotgan: ${dayData.pending} ta`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="weekly-chart-container glass-effect card-hover">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="header-content">
          <div className="header-icon-wrapper">
            <span className="header-icon">📅</span>
          </div>
          <div className="header-text">
            <h3 className="chart-title">Haftalik Faollik</h3>
            <p className="chart-subtitle">
              Vazifalaringizning haftalik statistik tahlili
            </p>
          </div>
        </div>
        
        <div className="week-range">
          <span className="range-icon">📆</span>
          <span className="range-text">
            {format(startOfWeek(new Date(), { locale: uz }), 'dd MMM', { locale: uz })} - 
            {format(endOfWeek(new Date(), { locale: uz }), 'dd MMM', { locale: uz })}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-section">
        <div className="chart-tab active fade-in">
          <div className="tab-header">
            <h4 className="tab-title">
              <span className="tab-icon">📊</span>
              Vazifalar Soni
            </h4>
            <div className="tab-info">
              Haftaning har bir kunidagi vazifalar soni
            </div>
          </div>
          <div className="chart-wrapper card-hover">
            <div className="chart-container" style={{ height: '320px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        <div className="chart-tab fade-in">
          <div className="tab-header">
            <h4 className="tab-title">
              <span className="tab-icon">📈</span>
              Progress Trendi
            </h4>
            <div className="tab-info">
              Hafta davomida bajarilish darajasining o'zgarishi
            </div>
          </div>
          <div className="chart-wrapper card-hover">
            <div className="chart-container" style={{ height: '320px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="summary-header">
          <h4 className="summary-title">
            <span className="summary-icon">📋</span>
            Haftalik Statistikalar
          </h4>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card total-tasks card-hover">
            <div className="stat-icon">
              <span className="icon-emoji">📋</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">Jami Vazifalar</div>
              <div className="stat-value">{summaryStats.totalTasks}</div>
              <div className="stat-sub">Hafta davomida</div>
            </div>
          </div>
          
          <div className="stat-card daily-average card-hover">
            <div className="stat-icon">
              <span className="icon-emoji">📅</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">Kunlik O'rtacha</div>
              <div className="stat-value">{summaryStats.averagePerDay} ta</div>
              <div className="stat-sub">Har bir kunda</div>
            </div>
          </div>
          
          <div className="stat-card completion-rate card-hover">
            <div className="stat-icon">
              <span className="icon-emoji">✅</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">Umumiy Progress</div>
              <div className="stat-value">{summaryStats.averageCompletion}%</div>
              <div className="stat-sub">O'rtacha bajarilish</div>
            </div>
          </div>
          
          <div className="stat-card most-active card-hover">
            <div className="stat-icon">
              <span className="icon-emoji">🔥</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">Eng Faol Kun</div>
              <div className="stat-value">{summaryStats.mostActiveDay?.day || '-'}</div>
              <div className="stat-sub">
                {summaryStats.mostActiveDay?.total || 0} ta vazifa
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="daily-breakdown">
        <div className="breakdown-header">
          <h4 className="breakdown-title">
            <span className="breakdown-icon">📊</span>
            Kunlik Tafsilotlar
          </h4>
          <p className="breakdown-subtitle">
            Haftaning har bir kunidagi batafsil statistikalar
          </p>
        </div>
        
        <div className="days-grid">
          {chartData.dailyStats.map((day, index) => (
            <div key={index} className="day-card card-hover">
              <div className="day-header">
                <div className="day-name">{day.fullDay}</div>
                <div className="day-date">{chartData.days[index]}</div>
              </div>
              
              <div className="day-stats">
                <div className="stat-row">
                  <div className="stat-item">
                    <span className="stat-label">Jami</span>
                    <span className="stat-value">{day.total}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bajarilgan</span>
                    <span className="stat-value success">{day.completed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Kutayotgan</span>
                    <span className="stat-value warning">{day.pending}</span>
                  </div>
                </div>
              </div>
              
              <div className="day-progress">
                <div className="progress-header">
                  <span className="progress-label">Bajarilish darajasi</span>
                  <span className="progress-percentage">{day.completionRate}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${day.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="day-efficiency">
                <div className="efficiency-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">
                    {day.total > 0 ? 'Faol' : 'Faol emas'}
                  </span>
                </div>
                <div className="efficiency-tag">
                  {day.total > 5 ? 'Yuqori faollik' : 
                   day.total > 2 ? 'O\'rtacha faollik' : 'Past faollik'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;