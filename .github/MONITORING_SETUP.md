# Production Monitoring & Alerting Setup

This guide covers setting up monitoring and alerting for the DocketChief application in production.

## Overview

DocketChief monitoring strategy includes:
- **Application Performance**: Frontend metrics, Core Web Vitals
- **Infrastructure**: Server uptime, response times, error rates  
- **Business Metrics**: User engagement, feature usage, payment processing
- **Security**: Authentication failures, suspicious activity

## Recommended Monitoring Stack

### 1. Frontend Monitoring

#### Sentry (Error Tracking & Performance)
```bash
npm install @sentry/react @sentry/tracing
```

**Setup in `src/main.tsx`:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

**Required Environment Variables:**
- `VITE_SENTRY_DSN`: Sentry project DSN
- `SENTRY_AUTH_TOKEN`: For source map uploads (GitHub secret)

#### Google Analytics 4 / PostHog (User Analytics)
```bash
npm install posthog-js
```

### 2. Infrastructure Monitoring

#### Netlify Analytics (Built-in)
- Automatically tracks site performance
- Provides Core Web Vitals
- Monitors deployment status

**Enable in Netlify Dashboard:**
- Site Settings → Analytics → Enable

#### Uptime Monitoring
**Recommended Services:**
- **UptimeRobot** (Free tier: 5-minute checks)
- **Pingdom** (More detailed monitoring)
- **StatusCake** (Good free tier)

**URLs to Monitor:**
```
https://docketchief.com
https://docketchief.com/health
https://your-supabase-url.supabase.co/health
```

### 3. Backend/API Monitoring

#### Supabase Metrics (Built-in)
- Database performance
- API request rates
- Storage usage
- Edge Function execution

**Dashboard:** Supabase Project → Reports

#### Custom Health Check Endpoint
Create `supabase/functions/health/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: "ok", // Add actual DB check
      auth: "ok",     // Add actual auth check
    }
  };

  return new Response(JSON.stringify(health), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## Alert Configuration

### 1. Critical Alerts (Immediate Response)

**Application Down:**
- Trigger: HTTP 500/503 responses > 50% for 2+ minutes
- Notification: SMS, Phone call, Slack
- Response: < 15 minutes

**Database Issues:**
- Trigger: Database connection failures > 10% for 1+ minute
- Notification: SMS, Email, Slack
- Response: < 30 minutes

**Payment Processing Errors:**
- Trigger: Payment failure rate > 5% for 5+ minutes
- Notification: SMS, Email, Slack
- Response: < 30 minutes

### 2. Warning Alerts (Business Hours Response)

**Performance Degradation:**
- Trigger: Page load time > 3 seconds for 5+ minutes
- Notification: Email, Slack
- Response: < 2 hours

**High Error Rate:**
- Trigger: 4xx/5xx errors > 5% for 10+ minutes  
- Notification: Email, Slack
- Response: < 4 hours

**Resource Usage:**
- Trigger: Database usage > 80%, Storage > 90%
- Notification: Email
- Response: < 24 hours

### 3. Information Alerts (Weekly Review)

**Traffic Patterns:**
- Weekly active users
- Feature adoption rates
- Performance trends

## Implementation Steps

### 1. Set Up Sentry
```bash
# Install dependencies
npm install @sentry/react @sentry/tracing

# Add to GitHub secrets
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

### 2. Configure Uptime Monitoring
1. Sign up for UptimeRobot or similar service
2. Add monitors for:
   - Main site (https://docketchief.com)
   - Health endpoint
   - API endpoints
3. Configure notification methods (email, SMS, Slack)

### 3. Set Up Netlify Monitoring
```yaml
# netlify.toml additions
[[plugins]]
  package = "@netlify/plugin-lighthouse"

[build.environment]
  # Enable analytics
  NETLIFY_ANALYTICS = "true"
```

### 4. Supabase Monitoring Setup
1. Enable RLS (Row Level Security) monitoring
2. Set up database usage alerts
3. Configure Edge Function error tracking
4. Monitor API rate limits

### 5. Create Dashboard
**Recommended Tools:**
- **Grafana** (Self-hosted, comprehensive)
- **DataDog** (Managed, expensive)
- **New Relic** (Good free tier)

**Key Metrics Dashboard:**
```yaml
Panels:
  - Response Time (95th percentile)
  - Error Rate (4xx/5xx)
  - Active Users (real-time)
  - Database Performance
  - Core Web Vitals
  - Deployment Status
```

## Alerting Contacts & Escalation

### Primary Contacts
- **Developer**: your-email@domain.com
- **Product**: product@domain.com
- **Operations**: ops@domain.com

### Escalation Matrix
```yaml
P0 (Critical - Site Down):
  - Immediate: SMS to on-call developer
  - +15 min: Phone call + Slack #alerts
  - +30 min: Escalate to product team

P1 (High - Major Feature Broken):
  - Immediate: Slack #alerts + Email
  - +1 hour: Escalate if not acknowledged
  - +4 hours: Escalate to product team

P2 (Medium - Performance Issues):
  - Immediate: Email + Slack #monitoring
  - +24 hours: Team standup discussion

P3 (Low - Minor Issues):
  - Daily: Email summary
  - Weekly: Review in team meeting
```

## Cost Considerations

### Free Tier Options
- **Sentry**: 5K errors/month
- **UptimeRobot**: 5 monitors, 5-min intervals
- **Netlify Analytics**: Included with hosting
- **Supabase Monitoring**: Included with plan

### Paid Upgrades (Recommended for Production)
- **Sentry Pro**: ~$26/month (better retention, more events)
- **UptimeRobot Pro**: ~$7/month (1-min intervals, more monitors)
- **Professional Monitoring**: DataDog/New Relic (~$100+/month)

## Maintenance Tasks

### Weekly
- Review error trends in Sentry
- Check uptime reports
- Analyze performance metrics
- Update alert thresholds if needed

### Monthly  
- Review monitoring costs vs. value
- Update contact information
- Test alert delivery mechanisms
- Security audit of monitoring access

### Quarterly
- Evaluate monitoring tool effectiveness
- Update business metric tracking
- Review and update alert severity levels
- Disaster recovery testing

## Getting Started Checklist

- [ ] Set up Sentry error tracking
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Enable Netlify Analytics  
- [ ] Create Supabase health check function
- [ ] Set up alert notification methods (Slack, email)
- [ ] Test alert delivery
- [ ] Create monitoring dashboard
- [ ] Document escalation procedures
- [ ] Schedule weekly monitoring review

---
*Last updated: November 2024*
*Update contact information and escalation procedures as team changes*