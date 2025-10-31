import { supabase } from './supabase';

export interface AlertData {
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details?: any;
  timestamp: string;
}

export class EmailService {
  private static instance: EmailService;
  private alertQueue: AlertData[] = [];
  private isProcessing = false;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendAlert(alertData: AlertData): Promise<boolean> {
    try {
      // Add to queue for batch processing
      this.alertQueue.push(alertData);
      
      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processAlertQueue();
      }

      return true;
    } catch (error) {
      console.error('Failed to queue alert:', error);
      return false;
    }
  }

  private async processAlertQueue(): Promise<void> {
    if (this.isProcessing || this.alertQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.alertQueue.length > 0) {
        const alert = this.alertQueue.shift();
        if (alert) {
          await this.sendEmailAlert(alert);
          // Small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error processing alert queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendEmailAlert(alertData: AlertData): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-monitoring-alert', {
        body: alertData
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown email service error');
      }

      console.log('Alert email sent successfully:', alertData.alertType);
    } catch (error) {
      console.error('Failed to send email alert:', error);
      
      // Fallback: store in localStorage for manual review
      this.storeFailedAlert(alertData, error);
    }
  }

  private storeFailedAlert(alertData: AlertData, error: any): void {
    try {
      const failedAlerts = JSON.parse(localStorage.getItem('failedAlerts') || '[]');
      failedAlerts.push({
        ...alertData,
        failureReason: error.message,
        failureTime: new Date().toISOString()
      });
      
      // Keep only last 50 failed alerts
      if (failedAlerts.length > 50) {
        failedAlerts.splice(0, failedAlerts.length - 50);
      }
      
      localStorage.setItem('failedAlerts', JSON.stringify(failedAlerts));
    } catch (storageError) {
      console.error('Failed to store failed alert:', storageError);
    }
  }

  getFailedAlerts(): any[] {
    try {
      return JSON.parse(localStorage.getItem('failedAlerts') || '[]');
    } catch {
      return [];
    }
  }

  clearFailedAlerts(): void {
    localStorage.removeItem('failedAlerts');
  }

  async testEmailService(): Promise<boolean> {
    const testAlert: AlertData = {
      alertType: 'Test Alert',
      severity: 'low',
      message: 'This is a test alert to verify email service functionality.',
      details: {
        testRun: true,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(testAlert);
  }
}