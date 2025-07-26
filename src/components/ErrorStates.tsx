"use client";

import React, { useState, useEffect } from "react";
import { CalendarError, CalendarErrorCode } from "../types/utils";

interface ErrorStateProps {
  error: CalendarError;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

interface BaseErrorStateProps {
  type: CalendarErrorCode;
  title: string;
  message: string;
  help?: React.ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

/**
 * Base Error State Component
 * 
 * Provides a consistent error display with icon, title, message, and optional retry functionality.
 */
function BaseErrorState({ 
  type, 
  title,
  message,
  help,
  onRetry, 
  retrying = false,
  className = "",
}: BaseErrorStateProps) {
  const getErrorIcon = () => {
    switch (type) {
      case "NETWORK_ERROR":
        return (
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
            <path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/>
            <path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/>
            <path d="M21.29 10.1a9.93 9.93 0 0 1 0 3.8"/>
            <path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/>
            <path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/>
            <path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/>
            <path d="M2.71 13.9a9.93 9.93 0 0 1 0-3.8"/>
            <path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
        );
      case "AUTH_ERROR":
      case "PERMISSION_ERROR":
        return (
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
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        );
      case "MISSING_API_KEY":
        return (
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
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        );
      case "INVALID_CALENDAR_ID":
        return (
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="9" y1="16" x2="15" y2="16"/>
            <line x1="12" y1="13" x2="12" y2="19"/>
          </svg>
        );
      case "INVALID_DATA":
        return (
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="21"/>
            <line x1="8" y1="13" x2="16" y2="21"/>
          </svg>
        );
      default:
        return (
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
        );
    }
  };

  const getColorClass = () => {
    switch (type) {
      case "NETWORK_ERROR":
        return "cal7-error-state--network";
      case "AUTH_ERROR":
      case "PERMISSION_ERROR":
        return "cal7-error-state--auth";
      case "MISSING_API_KEY":
        return "cal7-error-state--config";
      case "INVALID_CALENDAR_ID":
      case "INVALID_DATA":
        return "cal7-error-state--data";
      default:
        return "cal7-error-state--generic";
    }
  };

  return (
    <div className={`cal7-error-state ${getColorClass()} ${className}`}>
      <div className="cal7-error-state__content">
        <div className="cal7-error-state__icon">
          {getErrorIcon()}
        </div>
        
        <h3 className="cal7-error-state__title">
          {title}
        </h3>
        
        <p className="cal7-error-state__message">
          {message}
        </p>
        
        {help && (
          <div className="cal7-error-state__help">
            {help}
          </div>
        )}
        
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="cal7-error-state__retry-button"
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
              className={retrying ? "cal7-error-state__retry-icon--spinning" : ""}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {retrying ? "Retrying..." : "Try Again"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Generic Error State Component
 * 
 * Automatically determines the appropriate error display based on the CalendarError type.
 */
export function ErrorState({ 
  error, 
  onRetry, 
  retrying = false,
  className = "",
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (error.code) {
      case "NETWORK_ERROR":
        return {
          title: "Connection Problem",
          message: "Unable to connect to the calendar service. Please check your internet connection and try again.",
          help: (
            <div>
              <p>This error can occur due to:</p>
              <ul>
                <li>Network connectivity issues</li>
                <li>Google Calendar API service outage</li>
                <li>Firewall or proxy blocking the request</li>
              </ul>
            </div>
          ),
        };
        
      case "AUTH_ERROR":
        return {
          title: "Authentication Failed",
          message: "The API key is invalid or has expired. Please check your configuration.",
          help: (
            <div>
              <p>To fix this issue:</p>
              <ol>
                <li>Verify your Google Calendar API key is correct</li>
                <li>Check that the API key hasn't expired</li>
                <li>Ensure the Google Calendar API is enabled in your Google Cloud project</li>
              </ol>
              <a 
                href="https://developers.google.com/calendar/api/quickstart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cal7-error-state__link"
              >
                View Google Calendar API Documentation
              </a>
            </div>
          ),
        };
        
      case "PERMISSION_ERROR":
        return {
          title: "Permission Denied",
          message: "The API key does not have permission to access the calendar.",
          help: (
            <div>
              <p>Please check:</p>
              <ul>
                <li>The API key has the necessary permissions</li>
                <li>The Google Calendar API is enabled in your Google Cloud project</li>
                <li>The calendar is set to public or the API key has access</li>
              </ul>
            </div>
          ),
        };
        
      case "MISSING_API_KEY":
        return {
          title: "API Key Required",
          message: "Google Calendar API key is required to display calendar events.",
          help: (
            <div>
              <p>To fix this issue:</p>
              <ol>
                <li>Get a Google Calendar API key from the Google Cloud Console</li>
                <li>Set the <code>GOOGLE_CALENDAR_API_KEY</code> environment variable</li>
                <li>Restart your application</li>
              </ol>
              <a 
                href="https://developers.google.com/calendar/api/quickstart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cal7-error-state__link"
              >
                View Setup Guide
              </a>
            </div>
          ),
        };
        
      case "INVALID_CALENDAR_ID":
        return {
          title: "Calendar Not Found",
          message: "The specified calendar could not be found or is not accessible.",
          help: (
            <div>
              <p>Please verify:</p>
              <ul>
                <li>The calendar ID is correct</li>
                <li>The calendar exists and is accessible</li>
                <li>The calendar is set to public or your API key has access</li>
              </ul>
            </div>
          ),
        };
        
      case "INVALID_DATA":
        return {
          title: "Data Format Error",
          message: "The calendar data received is in an unexpected format.",
          help: (
            <div>
              <p>This is usually a temporary issue. If it persists:</p>
              <ul>
                <li>Check if the Google Calendar API is experiencing issues</li>
                <li>Verify your API key has the correct permissions</li>
                <li>Contact support if the problem continues</li>
              </ul>
            </div>
          ),
        };
        
      default:
        return {
          title: "Calendar Error",
          message: error.message || "An unexpected error occurred while loading the calendar.",
          help: (
            <div>
              <p>Please try refreshing the page. If the problem persists, contact support.</p>
              {process.env.NODE_ENV === "development" && error.originalError && (
                <details style={{ marginTop: "1rem" }}>
                  <summary>Technical Details (Development)</summary>
                  <pre style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                    {error.originalError.message}
                    {error.originalError.stack && `\n\n${error.originalError.stack}`}
                  </pre>
                </details>
              )}
            </div>
          ),
        };
    }
  };

  const { title, message, help } = getErrorConfig();

  return (
    <BaseErrorState
      type={error.code}
      title={title}
      message={message}
      help={help}
      onRetry={onRetry}
      retrying={retrying}
      className={className}
    />
  );
}

/**
 * Calendar-specific Error State
 * 
 * Provides a full-width error display suitable for the main calendar container.
 */
export function CalendarErrorState({ 
  error, 
  onRetry, 
  retrying = false,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`cal7-calendar-error-container ${className}`}>
      <div className="cal7-calendar-error-wrapper">
        <ErrorState
          error={error}
          onRetry={onRetry}
          retrying={retrying}
          className="cal7-calendar-error-state"
        />
      </div>
    </div>
  );
}

/**
 * Inline Error Message
 * 
 * Compact error display for smaller spaces or inline notifications.
 */
export function InlineErrorMessage({ 
  error,
  onRetry, 
  retrying = false,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`cal7-inline-error ${className}`}>
      <div className="cal7-inline-error__content">
        <div className="cal7-inline-error__icon">
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
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17 .01 0"/>
          </svg>
        </div>
        
        <p className="cal7-inline-error__message">
          {error.message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="cal7-inline-error__retry-button"
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
              className={retrying ? "cal7-inline-error__retry-icon--spinning" : ""}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {retrying ? "Retrying..." : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * 
 * Displays when no events are found (not an error, but a valid empty state).
 */
export function EmptyEventsState({ 
  className = "",
}: { 
  className?: string;
}) {
  return (
    <div className={`cal7-empty-state ${className}`}>
      <div className="cal7-empty-state__content">
        <div className="cal7-empty-state__icon">
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
          </svg>
        </div>
        
        <h3 className="cal7-empty-state__title">
          No Events This Week
        </h3>
        
        <p className="cal7-empty-state__message">
          We don't have any events scheduled for this week. Check back soon for updates on upcoming events.
        </p>
      </div>
    </div>
  );
}

/**
 * Connection Status Indicator
 * 
 * Shows the current connection status and last update time.
 */
export function ConnectionStatus({ 
  isOnline, 
  lastUpdated,
  className = "",
}: { 
  isOnline: boolean;
  lastUpdated?: Date;
  className?: string;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((currentTime.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`cal7-connection-status ${isOnline ? 'cal7-connection-status--online' : 'cal7-connection-status--offline'} ${className}`}>
      <div className="cal7-connection-status__indicator">
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
          {isOnline ? (
            <>
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
              <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </>
          ) : (
            <>
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </>
          )}
        </svg>
      </div>
      
      <span className="cal7-connection-status__text">
        {isOnline ? "Connected" : "Offline"}
      </span>
      
      {lastUpdated && isOnline && (
        <span className="cal7-connection-status__time">
          • Updated {getTimeAgo(lastUpdated)}
        </span>
      )}
    </div>
  );
}

/**
 * Development Warning Component
 * 
 * Shows configuration warnings during development.
 */
export function DevelopmentWarning({ 
  message,
  type = "warning",
  onDismiss,
  className = "",
}: {
  message: string;
  type?: "warning" | "info" | "error";
  onDismiss?: () => void;
  className?: string;
}) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case "info":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="m12 8 .01 0"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17 .01 0"/>
          </svg>
        );
    }
  };

  return (
    <div className={`cal7-dev-warning cal7-dev-warning--${type} ${className}`}>
      <div className="cal7-dev-warning__content">
        <div className="cal7-dev-warning__icon">
          {getIcon()}
        </div>
        
        <p className="cal7-dev-warning__message">
          <strong>Development Warning:</strong> {message}
        </p>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="cal7-dev-warning__dismiss"
            type="button"
            aria-label="Dismiss warning"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}