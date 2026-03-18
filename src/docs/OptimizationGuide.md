# Optimization Guide

## Changes Implemented

### 1. Script Loading Strategy (`src/utils/scriptLoader.js`)
- **Dynamic Loading**: GA4 and other non-critical scripts are now removed from `index.html` and loaded via JS.
- **Trigger**: Scripts load only after user interaction (scroll/click) or a 4-second timeout.
- **Benefit**: Drastically reduces Total Blocking Time (TBT) and speeds up Time to Interactive (TTI).

### 2. Image Optimization (`src/components/ImageOptimizer.jsx`)
- **WebP Support**: Automatically generates Unsplash-optimized WebP URLs with JPEG fallbacks.
- **Responsive Srcset**: Generates sizes for mobile (480w), tablet (800w), and desktop (1200w+).
- **Lazy Loading**: Uses `IntersectionObserver` to load images only when they near the viewport.
- **LCP Handling**: The Hero image uses `priority={true}` to preload and skip lazy loading logic.

### 3. Home Page Optimization
- **Critical CSS**: Critical styles inlined in `index.html`.
- **Preload**: Hero image is preloaded in `index.html` headers.
- **Code Splitting**: `PropertyCard` and other below-fold components are lazy loaded.

### 4. Listing Page Optimization
- **Batch Rendering**: Instead of rendering all 50+ properties, we render 12 initially and load more on demand.
- **Debouncing**: Filter sliders and inputs are debounced to prevent render trashing.
- **Lazy Map**: The map modal is lazy loaded to avoid loading Leaflet JS on initial page load.

### 5. Detail Page Optimization
- **Lazy Media**: Gallery carousel, video embeds, and virtual tours are lazy loaded or require interaction to load heavy iframes.
- **First Image Priority**: The first image in the gallery is prioritized for LCP.

## Performance Metrics (Estimates)

| Metric | Before | After |
|--------|--------|-------|
| **LCP** | ~2.5s | ~1.2s |
| **FCP** | ~1.8s | ~0.8s |
| **TBT** | High | Low |
| **CLS** | Moderate | 0 |

## Bundle Breakdown
- **Vendor**: React, Radix, Lucide (cached long-term).
- **Home**: Only contains Hero logic + lightweight initializers.
- **Listing**: Contains filter logic + cards.
- **Detail**: Contains carousel + heavy media wrappers.

## Troubleshooting
- **Images not loading?** Check `ImageOptimizer` logic. It currently assumes Unsplash URLs for transformation. If using Supabase Storage, ensure the public URL is correct.
- **Analytics missing?** Verify `G-7H7JW6QF5H` in `scriptLoader.js`. Note that events are only captured *after* user interaction now.