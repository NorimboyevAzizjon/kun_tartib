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
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Kun Tartibi Dasturi ishga tushdi!');
  console.log('📅 Vite + React 18');
}