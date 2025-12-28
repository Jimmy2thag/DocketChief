# Production Monitoring and Alerting Guide

This document outlines the monitoring and alerting setup for Docket Chief in production.

## Built-in CI/CD Monitoring

The GitHub Actions workflow includes automated monitoring:

### Automated Health Checks
- Runs after every production deployment
- Performs HTTP health check on the production URL
- Creates GitHub issue automatically on failure
- Tags issues with `deployment` and `urgent` labels

### Deployment Monitoring
- Build status visible in GitHub Actions
- E2E test results preserved as artifacts
- Deployment URLs commented on pull requests
- Failed jobs send notifications to watchers

## Setting Up External Monitoring

### 1. Uptime Monitoring (Recommended: UptimeRobot)

**UptimeRobot** - Free service for uptime monitoring

#### Setup Steps:
1. Sign up at [https://uptimerobot.com/](https://uptimerobot.com/)
2. Click "Add New Monitor"
3. Configure:
   - Monitor Type: HTTP(s)
   - Friendly Name: "Docket Chief Production"
   - URL: `https://docketchief.com`
   - Monitoring Interval: 5 minutes (free tier)
4. Add alert contacts (email, SMS, Slack, etc.)

**Benefits**:
- Free for up to 50 monitors
- 5-minute check intervals
- Email and SMS alerts
- Public status pages
- SSL certificate monitoring

### 2. Application Performance Monitoring

#### Option A: Netlify Analytics (Easiest)

1. Log in to Netlify dashboard
2. Navigate to your site
3. Go to Analytics tab
4. Enable Netlify Analytics ($9/month per site)

**Features**:
- Page views and unique visitors
- Top pages and resources
- Bandwidth usage
- No JavaScript required
- Server-side analytics

#### Option B: Google Analytics (Free)

1. Create a Google Analytics property
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add to your application:

```typescript
// Add to index.html or app entry point
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Error Tracking and Monitoring

#### Option A: Sentry (Recommended)

**Setup Steps**:

1. Sign up at [https://sentry.io/](https://sentry.io/)
2. Create a new project (Select React)
3. Install Sentry SDK:
   ```bash
   npm install --save @sentry/react
   ```

4. Initialize Sentry in your app:
   ```typescript
   // src/main.tsx
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration(),
     ],
     environment: import.meta.env.VITE_ENVIRONMENT,
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

5. Add to GitHub secrets:
   - `VITE_SENTRY_DSN`

**Benefits**:
- Real-time error tracking
- Stack traces and context
- Release tracking
- Performance monitoring
- Session replay
- Free tier available

#### Option B: LogRocket

1. Sign up at [https://logrocket.com/](https://logrocket.com/)
2. Install SDK:
   ```bash
   npm install --save logrocket
   ```

3. Initialize:
   ```typescript
   import LogRocket from 'logrocket';
   LogRocket.init('your-app-id/your-app-name');
   ```

**Benefits**:
- Session replay
- Network request logging
- Console logs capture
- Redux state tracking

### 4. Database Monitoring (Supabase)

#### Built-in Supabase Monitoring

1. Log in to Supabase dashboard
2. Navigate to your project
3. Go to **Database** > **Reports**

**Available Metrics**:
- API requests
- Database queries
- Active connections
- Storage usage
- Authentication events

#### Setting Up Alerts

1. Go to **Project Settings** > **Alerts**
2. Configure alerts for:
   - Database size (e.g., alert at 80% capacity)
   - Connection pool usage
   - API request limits
   - Authentication failures

3. Set notification channels:
   - Email
   - Webhooks (for Slack, Discord, etc.)

### 5. Synthetic Monitoring

Use Playwright tests as synthetic monitoring:

1. Set up scheduled GitHub Actions:
   ```yaml
   # .github/workflows/synthetic-monitoring.yml
   name: Synthetic Monitoring
   
   on:
     schedule:
       - cron: '0 */6 * * *'  # Every 6 hours
     workflow_dispatch:
   
   jobs:
     synthetic-tests:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         - run: npm ci
         - run: npx playwright install --with-deps
         - run: npm run test:e2e
           env:
             PLAYWRIGHT_BASE_URL: https://docketchief.com
         - name: Create issue on failure
           if: failure()
           uses: actions/github-script@v7
           with:
             script: |
               github.rest.issues.create({
                 owner: context.repo.owner,
                 repo: context.repo.repo,
                 title: '🚨 Synthetic Monitoring Failed',
                 body: 'Production site failed synthetic monitoring checks',
                 labels: ['monitoring', 'production']
               })
   ```

## Alert Configuration

### Priority Levels

**P0 - Critical (Immediate Response)**
- Production site down (5XX errors)
- Database unavailable
- Authentication system failure
- Data breach or security incident

**P1 - High (Response within 1 hour)**
- Degraded performance (slow responses)
- Elevated error rates
- Failed deployments
- SSL certificate expiring soon

**P2 - Medium (Response within 24 hours)**
- Non-critical feature failures
- E2E test failures
- High memory/CPU usage
- Approaching storage limits

**P3 - Low (Response within 1 week)**
- Code quality issues
- Documentation updates needed
- Optimization opportunities

### Notification Channels

#### Slack Integration

1. Create a Slack webhook:
   - Go to Slack API > Incoming Webhooks
   - Create new webhook
   - Copy webhook URL

2. Add webhook to monitoring services:
   - UptimeRobot: Settings > Alert Contacts > Add Slack
   - Sentry: Settings > Integrations > Slack
   - GitHub: Settings > Webhooks > Add webhook

#### Email Alerts

Configure email alerts in each service:
- Use team email (e.g., team@docketchief.com)
- Set up email filtering rules
- Configure escalation policies

#### PagerDuty (For 24/7 On-call)

If you need 24/7 coverage:
1. Sign up at [https://pagerduty.com/](https://pagerduty.com/)
2. Create escalation policies
3. Integrate with monitoring services
4. Set up on-call schedules

## Metrics to Monitor

### Application Metrics

1. **Availability**
   - Uptime percentage (target: 99.9%)
   - Response time (target: <2s)
   - Error rate (target: <1%)

2. **Performance**
   - Page load time
   - Time to First Byte (TTFB)
   - Core Web Vitals (LCP, FID, CLS)
   - API response times

3. **Usage**
   - Active users
   - Page views
   - Feature adoption
   - User retention

### Infrastructure Metrics

1. **Database**
   - Query performance
   - Connection pool usage
   - Database size
   - Backup status

2. **API**
   - Request rate
   - Error rate by endpoint
   - Authentication success rate
   - Rate limiting triggers

3. **Deployment**
   - Build success rate
   - Deployment frequency
   - Mean time to recovery (MTTR)
   - Change failure rate

## Dashboards

### Recommended Dashboard Setup

#### 1. System Health Dashboard
- Overall uptime status
- Current error rate
- Active incidents
- Recent deployments

#### 2. Performance Dashboard
- Page load times
- API response times
- Core Web Vitals
- Database query performance

#### 3. Business Metrics Dashboard
- Daily active users
- User registrations
- Feature usage
- Conversion metrics

### Creating Dashboards

#### With Grafana (Self-hosted)
1. Deploy Grafana instance
2. Connect to Supabase metrics
3. Create custom panels
4. Share with team

#### With Netlify Analytics
- Built-in dashboard
- No configuration needed
- Limited customization

## Incident Response

### Response Procedures

1. **Detection**
   - Monitoring alert received
   - User report
   - Automated health check failure

2. **Triage**
   - Assess severity (P0-P3)
   - Identify affected systems
   - Estimate user impact

3. **Response**
   - Notify team via appropriate channel
   - Begin investigation
   - Implement temporary fix if needed

4. **Resolution**
   - Deploy permanent fix
   - Verify resolution
   - Update monitoring

5. **Post-mortem**
   - Document incident
   - Identify root cause
   - Create action items

### Incident Communication

- Update status page (if available)
- Notify affected users
- Keep stakeholders informed
- Document timeline

## Maintenance Windows

### Scheduled Maintenance

1. **Planning**
   - Schedule during low-traffic periods
   - Notify users in advance (24-48 hours)
   - Prepare rollback plan

2. **Communication**
   - Post on status page
   - Email notifications
   - In-app banner

3. **Execution**
   - Disable monitoring alerts
   - Perform maintenance
   - Verify functionality
   - Re-enable monitoring

## Regular Health Checks

### Daily
- Check monitoring dashboards
- Review error logs
- Verify backup status

### Weekly
- Review performance metrics
- Analyze user trends
- Check SSL certificate expiry
- Review security alerts

### Monthly
- Review incident trends
- Update alert thresholds
- Performance optimization
- Security audit

### Quarterly
- Disaster recovery drill
- Review monitoring strategy
- Update documentation
- Capacity planning

## Cost Optimization

### Free Tier Options
- UptimeRobot: Up to 50 monitors
- Sentry: 5K errors/month
- Google Analytics: Unlimited (free)
- GitHub Actions: 2,000 minutes/month
- Netlify: 100GB bandwidth

### Paid Recommendations
- Netlify Analytics: $9/month
- Sentry Team: $26/month
- UptimeRobot Pro: $7/month
- Better Uptime: $20/month

## Security Monitoring

### What to Monitor

1. **Authentication**
   - Failed login attempts
   - Unusual login locations
   - Brute force attempts

2. **API**
   - Rate limit violations
   - Suspicious patterns
   - Unauthorized access attempts

3. **Infrastructure**
   - SSL certificate status
   - Dependency vulnerabilities
   - Security headers

### Tools

- **GitHub Dependabot**: Automated dependency updates
- **Snyk**: Vulnerability scanning
- **Supabase Audit Logs**: Database access logs
- **Netlify Security Headers**: Configured in netlify.toml

## Checklist: Production Monitoring Setup

- [ ] Configure UptimeRobot or similar uptime monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable Supabase monitoring and alerts
- [ ] Configure GitHub Actions notifications
- [ ] Set up alert channels (Slack/email)
- [ ] Create monitoring dashboards
- [ ] Document incident response procedures
- [ ] Schedule regular health check reviews
- [ ] Set up synthetic monitoring
- [ ] Configure security monitoring
- [ ] Test alert delivery
- [ ] Document escalation procedures

## Additional Resources

- [Netlify Monitoring Docs](https://docs.netlify.com/monitor-sites/site-analytics/)
- [Supabase Monitoring Guide](https://supabase.com/docs/guides/platform/metrics)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [GitHub Actions Notifications](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)
- [Playwright Synthetic Monitoring](https://playwright.dev/docs/ci)
