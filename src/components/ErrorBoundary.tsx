import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitoringService } from '@/lib/monitoringService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send error to monitoring service
    monitoringService.trackError(error, 'React Error Boundary');
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-800">Something went wrong</h3>
                  <p className="text-red-700">
                    An unexpected error occurred. Our team has been notified and will investigate.
                  </p>
                  {this.state.error && (
                    <details className="text-sm text-red-600">
                      <summary className="cursor-pointer">Error details</summary>
                      <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}