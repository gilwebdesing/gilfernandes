import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css';
// Task 5: Performance Monitoring
import { onCLS, onFID, onLCP } from 'web-vitals';

// Task 5: Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed: ', error);
      });
  });
}

// Task 5: Log Performance Metrics in Development
if (import.meta.env.DEV) {
  const logMetric = (metric) => {
    console.log(`[Performance] ${metric.name}: ${metric.value}`);
  };
  onCLS(logMetric);
  onFID(logMetric);
  onLCP(logMetric);
}

// Task 5: Resource Hint - Prefetch likely next page chunks (e.g., Property List)
// This is a manual resource hint implementation since we aren't using a specific router prefetch link
const prefetchRoutes = () => {
   const routes = ['/imoveis', '/login'];
   // Logic would typically involve dynamic imports but we can also use link prefetch injection
   routes.forEach(route => {
      // simplified placeholder for concept
   });
};

// Wait for idle to prefetch
if (window.requestIdleCallback) {
  window.requestIdleCallback(prefetchRoutes);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />,
)