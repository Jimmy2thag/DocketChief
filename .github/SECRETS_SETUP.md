# GitHub Secrets Setup for DocketChief

This document outlines the required GitHub secrets for CI/CD deployment and production configuration.

## Required Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret.

### Deployment Secrets

#### Netlify Deployment
- **NETLIFY_AUTH_TOKEN**: Personal access token from Netlify
  - Get from: Netlify Dashboard → User Settings → Applications → Personal access tokens
  - Permissions: Full access to deploy sites

- **NETLIFY_SITE_ID**: Site ID for your Netlify app
  - Get from: Netlify site dashboard → Site settings → General → Site details

#### Vercel Deployment (Alternative)
- **VERCEL_TOKEN**: Vercel access token
  - Get from: Vercel Dashboard → Settings → Tokens
- **VERCEL_ORG_ID**: Organization ID
- **VERCEL_PROJECT_ID**: Project ID

### Supabase Configuration
- **VITE_SUPABASE_URL**: Your Supabase project URL
  - Format: `https://your-project-id.supabase.co`
  - Get from: Supabase Dashboard → Settings → API

- **VITE_SUPABASE_ANON_KEY**: Supabase anonymous/public key
  - Get from: Supabase Dashboard → Settings → API → Project API keys

- **SUPABASE_SERVICE_ROLE_KEY**: Service role key (for server-side operations)
  - Get from: Supabase Dashboard → Settings → API → Project API keys
  - ⚠️ **Keep this secret** - never expose in client code

### Optional API Keys
- **OPENAI_API_KEY**: OpenAI API key for AI features
  - Get from: OpenAI Platform → API keys

- **STRIPE_SECRET_KEY**: Stripe secret key for payment processing
  - Get from: Stripe Dashboard → Developers → API keys

- **STRIPE_WEBHOOK_SECRET**: Stripe webhook endpoint secret
  - Get from: Stripe Dashboard → Developers → Webhooks → endpoint details

- **COURTLISTENER_API_TOKEN**: CourtListener API token for legal data
  - Get from: CourtListener → Account → API Access

## Environment-Specific Variables

### Production
```bash
VITE_ENVIRONMENT=production
VITE_PAYMENTS_ENABLED=true
ALLOWED_ORIGINS=https://docketchief.com,https://www.docketchief.com
```

### Staging
```bash
VITE_ENVIRONMENT=staging  
VITE_PAYMENTS_ENABLED=false
ALLOWED_ORIGINS=https://staging-docketchief.netlify.app
```

## Setup Instructions

1. **Copy secrets from local development**:
   - If you have a working local `.env` file, copy the values to GitHub secrets

2. **Set up Netlify deployment**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login and get site info
   netlify login
   netlify sites:list
   ```

3. **Verify secret setup**:
   - Secrets should not be visible in logs
   - Test deployment with a small change
   - Check that environment variables are properly injected

## Security Notes

- Never commit real secrets to the repository
- Use different keys for development, staging, and production
- Rotate API keys periodically
- Monitor secret usage in GitHub Actions logs
- Use least-privilege principle for API keys

## Troubleshooting

### Common Issues
- **Build fails with "undefined" environment variables**: Check secret names match exactly
- **CORS errors**: Verify ALLOWED_ORIGINS includes your deployment domain
- **Supabase connection fails**: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly

### Validation Commands
```bash
# Test build with secrets
npm run build

# Verify environment variables are loaded
npm run dev
# Check browser console/network tab for proper API URLs
```

---
*Last updated: November 2024*
*Update this document when adding new secrets or changing deployment setup*