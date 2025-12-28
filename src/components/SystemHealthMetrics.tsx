import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from './AlertDashboard';
import { Activity, Server, Database, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface SystemHealthMetricsProps {
  alerts: Alert[];
}

export const SystemHealthMetrics = ({ alerts }: SystemHealthMetricsProps) => {
  const [metrics, setMetrics] = useState({
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.1,
    activeConnections: 42,
    cpuUsage: 35,
    memoryUsage: 62
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        uptime: 99.9 + Math.random() * 0.1,
        responseTime: 200 + Math.random() * 100,
        errorRate: Math.random() * 0.5,
        activeConnections: 40 + Math.floor(Math.random() * 20),
        cpuUsage: 30 + Math.random() * 30,
        memoryUsage: 60 + Math.random() * 20
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const recentAlerts = alerts.slice(0, 5);
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="System Uptime"
          value={`${metrics.uptime.toFixed(2)}%`}
          icon={<Activity className="h-5 w-5" />}
          trend="up"
          color="text-green-600"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${Math.round(metrics.responseTime)}ms`}
          icon={<Zap className="h-5 w-5" />}
          trend={metrics.responseTime < 250 ? 'up' : 'down'}
          color={metrics.responseTime < 250 ? 'text-green-600' : 'text-yellow-600'}
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={<Server className="h-5 w-5" />}
          trend={metrics.errorRate < 0.5 ? 'up' : 'down'}
          color={metrics.errorRate < 0.5 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResourceBar label="CPU Usage" value={metrics.cpuUsage} color="bg-blue-500" />
            <ResourceBar label="Memory Usage" value={metrics.memoryUsage} color="bg-purple-500" />
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">Active Connections: {metrics.activeConnections}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Alerts</span>
                <span className="font-bold">{alerts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Open Alerts</span>
                <span className="font-bold text-yellow-600">
                  {alerts.filter(a => a.status === 'open').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical Open</span>
                <span className="font-bold text-red-600">{criticalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolved Today</span>
                <span className="font-bold text-green-600">
                  {alerts.filter(a => {
                    if (!a.resolved_at) return false;
                    const today = new Date().toDateString();
                    return new Date(a.resolved_at).toDateString() === today;
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type MetricCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  trend: 'up' | 'down';
  color: string;
};

const MetricCard = ({ title, value, icon, trend, color }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="flex items-center gap-2">
          {icon}
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

type ResourceBarProps = {
  label: string;
  value: number;
  color: string;
};

const ResourceBar = ({ label, value, color }: ResourceBarProps) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span className="font-medium">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);
