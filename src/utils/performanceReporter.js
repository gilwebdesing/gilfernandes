/**
 * Performance Monitoring Utility
 * Wraps web-vitals to log metrics and analyze bundle loading.
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

const reportHandler = (metric) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Web Vitals] ${metric.name}`);
    console.log(`Value: ${metric.value}`);
    console.log(`Delta: ${metric.delta}`);
    console.log(`ID: ${metric.id}`);
    console.log(`Entries:`, metric.entries);
    console.groupEnd();
  }

  // In production, you would send this to GA4 or an endpoint
  // if (import.meta.env.PROD && window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: metric.value,
  //     event_category: 'Web Vitals',
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }
};

export const initPerformanceMonitoring = () => {
  onCLS(reportHandler);
  onFID(reportHandler);
  onLCP(reportHandler);
  onFCP(reportHandler);
  onTTFB(reportHandler);
};

export const logBundleInfo = (pageName) => {
  if (import.meta.env.DEV) {
    console.log(`[Bundle Analysis] Loaded chunk for: ${pageName}`);
    // This is a placeholder. Real bundle size analysis requires build-time tools 
    // or PerformanceResourceTiming API analysis at runtime.
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const totalJSSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
    
    console.log(`[Bundle Analysis] Total JS transferred so far: ${(totalJSSize / 1024).toFixed(2)} KB`);
  }
};