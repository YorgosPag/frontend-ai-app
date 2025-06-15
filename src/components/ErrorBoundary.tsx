// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { uiStrings } from '../config/translations';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Optional error logging callback
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }; // errorInfo is set in componentDidCatch
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Default error logging
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default Fallback UI
      return (
        <div
            className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center bg-gray-800 rounded-lg text-gray-300"
            role="alert"
        >
          <Icon name="errorCircle" size="w-16 h-16" className="mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            {uiStrings.genericErrorNotification || "Παρουσιάστηκε ένα σφάλμα"}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Κάτι πήγε στραβά κατά την προσπάθεια εμφάνισης αυτού του τμήματος. Παρακαλώ δοκιμάστε ξανά.
          </p>
          {this.state.error && (
            <details className="mb-4 text-xs text-gray-500 text-left bg-gray-700 p-2 rounded w-full max-w-lg overflow-auto">
              <summary>Λεπτομέρειες Σφάλματος (για προγραμματιστές)</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
              </pre>
            </details>
          )}
          <Button variant="secondary" onClick={this.handleRetry}>
            Δοκιμάστε Ξανά
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;