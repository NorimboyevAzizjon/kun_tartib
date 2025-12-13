import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setFormError('Barcha maydonlarni to\'ldiring');
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <div className="brand-logo">📅</div>
            <h1>KunTartib</h1>
            <p>Vaqtingizni samarali boshqaring va maqsadlaringizga erishing</p>
            
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Vazifalarni oson boshqaring</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Statistikalarni kuzating</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Maqsadlaringizga erishing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Kirish</h2>
              <p>Hisobingizga kiring va davom eting</p>
            </div>

            {(formError || error) && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Parol
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Kirilmoqda...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Kirish
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>yoki</span>
            </div>

            <div className="auth-footer">
              <p>
                Hisobingiz yo'qmi?{' '}
                <Link to="/register" className="auth-link">
                  Ro'yxatdan o'ting
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
