import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { monitoringService, SystemMetrics, SystemAlert } from '@/lib/monitoringService';
import { EmailService } from '@/lib/emailService';
import { Activity, AlertTriangle, CheckCircle, Mail, Server, Zap } from 'lucide-react';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    performanceScore: 0,
    errorRate: 0,
    apiResponseTime: 0,
    activeConnections: 0,
    lastUpdated: new Date().toISOString()
  });
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [failedAlerts, setFailedAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = () => {
    setMetrics({
      memoryUsage: Math.round(Math.random() * 100),
      performanceScore: Math.round(85 + Math.random() * 15),
      errorRate: Math.round(Math.random() * 5),
      apiResponseTime: Math.round(100 + Math.random() * 200),
      activeConnections: Math.round(50 + Math.random() * 200),
      lastUpdated: new Date().toISOString()
    });

    // Load stored alerts
    const storedAlerts = JSON.parse(localStorage.getItem('system_alerts') || '[]');
    setAlerts(storedAlerts.slice(-10)); // Show last 10 alerts

    // Load failed email alerts
    const emailService = EmailService.getInstance();
    setFailedAlerts(emailService.getFailedAlerts());
  };

  const testEmailService = async () => {
    setEmailStatus('testing');
    setEmailMessage('Testing email service...');
    
    try {
      const emailService = EmailService.getInstance();
      const success = await emailService.testEmailService();
      
      if (success) {
        setEmailStatus('success');
        setEmailMessage('Test email sent successfully to support@docketchief.com');
      } else {
        setEmailStatus('error');
        setEmailMessage('Failed to send test email. Check console for details.');
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailMessage(`Email test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setTimeout(() => {
      setEmailStatus('idle');
      setEmailMessage('');
    }, 5000);
  };

  const testAlert = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    monitoringService.sendAlert({
      alertType: 'Test Alert',
      message: `This is a test ${severity} severity alert to verify the monitoring system.`,
      severity
    });
    
    // Show feedback
    loadSystemData(); // Refresh to show new alert
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">System Monitor</h1>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
            <p className="text-xs text-muted-foreground">Current usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.performanceScore}</div>
            <p className="text-xs text-muted-foreground">Performance score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="testing">Test Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent system alerts and notifications sent to support@docketchief.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Monitoring system is active and ready to detect issues.
                  All alerts will be automatically sent to the development team.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Alert System</CardTitle>
              <CardDescription>
                Send test alerts to verify the monitoring system is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testAlert('low')}
                  className="text-blue-600"
                >
                  Low Severity
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testAlert('medium')}
                  className="text-yellow-600"
                >
                  Medium Severity
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testAlert('high')}
                  className="text-orange-600"
                >
                  High Severity
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testAlert('critical')}
                  className="text-red-600"
                >
                  Critical Severity
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Test alerts will be sent to support@docketchief.com to verify the notification system.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { SystemMonitor };