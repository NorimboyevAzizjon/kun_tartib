import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameMonth,
  isSameYear,
  subMonths,
  addMonths,
  subYears,
  addYears,
  parseISO
} from 'date-fns';
import { uz } from 'date-fns/locale';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './AdvancedStats.css';

// MUI Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const CATEGORY_CONFIG = {
  work: { label: "Ish", color: '#6366f1', icon: <WorkIcon /> },
  study: { label: "O'qish", color: '#10b981', icon: <SchoolIcon /> },
  home: { label: 'Uy', color: '#f59e0b', icon: <HomeIcon /> },
  personal: { label: 'Shaxsiy', color: '#8b5cf6', icon: <PersonIcon /> },
  health: { label: "Sog'lom", color: '#3b82f6', icon: <FitnessCenterIcon /> }
};

const PRIORITY_CONFIG = {
  high: { label: 'Yuqori', color: '#ef4444' },
  medium: { label: "O'rta", color: '#f59e0b' },
  low: { label: 'Past', color: '#10b981' }
};

// Custom Tooltip - komponent tashqarida
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdvancedStats = ({ tasks = [], onExportPDF }) => {
  const [viewMode, setViewMode] = useState('monthly'); // monthly, yearly
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartType, setChartType] = useState('overview'); // overview, category, priority, trend

  // Oylik statistika
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isSameMonth(taskDate, selectedDate);
    });

    const dailyData = days.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayTasks = monthTasks.filter(t => t.date === dayKey);
      const completed = dayTasks.filter(t => t.completed).length;
      const pending = dayTasks.length - completed;

      return {
        date: format(day, 'd'),
        fullDate: dayKey,
        completed,
        pending,
        total: dayTasks.length
      };
    });

    const categoryData = Object.keys(CATEGORY_CONFIG).map(cat => {
      const catTasks = monthTasks.filter(t => t.category === cat);
      return {
        name: CATEGORY_CONFIG[cat].label,
        value: catTasks.length,
        completed: catTasks.filter(t => t.completed).length,
        color: CATEGORY_CONFIG[cat].color
      };
    }).filter(c => c.value > 0);

    const priorityData = Object.keys(PRIORITY_CONFIG).map(pri => {
      const priTasks = monthTasks.filter(t => t.priority === pri);
      return {
        name: PRIORITY_CONFIG[pri].label,
        value: priTasks.length,
        completed: priTasks.filter(t => t.completed).length,
        color: PRIORITY_CONFIG[pri].color
      };
    }).filter(p => p.value > 0);

    const total = monthTasks.length;
    const completed = monthTasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      dailyData,
      categoryData,
      priorityData,
      total,
      completed,
      pending: total - completed,
      completionRate
    };
  }, [tasks, selectedDate]);

  // Yillik statistika
  const yearlyStats = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    const yearTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isSameYear(taskDate, selectedDate);
    });

    const monthlyData = months.map(month => {
      const monthTasks = yearTasks.filter(t => {
        const taskDate = parseISO(t.date);
        return isSameMonth(taskDate, month);
      });
      const completed = monthTasks.filter(t => t.completed).length;
      const pending = monthTasks.length - completed;

      return {
        month: format(month, 'MMM', { locale: uz }),
        fullMonth: format(month, 'MMMM', { locale: uz }),
        completed,
        pending,
        total: monthTasks.length,
        completionRate: monthTasks.length > 0 
          ? Math.round((completed / monthTasks.length) * 100) 
          : 0
      };
    });

    const categoryData = Object.keys(CATEGORY_CONFIG).map(cat => {
      const catTasks = yearTasks.filter(t => t.category === cat);
      return {
        name: CATEGORY_CONFIG[cat].label,
        value: catTasks.length,
        completed: catTasks.filter(t => t.completed).length,
        color: CATEGORY_CONFIG[cat].color
      };
    }).filter(c => c.value > 0);

    const total = yearTasks.length;
    const completed = yearTasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Eng samarali oy
    const bestMonth = [...monthlyData].sort((a, b) => b.completionRate - a.completionRate)[0];

    return {
      monthlyData,
      categoryData,
      total,
      completed,
      pending: total - completed,
      completionRate,
      bestMonth
    };
  }, [tasks, selectedDate]);

  const currentStats = viewMode === 'monthly' ? monthlyStats : yearlyStats;

  // Navigatsiya
  const navigatePrev = () => {
    if (viewMode === 'monthly') {
      setSelectedDate(subMonths(selectedDate, 1));
    } else {
      setSelectedDate(subYears(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'monthly') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(addYears(selectedDate, 1));
    }
  };

  // PDF eksport
  const handleExportPDF = () => {
    const reportData = {
      period: viewMode === 'monthly' 
        ? format(selectedDate, 'MMMM yyyy', { locale: uz })
        : format(selectedDate, 'yyyy'),
      stats: currentStats,
      generatedAt: format(new Date(), 'dd.MM.yyyy HH:mm')
    };
    
    if (onExportPDF) {
      onExportPDF(reportData);
    } else {
      // Default PDF export
      const printContent = `
        KunTartib - ${viewMode === 'monthly' ? 'Oylik' : 'Yillik'} Hisobot
        ================================
        Davr: ${reportData.period}
        
        UMUMIY STATISTIKA
        -----------------
        Jami vazifalar: ${currentStats.total}
        Bajarilgan: ${currentStats.completed}
        Kutilayotgan: ${currentStats.pending}
        Bajarilish darajasi: ${currentStats.completionRate}%
        
        Hisobot yaratildi: ${reportData.generatedAt}
      `;
      
      const blob = new Blob([printContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kuntartib-report-${format(selectedDate, 'yyyy-MM')}.txt`;
      a.click();
    }
  };

  // Excel eksport
  const handleExportExcel = () => {
    const data = viewMode === 'monthly' ? monthlyStats.dailyData : yearlyStats.monthlyData;
    
    // CSV formatda eksport
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (viewMode === 'monthly') {
      csvContent += "Kun,Bajarilgan,Kutilayotgan,Jami\n";
      data.forEach(row => {
        csvContent += `${row.date},${row.completed},${row.pending},${row.total}\n`;
      });
    } else {
      csvContent += "Oy,Bajarilgan,Kutilayotgan,Jami,Bajarilish %\n";
      data.forEach(row => {
        csvContent += `${row.fullMonth || row.month},${row.completed},${row.pending},${row.total},${row.completionRate}%\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kuntartib-${viewMode}-${format(selectedDate, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="advanced-stats">
      {/* Header */}
      <div className="stats-header">
        <div className="header-left">
          <div className="header-icon">
            <TrendingUpIcon />
          </div>
          <div className="header-text">
            <h2>Kengaytirilgan Statistika</h2>
            <p>Batafsil tahlil va hisobotlar</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'monthly' ? 'active' : ''}
              onClick={() => setViewMode('monthly')}
            >
              <CalendarMonthIcon fontSize="small" />
              Oylik
            </button>
            <button 
              className={viewMode === 'yearly' ? 'active' : ''}
              onClick={() => setViewMode('yearly')}
            >
              <DateRangeIcon fontSize="small" />
              Yillik
            </button>
          </div>

          <div className="export-buttons">
            <button className="export-btn pdf" onClick={handleExportPDF}>
              <DownloadIcon fontSize="small" />
              PDF
            </button>
            <button className="export-btn excel" onClick={handleExportExcel}>
              <DownloadIcon fontSize="small" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Period Navigator */}
      <div className="period-navigator">
        <button className="nav-btn" onClick={navigatePrev}>
          <ChevronLeftIcon />
        </button>
        <div className="period-display">
          {viewMode === 'monthly' 
            ? format(selectedDate, 'MMMM yyyy', { locale: uz })
            : format(selectedDate, 'yyyy')
          }
        </div>
        <button className="nav-btn" onClick={navigateNext}>
          <ChevronRightIcon />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total">
          <div className="card-icon">
            <AssignmentIcon />
          </div>
          <div className="card-content">
            <span className="card-value">{currentStats.total}</span>
            <span className="card-label">Jami vazifalar</span>
          </div>
        </div>

        <div className="summary-card completed">
          <div className="card-icon">
            <CheckCircleIcon />
          </div>
          <div className="card-content">
            <span className="card-value">{currentStats.completed}</span>
            <span className="card-label">Bajarilgan</span>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="card-icon">
            <PendingIcon />
          </div>
          <div className="card-content">
            <span className="card-value">{currentStats.pending}</span>
            <span className="card-label">Kutilayotgan</span>
          </div>
        </div>

        <div className="summary-card rate">
          <div className="card-icon">
            <TrendingUpIcon />
          </div>
          <div className="card-content">
            <span className="card-value">{currentStats.completionRate}%</span>
            <span className="card-label">Bajarilish</span>
          </div>
        </div>
      </div>

      {/* Chart Type Tabs */}
      <div className="chart-tabs">
        <button 
          className={chartType === 'overview' ? 'active' : ''}
          onClick={() => setChartType('overview')}
        >
          <BarChartIcon fontSize="small" />
          Umumiy
        </button>
        <button 
          className={chartType === 'category' ? 'active' : ''}
          onClick={() => setChartType('category')}
        >
          <PieChartIcon fontSize="small" />
          Kategoriya
        </button>
        <button 
          className={chartType === 'priority' ? 'active' : ''}
          onClick={() => setChartType('priority')}
        >
          <PieChartIcon fontSize="small" />
          Ustuvorlik
        </button>
        <button 
          className={chartType === 'trend' ? 'active' : ''}
          onClick={() => setChartType('trend')}
        >
          <TimelineIcon fontSize="small" />
          Trend
        </button>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {chartType === 'overview' && (
          <div className="chart-section">
            <h3>
              {viewMode === 'monthly' ? 'Kunlik' : 'Oylik'} statistika
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewMode === 'monthly' ? monthlyStats.dailyData : yearlyStats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey={viewMode === 'monthly' ? 'date' : 'month'} 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="completed" name="Bajarilgan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Kutilayotgan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === 'category' && (
          <div className="chart-section">
            <h3>Kategoriya bo'yicha</h3>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentStats.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentStats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="category-legend">
                {currentStats.categoryData.map((cat, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ background: cat.color }} />
                    <span className="legend-label">{cat.name}</span>
                    <span className="legend-value">{cat.value} ta</span>
                    <span className="legend-completed">({cat.completed} bajarildi)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {chartType === 'priority' && (
          <div className="chart-section">
            <h3>Ustuvorlik bo'yicha</h3>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={viewMode === 'monthly' ? monthlyStats.priorityData : yearlyStats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(viewMode === 'monthly' ? monthlyStats.priorityData : yearlyStats.categoryData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="priority-legend">
                {(viewMode === 'monthly' ? monthlyStats.priorityData : []).map((pri, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ background: pri.color }} />
                    <span className="legend-label">{pri.name}</span>
                    <span className="legend-value">{pri.value} ta</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {chartType === 'trend' && (
          <div className="chart-section">
            <h3>Bajarilish trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viewMode === 'monthly' ? monthlyStats.dailyData : yearlyStats.monthlyData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey={viewMode === 'monthly' ? 'date' : 'month'} 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  name="Bajarilgan"
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Jami"
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Best Month (for yearly view) */}
      {viewMode === 'yearly' && yearlyStats.bestMonth && (
        <div className="best-period">
          <div className="best-icon">🏆</div>
          <div className="best-content">
            <h4>Eng samarali oy</h4>
            <p>{yearlyStats.bestMonth.fullMonth} - {yearlyStats.bestMonth.completionRate}% bajarilish</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedStats;
