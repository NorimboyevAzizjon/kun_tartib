import React from 'react';
import './ErrorBoundary.css';

// MUI Icons
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (could send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ 
      error, 
      errorInfo 
    });

    // Optional: Send to error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  handleClearAndRefresh = () => {
    // Clear potentially corrupted data
    try {
      localStorage.removeItem('kun-tartibi-tasks');
      localStorage.removeItem('kuntartib-token');
      localStorage.removeItem('kuntartib-user');
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <ErrorOutlineIcon />
            </div>
            
            <h1>Xatolik yuz berdi</h1>
            <p className="error-message">
              Kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting.
            </p>

            <div className="error-actions">
              <button className="error-btn primary" onClick={this.handleRefresh}>
                <RefreshIcon />
                Sahifani yangilash
              </button>
              
              <button className="error-btn secondary" onClick={this.handleGoHome}>
                <HomeIcon />
                Bosh sahifaga
              </button>
            </div>

            <button 
              className="error-btn text" 
              onClick={this.handleToggleDetails}
            >
              <BugReportIcon />
              {this.state.showDetails ? 'Tafsilotlarni yashirish' : 'Tafsilotlarni ko\'rish'}
            </button>

            {this.state.showDetails && (
              <div className="error-details">
                <h3>Xatolik tafsilotlari:</h3>
                <pre className="error-stack">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
                
                <button 
                  className="error-btn danger"
                  onClick={this.handleClearAndRefresh}
                >
                  Ma'lumotlarni tozalab, qayta boshlash
                </button>
                <p className="error-warning">
                  ⚠️ Bu tugma vazifalar va sozlamalarni o'chiradi
                </p>
              </div>
            )}

            <p className="error-hint">
              Agar muammo davom etsa, sahifani bir necha marta yangilab ko'ring 
              yoki brauzer keshini tozalang.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
