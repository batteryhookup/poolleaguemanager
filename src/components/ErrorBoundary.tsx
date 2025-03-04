import React from 'react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-6">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              Don't worry, no data has been lost. Try refreshing the page.
            </p>
            <Button onClick={this.handleReload} variant="default">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 