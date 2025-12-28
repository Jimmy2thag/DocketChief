import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Download, Search, Filter } from 'lucide-react';
import { AlertList } from './AlertList';
import { AlertDetails } from './AlertDetails';
import { SystemHealthMetrics } from './SystemHealthMetrics';
import { PerformanceAnalytics } from './PerformanceAnalytics';

export interface Alert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  details?: Record<string, unknown>;
  status: 'open' | 'resolved' | 'investigating';
  resolved_at?: string;
  resolved_by?: string;
  notes: Array<{ text: string; author: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

export const AlertDashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const stored = localStorage.getItem('system_alerts');
    if (stored) {
      setAlerts(JSON.parse(stored));
    }
  };

  const saveAlerts = (updatedAlerts: Alert[]) => {
    localStorage.setItem('system_alerts', JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'open').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alert Dashboard</h1>
        <Button onClick={() => generateReport(alerts)}>
          <Download className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Alerts" value={stats.total} icon={<AlertTriangle />} />
        <StatCard title="Open Alerts" value={stats.open} icon={<Clock />} color="text-yellow-600" />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle />} color="text-green-600" />
        <StatCard title="Critical" value={stats.critical} icon={<AlertTriangle />} color="text-red-600" />
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">System Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded px-3"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="border rounded px-3"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <AlertList
                alerts={filteredAlerts}
                onSelectAlert={setSelectedAlert}
                onResolveAlert={(id) => resolveAlert(id, alerts, saveAlerts)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <SystemHealthMetrics alerts={alerts} />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics alerts={alerts} />
        </TabsContent>
      </Tabs>

      {selectedAlert && (
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={(updated) => {
            const updatedAlerts = alerts.map(a => a.id === updated.id ? updated : a);
            saveAlerts(updatedAlerts);
            setSelectedAlert(updated);
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color = "text-blue-600" }: { title: string; value: string | number; icon: React.ReactNode; color?: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={color}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const resolveAlert = (id: string, alerts: Alert[], saveAlerts: (alerts: Alert[]) => void) => {
  const updated = alerts.map(a => 
    a.id === id ? { ...a, status: 'resolved' as const, resolved_at: new Date().toISOString() } : a
  );
  saveAlerts(updated);
};

const generateReport = (alerts: Alert[]) => {
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      total: alerts.length,
      open: alerts.filter(a => a.status === 'open').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      by_severity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      }
    },
    alerts: alerts
  };
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `system-health-report-${new Date().toISOString()}.json`;
  a.click();
};
