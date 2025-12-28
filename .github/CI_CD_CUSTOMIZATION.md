# CI/CD Workflow Customization Guide

This document explains how to customize the GitHub Actions CI/CD pipeline for your specific needs.

## Current Workflow Overview

The `.github/workflows/ci-cd.yml` pipeline includes:

### Jobs Structure
1. **`test`** - Lint, build validation, artifact creation
2. **`e2e-tests`** - End-to-end testing (PR only)  
3. **`deploy-netlify`** - Production deployment (main branch)
4. **`deploy-staging`** - Staging deployment (develop branch)

## Common Customizations

### 1. Adding New Branches

To deploy from additional branches:

```yaml
# Add to deploy-netlify job condition
if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/release'

# Or create new job for specific branch
deploy-release:
  name: 🚀 Deploy Release Candidate
  runs-on: ubuntu-latest
  needs: test
  if: github.ref == 'refs/heads/release'
  environment: staging
  # ... rest of deployment steps
```

### 2. Environment-Specific Configurations

Current environments:
- **Production** (`main` branch)
- **Staging** (`develop` branch)
- **Preview** (PR deployments)

To add new environment:

```yaml
deploy-qa:
  name: 🧪 Deploy to QA
  environment: qa
  if: github.ref == 'refs/heads/qa'
  steps:
    # ... build steps
    - name: 🏗️ Build application
      run: npm run build
      env:
        VITE_ENVIRONMENT: "qa"
        VITE_PAYMENTS_ENABLED: "false"
        VITE_SUPABASE_URL: ${{ secrets.QA_SUPABASE_URL }}
```

### 3. Adding Unit Tests

If you add a test framework:

```yaml
# Add to the test job after lint
- name: 🧪 Run unit tests
  run: npm test

- name: 📊 Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### 4. Adding Database Migrations

For Supabase migrations:

```yaml
migrate:
  name: 📊 Run Database Migrations
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - name: Run Supabase migrations
      run: |
        npx supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        npx supabase db push
```

### 5. Slack/Teams Notifications

Add notification steps:

```yaml
- name: 📢 Notify deployment
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "✅ DocketChief deployed to production"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

- name: 📢 Notify failure  
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "❌ DocketChief deployment failed"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 6. Security Scanning

Add security checks:

```yaml
security:
  name: 🔒 Security Scan
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run security audit
      run: npm audit --audit-level high
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/init@v2
      with:
        languages: javascript
```

### 7. Performance Testing

Add Lighthouse CI:

```yaml
lighthouse:
  name: 🚨 Performance Audit
  runs-on: ubuntu-latest
  needs: deploy-netlify
  steps:
    - uses: actions/checkout@v4
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 8. Multi-Cloud Deployment

Deploy to both Netlify and Vercel:

```yaml
deploy-vercel:
  name: 🚀 Deploy to Vercel  
  runs-on: ubuntu-latest
  needs: test
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## Environment Variables by Environment

### Development
```bash
VITE_ENVIRONMENT=development
VITE_PAYMENTS_ENABLED=false
VITE_SUPABASE_URL=https://dev-project.supabase.co
```

### Staging
```bash
VITE_ENVIRONMENT=staging  
VITE_PAYMENTS_ENABLED=false
VITE_SUPABASE_URL=https://staging-project.supabase.co
```

### Production
```bash
VITE_ENVIRONMENT=production
VITE_PAYMENTS_ENABLED=true
VITE_SUPABASE_URL=https://prod-project.supabase.co
```

## Required Secrets by Job

### All Jobs
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 

### Deployment Jobs
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `NETLIFY_STAGING_SITE_ID` (staging)

### Optional Enhancements
- `SENTRY_AUTH_TOKEN` (source map upload)
- `SLACK_WEBHOOK_URL` (notifications)
- `CODECOV_TOKEN` (coverage upload)

## Workflow Triggers

### Current Triggers
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
```

### Additional Trigger Options

**Schedule-based deployments:**
```yaml
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6 AM
```

**Manual deployments:**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

**Tag-based releases:**
```yaml
on:
  push:
    tags:
      - 'v*'  # Triggers on version tags like v1.2.3
```

## Performance Optimizations

### 1. Dependency Caching
Already implemented with:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### 2. Parallel Jobs
Enable job parallelization:
```yaml
strategy:
  matrix:
    environment: [staging, production]
```

### 3. Skip Redundant Builds
Skip builds for docs-only changes:
```yaml
- name: Check for changes
  uses: dorny/paths-filter@v2
  id: changes
  with:
    filters: |
      src:
        - 'src/**'
        - 'package*.json'
```

## Monitoring Integration

### 1. Sentry Release Tracking
```yaml
- name: Create Sentry release
  run: |
    curl -sL https://sentry.io/get-cli/ | bash
    sentry-cli releases new ${{ github.sha }}
    sentry-cli releases set-commits ${{ github.sha }} --auto
```

### 2. Datadog Deployment Tracking
```yaml
- name: Notify Datadog
  run: |
    curl -X POST "https://api.datadoghq.com/api/v1/events" \
    -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
    -d '{
      "title": "DocketChief Deployment",
      "text": "Deployed commit ${{ github.sha }}",
      "tags": ["environment:production","service:docketchief"]
    }'
```

## Rollback Strategy

Add rollback capability:
```yaml
rollback:
  name: 🔄 Rollback Deployment
  runs-on: ubuntu-latest
  if: failure()
  needs: deploy-netlify
  steps:
    - name: Rollback to previous deployment
      run: |
        # Implement rollback logic
        echo "Rolling back deployment..."
```

## Testing Different Node Versions

```yaml
test:
  strategy:
    matrix:
      node-version: [18, 20, 22]
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

## Customization Checklist

- [ ] Review environment configurations
- [ ] Add required secrets for new features
- [ ] Configure notification channels  
- [ ] Set up monitoring integrations
- [ ] Test rollback procedures
- [ ] Document any custom workflows
- [ ] Update team on workflow changes

## Best Practices

1. **Keep jobs focused** - Each job should have a single responsibility
2. **Use environments** - Protect production with required reviewers
3. **Fail fast** - Run quick checks (lint, test) before expensive operations
4. **Cache dependencies** - Speed up builds with appropriate caching
5. **Secure secrets** - Use environment-specific secrets, never hardcode
6. **Monitor everything** - Add logging and notifications for visibility

## Troubleshooting Common Issues

### Build Failures
```bash
# Debug locally
npm run build 2>&1 | tee build.log

# Check for missing environment variables
grep -r "process.env\|import.meta.env" src/
```

### Deployment Failures
```bash
# Test Netlify deployment locally
netlify deploy --build --prod

# Check environment variables
netlify env:list
```

### E2E Test Failures
```bash
# Run tests with debugging
npm run test:e2e:debug

# Check for flaky tests
npm run test:e2e -- --repeat-each=3
```

---
*Last updated: November 2024*
*Customize this workflow based on your team's specific needs and deployment requirements*