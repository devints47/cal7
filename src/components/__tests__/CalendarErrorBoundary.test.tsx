import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  ErrorBoundary, 
  CalendarErrorBoundary, 
  EventModalErrorBoundary 
} from '../CalendarErrorBoundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleInfo = console.info;

beforeEach(() => {
  console.error = vi.fn();
  console.info = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.info = originalConsoleInfo;
});

// Test component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('handles retry functionality', async () => {
    const onRetry = vi.fn();
    
    render(
      <ErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
    
    // After retry, the error boundary should reset and try to render children again
    // Since we're still throwing an error, it should show the error again but with incremented retry count
    expect(screen.getByText(/try again.*\(1\/3\)/i)).toBeInTheDocument();
  });

  it('respects maxRetries limit', () => {
    render(
      <ErrorBoundary maxRetries={2}>
        <ThrowError />
      </ErrorBoundary>
    );

    let retryButton = screen.getByRole('button', { name: /try again/i });
    
    // First retry
    fireEvent.click(retryButton);
    retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton.textContent).toMatch(/try again.*\(1\/2\)/i);
    
    // Second retry - this should reach the max and remove the button
    fireEvent.click(retryButton);
    
    // After max retries, button should be gone and message should appear
    expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('shows debug information in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('hides debug information in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('resets error state when resetKeys change', () => {
    let resetKey = 'key1';
    
    const { rerender } = render(
      <ErrorBoundary resetOnPropsChange={true} resetKeys={[resetKey]}>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Change reset key
    resetKey = 'key2';
    rerender(
      <ErrorBoundary resetOnPropsChange={true} resetKeys={[resetKey]}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Error should be cleared
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});

describe('CalendarErrorBoundary', () => {
  it('renders calendar-specific error UI', () => {
    render(
      <CalendarErrorBoundary>
        <ThrowError />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText('Calendar Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/having trouble loading the events calendar/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    
    render(
      <CalendarErrorBoundary onRetry={onRetry}>
        <ThrowError />
      </CalendarErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /reload calendar/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
  });

  it('calls onError callback with calendar context', () => {
    const onError = vi.fn();
    
    render(
      <CalendarErrorBoundary onError={onError}>
        <ThrowError />
      </CalendarErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('shows help text for users', () => {
    render(
      <CalendarErrorBoundary>
        <ThrowError />
      </CalendarErrorBoundary>
    );

    expect(screen.getByText(/visit our social media for the latest event updates/)).toBeInTheDocument();
  });
});

describe('EventModalErrorBoundary', () => {
  it('renders modal-specific error UI', () => {
    render(
      <EventModalErrorBoundary>
        <ThrowError />
      </EventModalErrorBoundary>
    );

    expect(screen.getByText('Event Details Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/couldn't load the event details/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <EventModalErrorBoundary onClose={onClose}>
        <ThrowError />
      </EventModalErrorBoundary>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('renders as modal overlay', () => {
    render(
      <EventModalErrorBoundary>
        <ThrowError />
      </EventModalErrorBoundary>
    );

    const overlay = screen.getByText('Event Details Unavailable').closest('.cal7-modal-error-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('calls onError callback with modal context', () => {
    const onError = vi.fn();
    
    render(
      <EventModalErrorBoundary onError={onError}>
        <ThrowError />
      </EventModalErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('has limited retry attempts for modal errors', () => {
    render(
      <EventModalErrorBoundary>
        <ThrowError />
      </EventModalErrorBoundary>
    );

    // Modal error boundary should have maxRetries=1, so no retry button after first failure
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});

describe('Error Boundary Integration', () => {
  it('logs errors to console in development', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('prepares error reports in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.info).toHaveBeenCalledWith(
      'Error report prepared:',
      expect.objectContaining({
        message: 'Test error',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String)
      })
    );
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles component unmounting during error state', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });

  it('handles multiple consecutive errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Trigger another error
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should still show error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});