# 🚀 DocketChief Setup & Deployment Guide

Complete automation scripts for setting up CI/CD, secrets, monitoring, and deployment for the DocketChief application.

## Quick Start

```bash
# Run the complete setup guide
./.github/scripts/setup-complete.sh
```

This master script will walk you through:
- ✅ GitHub Secrets configuration
- ✅ Netlify deployment setup  
- ✅ Monitoring & analytics integration
- ✅ E2E testing setup
- ✅ Final validation

## Individual Setup Scripts

### 1. GitHub Secrets Setup
```bash
./.github/scripts/setup-github-secrets.sh
```
**Configures:**
- Deployment secrets (Netlify tokens, site IDs)
- Supabase configuration (URLs, keys)
- API keys (OpenAI, Stripe, CourtListener)
- Monitoring tokens (Sentry, analytics)

### 2. Netlify Deployment
```bash  
./.github/scripts/setup-netlify.sh
```
**Configures:**
- Production and staging sites
- Build settings and redirects
- Environment variables
- Custom domain setup

### 3. Monitoring Setup
```bash
./.github/scripts/setup-monitoring.sh
```
**Configures:**
- Sentry error tracking
- UptimeRobot monitoring
- Google Analytics
- Health check endpoints

### 4. Setup Validation
```bash
./.github/scripts/validate-setup.sh
```
**Validates:**
- Required files exist
- Dependencies installed
- Build process works
- GitHub/Netlify authentication
- Environment configuration

## What Gets Created

### GitHub Actions Workflow
**File:** `.github/workflows/ci-cd.yml`

**Features:**
- Lint and build validation
- E2E testing across browsers
- Automatic deployment to Netlify
- Environment-specific configurations
- Artifact collection

**Triggers:**
- Push to `main` → Production deployment
- Push to `develop` → Staging deployment  
- Pull requests → Testing only

### Configuration Files

| File | Purpose |
|------|---------|
| `netlify.toml` | Netlify build/deploy configuration |
| `playwright.config.ts` | E2E testing configuration |
| `.env.example` | Environment variables template |
| `e2e/app.spec.ts` | Sample E2E tests |

### Documentation

| File | Content |
|------|---------|
| `.github/SECRETS_SETUP.md` | GitHub secrets reference |
| `.github/MONITORING_SETUP.md` | Monitoring setup guide |
| `.github/E2E_TESTING_GUIDE.md` | Testing documentation |
| `.github/CI_CD_CUSTOMIZATION.md` | Workflow customization |

## Prerequisites

### Required Tools
- **Node.js 20+** - Runtime environment
- **npm 10+** - Package manager
- **Git** - Version control
- **GitHub CLI** (optional) - For secrets automation
- **Netlify CLI** (optional) - For deployment automation

### Required Accounts
- **GitHub** - Repository and Actions
- **Netlify** - Hosting and deployment
- **Supabase** - Backend services
- **Sentry** (optional) - Error tracking
- **UptimeRobot** (optional) - Uptime monitoring

## Environment Configuration

### Development
```bash
VITE_ENVIRONMENT=development
VITE_PAYMENTS_ENABLED=false
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### Staging
```bash
VITE_ENVIRONMENT=staging
VITE_PAYMENTS_ENABLED=false  
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
```

### Production
```bash
VITE_ENVIRONMENT=production
VITE_PAYMENTS_ENABLED=true
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

## GitHub Secrets Reference

### Deployment Secrets
```bash
NETLIFY_AUTH_TOKEN          # Netlify personal access token
NETLIFY_SITE_ID             # Production site ID
NETLIFY_STAGING_SITE_ID     # Staging site ID (optional)
```

### Supabase Configuration
```bash
VITE_SUPABASE_URL           # Public Supabase URL
VITE_SUPABASE_ANON_KEY      # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY   # Private service role key
```

### API Keys (Optional)
```bash
OPENAI_API_KEY              # AI features
STRIPE_SECRET_KEY           # Payment processing  
STRIPE_WEBHOOK_SECRET       # Stripe webhooks
COURTLISTENER_API_TOKEN     # Legal data
VITE_SENTRY_DSN            # Error tracking
SENTRY_AUTH_TOKEN          # Source map uploads
```

## Manual Setup Steps

If you prefer manual setup over automation scripts:

### 1. GitHub Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets from the reference above
3. Test with a small commit to trigger workflow

### 2. Netlify Site
1. Connect GitHub repository in Netlify dashboard
2. Configure build settings: `npm run build`, publish `dist/`
3. Add environment variables in site settings
4. Set up custom domain (optional)

### 3. Monitoring Services
1. **Sentry**: Create project, get DSN, add to secrets
2. **UptimeRobot**: Add monitors for main site and health endpoints
3. **Analytics**: Configure GA4 or PostHog tracking

## Testing Your Setup

### Local Testing
```bash
# Install and test build
npm install
npm run build
npm run lint

# Test E2E (requires build)
npm run test:e2e

# Run development server
npm run dev
```

### Deployment Testing
```bash
# Test production build
npm run build
npm run preview

# Manual Netlify deploy
netlify deploy --build --prod

# Trigger CI/CD
git push origin main
```

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check for missing dependencies
npm install

# Verify environment variables
cat .env.example

# Test build locally
npm run build
```

**Deployment Failures:**
```bash  
# Check GitHub Actions logs
# Verify secrets are set correctly
# Test Netlify CLI deployment

netlify deploy --build
```

**E2E Test Failures:**
```bash
# Install Playwright browsers
npx playwright install

# Run tests in debug mode
npm run test:e2e:debug

# Check test configuration
cat playwright.config.ts
```

### Getting Help

1. **Check workflow logs** in GitHub Actions tab
2. **Review documentation** in `.github/` folder  
3. **Run validation script** to identify issues
4. **Test components individually** using manual commands

## Maintenance

### Regular Tasks
- **Weekly**: Review monitoring alerts and uptime reports
- **Monthly**: Update dependencies and security patches  
- **Quarterly**: Review and rotate API keys and tokens

### Updates
- **Dependencies**: `npm update` and test thoroughly
- **Secrets**: Rotate sensitive keys regularly
- **Monitoring**: Adjust alert thresholds based on usage

## Security Best Practices

1. **Never commit secrets** - Use `.env` files locally, secrets in CI
2. **Use environment-specific keys** - Different keys for dev/staging/prod
3. **Rotate keys regularly** - Set calendar reminders for key rotation
4. **Monitor access** - Review who has access to secrets and services
5. **Least privilege** - Grant minimum required permissions

---

## Support

For issues with this setup:
1. Check the validation script output
2. Review relevant documentation files
3. Test individual components manually
4. Check service-specific documentation (GitHub, Netlify, etc.)

*Last updated: November 2024*