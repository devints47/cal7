import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  ErrorState,
  CalendarErrorState,
  InlineErrorMessage,
  EmptyEventsState,
  ConnectionStatus,
  DevelopmentWarning
} from '../ErrorStates';
import { CalendarError } from '../../types/utils';

describe('ErrorState', () => {
  it('renders network error correctly', () => {
    const error = new CalendarError('Network connection failed', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the calendar service/)).toBeInTheDocument();
    expect(screen.getByText(/Network connectivity issues/)).toBeInTheDocument();
  });

  it('renders auth error correctly', () => {
    const error = new CalendarError('Invalid API key', 'AUTH_ERROR');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
    expect(screen.getByText(/API key is invalid or has expired/)).toBeInTheDocument();
    expect(screen.getByText(/Verify your Google Calendar API key/)).toBeInTheDocument();
  });

  it('renders permission error correctly', () => {
    const error = new CalendarError('Access denied', 'PERMISSION_ERROR');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Permission Denied')).toBeInTheDocument();
    expect(screen.getByText(/does not have permission to access/)).toBeInTheDocument();
    expect(screen.getByText(/API key has the necessary permissions/)).toBeInTheDocument();
  });

  it('renders missing API key error correctly', () => {
    const error = new CalendarError('API key required', 'MISSING_API_KEY');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('API Key Required')).toBeInTheDocument();
    expect(screen.getByText(/Google Calendar API key is required/)).toBeInTheDocument();
    expect(screen.getByText(/Get a Google Calendar API key/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view setup guide/i })).toBeInTheDocument();
  });

  it('renders invalid calendar ID error correctly', () => {
    const error = new CalendarError('Calendar not found', 'INVALID_CALENDAR_ID');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Calendar Not Found')).toBeInTheDocument();
    expect(screen.getByText(/specified calendar could not be found/)).toBeInTheDocument();
    expect(screen.getByText(/calendar ID is correct/)).toBeInTheDocument();
  });

  it('renders invalid data error correctly', () => {
    const error = new CalendarError('Invalid response format', 'INVALID_DATA');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Data Format Error')).toBeInTheDocument();
    expect(screen.getByText(/calendar data received is in an unexpected format/)).toBeInTheDocument();
    expect(screen.getByText(/usually a temporary issue/)).toBeInTheDocument();
  });

  it('renders generic error correctly', () => {
    const error = new CalendarError('Unknown error', 'UNKNOWN_ERROR');
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Calendar Error')).toBeInTheDocument();
    expect(screen.getByText('Unknown error')).toBeInTheDocument();
    expect(screen.getByText(/try refreshing the page/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    const error = new CalendarError('Network error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows retrying state when retrying is true', () => {
    const error = new CalendarError('Network error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} onRetry={vi.fn()} retrying={true} />);

    expect(screen.getByRole('button', { name: /retrying/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} className="custom-class" />);

    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('shows debug information in development for unknown errors', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const originalError = new Error('Original error message');
    const error = new CalendarError('Wrapper error', 'UNKNOWN_ERROR', originalError);
    
    render(<ErrorState error={error} />);

    expect(screen.getByText('Technical Details (Development)')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });
});

describe('CalendarErrorState', () => {
  it('renders with calendar-specific styling', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<CalendarErrorState error={error} />);

    expect(document.querySelector('.cal7-calendar-error-container')).toBeInTheDocument();
    expect(document.querySelector('.cal7-calendar-error-wrapper')).toBeInTheDocument();
  });

  it('passes through all props to ErrorState', () => {
    const onRetry = vi.fn();
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<CalendarErrorState error={error} onRetry={onRetry} retrying={true} />);

    expect(screen.getByRole('button', { name: /retrying/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('InlineErrorMessage', () => {
  it('renders compact error message', () => {
    const error = new CalendarError('Inline error message', 'NETWORK_ERROR');
    
    render(<InlineErrorMessage error={error} />);

    expect(screen.getByText('Inline error message')).toBeInTheDocument();
    expect(document.querySelector('.cal7-inline-error')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<InlineErrorMessage error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows retrying state', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<InlineErrorMessage error={error} onRetry={vi.fn()} retrying={true} />);

    expect(screen.getByRole('button', { name: /retrying/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<InlineErrorMessage error={error} className="custom-inline" />);

    expect(document.querySelector('.custom-inline')).toBeInTheDocument();
  });
});

describe('EmptyEventsState', () => {
  it('renders empty state message', () => {
    render(<EmptyEventsState />);

    expect(screen.getByText('No Events This Week')).toBeInTheDocument();
    expect(screen.getByText(/don't have any events scheduled/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyEventsState className="custom-empty" />);

    expect(document.querySelector('.custom-empty')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<EmptyEventsState />);

    expect(document.querySelector('.cal7-empty-state')).toBeInTheDocument();
    expect(document.querySelector('.cal7-empty-state__content')).toBeInTheDocument();
    expect(document.querySelector('.cal7-empty-state__icon')).toBeInTheDocument();
  });
});

describe('ConnectionStatus', () => {
  it('renders online status', () => {
    render(<ConnectionStatus isOnline={true} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(document.querySelector('.cal7-connection-status--online')).toBeInTheDocument();
  });

  it('renders offline status', () => {
    render(<ConnectionStatus isOnline={false} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(document.querySelector('.cal7-connection-status--offline')).toBeInTheDocument();
  });

  it('shows last updated time when online', () => {
    const lastUpdated = new Date('2024-01-01T12:00:00Z');
    
    render(<ConnectionStatus isOnline={true} lastUpdated={lastUpdated} />);

    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('does not show last updated time when offline', () => {
    const lastUpdated = new Date('2024-01-01T12:00:00Z');
    
    render(<ConnectionStatus isOnline={false} lastUpdated={lastUpdated} />);

    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ConnectionStatus isOnline={true} className="custom-status" />);

    expect(document.querySelector('.custom-status')).toBeInTheDocument();
  });

  it('updates time display dynamically', async () => {
    const lastUpdated = new Date(Date.now() - 30000); // 30 seconds ago
    
    render(<ConnectionStatus isOnline={true} lastUpdated={lastUpdated} />);

    // Should show "just now" or similar for recent updates
    await waitFor(() => {
      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });
  });
});

describe('DevelopmentWarning', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('renders warning in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    render(<DevelopmentWarning message="Test warning message" />);

    expect(screen.getByText('Development Warning:')).toBeInTheDocument();
    expect(screen.getByText('Test warning message')).toBeInTheDocument();
  });

  it('does not render in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(<DevelopmentWarning message="Test warning message" />);

    expect(screen.queryByText('Development Warning:')).not.toBeInTheDocument();
    expect(screen.queryByText('Test warning message')).not.toBeInTheDocument();
  });

  it('renders different warning types', () => {
    process.env.NODE_ENV = 'development';
    
    const { rerender } = render(
      <DevelopmentWarning message="Warning message" type="warning" />
    );
    expect(document.querySelector('.cal7-dev-warning--warning')).toBeInTheDocument();

    rerender(<DevelopmentWarning message="Info message" type="info" />);
    expect(document.querySelector('.cal7-dev-warning--info')).toBeInTheDocument();

    rerender(<DevelopmentWarning message="Error message" type="error" />);
    expect(document.querySelector('.cal7-dev-warning--error')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    process.env.NODE_ENV = 'development';
    const onDismiss = vi.fn();
    
    render(<DevelopmentWarning message="Test message" onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss warning/i });
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    process.env.NODE_ENV = 'development';
    
    render(<DevelopmentWarning message="Test message" />);

    expect(screen.queryByRole('button', { name: /dismiss warning/i })).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    process.env.NODE_ENV = 'development';
    
    render(<DevelopmentWarning message="Test message" className="custom-warning" />);

    expect(document.querySelector('.custom-warning')).toBeInTheDocument();
  });
});

describe('Error State Accessibility', () => {
  it('has proper ARIA attributes', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} />);

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    
    // Check for proper button accessibility
    const retryButton = screen.queryByRole('button');
    if (retryButton) {
      expect(retryButton).toHaveAttribute('type', 'button');
    }
  });

  it('provides meaningful text for screen readers', () => {
    const error = new CalendarError('Network connection failed', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} />);

    // Should have descriptive text that explains the error and solution
    expect(screen.getByText(/Unable to connect to the calendar service/)).toBeInTheDocument();
    expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
  });

  it('maintains focus management in retry scenarios', () => {
    const onRetry = vi.fn();
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.focus();
    
    expect(document.activeElement).toBe(retryButton);
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('Error State Responsive Behavior', () => {
  it('applies responsive classes correctly', () => {
    const error = new CalendarError('Test error', 'NETWORK_ERROR');
    
    render(<ErrorState error={error} />);

    expect(document.querySelector('.cal7-error-state')).toBeInTheDocument();
    expect(document.querySelector('.cal7-error-state--network')).toBeInTheDocument();
  });

  it('handles long error messages gracefully', () => {
    const longMessage = 'This is a very long error message that should wrap properly and not break the layout even on smaller screens or when the text is quite lengthy and detailed.';
    const error = new CalendarError(longMessage, 'UNKNOWN_ERROR'); // Use UNKNOWN_ERROR to preserve custom message
    
    render(<ErrorState error={error} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});