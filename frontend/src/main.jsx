import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for Android 10+ Offline-First Mining Capability
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('[KhanSuraksha] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[KhanSuraksha] Service Worker registration failed:', err);
      });
  });
}

