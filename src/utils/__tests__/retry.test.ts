import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  withRetry, 
  isRetryableError, 
  calculateRetryDelay, 
  sleep,
  CircuitBreaker,
  DEFAULT_RETRY_CONFIG 
} from '../retry';
import { CalendarError } from '../../types/utils';

describe('isRetryableError', () => {
  it('identifies retryable CalendarError codes', () => {
    const networkError = new CalendarError('Network failed', 'NETWORK_ERROR');
    const unknownError = new CalendarError('Unknown issue', 'UNKNOWN_ERROR');
    const authError = new CalendarError('Auth failed', 'AUTH_ERROR');
    
    expect(isRetryableError(networkError, DEFAULT_RETRY_CONFIG)).toBe(true);
    expect(isRetryableError(unknownError, DEFAULT_RETRY_CONFIG)).toBe(true);
    expect(isRetryableError(authError, DEFAULT_RETRY_CONFIG)).toBe(false);
  });

  it('identifies retryable generic errors by message', () => {
    const networkError = new Error('Network connection failed');
    const timeoutError = new Error('Request timeout occurred');
    const fetchError = new Error('fetch failed');
    const authError = new Error('Authentication failed');
    
    expect(isRetryableError(networkError, DEFAULT_RETRY_CONFIG)).toBe(true);
    expect(isRetryableError(timeoutError, DEFAULT_RETRY_CONFIG)).toBe(true);
    expect(isRetryableError(fetchError, DEFAULT_RETRY_CONFIG)).toBe(true);
    expect(isRetryableError(authError, DEFAULT_RETRY_CONFIG)).toBe(false);
  });

  it('respects custom retryable error codes', () => {
    const customConfig = {
      ...DEFAULT_RETRY_CONFIG,
      retryableErrors: ['AUTH_ERROR', 'CUSTOM_ERROR']
    };
    
    const authError = new CalendarError('Auth failed', 'AUTH_ERROR');
    const networkError = new CalendarError('Network failed', 'NETWORK_ERROR');
    
    expect(isRetryableError(authError, customConfig)).toBe(true);
    expect(isRetryableError(networkError, customConfig)).toBe(false);
  });
});

describe('calculateRetryDelay', () => {
  it('calculates exponential backoff correctly', () => {
    const config = {
      ...DEFAULT_RETRY_CONFIG,
      baseDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000
    };
    
    expect(calculateRetryDelay(1, config)).toBe(1000);  // 1000 * 2^0
    expect(calculateRetryDelay(2, config)).toBe(2000);  // 1000 * 2^1
    expect(calculateRetryDelay(3, config)).toBe(4000);  // 1000 * 2^2
    expect(calculateRetryDelay(4, config)).toBe(8000);  // 1000 * 2^3
  });

  it('respects maximum delay limit', () => {
    const config = {
      ...DEFAULT_RETRY_CONFIG,
      baseDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 5000
    };
    
    expect(calculateRetryDelay(5, config)).toBe(5000); // Would be 16000, capped at 5000
    expect(calculateRetryDelay(10, config)).toBe(5000); // Would be much higher, capped at 5000
  });

  it('handles different backoff multipliers', () => {
    const config = {
      ...DEFAULT_RETRY_CONFIG,
      baseDelay: 100,
      backoffMultiplier: 3,
      maxDelay: 10000
    };
    
    expect(calculateRetryDelay(1, config)).toBe(100);   // 100 * 3^0
    expect(calculateRetryDelay(2, config)).toBe(300);   // 100 * 3^1
    expect(calculateRetryDelay(3, config)).toBe(900);   // 100 * 3^2
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after specified delay', async () => {
    const promise = sleep(1000);
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('does not resolve before specified delay', async () => {
    const promise = sleep(1000);
    let resolved = false;
    
    promise.then(() => { resolved = true; });
    
    // Advance time by less than the delay
    vi.advanceTimersByTime(500);
    
    // Allow microtasks to run
    await Promise.resolve();
    
    expect(resolved).toBe(false);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('succeeds on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new CalendarError('Network failed', 'NETWORK_ERROR'))
      .mockRejectedValueOnce(new CalendarError('Network failed', 'NETWORK_ERROR'))
      .mockResolvedValue('success');
    
    const promise = withRetry(operation);
    
    // Fast-forward through retry delays
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  }, 10000);

  it('fails after max attempts', async () => {
    const error = new CalendarError('Network failed', 'NETWORK_ERROR');
    const operation = vi.fn().mockRejectedValue(error);
    
    const promise = withRetry(operation, { maxAttempts: 2 });
    
    // Fast-forward through retry delays and properly handle the rejection
    const [result] = await Promise.allSettled([
      promise,
      vi.runAllTimersAsync()
    ]);
    
    expect(result.status).toBe('rejected');
    if (result.status === 'rejected') {
      expect(result.reason.message).toBe('Network failed');
    }
    expect(operation).toHaveBeenCalledTimes(2);
  }, 10000);

  it('does not retry non-retryable errors', async () => {
    const error = new CalendarError('Auth failed', 'AUTH_ERROR');
    const operation = vi.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow('Auth failed');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('uses custom retry configuration', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new CalendarError('Network failed', 'NETWORK_ERROR'))
      .mockResolvedValue('success');
    
    const config = {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 1.5,
      retryableErrors: ['NETWORK_ERROR']
    };
    
    const promise = withRetry(operation, config);
    
    // Fast-forward through retry delays
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  }, 10000);

  it('handles non-Error rejections', async () => {
    const operation = vi.fn().mockRejectedValue('string error');
    
    const promise = withRetry(operation);
    
    vi.runAllTimers();
    
    await expect(promise).rejects.toThrow('string error');
  });
});

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(2, 1000, 5000); // 2 failures, 1s recovery, 5s monitoring
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows operations when circuit is closed', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await circuitBreaker.execute(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(circuitBreaker.getState().state).toBe('CLOSED');
  });

  it('opens circuit after failure threshold', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    // First failure
    await expect(circuitBreaker.execute(operation)).rejects.toThrow('Operation failed');
    expect(circuitBreaker.getState().state).toBe('CLOSED');
    
    // Second failure - should open circuit
    await expect(circuitBreaker.execute(operation)).rejects.toThrow('Operation failed');
    expect(circuitBreaker.getState().state).toBe('OPEN');
    
    // Third attempt should be rejected immediately
    await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker is OPEN');
    expect(operation).toHaveBeenCalledTimes(2); // Not called on third attempt
  });

  it('transitions to half-open after recovery timeout', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    // Trigger circuit opening
    await expect(circuitBreaker.execute(operation)).rejects.toThrow();
    await expect(circuitBreaker.execute(operation)).rejects.toThrow();
    expect(circuitBreaker.getState().state).toBe('OPEN');
    
    // Fast-forward past recovery timeout
    vi.advanceTimersByTime(1500);
    
    // Next operation should be attempted (half-open state)
    const successOperation = vi.fn().mockResolvedValue('success');
    const result = await circuitBreaker.execute(successOperation);
    
    expect(result).toBe('success');
    expect(circuitBreaker.getState().state).toBe('CLOSED');
  });

  it('resets failure count on successful operation', async () => {
    const failingOperation = vi.fn().mockRejectedValue(new Error('Failed'));
    const successOperation = vi.fn().mockResolvedValue('success');
    
    // One failure
    await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
    expect(circuitBreaker.getState().failureCount).toBe(1);
    
    // Success should reset count
    await circuitBreaker.execute(successOperation);
    expect(circuitBreaker.getState().failureCount).toBe(0);
    expect(circuitBreaker.getState().state).toBe('CLOSED');
  });

  it('can be manually reset', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Failed'));
    
    // Open the circuit
    await expect(circuitBreaker.execute(operation)).rejects.toThrow();
    await expect(circuitBreaker.execute(operation)).rejects.toThrow();
    expect(circuitBreaker.getState().state).toBe('OPEN');
    
    // Manual reset
    circuitBreaker.reset();
    expect(circuitBreaker.getState().state).toBe('CLOSED');
    expect(circuitBreaker.getState().failureCount).toBe(0);
    expect(circuitBreaker.getState().lastFailureTime).toBeNull();
  });

  it('provides accurate state information', () => {
    const state = circuitBreaker.getState();
    
    expect(state).toHaveProperty('state');
    expect(state).toHaveProperty('failureCount');
    expect(state).toHaveProperty('lastFailureTime');
    expect(state.state).toBe('CLOSED');
    expect(state.failureCount).toBe(0);
    expect(state.lastFailureTime).toBeNull();
  });

  it('handles custom thresholds and timeouts', async () => {
    const customCircuitBreaker = new CircuitBreaker(1, 500, 2000); // 1 failure, 0.5s recovery
    const operation = vi.fn().mockRejectedValue(new Error('Failed'));
    
    // Should open after just 1 failure
    await expect(customCircuitBreaker.execute(operation)).rejects.toThrow();
    expect(customCircuitBreaker.getState().state).toBe('OPEN');
    
    // Should allow retry after shorter timeout
    vi.advanceTimersByTime(600);
    
    const successOperation = vi.fn().mockResolvedValue('success');
    const result = await customCircuitBreaker.execute(successOperation);
    
    expect(result).toBe('success');
    expect(customCircuitBreaker.getState().state).toBe('CLOSED');
  });
});

describe('Retry Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('combines retry logic with circuit breaker', async () => {
    const circuitBreaker = new CircuitBreaker(3, 1000); // Allow 3 failures before opening
    let attemptCount = 0;
    
    const operation = () => {
      attemptCount++;
      // Always fail to ensure circuit breaker opens
      return Promise.reject(new CalendarError('Network failed', 'NETWORK_ERROR'));
    };
    
    const retryWithCircuitBreaker = () => circuitBreaker.execute(operation);
    
    const promise = withRetry(retryWithCircuitBreaker, { maxAttempts: 2 }); // Fewer retries than circuit breaker threshold
    
    // Properly handle the rejection with Promise.allSettled
    const [result] = await Promise.allSettled([
      promise,
      vi.runAllTimersAsync()
    ]);
    
    // Should fail after 2 retry attempts, before circuit breaker opens
    expect(result.status).toBe('rejected');
    expect(attemptCount).toBe(2); // Should make 2 attempts before retry logic gives up
  }, 10000);

  it('handles mixed error types correctly', async () => {
    let attemptCount = 0;
    
    const operation = () => {
      attemptCount++;
      switch (attemptCount) {
        case 1:
          return Promise.reject(new CalendarError('Network failed', 'NETWORK_ERROR')); // Retryable
        case 2:
          return Promise.reject(new CalendarError('Auth failed', 'AUTH_ERROR')); // Not retryable
        default:
          return Promise.resolve('success');
      }
    };
    
    const promise = withRetry(operation);
    
    // Properly handle the rejection with Promise.allSettled
    const [result] = await Promise.allSettled([
      promise,
      vi.runAllTimersAsync()
    ]);
    
    // Should fail on auth error without further retries
    expect(result.status).toBe('rejected');
    if (result.status === 'rejected') {
      expect(result.reason.message).toBe('Auth failed');
    }
    expect(attemptCount).toBe(2);
  }, 10000);

  it('respects timeout constraints', async () => {
    const startTime = Date.now();
    let attemptCount = 0;
    
    const operation = () => {
      attemptCount++;
      return Promise.reject(new CalendarError('Network failed', 'NETWORK_ERROR'));
    };
    
    const promise = withRetry(operation, {
      maxAttempts: 10,
      baseDelay: 1000,
      maxDelay: 2000
    });
    
    // Properly handle the rejection with Promise.allSettled
    const [result] = await Promise.allSettled([
      promise,
      vi.runAllTimersAsync()
    ]);
    
    expect(result.status).toBe('rejected');
    if (result.status === 'rejected') {
      expect(result.reason.message).toBe('Network failed');
    }
    
    // Should have made multiple attempts with delays
    expect(attemptCount).toBe(10);
  }, 10000);
});