# CI/CD Configuration Guide

This document describes the CI/CD setup for Docket Chief and the required configuration for deployment.

## Overview

The CI/CD pipeline is configured using GitHub Actions and includes:
- **Linting**: Code quality checks
- **Building**: Production builds
- **E2E Testing**: Playwright end-to-end tests
- **Deployment**: Automated deployment to Netlify
- **Health Checks**: Post-deployment verification
- **Monitoring**: Automated issue creation on failures

## Required GitHub Secrets

To enable the full CI/CD pipeline, you need to configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Netlify Deployment Secrets

1. **NETLIFY_AUTH_TOKEN** (Required)
   - Description: Personal access token for Netlify API
   - How to obtain:
     1. Log in to Netlify (https://app.netlify.com)
     2. Go to User Settings > Applications
     3. Click "New access token"
     4. Give it a descriptive name (e.g., "GitHub Actions CI/CD")
     5. Copy the generated token
   - Example: `nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **NETLIFY_SITE_ID** (Required)
   - Description: The unique ID of your Netlify site
   - How to obtain:
     1. Log in to Netlify
     2. Navigate to your site
     3. Go to Site settings > General
     4. Find "Site ID" under "Site information"
   - Example: `12345678-1234-1234-1234-123456789abc`

### Supabase Environment Variables

3. **VITE_SUPABASE_URL** (Required)
   - Description: Your Supabase project URL
   - How to obtain:
     1. Log in to Supabase (https://supabase.com)
     2. Go to Project Settings > API
     3. Find "Project URL"
   - Example: `https://xxxxxxxxxxxxx.supabase.co`

4. **VITE_SUPABASE_ANON_KEY** (Required)
   - Description: Your Supabase anonymous/public API key
   - How to obtain:
     1. Log in to Supabase
     2. Go to Project Settings > API
     3. Find "anon" key under "Project API keys"
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Optional Secrets

5. **VITE_APP_NAME** (Optional)
   - Description: Application name
   - Default: "Docket Chief"

6. **VITE_ENVIRONMENT** (Automatic)
   - Description: Set automatically based on branch
   - Values: `production` (main branch) or `development` (other branches)

7. **VITE_PAYMENTS_ENABLED** (Optional)
   - Description: Enable/disable payment features
   - Default: "false"
   - Values: "true" or "false"

8. **PRODUCTION_URL** (Optional)
   - Description: Your production site URL for health checks
   - Default: "https://docketchief.com"
   - Example: `https://yourdomain.com`

## Setting Up GitHub Secrets

### Step-by-Step Guide

1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret** button
5. Enter the secret name (e.g., `NETLIFY_AUTH_TOKEN`)
6. Paste the secret value
7. Click **Add secret**
8. Repeat for all required secrets

### Verification

After adding all secrets, you can verify they are configured correctly:
1. Go to **Settings** > **Secrets and variables** > **Actions**
2. You should see all the secret names listed (values are hidden for security)
3. Ensure no typos in secret names (they are case-sensitive)

## Configuring Supabase Environment Variables

### In Netlify

If you're using Netlify for hosting, also configure environment variables in Netlify:

1. Log in to Netlify
2. Go to your site
3. Navigate to **Site settings** > **Environment variables**
4. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME` (optional)
   - `VITE_PAYMENTS_ENABLED` (optional)

### Local Development

For local development, copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=Docket Chief
VITE_ENVIRONMENT=development
VITE_PAYMENTS_ENABLED=false
```

**Note**: Never commit `.env` file to version control!

## Running E2E Tests Locally

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

### Running Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

View test report:
```bash
npm run test:e2e:report
```

### Test Structure

Tests are located in the `e2e/` directory:
- `e2e/health.spec.ts` - Application health checks
- `e2e/navigation.spec.ts` - Navigation and routing tests

## CI/CD Workflow Details

### Workflow Triggers

The pipeline runs on:
- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches
- **Manual trigger** via GitHub Actions UI

### Workflow Jobs

1. **Lint** (Always runs)
   - Runs ESLint to check code quality
   - Fails if linting errors are found

2. **Build** (Runs after lint)
   - Builds production bundle
   - Uses Supabase secrets from GitHub
   - Uploads build artifacts

3. **E2E Tests** (Runs after build)
   - Downloads build artifacts
   - Installs Playwright browsers
   - Runs E2E test suite
   - Uploads test reports

4. **Deploy to Netlify** (Runs after tests, only on push)
   - Downloads build artifacts
   - Deploys to Netlify
   - Creates deployment comments on PRs
   - Uses production environment for main branch
   - Uses staging environment for develop branch

5. **Health Check** (Runs after deployment, only on main)
   - Waits for deployment to be ready
   - Performs HTTP health check
   - Creates GitHub issue if health check fails

## Customizing the CI/CD Workflow

The workflow file is located at `.github/workflows/ci-cd.yml`.

### Common Customizations

#### Change Node Version
Edit the `NODE_VERSION` environment variable:
```yaml
env:
  NODE_VERSION: '20'  # Change to your preferred version
```

#### Modify Test Browsers
Edit `playwright.config.ts` to enable/disable browsers:
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },  // Commented out
],
```

#### Adjust Retry Logic
In `playwright.config.ts`:
```typescript
retries: process.env.CI ? 2 : 0,  // Change retry count
```

#### Skip Deployment
Comment out the `deploy-netlify` job in `.github/workflows/ci-cd.yml`

## Monitoring and Alerting

### Automated Monitoring

The workflow includes:
- Health checks after production deployments
- Automatic issue creation on failures
- Test result artifacts for debugging

### Setting Up Additional Monitoring

For production monitoring, consider:

1. **Netlify Analytics**
   - Enable in Netlify dashboard
   - Track page views and performance

2. **Supabase Monitoring**
   - View database performance in Supabase dashboard
   - Set up database alerts

3. **External Monitoring Services**
   - [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
   - [Pingdom](https://www.pingdom.com/) - Advanced monitoring
   - [Better Uptime](https://betteruptime.com/) - Status pages and alerts

4. **Error Tracking**
   - [Sentry](https://sentry.io/) - Error tracking and performance
   - [LogRocket](https://logrocket.com/) - Session replay and monitoring

### Notification Setup

Configure GitHub notifications:
1. Go to your repository
2. Click **Watch** button
3. Select **Custom** > **Issues** to get notified of deployment failures

## Troubleshooting

### Deployment Fails

1. **Check secrets are configured**
   - Verify all required secrets are set in GitHub
   - Ensure no typos in secret names

2. **Check Netlify configuration**
   - Verify `NETLIFY_AUTH_TOKEN` is valid
   - Verify `NETLIFY_SITE_ID` is correct

3. **View deployment logs**
   - Go to GitHub Actions tab
   - Click on the failed workflow
   - Expand the failed step to see logs

### E2E Tests Fail

1. **Run tests locally**
   ```bash
   npm run build
   npm run test:e2e:headed
   ```

2. **Check test artifacts**
   - Download `playwright-report` from GitHub Actions
   - Open `index.html` to view detailed results

3. **Update tests**
   - Tests may need updates if UI changes
   - Check for timing issues or flaky tests

### Build Fails

1. **Check for TypeScript errors**
   ```bash
   npm run lint
   ```

2. **Verify environment variables**
   - Ensure all required `VITE_*` variables are set

3. **Clear cache and rebuild**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use separate keys** for development and production
4. **Limit secret access** to necessary team members only
5. **Monitor secret usage** in GitHub and Netlify logs
6. **Enable 2FA** on all service accounts

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify Deploy Documentation](https://docs.netlify.com/site-deploys/overview/)
- [Playwright Documentation](https://playwright.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
