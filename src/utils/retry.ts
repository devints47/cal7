import { CalendarError } from '../types/utils';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: string[]; // Error codes that should trigger retry
}

export interface RetryState {
  attempt: number;
  lastError: Error | null;
  isRetrying: boolean;
  nextRetryAt: Date | null;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'UNKNOWN_ERROR',
  ],
};

/**
 * Determines if an error should trigger a retry attempt
 */
export function isRetryableError(error: Error, config: RetryConfig): boolean {
  if (error instanceof CalendarError) {
    return config.retryableErrors.includes(error.code);
  }
  
  // Network errors and timeouts are generally retryable
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('connection')
  );
}

/**
 * Calculates the delay before the next retry attempt using exponential backoff
 */
export function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleeps for the specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper function that implements exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === finalConfig.maxAttempts || !isRetryableError(lastError, finalConfig)) {
        throw lastError;
      }
      
      // Calculate delay and wait before next attempt
      const delay = calculateRetryDelay(attempt, finalConfig);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * React hook for managing retry state
 */
export function useRetryState(config: Partial<RetryConfig> = {}) {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  const [state, setState] = React.useState<RetryState>({
    attempt: 0,
    lastError: null,
    isRetrying: false,
    nextRetryAt: null,
  });

  const retry = React.useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempt: prev.attempt + 1,
    }));

    try {
      const result = await withRetry(operation, finalConfig);
      
      // Reset state on success
      setState({
        attempt: 0,
        lastError: null,
        isRetrying: false,
        nextRetryAt: null,
      });
      
      return result;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        lastError: finalError,
        isRetrying: false,
        nextRetryAt: prev.attempt < finalConfig.maxAttempts 
          ? new Date(Date.now() + calculateRetryDelay(prev.attempt, finalConfig))
          : null,
      }));
      
      throw finalError;
    }
  }, [finalConfig]);

  const reset = React.useCallback(() => {
    setState({
      attempt: 0,
      lastError: null,
      isRetrying: false,
      nextRetryAt: null,
    });
  }, []);

  const canRetry = state.attempt < finalConfig.maxAttempts && 
    state.lastError && 
    isRetryableError(state.lastError, finalConfig);

  return {
    ...state,
    retry,
    reset,
    canRetry,
    maxAttempts: finalConfig.maxAttempts,
  };
}

/**
 * Automatic retry hook that retries failed operations after a delay
 */
export function useAutoRetry<T>(
  operation: () => Promise<T>,
  dependencies: React.DependencyList,
  config: Partial<RetryConfig> = {}
) {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(false);
  const retryTimeoutRef = React.useRef<NodeJS.Timeout>();

  const executeOperation = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(operation, finalConfig);
      setData(result);
    } catch (err) {
      const finalError = err instanceof Error ? err : new Error(String(err));
      setError(finalError);
      
      // Schedule automatic retry if error is retryable
      if (isRetryableError(finalError, finalConfig)) {
        const delay = calculateRetryDelay(1, finalConfig);
        retryTimeoutRef.current = setTimeout(() => {
          executeOperation();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [operation, finalConfig]);

  React.useEffect(() => {
    executeOperation();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [executeOperation]);

  const manualRetry = React.useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    executeOperation();
  }, [executeOperation]);

  return {
    data,
    error,
    loading,
    retry: manualRetry,
  };
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private monitoringPeriod: number = 300000 // 5 minutes
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CalendarError(
          'Circuit breaker is OPEN. Service is temporarily unavailable.',
          'UNKNOWN_ERROR' // Make circuit breaker errors non-retryable
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime.getTime() > this.recoveryTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: Date | null } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }
}

// Import React for hooks
import React from 'react';