import { Alert } from './AlertDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  onResolveAlert: (id: string) => void;
}

export const AlertList = ({ alerts, onSelectAlert, onResolveAlert }: AlertListProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
        <p className="text-lg font-medium">No alerts found</p>
        <p className="text-sm">System is running smoothly</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
            getSeverityColor(alert.severity)
          }`}
          onClick={() => onSelectAlert(alert)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(alert.status)}>
                  {alert.status}
                </Badge>
                <Badge variant="outline">{alert.severity}</Badge>
                <span className="text-xs text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{alert.title}</h3>
              <p className="text-sm text-gray-700">{alert.message}</p>
              {alert.notes.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {alert.notes.length} note{alert.notes.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {alert.status === 'open' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolveAlert(alert.id);
                }}
                className="ml-4"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
