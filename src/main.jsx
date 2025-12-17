import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// React 18+ usuli - createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Hot Module Replacement (HMR) - Developmentda yangilash uchun
if (import.meta.hot) {
  import.meta.hot.accept();
}

// ✅ Performance monitoring
if (import.meta.env.DEV) {
  console.log('🚀 Kun Tartibi Dasturi ishga tushdi!');
  console.log('📅 Vite + React 18');
}

// Service Worker (offline mode) faollashtirish
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker ro‘yxatdan o‘tdi:', reg.scope);
      })
      .catch(err => {
        console.warn('❌ Service Worker xatosi:', err);
      });
  });
}