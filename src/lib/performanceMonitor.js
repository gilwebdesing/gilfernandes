/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and performance metrics.
 */

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onLCP }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onLCP(onPerfEntry);
    });
  }
};

export const logPerformance = () => {
  if (import.meta.env.DEV) {
    // Only log in development
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`[Performance] ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      });
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    } catch (e) {
      console.warn('PerformanceObserver not supported.');
    }
  }
};