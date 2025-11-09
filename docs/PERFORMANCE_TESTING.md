# Performance Testing Guide

Guide for performance testing and optimization in DocketChief.

## Table of Contents

1. [Overview](#overview)
2. [Performance Metrics](#performance-metrics)
3. [Testing Tools](#testing-tools)
4. [Lighthouse CI](#lighthouse-ci)
5. [Load Testing](#load-testing)
6. [Optimization Strategies](#optimization-strategies)

---

## Overview

Performance testing ensures DocketChief remains fast and responsive under various conditions.

### Performance Goals

- **Time to Interactive (TTI)**: < 3.5s
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 200ms

---

## Performance Metrics

### Core Web Vitals

1. **Largest Contentful Paint (LCP)**
   - Measures loading performance
   - Target: < 2.5 seconds

2. **First Input Delay (FID)**
   - Measures interactivity
   - Target: < 100 milliseconds

3. **Cumulative Layout Shift (CLS)**
   - Measures visual stability
   - Target: < 0.1

### Additional Metrics

- **Time to First Byte (TTFB)**
- **Time to Interactive (TTI)**
- **Speed Index**
- **Total Bundle Size**

---

## Testing Tools

### 1. Lighthouse

Built-in browser tool for performance auditing.

#### Using Lighthouse

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --output=html --output-path=./lighthouse-report.html

# Run with specific categories
lighthouse https://your-app.com --only-categories=performance,accessibility
```

#### In DevTools

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Performance"
4. Click "Analyze page load"

### 2. Web Vitals Library

Monitor real user metrics.

```bash
npm install web-vitals
```

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Bundle Analyzer

Analyze bundle size and composition.

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true,
    }),
  ],
});
```

### 4. WebPageTest

Online tool for detailed performance analysis.

Visit: https://www.webpagetest.org/

---

## Lighthouse CI

Automate performance testing in CI/CD pipeline.

### Setup

```bash
npm install -D @lhci/cli
```

### Configuration

Create `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Run Lighthouse CI

```bash
# Local
npx lhci autorun

# In CI/CD
lhci autorun --collect.settings.chromeFlags="--no-sandbox"
```

### GitHub Actions Integration

Add to `.github/workflows/ci-cd.yml`:

```yaml
lighthouse:
  name: Lighthouse CI
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
```

---

## Load Testing

Test application under high load.

### Using Apache Bench (ab)

```bash
# Install
sudo apt-get install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 https://your-app.com/

# With POST data
ab -n 100 -c 10 -p data.json -T application/json https://your-app.com/api/endpoint
```

### Using Artillery

```bash
# Install
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: 'https://your-app.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load

scenarios:
  - name: Homepage
    flow:
      - get:
          url: "/"
  - name: API endpoint
    flow:
      - post:
          url: "/api/chat"
          json:
            message: "Test message"
EOF

# Run test
artillery run load-test.yml

# Generate report
artillery run load-test.yml --output report.json
artillery report report.json
```

### Using k6

```bash
# Install
brew install k6  # macOS
# or download from https://k6.io/

# Create test script
cat > load-test.js << EOF
import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  http.get('https://your-app.com');
  sleep(1);
}
EOF

# Run test
k6 run load-test.js
```

---

## Optimization Strategies

### 1. Code Splitting

Already configured in Vite:

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Use in router
<Route path="/dashboard" element={
  <Suspense fallback={<Loading />}>
    <Dashboard />
  </Suspense>
} />
```

### 2. Image Optimization

```bash
# Install image optimization
npm install -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      }
    })
  ]
});
```

### 3. Lazy Loading

```typescript
// Lazy load images
<img src={imageSrc} loading="lazy" alt="..." />

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 4. Memoization

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### 5. Virtual Scrolling

For long lists:

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

### 6. Debouncing & Throttling

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => {
    performSearch(query);
  }, 300),
  []
);
```

### 7. Service Worker

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### 8. Compression

Enable in hosting platform:

**Netlify** (netlify.toml):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Encoding = "gzip"
```

**Vercel** (vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### 9. Prefetching

```typescript
// Prefetch next page
<Link to="/dashboard" rel="prefetch">Dashboard</Link>

// Preload critical resources
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin />
```

### 10. Database Query Optimization

- Use indexed columns
- Limit query results
- Use proper joins
- Cache frequently accessed data
- Implement pagination

---

## Monitoring in Production

### 1. Real User Monitoring (RUM)

```typescript
// src/monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. Performance Observer

```typescript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['navigation', 'resource'] });
```

### 3. Error Tracking

```typescript
window.addEventListener('error', (event) => {
  // Log to error tracking service
  logError({
    message: event.message,
    stack: event.error?.stack,
    url: event.filename,
    line: event.lineno,
  });
});
```

---

## Performance Budget

Set and enforce performance budgets:

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'resource-summary:script:size': ['error', { maxNumericValue: 300000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)

---

## Checklist

- [ ] Run Lighthouse audit (score > 90)
- [ ] Measure Core Web Vitals
- [ ] Check bundle size
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Enable compression
- [ ] Implement caching
- [ ] Optimize images
- [ ] Lazy load non-critical resources
- [ ] Set up performance monitoring
