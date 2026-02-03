import React from 'react';
import './ErrorBoundary.css';

// MUI Icons
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
      errorId: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error, errorInfo) {
    // ✅ Enhanced error logging
    const errorLog = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('ErrorBoundary caught an error:', errorLog);
    
    this.setState({ 
      error, 
      errorInfo 
    });

    // ✅ Save error to localStorage for debugging
    try {
      const errorHistory = JSON.parse(localStorage.getItem('kuntartib-error-history') || '[]');
      errorHistory.unshift(errorLog);
      // Keep only last 10 errors
      if (errorHistory.length > 10) errorHistory.pop();
      localStorage.setItem('kuntartib-error-history', JSON.stringify(errorHistory));
    } catch (e) {
      console.warn('Could not save error to localStorage:', e);
    }

    // ✅ Optional: Send to error reporting service (Sentry, etc.)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorLog });
    // }
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

  handleCopyError = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
Error: ${this.state.error?.toString()}
Component Stack: ${this.state.errorInfo?.componentStack || 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  handleClearAndRefresh = () => {
    // Clear potentially corrupted data
    try {
      localStorage.removeItem('kun-tartibi-tasks');
      localStorage.removeItem('kuntartib-token');
      localStorage.removeItem('kuntartib-user');
      localStorage.removeItem('kuntartib-goals');
      localStorage.removeItem('kuntartib-notes');
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    window.location.href = '/login';
  };

  handleTryAgain = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-content">
            <div className="error-icon" aria-hidden="true">
              <ErrorOutlineIcon />
            </div>
            
            <h1 id="error-title">Xatolik yuz berdi</h1>
            <p className="error-message" aria-describedby="error-title">
              Kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting.
            </p>
            
            {this.state.errorId && (
              <p className="error-id">
                <ReportProblemIcon fontSize="small" />
                Xatolik ID: <code>{this.state.errorId}</code>
              </p>
            )}

            <div className="error-actions">
              <button 
                className="error-btn primary" 
                onClick={this.handleTryAgain}
                aria-label="Qayta urinish"
              >
                <RefreshIcon aria-hidden="true" />
                Qayta urinish
              </button>
              
              <button 
                className="error-btn secondary" 
                onClick={this.handleRefresh}
                aria-label="Sahifani yangilash"
              >
                <RefreshIcon aria-hidden="true" />
                Sahifani yangilash
              </button>
              
              <button 
                className="error-btn secondary" 
                onClick={this.handleGoHome}
                aria-label="Bosh sahifaga o'tish"
              >
                <HomeIcon aria-hidden="true" />
                Bosh sahifaga
              </button>
            </div>

            <button 
              className="error-btn text" 
              onClick={this.handleToggleDetails}
              aria-expanded={this.state.showDetails}
              aria-controls="error-details"
            >
              <BugReportIcon aria-hidden="true" />
              {this.state.showDetails ? 'Tafsilotlarni yashirish' : 'Tafsilotlarni ko\'rish'}
            </button>

            {this.state.showDetails && (
              <div className="error-details" id="error-details">
                <div className="error-details-header">
                  <h3>Xatolik tafsilotlari:</h3>
                  <button 
                    className="error-btn copy-btn"
                    onClick={this.handleCopyError}
                    aria-label="Xatolikni nusxalash"
                  >
                    <ContentCopyIcon fontSize="small" aria-hidden="true" />
                    {this.state.copied ? 'Nusxalandi!' : 'Nusxalash'}
                  </button>
                </div>
                
                <pre className="error-stack" aria-label="Xatolik stack trace">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
                
                <button 
                  className="error-btn danger"
                  onClick={this.handleClearAndRefresh}
                  aria-label="Ma'lumotlarni tozalab, qayta boshlash"
                >
                  Ma'lumotlarni tozalab, qayta boshlash
                </button>
                <p className="error-warning" role="alert">
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
