# Deployment Guide

Complete guide for deploying DocketChief to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Platforms](#deployment-platforms)
4. [Database Setup](#database-setup)
5. [Edge Functions](#edge-functions)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Post-Deployment](#post-deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 20+ installed
- ✅ Git repository access
- ✅ Supabase project created
- ✅ OpenAI API key (for AI features)
- ✅ Stripe account (for payments, optional)
- ✅ Netlify or Vercel account (for hosting)

---

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Features
VITE_PAYMENTS_ENABLED=true

# Optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. Supabase Environment Variables

In your Supabase project settings, add:

```env
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Deployment Platforms

### Netlify (Recommended)

#### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

#### Manual Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   netlify init
   ```

4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `supabase/functions` (optional)

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

#### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Vercel

#### Quick Deploy

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

#### vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Other Platforms

The application can be deployed to any static hosting service:
- **AWS S3 + CloudFront**
- **Google Cloud Storage**
- **Azure Static Web Apps**
- **Cloudflare Pages**

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to provision

### 2. Run Migrations

If you have database migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Set Up Tables

Create necessary tables through Supabase Dashboard or SQL editor:

```sql
-- Example: subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  plan_name TEXT,
  amount INTEGER,
  interval TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. Enable Authentication

1. Go to Authentication settings
2. Enable email authentication
3. Configure email templates
4. Set up OAuth providers (optional)

---

## Edge Functions

### 1. Deploy Edge Functions

```bash
# Deploy legal-ai-chat function
supabase functions deploy legal-ai-chat

# Deploy with environment variables
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Verify Deployment

```bash
# Test function
curl -X POST \
  https://your-project.supabase.co/functions/v1/legal-ai-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

### 3. Monitor Functions

- Check logs in Supabase Dashboard
- Set up error alerts
- Monitor invocation counts

---

## CI/CD Pipeline

### GitHub Actions Setup

The repository includes a complete CI/CD pipeline in `.github/workflows/ci-cd.yml`.

### Required Secrets

Add these secrets in GitHub repository settings:

```
NETLIFY_AUTH_TOKEN    # From Netlify account settings
NETLIFY_SITE_ID       # From Netlify site settings
SUPABASE_ACCESS_TOKEN # From Supabase account settings
SNYK_TOKEN           # From Snyk.io (optional, for security scanning)
```

### Pipeline Stages

1. **Lint** - Code quality checks
2. **Test** - Unit and integration tests
3. **Build** - Create production build
4. **E2E** - End-to-end testing
5. **Security** - Dependency scanning
6. **Deploy** - Automatic deployment

### Manual Deployment

To deploy manually without CI/CD:

```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or deploy to Vercel
vercel --prod
```

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Visit production URL
- [ ] Test authentication flow
- [ ] Test AI chat functionality
- [ ] Test document upload
- [ ] Test payment flow (if enabled)
- [ ] Check mobile responsiveness

### 2. Configure Custom Domain

#### Netlify:
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS

#### Vercel:
1. Go to Project settings > Domains
2. Add custom domain
3. Verify ownership
4. HTTPS is automatic

### 3. Set Up CDN

Both Netlify and Vercel include global CDN by default. For other platforms:

- Configure CloudFlare
- Set up appropriate cache headers
- Enable compression

### 4. Enable Analytics

```bash
# Netlify Analytics
# Enable in site settings

# Or use Google Analytics
# Add tracking code to index.html
```

---

## Monitoring

### Application Monitoring

1. **Supabase Dashboard**
   - Monitor database usage
   - Check API requests
   - View edge function logs

2. **Error Tracking**
   - Set up Sentry (recommended)
   - Configure error boundaries
   - Monitor console errors

3. **Performance Monitoring**
   - Use Lighthouse CI
   - Monitor Core Web Vitals
   - Track page load times

### Health Checks

Create a health check endpoint:

```typescript
// Add to your API
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

---

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Environment Variables Not Working

- Verify variables start with `VITE_`
- Restart dev server after changes
- Check `.env` file is not in `.gitignore`
- Verify variables are set in hosting platform

#### Database Connection Issues

- Check Supabase URL and key
- Verify RLS policies
- Check network connectivity
- Review Supabase logs

#### Edge Functions Failing

```bash
# Check function logs
supabase functions logs legal-ai-chat

# Redeploy function
supabase functions deploy legal-ai-chat --no-verify-jwt
```

#### CORS Errors

- Add your domain to `ALLOWED_ORIGINS`
- Verify Supabase CORS settings
- Check API endpoint URLs

### Performance Issues

1. **Enable compression:**
   - Netlify/Vercel handle automatically
   - For other platforms, enable gzip

2. **Optimize images:**
   ```bash
   npm install -D vite-plugin-imagemin
   ```

3. **Enable code splitting:**
   ```typescript
   // Already configured in Vite
   const Component = lazy(() => import('./Component'));
   ```

4. **Add service worker:**
   ```bash
   npm install -D vite-plugin-pwa
   ```

### Rollback Procedure

#### Netlify:
```bash
# View deployments
netlify deploys:list

# Restore previous deployment
netlify deploy:restore DEPLOY_ID
```

#### Vercel:
```bash
# Use dashboard to promote previous deployment
# Or redeploy from git commit
vercel --prod --force
```

---

## Security Checklist

- [ ] All API keys in environment variables
- [ ] HTTPS enabled
- [ ] RLS policies configured
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Dependencies updated
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Rate limiting configured
- [ ] Audit logging enabled

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Monitor uptime

**Monthly:**
- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Backup database
- Review analytics

**Quarterly:**
- Performance audit
- Security audit
- User feedback review
- Feature planning

---

## Support

For deployment issues:
1. Check this guide
2. Review platform documentation
3. Check Supabase status page
4. Open GitHub issue

---

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
