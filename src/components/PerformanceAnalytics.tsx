import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from './AlertDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface PerformanceAnalyticsProps {
  alerts: Alert[];
}

export const PerformanceAnalytics = ({ alerts }: PerformanceAnalyticsProps) => {
  // Alert trends by day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const trendData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    alerts: alerts.filter(a => a.created_at.startsWith(date)).length,
    resolved: alerts.filter(a => a.resolved_at?.startsWith(date)).length
  }));

  // Alerts by severity
  const severityData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length, color: '#3b82f6' }
  ];

  // Alerts by type
  const typeData = Object.entries(
    alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ type, count }));

  // Resolution time analysis
  const avgResolutionTime = alerts
    .filter(a => a.resolved_at)
    .reduce((sum, a) => {
      const created = new Date(a.created_at).getTime();
      const resolved = new Date(a.resolved_at!).getTime();
      return sum + (resolved - created);
    }, 0) / alerts.filter(a => a.resolved_at).length || 0;

  const resolutionHours = (avgResolutionTime / (1000 * 60 * 60)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Resolution Time</p>
            <p className="text-3xl font-bold text-blue-600">{resolutionHours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Resolution Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {((alerts.filter(a => a.status === 'resolved').length / alerts.length) * 100 || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Most Common Type</p>
            <p className="text-xl font-bold text-purple-600">
              {typeData.sort((a, b) => b.count - a.count)[0]?.type || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alert Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alerts" stroke="#3b82f6" name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
