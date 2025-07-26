"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { CalendarError } from "../types/utils";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Generic Error Boundary Component
 * 
 * Catches and handles React errors gracefully with retry functionality
 * and development-time debugging information.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    // For example: Sentry, LogRocket, Bugsnag, etc.
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
      };

      // Example: Send to monitoring service
      // fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });

      console.info('Error report prepared:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3, onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn(`Maximum retry attempts (${maxRetries}) reached`);
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Call optional retry handler
    if (onRetry) {
      onRetry();
    }

    // Auto-reset after a delay to prevent infinite retry loops
    this.resetTimeoutId = window.setTimeout(() => {
      if (this.state.hasError) {
        this.resetErrorBoundary();
      }
    }, 5000);
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="cal7-error-boundary">
          <div className="cal7-error-boundary__content">
            <div className="cal7-error-boundary__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="m12 17 .01 0"/>
              </svg>
            </div>
            
            <h3 className="cal7-error-boundary__title">
              Something went wrong
            </h3>
            
            <p className="cal7-error-boundary__message">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {retryCount < maxRetries && (
              <button
                onClick={this.handleRetry}
                className="cal7-error-boundary__retry-button"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
              </button>
            )}

            {retryCount >= maxRetries && (
              <p className="cal7-error-boundary__max-retries">
                Maximum retry attempts reached. Please refresh the page manually.
              </p>
            )}
            
            {/* Development error details */}
            {process.env.NODE_ENV === "development" && error && (
              <details className="cal7-error-boundary__debug">
                <summary className="cal7-error-boundary__debug-summary">
                  Error Details (Development)
                </summary>
                <div className="cal7-error-boundary__debug-content">
                  <div className="cal7-error-boundary__debug-section">
                    <h4>Error Message:</h4>
                    <pre>{error.toString()}</pre>
                  </div>
                  
                  {error.stack && (
                    <div className="cal7-error-boundary__debug-section">
                      <h4>Stack Trace:</h4>
                      <pre>{error.stack}</pre>
                    </div>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <div className="cal7-error-boundary__debug-section">
                      <h4>Component Stack:</h4>
                      <pre>{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Calendar-specific Error Boundary
 * 
 * Provides calendar-specific error handling with contextual error messages
 * and recovery options.
 */
export function CalendarErrorBoundary({ 
  children, 
  onRetry,
  onError,
}: { 
  children: ReactNode;
  onRetry?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log calendar-specific errors with additional context
    console.error("Calendar Error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const fallback = (
    <div className="cal7-calendar-error">
      <div className="cal7-calendar-error__content">
        <div className="cal7-calendar-error__icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="m9 16 2 2 4-4"/>
          </svg>
        </div>
        
        <h3 className="cal7-calendar-error__title">
          Calendar Unavailable
        </h3>
        
        <p className="cal7-calendar-error__message">
          We're having trouble loading the events calendar. This might be a temporary issue with our calendar service.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="cal7-calendar-error__retry-button"
            type="button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Reload Calendar
          </button>
        )}
        
        <p className="cal7-calendar-error__help">
          You can also visit our social media for the latest event updates.
        </p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback} 
      onError={handleError}
      onRetry={onRetry}
      maxRetries={3}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Event Modal Error Boundary
 * 
 * Handles errors specifically within event modal components.
 */
export function EventModalErrorBoundary({ 
  children, 
  onClose,
  onError,
}: { 
  children: ReactNode;
  onClose?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("Event Modal Error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Call optional error handler
    if (onError) {
      onError(error, errorInfo);
    }
  };

  const fallback = (
    <div className="cal7-modal-error-overlay">
      <div className="cal7-modal-error">
        <div className="cal7-modal-error__content">
          <div className="cal7-modal-error__icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="m12 17 .01 0"/>
            </svg>
          </div>
          
          <h3 className="cal7-modal-error__title">
            Event Details Unavailable
          </h3>
          
          <p className="cal7-modal-error__message">
            We couldn't load the event details. Please try selecting the event again.
          </p>
          
          {onClose && (
            <button
              onClick={onClose}
              className="cal7-modal-error__close-button"
              type="button"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback} 
      onError={handleError}
      maxRetries={1}
    >
      {children}
    </ErrorBoundary>
  );
}