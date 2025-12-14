import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

// MUI Icons
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // Validatsiya
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Barcha maydonlarni to\'ldiring');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Parol kamida 6 ta belgi bo\'lsin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Parollar mos kelmadi');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
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
            <div className="brand-logo"><CalendarMonthOutlinedIcon style={{ fontSize: 64 }} /></div>
            <h1>KunTartib</h1>
            <p>Yangi hisob yarating va samarali ishni boshlang</p>
            
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon"><LockOutlinedIcon /></span>
                <span>Xavfsiz va ishonchli</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><CloudOutlinedIcon /></span>
                <span>Cloud sync</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon"><DevicesOutlinedIcon /></span>
                <span>Har qanday qurilmada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Ro'yxatdan o'tish</h2>
              <p>Bepul hisob yarating</p>
            </div>

            {(formError || error) && (
              <div className="auth-error">
                <span className="error-icon"><WarningAmberOutlinedIcon fontSize="small" /></span>
                {formError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">
                  <span className="label-icon"><PersonOutlinedIcon fontSize="small" /></span>
                  Ismingiz
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ism Familiya"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon"><EmailOutlinedIcon fontSize="small" /></span>
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
                  <span className="label-icon"><LockOutlinedIcon fontSize="small" /></span>
                  Parol
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kamida 6 ta belgi"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon"><LockOpenOutlinedIcon fontSize="small" /></span>
                  Parolni tasdiqlang
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Parolni qayta kiriting"
                  autoComplete="new-password"
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <AutoAwesomeOutlinedIcon fontSize="small" />
                    Ro'yxatdan o'tish
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>yoki</span>
            </div>

            <div className="auth-footer">
              <p>
                Hisobingiz bormi?{' '}
                <Link to="/login" className="auth-link">
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
