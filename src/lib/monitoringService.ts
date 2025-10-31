import { EmailService, AlertData } from './emailService';

export interface SystemMetrics {
  memoryUsage: number;
  performanceScore: number;
  errorRate: number;
  apiResponseTime: number;
  activeConnections: number;
  lastUpdated: string;
}

export interface SystemAlert {
  alertType: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
  url: string;
  userId?: string;
  userAgent: string;
  stackTrace?: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private alertQueue: SystemAlert[] = [];
  private isProcessing = false;

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.sendAlert({
        alertType: 'Unhandled Promise Rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        severity: 'high',
        stackTrace: event.reason?.stack
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.sendAlert({
        alertType: 'Global JavaScript Error',
        message: event.message,
        severity: 'high',
        stackTrace: `${event.filename}:${event.lineno}:${event.colno}`
      });
    });
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async sendAlert(alert: Omit<SystemAlert, 'timestamp' | 'url' | 'userAgent'>) {
    const fullAlert: SystemAlert = {
      ...alert,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.alertQueue.push(fullAlert);
    await this.processAlerts();
  }

  private async processAlerts() {
    if (this.isProcessing || this.alertQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.alertQueue.length > 0) {
      const alert = this.alertQueue.shift()!;
      await this.sendToSupport(alert);
    }
    
    this.isProcessing = false;
  }

  private async sendToSupport(alert: SystemAlert) {
    try {
      const emailService = EmailService.getInstance();
      
      const emailAlert: AlertData = {
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        details: {
          url: alert.url,
          userAgent: alert.userAgent,
          stackTrace: alert.stackTrace,
          userId: alert.userId,
          timestamp: alert.timestamp
        },
        timestamp: new Date(alert.timestamp).toISOString()
      };

      const success = await emailService.sendAlert(emailAlert);
      
      if (!success) {
        // Fallback to console and localStorage
        console.error('🚨 SYSTEM ALERT - support@docketchief.com:', alert);
        this.storeAlertLocally(alert);
      }
    } catch (error) {
      console.error('Monitoring service error:', error);
      console.error('SYSTEM ALERT (FALLBACK):', alert);
      this.storeAlertLocally(alert);
    }
  }

  private storeAlertLocally(alert: SystemAlert) {
    try {
      const alerts = JSON.parse(localStorage.getItem('system_alerts') || '[]');
      
      // Convert to dashboard alert format
      const dashboardAlert = {
        id: crypto.randomUUID(),
        type: alert.alertType,
        severity: alert.severity,
        title: alert.alertType,
        message: alert.message,
        details: {
          url: alert.url,
          userAgent: alert.userAgent,
          stackTrace: alert.stackTrace,
          userId: alert.userId
        },
        status: 'open',
        notes: [],
        created_at: new Date(alert.timestamp).toISOString(),
        updated_at: new Date(alert.timestamp).toISOString()
      };
      
      alerts.push(dashboardAlert);
      localStorage.setItem('system_alerts', JSON.stringify(alerts.slice(-100))); // Keep last 100
    } catch (error) {
      console.error('Failed to store alert locally:', error);
    }
  }


  trackError(error: Error, context?: string) {
    this.sendAlert({
      alertType: 'JavaScript Error',
      message: `${context ? `[${context}] ` : ''}${error.message}`,
      severity: 'high',
      stackTrace: error.stack,
      userId: this.getCurrentUserId()
    });
  }

  trackPerformance(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      this.sendAlert({
        alertType: 'Performance Issue',
        message: `${metric} exceeded threshold: ${value}ms (threshold: ${threshold}ms)`,
        severity: value > threshold * 2 ? 'high' : 'medium',
        userId: this.getCurrentUserId()
      });
    }
  }

  trackAPIFailure(endpoint: string, status: number, message: string) {
    this.sendAlert({
      alertType: 'API Failure',
      message: `API call failed: ${endpoint} (Status: ${status}) - ${message}`,
      severity: status >= 500 ? 'critical' : 'high',
      userId: this.getCurrentUserId()
    });
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id;
    } catch {
      return undefined;
    }
  }
}

export const monitoringService = MonitoringService.getInstance();