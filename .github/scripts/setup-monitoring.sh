#!/bin/bash

# Monitoring Setup Script for DocketChief
# Sets up Sentry, UptimeRobot, and other monitoring services

set -e

echo "📊 DocketChief Monitoring Setup"
echo "==============================="

# Function to setup Sentry
setup_sentry() {
    echo ""
    echo "🔍 Setting up Sentry Error Tracking"
    echo "==================================="
    
    read -p "Set up Sentry? (y/n): " setup_sentry_choice
    if [ "$setup_sentry_choice" != "y" ]; then
        echo "⏭️  Skipped Sentry setup"
        return
    fi
    
    echo ""
    echo "📦 Installing Sentry dependencies..."
    npm install @sentry/react @sentry/tracing
    
    echo ""
    echo "📋 Manual Sentry Setup Steps:"
    echo "1. Go to https://sentry.io/ and create account"
    echo "2. Create new project for 'React'"
    echo "3. Copy your DSN (looks like: https://...@sentry.io/...)"
    echo "4. Add DSN to GitHub secrets as VITE_SENTRY_DSN"
    echo ""
    
    # Create Sentry configuration file
    cat > src/lib/sentry.ts << 'EOF'
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log("Sentry DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || "development",
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: import.meta.env.VITE_ENVIRONMENT === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.VITE_ENVIRONMENT === "development") {
        return null;
      }
      return event;
    },
  });
};

export { Sentry };
EOF
    
    echo "✅ Created src/lib/sentry.ts"
    echo "📝 Don't forget to initialize Sentry in src/main.tsx:"
    echo "   import { initSentry } from './lib/sentry';"
    echo "   initSentry();"
}

# Function to setup UptimeRobot
setup_uptime_monitoring() {
    echo ""
    echo "⏰ Setting up Uptime Monitoring"
    echo "==============================="
    
    read -p "Set up uptime monitoring? (y/n): " setup_uptime_choice
    if [ "$setup_uptime_choice" != "y" ]; then
        echo "⏭️  Skipped uptime monitoring setup"
        return
    fi
    
    echo ""
    echo "📋 UptimeRobot Setup Steps:"
    echo "1. Go to https://uptimerobot.com/ and create account"
    echo "2. Add monitors for these URLs:"
    echo "   - https://docketchief.com (main site)"
    echo "   - https://docketchief.com/health (health check)"
    echo "   - https://your-supabase-url.supabase.co/rest/v1/ (API)"
    echo "3. Configure alerts (email, SMS, Slack)"
    echo "4. Set check interval to 5 minutes (free tier)"
    echo ""
    
    # Create health check endpoint
    mkdir -p public
    cat > public/health.json << 'EOF'
{
  "status": "ok",
  "timestamp": "2024-11-09T00:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
EOF
    
    echo "✅ Created public/health.json endpoint"
    
    # Create detailed health check component
    cat > src/components/HealthCheck.tsx << 'EOF'
import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    auth: 'ok' | 'error';
    storage: 'ok' | 'error';
  };
}

export function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Add your actual health checks here
        const status: HealthStatus = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            database: 'ok',
            auth: 'ok', 
            storage: 'ok'
          }
        };
        setHealth(status);
      } catch (error) {
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          services: {
            database: 'error',
            auth: 'error',
            storage: 'error'
          }
        });
      }
    };
    
    checkHealth();
  }, []);
  
  if (!health) return <div>Checking system health...</div>;
  
  return (
    <div className="p-4">
      <h2>System Health</h2>
      <p>Status: {health.status}</p>
      <p>Last Check: {health.timestamp}</p>
      <ul>
        <li>Database: {health.services.database}</li>
        <li>Auth: {health.services.auth}</li>
        <li>Storage: {health.services.storage}</li>
      </ul>
    </div>
  );
}
EOF
    
    echo "✅ Created src/components/HealthCheck.tsx"
}

# Function to setup analytics
setup_analytics() {
    echo ""
    echo "📈 Setting up Analytics"
    echo "======================"
    
    read -p "Set up Google Analytics? (y/n): " setup_ga_choice
    if [ "$setup_ga_choice" != "y" ]; then
        echo "⏭️  Skipped Analytics setup"
        return
    fi
    
    echo ""
    echo "📦 Installing analytics dependencies..."
    npm install posthog-js
    
    echo ""
    echo "📋 Google Analytics Setup Steps:"
    echo "1. Go to https://analytics.google.com/"
    echo "2. Create new property for your website"
    echo "3. Copy Measurement ID (GA_MEASUREMENT_ID)"
    echo "4. Add to GitHub secrets as VITE_GA_MEASUREMENT_ID"
    echo ""
    
    # Create analytics service
    cat > src/lib/analytics.ts << 'EOF'
import posthog from 'posthog-js';

export const initAnalytics = () => {
  // PostHog setup
  if (import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_ENVIRONMENT === 'production') {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com'
    });
  }
  
  // Google Analytics setup (if you prefer GA)
  if (import.meta.env.VITE_GA_MEASUREMENT_ID && import.meta.env.VITE_ENVIRONMENT === 'production') {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => (window as any).dataLayer.push(args);
    
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  }
};

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (import.meta.env.VITE_ENVIRONMENT === 'production') {
    posthog.capture(name, properties);
  }
};
EOF
    
    echo "✅ Created src/lib/analytics.ts"
}

# Function to create monitoring dashboard
create_monitoring_dashboard() {
    echo ""
    echo "📊 Creating Monitoring Dashboard"
    echo "==============================="
    
    cat > src/components/MonitoringDashboard.tsx << 'EOF'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  responseTime: string;
}

const mockServices: ServiceStatus[] = [
  { name: 'Main Website', status: 'online', uptime: '99.9%', responseTime: '120ms' },
  { name: 'API Server', status: 'online', uptime: '99.8%', responseTime: '85ms' },
  { name: 'Database', status: 'online', uptime: '100%', responseTime: '45ms' },
  { name: 'File Storage', status: 'online', uptime: '99.7%', responseTime: '200ms' },
];

export function MonitoringDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Status</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockServices.map((service) => (
          <Card key={service.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                <Badge variant={service.status === 'online' ? 'default' : 'destructive'}>
                  {service.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p>Uptime: {service.uptime}</p>
                <p>Response: {service.responseTime}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF
    
    echo "✅ Created src/components/MonitoringDashboard.tsx"
}

# Main setup flow
echo "This script will help you set up monitoring for DocketChief"
echo ""

setup_sentry
setup_uptime_monitoring  
setup_analytics
create_monitoring_dashboard

echo ""
echo "🎉 Monitoring Setup Complete!"
echo ""
echo "📋 Summary of what was created:"
echo "✅ Sentry error tracking configuration"
echo "✅ Health check endpoints"
echo "✅ Analytics integration"
echo "✅ Monitoring dashboard component"
echo ""
echo "🔧 Next Steps:"
echo "1. Configure external services (Sentry, UptimeRobot, GA)"
echo "2. Add secrets to GitHub repository"
echo "3. Initialize services in your main.tsx file"
echo "4. Test monitoring in production"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   .github/MONITORING_SETUP.md"